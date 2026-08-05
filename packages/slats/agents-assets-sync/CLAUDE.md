# CLAUDE.md

`@slats/agents-assets-sync` — shared engine + dispatcher that lets any npm package ship one set of agent docs and inject them wherever each coding agent keeps them, through the `inject-agents-settings` bin. Consumers own no runtime files — they declare `agents.assetPath` in `package.json` and hand the rest to the engine.

Every choice is reachable by flag, so an agent can drive a whole run without a prompt.

## Commands

```bash
yarn build           # inject-version → rolldown (ESM) → build:types → build:hashes
yarn test            # vitest
yarn lint            # eslint
yarn dev:ui          # preview Ink phases (see scripts/dev-ui.tsx)
yarn dev:ui --tour   # cycle through all Ink phases with fixture data
```

## Public API

- `.` (main barrel, ESM-only)
  - `runCli(argv: string[]): Promise<void>` — dispatcher entry. Parses `--package <name...>` from argv (variadic: repeat or comma-separate). Each value is a scope alias (`@<scope>`), a scoped package (`@<scope>/<name>`), or an unscoped package (`<name>`).
  - Core primitives re-exported: `readHashManifest`, `computeNamespacePrefixes`, `resolveProjectRoot`, `resolveAgentTarget`, `resolveDestinations`, `formatBlockId`, `parseBlocks`, `isValidScope`, `isValidAgent`, `MARKER_PREFIX`, `PROJECT_ANCHORS`, `HASH_MANIFEST_FILENAME`
  - No `injectDocs` orchestrator — both renderers (Ink `ui/` and plain `renderPlain`) compose primitives directly.
- `./buildHashes` — `buildHashes(options?)` produces `<packageRoot>/dist/agents-hashes.json`.

Bin entries (all map to the same engine; choose by invocation context):

- `agents-assets-sync` — npx canonical alias. Matches the package's unscoped name so `npx @slats/agents-assets-sync ...` works directly. Routes to the same dispatcher stub.
- `inject-agents-settings` — descriptive name for installed environments (`yarn add -D` / `npm i -g`). Two-line stub in `bin/inject-agents-settings.mjs` calls `runCli(process.argv)`.
- `agents-build-hashes` — standalone build helper that parses `process.cwd()/package.json` and delegates to `buildHashes`.

The commander `name(...)` is derived from `argv[1]` basename at runtime, so help/error output reflects the actual invocation (`agents-assets-sync` vs `inject-agents-settings`).

## CLI Surface

```
<bin> --package <name...> [--agent <type...>] [--scope=user|project] [--asset <kind...>]
      [--dry-run] [--force] [--yes] [--no-interactive] [--root=<cwd>] [--json]
```

Where `<bin>` is `agents-assets-sync` (npx) or `inject-agents-settings` (installed). Both bins point at the same dispatcher.

| Flag                | Meaning                                                                                                                           |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `--agent <type...>` | `claude` \| `codex`. Omitted, an interactive TTY asks; anywhere else exits 2.                                                     |
| `--asset <kind...>` | `skills` \| `rules` \| `commands`. Default: all. An excluded kind is absent from the plan, so it is neither reported nor deleted. |
| `--yes`             | Approve the force dialog without showing it.                                                                                      |
| `--no-interactive`  | Never prompt, even on a TTY. A missing flag exits 2.                                                                              |

Fully unattended: `--package=<name> --agent=claude,codex --scope=project --force --yes`.

`--package` is variadic. Each value is classified by shape:

| Shape                 | Meaning                                                 |
| --------------------- | ------------------------------------------------------- |
| `@<scope>` (no slash) | all packages under the npm scope (workspace-enumerated) |
| `@<scope>/<name>`     | one scoped package                                      |
| `<name>` (no `@`)     | one unscoped package                                    |
| anything else         | invalid → exit 2                                        |

Repeat any variadic flag or comma-separate values. Targets are deduped by resolved package name; agents keep their listed order.

