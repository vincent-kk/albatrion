# Fixing bug bounty findings

This is the procedure a fix session, called the coordinator, follows to fix the confirmed items of a round and merge them into the campaign's integration branch. The coordinator follows this document, and the work orders sent to workers carry its rules over unchanged. Finding items is covered by the skill's `SKILL.md`; this document covers fixing only.

## Roles and models

| Role | Agent and model | When used |
|---|---|---|
| Coordination | The main session. | It owns planning, decisions on questions, and merging. |
| Implementation | A strong implementation model, newest generation first. The last fallback is the coordinator's own model family. | It owns the whole fix of one work unit. |
| Plan and contract review | A strong review model that a provider safety check does not interrupt. | It reviews independently when a plan or a contract is created or changed substantially. |
| Mechanism design for a recurring defect area | The strongest design model available, as the owner directs, used once per area. | It writes the design for the contract-first section separately from the implementer. |
| Consultation on hard problems | A model from a different model family than the implementer, at its medium effort only because of usage. When it is blocked, the implementation model replaces it. | It is consulted on design judgment. |
| Independent review and internal verification | A strong review model, one generation older than the newest implementation model when the newest generation is stopped by provider safety checks on defect-finding work. | It reviews fixes and verifies the merged baseline internally. |

- The implementer and the reviewer of one unit are never the same session. Fast execution mode is not used.
- A worker that is in the middle of its work is not swapped out. A long-running implementer is replaced at a work boundary, and its report records in a handoff section the current branch, the decisions, the finished work, the remaining work, the evidence paths, and the original and additional instructions.
- A worker stopped by a provider check or a usage limit does not resume by message. Read the output it left in the temporary directory, close that worker, and start a new worker with the handoff content. A resumption is confirmed by real output.
- The coordinator decides ordinary worker questions directly. Every work order states the applicable constraints itself, such as the commit message rules and the command execution forms, and a replacement role follows them as well.
- Every worker starts with the fixed dispatch procedure. The coordinator checks the workers' mailbox every turn, and while it waits for a result it ends its turn and receives the notification.

## Work units

- Each of the bundles below is a work unit. One bundle gets one implementation worker, one worktree, one independent review, and one pull request. This reduces the time that separate builds, reviews and continuous integration checks per package would cost. Each worktree is a child worktree branched from the integration branch.
- The bundles used for this repository:
  1. Utility bundle: `@winglet/common-utils`, `@winglet/react-utils`, `@winglet/json`, `@winglet/json-schema`, `@winglet/data-loader`, `@winglet/style-utils`
  2. `@lerx/promise-modal` and `@slats/agents-assets-sync`
  3. `@canard/schema-form`
  4. Plugin bundle: the `ajv6`, `ajv7`, `ajv8`, `antd5`, `antd6`, `antd-mobile` and `mui` plugins
- Inside a bundle, the failing-test commit and the fix commit are still separate for every item, and speed is measured for every changed function. When one item is blocked, only that item moves to the next round and the rest of the bundle is merged.
- At most 8 implementation workers run at once. The `@canard/schema-form` type check uses about 2.4 GB of memory, so more workers cause out-of-memory failures and polluted benchmarks.
- When the same item repeats across several packages, the lead package fixes it first and the others follow the shape of that fix. For this repository, `ajv8` leads the AJV plugins and `antd5` leads the user interface plugins.
- A worker edits only its own package folders, new files in `.changeset/`, and the generated documents that the repository checks require. It does not edit anything under `bug-bounty/`. When another package must change, it stops and asks the coordinator.

## Worker procedure

The order is never changed.

