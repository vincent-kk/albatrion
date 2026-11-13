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
