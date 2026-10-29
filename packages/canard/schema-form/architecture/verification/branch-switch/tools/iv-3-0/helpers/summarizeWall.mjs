/**
 * Summarize timing blocks without running the measured operation.
 * @param {any} wall Positive operation count and monotonic measured blocks from one worker.
 * @returns Mean and median microseconds per operation over the supplied blocks.
 */
export function summarizeWall(wall) {
  const values = wall.blocks
    .map((block) => (block.endUs - block.startUs) / block.switches)
    .sort((a, b) => a - b);
  return {
    wallMeanUs:
      wall.blocks.reduce((sum, block) => sum + block.endUs - block.startUs, 0) /
      wall.switches,
    wallMedianUs:
      (values[(values.length - 1) >> 1] + values[values.length >> 1]) / 2,
  };
}
