# Spec: Metadata Compare (CLI Preload + Launch UI)

## Scope

This spec defines the CLI behavior for comparing two metadata JSON files and launching the comparator UI with preloaded inputs.

This spec covers:
- CLI flags and file handling
- Early exit behavior when inputs are identical
- Writing temporary inputs for the UI
- Launching the comparator UI process

Out of scope:
- UI comparison/merge behavior (see `comparator-ui/spec.md`)
- Metadata build behavior (see `metadata-build/spec.md`)

---

## User Stories

1. As a reviewer, I can run a command with two file paths and open a browser UI with both loaded.
2. As a reviewer, if the files are identical, I am told there is nothing to compare and the tool exits without launching the UI.
3. As a reviewer, I can also run the UI directly and upload files manually (UI-only mode).

---

## Commands

### Preferred canonical command
```bash
yarn start metadata compare -f file1.json -s file2.json
```

### Supported alias (package.json)
```bash
yarn compare-metadata -f file1.json -s file2.json
```

These commands MUST behave equivalently.

### UI-only command (no preload)
```bash
yarn start-comparator
```

⚠️ `start-comparator` MUST NOT accept `-f/-s` flags; preloading is the CLI compare command’s responsibility.

---

## Inputs

### Flags
The compare command MUST accept:
- `-f` / `--file1`: path to first JSON file
- `-s` / `--file2`: path to second JSON file

### Validation
- If either file path is missing, the command MUST fail with usage instructions.
- If either file does not exist or cannot be read, the command MUST fail and identify the path.
- Each file MUST be parsed as JSON; parse failure MUST produce an error naming the file.

---

## Behavior

### Early exit
If the two parsed JSON documents are structurally equal (deep equality):
- The command MUST print a message indicating no comparison is needed.
- The command MUST exit successfully (zero exit).
- The UI MUST NOT be launched.

### Preload mechanism
If the files are not equal:
- The command MUST write (or overwrite) the two JSON documents to:
  - `public/.tmp/file1.json`
  - `public/.tmp/file2.json`
- The `public/.tmp` directory MUST be created if missing.

### Launching the UI
After writing temp files:
- The command MUST spawn the UI-only command (`yarn start-comparator`) as a child process.
- The child process IO SHOULD be inherited/forwarded so users can see Vite logs.

---

## Errors & Diagnostics

The compare command MUST fail (non-zero exit) if:
- Required flags are missing
- Any input file is unreadable
- Any input file is invalid JSON
- Temp files cannot be written
- The UI process fails to start

Error messages SHOULD:
- Include the failing file/path
- Provide a short hint for resolution

---

## Tests (Minimum)

Automated tests SHOULD cover:
- Missing flags → usage error
- Invalid JSON → error identifies file
- Deep-equal inputs → early exit without temp files
- Non-equal inputs → temp files written to correct paths
- UI launch invoked (can be mocked/spied)

---

## Backwards Compatibility

Breaking changes include:
- Changing `-f/-s` flags
- Changing temp file locations
- Removing the `compare-metadata` alias
