import { readFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';

import { afterEach, expect, it } from 'vitest';

import { buildHashes } from '../../../scripts/buildHashes.mjs';
import { installPackage, makeRoot, removeRoot, runCliCode } from '../roundThree/fixture.js';

const roots: string[] = [];
afterEach(() => { for (const root of roots.splice(0)) removeRoot(root); });

it.each([
  Buffer.from('hello'),
  Buffer.from('\uFEFF\uFEFFbody'),
  Buffer.from('edge\r\r\nend'),
  Buffer.from(''),
  Buffer.from('\uFEFF~~~\r\nhello\r\n~~~\r\n'),
  Buffer.from([0xef, 0xbb, 0xbf, 0x7e, 0x7e, 0x7e, 0x0d, 0x0a, 0xb0, 0xa1, 0x0d, 0x0a, 0x7e, 0x7e, 0x7e]),
])('an installed rule settles with and without the source directory (%j)', async (body) => {
  const root = makeRoot('manifest-body');
  roots.push(root);
  const packageRoot = installPackage(root, { name: '@probe/body', assets: { 'rules/a.md': body } });
  await buildHashes({ packageRoot, packageName: '@probe/body', packageVersion: '1', assetPath: 'docs/agents' });
  const args = ['--package=@probe/body', '--agent=codex', '--scope=project', '--no-interactive', `--root=${root}`];
  expect(await runCliCode(args)).toBe(0);
  const installed = readFileSync(join(root, 'AGENTS.md'));
  expect(await runCliCode(args)).toBe(0);
  rmSync(join(packageRoot, 'docs'), { recursive: true });
  expect(await runCliCode(args)).toBe(0);
  expect(readFileSync(join(root, 'AGENTS.md'))).toEqual(installed);
});
