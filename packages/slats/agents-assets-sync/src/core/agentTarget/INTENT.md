# agentTarget

## Purpose

Decide where each agent keeps injected assets. Turns one
`(agent, scope)` pair into concrete locations, then maps every manifest
path onto a destination — a copied file, a marker block inside a shared
`AGENTS.md`, or an explicit "this agent has no place for it". This is
the only fractal that knows a per-agent convention.

## Structure

- `index.ts` — barrel export
- `agentTarget.ts` — `resolveAgentTarget`, `isValidAgent`
- `type.ts` — `AgentType`, `AssetKind`, `AgentTarget`, `Destination`,
  `OrphanScan`
- `utils/splitAssetKind.ts` — manifest path → `{ kind, rest }`
- `utils/resolveDestinations.ts` — paths → destinations + orphan scans

## Conventions

- claude roots every kind under `<projectRoot>/.claude`.
- codex roots skills under `<projectRoot>/.codex/skills`, merges rules
  into `AGENTS.md`, and has no commands location. Its `AGENTS.md` sits
  at `<projectRoot>` for `project` and inside `.codex` for `user` —
  that asymmetry is the Codex CLI's, not this tool's.
- `user` scope reaches these paths through `resolveProjectRoot`, whose
  root is the home directory, so both agents use one formula.

## Boundaries

### Always do

- Derive every location from the single shared project root, so
  selecting both agents in one run cannot straddle two projects
- Leave a path out of `destinations` when its kind is unknown or
  filtered out — absence is what stops a filtered run from deleting
- Emit an orphan scan only for kinds the caller asked for

### Ask first

- Adding an agent to `AgentType` — every renderer enumerates it
- Changing an agent's directory convention; existing installs already
  carry files at the current paths

### Never do

- Create, read or write asset files here; this fractal computes paths
- Import from `buildPlan/`, `injectDocs/`, `commands/`, or `ui/`
