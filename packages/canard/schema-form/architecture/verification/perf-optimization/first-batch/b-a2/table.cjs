// Invoked by node table.cjs; this file is verification tooling.
// node table.cjs: summarize exactly two quiet rounds. --smoke explicitly reads
// single smoke files instead. All reads/writes stay in SB, except module imports.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const median = (xs) => { const s = [...xs].sort((a, b) => a - b); return s.length % 2 ? s[s.length >> 1] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2; };
const aggregate = (xs) => {
  if (!xs.length || xs.some((x) => !Number.isFinite(x))) return null;
  return { median: median(xs), min: Math.min(...xs), max: Math.max(...xs) };
};
const format = (xs, digits = 3) => { const a = aggregate(xs); return a ? `${a.median.toFixed(digits)} [${a.min.toFixed(digits)}–${a.max.toFixed(digits)}]` : 'unmeasured'; };
const cell = (value) => String(value ?? '').replaceAll('|', '\\|').replaceAll('\n', ' ');
const codeNames = (names) => names.map((name) => '`' + name + '`').join(', ');
const table = (headers, rows) => ['| ' + headers.map(cell).join(' | ') + ' |', '| ' + headers.map(() => '---').join(' | ') + ' |', ...rows.map((row) => '| ' + row.map(cell).join(' | ') + ' |')].join('\n');

