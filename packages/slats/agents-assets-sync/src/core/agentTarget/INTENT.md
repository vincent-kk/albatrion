# agentTarget

## Purpose

Decide where each agent keeps injected assets: one `(agent, scope)` pair becomes concrete locations, then every manifest path becomes a copied file, a marker block inside a shared `AGENTS.md`, or an explicit "no place for it here". The only fractal that knows a per-agent convention.

## Structure

- `index.ts` — barrel export
- `agentTarget.ts` — `resolveAgentTarget`, `isValidAgent`
- `type.ts` — `AgentType`, `AssetKind`, `AgentTarget`, `Destination`, `OrphanScan`
- `utils/splitAssetKind.ts` — manifest path → `{ kind, rest }`
- `utils/resolveDestinations.ts` — paths → destinations + orphan scans

## Conventions

- claude roots every kind under `<projectRoot>/.claude`.
- codex and agents merge rules into `AGENTS.md`, keep skills in a `skills/` directory, and have no commands location. At `project` scope they are identical (`<projectRoot>/.agents/skills` + the repository's `AGENTS.md`); at `user` scope codex reads `~/.codex`, agents `~/.agents`.
- `agents` is a convention, not a product: for tools reading `.agents`.
- Depends on `scope/` for the root and `markerBlock/` for block ids, both through their `index.ts`; consumed by `buildPlan/`.

## Boundaries

### Always do

- Derive every location from the single shared project root, so selecting several agents in one run cannot straddle two projects
- Leave a path out of `destinations` when its kind is unknown or filtered out — absence is what stops a filtered run from deleting
- Emit an orphan scan only for kinds the caller asked for

### Ask first

- Adding an agent to `AgentType` — every renderer enumerates it
- Changing an agent's directory convention; installs carry the old paths

### Never do

- Create, read or write asset files here; this fractal computes paths
- Import from `buildPlan/`, `injectDocs/`, `commands/`, or `ui/`
