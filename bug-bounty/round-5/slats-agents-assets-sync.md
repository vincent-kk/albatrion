# @slats/agents-assets-sync: bug bounty round 5

11 new findings in `@slats/agents-assets-sync`: 2 medium and 9 low. Items in the documents of [round 1](../round-1/slats-agents-assets-sync.md), [round 2](../round-2/slats-agents-assets-sync.md), [round 3](../round-3/slats-agents-assets-sync.md) and [round 4](../round-4/slats-agents-assets-sync.md) were treated as fixed and excluded, together with the decisions and known limits of each round's `FIXES.md`. The main session re-ran every probe: the `r5-agents-assets-sync` folder ran 37 tests, of which 26 fail, and the `r5-rerun-others` folder ran 2 tests, of which 1 fails. Items 2, 3, 4 and 5 are regressions of earlier fixes; items 1, 6 and 8 repeat the watch-list point on the redesigned run plan and its output modes.

Probes: [probes/slats-agents-assets-sync/](probes/slats-agents-assets-sync/)

- Copy a folder back to `packages/slats/agents-assets-sync/src/__bounty__/<hunter-id>/` and run `yarn workspace @slats/agents-assets-sync test --run src/__bounty__/<hunter-id>/`. The probes run the source: `runCli` from `src/index.ts` through `runCliCode` in `src/__tests__/roundThree/fixture.ts`, the renderers and `InjectApp` from `src`, and `agents-build-hashes` as `scripts/agents-build-hashes.mjs` in a child process. Every fixture sits under `os.tmpdir()`, and user-scope probes point `HOME` at a temporary directory.
- Failing tests that are not findings: two diagnostics in `jsonTargetFlagErrors.test.ts` (a missing `agents.assetPath` and a package without source hashes also give no JSON document); they are evidence for item 6, not separate findings. `targetOrder.test.ts` and the controls pass.
- Earlier probes re-run (`r5-rerun-others`): round 1 ran 6 tests (0 fail), round 2 8 (3 fail), round 3 27 (2 fail), round 4 34 (3 fail); the earlier release probe `r4-contracts` ran 6 (3 fail). Every failure has a recorded role: the round 2 item 4 known limit on dropped rules and skills, the round 2 item 2 protection that now keeps a case-only renamed file with its old letter case (exit 0), round 3 items 11 and 14 and round 4 item 13 documentation fixes, the round 4 item 6 decision on a dangling dotfiles link, the round 4 item 14 known limit (ESM only), and listed diagnostics and measurements. No earlier item regressed.

Root-cause files: `packages/slats/agents-assets-sync/src/`

## 1. When one package in a shared skill namespace fails to plan, `--force` deletes its installed files as another package's orphans.

