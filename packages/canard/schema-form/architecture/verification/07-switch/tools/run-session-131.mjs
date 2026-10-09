// CLI deliverable: sequential single-bundle 129 workers -> canonical pair records -> 129 report/confirmation -> JSON/한국어 summary.
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { performance } from 'node:perf_hooks';
import { fileURLToPath } from 'node:url';
import { parseSession131 } from './parse-session-131.mjs';
import { verifyBundles131 } from './verify-bundles-131.mjs';
import { sessionRows131 } from './session-rows-131.mjs';
import { scopeRows131 } from './scope-rows-131.mjs';
import { confirmationRows131 } from './confirmation-rows-131.mjs';
import { summarizeSession131 } from './summarize-session-131.mjs';
import { estimateSession131 } from './estimate-session-131.mjs';
import { gcObservation131 } from './gc-observation-131.mjs';
import { corePairRecord129 } from './measure-core-pair-129.mjs';
import { reactPairRecord129 } from './measure-react-pair-129.mjs';
import { reportCluster129 } from './report-cluster-129.mjs';
import { gaValidation129 } from './ga-validation-129.mjs';
import { rowSeed129 } from './row-seed-129.mjs';
import { watchScope131 } from './watch-scope-131.mjs';
import { annotateRow131 } from './annotate-row-131.mjs';
import { preflightSession131, assertBudget131 } from './preflight-session-131.mjs';

const tool = fileURLToPath(import.meta.url), directory = path.dirname(tool), repo = path.resolve(directory, '../../../../../../..');
const node = '/opt/homebrew/bin/node';
const read = file => JSON.parse(fs.readFileSync(file, 'utf8'));
const hash = value => createHash('sha256').update(value).digest('hex');
const write = (file, value) => fs.writeFileSync(file, JSON.stringify(value, null, 2) + '\n', { flag: 'wx' });

