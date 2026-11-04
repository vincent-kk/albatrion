/**
 * Preserve timing summaries without writing megabytes of individual callback samples.
 * @param task - Completed tinybench task; a failed task is never serialized as success.
 * @param batchSize - Merge calls represented by each timing sample.
 * @returns Original summary statistics, observation count and normalized call throughput.
 */
export const serializeMergeMeasurement = (task, batchSize) => {
  if (task.result.error) throw task.result.error;
  const { samples, ...summary } = task.result;
  const sorted = [...samples].sort((left, right) => left - right);
  return {
    name: task.name,
    ...summary,
    sampleCount: samples.length,
    median: sorted[Math.floor(sorted.length / 2)],
    callsPerSecond: summary.hz * batchSize,
    rawTimingSamplesRetained: false,
  };
};
