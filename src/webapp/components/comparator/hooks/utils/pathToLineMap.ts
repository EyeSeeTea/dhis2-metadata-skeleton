import { Maybe } from "$/utils/ts-utils";

type LineRange = { startLine: number; endLine: number };

/**
 * Build a mapping from diff paths to 1-based line ranges in pretty-printed JSON text.
 *
 * The text MUST be the output of `JSON.stringify(obj, null, 2)`.
 *
 * Path format (matching jsonUtils.ts conventions):
 *   - Object keys: `key1.key2.key3`
 *   - Array items with id field: `key[id:value].subkey`
 *   - Array items without id: `key[0].subkey`
 */
export function buildPathToLineMap(
    mergedText: string,
    diffPaths: string[]
): Record<string, LineRange> {
    if (mergedText === "" || diffPaths.length === 0) return {};

    const allPathRanges = buildFullPathMap(mergedText);

    return diffPaths.reduce<Record<string, LineRange>>((result, diffPath) => {
        const range = resolvePathRange(diffPath, allPathRanges);
        if (range) {
            result[diffPath] = range;
        }
        return result;
    }, {});
}

type StackFrame = Readonly<{
    path: string;
    indent: number;
    startLine: number;
    containerType: "object" | "array" | "array-element";
    arrayIndex: Maybe<number>;
    parentArrayPath?: string;
    parentArrayIndex?: number;
}>;

type ParserState = {
    readonly stack: readonly StackFrame[];
    readonly pathMap: Map<string, LineRange>;
};

/**
 * Walk every line of the pretty-printed JSON and build a map of every
 * reachable path to its 1-based line range.
 */
function buildFullPathMap(text: string): Map<string, LineRange> {
    const lines = text.split("\n");

    const finalState = lines.reduce<ParserState>(
        (state, line, i) => {
            if (line === undefined) return state;

            const lineNumber = i + 1; // 1-based
            const indent = getIndentation(line);
            const trimmed = line.trimStart();

            if (trimmed === "") return state;

            // Closing brackets/braces
            if (trimmed.startsWith("}") || trimmed.startsWith("]")) {
                return popFramesForClosing(state, indent, lineNumber);
            }

            // Pop frames whose indent >= current line's indent (sibling/parent)
            const poppedState = popFramesForSibling(state, indent, lineNumber);

            const parentFrame =
                poppedState.stack.length > 0
                    ? poppedState.stack[poppedState.stack.length - 1]
                    : undefined;

            // Detect key-value pairs: `"key": value`
            const keyMatch = trimmed.match(/^"([^"]+)"\s*:\s*(.*)/);

            if (keyMatch) {
                return processKeyValue(
                    poppedState,
                    keyMatch[1] as string,
                    keyMatch[2] as string,
                    parentFrame,
                    indent,
                    lineNumber
                );
            }

            if (parentFrame && isArrayContainer(parentFrame)) {
                return processArrayElement(poppedState, parentFrame, trimmed, indent, lineNumber);
            }

            if (!parentFrame) {
                return processTopLevel(poppedState, trimmed, lineNumber);
            }

            return poppedState;
        },
        { stack: [], pathMap: new Map() }
    );

    // Finalize remaining stack frames
    return finalizeRemainingFrames(finalState, lines.length);
}

function popFramesForClosing(state: ParserState, indent: number, lineNumber: number): ParserState {
    let { stack, pathMap } = state;

    while (stack.length > 0) {
        const top = stack[stack.length - 1];
        if (!top || indent > top.indent) break;
        pathMap = setPathRange(pathMap, top, lineNumber);
        stack = stack.slice(0, -1);
    }

    return { stack, pathMap };
}

function popFramesForSibling(state: ParserState, indent: number, lineNumber: number): ParserState {
    let { stack, pathMap } = state;

    while (stack.length > 0) {
        const top = stack[stack.length - 1];
        if (!top || indent > top.indent) break;
        pathMap = setPathRange(pathMap, top, lineNumber - 1);
        stack = stack.slice(0, -1);
    }

    return { stack, pathMap };
}