/** Measure only the requested setting/block pairs; a process may contain several forms but never multiple bundles. */
function measurePass(options, bundles, rows, phase, stage, deadline, processes, firstReport) {
  const raw = path.join(options.out, phase);
  fs.mkdirSync(raw);
  const settings = [];
  for (const row of rows) {
    const key = `${row.fixture}/${row.validation}`;
    let setting = settings.find(item => item.key === key);
    if (!setting) { setting = { key, fixture: row.fixture, validation: row.validation, rows: [], blocks: [] }; settings.push(setting); }
    setting.rows.push(row);
  }
  const maxBlocks = Math.max(...rows.map(row => row.blocks));
  for (let block = 0; block < maxBlocks; block++) {
    const active = settings.filter(setting => setting.rows.some(row => row.blocks > block));
    // Rotate form order across blocks so position bias is observable in the later multi-form A/A validation.
    const offset = block % active.length, ordered = [...active.slice(offset), ...active.slice(0, offset)];
    for (let start = 0; start < ordered.length; start += options.formsPerProcess) {
      const group = ordered.slice(start, start + options.formsPerProcess), sides = {};
      const order = block % 2 === 0 ? ['base', 'candidate'] : ['candidate', 'base'];
      for (const [position, role] of order.entries()) {
        assert(Date.now() + 5000 < deadline, 'Session budget exhausted; select fewer rows for one deliverable');
        const id = `b${block}-g${start}-${role}`, output = path.join(raw, `${id}.json`), jobPath = path.join(raw, `${id}.job.json`);
        const worker = path.join(directory, options.lane === 'core' ? 'measure-core-worker-129.mjs' : 'measure-react-pair-129.mjs');
        const workerDeadline = Math.min(deadline - 1000, Date.now() + 420000);
        const job = { role, stage, settings: group.map(({ fixture, validation }) => ({ fixture, validation })), bundle: bundles[role], out: output, deadlineEpochMs: workerDeadline };
        write(jobPath, job);
        const args = ['--expose-gc', worker, `--session-job=${jobPath}`, `--warmup=${options.warmup}`, `--samples=${options.samples}`, '--no-gc'];
        const startedAt = new Date().toISOString(), childStart = performance.now();
        const result = spawnSync(node, args, { cwd: repo, encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 });
        const wallMs = performance.now() - childStart;
        const execution = { startedAt, endedAt: new Date().toISOString(), wallMs, exitCode: result.status, signal: result.signal,
          command: node, argv: args, stderr: result.stderr?.slice(-4000), phase, block, role, position };
        write(path.join(raw, `${id}.execution.json`), execution);
        assert.equal(result.signal, null, `${id}: worker must end by itself`);
        assert.equal(result.status, 0, `${id}: worker failed: ${result.stderr?.slice(-2000)}`);
        assert(wallMs < 480000, `${id}: worker exceeded eight minutes`);
        const batch = read(output);
        assert.equal(batch.bundlesLoaded, 1, 'Never mix bundles in one process');
        assert.equal(batch.reports.length, group.length);
        const forms = batch.reports.map((report, index) => {
          const fixture = report.summary?.fixture ?? report.fixture;
          assert.equal(fixture, group[index].fixture, 'Worker form order mismatch');
          const expected = report.summary?.bundle ?? report.bundle;
          assert.equal(expected.sha256, bundles[role].sha256, 'Worker bundle digest mismatch');
          assert.equal(expected.revision, bundles.baseRevision, 'Worker base revision mismatch');
          let ga = null;
          if (options.lane === 'core') {
            assert.equal(report.summary.validation, group[index].validation);
            ga = gaValidation129(report, rowSeed129(`${group[index].key}/ga/b${block}/${role}`));
            const failed = Object.entries(ga).filter(([, item]) => !item.passed);
            assert(!failed.length, `(ga) assertion failed for ${group[index].key}/${role}: ${failed.map(([mode]) => mode).join(', ')}; raw ${output}`);
          }
          sides[role] ??= [];
          sides[role].push({ report, position, seconds: wallMs / 1000, ga });
          return { fixture, validation: group[index].validation, time: report.telemetry.time, formPosition: index, gc: report.telemetry.gc };
        });
        const fields = ['startToReadyMs', 'warmupMs', 'forcedGcMs', 'minorGcMs', 'sampleMs', 'digestMs', 'calibrationMs'];
        const time = Object.fromEntries(fields.map(name => [name, forms.reduce((sum, form) => sum + form.time[name], 0)]));
        const launchGapMs = Math.max(0, wallMs - forms.reduce((sum, form) => sum + form.time.formElapsedMs, 0) - (forms[0].time.startToReadyMs));
        time.startToReadyMs += launchGapMs;
        processes.push({ ...execution, pid: batch.pid, bundleSha256: bundles[role].sha256, bundlesLoaded: batch.bundlesLoaded,
          forms, time, raw: output, formsPerProcess: group.length });
      }
      for (const [index, setting] of group.entries()) {
        const base = sides.base[index], candidate = sides.candidate[index];
        setting.blocks.push(options.lane === 'core' ? { block, order, sides: { base, candidate } }
          : { block, order, reports: { base: { ...base.report, position: base.position, seconds: base.seconds },
            candidate: { ...candidate.report, position: candidate.position, seconds: candidate.seconds } } });
      }
      assert(Date.now() < deadline, 'Session budget exhausted after a worker group');
    }
  }
  return settings.map(setting => {
    const confirm = phase === 'confirm' ? { source: firstReport.source, sourceSha256: firstReport.sha256,
      modes: setting.rows.map(row => row.mode) } : null;
    const seconds = setting.blocks.reduce((sum, block) => sum + (options.lane === 'core'
      ? block.sides.base.seconds + block.sides.candidate.seconds : block.reports.base.seconds + block.reports.candidate.seconds), 0);
    const record = options.lane === 'core'
      ? corePairRecord129({ blocks: setting.blocks, stage, fixtureName: setting.fixture, validation: setting.validation,
        confirm, bundles: path.dirname(bundles.base.file), seconds,
        ga: setting.blocks.flatMap(block => ['base', 'candidate'].map(role => ({ block: block.block, role, passed: true, modes: block.sides[role].ga }))) })
      : reactPairRecord129({ blocks: setting.blocks, stage, fixtureName: setting.fixture, confirm, prefix: 'session131',
        sides: { base: bundles.base.file, candidate: bundles.candidate.file }, warmup: options.warmup, samples: options.samples, noGc: true, seconds });
    for (const block of record.blocks) for (const role of ['base', 'candidate']) {
      const report = options.lane === 'core' ? setting.blocks.find(item => item.block === block.block).sides[role].report
        : setting.blocks.find(item => item.block === block.block).reports[role];
      block[role].gc = report.telemetry.gc;
    }
    // A setting can be indivisible in the worker; expose only each row's requested blocks to the unchanged reporter.
    return setting.rows.map(row => {
      const selected = { ...record, verdictColumns: record.verdictColumns.includes(row.mode) ? [row.mode] : [],
        recordColumns: record.recordColumns.includes(row.mode) ? [row.mode] : [], blocks: record.blocks.filter(block => block.block < row.blocks),
        scope131: row, coreEmptyPool131: row === setting.rows.find(item => item.blocks === Math.max(...setting.rows.map(item => item.blocks))) };
      if (confirm) selected.confirm = { ...confirm, modes: [row.mode] };
      const source = path.join(raw, `pair-${row.key.replaceAll('/', '-')}.json`);
      write(source, selected);
      return { record: selected, source, sha256: hash(fs.readFileSync(source)) };
    });
  }).flat();
}

