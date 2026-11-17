---
name: bug-bounty
description: Run or resume one round of this repository's multi-agent bug bounty — plan hunter areas around angles earlier rounds did not cover, launch parallel hunter agents with one shared brief, re-run every failing probe in the main session, and record the confirmed findings under bug-bounty/round-N/. Use when asked to run, plan, or continue a bug bounty round or a cross-package bug hunt; fixing the findings is a separate task.
---

# Bug Bounty Round

A round finds defects that consumers would actually hit, proves each one with a failing probe, and records it so a separate fix group can work from the record. A round is judged by confirmed, consequential findings, never by their count.

## Terms

- `<package path>`: a workspace directory, such as `packages/canard/schema-form`.
- `<package-slug>`: the scope and name joined by a hyphen, such as `canard-schema-form`; it names record files and probe folders.
- Hunter id: `rN-<area>`, such as `r3-engine`.

## Invariants

- Earlier rounds are read-only. Never edit, move, or renumber anything in a finished round (a `bug-bounty/round-K/` folder that has a `README.md`): a fix group cites those files and item numbers while you work.
- Neither hunters nor the main session fix code, rebuild packages, or run state-changing git (`commit`, `add`, `stash`, `checkout`, `reset`, `restore`, `clean`). The owner and the fix group change files during a round, the fix group in its own worktrees under the repository root (such as `bb-*`); leave every file you did not create untouched, and never read those worktrees as the code under test.
- Commit nothing unless the user asks.
- Every recorded finding has a failing probe or failing typecheck that the main session re-ran. A claim checked any other way states how it was checked.

## Procedure

### 1. Prepare

- If a `bug-bounty/round-K/` folder has no `README.md`, round K is unfinished: resume it with N = K, read its `.progress/brief.md` and `.progress/progress.md`, and continue from the first step they do not record as done. Otherwise set N to the highest K plus one and create `bug-bounty/round-N/.progress/`.
- Record the base commit (`git log -1`), `git status --porcelain`, and `git worktree list` in `.progress/progress.md`. If files under `packages/` are modified or untracked, name them to the user and ask whether to start now or wait. When the round starts anyway, the brief and the round README list those files.
- Read every finished round's `README.md`: its areas and angle ids, its cross-package classes, and its areas to revisit or to lower. Round 1 predates the angle catalog, so none of its work counts as a catalog angle. For each planned area, note the earlier package documents a hunter must read.

### 2. Plan areas and angles

- Split the published packages into 8 to 12 hunter areas small enough for one hunter to probe deeply. Split `@canard/schema-form` into several areas (for example compile time and engine, React layer, validation with the AJV plugins), and split any area an earlier README lists under areas to revisit; group the small packages.
- Give each hunter 4 to 6 angles by id from [references/angles.md](references/angles.md), at least 3 of them unused by earlier rounds in that area, plus the cross-package classes found so far as sibling targets.
- When an area has fewer than 3 applicable angles left unused, first add angles to the catalog with the next free ids, derived from the previous round's cross-package classes; the round README names the added ids.
- Lowering an area's priority means giving it fewer angles or sharing a hunter with a neighboring area; never drop a published package from the plan.
- Write each area as one block: packages, modules to focus on, angle ids, and the earlier documents to read.

### 3. Brief and launch

- Copy the part of [references/hunter-brief.md](references/hunter-brief.md) below its divider to `.progress/brief.md` and fill every placeholder. That file is the single shared brief. Each hunter prompt says only "read the brief at <path>", the hunter id, and the area block.
- Launch every hunter in one message as a background general-purpose agent, because hunters write probe files and run tests. While they run, do not hunt yourself; verify each report as it arrives.
- Tell the user that probe folders sit under `<package path>/src/__bounty__/` until cleanup, where package typecheck, lint, or build scripts may pick them up.

### 4. Verify each report

- Re-run the hunter's probe folders with the commands its report gives. When the output is long, add Vitest's `--reporter=json --outputFile=<file under .progress/>` and list failing test names with a short node script.
- Map every failing test to exactly one role: a reported finding, a diagnostic or measurement test, a hypothesis the hunter judged not a bug, or an environment limit. Drop a finding whose test passes or fails for a different reason, or send it back to the hunter with SendMessage.
- When a probe imports a built `dist`, confirm that no source file the finding blames is newer than that build (`find <package path>/src -newer <dist entry>`).
- Judge each finding with the quality bar and severity sections of the brief; downgrade or drop what falls short. For every critical or high finding, read the cited code yourself.
- Immediately copy the probes worth keeping to `bug-bounty/round-N/probes/<package-slug>/<hunter-id>/` and append the verdicts to `.progress/progress.md`, so another session can resume the round.

### 5. Record

Write `bug-bounty/round-N/` as [references/report-format.md](references/report-format.md) specifies. The `README.md` goes last, because its presence marks the round finished. Before reporting, check that every relative link in the round folder resolves.

### 6. Clean up and report

- After the probes are copied, delete only the `src/__bounty__/rN-*` folders this round created, then any `__bounty__` folder left empty, then `bug-bounty/round-N/.progress/`.
- Report to the user: the totals (items and distinct root causes), the critical and high items, verification limits, the areas to revisit and to lower, and any change others made in the working tree during the round.

## Cap and coverage

Each hunter reports at most 20 findings, ranked by severity, and never pads its list to reach the cap; qualifying findings beyond the cap are listed one line each under Saturation. An area goes under "Areas to revisit" in the round README when its hunter reached the cap or its new angles produced a high or critical finding. It goes under "Areas to lower" when its new angles produced nothing at medium or above in two consecutive rounds.

## Waves

A wave is a run of consecutive rounds the user asks for together, such as rounds 3 to 5. Rounds alternate with fixing, as the round cycle in `bug-bounty/FIX-PROCEDURE.md` defines: a separate fix session fixes and merges a round's findings, then notifies this session with the new HEAD, and the next round runs at that HEAD.

- Only the next round can be prepared ahead of time. It plans its areas after the previous round's `README.md` exists, because it reads that round's angles, classes, and areas to revisit.
- A prepared round records "launch pending" in its progress note. At launch, refresh the base commit, the working-tree status, and the worktree list in the progress note and the brief.
- Launch on the fix session's notice only when the user has approved that for the wave; otherwise tell the user the notice arrived and wait.
- After step 6, send the fix session the round path and the files it may commit: everything under `bug-bounty/round-N/`, plus any change this round made to this skill or its angle catalog. The fix session commits and pushes them; stage nothing yourself, because both sessions share one git index.