`--json` selects `renderJson`, which writes exactly one JSON document to stdout and diverts every diagnostic to stderr — a single stray log line would make the stream unparseable. Non-TTY and `--no-interactive` take `renderPlain` instead. One `unit` per (package, agent) pair; flag errors arrive as `errors` with `exitCode: 2` rather than loose text.

Workspace enumeration (scope alias) is confined to `src/commands/runCli/utils/resolveScopeAlias.ts`.

## Agent Destinations

`projectRoot` is the home directory for `--scope=user`, and for `--scope=project` the nearest ancestor owning any of `.claude`, `AGENTS.md`, `.agents`, `.codex`, `.git` (falling back to cwd). Every agent shares it, so one run cannot straddle two projects.

| Kind               | claude                       | codex                               | agents                     |
| ------------------ | ---------------------------- | ----------------------------------- | -------------------------- |
| `skills` (user)    | `~/.claude/skills/**`        | `~/.codex/skills/**`                | `~/.agents/skills/**`      |
| `skills` (project) | `<root>/.claude/skills/**`   | `<root>/.agents/skills/**`          | `<root>/.agents/skills/**` |
| `rules` (user)     | `~/.claude/rules/**`         | `~/.codex/AGENTS.md`                | `~/.agents/AGENTS.md`      |
| `rules` (project)  | `<root>/.claude/rules/**`    | `<root>/AGENTS.md`                  | `<root>/AGENTS.md`         |
| `commands`         | `<root>/.claude/commands/**` | unsupported — skipped with a reason | unsupported                |

`agents` is not a product: it is the vendor-neutral `.agents` convention, for tools that read it instead of keeping a home of their own. It differs from `codex` only at `user` scope — the project layout is the same `.agents/skills` plus the repository's own `AGENTS.md`. Selecting both at `--scope=project` therefore plans the same writes twice; the second run of them is a no-op, since applying is idempotent.

## AGENTS.md Marker Blocks

One rule file becomes one block, so a block's body hash equals the manifest hash for that file and the copy/skip/diverged verdict matches the file path exactly.

```
<!-- AGENTS-ASSETS-SYNC:START:@canard/schema-form:rules/schema-form-rule.md -->
…source bytes, verbatim…
<!-- AGENTS-ASSETS-SYNC:END:@canard/schema-form:rules/schema-form-rule.md -->
```

The shape mirrors the `FILID:` / `SEIRI:` markers such files already carry. Content outside this tool's own blocks — other tools' blocks, hand-written prose — is carried through byte for byte. Writes are applied one document at a time, outside the copy pool: concurrent writers would each persist their own read of the file.

## Render Paths

- **TTY + no `--json`**: `renderOrFallback` dynamic-imports `src/ui/index.js` and calls `renderInjectApp(input)`. The Ink app composes `core/**` primitives through `useInjectSession` + per-step hooks (`useResolveStep`, `usePlanStep`, `useForceConfirmStep`, `useApplyStep`).
- **Non-TTY or `--json`**: `renderOrFallback` calls `renderPlain(targets, flags, originCwd)` which composes the same `core/**` primitives with picocolors text output.
- Both paths share the same primitives; no `injectDocs(opts)` orchestrator in between.

## Consumer Integration Pattern

Each consumer ships only:

```
<consumer>/
  docs/agents/ (or any path)   # authored once, projected per agent
    skills/<name>/SKILL.md
    rules/*.md
  dist/agents-hashes.json      # GENERATED at build, publish-included
  package.json: {
    "scripts": { "build:hashes": "agents-build-hashes" },
    "devDependencies": { "@slats/agents-assets-sync": "workspace:^" },
    "agents": { "assetPath": "docs/agents" }
  }
```

One asset tree serves every agent; the engine decides where each kind lands.

Consumers must:

- `scripts.build:hashes: "agents-build-hashes"` — engine bin, linked into workspace `.bin/` at install time
- `devDependencies: { "@slats/agents-assets-sync": "workspace:^" }` — MUST be devDependencies
- `agents.assetPath: "docs/agents"` — consumer-side convention
- `files: ["dist", "docs", "README.md"]` — NEVER include `"bin"` or `"scripts"`

End users invoke via `npx @slats/agents-assets-sync --package=<name>`.

