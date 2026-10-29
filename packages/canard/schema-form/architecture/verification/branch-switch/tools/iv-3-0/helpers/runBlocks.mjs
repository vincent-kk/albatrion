import { setImmediate } from 'node:timers/promises';

/**
 * Runtime owns the monotonic clock; preserve block spans and yield outside clocks every 500 operations.
 * @param {any} operation Prepared synchronous run callback and untimed correctness check.
 * @param {number} switches Positive operation count; production supplies 20,000, rehearsal supplies one.
 * @param {number} warmups Untimed operation count before observation; production supplies 2,000.
 * @returns Monotonic microsecond spans and operation counts for each at-most-100-operation block.
 * @throws If the supplied operation or its correctness check fails.
 */
export async function runBlocks(operation, switches, warmups) {
  for (let index = 0; index < warmups; index++) {
    operation.run();
    if ((index + 1) % 500 === 0) await setImmediate();
  }
  operation.check();
  const blocks = [];
  for (let index = 0; index < switches; index += 100) {
    const countInBlock = Math.min(100, switches - index);
    const startUs = Number(process.hrtime.bigint() / 1000n);
    for (let count = 0; count < countInBlock; count++) operation.run();
    const endUs = Number(process.hrtime.bigint() / 1000n);
    blocks.push({ startUs, endUs, switches: countInBlock });
    if ((index + 100) % 500 === 0) await setImmediate();
  }
  operation.check();
  return blocks;
}
