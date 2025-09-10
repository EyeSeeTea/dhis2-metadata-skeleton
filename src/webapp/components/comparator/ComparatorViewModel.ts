import { JSONContent, JSONValue } from "$/domain/entities/JSONContent";
import { Maybe } from "$/utils/ts-utils";
import { compare as diff, applyPatch, type Operation } from "fast-json-patch";

export type OpType = Operation["op"];
export enum Choice {
    SORTED = "sorted",
    UNSORTED = "unsorted",
}
export type Line = { text: string; path?: string };
export type Row = {
    path: string;
    op: Operation;
    sortedValue: Maybe<JSONContent>;
    unsortedValue: Maybe<JSONContent>;
};

export function applyOps(base: JSONContent, ops: Operation[]): JSONContent {
    const ordered = [...ops].sort(
        (a, b) => pathToArray(a.path).length - pathToArray(b.path).length
    );
    const clone = (x: JSONContent) => structuredClone<JSONContent>(x);

    return applyPatch(clone(base), ordered, false).newDocument;
}

export function buildRows(a: JSONContent, b: JSONContent): Row[] {
    return diff(a, b)
        .map(operation => ({
            path: operation.path,
            op: operation,
            sortedValue: getAt(a, operation.path),
            unsortedValue:
                operation.op === "replace" || operation.op === "add" ? operation.value : undefined,
        }))
        .sort((r1, r2) => r1.path.localeCompare(r2.path));
}

export function prettyPrintJson(json: JSONContent): string {
    try {
        return JSON.stringify(json, null, 2);
    } catch {
        return String(json);
    }
}

export function renderValue(props: JsonRenderProps): Line[] {
    const { jsonValue: jsonValue, path, depth, isLast, unit } = props;
    const indent = unit.repeat(depth);
    const mk = (t: string, p: string = path): Line => ({ text: t, path: p });

    if (JSONContent.isPrimitive(jsonValue)) {
        return [mk(indent + JSON.stringify(jsonValue) + (isLast ? "" : ","))];
    }

    if (JSONContent.isArray(jsonValue)) {
        return [
            mk(indent + "["),
            ...jsonValue
                .map((el, i) =>
                    renderValue({
                        jsonValue: el,
                        path: path + "/" + String(i),
                        depth: depth + 1,
                        isLast: i === jsonValue.length - 1,
                        unit: unit,
                    })
                )
                .reduce<Line[]>((a, b) => a.concat(b), []),
            mk(indent + "]" + (isLast ? "" : ",")),
        ];
    }

    if (JSONContent.isObject(jsonValue)) {
        const keys = Object.keys(jsonValue);
        const open: Line = { text: indent + "{", path };
        const keyIndent = unit.repeat(depth + 1);

        const inner = keys
            .map((k, idx) => {
                const lastProp = idx === keys.length - 1;
                const keyPath = path + "/" + encodePtr(k);
                const pre = indent + " " + JSON.stringify(k) + ": ";
                const jsonValueElement = jsonValue[k];

                if (!jsonValueElement) return [];

                return JSONContent.isPrimitive(jsonValueElement)
                    ? [mk(pre + JSON.stringify(jsonValueElement) + (lastProp ? "" : ","), keyPath)]
                    : JSONContent.isArray(jsonValueElement)
                    ? [
                          mk(pre + "[", keyPath),
                          ...jsonValueElement
                              .map((el, i) =>
                                  renderValue({
                                      jsonValue: el,
                                      path: keyPath + "/" + String(i),
                                      depth: depth + 2,
                                      isLast: i === jsonValueElement.length - 1,
                                      unit: unit,
                                  })
                              )
                              .reduce<Line[]>((a, b) => a.concat(b), []),
                          mk(keyIndent + "]" + (lastProp ? "" : ","), keyPath),
                      ]
                    : [
                          mk(pre + "{", keyPath),
                          ...Object.keys(jsonValueElement)
                              .map((nestedKey, nestedKeyIndex) => {
                                  const lastInner =
                                      nestedKeyIndex === Object.keys(jsonValueElement).length - 1;
                                  const innerPath = keyPath + "/" + encodePtr(nestedKey);
                                  const innerIndent = unit.repeat(depth + 2);
                                  const innerPre = innerIndent + JSON.stringify(nestedKey) + ": ";
                                  const nestedJsonValue = jsonValueElement[nestedKey];

                                  return JSONContent.isPrimitive(nestedJsonValue)
                                      ? [
                                            mk(
                                                innerPre +
                                                    JSON.stringify(nestedJsonValue) +
                                                    (lastInner ? "" : ","),
                                                innerPath
                                            ),
                                        ]
                                      : nestedJsonValue !== undefined
                                      ? renderValue({
                                            jsonValue: nestedJsonValue,
                                            path: innerPath,
                                            depth: depth + 2,
                                            isLast: lastInner,
                                            unit: unit,
                                        })
                                      : [];
                              })
                              .reduce<Line[]>((a, b) => a.concat(b), []),
                          mk(keyIndent + "}" + (lastProp ? "" : ","), keyPath),
                      ];
            })
            .reduce<Line[]>((a, b) => a.concat(b), []);
        const close: Line = { text: indent + "}" + (isLast ? "" : ","), path };

        return [open, ...inner, close];
    }

    return [{ text: indent + JSON.stringify(jsonValue) + (isLast ? "" : ","), path }];
}

type JsonRenderProps = {
    jsonValue: JSONValue;
    path: string;
    depth: number;
    isLast: boolean;
    unit: string;
};

const encodePtr = (s: string) => s.replace(/~/g, "~0").replace(/\//g, "~1");
const pathToArray = (p: string): string[] => p.split("/").slice(1).map(decodeURIComponent);
const getAt = (obj: unknown, jptr: string): Maybe<JSONContent> => {
    return pathToArray(jptr).reduce<unknown>((acc, k) => {
        if (acc !== null && typeof acc === "object" && acc !== undefined) {
            if (Array.isArray(acc)) {
                const idx = Number(k);
                return Number.isInteger(idx) ? acc[idx] : undefined;
            } else {
                return (acc as Record<string, unknown>)[k];
            }
        }
        return undefined;
    }, obj) as Maybe<JSONContent>;
};
