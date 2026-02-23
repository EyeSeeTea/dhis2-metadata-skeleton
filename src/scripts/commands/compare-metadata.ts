import { command, option, optional, string, subcommands } from "cmd-ts";
import { spawn } from "child_process";
import { resolve } from "path";
import { readFileSync, mkdirSync, existsSync, writeFileSync, rmSync } from "fs";
import { Maybe } from "$/utils/ts-utils";
import { JSONContent } from "$/domain/entities/JSONContent";
import { parseJson } from "$/utils/jsonParser";

export function getCommand() {
    return subcommands({
        name: "metadata",
        description: "Metadata commands",
        cmds: { metadata: compareMetadata },
    });
}

export const compareMetadata = command({
    name: "compare-metadata",
    description: "Compare two metadata JSON files",
    args: {
        file1: option({
            type: optional(string),
            long: "file1",
            short: "f",
            description: "Path to the first metadata JSON file",
            defaultValue: () => undefined,
        }),
        file2: option({
            type: optional(string),
            long: "file2",
            short: "s",
            description: "Path to the second metadata JSON file",
            defaultValue: () => undefined,
        }),
    },
    handler: async ({ file1, file2 }) => {
        console.debug("Comparing metadata files...");

        const json1 = parseMetadataFromFile(file1);
        const json2 = parseMetadataFromFile(file2);

        if (
            JSONContent.isValidJSON(json1) &&
            JSONContent.isValidJSON(json2) &&
            areJsonsIdentical(json1, json2)
        ) {
            console.debug("The two JSON files are identical. No comparison needed.");
            return;
        } else {
            startMetadataComparator(json1, json2);
        }
    },
});

function startMetadataComparator(json1: Maybe<JSONContent>, json2: Maybe<JSONContent>): void {
    console.debug("Differences found. Preparing comparator input...");

    const tmpDir = resolve(process.cwd(), "public/.tmp");

    cleanupTempDir(tmpDir);
    mkdirSync(tmpDir, { recursive: true });

    if (json1) {
        const file1Path = resolve(tmpDir, "file1.json");
        writeFileSync(file1Path, JSON.stringify(json1));
    }

    if (json2) {
        const file2Path = resolve(tmpDir, "file2.json");
        writeFileSync(file2Path, JSON.stringify(json2));
    }

    console.debug("Opening comparator...");
    const comparator = spawn("yarn", ["start-comparator"], {
        stdio: "inherit",
        env: { ...process.env },
    });

    comparator.on("close", code => cleanupAndExit(tmpDir, code ?? 0));

    // Cleanup on termination signals
    const onSignal = (signal: NodeJS.Signals) => {
        try {
            comparator.kill(signal);
        } catch (error) {
            console.error("Error terminating comparator process:", error);
        }
        cleanupAndExit(tmpDir, 0);
    };

    process.on("SIGINT", onSignal);
    process.on("SIGTERM", onSignal);
}

const cleanupTempDir = (tmpDir: string) => {
    try {
        if (existsSync(tmpDir)) rmSync(tmpDir, { recursive: true, force: true });
    } catch (error) {
        console.error("Error during cleanup of temporary directory:", error);
    }
};

const cleanupAndExit = (tmpDir: string, code?: number) => {
    console.debug("Comparison completed. Cleaning up...");
    cleanupTempDir(tmpDir);
    process.exit(code ?? 0);
};

function parseMetadataFromFile(filePath: Maybe<string>): Maybe<JSONContent> {
    if (!filePath) return undefined;
    const file = resolve(filePath);
    const jsonContent = readFileSync(file, "utf-8");
    const parsed = parseJson(jsonContent);

    if (!parsed) {
        console.error(`Failed to parse JSON from file: ${filePath}`);
    }

    return parsed;
}

function areJsonsIdentical(json1: Maybe<JSONContent>, json2: Maybe<JSONContent>): boolean {
    return JSON.stringify(json1) === JSON.stringify(json2);
}
