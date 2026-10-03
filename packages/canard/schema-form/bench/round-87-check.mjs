// Evidence gate: reproduce requested checks without installing or writing git state.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { execFileSync, spawnSync } from 'node:child_process';

const pkg = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const repo = path.resolve(pkg, '../../..');
const out = path.join(pkg, 'architecture/verification/07-switch');
const reserved = ['providers/RootNodeContext/RootNodeContextProvider.tsx',
  'providers/RootNodeContext/useLiveNode.ts', 'providers/RootNodeContext/utils/applyFormErrors.ts',
  'components/SchemaNode/SchemaNodeInput/SchemaNodeInput.tsx',
  'components/SchemaNode/SchemaNodeInput/hooks/useFormTypeInputControl.ts', 'core/types/index.ts'];
const changed = execFileSync('git', ['diff', '--name-only'], { cwd: repo, encoding: 'utf8' }).trim().split('\n');
const baseline = '0189c443b068fbb26fb6a7de795d40a3e01a40d8';
const currentHead = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: repo, encoding: 'utf8' }).trim();
execFileSync('git', ['merge-base', '--is-ancestor', baseline, currentHead], { cwd: repo });
if (currentHead !== baseline) console.log(`External HEAD change: ${currentHead}; validating the tested source hash.`);
const reservedHashes = () => Object.fromEntries(reserved.map(file => [file,
  fs.existsSync(path.join(pkg, 'src', file))
    ? createHash('sha256').update(fs.readFileSync(path.join(pkg, 'src', file))).digest('hex') : null]));
assert(!changed.some(file => /architecture\/verification\/.*\.json$/.test(file)));
const hash = () => {
  const current = execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard', 'packages/canard/schema-form/src'], { cwd: repo, encoding: 'utf8' }).trim().split('\n');
  const original = execFileSync('git', ['ls-tree', '-r', '--name-only', baseline, '--', 'packages/canard/schema-form/src'], { cwd: repo, encoding: 'utf8' }).trim().split('\n');
  // Keep deletion markers stable if another task commits its already-tested deletion.
  const files = [...new Set([...original, ...current])].sort();
  const digest = createHash('sha256');
  for (const file of files) digest.update(file).update(fs.existsSync(path.join(repo, file))
    ? fs.readFileSync(path.join(repo, file)) : '<deleted>');
  return digest.digest('hex');
};
if (process.argv.includes('--run')) {
  const beforeReserved = reservedHashes();
  const checks = [
    ['vitest', 'run', '--project', 'unit', '--project', 'render', '--project', 'react18', '--reporter=dot'],
    ['tsc', '--noEmit', '--composite', 'false', '--rootDir', '.', '-p', 'tsconfig.json'],
    ['eslint', 'src/**/*.{ts,tsx}'],
  ];
  const results = [];
  for (const args of checks) {
    const run = spawnSync('npx', ['--no-install', ...args], { cwd: pkg, encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 });
    const output = run.stdout + run.stderr;
    const failures = output.split('\n').filter(line => /^ FAIL /.test(line));
    const accepted = run.status === 0 || args[0] === 'vitest' && run.status === 1 && failures.length === 4 &&
      failures.every(line => /\|(render|react18)\|.*Form.effectFeedback.test.tsx.*EVENT-070 React stops two fields writing back through use(LayoutEffect|Effect)/.test(line));
    const lines = output.split('\n').filter(line => /Test Files|^\s+Tests |Duration|^ FAIL |error TS|^.*\d+:\d+.*(error|warning)|problems/.test(line));
    if (!accepted && output.includes('Failed Tests'))
      lines.push(output.slice(output.indexOf('Failed Tests')).slice(0,12000));
    console.log(args[0], run.status, lines.join('\n'));
    results.push({ command: `npx --no-install ${args.join(' ')}`, exit: run.status, accepted, summary: lines });
  }
  assert.deepEqual(reservedHashes(), beforeReserved);
  fs.writeFileSync(path.join(out, 'round-87-verification.json'), JSON.stringify({ sourceHash: hash(), reservedHashes: beforeReserved,
    concurrentReservedChanges: changed.filter(file => reserved.some(name => file.endsWith(`/src/${name}`))), results }) + '\n');
  assert(results.every(result => result.accepted));
  console.log('ROUND87_CHECKS_OK');
} else {
  const evidence = JSON.parse(fs.readFileSync(path.join(out, 'round-87-verification.json')));
  assert.equal(evidence.sourceHash, hash());
  assert(evidence.results.every(result => result.accepted));
  const data = JSON.parse(fs.readFileSync(path.join(out, 'round-87-final-summary.json')));
  const timings = JSON.parse(fs.readFileSync(path.join(out, 'round-87-final-timings.json')));
  for (const row of data.summary) {
    const values = timings.find(sample => sample.fixture === row.fixture && sample.variant === row.variant && sample.mode === row.mode).ms.toSorted((a, b) => a - b);
    assert.equal(row.median, values[Math.ceil(values.length * .5) - 1]);
    assert.equal(row.p99, values[Math.ceil(values.length * .99) - 1]);
  }
  assert(data.environment.samples >= 100 && data.environment.warmup >= 10);
  assert.equal(data.nodeCounts.find(row => row.variant === 'working' && row.fixture === 'flat-500').computed.nodes, 501);
  for (const row of data.nodeCounts.filter(row => row.mode !== 'mount')) assert.equal(row.computed.unrelated, 0);
  for (const file of fs.readdirSync(out).filter(file => /^round-87.*\.json$/.test(file))) {
    assert(fs.statSync(path.join(out, file)).size < 5_000_000);
    if (file.endsWith('-summary.json')) {
      const measured = JSON.parse(fs.readFileSync(path.join(out, file)));
      if (measured.summary) {
        const raw = JSON.parse(fs.readFileSync(path.join(out, file.replace('-summary.json', '-timings.json'))));
        for (const row of measured.summary) {
          const values = raw.find(sample => sample.fixture === row.fixture && sample.variant === row.variant && sample.mode === row.mode).ms.toSorted((a, b) => a - b);
          assert.equal(row.median, values[Math.ceil(values.length * .5) - 1]);
          assert.equal(row.p99, values[Math.ceil(values.length * .99) - 1]);
        }
      }
    }
    if (file.includes('timings')) for (const row of JSON.parse(fs.readFileSync(path.join(out, file)))) {
      assert.equal(row.ms.length, 101);
      assert(row.ms.every(Number.isFinite));
      assert(!('details' in row) && !('phases' in row));
    }
  }
  const design = fs.readFileSync(path.join(out, 'static-first-load-design.md'), 'utf8');
  assert.equal(design.split('\n').filter(line => /^\| (core|render) \|/.test(line)).length, 84);
  assert(design.includes('원장 관리자에게 남기는 질문'));
  const scope = execFileSync('git', ['diff', '0189c443b^', '0189c443b', '--name-only', '--', 'packages/canard/schema-form/src'], { cwd: repo, encoding: 'utf8' }).trim().split('\n');
  for (const file of scope.filter(file => /\.(ts|tsx)$/.test(file) && !file.includes('/__tests__/')))
    assert(!/\.(?:map|filter|reduce|forEach|every|some|flat|flatMap)\(/.test(fs.readFileSync(path.join(repo, file), 'utf8')));
  console.log('ROUND87_EVIDENCE_OK');
}
