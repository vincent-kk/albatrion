import {
  mkdirSync,
  mkdtempSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs';
import type * as fsPromises from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { resolveAgentTarget } from '../agentTarget.js';
import type { AgentTarget } from '../type.js';
import { assertWriteTargetsContained } from '../utils/assertWriteTargetsContained.js';

const { untypedNames } = vi.hoisted(() => ({
  untypedNames: new Set<string>(),
}));

// Some network and FUSE mounts leave `d_type` unset, so `readdir` returns a
// dirent whose type predicates are all false. The stub reports the names in
// `untypedNames` that way; `lstat` and `realpath` still see the real entry.
vi.mock('node:fs/promises', async (importOriginal) => {
  const actual = await importOriginal<typeof fsPromises>();
  return {
    ...actual,
    readdir: async (dir: string, options: { withFileTypes: true }) =>
      (await actual.readdir(dir, options)).map((entry) =>
        untypedNames.has(entry.name)
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

let outerRoot: string;
let namespace: string;
let outside: string;
let target: AgentTarget;

function check(dstPaths: readonly string[]) {
  return assertWriteTargetsContained({
    agentTarget: target,
    dstPaths,
    resolved: new Map(),
  });
}

describe('core/agentTarget — a listing entry of unknown type is checked, not trusted', () => {
  beforeEach(() => {
    outerRoot = mkdtempSync(join(tmpdir(), 'slats-untyped-dirent-'));
    const projectRoot = join(outerRoot, 'project');
    namespace = join(projectRoot, '.claude/skills/pp');
    outside = join(outerRoot, 'outside');
    mkdirSync(namespace, { recursive: true });
    mkdirSync(outside, { recursive: true });
    writeFileSync(join(projectRoot, 'AGENTS.md'), '', 'utf-8');
    writeFileSync(join(namespace, 'SKILL.md'), '', 'utf-8');
    target = resolveAgentTarget('claude', 'project', projectRoot);
    untypedNames.clear();
  });
  afterEach(() => rmSync(outerRoot, { recursive: true, force: true }));

  // Two names in one directory take the listing path, not the single-name lstat.
  it('refuses a file link outside the project that the listing does not type', async () => {
    const link = join(namespace, 'notes.md');
    writeFileSync(join(outside, 'target.md'), '', 'utf-8');
    symlinkSync(join(outside, 'target.md'), link, 'file');
    untypedNames.add('notes.md');
    await expect(check([join(namespace, 'SKILL.md'), link])).rejects.toThrow(
      link,
    );
  });

  it('refuses a directory link outside the project that the listing does not type', async () => {
    const refs = join(namespace, 'refs');
    symlinkSync(outside, refs, 'dir');
    untypedNames.add('refs');
    await expect(
      check([join(refs, 'a.md'), join(refs, 'b.md')]),
    ).rejects.toThrow(refs);
  });

  // Control: the same untyped report for a regular file and directory is allowed.
  it('allows a regular file and directory that the listing does not type', async () => {
    mkdirSync(join(namespace, 'refs'));
    writeFileSync(join(namespace, 'notes.md'), '', 'utf-8');
    untypedNames.add('notes.md').add('refs');
    await expect(
      check([
        join(namespace, 'SKILL.md'),
        join(namespace, 'notes.md'),
        join(namespace, 'refs/a.md'),
        join(namespace, 'refs/b.md'),
      ]),
    ).resolves.toBeUndefined();
  });
});
