import { JSONContent, JSONValue } from "$/domain/entities/JSONContent";
import { Maybe } from "$/utils/ts-utils";
import { compare as diff, applyPatch, type Operation } from "fast-json-patch";

export type OpType = Operation["op"];
export type Choice = "sorted" | "unsorted";
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
    const clone = (x: JSONContent) => JSON.parse(JSON.stringify(x)) as JSONContent;

    return applyPatch(clone(base), ordered, false).newDocument as JSONContent;
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
    const { jsonValue: val, path, depth, isLast, unit } = props;
    const indent = unit.repeat(depth);
    const mk = (t: string, p: string = path): Line => ({ text: t, path: p });

    switch (true) {
        case JSONContent.isPrimitive(val):
            return [mk(indent + JSON.stringify(val) + (isLast ? "" : ","))];
        case JSONContent.isArray(val): {
            return [
                mk(indent + "["),
                ...val
                    .map((el, i) =>
                        renderValue({
                            jsonValue: el,
                            path: path + "/" + String(i),
                            depth: depth + 1,
                            isLast: i === val.length - 1,
                            unit: unit,
                        })
                    )
                    .reduce<Line[]>((a, b) => a.concat(b), []),
                mk(indent + "]" + (isLast ? "" : ",")),
            ];
        }
        case JSONContent.isObject(val): {
            const keys = Object.keys(val);
            const open: Line = { text: indent + "{", path };
            const keyIndent = unit.repeat(depth + 1);

            const inner = keys
                .map((k, idx) => {
                    const lastProp = idx === keys.length - 1;
                    const keyPath = path + "/" + encodePtr(k);
                    const pre = indent + " " + JSON.stringify(k) + ": ";
                    const v = val[k];

                    return JSONContent.isPrimitive(v)
                        ? [mk(pre + JSON.stringify(v) + (lastProp ? "" : ","), keyPath)]
                        : JSONContent.isArray(v)
                        ? [
                              mk(pre + "[", keyPath),
                              ...v
                                  .map((el, i) =>
                                      renderValue({
                                          jsonValue: el,
                                          path: keyPath + "/" + String(i),
                                          depth: depth + 2,
                                          isLast: i === v.length - 1,
                                          unit: unit,
                                      })
                                  )
                                  .reduce<Line[]>((a, b) => a.concat(b), []),
                              mk(keyIndent + "]" + (lastProp ? "" : ","), keyPath),
                          ]
                        : [
                              mk(pre + "{", keyPath),
                              ...Object.keys(v as JSONContent)
                                  .map((kk, j) => {
                                      const lastInner = j === Object.keys(v as object).length - 1;
                                      const innerPath = keyPath + "/" + encodePtr(kk);
                                      const innerIndent = unit.repeat(depth + 2);
                                      const innerPre = innerIndent + JSON.stringify(kk) + ": ";
                                      const vv = (v as JSONContent)[kk];

                                      return JSONContent.isPrimitive(vv)
                                          ? [
                                                mk(
                                                    innerPre +
                                                        JSON.stringify(vv) +
                                                        (lastInner ? "" : ","),
                                                    innerPath
                                                ),
                                            ]
                                          : vv !== undefined
                                          ? renderValue({
                                                jsonValue: vv,
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
        default:
            return [{ text: indent + JSON.stringify(val) + (isLast ? "" : ","), path }];
    }
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
