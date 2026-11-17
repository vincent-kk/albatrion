// Gate G4: every variant's samples of the two-dist smoke satisfy the per-operation observability table and the renderer/probe proofs.
import { checkCoreSmokeProfile } from './checkSmokeSamples/utils/checkCoreSmokeProfile.mjs';
import { checkCoreMeasurement } from './utils/checkCoreMeasurement.mjs';
import { checkCoreSummaryCadence } from './utils/checkCoreSummaryCadence.mjs';
import { parseCoreCaseId } from './utils/parseCoreCaseId.mjs';
import { parseScriptArgs } from './utils/parseScriptArgs.mjs';
import { readCoreArtifacts } from './utils/readCoreArtifacts.mjs';
import { rebuildCoreSummary } from './utils/rebuildCoreSummary.mjs';

/** Named workload selection; omitted profile preserves the mandatory six-case smoke. */
const options = parseScriptArgs(process.argv.slice(2), ['--profile']);
/** Raw-sample and summary artifact locations supplied by the caller. */
const [samplesPath, summaryPath] = options._.split('\n');
if (!samplesPath || !summaryPath)
  throw new Error(
    'Usage: checkSmokeSamples.mjs <samples.json> <summary.json> [--profile required|remaining]',
  );
/** Parsed raw evidence and the corresponding summary for this verification run. */
const { samples, summary } = readCoreArtifacts(samplesPath, summaryPath);
/** Fixed case membership and required sample count for the selected workload. */
const { runs, problems } = checkCoreSmokeProfile(
  summary,
  samples,
  options['--profile'],
);
if (!String(summary.baselineRevision ?? '').startsWith('7b49d62c7'))
  problems.push('smoke baselineRevision must be 7b49d62c7');
problems.push(...checkCoreSummaryCadence(summary, samples));
if (summary.mode !== 'compare')
  problems.push(`summary mode is ${summary.mode}, expected compare`);
/** Summary differences found by rebuilding its statistics from raw samples. */
const { mismatches } = await rebuildCoreSummary(summary, samples);
problems.push(...mismatches);
/** Number of raw page samples inspected across variants and retry groups. */
let checked = 0;
for (const [id, groups] of Object.entries(samples)) {
  const { operation, validation } = parseCoreCaseId(id);
  for (const group of groups) {
    for (const variant of ['candidate', 'baseline', 'control'])
      if (group.samples[variant]?.length !== runs)
        problems.push(
          `${id} ${variant}: smoke requires ${runs} samples per variant`,
        );
    for (const [variant, measurements] of Object.entries(group.samples)) {
      if (!measurements.length)
        problems.push(
          `${id} ${variant}: no samples in attempt ${group.attempt}`,
        );
      measurements.forEach((measurement, index) => {
        checked++;
        problems.push(
          ...checkCoreMeasurement(id, variant, index, measurement, {}),
        );
        const where = `${id} ${variant}[${index}]`;
        if (operation === 'mount' && validation) {
          if (
            variant === 'candidate' &&
            !(measurement.metrics.postFrameValidatorMs > 0)
          )
            problems.push(
              `${where}: candidate postFrameValidatorMs must be > 0`,
            );
          if (
            variant !== 'candidate' &&
            !(measurement.metrics.preFrameValidatorMs > 0)
          )
            problems.push(`${where}: baseline preFrameValidatorMs must be > 0`);
        }
      });
    }
  }
}
console.log(
  `checked ${checked} samples over ${Object.keys(samples).length} cases`,
);
for (const problem of problems) console.log(problem);
console.log(problems.length ? 'SMOKE_MODEL_FAILED' : 'SMOKE_MODEL_OK');
process.exit(problems.length ? 1 : 0);
