import { subcommands } from "cmd-ts";
import { build } from "./build";

export function getCommand() {
    return subcommands({
        name: "metadata",
        description: "Metadata commands",
        cmds: { build: build},
    });
}
