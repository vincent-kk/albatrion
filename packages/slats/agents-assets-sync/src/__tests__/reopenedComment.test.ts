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

it('a forced run refuses an AGENTS.md whose comment reopens around a managed END and keeps its bytes', async () => {
  const root = makeRoot('reopened-comment');
  roots.push(root);
  installPackage(root, {
    name: '@probe/kit',
    assets: { 'rules/r.md': '# rule\n' },
    manifest: true,
  });
  const start = '<!-- AGENTS-ASSETS-SYNC:START:@probe/kit:rules/r.md -->';
  const end = '<!-- AGENTS-ASSETS-SYNC:END:@probe/kit:rules/r.md -->';
  const document = [
    '# user',
    start,
    '<!-- c --> <!-- x',
    end,
    'user prose',
    end,
    '',
  ].join('\n');
  const agentsMd = join(root, 'AGENTS.md');
  writeAt(agentsMd, document);
  vi.spyOn(process.stdout, 'write').mockImplementation(() => true);
  vi.spyOn(process.stderr, 'write').mockImplementation(() => true);

  const code = await runCliCode([
    '--package=@probe/kit',
    '--agent=codex',
    '--scope=project',
    `--root=${root}`,
    '--force',
    '--yes',
    '--no-interactive',
  ]);

  expect(code).toBe(1);
  expect(readFileSync(agentsMd, 'utf8')).toBe(document);
});