## Architecture

```
bin/
└── inject-agents-settings.mjs      # 2-line dispatcher (ESM)
src/
├── index.ts                        # ESM public barrel (runCli + core primitives)
├── __tests__/                      # e2e: spawns the built bin (cli, json)
├── commands/
│   └── runCli/
│       ├── runCli.ts               # commander root + action
│       └── utils/
│           ├── classifyTarget.ts   # pure: scope | package | invalid
│           ├── resolvePackage.ts   # single-target resolve
│           ├── resolveScopeAlias.ts# scope → packages enumeration (only enumerator)
│           ├── resolveTargets.ts   # classify/resolve/dedupe orchestrator
│           ├── resolveScopeFlag.ts # plain-path scope flag validator
│           ├── resolveAgentFlag.ts # --agent validator (exits 2 when non-interactive)
│           ├── resolveAssetFlag.ts # --asset validator → Set<AssetKind>
│           ├── toConsumerPackages.ts # metadata → ConsumerPackage
│           ├── renderOrFallback.ts # TTY vs plain branch + dynamic UI import
│           ├── renderPlain.ts      # non-TTY / --no-interactive picocolors renderer
│           └── renderJson.ts       # --json single-document renderer
├── core/
│   ├── hash/                       # sha256 compute / compare
│   ├── hashManifest/               # dist/agents-hashes.json IO + namespace prefixes
│   ├── scope/                      # user | project → one agent-neutral project root
│   ├── agentTarget/                # project root → per-agent destinations + orphan scans
│   ├── markerBlock/                # this tool's blocks inside a shared AGENTS.md
│   ├── buildPlan/                  # copy / skip / warn-diverged / warn-orphan / delete
│   └── injectDocs/                 # apply + partition + summarize (no orchestrator)
├── ui/                             # Ink React TTY path (internal only)
│   ├── InjectApp/                  # phase state machine + <InjectApp/>
│   ├── components/                 # Banner, StepTracker, PlanTable, ...
│   ├── hooks/                      # pipeline hooks + useInjectSession
│   ├── theme/                      # colors, icons, layout
│   └── types/                      # Phase, InjectEvent, RenderInput, target
└── utils/                          # asyncPool, logger, types, version
scripts/
├── buildHashes.mjs                 # pure Node ESM, importable from Rolldown
├── agents-build-hashes.mjs         # self-executing bin
├── dev-ui.tsx                      # Ink phase preview / tour
└── dev-ui-fixtures.ts              # mock plans + targets for dev preview
```

Every test lives in a `__tests__/` beside the fractal whose DETAIL declares it —
there is no root `tests/` directory. `tsconfig.declarations.json` excludes them
from the build; `tsconfig.json` does not, so they are type-checked.

## Hash Strategy (Option A)

- `dist/agents-hashes.json` is the sole source of truth (schema v1, `previousVersions: {}` reserved).
- Per-entry SHA-256 comparison: copy if missing, skip if equal, warn + require `--force` if different. A codex rule block is compared by the body between its markers, against the same manifest hash.
- `--force` on TTY: Ink `ConfirmForce` dialog, skipped by `--yes`. Non-interactive: stderr emission + proceed.
- `--force` actually overwrites diverged content: `partitionActions` makes `warn-diverged` executable once force is granted.

## Boundaries

- `src/core/**` never imports from `src/ui/`, `src/commands/`, or `src/utils/logger.ts` (applyAction has a single `logger.warn` for rare unlink failures, the only exception).
- `src/ui/**` never calls into `src/commands/**`; it's loaded via dynamic import from `renderOrFallback` only.
- `src/ui/` is **not** exposed as a package subpath — internal only.
- Nothing writes into a shared `AGENTS.md` outside this tool's own markers.
- `scripts/buildHashes.mjs` stays pure Node ESM (no top-level await) so rolldown can import it; `scripts/agents-build-hashes.mjs` holds the self-executing CLI wrapper.

## Build Output

ESM-only: `dist/index.{mjs,d.ts}` + `dist/ui/**` + subpath entrypoints per rolldown config.