async function main() {
  if (process.argv.includes('--self-test')) {
    assert.deepEqual(aggregate([2, 6]), { median: 4, min: 2, max: 6 });
    assert.equal(format([2, 6]), '4.000 [2.000–6.000]');
    assert.equal(aggregate([null, 2]), null);
    assert.equal(median([10, 1, 7]), 7);
    assert.equal(format([10 - 7, 20 - 12]), '5.500 [3.000–8.000]');
    console.log(JSON.stringify({ kind: 'summarizer-self-test', status: 'pass', checks: 5 }));
    return;
  }
  const { SB, pairing, currentStages, legacyStages } = await import('./config.mjs');
  if (!['current-v1.mjs', 'current-v2.mjs', 'current-instrumented.mjs'].every(file => fs.existsSync(path.join(SB, file)))) {
    const reason = 'SKIP full B/A2 summary: excluded counterfactual/instrumented copies are absent; baseline run JSON remains available.';
    console.error(reason); console.log(JSON.stringify({kind: 'summary', status: 'skipped', reason})); return;
  }
  const smoke = process.argv.includes('--smoke'), rounds = smoke ? ['smoke'] : ['1', '2'];
  const runtimes = smoke ? ['node'] : ['node', 'bun'];
  const dir = path.join(SB, 'out'), loaded = [];
  function records(job, runtime) {
    return rounds.map((round) => {
      const file = `${job}-${runtime}-${round}.json`, record = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8'));
      if (record.runtime?.name !== runtime || Boolean(record.config?.smoke) !== smoke) throw new Error('Wrong runtime or lane in ' + file);
      loaded.push({ file, record });
      return record;
    });
  }
  function rowsFor(records, predicate) {
    const found = records.map((record) => record.rows.filter(predicate));
    if (found.some((rows) => rows.length !== 1)) throw new Error('Missing or duplicate row for aggregation');
    const rows = found.map((items) => items[0]);
    const key = (row) => JSON.stringify([row.id, row.engine, row.variant, row.bundleSha256, row.engineSha256]);
    if (rows.some((row) => key(row) !== key(rows[0]))) throw new Error('Bundle or row identity differs between rounds');
    return rows;
  }
  const sections = [
    smoke ? '# Node smoke tables (one smoke record; no quiet-window rounds)' : '# B / A2 quiet-window tables',
    `Generated at ${new Date().toISOString()}. Entries are median of ${smoke ? 'one smoke result' : 'the two rounds’ medians'}, followed by ${smoke ? 'the same single value' : 'two-round min–max'} in brackets. Timings are ms unless marked µs.`,
    'Smoke results validate the tooling only. Inclusive function times overlap and must not be added. Stage occupancy uses disjoint intervals assigned to the innermost instrumented stage; the engine pairing is an estimate. Instrumentation overhead is present in breakdowns, so stage gaps do not causally decompose uninstrumented timing gaps.',
  ];
  const b = Object.fromEntries(runtimes.map((r) => [r, records('b', r)]));
  sections.push('## B-1: object BN all-keys Overwrite', table(['Runtime', 'Width', 'Current ms [range]', '0.16.1 ms [range]', 'Current − legacy ms [range]'], runtimes.flatMap((r) => [100, 1000].map((n) => {
    const a = rowsFor(b[r], (row) => row.engine === 'current' && row.n === n), old = rowsFor(b[r], (row) => row.engine === 'legacy' && row.n === n);
    return [r, n, format(a.map((x) => x.medianMs)), format(old.map((x) => x.medianMs)), format(a.map((x, i) => x.medianMs - old[i].medianMs))];
  }))));
  const current = records('breakdown-b-current', 'node'), legacy = records('breakdown-b-legacy', 'node');
  const cr = rowsFor(current, () => true), lr = rowsFor(legacy, () => true);
  sections.push('## B-2/B-3: estimated stage gap (Node, width 1000)', table(['Stage', 'Current µs [range]', '0.16.1 µs [range]', 'Gap µs [range]', '0.16.1 bundle symbols'], [...pairing, { stage: 'other', legacy: ['unassigned / scheduling / timer overhead'] }].map(({ stage, legacy: symbols }) => {
    const a = cr.map((row) => row.stages[stage].medianUs), old = lr.map((row) => row.stages[stage].medianUs);
    return [stage, format(a), format(old), format(a.map((x, i) => x - old[i])), codeNames(symbols)];
  })));
  sections.push('## Function pairing (estimate)', table(['Stage', 'Current-engine functions', '0.16.1 bundle symbols'], pairing.map((p) => [p.stage, codeNames(p.current), codeNames(p.legacy)])));
  for (const [name, rows, stages] of [['Current', cr, currentStages], ['0.16.1', lr, legacyStages]]) sections.push(`## ${name}: outermost inclusive per-function medians`, table(['Stage', 'Function / instrumentation label', 'µs [range]', 'All-call count [range]'], Object.entries(stages).flatMap(([stage, names]) => names.map((symbol) => [stage, '`' + symbol + '`', format(rows.map((row) => row.functions[symbol].medianUs)), format(rows.map((row) => row.functions[symbol].medianCalls), 1)]))));
  sections.push('The additional current timer label `nextExtras.sameValue` measures only the `sameValue(previous, next)` call site inside `nextExtras`, including the comparison timer wrapper. It is not a top-level bundle symbol.', table(['Call site', 'Inclusive µs [range]', 'Call count [range]'], [['nextExtras → sameValue(previous, next)', format(cr.map((row) => row.functions['nextExtras.sameValue'].medianUs)), format(cr.map((row) => row.functions['nextExtras.sameValue'].medianCalls), 1)]]));
  const split = records('breakdown-a2', 'node'), splitIds = split[0].rows.map((row) => row.id);
  if (split.some((record) => !record.addendum)) throw new Error('Rerun the addendum A2-1 breakdown before summarizing');
  sections.push('## A2-1: undeclared-value copy breakdown (Node)', table(['Scene', 'nextExtras copy ms [range]', 'nextExtras sameValue ms [range]', 'sameValue % of nextExtras [range]', 'assembleObject ms [range]', 'Other ms [range]', 'Instrumented total ms [range]', 'Uninstrumented total ms [range]'], splitIds.map((id) => {
    const rows = rowsFor(split, (row) => row.id === id);
    return [id, ...['nextExtrasCopy', 'nextExtrasSameValue'].map((name) => format(rows.map((row) => row.splitMs[name].medianMs))), rows.every((row) => row.functions.nextExtras.medianCalls === 0) ? 'n/a (no nextExtras)' : format(rows.map((row) => row.nextExtrasSameValueSharePct.medianPct), 1), ...['assembleObject', 'other'].map((name) => format(rows.map((row) => row.splitMs[name].medianMs))), format(rows.map((row) => row.medianMs)), format(rows.map((row) => row.uninstrumented.medianMs))];
  })));
  sections.push('nextExtras copy is the noncomparison remainder: inclusive nextExtras minus its instrumented sameValue(previous, next) call site. It includes enumeration, declared-name filtering, empty handling and timer overhead as well as copying. Each component is the median of its own per-sample values; medians need not add exactly to the median total. Array B0 push/remove never call nextExtras; the A2 object-extras copies do not apply to them. They remain context rows for the array slot path. The following helpers expose its N-proportional planning, reconstruction, iteration, copy and assembly work.');
  sections.push(table(['Array scene', 'Function', 'Inclusive µs [range]', 'Call count [range]'], splitIds.filter((id) => id.startsWith('array')).flatMap((id) => {
    const rows = rowsFor(split, (row) => row.id === id);
    return rows[0].arrayWork.map((name) => [id, '`' + name + '`', format(rows.map((row) => row.functions[name].medianUs)), format(rows.map((row) => row.functions[name].medianCalls), 1)]);
  })));
  const variants = Object.fromEntries(runtimes.map((r) => [r, records('a2', r)]));
  if (Object.values(variants).flat().some((record) => !record.addendum)) throw new Error('Rerun addendum A2-2 scenes before summarizing');
  const ledgerIds = variants.node[0].rows.filter((row) => row.variant === 'baseline' && row.separateLedgerScene).map((row) => row.id), allA2Ids = [...splitIds, ...ledgerIds];
  sections.push('## A2-2: baseline / reuse / assign through writeObjectKey', 'v1 is counted as removable only when all three target-host ledger conditions hold: no declared names in the input; no previous extras need merging; and core never mutates the retained object later (WRITE-013). B1 v1 rows are outside conditions (declared name in input). Array rows are context only. Merge and caller-mutation cases are reported separately. v2 calls the bundle’s existing writeObjectKey in both copy loops, retaining its __proto__ handling.', table(['Runtime', 'Scene', 'Baseline ms [range]', 'v1 reuse ms [range]', 'v2 writeObjectKey ms [range]', 'v1 accounting', 'v1 removable ms [range]', 'v1 removable % [range]', 'v2 removed ms [range]', 'v2 removed % [range]'], runtimes.flatMap((r) => splitIds.map((id) => {
    const base = rowsFor(variants[r], (row) => row.id === id && row.variant === 'baseline'), v1 = rowsFor(variants[r], (row) => row.id === id && row.variant === 'v1'), v2 = rowsFor(variants[r], (row) => row.id === id && row.variant === 'v2');
    const saved = (rows) => [format(base.map((x, i) => x.medianMs - rows[i].medianMs)), format(base.map((x, i) => (x.medianMs - rows[i].medianMs) / x.medianMs * 100), 1)];
    return [r, id, ...[base, v1, v2].map((rows) => format(rows.map((x) => x.medianMs))), v1.map((row) => row.accounting.category).join('; '), ...(v1.every((row) => row.accounting.v1Eligible) ? saved(v1) : ['not counted', 'not counted']), ...(base[0].kind === 'array' ? ['context only', 'context only'] : saved(v2))];
  }))));
  sections.push('## A2-2: separate ledger scenes (not removable accounting)', 'Timing measures the engine write. Caller mutation and its observations occur afterwards, outside timing.', table(['Runtime', 'Scene', 'Baseline ms [range]', 'v1 reuse ms [range]', 'v2 writeObjectKey ms [range]'], runtimes.flatMap((r) => ledgerIds.map((id) => [r, id, ...['baseline', 'v1', 'v2'].map((variant) => format(rowsFor(variants[r], (row) => row.id === id && row.variant === variant).map((row) => row.medianMs)))]))));
  sections.push('## v1 removable ledger', 'Conditions describe target /h. Whole-bundle v1 timings can also include enclosing-root effects and are not an exact isolated copy cost. Caller mutation probes remain separate even when WRITE-013 passes, because a caller changing its own object is distinct from core mutating it.', table(['Runtime', 'Scene', 'C1 no declared input names', 'C2 no previous extras to merge', 'C3 WRITE-013', 'Counted / reason'], runtimes.flatMap((r) => allA2Ids.map((id) => {
    const rows = rowsFor(variants[r], (row) => row.id === id && row.variant === 'v1');
    const condition = (name) => rows.map((row, i) => `${rounds[i]}: ${row.accounting.conditions[name] === null ? 'n/a' : row.accounting.conditions[name] ? 'pass' : 'fail'}`).join('; ');
    return [r, id, condition('inputHoldsNoDeclaredNames'), condition('noPreviousExtrasToMerge'), condition('coreNeverMutatesObjectLater'), rows.map((row, i) => `${rounds[i]}: ${row.accounting.category}`).join('; ')];
  }))));
  function statuses(rows, check) { return rows.map((row, i) => `${rounds[i]}: ${check(row.correctness)}`).join('; '); }
  sections.push('## A2-2: recorded correctness per scene and variant', 'For Merge, VALUE-002 checks the previous-extras insertion order followed by the new incoming key (SETTLE-042), rather than comparing the full output with the one-key partial input.', table(['Runtime', 'Scene', 'Variant', 'WRITE-013', 'Frozen input: throws / normal', 'VALUE-002 / Merge order', 'Value / onChange'], runtimes.flatMap((r) => allA2Ids.flatMap((id) => ['baseline', 'v1', 'v2'].map((variant) => {
    const rows = rowsFor(variants[r], (row) => row.id === id && row.variant === variant);
    return [r, id, variant, statuses(rows, (c) => `${c.WRITE013.status} (first ${c.WRITE013.afterFirst}, later ${c.WRITE013.afterLater})`), statuses(rows, (c) => `${c.frozenCaller.throws ? 'throws' : 'no throw'} / ${c.frozenCaller.normalStatus}`), statuses(rows, (c) => `${c.VALUE002.status} (mount ${c.VALUE002.afterMount}, first ${c.VALUE002.afterFirstWrite}, later ${c.VALUE002.afterLaterWrite})`), statuses(rows, (c) => c.normal.status)];
  })))));
  sections.push('## B1 declared k0 correctness observation', 'k0 is declared and should appear once in the emitted value. Presence in undeclaredValues is the leak checked here; emitting the correct declared k0 is expected.', table(['Runtime', 'Scene', 'Variant', 'k0 in extras: mount / first / later', 'Emitted k0 matches declared child', 'Unexpected emitted k0', 'Extras isolation'], runtimes.flatMap((r) => splitIds.filter((id) => id.startsWith('object-B1')).flatMap((id) => ['baseline', 'v1', 'v2'].map((variant) => {
    const rows = rowsFor(variants[r], (row) => row.id === id && row.variant === variant);
    return [r, id, variant, statuses(rows, (c) => Object.values(c.declaredNameLeak.snapshots).map((s) => String(s.extrasHasK0)).join(' / ')), statuses(rows, (c) => String(Object.values(c.declaredNameLeak.snapshots).every((s) => s.emittedK0MatchesDeclaredChild))), statuses(rows, (c) => String(Object.values(c.declaredNameLeak.snapshots).some((s) => s.emittedUnexpectedK0))), statuses(rows, (c) => c.declaredNameLeak.status)];
  })))));
  sections.push('## Merge observation: object B0, 1000 existing keys, incoming k1000', table(['Runtime', 'Variant', 'Host / extras key count', 'New extras object', 'Previous extras unchanged', 'Previous keys retained', 'Host / extras insertion order', 'Merge check'], runtimes.flatMap((r) => ['baseline', 'v1', 'v2'].map((variant) => {
    const rows = rowsFor(variants[r], (row) => row.op === 'merge-one-key' && row.variant === variant);
    return [r, variant, statuses(rows, (c) => `${c.merge.hostKeyCount} / ${c.merge.extrasKeyCount}`), statuses(rows, (c) => c.merge.newExtrasObject), statuses(rows, (c) => c.merge.previousExtrasUnchanged), statuses(rows, (c) => c.merge.retainedPreviousKeys), statuses(rows, (c) => `${c.merge.hostOrderMatchesExpected} / ${c.merge.extrasOrderMatchesExpected}`), statuses(rows, (c) => c.merge.status)];
  }))));
  sections.push('## Caller-mutation observation: object B0 one-key Overwrite, then caller sets k500 = -123456', 'Snapshots are recorded immediately and after delivery drains; no second engine write occurs during this observation. A caller mutation is not a WRITE-013 core mutation.', table(['Runtime', 'Variant', 'Host follows: immediate / drained', 'Extras follow: immediate / drained', 'Root follows: immediate / drained', 'Extras alias input', 'Extra onChange calls', 'Isolation observation'], runtimes.flatMap((r) => ['baseline', 'v1', 'v2'].map((variant) => {
    const rows = rowsFor(variants[r], (row) => row.op === 'caller-mutates-after-write' && row.variant === variant);
    const values = (key) => statuses(rows, (c) => `${c.callerMutation.immediate[key]} / ${c.callerMutation.afterDrain[key]}`);
    return [r, variant, values('hostFollows'), values('extrasFollow'), values('rootFollows'), statuses(rows, (c) => c.callerMutation.afterDrain.extrasAliasCallerInput), statuses(rows, (c) => c.callerMutation.extraOnChangeCalls), statuses(rows, (c) => c.callerMutation.status)];
  }))));
  const terminal = Object.fromEntries(runtimes.map((r) => [r, records('terminal', r)]));
  sections.push('## A2-3: terminal object, 1000 keys', table(['Runtime', 'Engine', 'k0 ms [range]', 'k500 ms [range]', 'k999 ms [range]', 'All-keys ms [range]'], runtimes.flatMap((r) => ['current', 'legacy'].map((engine) => [r, engine, ...[0, 500, 999, undefined].map((index) => format(rowsFor(terminal[r], (row) => row.engine === engine && (index === undefined ? row.op === 'all-keys' : row.keyIndex === index)).map((row) => row.medianMs)))]))));
  const failedRows = loaded.flatMap(({ file, record }) => record.rows.filter((row) => row.status !== 'pass' || row.uninstrumented?.status === 'fail').map((row) => ({ file, row })));
  const describeFailure = ({ file, row }) => `${file}: ${row.id} ${row.engine} ${row.variant}: ${row.status}`;
  const failures = failedRows.map(describeFailure);
  const expected = ({ row }) => row.variant === 'v1' && row.op === 'merge-one-key' && row.uninstrumented?.status !== 'fail';
  const counterfactualFailures = failedRows.filter(expected).map(describeFailure), unexpectedFailures = failedRows.filter((item) => !expected(item)).map(describeFailure);
  sections.push('## Measurement status', `${loaded.reduce((sum, x) => sum + x.record.rows.length, 0)} loaded rows; ${counterfactualFailures.length} v1 Merge counterfactual value/completion failure(s); ${unexpectedFailures.length} unexpected measurement failure(s). Recorded times are retained. B1 extras leakage and caller-mutation isolation results are detailed in their correctness tables.`, ...failures);
  sections.push('## Provenance', table(['Result file', 'Runtime version', 'Warmups', 'Samples'], loaded.map(({ file, record }) => [file, record.runtime.version, record.config.warmups, record.config.samples])));
  const output = path.join(dir, 'table.md');
  fs.writeFileSync(output, sections.join('\n\n') + '\n');
  console.log(JSON.stringify({ kind: 'summary', output, smoke, inputFiles: loaded.map((x) => x.file), measurementFailures: failures, counterfactualMeasurementFailures: counterfactualFailures, unexpectedMeasurementFailures: unexpectedFailures }));
}
main().catch((error) => { console.error(error.stack); process.exitCode = 1; });
