import { command, option, optional, run, string } from "cmd-ts";
import { spawn } from "child_process";
import { resolve } from "path";
import { readFileSync } from "fs";
import { Maybe } from "$/utils/ts-utils";
import { JSONContent } from "$/domain/entities/JSONContent";
import { compare as diff } from "fast-json-patch";

function main() {
    const cmd = command({
        name: "compare-metadata",
        description: "Compare two metadata JSON files",
        args: {
            file1: option({
                type: optional(string),
                long: "sorted-metadata",
                short: "s",
                description: "Path to the first metadata JSON file",
                defaultValue: () => undefined,
            }),
            file2: option({
                type: optional(string),
                long: "unsorted-metadata",
                short: "u",
                description: "Path to the second metadata JSON file",
                defaultValue: () => undefined,
            }),
        },
        handler: async ({ file1, file2 }) => {
            console.debug("Comparing metadata files...");

            const json1 = parseMetadataFromFile(file1);
            const json2 = parseMetadataFromFile(file2);

            if (JSONContent.isValidJSON(json1) && JSONContent.isValidJSON(json2)) {
                const jsonDifference = diff(json1, json2);

                if (jsonDifference.length === 0) {
                    console.debug("The two JSON files are identical. No comparison needed.");
                    return;
                } else {
                    startMetadataComparator(json1, json2);
                }
            } else {
                startMetadataComparator(json1, json2);
            }
        },
    });

    run(cmd, process.argv.slice(2));
}

main();

function startMetadataComparator(json1: Maybe<JSONContent>, json2: Maybe<JSONContent>): void {
    console.debug("Differences found. Opening comparator...");
    const env = { ...process.env };

    if (json1) {
        env.VITE_METADATA_JSON_1 = JSON.stringify(json1);
    }

    if (json2) {
        env.VITE_METADATA_JSON_2 = JSON.stringify(json2);
    }

    const comparator = spawn("yarn", ["start-comparator"], {
        stdio: "inherit",
        env,
    });

    comparator.on("close", code => {
        console.debug("Comparison completed.");
        process.exit(code ?? 0);
    });
}

function parseMetadataFromFile(filePath: Maybe<string>): Maybe<JSONContent> {
    if (!filePath) return undefined;
    const file = resolve(filePath);
    const jsonContent = readFileSync(file, "utf-8");

    return JSON.parse(jsonContent);
}
