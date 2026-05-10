import { Ref } from "../../entities/Ref";
import _ from "../../entities/generic/Collection";

// Accepts `undefined` because the *CombineAndRemoveDuplicates use cases pass
// `data.<key>` straight from input files, and a given JSON file may legitimately
// omit a top-level key (e.g. a tracker-only capture file has no `dataSets`).
// Before this defensive default, an absent key crashed inside Collection.uniqBy.
export function concatUnique<T extends Ref>(
    objs1: T[] | undefined,
    objs2: T[] | undefined
): T[] {
    return _(objs1 ?? [])
        .concat(_(objs2 ?? []))
        .uniqBy(obj => obj.id)
        .value();
}
