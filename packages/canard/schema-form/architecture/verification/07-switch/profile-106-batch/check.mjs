// Existing .vite symlinks route optimizer bytes to the authorized external bundles directory.
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const directory = path.dirname(fileURLToPath(import.meta.url));
const pkg = path.resolve(directory, '../../../..');
const repo = path.resolve(pkg, '../../..');
const [label, kind, ...files] = process.argv.slice(2);
const bundles = '/private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/bundles';
for (const root of [pkg, repo]) {
  const cache = path.join(root, 'node_modules/.vite');
  assert(fs.lstatSync(cache).isSymbolicLink());
  assert(fs.realpathSync(cache).startsWith(bundles + '/'));
}
const vitest = ['--no-install', 'vitest', 'run', '--reporter=dot', '--configLoader', 'runner',
  '--cache', 'false', '--maxWorkers=1', '--no-file-parallelism'];
const commands = {
  development: ['npx', [...vitest, '--project', 'unit', '--project', 'render', '--project', 'react18']],
  unit: ['npx', [...vitest, '--project', 'unit', ...files]],
  'unit-production': ['npx', [...vitest, '--project', 'unit', ...files]],
  production: ['npx', [...vitest, '--project', 'production', ...files]],
  typecheck: ['npx', ['--no-install', 'tsc', '--noEmit', '--composite', 'false', '--rootDir', '.', '-p', 'tsconfig.json']],
  lint: ['npx', ['--no-install', 'eslint', 'src/**/*.{ts,tsx}']],
  legacy: ['node', ['architecture/verification/07-switch/tools/check-legacy-isolation.mjs']],
};
assert(commands[kind]);
const [command, args] = commands[kind];
const started = Date.now();
console.log(JSON.stringify({ label, kind, started, command, args }));
const result = spawnSync(command, args, { cwd: pkg, encoding: 'utf8', maxBuffer: 5_000_000,
  env: { ...process.env, npm_config_offline: 'true', npm_config_yes: 'false',
    NODE_ENV: kind.includes('production') ? 'production' : 'test' } });
assert.equal(result.signal, null);
const log = result.stdout + result.stderr;
assert(Buffer.byteLength(log) <= 5_000_000);
fs.writeFileSync(path.join(directory, `check-${label}.txt`), log);
const record = { label, kind, command: command + ' ' + args.join(' '), exitCode: result.status,
  signal: result.signal, started, ended: Date.now(), elapsedMs: Date.now() - started,
  summary: log.split('\n').filter(line => /Test Files|Tests |Duration | FAIL |AssertionError|Error:|LEGACY_ISOLATED|warning|error|106COUNT/.test(line)) };
assert(record.elapsedMs < 480000);
fs.writeFileSync(path.join(directory, `check-${label}.json`), JSON.stringify(record, null, 2) + '\n');
console.log(JSON.stringify(record));
process.exitCode = result.status;
