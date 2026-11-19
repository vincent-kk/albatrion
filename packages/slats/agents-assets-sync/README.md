# @slats/agents-assets-sync

Engine + dispatcher CLI that lets any npm package ship agent docs (skills, rules, commands) and inject them into the selected agent's locations. Consumers declare `agents.assetPath` in `package.json` and the engine's `inject-agents-settings` bin handles the rest.

## Overview

A consumer package declares `agents.assetPath` in `package.json` and runs `agents-build-hashes` during build to emit `dist/agents-hashes.json`. End users run `npx @slats/agents-assets-sync --package=<name>` and this engine resolves each consumer's metadata, compares its hash manifest against the selected destinations, and copies only what is out of date.

`--package` accepts a scoped name (`@scope/pkg`), an unscoped name (`pkg`), or a **scope alias** (`@scope` with no slash) that fans out to every installed `node_modules/@scope/*` package declaring `agents.assetPath`. Single-target resolution uses `createRequire`; scope-alias enumeration walks ancestor `node_modules/@<scope>/` directories from `cwd` upward and is isolated to `runCli/targets/resolveScopeAlias.ts`.

No GitHub fetch, no `.sync-meta.json`, no migrations — the consumer's own asset tree is the single source of truth, read from `dist/agents-hashes.json` when it has been built and hashed in place when it has not.

## Install

```bash
npm install -D @slats/agents-assets-sync
# or
yarn add -D @slats/agents-assets-sync
```

## CLI Surface

```
<bin> --package=<name...> [--agent=claude|codex] [--scope=user|project] [--asset=<kind...>]
      [--asset-path=<path>] [--dry-run] [--force] [--yes] [--no-interactive]
      [--root=<cwd>] [--json]
agents-build-hashes
```

`<bin>` selects either dispatcher alias; `agents-build-hashes` is a separate build helper:

| Bin                      | Use when                                                                                                       |
| ------------------------ | -------------------------------------------------------------------------------------------------------------- |
| `agents-assets-sync`     | invoking via `npx` — matches the package's unscoped name so `npx @slats/agents-assets-sync ...` works directly |
| `inject-agents-settings` | the engine is installed (`yarn add -D` / `npm i -g`) and you prefer a descriptive command name                 |
| `agents-build-hashes`    | build-time helper for consumer packages (run from `package.json` scripts)                                      |

### Agent destinations

`projectRoot` is the home directory for `--scope=user`, and for `--scope=project` the nearest ancestor owning a root marker (`.git`, `pnpm-workspace.yaml`, or a lockfile: `pnpm-lock.yaml`, `yarn.lock`, `package-lock.json`, `npm-shrinkwrap.json`, `bun.lock`, `bun.lockb`); when no ancestor owns one, the nearest ancestor owning any of `.claude`, `AGENTS.md`, `.agents`, `.codex` (falling back to cwd). A marker outranks a nearer agent directory, so a stray `.claude` inside a workspace member never becomes the root. A marker owned by the home directory or an ancestor of it is ignored — a dotfiles repository claims no project underneath. Every agent shares it, so one run cannot straddle two projects.

| Kind               | claude                       | codex                      | agents                     |
| ------------------ | ---------------------------- | -------------------------- | -------------------------- |
| `skills` (user)    | `~/.claude/skills/**`        | `~/.codex/skills/**`       | `~/.agents/skills/**`      |
| `skills` (project) | `<root>/.claude/skills/**`   | `<root>/.agents/skills/**` | `<root>/.agents/skills/**` |
| `rules` (user)     | `~/.claude/rules/**`         | `~/.codex/AGENTS.md`       | `~/.agents/AGENTS.md`      |
| `rules` (project)  | `<root>/.claude/rules/**`    | `<root>/AGENTS.md`         | `<root>/AGENTS.md`         |
| `commands`         | `<root>/.claude/commands/**` | unsupported                | unsupported                |

`agents` is the vendor-neutral `.agents` convention rather than a product, for tools that read it instead of keeping a home of their own. It differs from `codex` only at `user` scope; the project layout is identical.

One rule file becomes one marker block. Rule bodies remove a leading UTF-8 BOM and normalize CRLF and CR to LF without re-encoding other bytes; comparison uses the same normalized-body hash, so a second run is a no-op:

```
<!-- AGENTS-ASSETS-SYNC:START:@canard/schema-form:rules/schema-form-rule.md -->
…normalized rule bytes…
<!-- AGENTS-ASSETS-SYNC:END:@canard/schema-form:rules/schema-form-rule.md -->
```

