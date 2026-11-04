// Gate G6: the CI run succeeded and its artifacts match the requested inputs with no unlisted void or missing metric.
import { readFileSync } from 'node:fs';

import { coreObservability } from './coreObservability.mjs';
import { checkCoreMeasurement } from './utils/checkCoreMeasurement.mjs';
import { checkCoreSummaryCadence } from './utils/checkCoreSummaryCadence.mjs';
import { parseCoreCaseId } from './utils/parseCoreCaseId.mjs';
import { parseScriptArgs } from './utils/parseScriptArgs.mjs';
import { readCoreArtifacts } from './utils/readCoreArtifacts.mjs';
import { rebuildCoreSummary } from './utils/rebuildCoreSummary.mjs';

/** Validated CLI options; unknown or duplicate flags are rejected before artifact inspection. */
const options = parseScriptArgs(process.argv.slice(2), [
  '--run-json',
  '--baseline',
  '--head',
  '--runs',
  '--cases',
  '--allow-void',
]);
/** Summary and raw-sample artifact locations supplied as positional arguments. */
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
    'Usage: checkFinalRun.mjs <summary.json> <samples.json> --run-json <run.json> --baseline <sha> --head <sha> --runs <n> --cases <a,b,...> [--allow-void <metric,...>]',
  );
/** Comparison metrics; firstWriteMs has a distribution but no comparison verdict. */
const metricNames = [
  'durationMs',
  ...Object.keys(coreObservability['mount-validate'].metrics).filter(
    (name) => name !== 'firstWriteMs',
  ),
];
/**
 * Explicit void exceptions, still subject to raw-sample verification and listed in the output.
 * Long Task durations are whole milliseconds that vary by page beyond the 3 % CPU control band (1.9 ms at
 * 63.5 ms); a listed void stays visible in the output because its cause is undetermined (plan A7).
 */
const allowedVoidMetrics = options['--allow-void']?.split(',') ?? [];
for (const name of allowedVoidMetrics)
  if (!metricNames.includes(name))
    throw new Error(`Unknown metric in --allow-void: ${name}`);
/** Parsed raw evidence and the corresponding summary for this verification run. */
const { samples, summary } = readCoreArtifacts(samplesPath, summaryPath);
/** Accumulated gate failures; any entry makes the process exit nonzero. */
const problems = checkCoreSummaryCadence(summary, samples);
if (summary.mode !== 'compare') problems.push('final run mode must be compare');
if (options['--run-json']) {
  const run = JSON.parse(readFileSync(options['--run-json'], 'utf8'));
  if (run.conclusion !== 'success')
    problems.push(`run conclusion is ${run.conclusion}`);
}
/** Required positive number of measured pages per case and variant. */
const runs = Number(options['--runs']);
/** Requested case identifiers whose complete comparison artifacts are required. */
const cases = options['--cases'].split(',');
if (!String(summary.baselineRevision ?? '').startsWith(options['--baseline']))
  problems.push(
    `baselineRevision ${summary.baselineRevision} ≠ ${options['--baseline']}`,
  );
if (!String(summary.revision ?? '').startsWith(options['--head']))
  problems.push(`revision ${summary.revision} ≠ ${options['--head']}`);
if (summary.runs !== runs) problems.push(`runs ${summary.runs} ≠ ${runs}`);
/** Case identifiers actually present in the summary, used to enforce set equality. */
const ids = summary.cases.map((row) => row.id);
if (ids.length !== cases.length || cases.some((id) => !ids.includes(id)))
  problems.push(`case set ${ids.join(',')} ≠ ${cases.join(',')}`);
for (const row of summary.cases) {
  const observability = coreObservability[parseCoreCaseId(row.id).key];
  for (const [name, comparison] of Object.entries(row.metrics)) {
    if (comparison.verdict === 'void') {
      if (allowedVoidMetrics.includes(name))
        console.log(`allowed void: ${row.id} ${name}`);
      else problems.push(`${row.id}: ${name} is void`);
    }
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
  for (const variant of ['candidate', 'baseline', 'control']) {
    const measurements = group.samples?.[variant];
    if (!Array.isArray(measurements)) {
      problems.push(`${row.id} ${variant}: required sample array is missing`);
      continue;
    }
    if (measurements.length !== runs)
      problems.push(
        `${row.id} ${variant}: ${measurements.length} samples ≠ ${runs}`,
      );
    measurements.forEach((measurement, index) =>
      problems.push(
        ...checkCoreMeasurement(row.id, variant, index, measurement, {
          require60Hz: true,
        }),
      ),
    );
  }
}
if (!problems.length) {
  try {
    const { mismatches } = await rebuildCoreSummary(summary, samples);
    problems.push(...mismatches);
  } catch (error) {
    problems.push(`raw-sample rebuild failed: ${error.message}`);
  }
}
for (const problem of problems) console.log(problem);
console.log(problems.length ? 'FINAL_RUN_FAILED' : 'FINAL_RUN_OK');
process.exit(problems.length ? 1 : 0);
