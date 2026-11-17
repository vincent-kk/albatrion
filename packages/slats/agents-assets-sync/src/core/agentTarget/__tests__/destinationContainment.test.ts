import { describe, expect, it } from 'vitest';

import { resolveAgentTarget } from '../agentTarget.js';
import type { AssetKind } from '../type.js';
import { resolveDestinations } from '../utils/resolveDestinations.js';

const ALL_KINDS: ReadonlySet<AssetKind> = new Set([
  'skills',
  'rules',
  'commands',
]);
// `/` owns no project anchor, so `project` scope resolves to it verbatim.
const agentTarget = resolveAgentTarget('claude', 'project', '/');

function resolve(relPaths: string[], namespacePrefixes: string[] = []) {
  return resolveDestinations({
    agentTarget,
    packageName: '@scope/pkg',
    relPaths,
    namespacePrefixes,
    assetKinds: ALL_KINDS,
  });
}

describe('core/agentTarget — destinations stay inside their kind root', () => {
  it.each([
    'skills/pp/../../../../escaped.md',
    'skills/pp/..',
    'rules/nested/../../../escaped.md',
    'commands/a/../../escaped.md',
    'skills/pp\\..\\..\\..\\escaped.md',
  ])('rejects the manifest path %s', (relPath) => {
    expect(() => resolve([relPath])).toThrow(relPath);
  });

  it.each(['skills/../', 'skills/pp/../../'])(
    'rejects the namespace prefix %s',
    (prefix) => {
      expect(() => resolve([], [prefix])).toThrow(prefix);
    },
  );

  // Control: passes with or without the containment check; it fails only if
  // the check grows wide enough to refuse ordinary names.
  it('control: keeps a name that merely contains dots', () => {
    const { destinations, orphanScans } = resolve(
      ['skills/pp/a..b/SKILL.md', 'rules/x..md'],
      ['skills/pp/'],
    );
    expect(destinations.get('skills/pp/a..b/SKILL.md')).toEqual({
      kind: 'file',
      dstAbs: '/.claude/skills/pp/a..b/SKILL.md',
    });
    expect(destinations.get('rules/x..md')).toEqual({
      kind: 'file',
      dstAbs: '/.claude/rules/x..md',
    });
    expect(orphanScans).toHaveLength(1);
  });
});
