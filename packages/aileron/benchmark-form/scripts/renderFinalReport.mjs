// Prints the legend and five tables for the final report, recomputed from raw samples and cross-checked against summary.json.
import { readCoreArtifacts } from './utils/readCoreArtifacts.mjs';
import { rebuildCoreSummary } from './utils/rebuildCoreSummary.mjs';

const [summaryPath, samplesPath] = process.argv.slice(2);
if (!summaryPath || !samplesPath)
  throw new Error('Usage: renderFinalReport.mjs <summary.json> <samples.json>');
const { samples, summary } = readCoreArtifacts(samplesPath, summaryPath);
const { markdown, mismatches } = await rebuildCoreSummary(summary, samples);
for (const mismatch of mismatches) console.error(mismatch);
if (mismatches.length) {
  console.error('REPORT_RENDER_FAILED');
  process.exit(1);
}
process.stdout.write(markdown);