1. **Preparation.** Build the dependency packages. Build outputs are not committed.
2. **Benchmark before the fix.** Create a benchmark that measures the ordinary (non-buggy) input path of the function to be fixed, and record its baseline on the code before the fix.
3. **Failing test.** For each item, move the reproduction test to the package's real test location, confirm that it fails on the code before the fix for the reason the document states, and commit only the failing test first. A test that passes, or that fails for another reason, marks an unconfirmed item: it is reported and not fixed.
4. **Fix.** Fix the root cause with the smallest change. When a documented policy changes, fix `DETAIL.md` before the code. The fix commit is separate from the test commit.
5. **Speed condition.** Follow the section below.
6. **Checks.** Run the package's lint, type check and full tests. Also run locally the render, React 18 and production tests that the pull request continuous integration checks skip. Run the tests of the consumer packages that `scripts/ci/selectAffectedWorkspaces.mjs` selects. For `@winglet/*` packages, also run `yarn workspace @albatrion/documents sync-winglet-docs:check`.
7. **Change record.** Write one changeset for each independent change that a consumer can observe. When compatibility breaks, say so in the first sentence and show the code before and after the fix.
8. **Report.** Do not push and do not open a pull request; report to the coordinator.

## Contract first

When a third neighboring shape appears after two fixes in the same area, per-input implementation stops. The implementer writes a per-commit result table of every shape that was tried and a description of the current mechanism. A contract sentence that is true for every input is written into the document first and goes through an independent contract review.

A designer who is not the implementer writes one design. The design contains the model of the source and the state, one mechanism chosen by comparing two or more candidates with the reasons for excluding the others, a table of the expected values of every tried shape derived from the rules, the dimensions that the reference model generates and the dimensions it does not generate, and an order that includes the failing test of each step together with stop points. Expected values are never taken from the product's execution results.

The implementer follows the design order, satisfies the failure check and the pass condition of each step, and updates the progress file. At a stop point of the design it waits for the coordinator's answer. A separate reviewer checks the mechanism with the reviewer's own inputs and with the fault injections the design specifies. The dimensions that the contract does not reach are verified by a separate table test, and equivalence between paths alone does not replace an independent reference model.

## Speed condition

- The ratio is the time after the fix divided by the time before the fix on ordinary input. The before side is the failing-test commit, and the after side is the latest commit of the branch.
- Warm up both sides until the engine's optimizing compilation finishes. Record the optimization and deoptimization events in the measured interval with `--trace-opt`. A round that contains a sample with an optimization event is discarded, and the number of discarded rounds is published together with the ratio over all rounds. A row from which more than half of the rounds were discarded is judged by the ratio over all rounds. Choose the shortest warm-up that has no events. Avoid a warm-up that is too long, because it distorts allocation-heavy rows. When the optimization stages of the two sides differ, confirm the cause with a run that turns that stage off.
- Each row uses a separate pair of processes, one before and one after the fix. A table that bundles several rows is used only when it is disclosed as diagnostic. Measure process CPU time under `node --single-threaded`, and use the median of 12 alternating runs.
- When the control ratio between two identical builds falls outside 0.98 to 1.02, the whole series is discarded. A row at 1.03 to 1.06 is measured in three series of 24 runs each. Also record the garbage collection in the measured interval. A row that generates code is measured 24 times with cached content and 24 times with fresh content, and both sides include all events. A row with large variance is reported as the range of the three series.
- On one machine only one measurement series runs. Use a lock directory that every kind of worker sandbox can use, with a single hold of at most 40 minutes, and publish the load average.
- On a loaded machine, obtain a load-robust estimate with at least 60 short alternating measurements. Divide the minimum, the 10th percentile and the per-round paired ratio each by the same statistic of the control pair. The control ratio must stay between 0.98 and 1.02. First judge the validity of the method by reproducing two rows whose values from a quiet environment are known.
- The reviewer measures again with an independent measurer. It reports the ratio, the absolute cost per call and the execution frequency of the path together, and it separates a path that now does the previously missing work from an existing path that became slower.
- The target is 1.00 or below. When a cheaper algorithm exists, choose it.
- Up to 1.03 counts as measurement error.
- A cost that cannot be explained by named work is not accepted. A ratio above 1.03 is allowed only when the operation is necessary for correctness, and even then it must be minimal. The worker reports the added operation, the reason it cannot be avoided, and the cheaper alternatives that were measured and discarded. Otherwise the fix is redone.
- A residual cost of a few microseconds per call that correctness requires is accepted, and its ratio, its absolute increase and its execution frequency are recorded.
- The user interface plugins (`antd5`, `antd6`, `antd-mobile`, `mui`) and `@slats/agents-assets-sync` are not measured for speed. Neither the worker nor the reviewer runs a benchmark. The cost of one render in a user interface plugin is buried in measurement error, and `@slats/agents-assets-sync` is a command-line tool that a person runs once at a time, so the time needed to settle a measurement exceeds what it gains. A change that is clearly slower (a loop or a subscription added to every render, or a directory read repeated for every file) is screened out in review without measurement.
- Exemptions from measurement: fixes that change only documents, a one-line JSX attribute change that adds no render, allocation or effect, and command-line flag and exit code logic. An exemption is reported per item with its reason.
- A logic change in a React component is measured through the extracted pure function or through a repeated render of 100 instances. A command-line tool is measured through the core function in memory, not through process execution.

