// Measures one row in one process. run.mjs copies this directory to <tree>/.speed/
// and runs it there, so every bare import in a row resolves inside that tree.
import { performance } from "node:perf_hooks";

const [rowId, batchArg] = process.argv.slice(2);
const row = (await import(`./rows/${rowId}.mjs`)).default;
const { run, check = () => true, before, after } = await row.setup();
const isRender = row.kind === "render";
const fail = (reason) => {
  console.log(JSON.stringify({ error: reason }));
  process.exit(1);
};

/** Times `count` back-to-back calls; micro rows only. Returns [ms, last result]. */
const timeBatch = (count) => {
  let sink;
  const start = performance.now();
  for (let i = 0; i < count; i++) sink = run();
  return [performance.now() - start, sink];
};

/** Times `count` operations and sums only the `run` regions; `before`, check and `after` stay untimed. */
const timeRenders = async (count) => {
  let total = 0;
  for (let i = 0; i < count; i++) {
    if (before) await before();
    const start = performance.now();
    const result = await run();
    total += performance.now() - start;
    if (!check(result)) fail("check failed");
    if (after) await after(result);
  }
  return total;
};

const { pkg, fn, input, inputKind, kind } = row;
const meta = { pkg, fn, input, inputKind, kind };
const samples = [];
if (isRender) {
  let batch = Number(batchArg) || 1;
  const warmEnd = performance.now() + (row.warmMs ?? 1000);
  while (performance.now() < warmEnd) await timeRenders(batch);
  // Calibration slot (batchArg 0): about 10 ms of timed work per sample, at most
  // 100 ms of wall time so a slow untimed `before` or `after` cannot stall the run.
  if (batchArg === "0") {
    const wallStart = performance.now();
    const timed = await timeRenders(20);
    const wall = performance.now() - wallStart;
    batch = Math.max(
      1,
      Math.min(Math.ceil(200 / timed), Math.floor(2000 / wall)),
    );
  }
  globalThis.gc();
  for (let i = 0; i < (row.samples ?? 40); i++)
    samples.push(((await timeRenders(batch)) * 1e6) / batch);
  console.log(JSON.stringify({ meta, batch, samples }));
} else {
  if (!check(run())) fail("check failed");
  let batch = Number(batchArg) || 1;
  const warmEnd = performance.now() + 300;
  while (performance.now() < warmEnd) timeBatch(batch);
  // Calibration slot (batchArg 0): find the batch that lasts 5 ms on warm code.
  if (batchArg === "0") while (timeBatch(batch)[0] < 5) batch *= 2;
  globalThis.gc();
  for (let i = 0; i < (row.samples ?? 40); i++) {
    const [elapsed, sink] = timeBatch(batch);
    if (!check(sink)) fail("check failed");
    samples.push((elapsed * 1e6) / batch);
  }
  console.log(JSON.stringify({ meta, batch, samples }));
}
