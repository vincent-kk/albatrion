# src

## Purpose

Shared CLI engine that lets any npm package ship one set of agent docs (skills, rules, commands) and inject them where each coding agent keeps them. The engine owns the `inject-agents-settings` dispatcher; consumers only declare `agents.assetPath` in `package.json` and let `agents-build-hashes` hash their asset tree at build time.

## Structure

- `index.ts` — programmatic public API barrel
- `commands/` — commander root: dispatcher + action
- `core/` — `hash`, `hashManifest`, `scope`, `agentTarget`, `markerBlock`, `buildPlan`, `injectDocs` primitives
- `ui/` — Ink React UI for the TTY path (internal, dynamic-imported)
- `utils/` — logger, asyncPool, types, version (organ)
- `__tests__/` — end-to-end runs of the built bin, verifying this document's groups

## Conventions

- Every choice is reachable by flag, so an agent can drive a whole run without a prompt; the Ink picker is a convenience, never the only way
- TypeScript strict mode, ESM-only rolldown build
- `./buildHashes` is build-time hashing, pure Node ESM outside rolldown; its self-executing bin is `scripts/agents-build-hashes.mjs`
- Entry point is `bin/inject-agents-settings.mjs`, a two-line re-export of `runCli(process.argv)`

## Boundaries

### Always do

- Keep `core/` UI-free; both renderers compose its primitives directly
- Route cross-fractal imports through each sibling's `index.ts`
- Load `ui/` only from `commands/runCli/renderers/renderOrFallback.ts`, by dynamic import; `src/index.ts` MUST NOT re-export from `ui/`

### Ask first

- Adding an agent to `AgentType`, or changing an agent's asset paths
- Adding top-level commands beyond the single dispatcher action
- Changing the public shape of `runCli`, `HashManifest`, `InjectReport`

### Never do

- Import from `ui/` outside `renderOrFallback.ts`
- Read `package.json` or walk `node_modules` inside `core/**`, `ui/**` or `utils/**`
- Rewrite content in a shared `AGENTS.md` outside this tool's markers
