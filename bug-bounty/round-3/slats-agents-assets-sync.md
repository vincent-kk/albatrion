# @slats/agents-assets-sync: bug bounty round 3

This round confirmed 14 new findings in `@slats/agents-assets-sync`. Items in the earlier round documents ([round 1](../round-1/slats-agents-assets-sync.md), [round 2](../round-2/slats-agents-assets-sync.md)) were treated as fixed and excluded. The main session re-ran every probe. Verification limits are listed under the probes.

Probes: [probes/slats-agents-assets-sync/](probes/slats-agents-assets-sync/)

- From `r3-contracts`:
  - None. The checks below were static.
- From `r3-agents-assets-sync`:
  - Probe folder in the working tree: `packages/slats/agents-assets-sync/src/__bounty__/r3-agents-assets-sync/`; the round copy is `bug-bounty/round-3/probes/slats-agents-assets-sync/r3-agents-assets-sync/`.
  - To run the copy: copy it back to `packages/slats/agents-assets-sync/src/__bounty__/r3-agents-assets-sync/` and run `yarn workspace @slats/agents-assets-sync test --run src/__bounty__/r3-agents-assets-sync/`. One file runs with `yarn workspace @slats/agents-assets-sync test --run src/__bounty__/r3-agents-assets-sync/<file>`. The folder holds 27 tests: 23 fail, one or more for each item below, and 4 pass.
  - Failing tests that are not findings: none.
  - Control tests that pass: `names.test.ts` (both cases: unusual names install and re-run as no-ops for claude and codex), the second case of `interruptedWrite.test.ts` (a skill copy that fails midway leaves no partial file and the next run exits 0), and the "No, cancel" case of `inkCtrlC.test.tsx` (exits 2 and keeps the user edit).
  - Verification limits: The package's own end-to-end suites (`cli`, `json`, `assetPathRoundTrip`) skip themselves while files under `src/` are newer than `dist/`, and `dist/` is older than `src/` in this round. The probes therefore import `src/` directly, and `interruptedWrite.test.ts` runs `src/` in a child process through `node --import tsx` under `/bin/sh -c 'ulimit -f 16 …'`; that file-size limit is a fault injector that makes `write()` fail with `EFBIG` at a byte offset, which has the same shape as a full disk. The "path 3 (re-run) exits 0 for @winglet/json" test drives the built `bin/inject-agents-settings.mjs` against the real workspace package and depends on the local `dist/` state of both packages; the other stale-manifest tests are deterministic. Items 2, 3, 6, 9 and 10 use internal fixtures: `InjectApp` rendered with `ink-testing-library`, or `renderInjectApp` with only Ink's streams replaced by in-memory streams while `exitOnCtrlC` stays on. These are the code paths `runCli` takes on a terminal.

Root-cause files: `packages/slats/agents-assets-sync/`

## 1. A codex or agents run replaces every byte sequence in `AGENTS.md` that is not valid UTF-8 with U+FFFD, permanently destroying the user's own text outside the tool's blocks.

