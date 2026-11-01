import assert from 'node:assert/strict';

/** Finish each A/B row and defer legacy quality until all rows are published. */
export function executeAlternatingRows(config, rows, measure, publish) {
  const results = [];
  const completed = [];
  for (const row of rows) {
    for (let repeat = 0; repeat < config.runs; repeat++)
      for (const lane of ['A', 'B']) {
        const result = { ...measure(row, lane, repeat), lane };
        assert.ok(
          !results.some((prior) => prior.pid === result.pid),
          'Fresh worker PID',
        );
        results.push(result);
      }
    completed.push(row);
    const report = publish(
      results,
      completed,
      completed.length === rows.length,
    );
    if (config.quality === 'legacy' && completed.length < rows.length) continue;
    if (config.formal && report.quality?.passed === false) return 2;
  }
  return 0;
}
