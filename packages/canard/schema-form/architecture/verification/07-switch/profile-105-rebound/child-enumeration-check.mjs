// Sequential package checks; logs stay in the external bundle scratchpad.
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const directory = path.dirname(fileURLToPath(import.meta.url));
const pkg = path.resolve(directory, '../../../..');
const scratch = '/private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/bundles';
const name = process.argv[2];
const vitest = ['--no-install', 'vitest', 'run', '--reporter=dot', '--configLoader', 'runner',
  '--cache', 'false', '--maxWorkers=1', '--no-file-parallelism'];
const commands = {
  development: ['npx', [...vitest, '--project', 'unit', '--project', 'render', '--project', 'react18']],
  production: ['npx', [...vitest, '--project', 'production']],
  targeted: ['npx', [...vitest, '--project', 'unit',
    'src/core/blueprint/__tests__/blueprint.owned-inline-differential.test.ts',
    'src/core/blueprint/utils/analyze/__tests__/populateNodeChildren.counts.test.ts']],
  'targeted-production': ['npx', [...vitest, '--project', 'unit',
    'src/core/blueprint/__tests__/blueprint.owned-inline-differential.test.ts',
    'src/core/blueprint/utils/analyze/__tests__/populateNodeChildren.counts.test.ts']],
  typecheck: ['npx', ['--no-install', 'tsc', '--noEmit', '--composite', 'false', '--rootDir', '.', '-p', 'tsconfig.json']],
  lint: ['npx', ['--no-install', 'eslint', 'src/**/*.{ts,tsx}']],
  legacy: ['node', ['architecture/verification/07-switch/tools/check-legacy-isolation.mjs']],
};
assert(commands[name]);
const [command, args] = commands[name];
const started = Date.now();
const result = spawnSync(command, args, { cwd: pkg, encoding: 'utf8', maxBuffer: 5_000_000,
  env: { ...process.env, npm_config_offline: 'true',
    NODE_ENV: name.includes('production') ? 'production' : 'test' } });
assert.equal(result.signal, null);
const log = result.stdout + result.stderr;
assert(Buffer.byteLength(log) <= 5_000_000);
fs.writeFileSync(path.join(scratch, `child105-check-${name}.txt`), log);
const record = { name, command: command + ' ' + args.join(' '), exitCode: result.status,
  signal: result.signal, started, ended: Date.now(), elapsedMs: Date.now() - started,
  summary: log.split('\n').filter(line => /CHILD105|Test Files|Tests |Duration | FAIL |AssertionError|Error:|LEGACY_ISOLATED/.test(line)) };
assert(record.elapsedMs < 480000);
fs.writeFileSync(path.join(scratch, `child105-check-${name}.json`), JSON.stringify(record, null, 2) + '\n');
console.log(JSON.stringify(record));
process.exitCode = result.status;
