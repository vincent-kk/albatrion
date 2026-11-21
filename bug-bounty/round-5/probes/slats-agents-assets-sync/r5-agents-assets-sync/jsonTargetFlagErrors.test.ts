// r5-agents-assets-sync: README "JSON Output" promises a JSON document for
// every flag error; only an unresolvable --package leaves stdout empty.
// Round 4 item 8 fixed the shape errors of --asset-path; these are the
// per-target --asset-path errors of a single named package.
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';

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
  let document: { exitCode?: number } | null = null;
  try {
    document = JSON.parse(stdout);
  } catch {
    document = null;
  }
  return { code, parses: document !== null, exitCode: document?.exitCode ?? null };
}

function setup() {
  const root = makeRoot('r5-json-target-flags');
  roots.push(root);
  const packageRoot = installPackage(root, {
    name: '@probe/kit',
    assets: { 'rules/r.md': '# rule\n' },
    manifest: true,
  });
  mkdirSync(join(root, 'outside-agents'), { recursive: true });
  return { root, packageRoot };
}

it.each([
  ['an --asset-path that names no directory in the package', '--asset-path=agentz'],
  ['an --asset-path that resolves outside the package', '--asset-path=../../../outside-agents'],
])(
  '%s (a flag error) yields a JSON document with exitCode 2',
  async (_label, flag) => {
    const { root } = setup();
    const result = await jsonRun([
      '--package=@probe/kit',
      '--agent=claude',
      '--scope=project',
      `--root=${root}`,
      flag,
    ]);
    expect(result).toEqual({ code: 2, parses: true, exitCode: 2 });
  },
);

it.each([
  ['missing agents.assetPath', 'undeclared'],
  ['no source hashes (unbuilt, declared directory absent)', 'unbuilt'],
] as const)(
  'diagnostic: a single named package with %s is a configuration error upstream of the renderer',
  async (_label, kind) => {
    const root = makeRoot('r5-json-target-config');
    roots.push(root);
    const packageRoot = installPackage(root, {
      name: '@probe/kit',
      assets: {},
    });
    const { writeFileSync } = await import('node:fs');
    writeFileSync(
      join(packageRoot, 'package.json'),
      JSON.stringify({
        name: '@probe/kit',
        version: '1.0.0',
        ...(kind === 'unbuilt' ? { agents: { assetPath: 'docs/none' } } : {}),
      }),
    );
    const result = await jsonRun([
      '--package=@probe/kit',
      '--agent=claude',
      '--scope=project',
      `--root=${root}`,
    ]);
    expect(result).toEqual({ code: 2, parses: true, exitCode: 2 });
  },
);

it('control: an unresolvable --package leaves stdout empty, as README states', async () => {
  const { root } = setup();
  const result = await jsonRun([
    '--package=@probe/absent',
    '--agent=claude',
    '--scope=project',
    `--root=${root}`,
  ]);
  expect(result).toEqual({ code: 2, parses: false, exitCode: null });
});
