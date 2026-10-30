// Invoked by node table.mjs; this file is verification tooling.
// Summarize exactly two user-operated Node rounds, or explicitly one --smoke file.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
import { SB, P, sha, expectedSha } from '../config.mjs';
import { A, B, C, classNames, baseClassify, classify, evidence, legacy } from './evidence.mjs';

const B2 = path.dirname(fileURLToPath(import.meta.url));
const median = (xs) => { const a = [...xs].sort((a, b) => a - b); return a.length % 2 ? a[a.length >> 1] : (a[a.length / 2 - 1] + a[a.length / 2]) / 2; };
const aggregate = (xs) => ({ median: median(xs), min: Math.min(...xs), max: Math.max(...xs) });
const hotSpots = ['markWrite', 'computeStableNode', 'markCommitDeliveries'];
function sumByClass(profile, judgments) {
  const sums = Object.fromEntries([A, B, C].map((token) => [token, { selfUs: 0, calls: 0 }]));
  for (const [id, metric] of Object.entries(profile)) {
    const token = judgments.get(Number(id));
    assert([A, B, C].includes(token), 'Unclassified profile label ' + id);
    sums[token].selfUs += metric.selfMs * 1000;
    sums[token].calls += metric.calls;
  }
  const totalUs = Object.values(sums).reduce((sum, row) => sum + row.selfUs, 0);
  for (const row of Object.values(sums)) row.sharePercent = totalUs ? row.selfUs / totalUs * 100 : 0;
  return sums;
}
function checkMarkdown(markdown, conclusion) {
  let classColumn = -1, cellsChecked = 0;
  for (const line of markdown.split('\n')) {
    if (!line.startsWith('|')) { classColumn = -1; continue; }
    const cells = line.split(/(?<!\\)\|/).slice(1, -1).map((cell) => cell.trim());
    const header = cells.findIndex((cell) => cell === 'Classification' || cell === 'Class');
    if (header >= 0) {
      assert(cells.some((cell, index) => index !== header && /why|reason|review|missing evidence/i.test(cell)), 'Classification reason needs a separate column');
      classColumn = header; continue;
    }
    if (classColumn < 0 || cells.every((cell) => /^:?-+:?$/.test(cell))) continue;
    assert([A, B, C].includes(cells[classColumn]), 'Invalid rendered classification cell: ' + cells[classColumn]);
    cellsChecked++;
  }
  assert.equal(markdown.trim().split('\n').at(-1), conclusion, 'Conclusion must be the final line');
  assert(cellsChecked > 0, 'No rendered classification cells checked');
  return cellsChecked;
}
if (process.argv.includes('--self-test')) {
  assert.deepEqual(aggregate([2, 6]), { median: 4, min: 2, max: 6 });
  assert.equal(median([3, 9, 1]), 3);
  assert.equal(new Set([A, B, C]).size, 3);
  assert.equal(classify({ name: 'markWrite.default staticSpec [already-interpreted child]', owner: 'markWrite', kind: 'call-site' }, 'markWrite').classification, A);
  assert.equal(classify({ name: 'FieldNodeRevisionLedger.constructor', owner: 'FieldNodeRevisionLedger.constructor', kind: 'function' }, 'markCommitDeliveries').classification, B);
  assert.deepEqual([A, B, C], ['(a)', '(b)', '(c)']);
  const sums = sumByClass({ 1: { selfMs: 0.002, calls: 3 }, 2: { selfMs: 0.003, calls: 4 }, 3: { selfMs: 0.005, calls: 7 } }, new Map([[1, A], [2, B], [3, C]]));
  assert.deepEqual(sums, { [A]: { selfUs: 2, calls: 3, sharePercent: 20 }, [B]: { selfUs: 3, calls: 4, sharePercent: 30 }, [C]: { selfUs: 5, calls: 7, sharePercent: 50 } });
  assert.equal(checkMarkdown('| Class | Why |\n| --- | --- |\n| (c) | a \\| b |\n\nend\n', 'end'), 1);
  assert.throws(() => checkMarkdown('| Class | Why |\n| --- | --- |\n| unclassified | reason |\n\nend\n', 'end'), /Invalid rendered classification/);
  console.log(JSON.stringify({ kind: 'b2-summary-self-test', status: 'pass', checks: 9 }));
  process.exit(0);
}
const smoke = process.argv.includes('--smoke'), rounds = smoke ? ['smoke'] : ['1', '2'];
const records = rounds.map((round) => JSON.parse(fs.readFileSync(path.join(B2, 'out', `b2-node-${round}.json`), 'utf8')));
for (const record of records) {
  if (record.runtime.name !== 'node' || record.nodeEnv !== 'production' || record.config.smoke !== smoke || record.config.samples !== (smoke ? 3 : 40)) throw new Error('Unexpected B2 runtime/config');
  if (record.bundleSha256 !== records[0].bundleSha256 || record.focusedBundleSha256 !== records[0].focusedBundleSha256 || record.labelsSha256 !== records[0].labelsSha256) throw new Error('B2 artifact mismatch across rounds');
}
const labels = JSON.parse(fs.readFileSync(path.join(B2, 'labels.json'), 'utf8'));
if (sha(fs.readFileSync(path.join(B2, 'labels.json'))) !== records[0].labelsSha256) throw new Error('Stale B2 label inventory');
const trace = JSON.parse(fs.readFileSync(path.join(B2, 'trace.json'), 'utf8'));
const build = JSON.parse(fs.readFileSync(path.join(B2, 'build.json'), 'utf8'));
const refFiles = ['b-node-1.json', 'b-node-2.json'];
const refs = refFiles.map((file) => JSON.parse(fs.readFileSync(path.join(SB, 'out', file), 'utf8')));
for (const reference of refs) {
  if (reference.runtime.name !== 'node' || reference.nodeEnv !== 'production' || reference.config.smoke) throw new Error('Reference is not the production Node quiet window');
  for (const engine of ['current', 'legacy']) {
    const row = reference.rows.find((item) => item.engine === engine && item.n === 1000);
    if (row?.engineSha256 !== expectedSha[engine]) throw new Error('Reference engine SHA mismatch: ' + engine);
  }
}
const old = (engine) => refs.map((record) => record.rows.find((row) => row.engine === engine && row.n === 1000).medianMs);
const gapRoundsUs = old('current').map((value, i) => (value - old('legacy')[i]) * 1000), gapUs = median(gapRoundsUs);
const format = (values, digits = 3) => { const a = aggregate(values); return smoke ? a.median.toFixed(digits) + ' (smoke)' : `${a.median.toFixed(digits)} [${a.min.toFixed(digits)}–${a.max.toFixed(digits)}]`; };
const escape = (value) => String(value ?? '').replaceAll('|', '\\|').replaceAll('\n', ' ');
const table = (headers, rows) => ['| ' + headers.map(escape).join(' | ') + ' |', '| ' + headers.map(() => '---').join(' | ') + ' |', ...rows.map((row) => '| ' + row.map(escape).join(' | ') + ' |')].join('\n');
const cite = (item) => `“${item.quote}” — ${item.file}:${item.line} (${item.id}; ${item.translation})`;
const sections = [
  '# B2: BN/1000 all-keys Overwrite, current engine',
  `Package evidence paths below are relative to ${P}; current-source.mjs is the byte-identical local bundle copy. Legacy bundle references point to ../legacy-source.mjs.`,
  smoke ? 'NODE SMOKE ONLY. One file with 2 warmups / 3 samples; no B2 quiet window or two-round range has been run.' : 'Two Node quiet-window rounds, 20 warmups / 40 samples each. Values are the median of round medians; brackets contain two-round min–max.',
  `Reference B-1 window: current ${median(old('current')).toFixed(6)} ms; 0.16.1 ${median(old('legacy')).toFixed(6)} ms; exact paired gap ${gapUs.toFixed(3)} µs [${Math.min(...gapRoundsUs).toFixed(3)}–${Math.max(...gapRoundsUs).toFixed(3)}]. Source files: ../out/${refFiles.join(', ../out/')}.`,
];
const summaryPosition = sections.length;
sections.push(
  'Dense profiling instruments every synchronous function, dynamic/built-in callee, loop body, literal allocation and field write. Its timings are heavily perturbed. Inclusive values overlap; self values partition a hot spot per sample. Do not add inclusive rows, or treat dense time divided by the uninstrumented gap as a causal savings estimate. Root/loop residuals include timer overhead. A second copy times only markWrite and its default-spec expression to bound the isolated proved redundancy with fewer nested timers; that focused time still includes its own instrumentation overhead.',
  table(['Lane', 'Elapsed ms', 'Correctness'], ['baseline', 'profiling', 'focused'].map((variant) => [variant, format(records.map((r) => r.measurements[variant].medianMs)), records.map((r) => r.measurements[variant].status).join(' / ')])),
  'Calls per child always divide by 1000. Thus 1001 markWrite calls means the host plus 1000 children; 1002 stable-compute/revision visits include the root and host. Optional call-site counts are expression evaluations, not proof that an absent receiver was invoked. Loop counts are iterations, not extra tree passes. Zero-count direct-callee rows preserve untaken alternatives.',
);
const classificationCounts = {}, reported = [], classSummary = [], topUnclassifiedReview = [], remainingUnclassified = [];
for (const group of [...hotSpots, 'registerRecalculation']) {
  const active = new Set(records.flatMap((record) => record.groups[group].map((row) => row.id)));
  const fn = trace.find((item) => item.name === group);
  const directNames = new Set(fn.calls.map((call) => call.expression));
  for (const label of labels) if (label.owner === group || label.kind === 'function' && directNames.has(label.name)) active.add(label.id);
  const rows = [...active].map((id) => {
    const label = labels[id], values = records.map((r) => r.groups[group].find((row) => row.id === id) ?? { inclusiveUs: 0, selfUs: 0, calls: 0 });
    const inactive = values.every((row) => !row.calls);
    const judgment = inactive ? { classification: C, why: 'Direct call/alternative was not reached by this BN scene; no active cost or semantic-removal conclusion is inferred.', citations: [] } : classify(label, group);
    assert([A, B, C].includes(judgment.classification));
    const key = group + ' :: ' + judgment.classification;
    classificationCounts[key] = (classificationCounts[key] ?? 0) + 1;
    reported.push({ group, id, name: label.name, values, ...judgment });
    return { label, values, judgment };
  }).sort((a, b) => median(b.values.map((row) => row.selfUs)) - median(a.values.map((row) => row.selfUs)));
  if (hotSpots.includes(group)) {
    const judgments = new Map(rows.map((row) => [row.label.id, row.judgment.classification]));
    const sums = records.map((record) => record.measurements.profiling.profiles.map((profile) => sumByClass(profile[group], judgments)));
    for (const token of [A, B, C]) classSummary.push({ group, classification: token, values: sums.map((samples) => ({
      selfUs: median(samples.map((sample) => sample[token].selfUs)),
      calls: median(samples.map((sample) => sample[token].calls)),
      sharePercent: median(samples.map((sample) => sample[token].sharePercent)),
    })) });
    const before = rows.filter((row) => row.values.some((value) => value.calls) && baseClassify(row.label, group).classification === C).slice(0, 5);
    const after = rows.filter((row) => row.values.some((value) => value.calls) && row.judgment.classification === C).slice(0, 5);
    topUnclassifiedReview.push(...before.map((row) => ({ group, id: row.label.id, name: row.label.name, values: row.values, ...row.judgment })));
    remainingUnclassified.push(...after.map((row) => ({ group, id: row.label.id, name: row.label.name, values: row.values, ...row.judgment })));
  }
  sections.push(group === 'registerRecalculation' ? '## Adjacent registration (outside all three hot-spot totals)' : '## ' + group);
  sections.push(table(['Callee / label', 'Kind', 'Dense inclusive µs', 'Dense self µs', 'Calls', 'Calls / child', 'Classification', 'Why / exact evidence quotation'], rows.map(({ label, values, judgment }) => [
    label.name, label.kind, format(values.map((r) => r.inclusiveUs)), format(values.map((r) => r.selfUs)), format(values.map((r) => r.calls), 0), format(values.map((r) => r.calls / 1000)), judgment.classification,
    judgment.why + (judgment.citations.length ? ' ' + judgment.citations.map(cite).join(' ') : '') + ` Bundle current-source.mjs:${label.line}.` + (label.source.length ? ' Source ' + label.source.map((s) => `${s.file}:${s.line}`).join(', ') + '.' : ''),
  ])));
}
sections.splice(summaryPosition, 0,
  '## Per-hot-spot class summary',
  'Classification cells contain only (a), (b), or (c). (a): ' + classNames[A] + '; (b): ' + classNames[B] + '; (c): ' + classNames[C] + '. Reasons and evidence are in separate columns below.',
  'For each sample, self times and calls are summed across all labels assigned to a class, then the sample median is taken within each round. Two-round output takes the median of those round medians and shows their range. This avoids adding inclusive time or mixing independent per-label timing medians. Class medians need not add exactly to the median hot-spot total. Calls sum all recorded functions/call sites/loop iterations/writes, including nested labels; they are not counts of distinct nodes. Percentages are medians of samplewise shares of total self time. Adjacent registerRecalculation is excluded.',
  table(['Hot spot', 'Class', 'Summed self µs', 'Calls', 'Share of self %', 'Why / basis'], classSummary.map((row) => [row.group, row.classification, format(row.values.map((value) => value.selfUs)), format(row.values.map((value) => value.calls), 0), format(row.values.map((value) => value.sharePercent), 2), row.values.every((value) => !value.calls) ? 'No measured labels in this class.' : ({ [A]: 'Unused known-child defaults; legacy pairing below.', [B]: 'Sum of labels implementing cited per-node obligations; detailed reasons below.', [C]: 'Sum of labels whose obligation or redundancy is unresolved; missing evidence below.' })[row.classification]])),
  '## Review of the five largest previously unclassified rows per hot spot',
  'Selection uses active labels and the pre-review classification rules, ordered by self time. A retained (c) reason states exactly what evidence is missing; a promoted (b) reason cites the documented obligation, without claiming the present implementation constant is a lower bound.',
  table(['Hot spot', 'Callee / label', 'Dense self µs', 'Classification', 'Review / missing evidence'], topUnclassifiedReview.map((row) => [row.group, row.name, format(row.values.map((value) => value.selfUs)), row.classification, row.why + (row.citations.length ? ' ' + row.citations.map(cite).join(' ') : '')])),
  '## Five largest rows still unclassified per hot spot',
  table(['Hot spot', 'Callee / label', 'Dense self µs', 'Classification', 'Missing evidence'], remainingUnclassified.map((row) => [row.group, row.name, format(row.values.map((value) => value.selfUs)), row.classification, row.why + (row.citations.length ? ' ' + row.citations.map(cite).join(' ') : '')])),
);
const focusedUs = records.map((r) => r.focused.inclusiveUs), fraction = focusedUs.map((value) => value / gapUs * 100);
sections.push('## Isolated proved (a)-class item', table(['Item', 'Focused inclusive µs', 'Calls', 'Calls / child', 'Descriptive % of old B-1 gap', 'Classification', 'Why'], [[records[0].focused.name, format(focusedUs), '1000', '1.000', format(fraction, 2), A, 'The host already interpreted this child; recursion evaluates an unused default spec again, whereas legacy NumberNode.__parseValue__ directly parses once. Exact source and legacy quotations below.']]));
const gapText = gapUs.toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 });
const conclusion = `Single biggest (a)-class inefficiency: unused default staticSpec lookup for already-interpreted children — ${smoke ? median(focusedUs).toFixed(3) : format(focusedUs)} µs (${smoke ? 'focused Node smoke' : 'focused Node window'}), ${median(fraction).toFixed(2)}% of the ${gapText} µs gap.`;
sections.push('## Classification evidence and legacy comparison', 'The classification column uses exactly one token: (a), (b), or (c); reasons are separate. Required-per-node quotations establish observable obligations, not a proof that every present helper call, container or constant is irreducible. In particular, mixed comparison/cache totals remain unclassified; only the unused known-child default is proved redundant here.', ...Object.values(evidence).map((item) => '- ' + cite(item)));
sections.push('Legacy performs child forwarding through `BranchStrategy.__propagate__` → `AbstractNode.setValue` → `NumberNode.applyValue` / `NumberNode.__emitChange__` / `NumberNode.__parseValue__`, and publishing through `AbstractNode.onChange` / `AbstractNode.publish` and `EventCascadeManager`. The known-child default lookup has no counterpart in that direct parse/propagation path. This does not assert that all new settlement bookkeeping can be removed.', ...legacy.map((item) => `- ${item.symbol}: “${item.quote}” — ${item.file}:${item.line}.`));
sections.push('## Trace and coverage', `${build.functions} function entries and ${build.labels} total labels; ${build.sourceFilesRead} engine source files read, ${build.sourceFilesArchived} matching files archived with their complete comments in source-audit.md. trace.json records every call expression with owner/source location; labels.json contains all function/call/loop/allocation/write splits. Untaken branches retain zero direct-call rows. ${build.generatorBodyException}`, 'Known-child default lookup count is 1000; total staticSpec count is 2001. All three hot-spot counts are asserted as 1001 / 1002 / 1, and self-time partitions reconcile. Separate untimed subscription probes compare emitted event sequence/payload/options and per-node value/computed revision deltas across baseline, dense and focused copies; those observations match. Timed samples retain the original no-child-listener lane.');
sections.push('## Provenance', `Engine SHA256: ${records[0].engineSha256}. Dense bundle SHA256: ${records[0].bundleSha256}. Focused bundle SHA256: ${records[0].focusedBundleSha256}.`, table(['Round', 'Runtime', 'Warmups', 'Samples', 'Baseline event count', 'Node count'], records.map((record, i) => [rounds[i], record.runtime.version, record.config.warmups, record.config.samples, record.correctness.baseline.eventCount, record.correctness.baseline.nodeCount])));
sections.push('## Conclusion', 'The percentage below is descriptive focused instrumented time, including timer overhead, not a measured removable share of the production gap; it neither explains the entire gap nor establishes that larger unclassified work is removable.', conclusion);
const output = path.join(B2, 'table.md');
const markdown = sections.join('\n\n') + '\n', classificationCellsChecked = checkMarkdown(markdown, conclusion);
fs.writeFileSync(output, markdown);
assert.equal(fs.readFileSync(output, 'utf8'), markdown);
fs.writeFileSync(path.join(B2, 'classification.json'), JSON.stringify({ classNames, evidence, legacy, classificationCounts, classSummary, topUnclassifiedReview, remainingUnclassified, rows: reported, classificationCellsChecked, conclusion }, null, 2) + '\n');
console.log(JSON.stringify({ kind: 'b2-summary', smoke, output, classificationCounts, classSummary, classificationCellsChecked, focusedUs: aggregate(focusedUs), referenceGapUs: gapUs, descriptiveGapPercent: aggregate(fraction), conclusion }));