## Decision rules

- The criteria for correct behavior come in this order: compliance with the standard the package implements, predictable behavior, and a reasonable interface. Use this order to choose the direction of a fix where the documents are silent.
- When the code disagrees with a standard or with the public documents (README, `docs/`, the specification), fix the code. This holds even when an existing test pins the divergent behavior. Invert that test and record the change as breaking compatibility.
- When the item title is a document mismatch and the behavior of the code is reasonable, fix the document.
- When confidence is low, when the fix may break existing consumers in a way the documents do not address, or when two fixes with different public behavior are possible, the worker asks the coordinator with the options and a recommendation and proceeds with other items in the meantime.
- A fix that adds a check to a frequently called path binds the speed condition to the decision. When even the cheapest check exceeds 1.03, record the operation that correctness requires and its absolute cost, and judge it under the speed condition.
- Do not suppress a type error with a cast. Do not weaken or delete an existing test, except a test that pins the behavior the item inverts.
- A change that the package documents list under "Ask first" (for example removing an option from a public type) is put to the owner.

## CI time

Each pull request stage's continuous integration check job must finish within 10 minutes on GitHub, including installation and build. Judge it by the run time of the real pull request, and distinguish the limit that stops a runaway job from the completion budget. The ordinary local test commands run the full range without a time budget. The pre-release verification also runs the full range and removes inherited restricted profiles. A restricted profile is selected only in the plan of the pull request stage, keeps every input class and every assertion, and fails when a class is missing. Before reporting a unit as complete, compare the per-package test elapsed times with the baseline and compare the actual work time with the earlier run. The review work order includes this item as well.

## Internal verification

Before telling the collector that the round is complete, run an internal verification on the baseline in which every unit is merged. It checks the regression against the baseline of the round's fixes, the neighbors of each fix, the retained probes, the inputs that interpret the contract sentences as promises, and the connections between packages. Items it finds go through the failing check, the fix, the independent review and the merge exactly like a round finding.

The test files written during independent review are preserved as the repository's regression tests before the round is closed. Their expected values are derived only from document sentences or from equivalent forms of the same input, and never from product execution output. A verification that already exists is not duplicated. An input that fails and an input without an expectation basis are left as a list, then fixed or recorded as a limit, and an assertion is never weakened to make it pass.

## Gate before the pull request

1. The worker reports the status of every item, the failing commit and the latest commit, the benchmark table and the reproduction commands, the check results, the existing tests that were inverted, the changesets and the remaining risks.
2. The reviewer in the role table independently confirms that the regression tests fail at the failing commit and pass at the latest commit, that the speed ratios reproduce, and that no unrelated change is present. At most two reviews run at once. Measurement follows the single-series lock of the speed condition.
3. Fixes that come out of review go back to the same implementation worker.
4. Remove the build outputs of the affected packages and run the official impact plan in the plan's own order. Stale outputs hide missing dependencies, and the outputs of another checkout above the worktree may also be resolved, so check the real resolution paths too. Passing means that the whole impact plan passes, not only the tests of the fixed items.
5. A package's tests do not import sibling packages. Comparison inputs are isolated as data, and the tests verify the package's own implementation.
6. When a public signature of a winglet package changes, regenerate the site pages in the same pull request with `yarn workspace @albatrion/documents sync-winglet-docs`. The documentation sync workflow is outside the impact plan, so passing the impact plan does not replace it. A finding that spans several packages is traced through the handling of every package.
7. Before merging, read the changes to `.claude/`, to the `package.json` scripts, to lockfiles and to `scripts/ci`.
8. When the gate passes, the worker rebases onto the base branch, verifies again, pushes, and opens a pull request that targets the base branch. The ordinary base is the integration branch, and stacked branches follow the rules of the merge section.

