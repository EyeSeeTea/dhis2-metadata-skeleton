import { Ref } from "../../entities/Ref";
import _ from "../../entities/generic/Collection";

export function appendUnique<T extends Ref>(objs1: any[], objs2: any[]): T[] {
    return _(objs1)
        .append(objs2)
        .uniqBy(obj => obj.id)
        .value();
}