The shape mirrors the `FILID:` / `SEIRI:` markers such files already carry. Everything outside this tool's own blocks — other tools' blocks, hand-written prose — is carried through byte for byte.

### End-user invocation

The engine is not shipped as a runtime dependency of consumers. The canonical npx form is:

```bash
# Single consumer:
npx @slats/agents-assets-sync --package=@canard/schema-form --agent=claude --scope=user

# Scope alias — every installed @winglet/* that declares agents.assetPath:
npx @slats/agents-assets-sync --package=@winglet --agent=claude,codex --scope=user

# A package that declares nothing and ships no manifest — name the directory:
npx @slats/agents-assets-sync --package=some-pkg --asset-path=agents --agent=claude --scope=project
```

The dispatcher walks `node_modules` from the current working directory (or `--root <path>`) up to the filesystem root, so it works as long as the target package is installed somewhere in the host project's hoisting chain.

#### Installed CLI (alternative)

```bash
yarn add -D @slats/agents-assets-sync
yarn inject-agents-settings --package=@canard/schema-form --agent=claude --scope=user

# or globally:
npm i -g @slats/agents-assets-sync
inject-agents-settings --package=@canard/schema-form --agent=claude --scope=user
```

The legacy explicit form `npx -p @slats/agents-assets-sync inject-agents-settings ...` continues to work for backward compatibility.

