/** Replay seeded page bootstrap, optionally retaining index multiplicities to explain its upper tail. */
export function replayBootstrap(
  before,
  after,
  { seed = 20261031, independent = false } = {},
) {
  let state = seed >>> 0;
  const random = () => {
    state += 0x6d2b79f5;
    let v = Math.imul(state ^ (state >>> 15), state | 1);
    v ^= v + Math.imul(v ^ (v >>> 7), v | 61);
    return ((v ^ (v >>> 14)) >>> 0) / 4294967296;
  };
  const p95 = (values) => {
    const ordered = [...values].sort((a, b) => a - b);
    return ordered.length
      ? ordered[Math.ceil(ordered.length * 0.95) - 1]
      : null;
  };
  const rows = [];
  for (let iteration = 0; iteration < 10000; iteration++) {
    const indicesE = Array.from({ length: before.length }, () =>
      Math.floor(random() * before.length),
    );
    const indicesF = independent
      ? Array.from({ length: after.length }, () =>
          Math.floor(random() * after.length),
        )
      : indicesE;
    const e = p95(indicesE.flatMap((index) => before[index])),
      f = p95(indicesF.flatMap((index) => after[index]));
    rows.push({
      iteration,
      indicesE,
      indicesF,
      E: e,
      F: f,
      ratio: e === null || e <= 0 || f === null ? null : f / e,
    });
  }
  return {
    upperBound: rows.some((row) => row.ratio === null)
      ? null
      : p95(rows.map((row) => row.ratio)),
    rows,
  };
}
