import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { afterEach, expect, it, vi } from 'vitest';

import {
  installPackage,
  makeRoot,
  removeRoot,
  runCliCode,
  writeAt,
} from './roundThree/fixture.js';

const roots: string[] = [];
afterEach(() => {
  roots.splice(0).forEach(removeRoot);
  vi.restoreAllMocks();
});

it('limit: an AGENTS.md with an inline code span in a blockquote is refused with its line and left unchanged (self-hunt item 1)', async () => {
  const root = makeRoot('scanner-limit');
  roots.push(root);
  installPackage(root, {
    name: '@probe/kit',
    assets: { 'rules/r.md': '# rule\n' },
    manifest: true,
  });
  const agentsMd = join(root, 'AGENTS.md');
  const document = '# Notes\n\n> ```inline```\n';
  writeAt(agentsMd, document);
  let stdout = '';
  vi.spyOn(process.stdout, 'write').mockImplementation((chunk) => {
    stdout += String(chunk);
    return true;
  });
  vi.spyOn(process.stderr, 'write').mockImplementation(() => true);

  const code = await runCliCode([
    '--package=@probe/kit',
    '--agent=codex',
    '--scope=project',
    `--root=${root}`,
    '--no-interactive',
    '--json',
  ]);

  expect(code).toBe(1);
  expect(stdout).toContain(
    'AGENTS.md:3: Fences inside blockquotes or list items are not supported',
  );
  expect(readFileSync(agentsMd, 'utf8')).toBe(document);
});
