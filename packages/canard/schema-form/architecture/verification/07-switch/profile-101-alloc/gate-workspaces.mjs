// CLI-only adapter; canonical builder, profiler and paired sentinel remain authoritative.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const script = fileURLToPath(import.meta.url);
const artifacts = path.dirname(script);
const pkg = path.resolve(artifacts, '../../../..');
const repo = path.resolve(pkg, '../../..');
const head = 'da734b40da7a35186646bef42c9f65cee3178892';
process.env.PROFILE_101_HEAD = head;
process.env.NODE_PATH = path.join(repo, 'node_modules');
assert.equal(execFileSync('git', ['--no-optional-locks', 'rev-parse', 'HEAD'],
  { cwd: repo, encoding: 'utf8' }).trim(), head);

/** Require a unique source anchor so protocol drift fails before measurement. */
function once(source, before, after) {
  assert.equal(source.split(before).length, 2, before);
  return source.replace(before, after);
}

/** Retain bounded measurement evidence only within this directory. */
function save(name, value) {
  const text = JSON.stringify(value, null, 2) + '\n';
  assert(Buffer.byteLength(text) <= 5_000_000, name);
  fs.writeFileSync(path.join(artifacts, 'gate-workspaces-' + name + '.json'), text);
}

let source = fs.readFileSync(path.join(artifacts, 'measure.mjs'), 'utf8');
source = source.slice(0, source.lastIndexOf('const [command, ...args] = process.argv.slice(2);'));
source = once(source, '\nconst script = fileURLToPath(import.meta.url);', `\nconst script = ${JSON.stringify(script)};`);
let pairedSource = fs.readFileSync(path.join(artifacts, 'normalization-memo.mjs'), 'utf8');
pairedSource = pairedSource.slice(pairedSource.indexOf('/** Median uses'),
  pairedSource.indexOf('/** Compare all recorded columns'));
pairedSource = pairedSource.replaceAll('Date.now() - started', 'Date.now() - startedMs');
pairedSource = pairedSource.replaceAll('save(', 'saveResult(');
pairedSource = once(pairedSource,
  "const values = typeof input === 'string' ? [input + '-later', input + '-again'] :",
  "const values = name.startsWith('oneOf-') ? ['kind_4', 'kind_0'] : typeof input === 'string' ? [input + '-later', input + '-again'] :");
pairedSource = once(pairedSource,
  "      const schema = mode === 'mount' ? structuredClone(fixture.workspace) : undefined;",
  `      const schema = mode === 'mount' || mode === 'first' ? structuredClone(fixture.workspace) : undefined;
      if (mode === 'first') {
        roots[version] = api.create(engines[version], fixture, version === 'head' ? 'head' : variant, schema);
        await measured(() => {});
        targets[version] = roots[version].find(fixture.interactions[0].path);
        assert(targets[version]);
      }`);
pairedSource = once(pairedSource,
  'targets[version].setValue(values[(index + 20) % 2])',
  "targets[version].setValue(mode === 'first' ? input : values[(index + 20) % 2])");
source += `\nconst saveResult = (name, value) => save(path.join(artifacts, 'gate-workspaces-' + name + '.json'), value);\n`;
source += pairedSource;
source += '\nexport { api, paired, child, median, medianError };\n';
const { api, paired, child, median, medianError } = await import('data:text/javascript;base64,' + Buffer.from(source).toString('base64'));
globalThis.__allocTransform = (file, content, variant) => variant === 'gate-workspaces' ? content :
  execFileSync('git', ['--no-optional-locks', 'show', head + ':' + path.relative(repo, file)],
    { cwd: repo, encoding: 'utf8', maxBuffer: 5_000_000 });

const operations = [['oneOf-20', 'mount'], ['nested-d5-f4', 'mount'], ['flat-500', 'mount'],
  ['sample-0', 'mount'], ['oneOf-5', 'first'], ['oneOf-5', 'later'],
  ['oneOf-40', 'first'], ['oneOf-40', 'later'], ['sample-0', 'first'], ['sample-0', 'later']];

