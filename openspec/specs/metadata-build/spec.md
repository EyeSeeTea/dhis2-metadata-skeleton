# Spec: Metadata Build (Offline Processor)

## Scope

This spec defines the source-of-truth behavior for building consolidated DHIS2 metadata JSON outputs from folder-based inputs.

This spec covers:
- Input discovery and validation
- Merge behavior per domain folder
- Deduplication behavior
- Output file generation

Out of scope:
- Comparator UI behavior (see `comparator-ui/spec.md`)
- Comparison preloading workflow (see `metadata-compare/spec.md`)
- DHIS2 instance connectivity, API validation, or schema validation beyond `id`

---

## User Stories

1. As a metadata packager, I can run a single command to produce consolidated JSON outputs in `output/`.
2. As a packager, I get a clear error if any required input domain folder has no valid JSON files.
3. As a packager, I get deterministic outputs given stable input ordering.

---

## Commands

### Preferred canonical command
```bash
yarn start metadata build
```

### Supported alias (package.json)
```bash
yarn metadata-build
```

Both commands MUST produce identical results.

---

## Inputs

### Domain folders (repo root)
The build process MUST read from these folders:
- `capture/`
- `visualizations/`
- `permissions/`

### File selection rules
Within each domain folder:
- Only files ending in `.json` MUST be considered.
- Any file whose filename contains the substring `-sorted` MUST be ignored.
- If, after filtering, there are zero `.json` files, the build MUST fail with an actionable error indicating which folder is empty.

### JSON parse requirements
- Each selected `.json` file MUST be parsed as JSON.
- If a file cannot be parsed, the build MUST fail and identify the file path.

---

## Merge & Deduplication

### Minimal contract
Entities are deduplicated by the `id` field. Any entity intended for deduplication MUST have:

```ts
type Ref = { id: string }
```

### Merge behavior
- The builder MUST load all selected JSON files for a domain.
- It MUST combine metadata arrays by concatenation per key (e.g., `dataSets`, `programs`, etc.).
- Deduplication MUST be applied to each combined array, using `id` as the unique key.
- Deduplication is **order-dependent**; given the same file enumeration order and content, output MUST be stable.

### Conflict resolution
When duplicates exist (same `id`):
- The retained entity MUST be the first one encountered according to the effective merge order.

---

## Outputs

### Output folder
- Outputs MUST be written under `output/` at repo root.
- The output folder MUST be created if it does not exist.

### Output filenames
For each domain folder, the output MUST be written as:
- `output/capture.json`
- `output/visualizations.json`
- `output/permissions.json`

### Output shape
- Each output file MUST be a JSON object containing the merged keys for that domain.
- Pretty-printing/formatting is not a contract requirement unless explicitly adopted; functional equivalence is the contract.

---

## Errors & Diagnostics

The build MUST fail (non-zero exit) in these cases:
- Any required domain folder missing
- Any required domain folder contains zero valid JSON files after filtering
- Any JSON file cannot be parsed
- Output folder cannot be written

Error messages SHOULD:
- Name the failing domain/folder
- Name the failing file if applicable
- Provide a next-step hint (e.g., “add at least one .json file to capture/”)

---

## Tests (Minimum)

At minimum, automated tests SHOULD cover:
- Filtering logic (`-sorted` ignored)
- Empty-folder validation
- Deduplication by `id`
- Output path naming per domain
- Deterministic results given stable ordering

---

## Backwards Compatibility

These are compatibility guarantees:
- The alias command `yarn metadata-build` remains supported unless removed via a breaking change proposal.
- The folder contract and output filenames are breaking-change surfaces.
