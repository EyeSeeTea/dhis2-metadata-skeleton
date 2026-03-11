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

/**
 * Walk every line of the pretty-printed JSON and build a map of every
 * reachable path to its 1-based line range.
 */
function buildFullPathMap(text: string): Map<string, LineRange> {
    const lines = text.split("\n");
    const pathMap = new Map<string, LineRange>();

    const stack: StackFrame[] = [];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line === undefined) continue;

        const lineNumber = i + 1; // 1-based
        const indent = getIndentation(line);
        const trimmed = line.trimStart();

        // Skip empty lines
        if (trimmed === "") continue;

        // Closing brackets/braces finalize the frame they belong to,
        // including this line in the range.
        if (trimmed.startsWith("}") || trimmed.startsWith("]")) {
            // Pop the frame whose indent matches this closing bracket.
            // In JSON.stringify indent-2 output, the closing bracket has the
            // same indent as the opening line of the structure it closes.
            while (stack.length > 0) {
                const top = stack[stack.length - 1];
                if (!top) break;
                if (indent <= top.indent) {
                    finalizeFrame(top, lineNumber, pathMap);
                    stack.pop();
                } else {
                    break;
                }
            }
            continue;
        }

        // Pop stack frames whose indent is >= the current line's indent,
        // meaning we've moved past those scopes into a sibling or parent.
        while (stack.length > 0) {
            const top = stack[stack.length - 1];
            if (!top) break;
            if (indent <= top.indent) {
                finalizeFrame(top, lineNumber - 1, pathMap);
                stack.pop();
            } else {
                break;
            }
        }

        const parentFrame = stack.length > 0 ? stack[stack.length - 1] : undefined;

        // Detect key-value pairs: `"key": value`
        const keyMatch = trimmed.match(/^"([^"]+)"\s*:\s*(.*)/);

        if (keyMatch) {
            const key = keyMatch[1] as string;
            const valueStart = keyMatch[2] as string;
            const path = buildPath(parentFrame, key);

            // Check if this is the "id" field inside an array element
            if (parentFrame && parentFrame.containerType === "array-element") {
                const idValueMatch = valueStart.match(/^"([^"]*)"[,]?\s*$/);
                if (key === "id" && idValueMatch) {
                    const idValue = idValueMatch[1] as string;
                    updateArrayElementId(stack, parentFrame, idValue, pathMap);
                }
            }

            if (valueStart === "{" || valueStart === "[") {
                // Multi-line object or array value
                const containerType = valueStart === "[" ? "array" : "object";
                stack.push({
                    path,
                    indent,
                    startLine: lineNumber,
                    containerType,
                    arrayIndex: containerType === "array" ? -1 : undefined,
                });
            } else {
                // Single-line value (primitive, or inline object/array)
                pathMap.set(path, { startLine: lineNumber, endLine: lineNumber });
            }
        } else if (parentFrame && isArrayContainer(parentFrame)) {
            // Array element (no key, just a value inside an array)
            const arrayIndex = incrementArrayIndex(parentFrame);

            if (trimmed === "{") {
                // Object element inside an array
                const placeholderPath = buildArrayElementPath(parentFrame.path, arrayIndex);
                stack.push({
                    path: placeholderPath,
                    indent,
                    startLine: lineNumber,
                    containerType: "array-element",
                    arrayIndex: undefined,
                    parentArrayPath: parentFrame.path,
                    parentArrayIndex: arrayIndex,
                });
            } else if (trimmed === "[") {
                // Nested array element inside an array
                const elementPath = buildArrayElementPath(parentFrame.path, arrayIndex);
                stack.push({
                    path: elementPath,
                    indent,
                    startLine: lineNumber,
                    containerType: "array",
                    arrayIndex: -1,
                });
            } else {
                // Primitive element inside an array
                const elementPath = buildArrayElementPath(parentFrame.path, arrayIndex);
                pathMap.set(elementPath, { startLine: lineNumber, endLine: lineNumber });
            }
        } else if (!parentFrame) {
            // Top-level value
            if (trimmed === "{") {
                stack.push({
                    path: "",
                    indent: 0,
                    startLine: lineNumber,
                    containerType: "object",
                    arrayIndex: undefined,
                });
            } else if (trimmed === "[") {
                stack.push({
                    path: "",
                    indent: 0,
                    startLine: lineNumber,
                    containerType: "array",
                    arrayIndex: -1,
                });
            }
        }
    }

    // Finalize any remaining stack frames
    const lastLine = lines.length;
    while (stack.length > 0) {
        const frame = stack.pop();
        if (frame) {
            finalizeFrame(frame, lastLine, pathMap);
        }
    }

    return pathMap;
}

