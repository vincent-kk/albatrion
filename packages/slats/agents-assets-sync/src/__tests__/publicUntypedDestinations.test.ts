import { mkdirSync, readFileSync, symlinkSync } from 'node:fs';
import type * as FsPromises from 'node:fs/promises';
import { join } from 'node:path';

import { afterEach, expect, it, vi } from 'vitest';

import {
  installPackage,
  makeRoot,
  removeRoot,
  runCliCode,
  writeAt,
} from './roundThree/fixture.js';

const { untypedNames } = vi.hoisted(() => ({
  untypedNames: new Set<string>(),
}));

vi.mock('node:fs/promises', async (importOriginal) => {
  const fs = await importOriginal<typeof FsPromises>();
  return {
    ...fs,
    readdir: async (dir: string, options: { withFileTypes: true }) =>
      (await fs.readdir(dir, options)).map((entry) =>
        dir.includes('/.claude/') && untypedNames.has(entry.name)
          ? {
              name: entry.name,
              parentPath: entry.parentPath,
              isFile: (): boolean => false,
              isDirectory: (): boolean => false,
              isSymbolicLink: (): boolean => false,
            }
          : entry,
      ),
  };
});

const roots: string[] = [];
afterEach(() => {
  roots.splice(0).forEach(removeRoot);
  untypedNames.clear();
});

it.each(['file', 'directory', 'regular'] as const)(
  'checks an untyped %s entry before installing',
  async (entry) => {
    const root = makeRoot('public-untyped');
    const outside = makeRoot('public-outside');
    roots.push(root, outside);
    const name = '@probe/kit';
    const existing = join(root, '.claude/skills/kit');
    mkdirSync(existing, { recursive: true });
    const reference = join(outside, 'notes.md');
    writeAt(reference, '# outside code\n');
    untypedNames.add('notes.md').add('refs');
    installPackage(root, {
      name,
      assets: {
        'skills/kit/SKILL.md': '# kit\n',
        'skills/kit/notes.md': '# installed\n',
        'skills/kit/refs/notes.md': '# reference\n',
        'skills/kit/refs/readme.md': '# readme\n',
      },
    });
    if (entry === 'file') symlinkSync(reference, join(existing, 'notes.md'));
    else if (entry === 'directory')
      symlinkSync(outside, join(existing, 'refs'), 'dir');
    else {
      writeAt(join(existing, 'notes.md'), '# old\n');
      writeAt(join(existing, 'refs/notes.md'), '# old\n');
    }

    expect(
      await runCliCode([
        `--package=${name}`,
        '--agent=claude',
        '--scope=project',
        `--root=${root}`,
        '--force',
        '--yes',
        '--no-interactive',
      ]),
    ).toBe(entry === 'regular' ? 0 : 1);
    expect(readFileSync(reference, 'utf8')).toBe('# outside code\n');
    if (entry === 'regular')
      expect(readFileSync(join(existing, 'refs/notes.md'), 'utf8')).toBe(
        '# reference\n',
      );
  },
);
