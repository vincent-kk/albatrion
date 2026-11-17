/**
 * Time a batch with preparation outside the measured interval, retaining async traversal cost only for async cases.
 * @param {object} workload Prepared scanner workload.
 * @param {number} count Positive iteration count.
 * @param {boolean} isAsync Whether each invocation requires awaiting completion.
 * @param {Function} now Monotonic millisecond clock supplied by the caller.
 * @returns {Promise<number>} Total batch milliseconds.
 */
export async function measureBatch(workload, count, isAsync, now) {
  const prepared = workload.prepare(count);
  const start = now();
  if (isAsync) {
    for (let index = 0; index < count; index++)
      await workload.run(prepared, index);
  } else {
    for (let index = 0; index < count; index++) workload.run(prepared, index);
  }
  return now() - start;
}
