import { command } from "cmd-ts";

export const compare = command({
    name: "metadata compare",
    description: "",
    args: {},
    handler: async () => {
        console.log("Comparing metadata...");
    },
});
