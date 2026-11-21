import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { resolveAgentTarget } from '../agentTarget.js';
import type { AgentTarget, ResolvedLocations } from '../type.js';
import { assertWriteTargetsContained } from '../utils/assertWriteTargetsContained.js';

let outerRoot: string;
let projectRoot: string;
let namespace: string;
let outside: string;
let target: AgentTarget;
let resolved: ResolvedLocations;

function check(dstPaths: readonly string[], agentTarget = target) {
  return assertWriteTargetsContained({ agentTarget, dstPaths, resolved });
}

describe('core/agentTarget — written files resolve inside the project', () => {
  beforeEach(() => {
    outerRoot = mkdtempSync(join(tmpdir(), 'slats-write-target-'));
    projectRoot = join(outerRoot, 'project');
    namespace = join(projectRoot, '.claude/skills/pp');
    outside = join(outerRoot, 'outside');
    mkdirSync(namespace, { recursive: true });
    mkdirSync(outside, { recursive: true });
    writeFileSync(join(projectRoot, 'AGENTS.md'), '', 'utf-8');
    target = resolveAgentTarget('claude', 'project', projectRoot);
    resolved = new Map();
  });
  afterEach(() => rmSync(outerRoot, { recursive: true, force: true }));

  it('passes regular files, including ones in directories not created yet', async () => {
    writeFileSync(join(namespace, 'SKILL.md'), '', 'utf-8');
    await expect(
      check([join(namespace, 'SKILL.md'), join(namespace, 'new/deep/a.md')]),
    ).resolves.toBeUndefined();
  });

  it('refuses a file link that points outside the project, naming it', async () => {
    const link = join(namespace, 'SKILL.md');
    writeFileSync(join(outside, 'target.md'), '', 'utf-8');
    symlinkSync(join(outside, 'target.md'), link, 'file');
    await expect(check([link])).rejects.toThrow(link);
  });

  it('refuses a dangling file link, which a copy would follow', async () => {
    const link = join(namespace, 'SKILL.md');
    symlinkSync(join(outside, 'missing.md'), link, 'file');
    await expect(check([link])).rejects.toThrow(link);
  });

  it('refuses a directory link below the namespace that points outside, naming it', async () => {
    const knowledge = join(namespace, 'knowledge');
    symlinkSync(outside, knowledge, 'dir');
    await expect(check([join(knowledge, 'deep/a.md')])).rejects.toThrow(
      knowledge,
    );
  });

  it('accepts file and directory links that stay inside the project', async () => {
    mkdirSync(join(projectRoot, 'shared'));
    writeFileSync(join(projectRoot, 'shared/SKILL.md'), '', 'utf-8');
    symlinkSync(
      join(projectRoot, 'shared/SKILL.md'),
      join(namespace, 'SKILL.md'),
      'file',
    );
    symlinkSync(
      join(projectRoot, 'shared'),
      join(namespace, 'knowledge'),
      'dir',
    );
    await expect(
      check([join(namespace, 'SKILL.md'), join(namespace, 'knowledge/a.md')]),
    ).resolves.toBeUndefined();
  });

  it('resolves and lists each directory once into the shared cache', async () => {
    await check([join(namespace, 'a.md'), join(namespace, 'b.md')]);
    expect(resolved.get(namespace)).toEqual({
      real: expect.stringContaining('pp'),
      exists: true,
      listing: { names: new Set(), linkNames: new Set() },
    });
  });

  // One written name is checked with `lstat`, two or more through one listing
  // of the directory; both paths must reach the same verdict.
  describe.each([
    ['lstat (one name written)', [] as string[]],
    ['listing (two names written)', ['sibling.md']],
  ])('link detection through %s', (_label, extraNames) => {
    const cases: Array<[string, (link: string) => void, boolean]> = [
      [
        'a file link outside the project',
        (link) => {
          writeFileSync(join(outside, 'target.md'), '', 'utf-8');
          symlinkSync(join(outside, 'target.md'), link, 'file');
        },
        false,
      ],
      [
        'a dangling file link',
        (link) => symlinkSync(join(outside, 'missing.md'), link, 'file'),
        false,
      ],
      [
        'a file link inside the project',
        (link) => {
          writeFileSync(join(projectRoot, 'inside.md'), '', 'utf-8');
          symlinkSync(join(projectRoot, 'inside.md'), link, 'file');
        },
        true,
      ],
      ['a regular file', (link) => writeFileSync(link, '', 'utf-8'), true],
    ];
    it.each(cases)('judges %s', async (_name, arrange, isAllowed) => {
      const link = join(namespace, 'SKILL.md');
      arrange(link);
      writeFileSync(join(namespace, 'sibling.md'), '', 'utf-8');
      const written = [link, ...extraNames.map((n) => join(namespace, n))];
      if (isAllowed) await expect(check(written)).resolves.toBeUndefined();
      else await expect(check(written)).rejects.toThrow(link);
    });
  });

  // A name the listing does not show exactly can still reach a link of
  // different case where the file system ignores case, so it is resolved
  // through the file system rather than judged missing from the listing.
  it('refuses case-flipped names that reach an outside link where case is ignored', async () => {
    writeFileSync(join(outside, 'target.md'), '', 'utf-8');
    symlinkSync(
      join(outside, 'target.md'),
      join(namespace, 'SKILL.md'),
      'file',
    );
    symlinkSync(outside, join(namespace, 'knowledge'), 'dir');
    writeFileSync(join(namespace, 'other.md'), '', 'utf-8');
    const isCaseInsensitive = existsSync(join(namespace, 'skill.md'));
    const fileWrites = [
      join(namespace, 'skill.md'),
      join(namespace, 'other.md'),
    ];
    const dirWrites = [
      join(namespace, 'Knowledge/a.md'),
      join(namespace, 'Knowledge/b.md'),
    ];
    for (const written of [fileWrites, dirWrites]) {
      resolved = new Map();
      const verdict = check(written);
      if (isCaseInsensitive) await expect(verdict).rejects.toThrow();
      else await expect(verdict).resolves.toBeUndefined();
    }
  });

  // Control: user scope never checks, so a dotfiles link stays usable.
  it('control: does not check at user scope', async () => {
    const link = join(namespace, 'SKILL.md');
    symlinkSync(join(outside, 'missing.md'), link, 'file');
    await expect(
      check([link], { ...target, scope: 'user' }),
    ).resolves.toBeUndefined();
  });
});
