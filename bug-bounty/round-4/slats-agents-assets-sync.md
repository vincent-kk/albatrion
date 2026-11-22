# @slats/agents-assets-sync: bug bounty round 4

This round confirmed 14 new findings in `@slats/agents-assets-sync`: 5 medium and 9 low. Items in the earlier round documents ([round 1](../round-1/slats-agents-assets-sync.md), [round 2](../round-2/slats-agents-assets-sync.md), [round 3](../round-3/slats-agents-assets-sync.md)) were treated as fixed and excluded. The main session re-ran every probe: the `r4-agents-assets-sync` folder ran 34 tests, of which 32 fail and 2 pass, and the `r4-contracts` folder ran 6 tests, of which 3 fail and 3 pass.

Probes: [probes/slats-agents-assets-sync/](probes/slats-agents-assets-sync/)

- From `r4-agents-assets-sync`:
  - Probe folder in the working tree: `packages/slats/agents-assets-sync/src/__bounty__/r4-agents-assets-sync/`; the round copy is `bug-bounty/round-4/probes/slats-agents-assets-sync/r4-agents-assets-sync/`.
  - To run the copy: copy it back to `packages/slats/agents-assets-sync/src/__bounty__/r4-agents-assets-sync/` and run `yarn workspace @slats/agents-assets-sync test --run src/__bounty__/r4-agents-assets-sync/`. One file runs with `yarn workspace @slats/agents-assets-sync test --run src/__bounty__/r4-agents-assets-sync/<file>`. The probes import the round 3 fixture at `packages/slats/agents-assets-sync/src/__tests__/roundThree/fixture.ts`, so that file must still exist. No probe-local Vitest configuration is needed.
  - Failing tests that are not findings:
    - `markerContext.test.ts`, "a START marker line with trailing spaces is still recognized (no duplicate block)", is a diagnostic. A START marker line that ends with spaces is not recognized, and the run appends a second block with the same id (actual `{ code: 0, starts: 2 }`). This is the same class as [round 1 item 4](../round-1/slats-agents-assets-sync.md), but no tool that writes trailing spaces after a marker line was identified, so it is not reported as a finding.
    - `scale.test.ts`, "measurement: time per block stays flat as the block count grows", is a measurement. Planning and applying 250 blocks of 2 KB took 60 milliseconds, and 1,000 blocks took 1,131 milliseconds. The growth is close to quadratic, because every block is located by a scan from the start of the document, but realistic block counts stay far below the point where it matters.
  - Control tests that pass:
    - `documentRewrite.test.ts`, "control: a link whose dotfiles target exists stays a link".
    - `documentRewrite.test.ts`, "a block write keeps AGENTS.md mode 416": mode 0640 survives the rewrite under umask 022.
  - Verification limits: Every package's `dist` in the working tree was older than the round 1 to 3 fixes, so no probe uses `dist` or the built bin. The probes drive the source: `runCli` from `packages/slats/agents-assets-sync/src/index.ts` in-process, which takes the plain renderer because the test process has no terminal, or the renderers and `InjectApp` directly. The package's `src` imports only types from other workspaces, so no other package's `dist` is read. The package's own end-to-end suites (`cli`, `json`, `assetPathRoundTrip`) skip themselves while `dist` is older than `src`. The user-scope probes in `documentRewrite.test.ts` point `HOME` at a temporary directory inside the test. Item 10's claim about a real terminal run rests on React loading its development build whenever `NODE_ENV` is not `production`; that part is static reasoning, and the probe observes the warnings under Vitest.
- From `r4-contracts`:
  - Probe folder in the working tree: `packages/slats/agents-assets-sync/src/__bounty__/r4-contracts/`; the round copy is `bug-bounty/round-4/probes/slats-agents-assets-sync/r4-contracts/`.
  - To run the copy: copy it back to `packages/slats/agents-assets-sync/src/__bounty__/r4-contracts/` and run `yarn workspace @slats/agents-assets-sync test --run src/__bounty__/r4-contracts/contracts.test.ts`. No probe-local configuration is needed.
  - Failing tests that are not findings: none. The three failing tests reproduce items 12, 13 and 14.
  - Control tests that pass:
    - "control: every name in the English README Programmatic API import is exported", for item 12.
    - "the site pages promise the nearest existing .claude walking up from cwd", a companion of item 13 that confirms all seven pages carry the sentence.
    - "control: without a root marker the nearest existing .claude is chosen", for item 13.
  - Verification limits: the probes import the source entry `packages/slats/agents-assets-sync/src/index.ts`, and every fixture and consumer lives in a temporary directory under `os.tmpdir()`. Item 14 is static at the manifest level: Node's `require` fails while it resolves `exports`, before it reads any file, and the TypeScript side type-checks the consumer against the stale `dist/index.d.ts`; the result depends on which file TypeScript resolves, not on that file's content.

Root-cause files: `packages/slats/agents-assets-sync/` for items 1 to 12 and 14; the documentation site pages under `documents/docs/` for item 13.

