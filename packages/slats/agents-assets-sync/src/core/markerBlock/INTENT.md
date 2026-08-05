# markerBlock

## Purpose

Read and write this tool's own comment-delimited blocks inside an `AGENTS.md` that other tools also append to. A rule file becomes one block, so a block's body hash is comparable to the manifest hash for that file and the copy/skip/diverged verdict stays identical to the file-copy path.

## Structure

- `index.ts` — barrel export
- `markerBlock.ts` — `formatBlockId`, `parseBlocks`, `findBlockBody`, `upsertBlock`, `removeBlock`, `blockBodyMatches` + `ParsedBlock`
- `utils/markerLine.ts` — `MARKER_PREFIX`, marker line builders, and the block-scanning pattern factory
- `__tests__/` — this fractal's verification files

## Conventions

- Marker shape is `<!-- AGENTS-ASSETS-SYNC:START:<packageName>:<relPath> -->`, mirroring the `FILID:` / `SEIRI:` markers the same file already carries.
- `createBlockPattern` returns a new regex per call; a shared global regex carries `lastIndex` and would skip matches.

## Boundaries

### Always do

- Carry through every byte outside this tool's own blocks — foreign blocks and hand-written prose are other owners' content
- Replace an existing block in place; appending a second block with the same id would make the document self-contradictory
- Match a block by comparing its captured id, never by building a regex from the id — package names carry regex metacharacters

### Ask first

- Changing `MARKER_PREFIX` or the marker shape — every document already written carries the old form and would be re-appended, not updated
- Widening a block to hold more than one source file

### Never do

- Read or write the filesystem here; this fractal transforms strings
- Import from `agentTarget/`, `buildPlan/`, `injectDocs/`, `commands/`, or `ui/`