- Severity: high. A user whose `AGENTS.md` was saved in CP949 (the Korean Windows ANSI code page), Windows-1252, or UTF-16LE (the Windows PowerShell 5.1 default for `Out-File` and `>`) loses their hand-written text in one ordinary run, and the run exits 0.
- Affected public API: `runCli` with `--agent=codex` or `--agent=agents` when the package ships rules.
- Contract violated: `packages/slats/agents-assets-sync/README.md:60` (everything outside the tool's blocks "is carried through byte for byte"), `packages/slats/agents-assets-sync/src/DETAIL.md:97` (AC-ASSET-PATH-APPLY: content outside the markers is preserved byte for byte), and `packages/slats/agents-assets-sync/src/core/DETAIL.md:14`.
- Root cause: `packages/slats/agents-assets-sync/src/core/injectDocs/utils/applyBlockActions.ts:24` decodes the document as `'utf-8'` and `packages/slats/agents-assets-sync/src/core/injectDocs/utils/applyBlockActions.ts:44` encodes it back as `'utf-8'`. Decoding replaces every invalid byte sequence with U+FFFD, so the bytes outside the blocks cannot survive the round trip. The plan-time reader at `packages/slats/agents-assets-sync/src/core/buildPlan/utils/readDocument.ts:22` decodes the same way.
- Relation to earlier rounds: Same class as `../round-1/slats-agents-assets-sync.md` item 4 (CRLF) and `../round-2/slats-agents-assets-sync.md` item 5 (BOM), the encoding-variant class, in a different function.
- Reopens an earlier fix: No.
- Reproduction: `agentsMdBytes.test.ts`, the three cases of "a %s AGENTS.md keeps its own bytes after a rule block is added". For CP949 the leading bytes change from `2320c6c020b8deb8f0…` to `2320efbfbdefbfbd20efbfbd…` and the exit code is 0; Windows-1252 and UTF-16LE fail the same way. Expected: the original bytes before the appended block are unchanged.
- Confidence: high; public API (`runCli` run in-process).

## 2. On a terminal, a unit whose plan fails is silently dropped and the run exits 0, and a run in which every unit fails to plan exits 2 instead of 1.

- Severity: high. A failure is reported as success: a terminal user, and any script around the command, sees exit 0 although a package was not injected at all, while the same input exits 1 under the plain renderer and under `--json`. Plan failures include a truncated `dist/agents-hashes.json` left by an interrupted build, a manifest key with a `..` segment, a refused symlinked destination, and the placeholder file of ITEM 7.
- Affected public API: `runCli` on an interactive terminal without `--no-interactive` or `--json`.
- Contract violated: `packages/slats/agents-assets-sync/src/DETAIL.md:5` (renderers do not judge targets again, so the exit code does not depend on the output mode) and `packages/slats/agents-assets-sync/README.md:106` (exit code 1 is a runtime error).
- Root cause: `packages/slats/agents-assets-sync/src/ui/hooks/usePlanStep.ts:124-133` turns a thrown error into a `status: 'failed'` step and leaves the pair out of `results`. `packages/slats/agents-assets-sync/src/ui/hooks/useApplyStep.ts:83-84` derives the exit code from the applied plans only, and `packages/slats/agents-assets-sync/src/ui/hooks/useInjectSession.ts:79-86` sends exit code 2 when no plan is left.
- Relation to earlier rounds: Same class as `../round-2/slats-agents-assets-sync.md` item 3 (an exit code that depends on the output mode), and also of `../round-2/slats-agents-assets-sync.md` item 1 (errors that vanish between the work and the report).
- Reopens an earlier fix: Round 2 item 3, fix commit `30e6d4e5b`. That commit changed only `renderPlain` and `renderJSON`; the Ink path still drops plan failures and exits 0, so the contract stands and the fix is incomplete.
- Reproduction: `inkExitCodes.test.tsx`. "a unit whose plan fails (partial manifest) beside a good unit exits 1 on the TTY path too": actual `{ plain: 1, ink: 0 }` with the good unit applied on both paths, expected `{ plain: 1, ink: 1 }`. "a run whose only unit fails to plan exits 1 (runtime error) on the TTY path too": actual `{ plain: 1, ink: 2 }`, expected `{ plain: 1, ink: 1 }`.
- Confidence: high; internal fixture (`InjectApp` rendered with `ink-testing-library`, `renderPlain` called directly).

## 3. On a terminal, `--asset` and `--agent` values are not validated, so a typo such as `--asset=rule` widens the run to every kind and `--force --yes` overwrites user edits in kinds the user meant to exclude.

- Severity: medium. A terminal user who types `--asset=rule` to refresh only rules gets skills, rules and commands planned and applied, with exit 0, and with `--force --yes` a locally edited skill is overwritten; `--agent=claude,codx` runs claude alone without an error. The plain and `--json` renderers reject both inputs with exit 2.
- Affected public API: `runCli` on an interactive terminal.
- Contract violated: `packages/slats/agents-assets-sync/src/DETAIL.md:19` (invalid `--agent` and `--asset` values exit 2) and `packages/slats/agents-assets-sync/README.md:96` (an excluded kind is absent from the plan, so it is neither reported nor deleted).
- Root cause: Only `packages/slats/agents-assets-sync/src/commands/runCli/renderers/renderPlain.ts:63-64` and `packages/slats/agents-assets-sync/src/commands/runCli/renderers/renderJSON.ts:82-83` validate these flags, and the `runCli` action does not. `packages/slats/agents-assets-sync/src/ui/hooks/useInjectSession.ts:38-45` assumes the command layer already rejected unknown values, filters them out, and turns the resulting empty set into every kind; `packages/slats/agents-assets-sync/src/ui/hooks/useResolveStep.ts:30` silently drops unknown agents.
- Relation to earlier rounds: Same class as `../round-2/slats-agents-assets-sync.md` item 3 (a verdict that depends on the renderer).
- Reopens an earlier fix: No.
- Reproduction: `inkFlagValidation.test.tsx`. "--asset=rule (a typo for rules) with --force --yes is rejected, not widened to every kind": actual `{ plain: 2, ink: 0, skillEditKept: { plain: true, ink: false } }`, expected exit 2 on both paths and the edit kept. "--agent=claude,codx (a typo) is rejected on the TTY path too": actual `{ plain: 2, ink: 0 }`, expected `{ plain: 2, ink: 2 }`.
- Confidence: high; internal fixture.

## 4. A failed or interrupted rewrite of `AGENTS.md` leaves the file truncated, losing the user's text outside the tool's blocks.

- Severity: medium. When the disk fills up, or the process is stopped by Ctrl-C or a CI timeout while the file is being written, the end of the user's `AGENTS.md` text is lost; exit code 1 is reported, but the text cannot be recovered. The loss needs such a fault, which is why this is not rated higher.
- Affected public API: `runCli` with `--agent=codex` or `--agent=agents` when the package ships rules.
- Contract violated: `packages/slats/agents-assets-sync/src/DETAIL.md:97` and `packages/slats/agents-assets-sync/src/core/DETAIL.md:14` (content outside the markers is preserved byte for byte), and `packages/slats/agents-assets-sync/README.md:60`.
- Root cause: `packages/slats/agents-assets-sync/src/core/injectDocs/utils/applyBlockActions.ts:44` calls `writeFile(fileAbs, content)`, which truncates the original file before writing in place. There is no atomic replacement through a temporary file and a rename, so a failure partway leaves a truncated file. The known limit in `packages/slats/agents-assets-sync/src/core/DETAIL.md:14` covers only blocks lost when two concurrent runs each persist their own read ("the later write wins"); a concurrent run that reads the file while it is truncated would also lose the user's text through the same root cause, which goes past that limit (not reproduced).
- Relation to earlier rounds: New class (a non-atomic rewrite of a shared document).
- Reopens an earlier fix: No.
- Reproduction: `interruptedWrite.test.ts`, "a failed AGENTS.md rewrite leaves the hand-written prose outside the blocks intact". A child process runs `runCli` from `src/` under `ulimit -f 16`; the run exits 1 and the file shrinks from 32807 bytes to 16384 bytes, so it no longer starts with the original text. Expected: the original text is intact.
- Confidence: high; public API run from source in a child process with fault injection.

## 5. When the built manifest is older than the asset files, every run after the first reports the tool's own copies as user edits and exits 2, and the install never converges, even after `--force`.

- Severity: medium. Idempotence breaks and the tool falsely blames the user for edits. In this repository, 8 of the 9 packages that ship `dist/agents-hashes.json` currently have a manifest older than their `docs/agents`, and path 3 of the packaged smoke test fails on `@winglet/json`. Published packages rebuild their hashes in `prepublishOnly`, so the case mainly arises in a workspace or after docs are edited without a rebuild.
- Affected public API: `runCli`, for both claude files and codex or agents blocks.
- Contract violated: `packages/slats/agents-assets-sync/src/DETAIL.md:97` (a repeated run is idempotent) and path 3 at `packages/slats/agents-assets-sync/docs/agents/skills/agents-docs-asset-wiring/knowledge/smoke-tests.md:46` ("Re-run — no-op (idempotent)", expected exit 0).
- Root cause: `packages/slats/agents-assets-sync/src/core/buildPlan/buildPlan.ts:77-79` compares the destination with the manifest hash, but `packages/slats/agents-assets-sync/src/core/injectDocs/utils/applyAction.ts:26` (and `packages/slats/agents-assets-sync/src/core/injectDocs/utils/applyBlockActions.ts:39` for blocks) copies the current source file. When the source differs from the manifest, what the run just wrote always differs at the next comparison. `packages/slats/agents-assets-sync/src/commands/runCli/targets/resolveHashSource.ts:40-41` chooses the manifest whenever it exists, even though the asset directory is present.
- Relation to earlier rounds: New class (the verdict hash and the applied bytes come from different sources).
- Reopens an earlier fix: No.
- Reproduction: `staleManifest.test.ts`. The two cases "a claude install …" and "a codex install from a stale manifest converges instead of reporting its own copy as a user edit": actual `{ first: 0, second: 2, forced: 0, afterForce: 2 }`, expected 0 for every run. "path 3 (re-run) exits 0 for @winglet/json", run with the built bin: actual `{ path2: 0, path3: 2, path3Diverged: 3 }`, expected `{ path2: 0, path3: 0, path3Diverged: 0 }`.
- Confidence: high for the behavior; public API for the synthetic cases and built dist for the workspace case.

## 6. On a terminal, a run that needs `--force` but was not given it exits 1 instead of 2 and applies none of its other, unblocked units.

- Severity: medium. For the same input, the exit code and the files written depend on the output mode: a terminal user sees a runtime error (1) with nothing installed, not even the packages that had no divergence, while the plain and `--json` renderers apply the unblocked units and exit 2.
- Affected public API: `runCli` on an interactive terminal.
- Contract violated: `packages/slats/agents-assets-sync/src/DETAIL.md:5`, `packages/slats/agents-assets-sync/README.md:255-257` ("without `--force` such a unit blocks the run with exit code 2"), and `packages/slats/agents-assets-sync/README.md:106`.
- Root cause: `packages/slats/agents-assets-sync/src/ui/hooks/useForceConfirmStep.ts:30-39` sends `fail` for the whole run when any plan has `requiresForce`. The error phase in `packages/slats/agents-assets-sync/src/ui/InjectApp/InjectApp.tsx:46-49` fixes the exit code at 1.
- Relation to earlier rounds: Same class as `../round-2/slats-agents-assets-sync.md` item 3.
- Reopens an earlier fix: No. Commits `78c73840d` and `14fbb3aaa` touched these lines while fixing `../round-1/slats-agents-assets-sync.md` items 6, 2 and 3, and those behaviors still hold.
- Reproduction: `inkExitCodes.test.tsx`. "a diverged install without --force exits 2 (blocked) on the TTY path too": actual `{ plain: 2, ink: 1 }`, expected `{ plain: 2, ink: 2 }`. "a clean unit beside a blocked unit is applied on the TTY path as on the plain path": actual `{ plain: 2, ink: 1, cleanApplied: { plain: true, ink: false } }`, expected exit 2 and the clean unit applied on both paths.
- Confidence: high; internal fixture.

## 7. One placeholder file such as `rules/.gitkeep` or `commands/.gitkeep` stops the whole package from being injected, with exit code 1.

- Severity: medium. A consumer that keeps an empty directory in git with a `.gitkeep` file gets none of its skills or rules installed, for any agent. The hash builder puts the file in the manifest, because its noise list holds only `.omc`, `.DS_Store` and `*.log`.
- Affected public API: `runCli` and `resolveDestinations`.
- Contract violated: `packages/slats/agents-assets-sync/src/core/DETAIL.md:10` and `packages/slats/agents-assets-sync/src/core/agentTarget/DETAIL.md:14` limit the reserved-name refusal to skill directories whose first segment starts with a dot (Codex's `skills/.system/`); the existing test pins only `skills/.system/`.
- Root cause: `packages/slats/agents-assets-sync/src/core/agentTarget/utils/resolveDestinations.ts:57` calls `assertNotReserved(kind, rest)` for every kind, and `packages/slats/agents-assets-sync/src/core/agentTarget/utils/resolveDestinations.ts:116-121` throws for a dot-prefixed file as well, which aborts the whole unit. The check also runs before the unsupported-kind branch, so codex fails on `commands/.gitkeep` too.
- Relation to earlier rounds: Sibling of `../round-1/slats-agents-assets-sync.md` item 5 (one incidental file blocks the entire run).
- Reopens an earlier fix: No. Commit `46b3b2242` (the fix for `../round-1/slats-agents-assets-sync.md` item 1) touched the neighboring lines, and its `..` refusal still holds.
- Reproduction: `dotEntries.test.ts`, the three cases of "%s: a package shipping %s still installs its skill and rule" (claude with `rules/.gitkeep`, codex with `rules/.gitkeep`, claude with `commands/.gitkeep`). Actual `{ code: 1, skillInstalled: false, ruleInstalled: false }`, expected `{ code: 0, skillInstalled: true, ruleInstalled: true }`.
- Confidence: high; public API.

## 8. A diverged file that `--force` actually overwrote is reported as an unapplied "diverged" warning, never as "updated", so the report matches the one from a blocked run.

- Severity: low. An agent reading `--json`, and a user reading the Ink summary ("updated 0, warnings 1"), cannot tell whether the overwrite happened.
- Affected public API: the `report` of each unit in `--json` and the public type `InjectReport.updated`.
- Contract violated: `InjectReport` at `packages/slats/agents-assets-sync/src/core/injectDocs/DETAIL.md:30` and the `updated` field in the JSON example at `packages/slats/agents-assets-sync/README.md:242`; no code ever fills that field.
- Root cause: `packages/slats/agents-assets-sync/src/core/injectDocs/utils/summarize.ts:38-39` files every `warn-diverged` action under `warnings` whether or not `--force` applied it, and `updated` is created empty at `packages/slats/agents-assets-sync/src/core/injectDocs/utils/summarize.ts:22` and never filled.
- Relation to earlier rounds: Sibling of `../round-2/slats-agents-assets-sync.md` item 1 (the report must state what actually happened).
- Reopens an earlier fix: No. Commit `02c29170e` added failure reporting to the same function, and failures are still reported.
- Reproduction: `forceReport.test.ts`, "a diverged file that --force overwrote is reported as updated, not as an unapplied divergence". Actual forced report `{ updated: [], warnings: [{ relPath: 'skills/d/SKILL.md', reason: 'diverged' }] }`, identical to the blocked report; expected `updated: ['skills/d/SKILL.md']` and no diverged warning.
- Confidence: high; public API.

## 9. Cancelling the terminal `--force` dialog with Ctrl-C exits 0, while choosing "No, cancel" exits 2.

- Severity: low. The same cancellation is reported as success. A wrapping script such as a make recipe receives no SIGINT, because the terminal is in raw mode, and goes on to its next step. The agent and scope pickers exit the same way.
- Affected public API: `runCli` on an interactive terminal.
- Contract violated: `packages/slats/agents-assets-sync/README.md:106` (exit code 0 means success), and predictability: the same intent should give the same result.
- Root cause: `packages/slats/agents-assets-sync/src/ui/InjectApp/utils/renderInjectApp.tsx:7` starts with `exitCode = 0`, and the `exitOnCtrlC: true` option at `packages/slats/agents-assets-sync/src/ui/InjectApp/utils/renderInjectApp.tsx:15` ends `waitUntilExit` without calling `onExit`, so the initial value is returned.
- Relation to earlier rounds: New instance of the round 2 class of errors that vanish or state that sticks (class 8 in the round 3 brief).
- Reopens an earlier fix: No.
- Reproduction: `inkCtrlC.test.tsx`, "pressing Ctrl-C at the --force dialog applies nothing and exits non-zero": actual exit code 0, expected 2. The control case "answering "No, cancel" …" passes with exit code 2.
- Confidence: high; internal fixture (only Ink's streams replaced, `exitOnCtrlC` kept).

## 10. The `--force` dialog footer advertises "y:accept · n:cancel", but neither key has a handler, so pressing `n` does nothing.

- Severity: low. A user who presses `n` to cancel, as the footer says, sees no response; if they then press Enter, the default highlighted choice "Yes" is applied. The diff-review footer "a:accept all warn · esc:cancel" has no handlers either.
- Affected public API: `runCli` on an interactive terminal.
- Contract violated: the on-screen key hints at `packages/slats/agents-assets-sync/src/ui/components/Footer.tsx:17` and `packages/slats/agents-assets-sync/src/ui/components/Footer.tsx:19`.
- Root cause: The only input handlers under `packages/slats/agents-assets-sync/src/ui/` are the `useInput` in `AgentPicker` and the `ink-select-input` list, which reacts to arrows, `j` and `k`, digits and Enter. No component handles `y`, `n`, `a` or Escape.
- Relation to earlier rounds: New instance of the round 1 class of documented examples, configurations or controls that do not work (class 19 in the round 3 brief).
- Reopens an earlier fix: No.
- Reproduction: `inkCtrlC.test.tsx`, "pressing "n" as the footer hint says at the --force dialog applies nothing and exits non-zero": actual result `timeout` (the dialog is still waiting after 2 seconds), expected exit code 2.
- Confidence: high; internal fixture.

## 11. The README's Programmatic API import fails when used literally, because three of the names it imports are not exported.

- Severity: low. A consumer who copies the example gets an ESM link error for `injectDocs`, `isInteractive` and `resolveScope`.
- Affected public API: the package entry `@slats/agents-assets-sync`.
- Contract violated: `packages/slats/agents-assets-sync/README.md:189-199`. The actual entry is `packages/slats/agents-assets-sync/src/index.ts:2-26`, and the package `CLAUDE.md` states that there is no `injectDocs` orchestrator.
- Root cause: The README example lists names the entry point does not export.
- Relation to earlier rounds: New instance of the round 1 class of documented examples, configurations or controls that do not work (class 19 in the round 3 brief).
- Reopens an earlier fix: No.
- Reproduction: `documentedExamples.test.ts`, "every name in the README Programmatic API import is exported by the package entry". Actual missing names `['injectDocs', 'isInteractive', 'resolveScope']`, expected none. A static addition, not reproduced: the `"@slats/agents-assets-sync": "workspace:^"` dependency at `packages/slats/agents-assets-sync/README.md:122` and `packages/slats/agents-assets-sync/docs/consumer-integration.md:16` fails to install when a consumer outside this monorepo copies it.
- Confidence: high; public API (the source entry point).

## 12. `agents-build-hashes` fails with exit code 1 on a `package.json` that starts with a UTF-8 BOM, which the injector now reads.

- Severity: low. The documented build step `"build:hashes": "agents-build-hashes"` fails for a consumer whose `package.json` the injector itself accepts.
- Affected public API: the `agents-build-hashes` bin.
- Contract violated: consistency with the injector and with Node's `require`, which accept the same file; this is the spec that `../round-2/slats-agents-assets-sync.md` item 5 established.
- Root cause: `packages/slats/agents-assets-sync/scripts/agents-build-hashes.mjs:20-22` calls `JSON.parse` on the raw text without removing the BOM.
- Relation to earlier rounds: Sibling of `../round-2/slats-agents-assets-sync.md` item 5, in a different function.
- Reopens an earlier fix: No. Commit `caf9076f8` fixed only `resolvePackage` and `resolveScopeAlias`.
- Reproduction: `documentedExamples.test.ts`, "agents-build-hashes accepts a package.json with a UTF-8 BOM, as the injector does". Actual `{ status: 1, written: false }` with the stderr message "Unexpected token … is not valid JSON"; expected status 0 and a written manifest.
- Confidence: high; the shipped script run in a child process.

## 13. A scope-alias run silently drops a scope member whose `package.json` is truncated, such as one left by an interrupted install, and exits 0 without a reason.

- Severity: low. A member without `agents.assetPath` leaves its reason in the `--json` `errors`, but a truncated member leaves neither a warning nor a reason; naming the same package directly fails with exit 1.
- Affected public API: `runCli` with a scope alias such as `--package=@scope`.
- Contract violated: `packages/slats/agents-assets-sync/src/DETAIL.md:17` and `packages/slats/agents-assets-sync/src/DETAIL.md:56` (AC-JSON: the reason for every skipped target is carried in `errors`, so a reader can tell an empty run from a crash).
- Root cause: `packages/slats/agents-assets-sync/src/commands/runCli/targets/resolveScopeAlias.ts:91-95` catches the parse error and continues without warning or recording a reason.
- Relation to earlier rounds: New instance of the round 2 class of errors that vanish or state that sticks (class 8 in the round 3 brief).
- Reopens an earlier fix: No. Commit `caf9076f8` changed the parse line inside the same `try`, but the silent `catch` predates it.
- Reproduction: `scopeAliasPartial.test.ts`, "a scope member whose package.json is truncated is reported in errors, like a member without agents.assetPath". Actual `{ exitCode: 0, units: 1, mentionsPlain: true, mentionsPartial: false }`, expected `mentionsPartial: true`.
- Confidence: high; public API.

## 14. Three consumer-facing documents describe project-root resolution as "the nearest `.claude` or agent anchor", so the smoke test's `touch AGENTS.md` does not pin the root when an ancestor owns a root marker.

- Severity: low. An agent following the packaged smoke test writes `.claude` into an ancestor directory instead of `$DIR` whenever an ancestor owns `.git` or a lockfile.
- Affected public API: `runCli` with `--scope=project`, and `resolveProjectRoot`.
- Contract violated: `packages/slats/agents-assets-sync/docs/agents/skills/agents-docs-asset-wiring/knowledge/smoke-tests.md:34` ("`touch AGENTS.md` pins the project root to `$DIR`"), `packages/slats/agents-assets-sync/README.md:101`, `packages/slats/agents-assets-sync/README.md:108`, and the "Scope resolution (project)" section of `packages/slats/agents-assets-sync/docs/consumer-integration.md`. They contradict `packages/slats/agents-assets-sync/README.md:40` and the code, in which a root marker outranks a nearer agent anchor.
- Root cause: `packages/slats/agents-assets-sync/src/core/scope/scope.ts:80-82` (`findProjectRoot`) checks root markers before agent anchors, and the three documents still describe the older nearest-anchor rule.
- Relation to earlier rounds: New instance of the round 1 class of documented examples, configurations or controls that do not work (class 19 in the round 3 brief).
- Reopens an earlier fix: No.
- Reproduction: `documentedExamples.test.ts`, "the smoke-test setup (`touch AGENTS.md` in $DIR) pins --scope=project to $DIR". Actual: `resolveProjectRoot('project', dir)` returns the outer directory that owns `.git` and `package-lock.json`; expected `dir`.
- Confidence: high; public API compared against the documents.

## Hypotheses checked and not bugs

- From `r3-contracts`:
  - The dispatcher resolves a target package whose `exports` omit `./package.json` by resolving its main entry and walking up to the matching manifest (`packages/slats/agents-assets-sync/src/commands/runCli/targets/resolvePackage.ts:210-244`), so the sixteen packages, none of which exports `./package.json` except this one, are injectable.
  - `knowledge/package-json-patches.md:105` names `@inquirer/prompts` among the engine's dependencies although the engine uses Ink; this is the known README limit of `../round-1/FIXES.md` and does not change what a reader does.
- From `r3-agents-assets-sync`:
  - Asset names with spaces, `a..b`, Korean text, emoji, `%20`, `#`, `:`, and 240-character file names install for claude and codex, and the re-run is a no-op.
  - A file copy that fails midway leaves no partial destination, because libuv removes it, so the next run converges; the tool creates no temporary files, so none are left after a failure.
  - Answering "No, cancel" in the `--force` dialog exits 2 and keeps the user's edit.
  - A truncated manifest, or one without `files`, fails loudly with exit 1 in the plain and `--json` renderers; only the Ink path hides it (ITEM 2).
  - A malformed `package.json` of a package named directly fails with exit 1.
  - Published consumer packages in this repository rebuild their hashes in `prepublishOnly: yarn build`, so ITEM 5 mainly arises in a workspace or after docs are edited without a rebuild.
  - Two concurrent runs losing each other's block writes is the known limit in `packages/slats/agents-assets-sync/src/core/DETAIL.md:14` and was not reported.
  - `smoke-tests.md` still says that with two agents a blocked path aggregates to exit 1; after the round 2 item 3 fix both report 2. The statement no longer changes what a reader does, so it is not reported.

## Open leads

- From `r3-agents-assets-sync`:
  - A concurrent run that reads `AGENTS.md` while another run has truncated it, which would lose the user's text through the root cause of ITEM 4, was not reproduced.
  - The round 2 open lead about two packages in one scope alias that ship the same `skills/<name>/` namespace was not probed.