type StackFrame = {
    path: string;
    indent: number;
    startLine: number;
    containerType: "object" | "array" | "array-element";
    arrayIndex: Maybe<number>;
    parentArrayPath?: string;
    parentArrayIndex?: number;
};

function getIndentation(line: string): number {
    const match = line.match(/^(\s*)/);
    return match ? (match[1] as string).length : 0;
}

function isArrayContainer(frame: StackFrame): boolean {
    return frame.containerType === "array";
}

function incrementArrayIndex(frame: StackFrame): number {
    const next = (frame.arrayIndex ?? -1) + 1;
    frame.arrayIndex = next;
    return next;
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
 * When we discover an "id" field inside an array element, update the path
 * of that element's stack frame and migrate any already-recorded child paths
 * from index-based to id-based notation.
 */
function updateArrayElementId(
    stack: StackFrame[],
    elementFrame: StackFrame,
    idValue: string,
    pathMap: Map<string, LineRange>
): void {
    const parentArrayPath = elementFrame.parentArrayPath;
    const oldIndex = elementFrame.parentArrayIndex;

    if (parentArrayPath === undefined || oldIndex === undefined) return;

    const oldPrefix = `${parentArrayPath}[${oldIndex}]`;
    const newPrefix = `${parentArrayPath}[id:${idValue}]`;

    if (elementFrame.path === oldPrefix) {
        // Rename existing path entries that were recorded with the old index prefix
        const entriesToRename: Array<[string, LineRange]> = [];
        pathMap.forEach((range, existingPath) => {
            if (existingPath === oldPrefix || existingPath.startsWith(oldPrefix + ".")) {
                entriesToRename.push([existingPath, range]);
            }
        });
        entriesToRename.forEach(([oldPath, range]) => {
            pathMap.delete(oldPath);
            const newPath = newPrefix + oldPath.slice(oldPrefix.length);
            pathMap.set(newPath, range);
        });

        elementFrame.path = newPrefix;

        // Also update any child frames on the stack that reference the old prefix
        for (const frame of stack) {
            if (frame !== elementFrame && frame.path.startsWith(oldPrefix)) {
                frame.path = newPrefix + frame.path.slice(oldPrefix.length);
            }
        }
    }
}

/**
 * When a frame is popped off the stack, record (or update) its line range
 * in the path map.
 */
function finalizeFrame(frame: StackFrame, endLine: number, pathMap: Map<string, LineRange>): void {
    // Skip the root-level container (empty path)
    if (frame.path === "") return;

    const existing = pathMap.get(frame.path);
    if (existing) {
        // Update the end line if we have a better (later) value
        existing.endLine = Math.max(existing.endLine, endLine);
    } else {
        pathMap.set(frame.path, { startLine: frame.startLine, endLine });
    }
}

/**
 * Given a diff path, resolve it to a line range. If exact match is not found,
 * walk up the path to find the nearest parent.
 */
function resolvePathRange(
    diffPath: string,
    allPathRanges: Map<string, LineRange>
): Maybe<LineRange> {
    // Try exact match first
    const exact = allPathRanges.get(diffPath);
    if (exact) return exact;

    // Walk up through parent paths
    const parentPaths = getParentPaths(diffPath);
    for (const parent of parentPaths) {
        const parentRange = allPathRanges.get(parent);
        if (parentRange) return parentRange;
    }

    return undefined;
}

/**
 * Generate parent paths from most specific to least specific.
 * Examples:
 *   "a.b.c" -> ["a.b", "a"]
 *   "a[id:x].b" -> ["a[id:x]", "a"]
 *   "a[0].b.c" -> ["a[0].b", "a[0]", "a"]
 */
function getParentPaths(path: string): string[] {
    const parents: string[] = [];
    let current = path;

    while (current.length > 0) {
        // Try removing the last segment
        // Last segment can be: ".key", "[id:value]", or "[index]"
        const lastDot = current.lastIndexOf(".");
        const lastBracket = current.lastIndexOf("[");

        if (lastDot === -1 && lastBracket === -1) break;

        const splitAt = Math.max(lastDot, lastBracket);
        current = current.slice(0, splitAt);

        if (current.length > 0) {
            parents.push(current);
        }
    }

    return parents;
}