| Flag                  | Meaning                                                                                                                                                                                                                                                                                                                                                       |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--package <name>`    | **Required.** Repeatable/comma-separable. Accepts `@scope/pkg`, `pkg`, or a scope alias `@scope` (fans out to every installed `node_modules/@scope/*` with `agents.assetPath`).                                                                                                                                                                               |
| `--agent <type>`      | **Required outside an interactive TTY.** `claude` \| `codex` \| `agents`, repeatable/comma-separable.                                                                                                                                                                                                                                                         |
| `--asset <kind>`      | `skills` \| `rules` \| `commands`. Default: all. An excluded kind is absent from the plan, so it is neither reported nor deleted.                                                                                                                                                                                                                             |
| `--asset-path <path>` | Asset root relative to each target's package root — for a package that ships assets in a directory like `agents/` or `docs/` without declaring `agents.assetPath`. Overrides the declaration on every target and hashes that directory at run time, so no `dist/agents-hashes.json` is needed. Must be relative and name a real directory inside the package. |
| `--yes`               | Approve the force dialog without showing it.                                                                                                                                                                                                                                                                                                                  |
| `--no-interactive`    | Never prompt, even on a TTY; a missing flag exits 2.                                                                                                                                                                                                                                                                                                          |
| `--scope=user`        | Home directory (applies globally).                                                                                                                                                                                                                                                                                                                            |
| `--scope=project`     | Project root selected under Agent destinations; root markers take precedence over agent anchors.                                                                                                                                                                                                                                                              |
| `--dry-run`           | Print the copy / skip / warn plan, no writes.                                                                                                                                                                                                                                                                                                                 |
| `--force`             | Overwrite diverged files & delete orphans (interactive confirm on TTY).                                                                                                                                                                                                                                                                                       |
| `--root <path>`       | Override scope-resolution cwd.                                                                                                                                                                                                                                                                                                                                |

**Exit codes**: `0` success / up-to-date / dry-run, `1` runtime error, `2` user / configuration error (missing `--package`, missing `--scope` in non-TTY, unresolvable package, missing `agents.assetPath` with no `--asset-path`, an `--asset-path` that is absolute or names no directory inside the package, or an asset root that resolves outside its package).

For `--scope=project`, use the root-marker precedence described under Agent destinations. The CLI logs `(auto-located)` when the resolved root is above the working directory.

## Consumer Integration (2 steps)

### 1. `package.json`

```json
{
  "name": "@your-scope/your-package",
  "scripts": {
    "build": "… && yarn build:hashes",
    "build:hashes": "agents-build-hashes"
  },
  "devDependencies": {
    "@slats/agents-assets-sync": "workspace:^"
  },
  "files": ["dist", "docs", "README.md"],
  "agents": { "assetPath": "docs/agents" }
}
```

- `@slats/agents-assets-sync` MUST be in `devDependencies` — the engine is a CLI-only tool and must not leak into end-user production installs. See Rationale below.
- Do **not** add any `bin` field. The engine is the sole CLI surface; per-consumer bins would collide under `node_modules/.bin/`.
- Do **not** expose `./bin/*` or `./docs/*` in `exports`. That would let consumer bundlers pull CLI code or the asset tree into app bundles.
- Do **not** create a `bin/` or `scripts/` directory in the consumer.

### 2. Build

```bash
yarn build
# rolls up the library, emits types, then `agents-build-hashes` hashes every
# file under `agents.assetPath` and writes dist/agents-hashes.json
```

Without a non-empty `agents.assetPath`, `agents-build-hashes` does nothing and succeeds. A declared missing directory is an error. The manifest stores raw file hashes plus normalized `ruleBodyHashes`; rebuilding an older manifest supplies the normalized hashes needed to check installed rules when the source directory is absent.

Ship the resulting `dist/` (including `agents-hashes.json`) alongside `docs/` when you publish.

### Rationale: `devDependencies`, not `dependencies`

- The engine is used at two moments only: (1) the consumer's own build, where `agents-build-hashes` produces `dist/agents-hashes.json`, and (2) the end user's one-off `inject-agents-settings` invocation. Neither is runtime behaviour of the consumer library.
- Putting the engine in `dependencies` would force every downstream installer of the consumer to pull `commander`, `ink`, `react`, and their transitive trees into their production `node_modules` — dead weight for anyone who never sets up Claude Code assets.
- The workspace build chain still resolves `.bin/agents-build-hashes` from `devDependencies` at `yarn install` time; yarn workspaces link devDeps and deps identically for workspace-local builds.
- End users never rely on a hoisted `inject-agents-settings` bin. The canonical invocation is `npx @slats/agents-assets-sync --package=<THIS>`, which fetches the engine on demand and caches it.
- Bundle isolation is enforced by the import graph (`src/**` in the consumer never references the engine), not by dependency-type.

## Authoring `docs/agents/`

Any tree works, but the recommended layout matches Claude Code conventions:

```
docs/agents/
├── skills/
│   └── <skill-name>/
│       ├── SKILL.md
│       └── knowledge/...
├── rules/...
└── commands/...
```

Every file under the asset root is hashed and tracked in `dist/agents-hashes.json`.

## Hash-Based Sync Strategy (Option A)

- `dist/agents-hashes.json` (schema v1) is the source of truth whenever it is there. Without it, the asset root — the declared `agents.assetPath` or the one `--asset-path` names — is hashed at run time into the same document, so a package that has not been built is still injectable. A declared asset path with neither the manifest nor the directory present has no source at all: that target is reported and skipped.
- Per-file SHA-256 comparison:
  - **missing locally** → copy
  - **hash equal** → skip
  - **hash differs** → warn + require `--force` (user edit vs. source update is indistinguishable by design)
  - **file is outside the manifest but under a managed prefix (`skills/<name>/`)** → orphan; requires `--force` to delete

- `--force` on TTY opens an interactive confirm via Ink, listing diverged/orphan paths.
- `--force` on non-TTY prints the diverged and orphan paths it will overwrite or delete to stderr and proceeds. A run whose only change is deleting orphans is confirmed and listed the same way.
- At `--scope=project`, a destination that a symlink resolves outside the project is refused, naming the path; nothing is written or deleted there. This covers the destination roots (`.claude/skills`, `.claude/rules`, `.claude/commands`, `.agents/skills`, `AGENTS.md`), each skill directory, and every directory or file below them that the run writes. A link that stays inside the project is followed, and `--force` never deletes through a link. A repository can commit symlinks, so a cloned project could otherwise redirect writes and `--force` deletions anywhere. `--scope=user` follows such links on purpose: linking `~/.claude` to a dotfiles repository is a deliberate setup.

## Architectural Invariants

- `src/core/**` never reads consumer `package.json` or discovers installed packages. It reads asset and destination files for hashing, validation, planning and application. Only the `bin/` layer (and `src/commands/runCli/targets/resolvePackage.ts`, invoked from that dispatcher) is allowed to resolve a single explicitly-named target via `createRequire().resolve('${name}/package.json')`. Scope aliases are enumerated only by the dispatcher; `--all` is not supported.
- Input screens supply choices to the same core plan and executor used by plain and JSON output.
- All targets in one invocation share a run-wide plan and namespace merge.

## Programmatic API

```ts
import {
  computeNamespacePrefixes,
  isValidScope,
  readHashManifest,
  resolveProjectRoot,
  runCli,
} from '@slats/agents-assets-sync';
```

See `src/index.ts` and `src/DETAIL.md` for the full export surface.

## Additional Docs

- `docs/consumer-integration.md` — complete consumer checklist (package.json patches, verification steps, end-user install topologies)
- `docs/bundle-size-decision.md` — terminal renderer dependency decisions

## JSON Output

`--json` swaps in a third renderer that writes exactly one document to stdout
and diverts every diagnostic to stderr, so the whole stream parses:

```jsonc
{
  "schemaVersion": 1,
  "tool": "agents-assets-sync",
  "version": "0.1.0",
  "dryRun": true,
  "exitCode": 0,
  "errors": [],
  "failures": [],
  "notices": [],
  "units": [
    {
      "key": "codex:@canard/schema-form",
      "package": { "name": "@canard/schema-form", "version": "0.13.2" },
      "agent": "codex",
      "scope": "project",
      "projectRoot": "/repo",
      "destination": "/repo/.agents/skills + /repo/AGENTS.md (codex, project)",
      "requiresForce": false,
      "actions": [
        {
          "kind": "skip-uptodate",
          "relPath": "rules/schema-form-rule.md",
          "target": {
            "kind": "block",
            "fileAbs": "/repo/AGENTS.md",
            "blockId": "@canard/schema-form:rules/schema-form-rule.md",
          },
        },
      ],
      "report": {
        "created": [],
        "updated": [],
        "skipped": [],
        "warnings": [],
        "deleted": [],
        "exitCode": 0,
      },
    },
  ],
}
```

One `unit` per `(package, agent)` pair. A flag error becomes `errors` with
`exitCode: 2` and empty `units`, so a reader always has a document to parse.
A unit's `requiresForce` is `true` whenever applying it overwrites diverged
content or deletes orphans, with or without `--force`; without `--force` such a
unit blocks a non-preview run with exit code 2. A dry-run still exits 0.
Unresolvable packages and gate failures also produce one JSON document.
`failures` records each path, stage and reason; `notices` records suppressed deletions without counting them as applied work.

## License

MIT — see [LICENSE](./LICENSE).

## Known limits

- The programmatic API is ESM-only. Use ESM `import` or dynamic `import()` from CommonJS; `require()` is not exported. TypeScript `nodenext` may accept a CommonJS static import even though Node rejects it, so successful type-checking does not establish CommonJS compatibility.
- Shared skill namespaces are merged across all packages in one run. Invoke those packages together when using `--force`: no persistent file ownership ledger is kept, so a later single-package run cannot distinguish another package's files from orphans under its managed namespace. Conflicting contents at one destination fail the affected units without writing that file.
- Failed participants, including discovery and gate failures, protect every namespace they could own from orphan deletion. The output names the participant and reason, and suppressed deletions are excluded from force confirmation.
- Overwrites preserve mode, owner, group and hard links. A single-link file uses atomic replacement when its identity can be restored; otherwise writing stays in place and is not crash-atomic. Read-only targets and dangling write links are refused.
- A user-scope AGENTS.md symlink is followed only when its target exists. A dangling link is refused with an error and preserved, so the tool cannot silently replace a dotfiles link.

File orphan scans cover only skill namespaces present in the current manifest. Removed whole skills and Claude rule or command files remain installed, even with `--force`, because these files do not record which package owns them. Remove those retired files manually after checking their ownership. Codex and agents rules carry package-owned marker blocks, so retired blocks can be identified and removed with `--force`; this differs from Claude file cleanup.

### Markdown boundaries for rules

Rule sources must have closed fenced code blocks and HTML comments. A managed block cannot be placed after an unclosed fence or comment in `AGENTS.md`. The error identifies the file and opening line and asks you to close it; the entire affected unit is left unchanged while other units proceed. Close the source or document fence, then rerun normally. Rule bodies use the same BOM and line-ending normalization for validation, writing and comparison; other bytes and all user content outside managed blocks remain unchanged. Nested or unmatched managed markers are refused rather than repaired. Closed sequential duplicates are readable; a forced update keeps one current copy. Top-level backtick and tilde fences with up to three spaces of indentation are supported, including a longer closing fence. Fences inside blockquotes or list items, and fence syntax with tabs or four or more indentation spaces, are refused with a line-specific diagnostic; move these fences to the top level. Markers inside HTML comments are examples, not managed blocks.
