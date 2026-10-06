// Invoked once per user-designated check; commands run from the package root.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';

const directory = path.dirname(fileURLToPath(import.meta.url));
const pkg = path.resolve(directory, '../../../..');
const commands = {
  vitest: ['npx', 'vitest', 'run', '--project', 'unit', '--project', 'render', '--project', 'react18', '--reporter=dot'],
  tsc: ['npx', 'tsc', '--noEmit', '--composite', 'false', '--rootDir', '.', '-p', 'tsconfig.json'],
  eslint: ['npx', 'eslint', 'src/**/*.{ts,tsx}'],
  legacy: ['node', 'architecture/verification/07-switch/tools/check-legacy-isolation.mjs'],
};
const name = process.argv[2], command = commands[name];
assert(command);
assert.equal(pkg, '/Users/Vincent/Workspace/albatrion/.claude/worktrees/stage-07/packages/canard/schema-form');
const started = Date.now();
const child = spawn(command[0], command.slice(1), { cwd: pkg,
  env: { ...process.env, npm_config_offline: 'true', npm_config_yes: 'false', GIT_OPTIONAL_LOCKS: '0' },
  stdio: ['ignore', 'pipe', 'pipe'] });
const output = [];
child.stdout.on('data', chunk => output.push(chunk));
child.stderr.on('data', chunk => output.push(chunk));
const progress = setInterval(() => console.log(`${name}: ${Math.round((Date.now() - started) / 1000)}초 경과`), 15000);
child.once('error', error => { clearInterval(progress); throw error; });
child.once('close', (status, signal) => {
  clearInterval(progress);
  const ended = Date.now(), bytes = Buffer.concat(output);
  assert(bytes.length <= 5_000_000);
  fs.writeFileSync(path.join(directory, `revision102-order-verify-${name}.log`), bytes);
  const record = { name, command, cwd: pkg, started, ended, elapsedMs: ended - started,
    status, signal, naturalExit: signal === null, bytes: bytes.length };
  fs.writeFileSync(path.join(directory, `revision102-order-verify-${name}.json`), JSON.stringify(record, null, 2) + '\n');
  assert(ended - started < 480_000);
  console.log(JSON.stringify(record));
  console.log(bytes.toString('utf8').split('\n').filter(line =>
    /Test Files|Tests |Duration|FAIL |AssertionError|LEGACY_ISOLATED|error TS|warning|error:/.test(line)).join('\n'));
  process.exitCode = status ?? 1;
});
