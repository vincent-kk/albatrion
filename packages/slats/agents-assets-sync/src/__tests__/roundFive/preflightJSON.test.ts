import { afterEach, expect, it, vi } from 'vitest';

import { makeRoot, removeRoot, runCliCode } from '../roundThree/fixture.js';

/** Preflight success and failure still own exactly one machine-readable document. */
const roots: string[] = [];
afterEach(() => { for (const root of roots.splice(0)) removeRoot(root); vi.restoreAllMocks(); });

it.each([
  { args: ['--help'], code: 0 },
  { args: ['--version'], code: 0 },
  { args: ['--package=@missing/package', '--agent=claude', '--scope=project'], code: 2 },
  { args: ['--agent=claude', '--scope=project'], code: 2 },
  { args: ['--unknown'], code: 2 },
])('preflight $args emits one JSON document with exit $code', async ({ args, code }) => {
  const root = makeRoot('preflight-json');
  roots.push(root);
  let stdout = '';
  vi.spyOn(process.stdout, 'write').mockImplementation((chunk) => { stdout += String(chunk); return true; });
  expect(await runCliCode([...args, '--json', `--root=${root}`])).toBe(code);
  expect(JSON.parse(stdout)).toMatchObject({ exitCode: code, units: [] });
});