function processKeyValue(
    state: ParserState,
    key: string,
    valueStart: string,
    parentFrame: Maybe<StackFrame>,
    indent: number,
    lineNumber: number
): ParserState {
    const path = buildPath(parentFrame, key);
    let { stack, pathMap } = state;

    // Check if this is the "id" field inside an array element
    if (parentFrame && parentFrame.containerType === "array-element") {
        const idValueMatch = valueStart.match(/^"([^"]*)"[,]?\s*$/);
        if (key === "id" && idValueMatch) {
            const idValue = idValueMatch[1] as string;
            const updated = updateArrayElementId(stack, parentFrame, idValue, pathMap);
            stack = updated.stack;
            pathMap = updated.pathMap;
        }
    }

    if (valueStart === "{" || valueStart === "[") {
        const containerType = valueStart === "[" ? "array" : "object";
        const newFrame: StackFrame = {
            path,
            indent,
            startLine: lineNumber,
            containerType,
            arrayIndex: containerType === "array" ? -1 : undefined,
        };
        return { stack: [...stack, newFrame], pathMap };
    }

    // Single-line value
    pathMap = new Map(pathMap);
    pathMap.set(path, { startLine: lineNumber, endLine: lineNumber });
    return { stack, pathMap };
}

function processArrayElement(
    state: ParserState,
    parentFrame: StackFrame,
    trimmed: string,
    indent: number,
    lineNumber: number
): ParserState {
    const arrayIndex = nextArrayIndex(parentFrame);
    // Replace parent frame with updated arrayIndex
    const updatedParent: StackFrame = { ...parentFrame, arrayIndex };
    const stack = [...state.stack.slice(0, -1), updatedParent];
    const pathMap = state.pathMap;

    if (trimmed === "{") {
        const placeholderPath = buildArrayElementPath(updatedParent.path, arrayIndex);
        const newFrame: StackFrame = {
            path: placeholderPath,
            indent,
            startLine: lineNumber,
            containerType: "array-element",
            arrayIndex: undefined,
            parentArrayPath: updatedParent.path,
            parentArrayIndex: arrayIndex,
        };
        return { stack: [...stack, newFrame], pathMap };
    }

    if (trimmed === "[") {
        const elementPath = buildArrayElementPath(updatedParent.path, arrayIndex);
        const newFrame: StackFrame = {
            path: elementPath,
            indent,
            startLine: lineNumber,
            containerType: "array",
            arrayIndex: -1,
        };
        return { stack: [...stack, newFrame], pathMap };
    }

    // Primitive element inside an array
    const elementPath = buildArrayElementPath(updatedParent.path, arrayIndex);
    const newPathMap = new Map(pathMap);
    newPathMap.set(elementPath, { startLine: lineNumber, endLine: lineNumber });
    return { stack, pathMap: newPathMap };
}

function processTopLevel(state: ParserState, trimmed: string, lineNumber: number): ParserState {
    if (trimmed === "{") {
        const newFrame: StackFrame = {
            path: "",
            indent: 0,
            startLine: lineNumber,
            containerType: "object",
            arrayIndex: undefined,
        };
        return { stack: [...state.stack, newFrame], pathMap: state.pathMap };
    }

    if (trimmed === "[") {
        const newFrame: StackFrame = {
            path: "",
            indent: 0,
            startLine: lineNumber,
            containerType: "array",
            arrayIndex: -1,
        };
        return { stack: [...state.stack, newFrame], pathMap: state.pathMap };
    }

    return state;
}

function finalizeRemainingFrames(state: ParserState, lastLine: number): Map<string, LineRange> {
    return state.stack.reduceRight<Map<string, LineRange>>(
        (pathMap, frame) => setPathRange(pathMap, frame, lastLine),
        state.pathMap
    );
}

function getIndentation(line: string): number {
    const match = line.match(/^(\s*)/);
    return match ? (match[1] as string).length : 0;
}

function isArrayContainer(frame: StackFrame): boolean {
    return frame.containerType === "array";
}

