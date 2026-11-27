#!/usr/bin/env node
// Speed comparison driver; README.md beside this file states the usage and the row contract.
//   node benchmarks/compare/run.mjs --a <baseline tree> --b <candidate tree> --rows <row dir> --out <dir> [--only <id prefixes>] [--rounds 24]
// Each round runs three fresh processes (A1 = a, A2 = a, B = b) in a rotating order.
// Verdict: B/A1 by min and p10; the A2/A1 control must stay within 0.98-1.02.
import { spawnSync } from "node:child_process";
import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { cpus } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";

const ORDERS = [
  "A1 A2 B",
  "A1 B A2",
  "A2 A1 B",
  "A2 B A1",
  "B A1 A2",
  "B A2 A1",
].map((o) => o.split(" "));
const here = dirname(fileURLToPath(import.meta.url));
const { values: args } = parseArgs({
  options: {
    a: { type: "string" },
    b: { type: "string" },
    out: { type: "string" },
    rows: { type: "string" },
    only: { type: "string", default: "" },
    rounds: { type: "string", default: "24" },
    profile: { type: "boolean", default: false },
  },
});
const rounds = Number(args.rounds);
if (!args.a || !args.b || !args.rows || !args.out)
  throw new Error("--a, --b, --rows and --out are required");
if (!(rounds > 0) || rounds % 6)
  throw new Error("--rounds must be a positive multiple of 6");
if (existsSync(args.out)) throw new Error(`${args.out} already exists`);

/**
 * Machine-wide turn-taking: two comparisons at once distort each other, so each
 * run takes a ticket, waits until it is the oldest live ticket, then holds the lock.
 * No signal handlers: the waits and slot runs are synchronous, so a handler would
 * never run and would only swallow the signal; a killed run's ticket and lock are
 * recognized as stale by its process id.
 */
const QUEUE = "/tmp/benchmarks-compare.queue";
const LOCK = "/tmp/benchmarks-compare.lock";
const isAlive = (pid) => {
  try {
    return process.kill(pid, 0);
  } catch (error) {
    return error.code === "EPERM";
  }
};
const pause = () =>
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 2000);
mkdirSync(QUEUE, { recursive: true });
const ticket = `${String(Date.now()).padStart(15, "0")}-${process.pid}`;
writeFileSync(join(QUEUE, ticket), "");
process.on("exit", () => {
  rmSync(join(QUEUE, ticket), { force: true });
  if (existsSync(LOCK) && readFileSync(LOCK, "utf8") === String(process.pid))
    rmSync(LOCK);
});
for (;;) {
  const live = readdirSync(QUEUE)
    .sort()
    .filter(
      (name) =>
        isAlive(Number(name.split("-")[1])) ||
        rmSync(join(QUEUE, name), { force: true }),
    );
  if (live[0] === ticket) break;
  pause();
}
for (;;) {
  try {
    writeFileSync(LOCK, String(process.pid), { flag: "wx" });
    break;
  } catch {
    const owner = existsSync(LOCK) ? Number(readFileSync(LOCK, "utf8")) : 0;
    if (owner && !isAlive(owner)) rmSync(LOCK, { force: true });
    else pause();
  }
}

const rowsDir = resolve(args.rows);
const trees = { A1: resolve(args.a), A2: resolve(args.a), B: resolve(args.b) };
for (const tree of new Set(Object.values(trees))) {
  rmSync(join(tree, ".speed"), { recursive: true, force: true });
  cpSync(rowsDir, join(tree, ".speed/rows"), { recursive: true });
  for (const file of ["slot.mjs", "dom.mjs", "css.mjs"])
    cpSync(join(here, file), join(tree, ".speed", file));
}
const prefixes = args.only.split(",");
const rowIds = readdirSync(rowsDir)
  .filter((file) => file.endsWith(".mjs"))
  .map((file) => file.replace(/\.mjs$/, ""))
  .filter((id) => prefixes.some((prefix) => id.startsWith(prefix)));

