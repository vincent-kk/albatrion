// CLI reads existing session artifacts only; no worker, bundle evaluation, or timing measurement is performed.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { useMeasuredBlocks131 } from './use-measured-blocks-131.mjs';
import { reportSession131 } from './report-session-131.mjs';
import { summarizeSession131 } from './summarize-session-131.mjs';
import { annotateRow131 } from './annotate-row-131.mjs';
import { gcObservation131 } from './gc-observation-131.mjs';
import { measurementNode131 } from './measurement-node-131.mjs';

const hash = bytes => createHash('sha256').update(bytes).digest('hex');
/** Recompute an existing A/A with all measured blocks and the 131 method, preserving the original measurement times. */
export function recomputeSession131(input, out) {
  input = path.resolve(input); out = path.resolve(out);
  assert.notEqual(input, out, 'Recompute output must differ from the source session');
  assert(!fs.existsSync(out) || fs.readdirSync(out).length === 0, 'Recompute output must be new or empty');
  const sourceFile = path.join(input, 'final.json'), sourceBytes = fs.readFileSync(sourceFile), source = JSON.parse(sourceBytes);
  assert.equal(source.kind, 'aa', 'Only existing A/A sessions are recomputed');
  let verifiedFiles = 0;
  for (const line of fs.readFileSync(path.join(input, 'sha256.txt'), 'utf8').trim().split('\n')) {
    const [digest, relative] = line.split('  '), file = path.resolve(input, relative);
    assert(file.startsWith(input + '/'), 'Source SHA list must stay inside its session');
    assert.equal(hash(fs.readFileSync(file)), digest, `${relative}: source SHA-256 mismatch`);
    verifiedFiles++;
  }
  const original = (source.report.inputs?.records ?? source.rawInputs).map(({ source: file, sha256 }) => {
    assert(path.resolve(file).startsWith(input + '/'), 'Raw input must stay inside the source session');
    const bytes = fs.readFileSync(file); assert.equal(hash(bytes), sha256, `${file}: raw SHA-256 mismatch`);
    return { source: file, sha256, record: JSON.parse(bytes) };
  });
  const restored = useMeasuredBlocks131(original);
  for (const item of restored) {
    const record = item.record;
    for (const role of ['base', 'candidate']) {
      const measured = source.processes.filter(process => process.phase === 'raw' && process.role === role
        && process.forms.some(form => form.fixture === record.fixture && form.validation === record.validation)).map(process => process.block).sort((a, b) => a - b);
      assert.deepEqual(record.blocks.map(block => block.block).sort((a, b) => a - b), measured,
        `${record.fixture}/${record.validation}/${role}: not every measured block was restored`);
    }
  }
  fs.mkdirSync(path.join(out, 'raw'), { recursive: true });
  const write = (file, data) => fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n', { flag: 'wx' });
  const records = restored.map(item => {
    const file = path.join(out, 'raw', path.basename(item.source));
    write(file, item.record);
    return { record: item.record, source: file, sha256: hash(fs.readFileSync(file)) };
  });
  const report = reportSession131({ records, fullBlocks: source.options.blocks });
  report.rows = report.rows.map(row => {
    const raw = records.find(item => (row.mergedKeys ?? [row.key]).includes(item.record.scope131?.key));
    const scope = { ...raw?.record.scope131, scope: row.scope, reason: row.scopeReason, blocks: row.blocks };
    return { ...annotateRow131(row, scope), gcObservation: raw ? gcObservation131(raw.record, row.mode) : null, confirmGcObservation: null };
  });
  report.inputs = { records: records.map(({ source, sha256 }) => ({ source, sha256 })), confirmRecords: [], swapRecords: [] };
  const directory = path.dirname(fileURLToPath(import.meta.url));
  const toolSha256 = Object.fromEntries(fs.readdirSync(directory).filter(name => name.endsWith('.mjs')).sort()
    .map(name => [name, hash(fs.readFileSync(path.join(directory, name)))]));
  const result = { ...source, status: report.aaSummary.passed ? 'passed' : 'failed', report,
    options: { ...source.options, out }, rawInputs: report.inputs.records, toolSha256,
    recompute: { source: sourceFile, sourceSha256: hash(sourceBytes), verifiedFiles, noNewTiming: true,
      measurementTimes: 'Copied from the source session; no new timing was performed',
      restoredRows: records.filter((item, i) => item.record.blocks.length > original[i].record.blocks.length).map(item => ({
        key: item.record.scope131.key, plannedBlocks: item.record.scope131.blocks, usedBlocks: item.record.blocks.length })) } };
  if (result.status === 'failed') result.error = 'A/A reduced, full and total bands did not all pass';
  else delete result.error;
  write(path.join(out, 'first-report.json'), report); write(path.join(out, 'final.json'), result);
  fs.writeFileSync(path.join(out, 'summary.md'), summarizeSession131(result), { flag: 'wx' });
  const files = ['first-report.json', 'final.json', 'summary.md', ...fs.readdirSync(path.join(out, 'raw')).map(name => `raw/${name}`)];
  fs.writeFileSync(path.join(out, 'sha256.txt'), files.sort().map(file => `${hash(fs.readFileSync(path.join(out, file)))}  ${file}`).join('\n') + '\n', { flag: 'wx' });
  return result;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    assert.equal(fs.realpathSync(process.execPath), fs.realpathSync(measurementNode131));
    const args = process.argv.slice(2), options = {};
    for (let i = 0; i < args.length; i++) {
      assert(['--in', '--out'].includes(args[i]) && !options[args[i]], 'Use --in <existing session> --out <new dir>');
      options[args[i]] = args[++i];
    }
    assert(options['--in'] && options['--out'], '--in and --out are required');
    const session = recomputeSession131(options['--in'], options['--out']), bands = session.report.aaSummary.bands;
    console.log(`RECOMPUTE_SESSION_131_OK: ${['reduced', 'full', 'total'].map(key => `${key} ${bands[key].excluded}/${bands[key].rows} band ${bands[key].band.low}..${bands[key].band.high}`).join('; ')}; ${session.report.mergedRows.length} merged pairs; ${session.report.decision}; no new timing`);
    if (session.status !== 'passed') process.exitCode = 1;
  } catch (error) { console.error(`RECOMPUTE_SESSION_131_FAILED: ${error.message}`); process.exitCode = 1; }
}
