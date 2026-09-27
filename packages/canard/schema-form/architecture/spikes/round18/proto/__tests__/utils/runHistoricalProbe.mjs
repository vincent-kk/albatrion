import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

/**
 * Run an immutable historical harness against the v7 model and assertion adapter.
 * @param {string} file Harness path relative to the spikes directory.
 * @param {string[]} args Historical mode arguments forwarded without modification.
 * @returns {string} Successful process stdout for semantic result assertions.
 * @throws {AssertionError} On process failure or a write to the historical source.
 */
export function runHistoricalProbe(file, args = []) {
  const cwd = fileURLToPath(new URL('../../../../', import.meta.url));
  const loader = fileURLToPath(new URL('../registerRegression.mjs', import.meta.url));
  const source = readFileSync(cwd + file);
  const result = spawnSync(process.execPath, [file, ...args], {
    cwd,
    encoding: 'utf8',
    env: { ...process.env, NODE_OPTIONS: `${process.env.NODE_OPTIONS ?? ''} --import=${loader}` },
    maxBuffer: 8 * 1024 * 1024,
  });
  assert.equal(result.status, 0, `${file}: ${result.stderr}\n${result.stdout}`);
  assert.deepEqual(readFileSync(cwd + file), source, 'historical source remains unchanged');
  return result.stdout;
}
