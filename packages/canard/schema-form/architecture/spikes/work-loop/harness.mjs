/**
 * Timing harness following `reviews/round-1.md` §2: a calibrated internal
 * batch (~25 ms) divided by its iteration count, >= 2 s warm-up, >= 11
 * samples, median reported with spread. tinybench is deliberately NOT used —
 * round-1 §2 measured it 4-6x high below 100 ns because it times every call,
 * and several numbers here sit in that range.
 *
 * Callers MUST cycle inputs and return a value: a repeated argument lets V8
 * hoist the call out of the loop (0.7 ns readings), and an unconsumed result
 * lets it drop the call entirely.
 */

/** Accumulated so the optimizer cannot drop measured work. */
export let checksum = 0;

const nowNs = () => process.hrtime.bigint();

/**
 * Consume a measured result. Numbers add, strings add their length, objects
 * add 1 — enough to keep the call live without dominating the measurement.
 */
export function consume(v) {
  if (typeof v === 'number') checksum += v;
  else if (typeof v === 'string') checksum += v.length;
  else if (v !== null && v !== undefined) checksum += 1;
  return v;
}

/**
 * Measure one operation.
 * @param {object} spec
 * @param {string} spec.name label
 * @param {(i: number) => *} spec.op one iteration; `i` is the cycling index
 * @param {() => void} [spec.reset] run between batches, outside the timed span
 * @param {number} [spec.samples] timed batches, default 11
 * @param {number} [spec.warmupMs] warm-up floor, default 2000
 * @param {number} [spec.batchMs] calibration target per batch, default 25
 * @param {number} [spec.maxIter] cap on iterations per batch
 * @returns {{name, medianNs, p25Ns, p75Ns, minNs, spreadPct, iter, samples}}
 */
export function measure(spec) {
  const {
    name,
    op,
    reset,
    samples = 11,
    warmupMs = 2000,
    batchMs = 25,
    maxIter = 1e9,
  } = spec;

  let iter = 1;
  for (;;) {
    if (reset) reset();
    const t0 = nowNs();
    for (let i = 0; i < iter; i++) consume(op(i));
    const dt = Number(nowNs() - t0) / 1e6;
    if (dt >= batchMs || iter >= maxIter) break;
    const scaled = dt <= 0.05 ? iter * 64 : Math.ceil(iter * (batchMs / dt) * 1.2);
    iter = Math.min(maxIter, Math.max(iter + 1, scaled));
  }

  const warmEnd = Date.now() + warmupMs;
  let cycle = 0;
  while (Date.now() < warmEnd) {
    if (reset) reset();
    for (let i = 0; i < iter; i++) consume(op(cycle++));
  }

  const perOp = new Array(samples);
  for (let s = 0; s < samples; s++) {
    if (reset) reset();
    const t0 = nowNs();
    for (let i = 0; i < iter; i++) consume(op(cycle++));
    perOp[s] = Number(nowNs() - t0) / iter;
  }
  perOp.sort((a, b) => a - b);

  const at = (q) => perOp[Math.min(samples - 1, Math.floor(samples * q))];
  const medianNs = at(0.5);
  const p25Ns = at(0.25);
  const p75Ns = at(0.75);
  return {
    name,
    medianNs,
    p25Ns,
    p75Ns,
    minNs: perOp[0],
    spreadPct: medianNs > 0 ? ((p75Ns - p25Ns) / medianNs) * 100 : 0,
    iter,
    samples,
  };
}

/**
 * Measure an async operation that must be awaited each iteration (the current
 * library's drain lanes). The awaited floor is reported, never subtracted.
 * @param {object} spec same shape as {@link measure}, `op` returns a promise
 */
export async function measureAsync(spec) {
  const {
    name,
    op,
    reset,
    samples = 9,
    warmupMs = 2000,
    iter = 1,
  } = spec;

  const run = async (c) => {
    if (reset) await reset();
    const t0 = nowNs();
    for (let i = 0; i < iter; i++) consume(await op(c + i));
    return Number(nowNs() - t0) / iter;
  };

  let cycle = 0;
  const warmEnd = Date.now() + warmupMs;
  while (Date.now() < warmEnd) {
    await run(cycle);
    cycle += iter;
  }

  const perOp = new Array(samples);
  for (let s = 0; s < samples; s++) {
    perOp[s] = await run(cycle);
    cycle += iter;
  }
  perOp.sort((a, b) => a - b);
  const at = (q) => perOp[Math.min(samples - 1, Math.floor(samples * q))];
  const medianNs = at(0.5);
  return {
    name,
    medianNs,
    p25Ns: at(0.25),
    p75Ns: at(0.75),
    minNs: perOp[0],
    spreadPct: medianNs > 0 ? ((at(0.75) - at(0.25)) / medianNs) * 100 : 0,
    iter,
    samples,
  };
}

/** Format nanoseconds as ns / us / ms with three significant digits. */
export function fmt(ns) {
  if (ns < 1e3) return `${ns.toFixed(1)} ns`;
  if (ns < 1e6) return `${(ns / 1e3).toFixed(2)} us`;
  return `${(ns / 1e6).toFixed(2)} ms`;
}

/** Print one result as a JSON line for the collector, plus a readable line. */
export function report(result, extra) {
  const row = { ...result, ...extra, checksum };
  process.stdout.write(`##RESULT## ${JSON.stringify(row)}\n`);
  process.stderr.write(
    `  ${result.name.padEnd(52)} ${fmt(result.medianNs).padStart(10)}  ` +
      `+/-${result.spreadPct.toFixed(1)}%  (iter=${result.iter})\n`,
  );
}
