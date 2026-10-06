// Sequential package verification; capture full bounded logs and never install dependencies.
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const directory = path.dirname(fileURLToPath(import.meta.url));
const pkg = path.resolve(directory, '../../../..');
const name = process.argv[2];
const commands = {
  development: ['npx', ['--no-install', 'vitest', 'run', '--project', 'unit', '--project', 'render', '--project', 'react18', '--reporter=dot', '--configLoader', 'runner', '--cache', 'false', '--maxWorkers=1', '--no-file-parallelism']],
  owned: ['npx', ['--no-install', 'vitest', 'run', '--project', 'unit', '--project', 'render', '--project', 'react18', '--reporter=dot', '--configLoader', 'runner', '--cache', 'false', '--maxWorkers=1', '--no-file-parallelism', 'src/core/blueprint/__tests__/blueprint.owned-inline']],
  production: ['yarn', ['test:production', '--maxWorkers=1', '--no-file-parallelism']],
  typecheck: ['npx', ['--no-install', 'tsc', '--noEmit', '--composite', 'false', '--rootDir', '.', '-p', 'tsconfig.json']],
  lint: ['npx', ['--no-install', 'eslint', 'src/**/*.{ts,tsx}']],
  legacy: ['node', ['architecture/verification/07-switch/tools/check-legacy-isolation.mjs']],
};
assert(commands[name]);
const [command, args] = commands[name];
const started = Date.now();
const result = spawnSync(command, args, { cwd: pkg, encoding: 'utf8', maxBuffer: 5_000_000 });
assert.equal(result.signal, null);
const log = result.stdout + result.stderr;
assert(Buffer.byteLength(log) < 5_000_000);
fs.writeFileSync(path.join(directory, `check-${name}.txt`), log);
const record = { name, command: command + ' ' + args.join(' '), exitCode: result.status, signal: result.signal,
  elapsedMs: Date.now() - started,
  summary: log.split('\n').filter(line => /Test Files|Tests |Duration | FAIL |AssertionError|Error:|isolation|passed|failed/.test(line)) };
assert(record.elapsedMs < 480000);
fs.writeFileSync(path.join(directory, `check-${name}.json`), JSON.stringify(record, null, 2) + '\n');
console.log(JSON.stringify(record, null, 2));
process.exitCode = result.status;
