/**
 * M4 — cost of the immutable update itself (ADR 0006's stated risk): setting a
 * leaf at depth 3 when one level on the path is wide, versus mutating in place.
 *
 * Each case runs in a FRESH PROCESS. A single object spread is the whole
 * operation here, so its inline-cache state dominates the number: measuring the
 * cases in one process made the 1,000-key write read 119.6 µs where an isolated
 * run reads 1.1 µs. Guard measurements (M1–M3, M5) do not need this — their
 * call sites are megamorphic by construction and cross-checked against each
 * other — but this one does.
 *
 * Run directly to drive every case; `SPIKE_CASE=<index>` measures one and
 * prints its JSON.
 */
import { execFileSync } from 'node:child_process';
import { environment, measure, writeResult } from './lib.mjs';

const WIDE_KEYS = 1000;
const LONG_ITEMS = 10000;

/** `{ a: { b: { ...width keys } } }` — the leaf sits in the wide level. */
function wideObjectTree(width) {
  const b = {};
  for (let i = 0; i < width; i++) b[`k${i}`] = i;
  return { a: { b, sibling: 1 }, other: 2 };
}

/** `{ a: { list: [ ...count items ] } }` — the leaf is one array slot. */
function longArrayTree(count) {
  const list = new Array(count);
  for (let i = 0; i < count; i++) list[i] = { v: i };
  return { a: { list, sibling: 1 }, other: 2 };
}

const objectWrite = {
  immutable: (root, i) => ({ ...root, a: { ...root.a, b: { ...root.a.b, k0: i } } }),
  mutation: (root, i) => {
    root.a.b.k0 = i;
    return root;
  },
};

const arrayWrite = {
  immutable: (root, i) => {
    const list = root.a.list.slice();
    list[0] = { v: i };
    return { ...root, a: { ...root.a, list } };
  },
  mutation: (root, i) => {
    root.a.list[0] = { v: i };
    return root;
  },
};

const cases = [];
for (const [label, width] of [['object 10 keys', 10], [`object ${WIDE_KEYS} keys`, WIDE_KEYS]]) {
  for (const kind of ['immutable', 'mutation']) {
    cases.push({
      name: `depth-3 leaf, ${label}`,
      kind,
      build: () => wideObjectTree(width),
      write: objectWrite[kind],
    });
  }
}
for (const [label, count] of [['array 100 items', 100], [`array ${LONG_ITEMS} items`, LONG_ITEMS]]) {
  for (const kind of ['immutable', 'mutation']) {
    cases.push({
      name: `depth-3 leaf, ${label} (slice copy)`,
      kind,
      build: () => longArrayTree(count),
      write: arrayWrite[kind],
    });
  }
}

// 1,000 chained keystrokes into the same leaf, measured as one unit.
const sequentialCases = [
  {
    name: `1000 keystrokes, object ${WIDE_KEYS} keys`,
    sequential: true,
    build: () => wideObjectTree(WIDE_KEYS),
    write: objectWrite.immutable,
  },
  {
    name: `1000 keystrokes, array ${LONG_ITEMS} items`,
    sequential: true,
    build: () => longArrayTree(LONG_ITEMS),
    write: arrayWrite.immutable,
  },
];

const all = [...cases, ...sequentialCases];

if (process.env.SPIKE_CASE !== undefined) {
  const c = all[Number(process.env.SPIKE_CASE)];
  let root = c.build();
  const inner = c.sequential ? 1000 : 1;
  const stats = measure(
    (n) => {
      let checksum = 0;
      for (let r = 0; r < n; r++) {
        for (let i = 0; i < inner; i++) root = c.write(root, i);
        checksum += root.other;
      }
      return checksum;
    },
    { warmupMs: 2000, samples: 11 },
  );
  process.stdout.write(
    JSON.stringify({ name: c.name, kind: c.kind ?? null, sequential: !!c.sequential, ...stats }),
  );
} else {
  const collected = all.map((_, index) =>
    JSON.parse(
      execFileSync(process.execPath, [new URL(import.meta.url).pathname], {
        env: { ...process.env, SPIKE_CASE: String(index) },
        encoding: 'utf8',
      }),
    ),
  );
  for (const r of collected) {
    process.stderr.write(
      `${r.name} [${r.kind ?? 'chained'}]: ${
        r.sequential ? `${(r.medianNs / 1e6).toFixed(2)}ms` : `${r.medianNs.toFixed(0)}ns`
      }\n`,
    );
  }
  console.log(
    writeResult('m4', {
      environment: environment(),
      rows: collected.filter((r) => !r.sequential),
      sequential: collected
        .filter((r) => r.sequential)
        .map((r) => ({ level: r.name.replace('1000 keystrokes, ', ''), ...r })),
    }),
  );
}
