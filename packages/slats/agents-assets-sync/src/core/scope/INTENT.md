# scope

## Purpose

Resolve a `user | project` scope token into one absolute project root. `user` is the home directory; `project` walks up from `cwd` and reuses the first ancestor that owns any project anchor. The root is agent-neutral on purpose — every selected agent derives its own asset locations from the same root, so `claude` and `codex` never disagree about which project they are in.

## Structure

- `index.ts` — barrel export
- `scope.ts` — `resolveProjectRoot`, `findNearestAnchorAncestor`, `isValidScope` + `Scope`, `ProjectRootResolution`
- `utils/hasAnchor.ts` — anchor probe + the `PROJECT_ANCHORS` list
- `__tests__/` — this fractal's verification files

## Conventions

- An anchor is any of `.claude`, `AGENTS.md`, `.agents`, `.codex`, `.git`. Existence alone marks the root, with no directory check: a file and a directory count alike, because `AGENTS.md` is a file and `.git` is a file rather than a directory inside a worktree.
- Order within the list does not affect the verdict; the first match wins.

## Dependencies

- None. This is the deepest leaf `agentTarget/` builds on.

## Boundaries

### Always do

- Report `autoLocated` when an ancestor other than `cwd` was chosen, so renderers can say where the write lands
- Keep the module synchronous and deterministic

### Ask first

- Adding a scope token beyond `user | project`
- Changing the anchor list — it decides where every agent writes

### Never do

- Compute agent-specific paths here; that belongs to `agentTarget/`
- Import from `agentTarget/`, `injectDocs/`, `buildPlan/`, `commands/`, or `ui/`
- Use network or async IO
