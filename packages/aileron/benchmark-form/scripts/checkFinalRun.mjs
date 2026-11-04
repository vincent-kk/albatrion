// Gate G6: the CI run succeeded and its artifacts match the requested baseline, head, runs and case set with no void or missing metric.
import { readFileSync } from 'node:fs';

import { coreObservability } from './coreObservability.mjs';
import { checkCoreMeasurement } from './utils/checkCoreMeasurement.mjs';
import { checkCoreSummaryCadence } from './utils/checkCoreSummaryCadence.mjs';
import { parseCoreCaseId } from './utils/parseCoreCaseId.mjs';
import { parseScriptArgs } from './utils/parseScriptArgs.mjs';
import { readCoreArtifacts } from './utils/readCoreArtifacts.mjs';

const options = parseScriptArgs(process.argv.slice(2), [
  '--run-json',
  '--baseline',
  '--head',
  '--runs',
  '--cases',
]);
const [summaryPath, samplesPath] = options._.split('\n');
if (
  !options['--run-json'] ||
  !summaryPath ||
  !samplesPath ||
  !options['--baseline'] ||
  !options['--head'] ||
  !options['--runs'] ||
  !options['--cases']
)
  throw new Error(
    'Usage: checkFinalRun.mjs <summary.json> <samples.json> --run-json <run.json> --baseline <sha> --head <sha> --runs <n> --cases <a,b,...>',
  );
const { samples, summary } = readCoreArtifacts(samplesPath, summaryPath);
const problems = checkCoreSummaryCadence(summary, samples);
if (options['--run-json']) {
  const run = JSON.parse(readFileSync(options['--run-json'], 'utf8'));
  if (run.conclusion !== 'success')
    problems.push(`run conclusion is ${run.conclusion}`);
}
const runs = Number(options['--runs']);
const cases = options['--cases'].split(',');
if (!String(summary.baselineRevision ?? '').startsWith(options['--baseline']))
  problems.push(
    `baselineRevision ${summary.baselineRevision} ≠ ${options['--baseline']}`,
  );
if (!String(summary.revision ?? '').startsWith(options['--head']))
  problems.push(`revision ${summary.revision} ≠ ${options['--head']}`);
if (summary.runs !== runs) problems.push(`runs ${summary.runs} ≠ ${runs}`);
const ids = summary.cases.map((row) => row.id);
if (ids.length !== cases.length || cases.some((id) => !ids.includes(id)))
  problems.push(`case set ${ids.join(',')} ≠ ${cases.join(',')}`);
for (const row of summary.cases) {
  const observability = coreObservability[parseCoreCaseId(row.id).key];
  for (const [name, comparison] of Object.entries(row.metrics)) {
    if (comparison.verdict === 'void')
      problems.push(`${row.id}: ${name} is void`);
    if (
      observability?.metrics[name] === 'required' &&
      comparison.verdict === 'not observable'
    )
      problems.push(`${row.id}: ${name} is required but not observable`);
  }
  const group = (samples[row.id] ?? []).find(
    (candidate) => candidate.attempt === row.attempt,
  );
  if (!group) {
    problems.push(`${row.id}: no sample group for attempt ${row.attempt}`);
    continue;
  }
  for (const [variant, measurements] of Object.entries(group.samples)) {
    if (measurements.length !== runs)
      problems.push(
        `${row.id} ${variant}: ${measurements.length} samples ≠ ${runs}`,
      );
    measurements.forEach((measurement, index) =>
      problems.push(
        ...checkCoreMeasurement(row.id, variant, index, measurement, {
          requireObserved: true,
          require60Hz: true,
        }),
      ),
    );
  }
}
for (const problem of problems) console.log(problem);
console.log(problems.length ? 'FINAL_RUN_FAILED' : 'FINAL_RUN_OK');
process.exit(problems.length ? 1 : 0);
