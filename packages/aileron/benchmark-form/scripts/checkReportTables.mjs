// Gate G7: the report's generated block equals the tables regenerated from raw samples, which in turn match summary.json.
import { readFileSync } from 'node:fs';

import { readCoreArtifacts } from './utils/readCoreArtifacts.mjs';
import {
  CORE_SUMMARY_MARKERS,
  rebuildCoreSummary,
} from './utils/rebuildCoreSummary.mjs';

const [summaryPath, samplesPath, reportPath] = process.argv.slice(2);
if (!summaryPath || !samplesPath || !reportPath)
  throw new Error(
    'Usage: checkReportTables.mjs <summary.json> <samples.json> <report.md>',
  );
const { samples, summary } = readCoreArtifacts(samplesPath, summaryPath);
const { markdown, mismatches } = await rebuildCoreSummary(summary, samples);
const report = readFileSync(reportPath, 'utf8');
const begin = report.indexOf(CORE_SUMMARY_MARKERS.begin);
const end = report.indexOf(CORE_SUMMARY_MARKERS.end);
if (begin < 0 || end < 0)
  mismatches.push('report lacks the core-summary markers');
else if (
  report.slice(begin, end + CORE_SUMMARY_MARKERS.end.length + 1) !== markdown
)
  mismatches.push('report block differs from the regenerated tables');
for (const mismatch of mismatches) console.log(mismatch);
console.log(mismatches.length ? 'REPORT_DIFFERS' : 'REPORT_MATCHES_SUMMARY');
process.exit(mismatches.length ? 1 : 0);