/** Apply the recorded three-run no-op/empty/bootstrap noise rule to both columns. */
function summarize() {
  const rows = [];
  for (const [name, mode] of operations) for (const regime of ['forced', 'steady']) {
    const read = (variant, run) => JSON.parse(fs.readFileSync(path.join(artifacts,
      `gate-workspaces-${variant}-${name}-${mode}-${regime}-r${run}.json`), 'utf8'));
    const controls = [1, 2, 3].map(run => read('control', run));
    const working = [1, 2, 3].map(run => read('gate-workspaces', run));
    const noOpNoiseMs = Math.max(...controls.flatMap(row => [Math.abs(row.gainMs), Math.abs(row.pairedMedianMs)]));
    const measurements = [...controls, ...working].map(row => {
      assert.equal(row.head, head); assert.equal(row.warmup, 20); assert.equal(row.samples, 101);
      assert.equal(row.calls.head, 121); assert.equal(row.calls.variant, 121);
      assert.deepEqual(row.observation.head, row.observation.variant);
      const residuals = [...row.emptyTimingsMs.before, ...row.emptyTimingsMs.after]
        .map(value => Math.abs(value - row.empty)).toSorted((a, b) => a - b);
      const error = medianError(row.timingsMs.head) + medianError(row.timingsMs.variant);
      const noiseMs = Math.max(.001, noOpNoiseMs, residuals[Math.ceil(residuals.length * .95) - 1] + error);
      const deltas = row.pairedDeltasMs.toSorted((a, b) => a - b);
      const gcInside = row.gc.filter(event => row.windows.some(window => event.start >= window.begin && event.start < window.end));
      if (regime === 'forced') assert.equal(gcInside.length, 0, 'Forced GC outside every clock');
      return { variant: row.variant, run: row.run, headMs: row.headMs, workingMs: row.workingMs,
        gainMs: row.gainMs, pairedMedianMs: row.pairedMedianMs, noiseMs,
        pairedMedianInterval: [deltas[40], deltas[60]], gcInside: gcInside.length };
    });
    const candidates = measurements.filter(row => row.variant === 'gate-workspaces');
    rows.push({ name, mode, regime, headMs: median(working.map(row => row.headMs)),
      workingMs: median(working.map(row => row.workingMs)), pairedMedianMs: median(working.map(row => row.pairedMedianMs)),
      maxNoiseMs: Math.max(...candidates.map(row => row.noiseMs)),
      aboveNoise: candidates.every(row => row.gainMs > row.noiseMs && row.pairedMedianInterval[0] > 0),
      regressionAboveNoise: candidates.every(row => row.gainMs < -row.noiseMs && row.pairedMedianInterval[1] < 0),
      singleRunRegressions: candidates.filter(row => row.gainMs < -row.noiseMs).map(row => row.run), measurements });
  }
  const result = { head, adopted: rows.some(row => row.aboveNoise) && rows.every(row => !row.regressionAboveNoise),
    noiseRule: 'max(1us, same-column no-op abs bound/paired median, empty residual p95 + 1999 bootstrap 99% median-error sum); all three runs and signed paired intervals [40,60]', rows };
  save('verdict', result);
  console.log(JSON.stringify({ adopted: result.adopted, rows: rows.map(({ measurements, ...row }) => row) }));
}

const started = Date.now();
const [command, ...args] = process.argv.slice(2);
if (command === '--build') {
  assert(['head', 'control', 'gate-workspaces'].includes(args[0]));
  const record = await api.buildAsync(args[0]);
  save('build-' + args[0], { ...record, head });
  console.log(JSON.stringify(record));
} else if (command === '--paired-worker') {
  await paired(args[0], args[1], args[2], Number(args[3]), args[4]);
} else if (command === '--pairs') {
  for (let run = 1; run <= 3; run++)
    child(['--expose-gc', script, '--paired-worker', args[0], args[1], args[2], String(run), args[3]]);
} else if (command === '--summarize') summarize();
else throw new Error('Use --build, --pairs, --paired-worker or --summarize');
assert(Date.now() - started < 480_000);
save('process-' + [command, ...args].join('_'), { args: process.argv.slice(2), execArgv: process.execArgv,
  started, ended: Date.now(), elapsedMs: Date.now() - started, status: 0, signal: null, naturalExit: true,
  driverSha256: createHash('sha256').update(fs.readFileSync(script)).digest('hex') });
