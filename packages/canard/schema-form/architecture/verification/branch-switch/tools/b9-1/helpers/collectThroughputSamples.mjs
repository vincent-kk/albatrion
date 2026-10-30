/** Select one fixed TEST-073 process range and preserve its sample order as operations per second. */
export function collectThroughputSamples(records, row, lane, lower, upper) {
  return records
    .filter(
      (record) =>
        record.row === row &&
        record.lane === lane &&
        record.repeat >= lower &&
        record.repeat < upper,
    )
    .flatMap((record) => record.samples.current.map((value) => 1000 / value));
}