/** Runs one slot process; throws with the reason when it fails or times out. */
const runSlot = (slot, rowId, batch, nodeArgs = []) => {
  const child = spawnSync(
    process.execPath,
    [
      "--expose-gc",
      ...nodeArgs,
      join(trees[slot], ".speed/slot.mjs"),
      rowId,
      String(batch),
    ],
    {
      cwd: trees[slot],
      encoding: "utf8",
      timeout: 120_000,
      env: {
        ...process.env,
        NODE_ENV: "production",
        NODE_OPTIONS: "",
        SPEED_SLOT: slot,
      },
    },
  );
  const line = child.stdout?.trim().split("\n").pop();
  const output = line?.startsWith("{") ? JSON.parse(line) : {};
  if (child.status !== 0 || !output.samples)
    throw new Error(
      `${slot}: ${output.error ?? child.error?.message ?? child.stderr?.trim().split("\n").pop() ?? `exit ${child.status}`}`,
    );
  return output;
};

/** Nearest-rank 10th percentile of an ascending array. */
const p10 = (sorted) => sorted[Math.ceil(sorted.length * 0.1) - 1];

/** Measures one row and returns its record; a failing slot voids the row. */
const measureRow = (rowId) => {
  const record = { row: rowId };
  try {
    const { batch, meta } = runSlot("A1", rowId, 0);
    Object.assign(record, meta);
    const pool = { A1: [], A2: [], B: [] };
    for (let round = 0; round < rounds; round++)
      for (const slot of ORDERS[round % 6])
        pool[slot].push(...runSlot(slot, rowId, batch).samples);
    const stat = {};
    for (const slot of Object.keys(pool)) {
      const sorted = pool[slot].sort((x, y) => x - y);
      stat[slot] = {
        min: sorted[0],
        p10: p10(sorted),
        median: sorted[sorted.length >> 1],
      };
    }
    const ratio = (slot, key) => stat[slot][key] / stat.A1[key];
    Object.assign(record, {
      batch,
      stat,
      min: ratio("B", "min"),
      p10: ratio("B", "p10"),
      controlMin: ratio("A2", "min"),
      controlP10: ratio("A2", "p10"),
    });
    const isControlValid = [record.controlMin, record.controlP10].every(
      (value) => value >= 0.98 && value <= 1.02,
    );
    record.verdict = !isControlValid
      ? "void"
      : record.min <= 1.03 && record.p10 <= 1.03
        ? "pass"
        : "over";
  } catch (error) {
    Object.assign(record, { verdict: "void", reason: error.message });
  }
  return record;
};

const ref = (tree) =>
  existsSync(join(tree, ".speed-ref"))
    ? readFileSync(join(tree, ".speed-ref"), "utf8").trim()
    : "unknown";
const run = {
  a: { dir: trees.A1, ref: ref(trees.A1) },
  b: { dir: trees.B, ref: ref(trees.B) },
  node: process.version,
  cpu: cpus()[0].model,
  rounds,
  rows: [],
};
const fixed = (value) => (value === undefined ? "" : value.toFixed(3));
mkdirSync(args.out, { recursive: true });
// --profile: instead of comparing, write one CPU profile per row and tree to <out>/<row>/<a|b>.
if (args.profile) {
  for (const rowId of rowIds) {
    const { batch } = runSlot("A1", rowId, 0);
    for (const [slot, side] of [
      ["A1", "a"],
      ["B", "b"],
    ])
      runSlot(slot, rowId, batch, [
        "--cpu-prof",
        `--cpu-prof-dir=${resolve(args.out, rowId, side)}`,
      ]);
    console.log(`${rowId}: profiled`);
  }
  process.exit(0);
}
for (const rowId of rowIds) {
  const record = measureRow(rowId);
  run.rows.push(record);
  console.log(
    `${rowId}: ${record.verdict} min ${fixed(record.min)} p10 ${fixed(record.p10)} control ${fixed(record.controlMin)}/${fixed(record.controlP10)} ${record.reason ?? ""}`,
  );
  writeFileSync(join(args.out, "run.json"), JSON.stringify(run, null, 1));
}
const table = run.rows.map(
  (r) =>
    `| ${r.row} | ${r.pkg} | ${r.fn} | ${r.input} | ${r.inputKind} | ${fixed(r.min)} | ${fixed(r.p10)} | ${fixed(r.controlMin)} / ${fixed(r.controlP10)} | ${r.verdict}${r.reason ? ` (${r.reason})` : ""} |`,
);
writeFileSync(
  join(args.out, "report.md"),
  [
    `A ${run.a.ref} · B ${run.b.ref} · ${run.node} · ${run.cpu} · ${rounds} rounds`,
    "",
    "| row | package | function | input | input kind | min ratio | p10 ratio | control (min / p10) | verdict |",
    "|---|---|---|---|---|---|---|---|---|",
    ...table,
    "",
  ].join("\n"),
);
