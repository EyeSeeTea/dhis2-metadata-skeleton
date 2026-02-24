import { subcommands } from "cmd-ts";
import { build } from "./build";
import { compareMetadata } from "$/scripts/commands/compare-metadata";

export function getCommand() {
    return subcommands({
        name: "metadata",
        description: "Metadata commands",
        cmds: { build: build, compare: compareMetadata },
    });
}