/** Run and finalize a complete session, including failure artifacts and immutable input/output hashes. */
function main() {
  const started = performance.now(), options = parseSession131(process.argv.slice(2));
  assert.equal(fs.realpathSync(process.execPath), fs.realpathSync(node), 'Use /opt/homebrew/bin/node');
  assert.equal(process.version, 'v26.10.0', 'Node v26.10.0 is required');
  options.out = path.resolve(options.out);
  assert(!fs.existsSync(options.out) || fs.readdirSync(options.out).length === 0, '--out must be new or empty');
  fs.mkdirSync(options.out, { recursive: true });
  const session = { format: 'measurement-session-131', kind: options.kind, lane: options.lane, smoke: options.smoke,
    status: 'failed', options, scoping: [], processes: [], time: { totalMs: 0, confirmMs: 0, reportMs: 0 },
    digestChoice: 'no-GC pass: synchronous minor GC after the mounted observation digest, outside the timed write; forced-GC columns unchanged',
    multiForm: { requested: options.formsPerProcess, default: 1, biasValidated: false,
      validation: 'Later 24-block A/A compares formsPerProcess=1 and n, row statistics and form position/order; smoke is plumbing only.' } };
  const deadline = Date.now() + options.budgetSeconds * 1000;
  const checkBudget = (rows, confirmation = false) => {
    const preflight = preflightSession131(confirmation ? { ...options, kind: 'confirm' } : options, rows, deadline - Date.now());
    if (confirmation) session.confirmPreflight = preflight;
    else session.preflight = preflight;
    console.log(`SESSION_131_ESTIMATE: ${confirmation ? 'confirm' : 'first pass'} ${(preflight.estimate.totalMs / 1000).toFixed(3)}s + reserve ${(preflight.confirmReserveMs / 1000).toFixed(3)}s = ${(preflight.requiredMs / 1000).toFixed(3)}s; remaining ${(preflight.budgetMs / 1000).toFixed(3)}s`);
    assertBudget131(preflight);
  };
  const inputHashes = {};
  const jsonInput = file => {
    if (!file) return undefined;
    const bytes = fs.readFileSync(file); inputHashes[path.resolve(file)] = hash(bytes); return JSON.parse(bytes);
  };
  let reportMs = 0;
  const report = input => { const start = performance.now(); try { return reportCluster129(input); } finally { reportMs += performance.now() - start; } };
  try {
    const bundles = verifyBundles131(options);
    session.bundles = bundles;
    const countsFile = jsonInput(options.touchCounts), counts = countsFile?.rows ?? countsFile;
    const aaFile = jsonInput(options.aa), aa = aaFile?.report ?? aaFile;
    const firstFile = jsonInput(options.firstReport), first = firstFile?.report ?? firstFile;
    const axisFile = jsonInput(options.axisFrom), axis = axisFile?.report ?? axisFile;
    if (options.aa) assert(aa.format === 'cluster-report-129' && aa.stage === 'AA', '--aa must be a 129 A/A report or final 131 A/A JSON');
    if (options.aa) assert(Array.isArray(aa.rows) && aa.rows.every(row => typeof row.key === 'string' &&
      Number.isFinite(row.aaMagnitudeMs) && row.aaMagnitudeMs >= 0), 'A/A row magnitudes must be finite and nonnegative');
    if (options.aa && !options.smoke) assert(!aaFile.smoke && !aa.rows.some(row => row.blocks < 8), 'Smoke A/A cannot support a verdict');
    const selected = sessionRows131(options.rows, options.lane);
    const requested = options.kind === 'confirm' ? selected : watchScope131(selected, options.lane);
    session.rowSelection = { selected: selected.map(row => row.key), watchAdded: requested.filter(row => !selected.some(item => item.key === row.key)).map(row => row.key),
      interpretation: 'Statistics and decisions cover this explicit session scope, not omitted rows. Fixed watch rows are always included in first passes.' };
    if (fs.existsSync(options.rows)) inputHashes[path.resolve(options.rows)] = hash(fs.readFileSync(options.rows));
    session.scoping = scopeRows131(requested, counts, options.blocks, options.reducedBlocks);
    const input = { aa, counts, axisGainMs: axis?.exemption?.axisGainMs };
    if (options.kind !== 'aa') {
      const aaKeys = aa.rows.map(row => row.key);
      assert(requested.filter(row => !row.mode.endsWith('-nogc') && !/^(profiler|commits)-/.test(row.mode)).every(row => aaKeys.includes(row.key)), 'A/A noise row missing; cannot issue a silent pass');
    }
    let records, confirmRecords = [];
    if (options.kind === 'confirm') {
      records = first.inputs.records.map(({ source, sha256 }) => {
        const bytes = fs.readFileSync(source); assert.equal(hash(bytes), sha256, `${source}: first-report raw SHA-256 mismatch`);
        return { source, sha256, record: JSON.parse(bytes) };
      });
      assert(records.every(item => item.record.lane === options.lane), 'First report lane differs');
      assert(records.every(item => item.record.bundleSha256.base === bundles.base.sha256 && item.record.bundleSha256.candidate === bundles.candidate.sha256), 'Confirmation bundles differ from first pass');
      const rows = confirmationRows131(first, options.lane, options.blocks);
      session.confirmationPlan = rows;
      assert(rows.every(row => requested.some(item => item.key === row.key)), '--rows must include every flagged row of this lane');
      session.scoping = rows;
      checkBudget(rows);
      const confirmStart = performance.now();
      if (rows.length) confirmRecords = measurePass(options, bundles, rows, 'confirm', first.stage, deadline, session.processes,
        { source: options.firstReport, sha256: inputHashes[path.resolve(options.firstReport)] });
      session.time.confirmMs = performance.now() - confirmStart;
    } else {
      checkBudget(session.scoping);
      records = measurePass(options, bundles, session.scoping, 'raw', options.kind === 'aa' ? 'AA' : 'session131', deadline, session.processes);
    }
    let result = report({ ...input, records, confirmRecords });
    const firstPath = path.join(options.out, 'first-report.json');
    result.inputs = { records: records.map(({ source, sha256 }) => ({ source, sha256 })) };
    write(firstPath, result);
    if (options.kind === 'verdict') {
      const rows = confirmationRows131(result, options.lane, options.blocks), confirmStart = performance.now();
      session.confirmationPlan = rows;
      if (rows.length) {
        checkBudget(rows, true);
        confirmRecords = measurePass(options, bundles, rows, 'confirm', result.stage, deadline, session.processes,
          { source: firstPath, sha256: hash(fs.readFileSync(firstPath)) });
        result = report({ ...input, records, confirmRecords });
      }
      session.time.confirmMs = performance.now() - confirmStart;
    }
    assert(!result.aaMissing?.length, 'Missing A/A noise entries');
    assert(result.decision !== 'CONFIRMATION_PENDING', 'Independent confirmation incomplete');
    const all = [...records, ...confirmRecords];
    result.rows = result.rows.map(row => {
      const raw = records.find(item => item.record.scope131?.key === row.key) ?? records.find(item =>
        item.record.fixture === row.fixture && item.record.validation === row.validation && [...item.record.verdictColumns, ...item.record.recordColumns].includes(row.mode));
      const scope = raw?.record.scope131 ?? session.scoping.find(item => item.key === row.key);
      return { ...annotateRow131(row, scope, result.confirmation?.rows.find(item => item.key === row.key)),
        gcObservation: raw ? gcObservation131(raw.record, row.mode) : null,
        confirmGcObservation: confirmRecords.find(item => item.record.scope131?.key === row.key)
          ? gcObservation131(confirmRecords.find(item => item.record.scope131?.key === row.key).record, row.mode) : null };
    });
    result.inputs = { records: records.map(({ source, sha256 }) => ({ source, sha256 })),
      confirmRecords: confirmRecords.map(({ source, sha256 }) => ({ source, sha256 })), aa: options.aa ?? null, counts: options.touchCounts ?? null,
      toolSha256: hash(fs.readFileSync(path.join(directory, 'report-cluster-129.mjs'))) };
    if (options.smoke) result.decision = 'SMOKE_NO_VERDICT';
    session.report = result;
    session.rawInputs = all.map(({ source, sha256 }) => ({ source, sha256 }));
    const targetRows = scopeRows131(requested, counts, 24, 8);
    const estimateOptions = { ...options, observedSessionMs: performance.now() - started - session.time.confirmMs, observedReportMs: reportMs };
    session.estimate = estimateSession131(session.processes.filter(process => process.phase !== 'confirm'), targetRows, estimateOptions);
    if (options.lane === 'react' && options.rows === 'react-129') session.estimate.boundedPresets = Object.fromEntries(
      ['react-129-main', 'react-129-large', 'react-129-array-1000', 'react-129-nested-d5'].map(preset => {
        const estimated = estimateSession131(session.processes.filter(process => process.phase !== 'confirm'), scopeRows131(watchScope131(sessionRows131(preset, 'react'), 'react'), counts, 24, 8), estimateOptions);
        const confirmReserveMs = Math.max(1200000, estimated.totalMs * .25);
        return [preset, { estimateMs: estimated.totalMs, confirmReserveMs, requiredMs: estimated.totalMs + confirmReserveMs,
          fits: estimated.complete && estimated.totalMs + confirmReserveMs < options.budgetSeconds * 1000 }];
      }));
    verifyBundles131(options);
    for (const [file, digest] of Object.entries(inputHashes)) assert.equal(hash(fs.readFileSync(file)), digest, `${file}: input digest changed`);
    session.status = 'passed';
  } catch (error) { session.error = error.message; process.exitCode = 1; }
  session.time.reportMs = reportMs;
  session.inputSha256 = inputHashes;
  session.toolSha256 = Object.fromEntries(fs.readdirSync(directory).filter(name => name.endsWith('.mjs')).sort().map(name => [name, hash(fs.readFileSync(path.join(directory, name)))]));
  session.time.totalMs = performance.now() - started;
  session.environment = { node: process.version, nodeBinary: process.execPath, startedAt: new Date(Date.now() - session.time.totalMs).toISOString(), endedAt: new Date().toISOString() };
  const finalPath = path.join(options.out, 'final.json'), summaryPath = path.join(options.out, 'summary.md');
  write(finalPath, session);
  fs.writeFileSync(summaryPath, summarizeSession131(session), { flag: 'wx' });
  const files = [];
  const walk = dir => { for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name); if (entry.isDirectory()) walk(file); else files.push(file);
  } };
  walk(options.out);
  fs.writeFileSync(path.join(options.out, 'sha256.txt'), files.sort().map(file => `${hash(fs.readFileSync(file))}  ${path.relative(options.out, file)}`).join('\n') + '\n', { flag: 'wx' });
  console.log(`${session.status === 'passed' ? 'SESSION_131_OK' : 'SESSION_131_FAILED'}: ${finalPath}; ${session.error ?? 'all steps passed'}; wall ${(session.time.totalMs / 1000).toFixed(3)}s`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === tool) {
  try { main(); } catch (error) { console.error(`SESSION_131_FAILED: ${error.message}`); process.exitCode = 1; }
}
