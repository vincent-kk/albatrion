import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { afterEach, expect, it } from 'vitest';

import {
  consumerOf,
  installPackage,
  makeRoot,
  removeRoot,
  writeAt,
} from '../../../__tests__/roundThree/fixture.js';
import { runInjection } from '../utils/session/runInjection.js';

const roots: string[] = [];
afterEach(() => {
  for (const root of roots.splice(0)) removeRoot(root);
});
it('deletes a disjoint orphan when only a known-prefix participant fails', async () => {
  const root = makeRoot('disjoint-prefix');
  roots.push(root);
  const alpha = installPackage(root, {
    name: '@probe/a',
    assets: { 'skills/alpha/keep.md': 'keep\n' },
    manifest: true,
  });
  const gamma = installPackage(root, {
    name: '@probe/c',
    assets: {
      'skills/gamma/keep.md': 'gamma\n',
      'rules/bad.md': '~~~\nopen',
    },
    manifest: true,
  });
  const orphan = join(root, '.claude/skills/alpha/old.md');
  writeAt(orphan, 'old\n');
  writeAt(join(root, '.claude/skills/gamma/keep.md'), 'gamma\n');
  const result = await runInjection({
    targets: [
      consumerOf(alpha, '@probe/a', 'manifest'),
      consumerOf(gamma, '@probe/c', 'manifest'),
    ],
    flags: { agent: ['claude'], scope: 'project', force: true, yes: true },
    originCwd: root,
  });
  expect(result.exitCode).toBe(1);
  expect(existsSync(join(root, '.claude/skills/gamma/keep.md'))).toBe(true);
  expect(readFileSync(join(root, '.claude/skills/gamma/keep.md'), 'utf8')).toBe(
    'gamma\n',
  );
  expect(existsSync(orphan), JSON.stringify(result.notices)).toBe(false);
});
