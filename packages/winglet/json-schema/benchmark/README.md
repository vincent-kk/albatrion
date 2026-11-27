# JSONSchemaScanner measurement harness

Standalone Node scripts used to measure correctness, behaviour equivalence,
speed, stress resilience and memory of `JSONSchemaScanner` / `JSONSchemaScannerAsync`.
They load the **built** scanner entry points, so
run `yarn build` first, then invoke a script directly.

| Script                | What it measures                                                                                                                                      |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `verify.mjs`          | Correctness invariants (original isolation, escaping, guards, error reset, async mutate, …). Prints PASS/FAIL JSON.                                   |
| `equivalence.mjs`     | Visit-sequence + resolver-call + output snapshot over a battery of schemas. Emits a deterministic JSON snapshot used as a behaviour-equivalence gate. |
| `bench.mjs`           | Traversal speed (sync / async / noop-callback) across corpora + resolver-call counts.                                                                 |
| `stress.mjs`          | Harsh cases: 200k-wide, 20k-deep, cycles, adversarial junk, reused instances. Exits non-zero on any failure.                                          |
| `memleak.mjs`         | Retained-heap growth across batches (run with `--expose-gc`).                                                                                         |
| `compare.mjs`         | Alternating baseline/current timings, per-case ratios and group geometric means. Rejects differing visit counts or output sizes before timing.        |
| `equivalenceDiff.mjs` | Named-case snapshot comparison, with explicit allowances and required changes.                                                                        |

```bash
yarn build

node benchmark/verify.mjs
node benchmark/equivalence.mjs
node benchmark/bench.mjs
node benchmark/stress.mjs
node --expose-gc benchmark/memleak.mjs
```

Run comparison commands from the repository root; relative baseline paths resolve
there. Both comparison tools reject a build older than its source, including tests,
so rebuild after editing source files. Baselines remain frozen and are not subject
to the current source freshness check.

```bash
yarn workspace @winglet/json-schema build
node packages/winglet/json-schema/benchmark/equivalenceDiff.mjs --baseline path/to/equivalence.json
node packages/winglet/json-schema/benchmark/compare.mjs --baseline path/to/dist --max-slowdown 1.08 --max-speedup 1.08
yarn workspace @winglet/json-schema test --run benchmark/__tests__
```

`equivalenceDiff.mjs` compares JSON values independently of object key order.
`--allow refResolve,refChain` permits only those cases to change;
`--require-changed refChain` also rejects an unchanged named case. Missing cases,
unknown names and malformed snapshots fail even when allowances are supplied.

`compare.mjs` reports baseline/current median time ratios (larger means faster).
The boolean-heavy corpus measures the callback-free path: both builds elide boolean frames.
Its correctness fingerprint counts object visits and output bytes, so the counting
callback does not turn newly observable boolean leaves into unequal timed work.
`--min noCallback=1.15,noopEnterExit=1.4` constrains group geometric means;
`--max-slowdown` and `--max-speedup` constrain every individual case. It measures
scan-only traversal, sparse/dense mutation, reference resolution with resolver
creation/reuse, and the first `getValue()` call separately from its preceding scan.
Each case warms both builds for at least 1.5 seconds, then measures 31 paired
batches targeting at least 30 milliseconds per build. Paired batches alternate
execution order to reduce drift; measurement noise can
still cause a threshold failure, which must be investigated rather than accepted
by loosening the threshold.

Only successful comparisons print `COMPARE_OK` or `EQUIVALENCE_DIFF_OK`.
Comparison failures, failed invariants in `verify.mjs`, and suspected leaks in
`memleak.mjs` exit non-zero. Memory probes require `--expose-gc`.

Not published to npm (only `dist`, `docs`, `README.md` ship).

Reference workloads use `createReferenceResolver` from the measured current build.
The frozen-build adapter uses its pointer callback API; `refHeavy/createResolver`
includes indexing and template construction, while `refHeavy/reuseResolver`
retains the provider and its per-target/per-host template cache between scans.
Both adapters must have identical visit counts and serialized output sizes.
`observeResolver.mjs` forwards the full context protocol while counting calls;
provider calls still occur once per reference occurrence even when a template is cached.
The equivalence snapshot retains the existing exit-field projection for compatibility,
deriving it from `entry.references` in the current build.

CPU profiles use the comparison workloads, including both resolver adapters and
sparse/dense output cases. Select a group or an exact case; `getValue` profiles
include its preparation scan, so inspect output functions separately from scanning.
Pass `--build <dist>` to profile a frozen or immediately preceding build with the
same workload and profiler settings.

To diagnose cross-group type feedback, `compare.mjs --groups` selects a comma-separated
group list and `--order reverse` reverses group order while retaining each group's case
order. An explicit `--order` lists every selected group once. Omit both flags for the
unchanged gate order and complete corpus; neither option changes paired sampling.
From the repository root:

```bash
node packages/winglet/json-schema/benchmark/compare.mjs --baseline .seiri/tasks/json-schema-scanner-overhaul/baseline/dist-t4 --groups noopEnterExit,asyncNoop
node packages/winglet/json-schema/benchmark/compare.mjs --baseline .seiri/tasks/json-schema-scanner-overhaul/baseline/dist-t4 --order reverse
```

```bash
node --cpu-prof --cpu-prof-dir=/tmp --cpu-prof-name=mutation.cpuprofile benchmark/profile.mjs --group mutation --rounds 1000
node --cpu-prof --cpu-prof-dir=/tmp --cpu-prof-name=deep.cpuprofile benchmark/profile.mjs --case 'noCallback/deep(400)' --rounds 10000
```