The default review is one sample review. A unit that was interrupted or handed over gets, in addition to the sample review, an exhaustive trace audit of every finding's item, handling, failing commit, fix commit and pinned verification.

- The worker leaves evidence that the reviewer can rerun: the builds before and after the fix, a row list stating for every row whether the path was touched, a command that remeasures only part of the rows, and for every decision that changed behavior its basis (the standard or the document contract it follows, the predictability reason, and the speed row concerned).
- A preliminary diagnosis may be screened with 6 runs, but the final judgment follows the 12-run and the three-series 24-run rules of the speed condition.
- The reviewer remeasures only a sample from the worker's build (checking the hash first): the touched rows, the rows reported above 1.00, and a sample of the rows claimed untouched. The claim of being untouched is confirmed by reading the call path.
- The check that a test fails and then passes is also a sample: all items of high severity and all items that carry a decision, and at least one item per package for the rest. Attack first the places that earlier rounds pointed out twice in the same function.
- A small change after review does not go back to a reviewer: the coordinator reads the diff, or a verification helper worker takes only that diff. Only when a frequently called path has changed does the reviewer receive that diff again for attack and remeasurement.
- When a shared contract of a core package changes and several plugins follow the same change, each plugin gets an equivalence test that compares every input class in one table. Cases that a person hand-picks for each plugin repeat the same omission.
- The judgment of speed cost uses the reviewer's remeasured value and the absolute time of one operation. The worker's value is recorded alongside for reference.

## Merge

- When the continuous integration checks pass and no review comment remains open, the coordinator merges. When a part changed after review, the coordinator merges after checking that part, and when an item has an unsettled speed, after measuring it again at a quiet time and settling it.
- Merge with a rebase merge (`gh pr merge --rebase`). The repository does not allow merge commits, and a squash erases the distinction between the failing-test commit and the fix commit.
- Immediately before merging, read both `mergeable` and `rebaseable`. When GitHub refuses the rebase and the branch is a linear extension of the integration branch, fast-forward and send it with an ordinary push. Never force push. A pull request with more than 100 commits follows this rule too, and the pull request's merged indicator is checked.
- A stacked branch merges first into its own base branch, and then the base branch merges into the integration branch. When a rebase merge is refused because of size, confirm the linear extension, fast-forward, and push.
- Merging follows the dependency order of this repository:
  1. `@slats/agents-assets-sync`, `@winglet/common-utils`, `@winglet/style-utils`
  2. `@winglet/json`, `@winglet/data-loader`, `@winglet/react-utils`
  3. `@winglet/json-schema`, `@lerx/promise-modal`
  4. `@canard/schema-form` and the `ajv8`, `ajv7` and `ajv6` plugins
  5. The `antd5` plugin, then the `antd6`, `mui` and `antd-mobile` plugins
- When an earlier stage is merged, the workers of the later stages rebase, rebuild the dependency packages, and run the checks again.
- The merge order of the bundles is the utility bundle, then the `@lerx/promise-modal` bundle together with `@canard/schema-form`, and last the plugin bundle. The implementation of the four bundles proceeds at the same time, and the plugin bundle rebases only once, after `@canard/schema-form` is merged.

## Round cycle

Collection and fixing alternate. The collector collects and the coordinator fixes.

