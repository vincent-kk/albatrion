// Sequential package checks; the existing .vite symlink redirects optimizer bytes outside the tree.
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const directory = path.dirname(fileURLToPath(import.meta.url));
const pkg = path.resolve(directory, '../../../..');
const name = process.argv[2];
const vitest = ['--no-install', 'vitest', 'run', '--reporter=dot', '--configLoader', 'runner',
  '--cache', 'false', '--maxWorkers=1', '--no-file-parallelism'];
const commands = {
  development: ['npx', [...vitest, '--project', 'unit', '--project', 'render', '--project', 'react18']],
  typecheck: ['npx', ['--no-install', 'tsc', '--noEmit', '--composite', 'false', '--rootDir', '.', '-p', 'tsconfig.json']],
  lint: ['npx', ['--no-install', 'eslint', 'src/**/*.{ts,tsx}']],
  legacy: ['node', ['architecture/verification/07-switch/tools/check-legacy-isolation.mjs']],
};
assert(commands[name]);
const [command, args] = commands[name];
const started = Date.now();
console.log(JSON.stringify({ name, started, command, args }));
const result = spawnSync(command, args, { cwd: pkg, encoding: 'utf8', maxBuffer: 5_000_000,
  env: { ...process.env, npm_config_offline: 'true', npm_config_yes: 'false',
    NODE_ENV: 'test', REQUIRE_DECLARATION_SINK: '1' } });
assert.equal(result.signal, null);
const log = result.stdout + result.stderr;
assert(Buffer.byteLength(log) <= 5_000_000);
fs.writeFileSync(path.join(directory, `declaration106-${name}.txt`), log);
const record = { name, command: command + ' ' + args.join(' '), exitCode: result.status,
  signal: result.signal, started, ended: Date.now(), elapsedMs: Date.now() - started,
  summary: log.split('\n').filter(line => /Test Files|Tests |Duration | FAIL |AssertionError|Error:|LEGACY_ISOLATED|warning|error/.test(line)) };
assert(record.elapsedMs < 480000);
fs.writeFileSync(path.join(directory, `declaration106-check-${name}.json`), JSON.stringify(record, null, 2) + '\n');
console.log(JSON.stringify(record));
process.exitCode = result.status;
