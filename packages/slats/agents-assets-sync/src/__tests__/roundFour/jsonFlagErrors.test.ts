import { afterEach, expect, it, vi } from 'vitest';

import {
  installPackage,
  makeRoot,
  removeRoot,
  runCliCode,
} from '../../__tests__/roundThree/fixture.js';

const roots: string[] = [];
afterEach(() => {
  for (const root of roots.splice(0)) removeRoot(root);
  vi.restoreAllMocks();
});

async function jsonRun(args: readonly string[]) {
  let stdout = '';
  vi.spyOn(process.stdout, 'write').mockImplementation((chunk) => {
    stdout += String(chunk);
    return true;
  });
  const code = await runCliCode([...args, '--json']);
  vi.restoreAllMocks();
  let document: { exitCode?: number; errors?: string[] } | null = null;
  try {
    document = JSON.parse(stdout);
  } catch {
    document = null;
  }
  return {
    code,
    parses: document !== null,
    exitCode: document?.exitCode ?? null,
  };
}

it.each([
  ['an absolute --asset-path', ['--asset-path=/abs/agents']],
  ['an --asset-path starting with ~', ['--asset-path=~/agents']],
  ['an empty --asset-path', ['--asset-path=']],
])(
  '%s (a flag error) still yields a JSON document with exitCode 2',
  async (_label, extra) => {
    const root = makeRoot('r4-json-flags');
    roots.push(root);
    installPackage(root, {
      name: '@probe/kit',
      assets: { 'rules/r.md': '# rule\n' },
      manifest: true,
    });
    const result = await jsonRun([
      '--package=@probe/kit',
      '--agent=claude',
      '--scope=project',
      `--root=${root}`,
      ...extra,
    ]);
    expect(result).toEqual({ code: 2, parses: true, exitCode: 2 });
  },
);

it('a missing --package (a flag error) still yields a JSON document with exitCode 2', async () => {
  const root = makeRoot('r4-json-flags');
  roots.push(root);
  const result = await jsonRun([
    '--agent=claude',
    '--scope=project',
    `--root=${root}`,
  ]);
  expect(result).toEqual({ code: 2, parses: true, exitCode: 2 });
});

it('an invalid --package shape (a flag error) still yields a JSON document with exitCode 2', async () => {
  const root = makeRoot('r4-json-flags');
  roots.push(root);
  const result = await jsonRun([
    '--package=@a/b/c',
    '--agent=claude',
    '--scope=project',
    `--root=${root}`,
  ]);
  expect(result).toEqual({ code: 2, parses: true, exitCode: 2 });
});