## 1. A copy of the README marker example inside a code fence of the user's `AGENTS.md` is taken as the tool's own block: without `--force` every run is blocked, and with `--force` the example is overwritten or deleted.

- Severity: medium. A team that documents the managed blocks in its own `AGENTS.md`, by quoting the README example in a fenced code block, loses that text outside the tool's blocks. The loss needs `--force`, which is why this is not rated higher. In detail:
  - Without `--force`, every codex or agents run exits 2 with "local differs from source (user edit or version change)", although the user never edited a block.
  - With `--force`, the example inside the fence is replaced by the real rule body, which then sits inside the fence and reads as a code sample; no real block is ever added.
  - When the example's id names a rule that the package does not ship, `--force` treats the example as an orphan and deletes it.
- Affected public API: `runCli` with `--agent=codex` or `--agent=agents` when the package ships rules.
- Contract violated:
  - `packages/slats/agents-assets-sync/README.md:60` states that everything outside the tool's own blocks, including hand-written prose, is carried through byte for byte.
  - `packages/slats/agents-assets-sync/src/core/markerBlock/DETAIL.md:8` and `packages/slats/agents-assets-sync/src/DETAIL.md:97` state the same for the block writer.
  - The content of a fenced code block is literal text, not an HTML comment ([CommonMark 0.31.2, section 4.5 "Fenced code blocks"](https://spec.commonmark.org/0.31.2/#fenced-code-blocks)).
  - The quoted example is `packages/slats/agents-assets-sync/README.md:54-58`, and its id `@canard/schema-form:rules/schema-form-rule.md` names a rule that `@canard/schema-form` actually ships.
- Root cause:
  - The block patterns at `packages/slats/agents-assets-sync/src/core/markerBlock/utils/markerLine.ts:28-29` are not anchored to a line start and do not know about Markdown code fences.
  - `parseBlocks` (`packages/slats/agents-assets-sync/src/core/markerBlock/markerBlock.ts:37-53`) and `locateBlock` (`packages/slats/agents-assets-sync/src/core/markerBlock/markerBlock.ts:143-159`) accept the first match in the document as the block.
  - As a result, `packages/slats/agents-assets-sync/src/core/buildPlan/buildPlan.ts:92-96` judges the example `warn-diverged`, and `packages/slats/agents-assets-sync/src/core/buildPlan/buildPlan.ts:120-129` judges an example with an unshipped id an orphan.
- Relation to earlier rounds: Same class as [round 1](../round-1/README.md) class 16 and [round 3](../round-3/README.md) class 28, scanners that ignore lexical context or token boundaries. New in this package.
- Reopens an earlier fix: No. `git log -L` on the pattern lines shows `57b340ad9`, the follow-up to the fix for [round 1 item 4](../round-1/slats-agents-assets-sync.md), and CRLF recognition still holds.
- Reproduction: `markerContext.test.ts`.
  - "a fenced README example does not block the install, and the rule is added as a real block": actual `{ code: 2, proseKept: true, ruleInstalled: false }`. Expected: `{ code: 0, proseKept: true, ruleInstalled: true }`.
  - "--force --yes does not overwrite the fenced README example with the rule body": actual `{ code: 0, proseKept: false, ruleAfterFence: false }`. Expected: the user's text is unchanged and the rule lands after the closing fence.
  - "--force does not delete a fenced example whose id names a rule the package does not ship": actual `{ code: 0, proseKept: false }`. Expected: `proseKept: true`.
- Confidence: high; public API, driven through the source entry `runCli` in `packages/slats/agents-assets-sync/src/index.ts`.

## 2. When `AGENTS.md` holds two blocks with the same id, an upgrade with `--force` updates only the first copy, the stale copy stays, and every later run reports the rule as up to date.

- Severity: medium. Agents read two contradicting versions of the rule, and the tool reports success with exit 0. The input needs a document that already holds a duplicate, such as the documents that the round 1 item 4 defect produced on CRLF checkouts: the original CRLF block plus the LF copy the earlier version appended.
- Affected public API: `runCli` with `--agent=codex` or `--agent=agents`.
- Contract violated:
  - `packages/slats/agents-assets-sync/src/core/markerBlock/DETAIL.md:9` states that two blocks with one id make the document contradict itself.
  - `packages/slats/agents-assets-sync/src/DETAIL.md:97` requires repeated runs to be idempotent.
- Root cause:
  - The verdict comes from `findBlockBody` at `packages/slats/agents-assets-sync/src/core/buildPlan/buildPlan.ts:94`, and the update from `upsertBlock` at `packages/slats/agents-assets-sync/src/core/markerBlock/markerBlock.ts:87-89`. Both go through `locateBlock` (`packages/slats/agents-assets-sync/src/core/markerBlock/markerBlock.ts:143-159`), which returns the first match only.
  - Deletion behaves differently: `parseBlocks` yields every copy, so the orphan scan at `packages/slats/agents-assets-sync/src/core/buildPlan/buildPlan.ts:120-129` plans one deletion per copy and removes them all. Updating and removing are therefore asymmetric.
- Relation to earlier rounds: Same class as [round 1](../round-1/README.md) class 10, a reaction wired to one direction of a change but not the other. The input is the document state that [round 1 item 4](../round-1/slats-agents-assets-sync.md) left behind.
- Reopens an earlier fix: No. `git log -L` on `locateBlock` shows `57b340ad9`, and CRLF recognition still holds.
- Reproduction: `markerContext.test.ts`.
  - "an upgrade with --force leaves no stale copy of a duplicated block behind": actual `{ forced: 0, rerun: 0, staleRuleLeft: true }`. Expected: `staleRuleLeft: false`.
  - "an upgrade with --force updates every copy of an LF-duplicated block": actual `{ rerun: 0, staleRuleLeft: true }`. Expected: `staleRuleLeft: false`.
- Confidence: high; public API, driven through the source entry `runCli`.

## 3. A rule source that is not valid UTF-8, such as a Windows-1252 or CP949 file, never settles on the codex and agents paths: every run after the first exits 2, also after `--force`, while the claude path settles.

- Severity: medium. Idempotence breaks, `--force` does not recover it, and the tool falsely blames the user for an edit. Every codex or agents user of a package whose rule file is saved in a legacy encoding is blocked on every run.
- Affected public API: `runCli` with `--agent=codex` or `--agent=agents`.
- Contract violated:
  - `packages/slats/agents-assets-sync/src/DETAIL.md:96` states that the run after `--force` settles at up to date, and `packages/slats/agents-assets-sync/src/DETAIL.md:97` that repeated runs are idempotent.
  - `packages/slats/agents-assets-sync/src/core/markerBlock/DETAIL.md:6` and AC-MB-VERDICT at `packages/slats/agents-assets-sync/src/core/markerBlock/DETAIL.md:57-61` require the block verdict to equal the file verdict.
- Root cause:
  - At apply time, `packages/slats/agents-assets-sync/src/core/injectDocs/utils/applyBlockActions.ts:25` and `:43` read the document and the rule source through a Latin-1 byte view, so the source bytes are written unchanged.
  - At plan time, `packages/slats/agents-assets-sync/src/core/buildPlan/utils/readDocument.ts:22` decodes the document as UTF-8, which replaces every invalid byte sequence with U+FFFD.
  - `blockBodyMatches` (`packages/slats/agents-assets-sync/src/core/markerBlock/markerBlock.ts:121-129`) hashes that string re-encoded as UTF-8 (`packages/slats/agents-assets-sync/src/core/hash/hash.ts:6-8`), which never equals the hash of the original bytes, so the verdict is always `warn-diverged`.
- Relation to earlier rounds: Sibling of [round 3 item 1](../round-3/slats-agents-assets-sync.md). That item's root cause already named `readDocument.ts:22`, but its fix `6ad311f19` changed only the apply path. This belongs to round 3 class 21, a fix that left a case out.
- Reopens an earlier fix: No. Round 3 item 1, the loss of the user's bytes outside the blocks, stays fixed; the symptom here is a run that never settles.
- Reproduction: `nonUtf8Rule.test.ts`, for both a Windows-1252 and a CP949 rule source.
  - "codex: the second run is a no-op, as it is for claude": actual `{ claude: [0, 0], codex: [0, 2], blockHoldsSourceBytes: true }`. Expected: codex `[0, 0]`.
  - "codex: the run after --force settles": actual `{ forced: 0, after: 2 }`. Expected: `after: 0`.
- Confidence: high; public API, driven through the source entry `runCli`.

## 4. A package that ships `skills/.gitkeep` fails as a whole with exit code 1 for every agent, so none of its skills or rules are installed.

- Severity: medium. A package that keeps an empty `skills` folder in git with a placeholder file installs nothing, its rules included. The error reads "skills/.gitkeep starts with a dot; that namespace is reserved by the agent".
- Affected public API: `runCli` and `resolveDestinations`.
- Contract violated:
  - `packages/slats/agents-assets-sync/src/core/DETAIL.md:10` and `packages/slats/agents-assets-sync/src/core/agentTarget/DETAIL.md:14` limit the refusal to skill directories whose first segment starts with a dot.
  - The `@throws` clause in the JSDoc of `resolveDestinations` throws only when a skill directory would shadow a reserved agent namespace.
  - `.gitkeep` directly under `skills/` is a file, not a skill directory.
- Root cause: `packages/slats/agents-assets-sync/src/core/agentTarget/utils/resolveDestinations.ts:57` calls `assertNotReserved` (`packages/slats/agents-assets-sync/src/core/agentTarget/utils/resolveDestinations.ts:116`), which refuses any `skills/` entry whose first segment starts with a dot, files included. The exception aborts the whole unit.
- Relation to earlier rounds: Same class as [round 3 item 7](../round-3/slats-agents-assets-sync.md), one placeholder file that blocks a whole package, and round 3 class 21, a fix that left a case out.
- Reopens an earlier fix: [Round 3 item 7](../round-3/slats-agents-assets-sync.md), fix commit `a8fcba636`. The fix freed `rules/.gitkeep` and `commands/.gitkeep`, but a dot file directly under `skills/` still aborts the unit.
- Reproduction: `skillsPlaceholder.test.ts`, "%s: a package shipping skills/.gitkeep (an empty skills folder kept in git) still installs its rule", for claude and codex: actual `{ code: 1, ruleInstalled: false }`. Expected: `{ code: 0, ruleInstalled: true }`.
- Confidence: high; public API, driven through the source entry `runCli`.

## 5. When two packages of one scope alias ship files under the same `skills/<name>/` namespace, the terminal result differs from the plain and `--json` results, and the install never settles after `--force`.

- Severity: medium. The exit code and the files written depend on the output mode, and every `--force` run deletes or reinstalls the other package's file. Two packages sharing a skill namespace is uncommon, which is why this is not rated higher.
  - On a first install, the plain and `--json` renderers give `{ code: 2, files: [a] }`, while the terminal gives `{ code: 0, files: [a, b] }`.
  - After two runs with `--force`, a plain run gives `{ code: 2, files: [b] }`: the two packages delete each other's file on every run.
- Affected public API: `runCli` with a scope alias or several `--package` values.
- Contract violated:
  - `packages/slats/agents-assets-sync/src/DETAIL.md:5` states that the exit code does not depend on the output mode.
  - `packages/slats/agents-assets-sync/src/DETAIL.md:96` states that the run after `--force` settles.
- Root cause:
  - On the terminal, `packages/slats/agents-assets-sync/src/ui/hooks/usePlanStep.ts:61-147` plans every unit before `packages/slats/agents-assets-sync/src/ui/hooks/useInjectSession.ts:95` applies any of them. The plain and `--json` renderers plan and apply one unit at a time (`packages/slats/agents-assets-sync/src/commands/runCli/renderers/renderPlain.ts:68-92`, `packages/slats/agents-assets-sync/src/commands/runCli/renderers/renderJSON.ts:97-119`), so only there does a later unit's plan see an earlier unit's writes.
  - `packages/slats/agents-assets-sync/src/core/buildPlan/buildPlan.ts:103-118` treats every file in a namespace the package ships, but absent from its manifest, as an orphan, so the sibling package's file becomes an orphan that `--force` deletes.
- Relation to earlier rounds: Confirms the open lead of [round 2](../round-2/slats-agents-assets-sync.md) (two packages of one scope alias that ship the same `skills/<name>/` namespace). Same class as [round 2 item 3](../round-2/slats-agents-assets-sync.md), an exit code that depends on the output mode. The terminal plan path is on the second-round watch list ([round 2 item 3](../round-2/slats-agents-assets-sync.md), [round 3 item 2](../round-3/slats-agents-assets-sync.md)), and this is its third round; the oscillation signal is raised at medium.
- Reopens an earlier fix: No. The planning loop is unchanged since the first commit `498276e3e`.
- Reproduction: `sharedNamespace.test.tsx`.
  - "a first install of two packages sharing a skill namespace gives the same result on every output path": `--json` matches the plain result, but the terminal gives `{ code: 0, files: ['a', 'b'] }` against the plain `{ code: 2, files: ['a'] }`. Expected: the same result on every path.
  - "two packages sharing a skill namespace settle after --force instead of deleting each other on every run": actual last run `{ code: 2, files: ['b'] }`. Expected: `{ code: 0, files: ['a', 'b'] }`.
- Confidence: high; internal fixture (`renderPlain.ts`, `renderJSON.ts` and `InjectApp.tsx` from `src`, given `ConsumerPackage` objects).

## 6. The atomic rewrite of `AGENTS.md` does not keep what the in-place write kept: group and other write bits are dropped, a read-only file is replaced, and a dangling user-scope dotfiles link becomes a plain file.

- Severity: low. The permissions of a shared, group-writable checkout, a user's write protection and a dotfiles link change without notice. In detail:
  - Modes 0664 and 0666 become 0644 under umask 022.
  - A read-only (0444) `AGENTS.md` is replaced and the run exits 0, while a read-only claude rule file in the same situation fails with exit 1.
  - A user-scope link `~/.codex/AGENTS.md` whose dotfiles target does not exist yet is replaced by a plain file, and the dotfiles file is never written.
- Affected public API: `runCli` with `--agent=codex` or `--agent=agents`.
- Contract violated:
  - The JSDoc of `replaceDocument` says the destination follows an existing user-scope file link.
  - `packages/slats/agents-assets-sync/README.md:179` says `--scope=user` follows links on purpose, because linking to a dotfiles repository is a deliberate setup.
  - The same write protection is handled differently by the claude and codex paths, and a run changes file properties silently, which breaks predictability.
- Root cause: `packages/slats/agents-assets-sync/src/core/injectDocs/utils/replaceDocument.ts`.
  - Lines 22-27: when `realpath` fails with `ENOENT`, the link path itself becomes the destination, so the `rename` replaces the link.
  - Lines 29-35 and 41: the mode read from `stat` is passed to `writeFile`, which applies the umask, and no `chmod` follows.
  - Line 42: `rename` depends only on the directory's permissions, so it replaces a read-only file that an in-place write or `copyFile` could not open.
- Relation to earlier rounds: Side effect of the fix for [round 3 item 4](../round-3/slats-agents-assets-sync.md). Same class as round 3 class 21, a fix that left a case out.
- Reopens an earlier fix: No. The behavior was introduced by `b515285b8`, the fix for round 3 item 4, and that item's guarantee (a failed rewrite leaves no truncated document) still holds.
- Reproduction: `documentRewrite.test.ts`.
  - "a ~/.codex/AGENTS.md link whose dotfiles target does not exist yet stays a link, and the block lands in the dotfiles file": actual `{ code: 0, isLink: false, dotfilesHasBlock: false }`. Expected: `isLink: true` and `dotfilesHasBlock: true`.
  - "a block write keeps AGENTS.md mode %o" for 0664 and 0666: actual mode `644`. Expected: the original mode.
  - "a read-only AGENTS.md (0444) is refused, as a read-only claude rule file is": actual `{ codex: 0, codexRewrote: true, claude: 1, claudeRewrote: false }`. Expected: `codex: 1` and `codexRewrote: false`.
- Confidence: high; public API, driven through the source entry `runCli`.

## 7. When no target is left to inject, the plain renderer accepts an invalid `--agent`, `--asset` or `--scope` value with exit 0, while `--json` and the terminal exit 2.

- Severity: low. The same typing mistake gives different exit codes on different output paths:
  - When the targets are dropped before the renderer runs, the plain path gives 0, while `--json` and the terminal give 2.
  - When nothing resolves in `runCli`, for example a scope alias whose members declare no `agents.assetPath`, the plain and terminal paths give 0 and `--json` gives 2.
- Affected public API: `runCli`.
- Contract violated:
  - `packages/slats/agents-assets-sync/src/DETAIL.md:19` and AC-CLI-FLAGS at `packages/slats/agents-assets-sync/src/DETAIL.md:63` state that invalid `--agent` and `--asset` values exit 2.
  - `packages/slats/agents-assets-sync/src/DETAIL.md:5` states that the exit code does not depend on the output mode.
  - The input goes past the round 3 known limit that a run without targets exits 0 on every output path: with an invalid flag, `--json` already exits 2, so that sentence no longer holds on every path either.
- Root cause:
  - `packages/slats/agents-assets-sync/src/commands/runCli/renderers/renderPlain.ts:55` returns 0 before the flag validation at lines 62-64.
  - `packages/slats/agents-assets-sync/src/commands/runCli/runCli.ts:108-115` returns before any renderer runs, unless `--json` is set.
- Relation to earlier rounds: Sibling of [round 3 item 3](../round-3/slats-agents-assets-sync.md), whose fix added flag validation to the terminal path. Same class as round 3 class 21, a fix that left a case out.
- Reopens an earlier fix: No. `git log -L` on `renderPlain.ts:50-66` includes `30e6d4e5b`, the fix for [round 2 item 3](../round-2/slats-agents-assets-sync.md), and the terminal validation came from `b7b626ce7`, the fix for round 3 item 3; both behaviors still hold.
- Reproduction: `flagsWithoutTargets.test.tsx`.
  - "exits with the same code on the plain, --json and terminal paths", for an unknown `--agent`, an unknown `--asset` and an unknown `--scope`: actual `{ plain: 0, json: 2, ink: 2 }`. Expected: 2 on every path.
  - "runCli: a scope alias whose members ship no agents assets rejects --agent=codx in plain mode as --json does": actual `{ plain: 0, json: 2 }`. Expected: `{ plain: 2, json: 2 }`.
- Confidence: high. The `runCli` comparison is public API through the source entry; the three-path comparison is an internal fixture (`renderPlain.ts`, `renderJSON.ts` and `InjectApp.tsx`).

## 8. With `--json`, a flag error raised before the renderer ends with an empty stdout and no JSON document.

- Severity: low. An agent that parses `--json` output gets no document for an absolute, `~`-prefixed or empty `--asset-path`, a missing `--package`, or a `--package` value of an invalid shape.
- Affected public API: `runCli` with `--json`.
- Contract violated: `packages/slats/agents-assets-sync/README.md:251-257` states that a flag error becomes `errors` with `exitCode: 2` and empty `units`, so that a reader always has a document to parse, and names only an unresolvable `--package` as the exception. The existing test at `packages/slats/agents-assets-sync/src/__tests__/json.test.ts:180-192` pins only that exception.
- Root cause: three calls to `process.exit(2)` run before the renderer: `packages/slats/agents-assets-sync/src/commands/runCli/runCli.ts:99`, `packages/slats/agents-assets-sync/src/commands/runCli/flags/resolveAssetPathFlag.ts:29` and `packages/slats/agents-assets-sync/src/commands/runCli/targets/resolveTargets.ts:53`.
- Relation to earlier rounds: Same class as [round 3](../round-3/README.md) class 26, errors that vanish, on the `--json` output path.
- Reopens an earlier fix: No.
- Reproduction: `jsonFlagErrors.test.ts`, five tests: "an absolute --asset-path (a flag error) still yields a JSON document with exitCode 2", the same for an `--asset-path` starting with `~` and an empty `--asset-path`, "a missing --package (a flag error) still yields a JSON document with exitCode 2", and "an invalid --package shape (a flag error) still yields a JSON document with exitCode 2". Actual: `{ code: 2, parses: false, exitCode: null }`. Expected: `{ code: 2, parses: true, exitCode: 2 }`.
- Confidence: high; public API, driven through the source entry `runCli` with stdout captured.

## 9. `agents-build-hashes` writes an empty manifest and exits 0 when the declared asset directory is absent, after which injection does nothing and exits 0, although the same package exits 2 with a reason before the build.

- Severity: low. A package author whose `agents.assetPath` names a missing directory, for example through a typing mistake, sees "agents-hashes.json written: 0 file(s)" and publishes a package that installs nothing, without any error.
- Affected public API: the `agents-build-hashes` bin, `buildHashes`, and `runCli`.
- Contract violated: `packages/slats/agents-assets-sync/src/DETAIL.md:23-24` and the JSDoc of `packages/slats/agents-assets-sync/src/commands/runCli/targets/resolveHashSource.ts` refuse an absent declared directory, because hashing it succeeds with an empty manifest. The build tool produces exactly that state, and the injector then accepts it.
- Root cause:
  - `packages/slats/agents-assets-sync/scripts/buildHashes.mjs:29` returns quietly on `ENOENT`, and lines 57-80 write a manifest with empty `files`.
  - `packages/slats/agents-assets-sync/scripts/agents-build-hashes.mjs:31-41` reports that result as success.
- Relation to earlier rounds: Same class as [round 3](../round-3/README.md) class 26, errors that vanish. The run-time refusal was not carried over to the build tool, which is also round 3 class 21.
- Reopens an earlier fix: No. `caa002206`, the fix for [round 3 item 12](../round-3/slats-agents-assets-sync.md), touched the same script, and a `package.json` with a byte order mark is still accepted.
- Reproduction: `emptyBuiltManifest.test.ts`.
  - "agents-build-hashes fails, rather than writing an empty manifest, when the declared asset directory is absent": actual `{ status: 0, files: [] }`. Expected: `{ status: 1, files: null }`.
  - "the injector refuses an absent declared asset directory the same way before and after agents-build-hashes ran": actual `{ unbuilt: 2, built: 0 }`. Expected: 2 both times.
- Confidence: high. The probe runs `packages/slats/agents-assets-sync/scripts/agents-build-hashes.mjs` in a child process; that file is the source the `agents-build-hashes` bin points to (`packages/slats/agents-assets-sync/package.json:56`), not a build output. Injection uses the source entry `runCli`.

## 10. On a terminal, `--agent=claude,codex` makes React report duplicate keys eight or nine times, and the two plan cards do not say which agent they belong to.

- Severity: low. A terminal user who installs for two agents sees React warnings mixed into the output, because the command loads React's development build whenever `NODE_ENV` is not `production`. The summary shows "@probe/kit@1.0.0 [2 copy · 0 skip]" twice with no way to tell the cards apart, and React warns that duplicate keys may duplicate or drop children.
- Affected public API: `runCli` on an interactive terminal.
- Contract violated:
  - `packages/slats/agents-assets-sync/src/DETAIL.md:11` states that two agents give one plan per pair.
  - The JSDoc of the `agent` prop at `packages/slats/agents-assets-sync/src/ui/components/TargetCard.tsx:12-13` says one package can have several cards.
  - Console noise in production use of the command.
- Root cause: `packages/slats/agents-assets-sync/src/ui/InjectApp/InjectApp.tsx:86`, `:123`, `:158` and `:173` key every row by the package name alone, and the app never passes `agent={tp.agentTarget.agent}` to `TargetCard`.
- Relation to earlier rounds: Same class as [round 3](../round-3/README.md) class 23, one identifier shared by every instance.
- Reopens an earlier fix: No.
- Reproduction: `inkMultiAgent.test.tsx`, "a terminal run with --agent=claude,codex raises no duplicate-key error and labels each card with its agent": actual `{ code: 0, duplicateKeyErrors: 8, cardsNameEachAgent: false }`, with 8 or 9 warnings depending on timing. Expected: `{ code: 0, duplicateKeyErrors: 0, cardsNameEachAgent: true }`.
- Confidence: high for the behavior; internal fixture (`InjectApp.tsx` from `src`, rendered with ink-testing-library under React's development build). The claim about a real terminal run is static reasoning.

## 11. On a terminal, `--agent=claude,claude` plans the same unit twice and reports one created file as two, while the plain and `--json` paths drop the repeated agent.

- Severity: low. The terminal summary shows two cards and doubled counts for one unit of work.
- Affected public API: `runCli` on an interactive terminal.
- Contract violated: the JSDoc at `packages/slats/agents-assets-sync/src/commands/runCli/flags/resolveAgentFlag.ts:7-8` says `--agent claude,codex` and `--agent claude --agent claude --agent codex` behave alike, and `packages/slats/agents-assets-sync/src/DETAIL.md:5` says the output mode does not change the verdict.
- Root cause: `packages/slats/agents-assets-sync/src/ui/hooks/useResolveStep.ts:55` filters the agents with `isValidAgent` but does not drop duplicates, which `parseAgentFlag` does on the plain and `--json` paths.
- Relation to earlier rounds: Same class as [round 2 item 3](../round-2/slats-agents-assets-sync.md), a result that depends on the output mode. The terminal plan path is on the second-round watch list ([round 2 item 3](../round-2/slats-agents-assets-sync.md), [round 3 item 2](../round-3/slats-agents-assets-sync.md)), and this is its third round, together with item 5.
- Reopens an earlier fix: No. `git log -L` on the line shows `b7b626ce7`, the fix for round 3 items 2, 3 and 6, and those behaviors still hold.
- Reproduction: `inkMultiAgent.test.tsx`, "a terminal run with --agent=claude,claude plans one unit, as the plain and --json paths do": actual `{ cards: 2, created: '2' }`. Expected: `{ cards: 1, created: '1' }`.
- Confidence: high; internal fixture (`InjectApp.tsx` from `src`).

## 12. The Programmatic API example of the Korean README still imports `injectDocs`, `isInteractive` and `resolveScope`, which the package does not export, so the example fails when used literally.

- Severity: low. A Korean reader who copies the example gets a module link error, as an English reader did before the round 3 fix. The Korean README is not in the package's `files` (`packages/slats/agents-assets-sync/package.json:59-65`), so it reaches readers through the repository, not through the installed package.
- Affected public API: the `@slats/agents-assets-sync` entry.
- Contract violated:
  - `packages/slats/agents-assets-sync/src/index.ts` exports none of the three names. The English README's import at `packages/slats/agents-assets-sync/README.md:189-196` names only exported functions.
  - `DOCUMENTATION.md` principle 4: a translation keeps its source's structure and changes with it in the same pull request.
- Root cause: `packages/slats/agents-assets-sync/README-ko_kr.md:238-246` imports the three names. The fix for round 3 item 11, `db02fdf39`, changed only `README.md`.
- Relation to earlier rounds: Same defect as [round 3 item 11](../round-3/slats-agents-assets-sync.md), left in the Korean translation. Same class as round 3 class 21, a fix that left a case out.
- Reopens an earlier fix: Yes, [round 3 item 11](../round-3/slats-agents-assets-sync.md), fix commit `db02fdf39`. `git log -L` on the Korean lines shows only `498276e3e`, the package's first commit, so the fix never reached the translation.
- Reproduction: `contracts.test.ts`, "every name in the Korean README Programmatic API import is exported by the package entry": actual `['injectDocs', 'isInteractive', 'resolveScope']`. Expected: `[]`. The English control passes.
- Confidence: high; public API, checked against the source entry `packages/slats/agents-assets-sync/src/index.ts`.

## 13. Seven documentation site pages say that `--scope=project` installs "into the nearest existing .claude, walking up from cwd", but the CLI first picks the nearest ancestor that owns a root marker.

- Severity: low. The pages mislead about where files are written. A reader who runs the documented command inside a workspace member that has its own `.claude`, in a repository with `.git` or a lockfile, gets the assets in the `.claude` of the repository root, not of the member. The CLI only marks the target "auto-located" in its output.
- Affected public API: `inject-agents-settings --scope=project` (`runCli`) and `resolveProjectRoot`, as the site pages of `@winglet/common-utils`, `@winglet/data-loader`, `@winglet/json`, `@winglet/json-schema`, `@winglet/react-utils`, `@winglet/style-utils` and `@lerx/promise-modal` document them.
- Contract violated: `packages/slats/agents-assets-sync/README.md:40` states the current rule: the nearest ancestor that owns a root marker (`.git`, `pnpm-workspace.yaml` or a lockfile) is the project root, and a marker outranks a nearer agent directory.
- Root cause:
  - The site pages still describe the older nearest-anchor rule, at `documents/docs/winglet/common-utils/index.mdx:89`, `documents/docs/winglet/data-loader/index.mdx:90`, `documents/docs/winglet/json/index.mdx:89`, `documents/docs/winglet/json-schema/index.mdx:133`, `documents/docs/winglet/react-utils/index.mdx:103`, `documents/docs/winglet/style-utils/index.mdx:90` and `documents/docs/lerx/promise-modal/index.mdx:121`.
  - The code they describe is `findProjectRoot` at `packages/slats/agents-assets-sync/src/core/scope/scope.ts:80`, which returns `findMarkerRoot` (`packages/slats/agents-assets-sync/src/core/scope/scope.ts:59`) before it looks for agent anchors.
- Relation to earlier rounds: Sibling of [round 3 item 14](../round-3/slats-agents-assets-sync.md), whose fixes `142eae648` and `db02fdf39` changed only this package's own documents. Same class as round 3 class 21, a fix that left a case out.
- Reopens an earlier fix: No. `git log -L` on `documents/docs/winglet/common-utils/index.mdx:85-91` shows `ac75c9814`, `1fa080640`, `4db53f8cc` and `3b2888f51`, none of them a bug bounty fix.
- Reproduction: `contracts.test.ts`, "--scope=project lands in the nearest existing .claude, as the seven site pages state": with `<tmp>/.git` and `<tmp>/apps/web/.claude`, run from `<tmp>/apps/web`, the actual project root is `<tmp>`. Expected: `<tmp>/apps/web`. The companion test that reads the seven pages and the control without a root marker pass.
- Confidence: high; public API (`resolveProjectRoot` from the source entry) compared with the documents.

## 14. A CommonJS TypeScript consumer on `module: nodenext` type-checks an import of `@slats/agents-assets-sync` without error, but Node's `require` of the package fails with `ERR_PACKAGE_PATH_NOT_EXPORTED`.

- Severity: low. A `.cts` file or a `type: commonjs` project compiles cleanly against the programmatic API and then fails at run time. TypeScript 5.8 and later accept a `require` of an ES module under `nodenext` ([TypeScript 5.8 release notes](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-8.html)), so the compiler gives no warning.
- Affected public API: the `@slats/agents-assets-sync` entry (`runCli`, `readHashManifest` and the other exported primitives).
- Contract violated: the published declarations promise a module that the published `exports` cannot deliver to `require` (round 3 class 30). No consumer-facing document, in English or Korean, says that the package is ES module only.
- Root cause: `packages/slats/agents-assets-sync/package.json:30-33`, and the published copy under `publishConfig` at `packages/slats/agents-assets-sync/package.json:42-45`, give `.` a `types` condition beside an `import` target and nothing else. TypeScript matches `types` for a `require` too, while Node finds no `require` or `default` target.
- Relation to earlier rounds: Same class as [round 3 item 6](../round-3/winglet-common-utils.md) and [round 3 item 7](../round-3/winglet-common-utils.md), published `exports` and declarations that disagree with what a consumer can load (round 3 class 30).
- Reopens an earlier fix: No. `git log -L` on `packages/slats/agents-assets-sync/package.json:42-45` shows `c43d997aa`, the fix for [round 3 item 7](../round-3/winglet-common-utils.md), as the last change to the neighboring lines. That fix removed the `source` condition; the `{ types, import }` shape predates it (`f80832bc2`, `0739a3fd2`).
- Reproduction: `contracts.test.ts`, "TypeScript (module nodenext) and Node agree on whether require() of the package works". A `type: commonjs` consumer in a temporary directory links the package and imports `readHashManifest` from an `index.cts` file. Actual: `{ typeScript: 'accepted', node: 'rejected ERR_PACKAGE_PATH_NOT_EXPORTED' }`. Expected: the same verdict from both.
- Confidence: high; static at the manifest level. Node's `require` is real and fails during export resolution, and TypeScript checks against the stale `dist/index.d.ts`.

## Hypotheses checked and not bugs

- From `r4-agents-assets-sync`:
  - A dotfiles link whose target exists stays a link after a rewrite, and mode 0640 survives under umask 022; both are control tests that pass.
  - Locating blocks grows roughly with the square of the block count, but 1,000 blocks of 2 KB take about 1.1 seconds, so realistic documents are not affected.
  - A rule body that quotes a complete block with a different id parses correctly, because the outer START marker matches first; this was checked by reading the code.
  - Orphan removal handles duplicated blocks: `parseBlocks` yields every copy, so each copy gets its own deletion; only the update path is asymmetric (item 2).
  - The terminal path plans every unit before applying any, but for `--agent=codex,agents --scope=project` the files and the exit code match the plain path, because the second application is idempotent; only the report's split between created and skipped differs.
  - The containment cache that the units of one run share is reused after earlier units wrote, but the tool never creates links, so a stale "missing" entry cannot hide an escape; a race with another process is the known limit of [round 1](../round-1/FIXES.md).
  - A manifest with uppercase hexadecimal hashes would mark every action `source-hash-reconciled`, because `packages/slats/agents-assets-sync/src/core/buildPlan/buildPlan.ts:45` compares with `!==` while `hashEquals` ignores case, but the shipped builder writes lowercase only, so this is not a plausible input.
  - A manifest whose `files` is an empty array reads as an empty manifest rather than an error, but only a hand-written manifest produces it.
  - With `agents.assetPath: "."`, the builder hashes the whole package root, `node_modules` included, which `packages/slats/agents-assets-sync/README.md:166` documents ("Every file under the asset root is hashed").
  - A manifest that lists a source file deleted since the build fails the unit with "Source file missing" and exit 1, which matches the round 3 decision that a broken manifest stays a run error.
- From `r4-contracts`:
  - The package's declarations need `@types/node` for `Buffer`, which suits a Node command-line package.
  - Error TS1479 for a `.cts` consumer under `module: node16` is correct, because that mode does not allow a `require` of an ES module; only `nodenext` accepts it, which is item 14.
