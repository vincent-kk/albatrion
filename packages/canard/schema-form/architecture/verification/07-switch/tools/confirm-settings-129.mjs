import { createHash } from 'node:crypto';
import fs from 'node:fs';

/**
 * Read the rows a first report flagged as regressions (128C-01 (2)) and group them into the fixture/validation
 * settings a pair driver measures; gains are never sent to confirmation.
 * @param reportPath - report-cluster-129 output JSON of the first measurement
 * @param lane - `core` or `react`; flagged rows of the other lane are left out
 * @returns `{ source, sha256, stage, settings: [{ fixture, validation, modes }] }`; throws when the report is not a
 *   change report or carries no flagged-row list
 */
export function confirmSettings129(reportPath, lane) {
  const text = fs.readFileSync(reportPath, 'utf8'), report = JSON.parse(text);
  if (report.format !== 'cluster-report-129' || report.stage === 'AA' || !Array.isArray(report.flaggedRegressions))
    throw new Error(`${reportPath} is not a report-cluster-129 change report`);
  const settings = new Map();
  for (const row of report.flaggedRegressions.filter(item => item.lane === lane)) {
    const key = `${row.fixture}/${row.validation}`;
    const setting = settings.get(key) ?? { fixture: row.fixture, validation: row.validation, modes: [] };
    setting.modes.push(row.mode);
    settings.set(key, setting);
  }
  return { source: reportPath, sha256: createHash('sha256').update(text).digest('hex'), stage: report.stage, settings: [...settings.values()] };
}
