import {
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

  it('resolves each directory once into the shared cache', async () => {
    await check([join(namespace, 'a.md'), join(namespace, 'b.md')]);
    expect(resolved.get(namespace)).toEqual({
      real: expect.stringContaining('pp'),
      exists: true,
    });
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
