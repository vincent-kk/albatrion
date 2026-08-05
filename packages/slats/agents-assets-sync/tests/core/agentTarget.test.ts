import { homedir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

import {
  type AssetKind,
  resolveAgentTarget,
  resolveDestinations,
  splitAssetKind,
} from '../../src/core/agentTarget/index.js';

const PKG = '@canard/schema-form';
const ALL_KINDS: ReadonlySet<AssetKind> = new Set([
  'skills',
  'rules',
  'commands',
]);
// `/` owns no project anchor, so `project` scope resolves to it verbatim and
// the expected paths stay stable across machines.
const ROOT = '/';

describe('core/agentTarget — splitAssetKind', () => {
  it.each([
    ['skills/foo/SKILL.md', { kind: 'skills', rest: 'foo/SKILL.md' }],
    ['rules/a.md', { kind: 'rules', rest: 'a.md' }],
    ['commands/x/y.md', { kind: 'commands', rest: 'x/y.md' }],
  ] as const)('splits %s', (relPath, expected) => {
    expect(splitAssetKind(relPath)).toEqual(expected);
  });

  it.each(['README.md', 'other/a.md', 'skills', 'skills/', ''])(
    'returns null for %s',
    (relPath) => {
      expect(splitAssetKind(relPath)).toBeNull();
    },
  );
});

describe('core/agentTarget — resolveAgentTarget', () => {
  it('claude(user) roots every kind under ~/.claude', () => {
    const t = resolveAgentTarget('claude', 'user', ROOT);
    const claudeRoot = join(homedir(), '.claude');
    expect(t.directoryRoots).toEqual({
      skills: join(claudeRoot, 'skills'),
      rules: join(claudeRoot, 'rules'),
      commands: join(claudeRoot, 'commands'),
    });
    expect(t.rulesMergeFile).toBeNull();
    expect(t.unsupported).toEqual({});
  });

  it('claude(project) roots every kind under <projectRoot>/.claude', () => {
    const t = resolveAgentTarget('claude', 'project', ROOT);
    expect(t.projectRoot).toBe(ROOT);
    expect(t.directoryRoots.skills).toBe(join(ROOT, '.claude', 'skills'));
    expect(t.directoryRoots.rules).toBe(join(ROOT, '.claude', 'rules'));
  });

  it('codex(user) puts skills under ~/.codex/skills and rules in ~/.codex/AGENTS.md', () => {
    const t = resolveAgentTarget('codex', 'user', ROOT);
    const codexHome = join(homedir(), '.codex');
    expect(t.directoryRoots.skills).toBe(join(codexHome, 'skills'));
    expect(t.directoryRoots.rules).toBeNull();
    expect(t.directoryRoots.commands).toBeNull();
    expect(t.rulesMergeFile).toBe(join(codexHome, 'AGENTS.md'));
    expect(t.unsupported.commands).toBeTruthy();
  });

  it('codex(project) keeps AGENTS.md at the project root, not inside .codex', () => {
    const t = resolveAgentTarget('codex', 'project', ROOT);
    expect(t.directoryRoots.skills).toBe(join(ROOT, '.codex', 'skills'));
    expect(t.rulesMergeFile).toBe(join(ROOT, 'AGENTS.md'));
  });
});

describe('core/agentTarget — resolveDestinations', () => {
  const relPaths = [
    'skills/form/SKILL.md',
    'skills/form/knowledge/a.md',
    'rules/form-rule.md',
    'commands/gen.md',
    'README.md',
  ];
  const namespacePrefixes = ['skills/form/'];

  it('maps every kind to a file destination for claude', () => {
    const agentTarget = resolveAgentTarget('claude', 'project', ROOT);
    const { destinations } = resolveDestinations({
      agentTarget,
      packageName: PKG,
      relPaths,
      namespacePrefixes,
      assetKinds: ALL_KINDS,
    });

    const claudeRoot = join(ROOT, '.claude');
    expect(destinations.get('skills/form/SKILL.md')).toEqual({
      kind: 'file',
      dstAbs: join(claudeRoot, 'skills', 'form', 'SKILL.md'),
    });
    expect(destinations.get('rules/form-rule.md')).toEqual({
      kind: 'file',
      dstAbs: join(claudeRoot, 'rules', 'form-rule.md'),
    });
    expect(destinations.get('commands/gen.md')).toEqual({
      kind: 'file',
      dstAbs: join(claudeRoot, 'commands', 'gen.md'),
    });
    // An unrecognised top-level segment is not this tool's to place.
    expect(destinations.has('README.md')).toBe(false);
  });

  it('maps codex rules to a block and codex commands to unsupported', () => {
    const agentTarget = resolveAgentTarget('codex', 'project', ROOT);
    const { destinations } = resolveDestinations({
      agentTarget,
      packageName: PKG,
      relPaths,
      namespacePrefixes,
      assetKinds: ALL_KINDS,
    });

    expect(destinations.get('skills/form/SKILL.md')).toEqual({
      kind: 'file',
      dstAbs: join(ROOT, '.codex', 'skills', 'form', 'SKILL.md'),
    });
    expect(destinations.get('rules/form-rule.md')).toEqual({
      kind: 'block',
      fileAbs: join(ROOT, 'AGENTS.md'),
      blockId: `${PKG}:rules/form-rule.md`,
    });
    expect(destinations.get('commands/gen.md')).toEqual({
      kind: 'unsupported',
      reason: expect.stringContaining('codex'),
    });
  });

  it('honours the asset-kind filter on both destinations and orphan scans', () => {
    const agentTarget = resolveAgentTarget('codex', 'project', ROOT);
    const { destinations, orphanScans } = resolveDestinations({
      agentTarget,
      packageName: PKG,
      relPaths,
      namespacePrefixes,
      assetKinds: new Set<AssetKind>(['skills']),
    });

    expect(destinations.has('rules/form-rule.md')).toBe(false);
    expect(destinations.has('commands/gen.md')).toBe(false);
    expect(orphanScans).toEqual([
      {
        kind: 'directory',
        scanRoot: join(ROOT, '.codex', 'skills', 'form'),
        relPathPrefix: 'skills/form/',
      },
    ]);
  });

  it('adds a block-file orphan scan when codex rules are included', () => {
    const agentTarget = resolveAgentTarget('codex', 'project', ROOT);
    const { orphanScans } = resolveDestinations({
      agentTarget,
      packageName: PKG,
      relPaths,
      namespacePrefixes,
      assetKinds: ALL_KINDS,
    });

    expect(orphanScans).toContainEqual({
      kind: 'block-file',
      fileAbs: join(ROOT, 'AGENTS.md'),
      ownerPackage: PKG,
    });
  });

  it('refuses a skill whose directory would shadow a reserved codex namespace', () => {
    const agentTarget = resolveAgentTarget('codex', 'project', ROOT);
    expect(() =>
      resolveDestinations({
        agentTarget,
        packageName: PKG,
        relPaths: ['skills/.system/SKILL.md'],
        namespacePrefixes: ['skills/.system/'],
        assetKinds: ALL_KINDS,
      }),
    ).toThrow(/\.system/);
  });
});