1. **Fix.** The coordinator fixes the items of `bug-bounty/round-N/` with this document's procedure and merges all of them.
2. **Cleanup.** When every pull request of the round is merged, close the round's workers and delete the worktrees and branches. A worktree that still holds unmerged changes is not deleted, and its owner is told.
3. **Handoff.** When no document of the next round exists, the coordinator tells the collector that fixing is finished and waits. The message asks the collector to return, when collection ends, the path where the round was organized (in the form `bug-bounty/round-{n}`).
4. **Collection.** The collector runs the bug bounty from the new HEAD, and when it finishes it tells the coordinator the path, the range of files to commit, and whether a next round exists. While collection runs, the coordinator does not merge into the base branch.
5. **Record.** The coordinator commits the round material it received to the integration branch and pushes it.
6. Return to step 1. After round 5, the coordinator ends collection when the round has no finding of high severity, no regression and no repeat of a watch-list finding. When any one of them exists, the coordinator starts the next round without asking, up to round 7. The collector's proposal to end is taken as reference, but the end judgment follows this criterion. The round numbers are defaults.
7. When collection ends, compare only the `@canard/schema-form` core of the HEAD before the bounty with the final HEAD, using the method of the speed condition. Analyze and fix only the rows that are slower than a value already accepted.

The message of every fix commit and the body of every pull request state the round and the item number in the form `round-1 schema-form 3`. The collector uses it to trace whether an earlier round's fix changed the origin line of a new finding.

As rounds repeat, work returns to the fixes of earlier rounds, so rules against regression are added.

- Before starting to fix, run the round's reproduction tests again on the current HEAD. When HEAD differs from the collection point, some items may already be fixed or may have a changed cause, and such items are reported and not fixed.
- A regression test added in an earlier round is never weakened or inverted. When a new item conflicts with an earlier round's decision, the worker stops and asks the coordinator, and the coordinator tells the owner.
- The work order lists the items an earlier round fixed in that package and the decisions it made, so that the worker does not revert the same code.
- An item that re-enters code or behavior fixed by an earlier round is checked by the coordinator against that round's `FIXES.md` and fix commits and classified as one of three.
  - **New defect**: an input or path that the earlier fix did not cover. It is fixed by the ordinary procedure.
  - **Regression caused by the fix**: a defect that the earlier round's fix created. Fix it, record in `FIXES.md` why the earlier round's regression test did not catch it, and add a test that fills that gap.
  - **Oscillation**: an item that demands the opposite of the behavior the earlier round decided, or that makes the same point swing between two criteria. It is not fixed. Decide once, with the criteria order of the decision rules, which side is right, record the decision with its basis in `FIXES.md`, and tell the collector so that the next collection excludes it. When even the criteria order does not settle it, ask the owner.
- Record the classification for every item in the round's `FIXES.md`. When the same point re-enters across three rounds, tell the owner regardless of the classification.
- The review before the pull request also checks that every regression test of the earlier rounds passes and that the benchmarks measured in the earlier rounds did not slow down. The baseline of the speed ratio is the round's own before-fix commit, and a fix that cuts into a speed gain obtained in an earlier round counts as slower.
- When fixing an item, also look for sibling defects of the same class in the same package. The classes follow the cross-package class list in [classes.md](classes.md). A sibling is fixed only after a failing test confirms it, and a place that is not confirmed is left untouched. The regression test for this kind of class is written not as one case but as a test that compares the results of two cases that must be equal. The range of siblings fixed together is written in the commit message and in `FIXES.md`, so that the next collection treats that range as fixed.
- When the fix of one package exposes a defect hidden in another package, the failing test and the fix go in together when the later-stage worker rebases.

## Coordinator checks

- A shared foundation such as a lock path, a directory or a tool is confirmed by having each kind of worker actually use it once before anything depends on it.
- A worker that waits or measures is confirmed by the creation and update of its output, not by a sign of life or by its own report. Every wait has a deadline and an output watch.
- Work orders forbid background waiting and require an immediate question when a permission error occurs. They state which choices the worker decides by itself and which stop points need the coordinator's answer.
- A worker's question does not wake the coordinator; only a completion report does. The coordinator checks the mailbox every turn, and while a worker that can ask questions is running, at least every 5 minutes.

## What stays with the owner

- The coordinator manages the development environment: commits, pull request merges, worktrees and branches. The coordinator commits only files it created or received, and does not touch the unfinished changes of other sessions in the working folder.
- The worker worktrees are created inside the repository folder, so they are excluded through `.git/info/exclude`. If one enters a commit, it is recorded as a submodule link and pollutes the base branch.
- Whenever a decision changes public behavior, the coordinator tells the owner what changes.
