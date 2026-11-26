import { existsSync } from 'node:fs';
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

it('a rule with a fence inside a list item is refused for a Claude file copy and nothing is written', async () => {
  const root = makeRoot('claude-fence');
  roots.push(root);
  installPackage(root, {
    name: '@probe/kit',
    assets: { 'rules/r.md': '# rule\n\n- item\n  ```ts\n  const x = 1;\n  ```\n' },
  });
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
  expect(stdout).toContain('Fences inside blockquotes or list items are not supported');
  expect(existsSync(join(root, '.claude/rules/r.md'))).toBe(false);
});
