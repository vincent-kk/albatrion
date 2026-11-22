# compare

Compares two prepared trees of this repository, one row at a time. [`../DESIGN.md`](../DESIGN.md) gives the reasons for its design.

## Usage

```sh
node benchmarks/compare/run.mjs --a <baseline tree> --b <candidate tree> --rows <row dir> --out <new dir> [--only <id prefixes>] [--rounds 24]
```

- A tree is a full checkout with `yarn install` and every measured package built. An optional `.speed-ref` file at its root names its commit and is copied into the output.
- `--rows` is a directory of row files; `--only` keeps the rows whose file name starts with one of the comma-separated prefixes.
- `--rounds` is a multiple of 6 so that all six slot orders run equally.
- `--out` must not exist. It receives `run.json` (all statistics, rewritten after every row) and `report.md` (the verdict table).

The machine must be otherwise idle. The driver takes a ticket in `/tmp/benchmarks-compare.queue` and holds `/tmp/benchmarks-compare.lock` while it measures, so comparisons started meanwhile run one at a time in the order they were started instead of distorting each other.

## Profiling

Add `--profile` to the same command to find where a row spends its time instead of comparing: under the same lock, the driver runs the row once in each tree with `--cpu-prof` and writes the profiles to `<out>/<row>/a` and `<out>/<row>/b`. Open them in a profile viewer or compare self time per function. Always profile through the driver, never by starting a slot by hand, so a profile cannot overlap a comparison.

## How it runs

The driver copies `slot.mjs`, `dom.mjs` and the row directory into `<tree>/.speed/` of both trees and runs each slot there as `node --expose-gc .speed/slot.mjs <row> <batch>`. Bare imports in a row therefore resolve inside the measured tree. Each round starts three processes (A1 and A2 from the baseline tree, B from the candidate) in a rotating order. A calibration process in the baseline tree fixes the batch size for the row first.

Verdict per row: `pass` when B/A1 is at most 1.03 for both min and p10, `over` otherwise, `void` when the A2/A1 control leaves 0.98 to 1.02 or a slot fails. The driver never decides why a row is over.

## Row contract

A row is `<id>.mjs` with a default export:

```js
import { equals } from "@winglet/common-utils";

export default {
  pkg: "@winglet/common-utils", // report columns
  fn: "equals",
  input: "two independent 128-deep chains",
  inputKind: "plain", // or 'repaired': the input reaches a deliberately changed path
  kind: "micro", // or 'render'
  setup: () => {
    const left = chain();
    const right = chain();
    return {
      run: () => equals(left, right),
      check: (result) => result === true,
    };
  },
};
```

- `setup` runs once per process, may be async, and builds everything the operation consumes.
- `run` is the timed operation. A `micro` row is synchronous and timed in a tight loop, so it must be repeatable on the same input. A `render` row is timed one operation at a time: it may return a promise, `before()` (fresh input or state) runs untimed before every operation and `after(result)` (unmount, reset) after it. Use `render` for any operation that needs fresh state each time, rendering or not; the two timer reads add a constant to both arms, which pulls the ratio of an operation under about 2 µs toward 1, so say so in such a row.
- `check(result)` runs untimed and must return true; a false result voids the row.
- A render row imports `../dom.mjs` first, before `react-dom`, to get jsdom globals.
- Optional `samples` (default 40 batches per process) and, for render rows, `warmMs` (default 1000).
- Import packages by name only. A row that needs a library a plugin depends on (for example `antd`) resolves it from that plugin's directory, because the tree root may hoist a different version.

## Self-test

After changing `run.mjs` or `slot.mjs`, run both checks and compare with the expected values:

```sh
# Planted slowdown: the B slot does 10% more work, so the row reports about 1.10.
node benchmarks/compare/run.mjs --a <tree> --b <tree> --rows benchmarks/compare/selftest --out <new dir> --rounds 6
# Null run: the same tree on both sides, so every campaign row reports about 1.00.
node benchmarks/compare/run.mjs --a <tree> --b <tree> --rows <row dir> --out <new dir>
```

The driver passes the slot name to the process as `SPEED_SLOT` for the planted-slowdown row only; a real row never reads it.