function nextArrayIndex(frame: StackFrame): number {
    return (frame.arrayIndex ?? -1) + 1;
}

function buildPath(parentFrame: Maybe<StackFrame>, key: string): string {
    if (!parentFrame || parentFrame.path === "") {
        return key;
    }
    return `${parentFrame.path}.${key}`;
}

function buildArrayElementPath(arrayPath: string, index: number): string {
    return `${arrayPath}[${index}]`;
}

/**
 * When a frame is finalized, record (or update) its line range in the path map.
 * Returns a new Map with the updated entry.
 */
function setPathRange(
    pathMap: Map<string, LineRange>,
    frame: StackFrame,
    endLine: number
): Map<string, LineRange> {
    if (frame.path === "") return pathMap;

    const existing = pathMap.get(frame.path);
    const newMap = new Map(pathMap);

    if (existing) {
        newMap.set(frame.path, {
            startLine: existing.startLine,
            endLine: Math.max(existing.endLine, endLine),
        });
    } else {
        newMap.set(frame.path, { startLine: frame.startLine, endLine });
    }

    return newMap;
}

/**
 * When we discover an "id" field inside an array element, update the path
 * of that element's stack frame and migrate any already-recorded child paths
 * from index-based to id-based notation. Returns new stack and pathMap.
 */
function updateArrayElementId(
    stack: readonly StackFrame[],
    elementFrame: StackFrame,
    idValue: string,
    pathMap: Map<string, LineRange>
): { stack: readonly StackFrame[]; pathMap: Map<string, LineRange> } {
    const parentArrayPath = elementFrame.parentArrayPath;
    const oldIndex = elementFrame.parentArrayIndex;

    if (parentArrayPath === undefined || oldIndex === undefined) {
        return { stack, pathMap };
    }

    const oldPrefix = `${parentArrayPath}[${oldIndex}]`;
    const newPrefix = `${parentArrayPath}[id:${idValue}]`;

    if (elementFrame.path !== oldPrefix) {
        return { stack, pathMap };
    }

    // Rename existing path entries that were recorded with the old index prefix
    const newPathMap = new Map<string, LineRange>();
    pathMap.forEach((range, existingPath) => {
        if (existingPath === oldPrefix || existingPath.startsWith(oldPrefix + ".")) {
            const newPath = newPrefix + existingPath.slice(oldPrefix.length);
            newPathMap.set(newPath, range);
        } else {
            newPathMap.set(existingPath, range);
        }
    });

    // Update all stack frames: rename the element frame and any child frames
    const newStack = stack.map(frame => {
        if (frame === elementFrame) {
            return { ...frame, path: newPrefix };
        }
        if (frame.path.startsWith(oldPrefix)) {
            return { ...frame, path: newPrefix + frame.path.slice(oldPrefix.length) };
        }
        return frame;
    });

    return { stack: newStack, pathMap: newPathMap };
}

/**
 * Given a diff path, resolve it to a line range. If exact match is not found,
 * walk up the path to find the nearest parent.
 */
function resolvePathRange(
    diffPath: string,
    allPathRanges: Map<string, LineRange>
): Maybe<LineRange> {
    const exact = allPathRanges.get(diffPath);
    if (exact) return exact;

    const matchingParent = getParentPaths(diffPath).find(p => allPathRanges.has(p));
    return matchingParent ? allPathRanges.get(matchingParent) : undefined;
}

/**
 * Generate parent paths from most specific to least specific.
 * Examples:
 *   "a.b.c" -> ["a.b", "a"]
 *   "a[id:x].b" -> ["a[id:x]", "a"]
 *   "a[0].b.c" -> ["a[0].b", "a[0]", "a"]
 */
function getParentPaths(path: string): string[] {
    const lastDot = path.lastIndexOf(".");
    const lastBracket = path.lastIndexOf("[");

    if (lastDot === -1 && lastBracket === -1) return [];

    const parent = path.slice(0, Math.max(lastDot, lastBracket));
    return parent.length > 0 ? [parent, ...getParentPaths(parent)] : [];
}
