import { existsSync, mkdirSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

import { afterEach, expect, it, vi } from 'vitest';

import {
  installPackage,
  makeRoot,
  removeRoot,
  runCliCode,
} from './roundThree/fixture.js';

const roots: string[] = [];
afterEach(() => {
  roots.splice(0).forEach(removeRoot);
  vi.restoreAllMocks();
});

it('a run that cannot take the record lock keeps its file changes, names the lock path and exits 1', async () => {
  const root = makeRoot('record-lock');
  roots.push(root);
  installPackage(root, {
    name: '@probe/kit',
    assets: { 'skills/s/SKILL.md': '# skill\n' },
  });
  const recordDir = join(root, '.claude');
  mkdirSync(recordDir, { recursive: true });
  const lock = join(recordDir, '.agents-assets-sync-agents-assets-sync.json.lock');
  mkdirSync(lock);

  // Advance the clock 6 s per read so the ten-second deadline passes at once.
  const realNow = performance.now.bind(performance);
  let reads = 0;
  vi.spyOn(performance, 'now').mockImplementation(() => realNow() + 6_000 * reads++);
  let stdout = '';
  vi.spyOn(process.stdout, 'write').mockImplementation((chunk) => {
    stdout += String(chunk);
    return true;
  });

  const code = await runCliCode([
    '--package=@probe/kit',
    '--agent=claude',
    '--scope=project',
    `--root=${root}`,
    '--no-interactive',
    '--json',
  ]);

  expect(code).toBe(1);
  expect(stdout).toContain(lock);
  expect(readFileSync(join(root, '.claude/skills/s/SKILL.md'), 'utf8')).toBe('# skill\n');
  expect(existsSync(lock)).toBe(true);
  expect(readdirSync(recordDir).filter((name) => name.endsWith('.json'))).toEqual([]);
});
