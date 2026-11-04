// Invoked by node make-current.mjs; this file is verification tooling.
// Explicit entry point: node make-current.mjs (also Bun); stdout is one JSON record.
import { prepare, write, expose, instrumentCurrent, emit, once } from './build-common.mjs';
import fs from 'node:fs';
import path from 'node:path';
import { SB, currentStages, requiredCurrent } from './config.mjs';
const src = prepare('current');
if (!fs.existsSync(path.join(SB, 'next-extras.mjs'))) {
  write('current-baseline.mjs', expose(src, 'current'));
  console.error('SKIP current instrumentation: next-extras.mjs is intentionally excluded with counterfactual builders.');
  emit('current', ['current-source.mjs', 'current-baseline.mjs'], { skipped: ['current-instrumented.mjs'] });
  process.exit(0);
}
const { originalNextExtras, comparisonLabel } = await import('./next-extras.mjs');
const split = once(originalNextExtras, 'return sameValue(previous, next) ? previous : next;', 'return __benchNextExtrasSameValue(previous, next) ? previous : next;');
const splitSource = once(src, originalNextExtras, split);
const callSite = `const __benchNextExtrasSameValue = __benchWrap(${JSON.stringify(comparisonLabel)}, "compute", (...args) => sameValue(...args));\n`;
const built = instrumentCurrent(callSite + splitSource, currentStages);
write('current-baseline.mjs', expose(src, 'current'));
write('current-instrumented.mjs', expose(built.source, 'current'));
emit('current', ['current-source.mjs', 'current-baseline.mjs', 'current-instrumented.mjs'], { instrumented: built.names, missing: built.missing, requiredMissing: requiredCurrent.filter((name) => !built.names.includes(name)), stages: currentStages, callSites: [{ label: comparisonLabel, expression: 'sameValue(previous, next)', owner: 'nextExtras', exactFunctionMatches: 1, exactCallMatches: 1 }] });
