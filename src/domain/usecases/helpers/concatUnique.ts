import { Ref } from "../../entities/Ref";
import _ from "../../entities/generic/Collection";

export function concatUnique<T extends Ref>(objs1: T[], objs2: T[]): T[] {
    return _(objs1)
        .concat(_(objs2))
        .uniqBy(obj => obj.id)
        .value();
}
