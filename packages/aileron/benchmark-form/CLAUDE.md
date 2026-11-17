# Benchmark Form

This private workspace owns the Node and production-browser form benchmarks. Keep
measurement and reporting changes here; product engine changes belong elsewhere.
Read README.md for the measurement contract and command arguments.

## Commands

Run these from the repository root with yarn:

- `yarn workspace @aileron/benchmark-form typecheck`
- `yarn workspace @aileron/benchmark-form typecheck:browser`
- `yarn workspace @aileron/benchmark-form lint`
- `yarn workspace @aileron/benchmark-form test`
- `yarn workspace @aileron/benchmark-form bench:probe`
- `yarn workspace @aileron/benchmark-form bench:form --baseline <ref> --runs 20 --warmup 3 --out <directory>`

Build the candidate with `node --import tsx
packages/aileron/benchmark-form/browser-bench/core/prepareCheckout.mjs .` before
comparing distributions. A baseline ref is installed and built independently.
Generated results stay outside source commits.

## Browser measurement contract

Preserve `durationMs` and the validator-run meaning of `counts.validations`.
Direct blocking is the native capture-to-bubble handler duration: typing uses
writes 2–20, first-key uses its single write. Mount/rebuild blocking is null;
unobserved Long Tasks mean below 50 ms, never zero. Preserve original Long Task
duration separately from its overlap with the observation window.

Wrap compile and validation before registering the plugin. Record synchronous
return and Promise settlement separately. Attribute validation by the measured
leaf value; attribute visible feedback only to a marker transition before the
next capture. Retain exact/censored/noChange/superseded counts and repeat exact
counts. Feedback averages for typing are conditional on exact writes 2–20.

The marker renderer uses `FieldRenderer` and `ErrorVisibility.Always` for the current API.
The isolated 0.x adapter selects the baseline renderer and display props only when
the measured module does not export the current policy enum. Validated
fixtures add the invalid `/probe` leaf, while typing starts from a valid value.
Only the measured path receives a marker.

Calibrate ten empty rAF intervals and record both `frameIntervalMs` and
`frameIntervalNominalMs` (1000/60 or 1000/120) in every sample. Summary frame
distributions retain each variant's nominal periods. Reject unsupported cadence
or a median outside nominal ±3 ms. Final CI artifacts require 60 Hz and
13.7–19.7 ms. The UX frame budget always remains 16.7 ms.
Record `frameBudget60` (16.7 ms) and `frameBudget120` (8.3 ms) gap overflow and
over-budget frame counts in samples and summary distributions. Keep the existing
gap fields and `budget` as the primary 16.7 ms view; `budget120` is additive.
For each blocking budget show fraction of frame, overflow ms and whether the
baseline overflowed too. The secondary budget is informational and never enters
RAIL grading or the weighted exchange.

Wait for driver completion, the last value's settled validation and expected
marker state, no pending validation, then two quiet frames or 250 ms without
activity. The independent 5,000 ms cap includes calibration and stalled frames.

Keep the canonical observability table and its script mirror equal. Required
latencies cannot be missing; only Long Task statistics use below-threshold and
mixed null semantics. Preserve metric thresholds and null ratios for a zero
baseline. Weights and their rationale live in `fixtures/core-weights.json`.

The after-load first-key case waits for at least one onValidate report, a recorded
validation run, and no pending run. Its 1,000 ms ceiling fails the sample when
the condition is unmet. Both bundles use this wait, which is excluded from
durationMs. Report both first-key rows: the immediate row includes deferred
compile overlap, while the after-load row isolates key latency.

## Evidence and reports

`bench:probe` reports nominal cadence and raw/floor/net observer overhead. Require
net ≤1 ms/s, the same-run bare-loop floor ≤2.5 ms/s, and raw self-time ≤2.5 ms/s. Never replace these gates
with a silent host-specific exemption.

Run `node packages/aileron/benchmark-form/scripts/checkSmokeSamples.mjs
<samples.json> <summary.json>` on the prescribed six-case, two-run smoke.
Use `--profile remaining` for the prescribed four remaining browser cases with
one run and one warmup; all observability assertions and raw-summary checks stay
mandatory in both profiles.
`checkFinalRun.mjs` verifies CI artifacts; `renderFinalReport.mjs` recomputes
statistics and weighted exchanges from samples; `checkReportTables.mjs` compares
the generated report block. The report preserves the legend and five tables.

Follow repository rules: named exports, one exported function per file,
single-consumer helpers one level below their caller, declaration JSDoc, and no
source history comments. This workspace is excluded from automated FCA scans;
review placement manually.
