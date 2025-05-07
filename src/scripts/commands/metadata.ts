import { subcommands } from "cmd-ts";
import { build } from "./build";
import { compare } from "./compare";

export function getCommand() {
    return subcommands({
        name: "metadata",
        description: "Metadata commands",
        cmds: { build: build, compare: compare },
    });
}
