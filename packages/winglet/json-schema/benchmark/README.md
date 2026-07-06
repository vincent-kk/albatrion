# JsonSchemaScanner measurement harness

Standalone Node scripts used to measure correctness, behaviour equivalence,
speed, stress resilience and memory of `JsonSchemaScanner` / `JsonSchemaScannerAsync`.
They load the **built** scanner through the package's own subpath exports, so
run `yarn build` first, then invoke a script directly.

| Script            | What it measures                                                                                                                                      |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `verify.mjs`      | Correctness invariants (original isolation, escaping, guards, error reset, async mutate, …). Prints PASS/FAIL JSON.                                   |
| `equivalence.mjs` | Visit-sequence + resolver-call + output snapshot over a battery of schemas. Emits a deterministic JSON snapshot used as a behaviour-equivalence gate. |
| `bench.mjs`       | Traversal speed (sync / async / noop-callback) across corpora + resolver-call counts.                                                                 |
| `stress.mjs`      | Harsh cases: 200k-wide, 20k-deep, cycles, adversarial junk, reused instances. Exits non-zero on any failure.                                          |
| `memleak.mjs`     | Retained-heap growth across batches (run with `--expose-gc`).                                                                                         |

```bash
yarn build

node benchmark/verify.mjs
node benchmark/equivalence.mjs
node benchmark/bench.mjs
node benchmark/stress.mjs
node --expose-gc benchmark/memleak.mjs
```

To compare a change: capture each script's JSON output before and after, and
diff. `equivalence.mjs` output should stay byte-identical across any change that
is meant to preserve observable behaviour.

Not published to npm (only `dist`, `docs`, `README.md` ship).