- Severity: medium. Files of a participating package are deleted outside its unit. It needs two packages that share `skills/<name>/` and a planning failure in one of them, which the 1.0.0 Markdown refusal makes easy; the files are installed copies that a rerun restores unless they were edited.
- Affected public API: `runCli` with several `--package` values or a scope alias, plus `--force`.
- Contract violated: `src/core/injectDocs/DETAIL.md:12` (shared namespaces are merged across the run, so other participants' files are not deleted as orphans); `README.md:266` (invoke packages together when using `--force`); `.changeset/assets-shared-run.md`.
- Root cause: `src/core/injectDocs/utils/session/prepareUnits/prepareUnits.ts:98-104` replaces a failed unit's plan with `{ actions: [] }` (after a manifest read error, a missing source, the Markdown check at `:89`, or a containment refusal); `src/core/injectDocs/utils/session/mergePlans.ts:8-16` builds the run-wide `managed` set from the surviving actions only, `:28-35` keep the healthy package's `delete` actions, and `executeUnits` applies them.
- Relation to earlier rounds: round 4 item 5, whose fixed input still holds.
- Reopens an earlier fix: round 4 item 5 (`75f6f064d`, `e429b0dfa`, `18652e69d`).
- Regression of an earlier fix: no.
- Watch list: yes, the planning stage of the redesigned run plan.
- Reproduction: `r5-agents-assets-sync/participantFailure.test.ts`: "runCli (two named packages): --force --yes keeps the files of a participant whose unit failed" and the scope-alias row give `{ first: 0, forced: 1, bKept: false }`; the plain, JSON and missing-source variants fail the same way; the controls pass.
- Confidence: high; public API from source.

## 2. A START marker whose END line is no longer recognized hides every later managed block, so each run appends another copy of the later rules and exits 0.

- Severity: medium. Idempotence breaks with no signal. It is triggered by commenting out a block with `<!--`, whose `-->` the END marker line closes, or by deleting an END line.
- Affected public API: `runCli` with `--agent=codex` or `agents`; `parseBlocks`.
- Contract violated: `src/DETAIL.md:99` (AC-ASSET-PATH-APPLY: runs are idempotent); `src/core/markerBlock/DETAIL.md:19` (`upsertBlock` never appends a second block with the same id); the round 4 decision that the common scan refuses ambiguous input.
- Root cause: `src/core/markerBlock/utils/scanDocument/scanDocument.ts:99-108`: a START sets `pending`, and later STARTs are ignored until an END with the same id; the scan ends with `pending` still set, records no later block and reports no issue (`:119-137` check only fences and comments). `buildPlan` then classifies the hidden blocks as `copy`, and `upsertBlock` appends them again.
- Relation to earlier rounds: round 4 item 1 and round 1 class 16.
- Reopens an earlier fix: round 4 item 1 (`b5edab847`, `19ef567b2`).
- Regression of an earlier fix: yes, case (b): round 4 `@slats/agents-assets-sync` item 1, commits `19ef567b2` (the pending model, for the deleted-END variant) and `b5edab847` (comment tracking, for the commented-out variant). The main session read the previous scanner (`git show 19ef567b2^:…/markerBlock/utils/scanBlocks.ts`): it matched only a complete START-to-END block at a line offset, so an unclosed START did not hide later blocks, and they were found.
- Watch list: no.
- Reproduction: `r5-agents-assets-sync/unclosedBlock.test.ts`: the commented-out variant gives `{ installed: 0, codes: [0, 0, 0], copiesOfB: 4 }` and the deleted-END variant `{ codes: [0, 0, 0], copiesOfB: 3 }`, expected `copiesOfB: 1`.
- Confidence: high; public API from source.

## 3. A rule whose source starts with a byte order mark and whose first line opens a fence passes the Markdown check, but the written block leaves `AGENTS.md` with an unclosed fence, after which every codex or agents run into that file exits 1.

- Severity: low. A rare input with a broad effect: once written, the file blocks other packages too.
- Affected public API: `runCli` with `--agent=codex` or `agents`.
- Contract violated: the round 4 decision that byte order marks, comment examples, lists and duplicate blocks are read with one model; `README.md:273`; `src/DETAIL.md:99`.
- Root cause: `src/core/markerBlock/utils/scanDocument/scanDocument.ts:12-17` skips a byte order mark only at offset 0; `validateUnitMarkdown.ts:38-41` and `upsertBlock` (`markerBlock.ts:81`) check the rule alone, where the mark is at offset 0; `markerBlock.ts:82-84` place the bytes after the START line, where the first line is no longer a fence opener and the END marker falls inside an open fence; nothing checks the finished document before `replaceDocument`.
- Relation to earlier rounds: round 2 item 5 and round 2 class 3.
- Reopens an earlier fix: round 4 item 1 (`2b2b08fd7`, `b5edab847`, `19ef567b2`, `7a53bffcf`).
- Regression of an earlier fix: yes, case (b): round 4 item 1 (`19ef567b2`, `b5edab847` and `2b2b08fd7` together). Before them the locator matched a whole block without reporting inner fences, so the second run was a no-op. This comparison is static: the hunter and the main session read the earlier code; it was not run.
- Watch list: no.
- Reproduction: `r5-agents-assets-sync/bomRuleSource.test.ts`: `{ first: 0, second: 1, documentIssue: 'AGENTS.md:5: Unclosed fenced code block…' }`, and another package's run then gives `{ first: 0, other: 1, otherInstalled: false }`; the control passes.
- Confidence: high for the behavior; static for the regression.

## 4. The atomic `AGENTS.md` rewrite breaks hard links and changes the file's group.

- Severity: low. A hard-linked `AGENTS.md` silently stops sharing content with its other name, and a file shared through a group loses that group.
- Affected public API: `runCli` rewriting an existing `AGENTS.md`.
- Contract violated: the round 4 item 6 decision, whose ground says the atomic write keeps the existing file's ownership and permissions; predictability.
- Root cause: `src/core/injectDocs/utils/replaceDocument.ts:51-58` writes a new file and renames it over the old one; only the mode is copied back (`:57`), with no `chown`.
- Relation to earlier rounds: round 4 item 6.
- Reopens an earlier fix: round 4 item 6 (`e0559e478`, `2ea348e22`, `b515285b8`).
- Regression of an earlier fix: yes, case (b): round 3 `@slats/agents-assets-sync` item 4, commit `b515285b8`, which replaced the in-place `writeFile` that kept the inode and the group. Static: the earlier code was read, not run.
- Watch list: no.
- Reproduction: `r5-agents-assets-sync/documentIdentity.test.ts`: the hard-link row gives `{ code: 0, nlink: 1, sameInode: false, claudeHasBlock: false }`, and the group row `{ code: 0, before: 12, after: 20 }` on macOS.
- Confidence: high for the behavior; static for the regression.

## 5. `agents-build-hashes` exits 1 for a package that opts out by not declaring `agents.assetPath`, while the packaged knowledge says it silently does nothing.

- Severity: low. A loud failure in a build step; no package in this repository is affected.
- Affected public API: the `agents-build-hashes` bin.
- Contract violated: `docs/agents/skills/agents-docs-asset-wiring/knowledge/package-json-patches.md:47` and `knowledge/gotchas.md:15`; `src/DETAIL.md:5` (the refusal is limited to a declared directory).
- Root cause: `scripts/agents-build-hashes.mjs:31-34` substitutes `'agents'` when the declaration is missing, and `scripts/buildHashes.mjs:57-59` now `stat`s that directory and throws on `ENOENT`.
- Relation to earlier rounds: round 4 item 9.
- Reopens an earlier fix: round 4 item 9 (`04ea9ed32`).
- Regression of an earlier fix: yes, case (b): round 4 `@slats/agents-assets-sync` item 9, commit `04ea9ed32`, which added `stat(assetRoot)`. The main session read the previous `buildHashes.mjs`: its `walk` returned on `ENOENT`, so an undeclared package wrote an empty manifest and exited 0.
- Watch list: no.
- Reproduction: `r5-agents-assets-sync/buildHashesOptOut.test.ts`: both opt-out cases give `{ status: 1, stderr: '❌ buildHashes failed: ENOENT … stat '<tmp>/agents'' }`; the control passes.
- Confidence: high.

## 6. With `--json`, an `--asset-path` that names no directory in the single named package, or that resolves outside it, exits 2 with an empty standard output.

- Severity: low. A consumer that parses the JSON document gets nothing to parse.
- Affected public API: `runCli` with `--json`, one `--package` and `--asset-path`.
- Contract violated: `README.md:251-257`; `src/DETAIL.md:15`, `:19` and `:21`. The JSDoc of `src/commands/runCli/flags/resolveAssetPathFlag.ts:13-15` is stale.
- Root cause: `src/commands/runCli/targets/resolvePackage.ts:104-118` calls `logger.error` and `process.exit(2)` before any renderer runs; round 4 item 8 moved only the shape checks (`runCli.ts:105-130`).
- Relation to earlier rounds: round 4 item 8.
- Reopens an earlier fix: no (`498276e3e`).
- Regression of an earlier fix: no.
- Watch list: yes, the output modes of the redesigned run plan (round 4 class 41).
- Reproduction: `r5-agents-assets-sync/jsonTargetFlagErrors.test.ts`: `{ code: 2, parses: false, exitCode: null }`; the control passes.
- Confidence: high.

## 7. A refused `AGENTS.md` rewrite, such as a read-only file or a dangling user-scope link, names no reason in any output mode.

- Severity: low. The run fails with exit 1, and the user has to find the cause alone, although the message exists.
- Affected public API: `runCli` in plain, JSON and terminal modes.
- Contract violated: `README.md:267`; `.changeset/assets-atomic-permissions.md`; the failures surface of the run report.
- Root cause: `src/core/injectDocs/utils/session/executeUnits.ts:53-58` catch with a bare `catch` and keep only the action list, and `:50-52` keep only the `status` of rejected actions; the message exists (`replaceDocument.ts:30` and `:50`).
- Relation to earlier rounds: round 2 item 1 and round 3 class 26.
- Reopens an earlier fix: no; `75f6f064d` and `18652e69d` moved round 2 item 1's path unchanged.
- Regression of an earlier fix: no.
- Watch list: no.
- Reproduction: `r5-agents-assets-sync/refusalReason.test.tsx`: plain, JSON and terminal modes, for a read-only file and a dangling link, give `{ code: 1, namesReason: false }`.
- Confidence: high.

## 8. On a terminal, an apply failure shows only `warnings 1` and `exit 1`, with no failed path, while plain and `--json` output name it.

- Severity: low.
- Affected public API: `runCli` in terminal (Ink) mode.
- Contract violated: `src/core/injectDocs/DETAIL.md:11` (one computed result for all displays); `.changeset/asset-sync-application-errors.md`.
- Root cause: `src/ui/hooks/useInjectSession.ts:98-106` sends `done` with the reports and exit code only; `src/ui/reducer/phaseReducer.ts:139-159` keeps the plans from before execution; `src/ui/InjectApp/InjectApp.tsx:188-194` lists only planning errors.
- Relation to earlier rounds: round 3 item 2 and round 4 class 41.
- Reopens an earlier fix: round 3 item 2 (`b7b626ce7`).
- Regression of an earlier fix: no; the earlier `useApplyStep` also sent only the reports.
- Watch list: yes, the terminal view of the redesigned run plan.
- Reproduction: `r5-agents-assets-sync/refusalReason.test.tsx`, "ink: an apply failure names the failed rule in the summary": `{ code: 1, namesPath: false }`.
- Confidence: high.

## 9. The terminal scope picker describes `project` as "nearest ancestor .claude (or cwd)", against the root-marker rule the command applies.

- Severity: low.
- Affected public API: the interactive scope picker of `inject-agents-settings`.
- Contract violated: `README.md:40`; `src/commands/runCli/runCli.ts:66-69`.
- Root cause: `src/ui/components/ScopePicker.tsx:21-25`; `findProjectRoot` (`src/core/scope/scope.ts:80-82`) checks the root markers first.
- Relation to earlier rounds: round 3 item 14 and round 4 item 13.
- Reopens an earlier fix: no (`0739a3fd2`).
- Regression of an earlier fix: no.
- Watch list: no.
- Reproduction: `r5-agents-assets-sync/scopePickerHint.test.tsx`: `{ pickedIsRepositoryRoot: true, hintPromisesNearestClaude: true }`.
- Confidence: high.

## 10. The Korean README's architectural invariants still promise one consumer per invocation.

- Severity: low (a misleading translation); the Korean known limits at `README-ko_kr.md:261` say the opposite.
- Affected public API: the documentation of `runCli` with several packages.
- Contract violated: `README.md:184-185`; `DOCUMENTATION.md` principle 4.
- Root cause: `README-ko_kr.md:229-233`; the round 4 commit `6f1302149` rewrote only the English lines.
- Relation to earlier rounds: round 4 item 12 and round 4 class 39.
- Reopens an earlier fix: no.
- Regression of an earlier fix: no.
- Watch list: no.
- Reproduction: `r5-agents-assets-sync/koreanReadme.test.ts`: `{ oneConsumerPerInvocation: true }`; the English control passes.
- Confidence: high; static.

## 11. The Korean README defines `projectRoot` by the old nearest-anchor rule.

- Severity: low (a misleading translation); the same file states the correct rule at `:97` and `:104`. A Korean reader running `--scope=project` inside a workspace member with its own `.claude` expects the install there, but the command installs at the root that owns `.git` or a lockfile.
- Affected public API: `inject-agents-settings --scope=project` (`runCli`) and `resolveProjectRoot`.
- Contract violated: `README.md:40`; `src/core/scope/scope.ts:59-80`; `DOCUMENTATION.md` principle 4.
- Root cause: `README-ko_kr.md:40`; the round 3 item 14 fixes `142eae648` and `db02fdf39` changed `README.md` only, and `6f1302149` (round 4 items 12 to 14) updated the Korean lines 97 and 104 but not line 40.
- Relation to earlier rounds: round 4 item 13 and round 3 item 14; round 4 class 39.
- Reopens an earlier fix: no; `git log -L 40,40` shows only `498276e3e`, the first commit.
- Regression of an earlier fix: no.
- Watch list: no.
- Reproduction: `r5-rerun-others/koreanProjectRoot.test.ts`, "the Korean sentence describes the root-marker precedence the code applies", fails; the control (with `<tmp>/package-lock.json` and `<tmp>/apps/web/.claude`, `resolveProjectRoot('project', '<tmp>/apps/web')` returns `<tmp>`) passes.
- Confidence: high; public API for the behavior, static for the text.

## Hypotheses checked and not bugs

- Target order and duplicate targets give the same results (`targetOrder.test.ts`); the interactive picker against arguments is pinned by the round 4 `runModelEquivalence.test.tsx`; alias units are de-duplicated as documented (the README JSON example omits `key` and `aliasOf`, a slip).
- A dangling `AGENTS.md` link at project scope is refused at plan time, with slightly different wording; `--dry-run --force` in plain mode prints the overwrite list.
- `@inquirer/prompts` statements are the round 1 known limit; the rule checks on the claude path are decided by the 1.0.0 major changeset.
- `skills/.gitkeep` installs as `.claude/skills/.gitkeep`, and `skills/.system/x` is refused; scanner edge cases (`* * *` as a list item, an empty list item with an indented fence) are decided refusals or exotic; symbolic links in the asset tree are skipped by both hash builders; case-variant namespace names are implausible; `--scope=project` under the home directory follows the documented anchor tier.
- After a case-only rename, the file and its content are kept; only the on-disk letter case stays as installed (the round 2 item 2 protection holds).
- The public declarations type-check without `@types/react`; `./buildHashes` has `scripts/buildHashes.d.mts`; `--version` prints 0.3.1, matching the manifest. `ink` 7 requires Node 22 or later, but the package declares no `engines` field and documents no Node version.
- Stale internal wording in `package-json-patches.md:33`, `smoke-tests.md:13` and the CLI description is below the quality bar.
