import { JSONContent } from "$/domain/entities/JSONContent";

export class GenerateJSONDifferenceUseCase {
    constructor() {}

    public execute(originalJson: JSONContent, comparisonJson: JSONContent): string[] {
        return this.generateJsonDiff(originalJson, comparisonJson);
    }

    private generateJsonDiff(
        originalJson: JSONContent,
        comparisonJson: JSONContent,
        path: string[] = []
    ): string[] {
        const sortedKeys = Object.keys(originalJson);
        const unsortedKeys = Object.keys(comparisonJson);

        return Array.from(new Set([...sortedKeys, ...unsortedKeys])).flatMap(key => {
            const keyStr = `"${key}"`;
            const indent = "  ";

            const originalValue = originalJson[key];
            const comparisonValue = comparisonJson[key];
            const originalJSONHasKey = key in originalJson;
            const comparisonJSONHasKey = key in comparisonJson;

            if (!originalJSONHasKey && comparisonJSONHasKey) {
                return [`> ${indent}${keyStr}: ${JSON.stringify(comparisonValue)}`];
            }

            if (originalJSONHasKey && !comparisonJSONHasKey) {
                return [`< ${indent}${keyStr}: ${JSON.stringify(originalValue)}`];
            }

            if (isObject(originalValue) && isObject(comparisonValue)) {
                return this.generateJsonDiff(originalValue, comparisonValue, [...path, key]);
            }

            if (originalValue !== comparisonValue) {
                return [
                    `< ${indent}${keyStr}: ${JSON.stringify(originalValue)}`,
                    `---`,
                    `> ${indent}${keyStr}: ${JSON.stringify(comparisonValue)}`,
                ];
            }

            return [];
        });
    }
}

const isObject = (val: unknown): val is JSONContent =>
    typeof val === "object" && val !== null && !Array.isArray(val);
