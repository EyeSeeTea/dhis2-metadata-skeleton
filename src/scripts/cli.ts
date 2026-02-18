import path from "path";
import { run, subcommands } from "cmd-ts";

import * as metadata from "./commands/metadata";
import * as compareMetadata from "./commands/compare-metadata";

export function runCli() {
    const cliSubcommands = subcommands({
        name: path.basename(__filename),
        cmds: {
            metadata: metadata.getCommand(),
            compare: compareMetadata.getCommand(),
        },
    });

    const args = process.argv.slice(2);
    run(cliSubcommands, args);
}
