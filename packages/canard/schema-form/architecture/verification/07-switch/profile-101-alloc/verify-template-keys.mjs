// CLI-only verification runner; each repository command finishes naturally in isolation.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync, execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const script = fileURLToPath(import.meta.url);
const artifacts = path.dirname(script);
const pkg = path.resolve(artifacts, '../../../..');
const repo = path.resolve(pkg, '../../..');
const commands = {
  vitest: ['npx', 'vitest', 'run', '--project', 'unit', '--project', 'render', '--project', 'react18', '--reporter=dot'],
  tsc: ['npx', 'tsc', '--noEmit', '--composite', 'false', '--rootDir', '.', '-p', 'tsconfig.json'],
  eslint: ['npx', 'eslint', 'src/**/*.{ts,tsx}'],
  isolation: ['node', 'architecture/verification/07-switch/tools/check-legacy-isolation.mjs'],
};
const name = process.argv[2];
const command = commands[name];
assert(command, name);
const head = execFileSync('git', ['--no-optional-locks', 'rev-parse', 'HEAD'],
  { cwd: repo, encoding: 'utf8' }).trim();
assert.equal(head, '5f50768e561fbb5b3655e4bf6cef9d4b9c227de6');
const begin = Date.now();
const result = spawnSync(command[0], command.slice(1), { cwd: pkg,
  env: { ...process.env, npm_config_offline: 'true', npm_config_yes: 'false', GIT_OPTIONAL_LOCKS: '0' },
  encoding: 'utf8', maxBuffer: 64_000_000 });
const elapsedMs = Date.now() - begin;
assert.equal(result.signal, null);
assert(!result.error, String(result.error));
assert(elapsedMs < 480_000);
const record = { head, cwd: pkg, command, elapsedMs, status: result.status,
  signal: result.signal, naturalExit: true, stdout: result.stdout, stderr: result.stderr,
  driverSha256: createHash('sha256').update(fs.readFileSync(script)).digest('hex') };
const text = JSON.stringify(record, null, 2) + '\n';
assert(Buffer.byteLength(text) <= 5_000_000);
fs.writeFileSync(path.join(artifacts, 'template-keys-verification-' + name + '.json'), text);
const lines = (result.stdout + result.stderr).split('\n');
console.log(JSON.stringify({ name, status: result.status, signal: result.signal, elapsedMs,
  summary: lines.filter(line => /^\s*(Test Files|Tests\s|Duration|FAIL)|EVENT-070|LEGACY_ISOLATED/.test(line)).slice(-40) }));
