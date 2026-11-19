import { realpathSync } from 'node:fs';
import { join } from 'node:path';

import { afterEach, expect, it, vi } from 'vitest';

import { makeRoot, removeRoot, runCliCode } from '../roundThree/fixture.js';
import { installPackage, writeAt } from '../roundThree/fixture.js';

/** Preflight success and failure still own exactly one machine-readable document. */
const roots: string[] = [];
afterEach(() => {
  for (const root of roots.splice(0)) removeRoot(root);
  vi.restoreAllMocks();
});

it.each([
  { args: ['--help'], code: 0 },
  { args: ['--version'], code: 0 },
  {
    args: ['--package=@missing/package', '--agent=claude', '--scope=project'],
    code: 2,
  },
  { args: ['--agent=claude', '--scope=project'], code: 2 },
  { args: ['--unknown'], code: 2 },
])(
  'preflight $args emits one JSON document with exit $code',
  async ({ args, code }) => {
    const root = makeRoot('preflight-json');
    roots.push(root);
    let stdout = '';
    vi.spyOn(process.stdout, 'write').mockImplementation((chunk) => {
      stdout += String(chunk);
      return true;
    });
    expect(await runCliCode([...args, '--json', `--root=${root}`])).toBe(code);
    expect(JSON.parse(stdout)).toMatchObject({ exitCode: code, units: [] });
  },
);

it('retains each corrupt scope member and its reason in the final JSON failure records', async () => {
  const root = makeRoot('corrupt-scope-json');
  roots.push(root);
  const paths = ['a', 'b'].map((name) =>
    join(root, 'node_modules/@broken', name, 'package.json'),
  );
  for (const path of paths) writeAt(path, '{invalid');
  let stdout = '';
  vi.spyOn(process.stdout, 'write').mockImplementation((chunk) => {
    stdout += String(chunk);
    return true;
  });
  expect(
    await runCliCode([
      '--package=@broken',
      '--agent=claude',
      '--scope=project',
      '--json',
      `--root=${root}`,
    ]),
  ).toBe(2);
  const report: {
    failures: { path: string; stage: string; reason: string }[];
  } = JSON.parse(stdout);
  for (const path of paths)
    expect(report.failures).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path,
          stage: 'discover',
          reason: expect.stringContaining('Skipping'),
        }),
      ]),
    );
});

it('names the declared asset root and gate stage when no hash source is available', async () => {
  const root = makeRoot('gate-json');
  roots.push(root);
  const packageRoot = installPackage(root, { name: '@probe/gate', assets: {} });
  let stdout = '';
  vi.spyOn(process.stdout, 'write').mockImplementation((chunk) => {
    stdout += String(chunk);
    return true;
  });
  expect(
    await runCliCode([
      '--package=@probe/gate',
      '--agent=claude',
      '--scope=project',
      '--json',
      `--root=${root}`,
    ]),
  ).toBe(2);
  const report: { failures: { path: string; stage: string }[] } =
    JSON.parse(stdout);
  expect(report.failures).toEqual([
    expect.objectContaining({
      path: join(realpathSync(packageRoot), 'docs/agents'),
      stage: 'gate',
    }),
  ]);
});
