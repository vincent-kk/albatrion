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
import type { AgentTarget, AssetKind, OrphanScan } from '../type.js';
import { assertProjectPathsContained } from '../utils/assertProjectPathsContained.js';

const ALL_KINDS: ReadonlySet<AssetKind> = new Set([
  'skills',
  'rules',
  'commands',
]);

let outerRoot: string;
let projectRoot: string;
let outside: string;
let target: AgentTarget;

function namespaceScan(name: string): OrphanScan {
  return {
    kind: 'directory',
    scanRoot: join(projectRoot, '.claude/skills', name),
    relPathPrefix: `skills/${name}/`,
  };
}

function check(
  orphanScans: readonly OrphanScan[] = [],
  assetKinds: ReadonlySet<AssetKind> = ALL_KINDS,
  agentTarget: AgentTarget = target,
) {
  return assertProjectPathsContained({
    agentTarget,
    assetKinds,
    orphanScans,
    resolved: new Map(),
  });
}

describe('core/agentTarget — project destinations resolve inside the project', () => {
  beforeEach(() => {
    outerRoot = mkdtempSync(join(tmpdir(), 'slats-real-root-'));
    projectRoot = join(outerRoot, 'project');
    outside = join(outerRoot, 'outside');
    mkdirSync(join(projectRoot, '.claude'), { recursive: true });
    mkdirSync(outside, { recursive: true });
    writeFileSync(join(projectRoot, 'AGENTS.md'), '', 'utf-8');
    target = resolveAgentTarget('claude', 'project', projectRoot);
  });
  afterEach(() => rmSync(outerRoot, { recursive: true, force: true }));

  it('passes when no destination exists yet', async () => {
    await expect(check([namespaceScan('pp')])).resolves.toBeUndefined();
  });

  it('refuses a kind root linked outside the project, naming it', async () => {
    const rules = join(projectRoot, '.claude/rules');
    symlinkSync(outside, rules, 'dir');
    await expect(check()).rejects.toThrow(rules);
  });

  it('refuses a skill namespace linked outside the project, naming it', async () => {
    mkdirSync(join(projectRoot, '.claude/skills'));
    const namespace = join(projectRoot, '.claude/skills/pp');
    symlinkSync(outside, namespace, 'dir');
    await expect(check([namespaceScan('pp')])).rejects.toThrow(namespace);
  });

  it('refuses a dangling link, which a write would follow', async () => {
    const skills = join(projectRoot, '.claude/skills');
    symlinkSync(join(outerRoot, 'missing'), skills, 'dir');
    await expect(check()).rejects.toThrow(skills);
  });

  it('accepts a link that stays inside the project', async () => {
    mkdirSync(join(projectRoot, 'shared-skills'));
    symlinkSync(
      join(projectRoot, 'shared-skills'),
      join(projectRoot, '.claude/skills'),
      'dir',
    );
    await expect(check([namespaceScan('pp')])).resolves.toBeUndefined();
  });

  it('ignores the root of a kind the run does not write', async () => {
    symlinkSync(outside, join(projectRoot, '.claude/commands'), 'dir');
    await expect(check([], new Set(['skills']))).resolves.toBeUndefined();
  });

  // Control: user scope never checks, so a dotfiles-linked root stays usable.
  it('control: does not check at user scope', async () => {
    symlinkSync(outside, join(projectRoot, '.claude/skills'), 'dir');
    const userTarget: AgentTarget = { ...target, scope: 'user' };
    await expect(check([], ALL_KINDS, userTarget)).resolves.toBeUndefined();
  });
});
