// Sequential package verification; stdout artifacts are persisted by the host native writer.
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const directory = path.dirname(fileURLToPath(import.meta.url));
const pkg = path.resolve(directory, '../../../..');
const [name, mode, ...files] = process.argv.slice(2);
if (name === 'audit') {
  for (const name of ['development', 'production', 'typecheck', 'lint', 'legacy']) {
    const record = JSON.parse(fs.readFileSync(path.join(directory, `check-${name}.json`), 'utf8'));
    assert.equal(record.signal, null); assert(record.elapsedMs < 480000);
    if (name === 'development' && record.exitCode !== 0) {
      const failures = record.summary.filter(line => / FAIL /.test(line));
      assert.equal(failures.length, 4);
      assert.equal(failures.filter(line => /\|render\|/.test(line)).length, 2);
      assert.equal(failures.filter(line => /\|react18\|/.test(line)).length, 2);
      assert(failures.every(line => /EVENT-070/.test(line)), failures.join('\n'));
    } else assert.equal(record.exitCode, 0, name);
  }
  console.log('EVENT110_CHECKS_OK');
} else {
  const vitest = ['--no-install', 'vitest', 'run', '--reporter=dot', '--configLoader', 'runner',
    '--cache', 'false', '--maxWorkers=1', '--no-file-parallelism'];
  const commands = {
    development: ['npx', [...vitest, '--project', 'unit', '--project', 'render', '--project', 'react18']],
    production: ['npx', [...vitest, '--project', 'production']],
    typecheck: ['npx', ['--no-install', 'tsc', '--noEmit', '--composite', 'false', '--rootDir', '.', '-p', 'tsconfig.json']],
    lint: ['npx', ['--no-install', 'eslint', 'src/**/*.{ts,tsx}']],
    legacy: ['node', ['architecture/verification/07-switch/tools/check-legacy-isolation.mjs']],
  };
  const [command, args] = files.length ? ['npx', [...vitest, '--project', 'unit', ...files]] : commands[name];
  const started = Date.now();
  console.log(JSON.stringify({ name, mode, command, args, started }));
  const child = spawn(command, args, { cwd: pkg, stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env, NODE_ENV: mode === 'production' || name === 'production' ? 'production' : 'test',
      npm_config_offline: 'true', npm_config_yes: 'false', GIT_OPTIONAL_LOCKS: '0' } });
  let log = '';
  const capture = bytes => { log += bytes; assert(Buffer.byteLength(log) <= 5_000_000); };
  child.stdout.on('data', capture); child.stderr.on('data', capture);
  const progress = setInterval(() => console.log(`${name}: ${Math.round((Date.now() - started) / 1000)}초 경과, 검증 진행 중`), 15000);
  const [exitCode, signal] = await new Promise(resolve => child.once('close', (code, signal) => resolve([code, signal])));
  clearInterval(progress);
  assert.equal(signal, null); assert(Date.now() - started < 480000);
  console.log('NATIVE_ARTIFACT ' + JSON.stringify({ file: path.join(directory, `check-${name}.txt`), text: log }));
  const record = { name, mode, command: command + ' ' + args.join(' '), exitCode, signal, natural: true,
    started, ended: Date.now(), elapsedMs: Date.now() - started,
    summary: log.split('\n').filter(line => /Test Files|Tests |Duration | FAIL |AssertionError|Error:|LEGACY_ISOLATED|warning|error TS|error  /.test(line)) };
  console.log('NATIVE_ARTIFACT ' + JSON.stringify({ file: path.join(directory, `check-${name}.json`), text: JSON.stringify(record, null, 2) + '\n' }));
  console.log(JSON.stringify(record));
  process.exitCode = exitCode;
}
