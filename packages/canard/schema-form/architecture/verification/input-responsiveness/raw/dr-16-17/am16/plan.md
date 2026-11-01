# DR-16/17 Amendment 16 merge-gate plan

Planning method: coordinator dispatch task_b047e62d5e0c and Amendment 16, ordered using the seiri default evidence checklist.

## Outcome and constraints

Work on feat/schema-form-dr-16-17-error-reporting above d68072d1ac7c2d01854bc22b82fecae8598a5db4. It is already pushed; do not amend or rewrite it. Use the configured repository Git identity, no author/email override, no trailers, no push. Keep all scratch under the existing external dr-16-17/am16 directory, overriding skill-local ledger placement as in the parent brief. Yarn/npm/gh/orca remain bare commands, each in its own shell call. Never overlap Vitest processes.

Amendment 16 widens capture safety to every read of the failure value, including top-level metadata and String(error), while preserving handler/sink exception handling. Both traversals use a fixed first array length for iteration and one final stability read; "read length once" means never using a fresh length as the loop bound. Accept only integer lengths 1..2^32-1, own indices throughout, and reserve no more than 1,000,000 original array-element inspections per traversal call. The stability read must equal the first length. Capture rejects an invalid/unreadable/over-budget candidate as unknown. The host visits the rejected current bundle as an opaque leaf, preserving previously visited outer siblings.

## Grounded implementation surface

- providers/FormErrorContext/utils/createFormErrorService.ts owns capture. Move failure-value reads and record construction into a dedicated try/catch inside capture. On inspection failure, build an opaque fallback record with RenderFailed, message "Unable to inspect captured failure", original error identity, original origin/path/componentStack, and no partially read details. Keep the existing report try/catch separate so onError failures follow reportFailureToHost.
- providers/FormErrorContext/utils/isReportedFailureBundle.ts keeps its independent iterative lists/visited traversal. Add local remaining=1_000_000. For each array read length into one local, validate integer/range/budget, reserve length, iterate that fixed bound and verify the final length is unchanged. Existing seen/handlerFailures precedence and revisit-unknown semantics remain.
- core/engine/write/utils/report/readFailureBundle.ts keeps its guarded own-element snapshot and receives a per-call mutable budget object from forEachFailureLeaf. It reserves a valid candidate length before inspecting indices, including failed attempts, and verifies the final length before returning a snapshot. JSDoc states that it consumes the supplied inspection budget.
- core/engine/write/utils/report/forEachFailureLeaf.ts creates one budget for the complete call and passes it to root/nested reads. Callback execution stays outside input-read catches. Frame stack, depth-first element order, visited root seed and public exports stay the same.
- No new module boundary or public export. No permanent runtime fields. Per-call time and temporary memory are bounded by O(min(N,1_000_000)); each expanded array has one snapshot, and existing deep50,000 tests remain valid.

## Tests before implementation

New unit files stay in each owning fractal's existing __tests__ or report/__tests__, with at most32 cases per test-record and15 per spec document.

1. capture top-level code getter, SchemaFormError details getter and throwing toString: one opaque record, exact identity/fallback/origin/path/componentStack, no throw. Add a metadata-inspection guard removal mutation.
2. Each traversal: Proxy lengths NaN,-1,"0",0.5; nested length1 thenInfinity with virtual own known indices; appending index getter. Fuses/read counts bound each test even on the broken implementation. Add length-validation, fixed-bound/stability and budget mutations for both traversals. Add over-budget wide and shared nested-budget cases, and retain deep50,000 guards.
3. Existing behavior characterization (expected green at d68072d1a): onError throws bundle[X,Y] at capture handler, flushRootLoad catch, resetRootLoad buffered-record catch, deliverChainRecords handler catch, reportValidationFailure handler catch. Test reportValidationFailure original bundle at its final sink separately. Preserve exact host count/order/identity and restore console/global mocks.
4. Slot malformed MultipleErrors details.errors not array reports the same bundle exactly once.
5. One raw-sink mutation per six listed routing sites and a malformed-slot-drop mutation must fail its named test.

Save case names, red/guard classification, commands/exits, raw JSON, mutation definitions and original/restored source hashes. Snapshot final source bytes before each mutation. Rerun all12 existing mutations from the parent task plus the new mutations, adapting transformations to the final source without changing what each mutation removes. Every required named assertion must fail for the semantic reason, not a missing import.

## Records first and preservation

Before product edits update FormErrorContext and write DETAIL to the widened safety, bounded/stable lengths, shared budget and opaque host fallback. Keep sink exceptions distinct.
- Change only the attribution phrase above decision lines82/85 to "코디네이터 판정에 따라"; preserve their line positions.
- Restore core/errors Last Updated contract-reference lines verbatim from61457653a, below2026-11-02 and one blank line.
- Update DR16C decision wording through the canonical review source and sup-insert protocol: preserve existing decisions/citations, append an Amendment16 superseding decision and use sup-insert for ERROR-028 rather than directly rewriting ledger content.
- Correct current docs/results/PR wording to allow malformed/revisited/unreadable bundles at the final sink. Preserve prior immutable test artifacts; add Amendment16 evidence and superseding result text.

## Gates and handoff

