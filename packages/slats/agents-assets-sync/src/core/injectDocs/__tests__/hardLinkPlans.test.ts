import { linkSync, mkdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

import { afterEach, expect, it, vi } from 'vitest';

import { runSurface } from '../../../__tests__/roundFour/helpers/runSurface.js';
import {
  consumerOf,
  installPackage,
  makeRoot,
  removeRoot,
  runCliCode,
  writeAt,
} from '../../../__tests__/roundThree/fixture.js';

const roots: string[] = [];
afterEach(() => {
  vi.restoreAllMocks();
  for (const root of roots.splice(0)) removeRoot(root);
});

it.each(['plain', 'json', 'ink'] as const)(
  '%s: a force run refuses incompatible sources that address one hard-linked inode',
  async (mode) => {
    vi.spyOn(process.stdout, 'write').mockImplementation(() => true);
    const root = makeRoot('r6-hard-link-plan');
    roots.push(root);
    const packageRoot = installPackage(root, {
      name: '@probe/kit',
      assets: { 'skills/a/SKILL.md': '# a\n', 'skills/b/SKILL.md': '# b\n' },
      manifest: true,
    });
    const first = join(root, '.claude/skills/a/SKILL.md');
    const second = join(root, '.claude/skills/b/SKILL.md');
    writeAt(first, '# a\n');
    mkdirSync(join(root, '.claude/skills/b'), { recursive: true });
    linkSync(first, second);
    const code =
      mode === 'ink'
        ? (
            await runSurface(
              'ink',
              root,
              [consumerOf(packageRoot, '@probe/kit', 'manifest')],
              { agent: ['claude'], scope: 'project', force: true, yes: true },
            )
          ).code
        : await runCliCode([
            '--package=@probe/kit',
            '--agent=claude',
            '--scope=project',
            '--force',
            '--yes',
            '--no-interactive',
            `--root=${root}`,
            ...(mode === 'json' ? ['--json'] : []),
          ]);
    expect({
      code,
      a: readFileSync(first, 'utf8'),
      b: readFileSync(second, 'utf8'),
      linked: statSync(first).ino === statSync(second).ino,
    }).toEqual({ code: 1, a: '# a\n', b: '# a\n', linked: true });
  },
);

it('control: independent user-created destination files accept different sources', async () => {
  const root = makeRoot('r6-independent-files');
  roots.push(root);
  installPackage(root, {
    name: '@probe/kit',
    assets: {
      'skills/a/SKILL.md': '# a\n',
      'skills/b/SKILL.md': '# b\n',
    },
    manifest: true,
  });
  const first = join(root, '.claude/skills/a/SKILL.md');
  const second = join(root, '.claude/skills/b/SKILL.md');
  writeAt(first, '# a\n');
  writeAt(second, '# a\n');
  const code = await runCliCode([
    '--package=@probe/kit',
    '--agent=claude',
    '--scope=project',
    '--force',
    '--yes',
    '--no-interactive',
    `--root=${root}`,
  ]);
  expect({
    code,
    a: readFileSync(first, 'utf8'),
    b: readFileSync(second, 'utf8'),
  }).toEqual({ code: 0, a: '# a\n', b: '# b\n' });
});
