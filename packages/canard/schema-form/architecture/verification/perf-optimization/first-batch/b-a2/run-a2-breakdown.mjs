// Invoked by node run-a2-breakdown.mjs; this file is verification tooling.
// A2-1 splits instrumented time; separate baseline runs supply uninstrumented totals.
import { settings, metadata, loadEngine, a2Scenes, measure, ordered } from './bench-common.mjs';
const config = settings(true), baseline = await loadEngine(), instrumented = await loadEngine('current', 'baseline', true), rows = [];
for (const spec of ordered(a2Scenes())) {
  const plain = await measure(baseline, spec, config), timed = await measure(instrumented, spec, config);
  rows.push({ ...timed, uninstrumented: { medianMs: plain.medianMs, p10Ms: plain.p10Ms, p90Ms: plain.p90Ms, samplesMs: plain.samplesMs, status: plain.status }, arrayWork: spec.kind === 'array' ? ['copyArraySlots', 'arrangeBranchArray', 'readRawTree', 'readRawSlots', 'applyArraySlots', 'arrayExtras', 'getItemEntries', 'getArrayItemTemplate', 'assembleArray', 'rekeyArrayRuntimePaths'] : undefined });
}
console.log(JSON.stringify({ ...metadata('A2-1', config), addendum: true, splitMethod: 'nextExtras copy/noncomparison remainder = inclusive nextExtras minus the instrumented sameValue(previous,next) call site; report that call-site comparison separately, then assembleObject and all other elapsed time. Component medians are separate; uninstrumented totals are independent.', arrayContext: 'Array B0 push/remove use the array slot path and never call nextExtras. The A2 object-extras copies do not apply to these context rows.', rows }));
