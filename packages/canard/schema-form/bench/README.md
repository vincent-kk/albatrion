# Benchmarks

`vitest bench` micro-benchmarks for schema-form core hot paths. Run in a Node
environment (no JSDOM) so they isolate schema-form's own cost from React mount
cost.

```bash
yarn bench            # run all benches once, print the table
yarn bench:watch      # re-run on change
```

## Render-delay regression guard (version-to-version)

`render-delay.bench.ts` exists to answer one question: **did a change between
two versions make the first render slower?** It does not freeze a single
number — it measures live every run, so you diff a baseline against a candidate.

Run both halves on the **same machine** (absolute numbers are hardware- and
load-dependent; only the delta is meaningful, which is why `bench/.results/` is
git-ignored rather than committed):

```bash
# 1. snapshot the recent / released version
git checkout <recent-version>
yarn bench:baseline          # writes bench/.results/baseline.json

# 2. diff the new version against it
git checkout <new-version>
yarn bench:compare           # runs live, prints a baseline-vs-current table
```

`bench:compare` prints each benchmark with its baseline time, current time, and
the ratio, so a render-delay regression shows up as a row that got slower.

### What the layers mean

`render-delay.bench.ts` tracks two layers across small / medium / large schemas
(5 → 150 terminals) so a regression points at its cause:

- `[mount]` — full node-tree construction, the headline render delay.
  - `validation off` — pure tree build.
  - `validation on` — default `ValidationMode`, so the per-mount validator
    guards (`stripSchemaExtensions` → `clone(schema)`) are on the hot path.
- `[guard]` — the isolated cost of the per-mount safety clones
  (`clone(schema)`, `clone(defaultValue)`), so their share of the mount can be
  read directly and watched version-to-version.

The other `*.bench.ts` files cover adjacent hot paths (node construction, branch
init, compute recalculation, event cascade, node lookup) and are included in the
same baseline/compare run.