External gates.md uses executable check.py commands and literal markers.
G1 confirms every new safety regression fails on d68072d1a, characterization routes/slot pass, and original legacy criteria remain present.
G2 checks final focused unit/render/react18 and all new cases passed.
G3 checks all old/new mutation IDs, named failed assertions, exact source restoration and final green.
G4 checks attribution/line positions, verbatim restored references, sup-insert and quote wording, 26 ledger checks against61457653a, fresh FCA comparison with no unexplained new findings/diagnostics.
G5 checks full sequential lint0warnings/typecheck/build+artifact/7Vitest projects/importModel and public declarations.
G6 checks no added machine paths (including decoded gzip), package version unchanged, no tracked runtime output, configured author/no trailers, new commit(s) above d68072d1a, clean tree and all PR URLs pinned to final HEAD.

Run full gates on final code; preserve raw JSON/logs and normalized durable evidence. Reuse the existing61457653a ledger/FCA baseline only while unchanged; rerun final ledger checks as required. Independent review closes substantial new changes; fix findings and rerun only invalidated checks. Keep the local branch, write the re-pinned Korean PR body, then worker_done exactly once for task_b047e62d5e0c / ctx_db931826d350.

## Scoped review corrections (R1/R2 accepted)

R1: Before repository edits, am16/check.py is written and syntax-checked. criteria.json fixes each new test's ID, file, exact title, base red/guard status and semantic failure regex, every legacy final case's file/title/project/status, and a fixed old/new mutation ID-to-failed-title set. red-provenance.json binds the criteria hash and all affected product-source SHA-256 bytes to d68072d1a. Missing files, duplicate/missing cases, collection failures, unexpected skip/todo, nonzero command exits, unknown statuses, hash mismatches or failed assertions abort without an EXPECT marker. G1/G2 consume raw Vitest assertions; G3 consumes every mutation's raw failed assertions and before/changed/restored source hashes plus restored green. G4 reads the actual canonical review/ledger/doc text, verbatim references from git,26 raw baseline/final ledger logs and FCA raw finding/diagnostic multisets. G5 consumes ordered command start/end/exit and source hashes, actual suite/case counters, build markers and declaration semantics. G6 recomputes source/gzip path/version/author/trailer/ancestry/clean-tree/PR-link conditions from Git and files; no self-declared summary is sufficient.

R2: Add a mandatory host failed-snapshot-budget case: root[A,bad,good,H], bad length600000 throws on its last index, good length400000 is readable. Root reservation4 plus bad reservation leaves399996, so final host is exactly[A,bad,good,H] and good's first index getter is never read. A separate m17-refund-failed-snapshot mutation charges only successful snapshots and must fail this case. Connect it to G1/G2/G3. Add the suggested fallback-handler case: opaque capture still delivers once and onError throwing[X,Y] sends exactly[X,Y] without a second callback. Add separate fixed-loop-bound and final-stability mutations in both traversals.

Coordinator reply msg_b2469c416d01 confirms reportValidationFailure handler expectation[X,Y,E], no-reporter original-bundle expectation[X,Y], and separate mutations each failing only its own test.

Scoped self-review: grounded-only after the independent rework report. R1 is covered by the concrete check.py and explicit input/failure contract above; R2 has a precise distinguishing input and mutation. Existing paths and source behavior were read directly. No implementation decision remains unresolved. Parent/skill scratch placement exception remains in force. Independent implementation review will inspect the completed diff.


Mutation note: removing only integer/range validation still rejects NaN at the final stability comparison because NaN !== NaN. Keep that mutation narrow and require its negative/string-zero/fraction cases to fail; NaN remains a required BASE-red/final-green case. Predicate input-guard removal is tested directly (including a prototype-only instance for the unsafe recursive mutation), while capture guard removal is separate, per msg_b470794f1d75.

Final scope clarifications: msg_b470794f1d75 keeps predicate/capture mutations narrow; direct predicate tests cover throwing shapes and a prototype-only instance. msg_3349cf91267b reply confirms fixed fallback only for unreadable outer values; a readable outer keeps its metadata when nested inspection returns false/unknown. Baseline33 new cases:21 red and12 guards. Final mutation list has29 IDs; all10 product-source hashes are verified before/after every mutation.

Full unit exposed S1 in the new RootNodeContext fixture: it imported the sibling internal createFormErrorService. Replace that fixture with a FormErrorService mock imported as a type through the sibling entry point. Targeted root/importModel5 cases pass; the two affected routing mutations were rerun. BASE red/guard and focused unit were rechecked with the final fixture. Preserve the failed full run and rerun full gates. Product source bytes remain unchanged.

Evidence P2 resolution: hash-run-inputs.py records live digests before/after every full command for2967 package src/script/Storybook-config/compiler/workspace-lock inputs, with observation times. The full sequence is rerun rather than retrofitting old records. G5 now matches every exact command/project, source digest/count/timing, current manifest bytes, three runtime build-marker hashes, current/baseline declaration input manifests, and reruns the copied unchanged declaration comparator with actual exit/tool/input/result hashes. Earlier full attempts and review reports are preserved; the latest manual resolution is not presented as an independent reviewer verdict.
