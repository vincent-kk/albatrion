import { afterEach, describe, expect, it, vi } from 'vitest';

import { createTestTree } from '../../__tests__/fixtures/createTestTree';
import { getGateRegistry } from '../utils/gates/getGateRegistry';

afterEach(() => vi.restoreAllMocks());

// filid:contract settle-gate-registry-storage
describe('live gate registration storage', () => {
  it('registers a gate-free lifetime without node-keyed WeakMap insertions', () => {
    const { root } = createTestTree({
      type: 'object',
      properties: {
        flag: { type: 'boolean' },
        child: { type: 'string', controls: { active: '../flag' } },
      },
    });
    const entry = root.blueprintNode.childEntries.find(
      (entry) => entry.name === 'flag',
    )!;
    const node = root.runtime.nodeFactory(entry, root, root.runtime);
    const registry = getGateRegistry(root.runtime);
    const set = vi.spyOn(WeakMap.prototype, 'set');
    registry.register(node);
    const first = set.mock.calls.filter(([key]) => key === node).length;
    expect(first).toBe(0);
    registry.register(node);
    expect(set.mock.calls.filter(([key]) => key === node)).toHaveLength(0);
    expect(registry.hasRegisteredPathKind('/flag', 'boolean')).toBe(true);
    registry.remove(node);
    expect(registry.hasRegisteredPathKind('/flag', 'boolean')).toBeUndefined();
  });

  it('keeps edge occurrence identity only until the registered node is replaced', () => {
    const { root } = createTestTree({
      type: 'object',
      properties: {
        flag: { type: 'boolean' },
        child: { type: 'string', controls: { active: '../flag' } },
      },
    });
    const entry = root.blueprintNode.childEntries.find(
      (entry) => entry.name === 'child',
    )!;
    const gate = entry.declarations[0].gates[0];
    const registry = getGateRegistry(root.runtime);
    const initial = registry.locate(root, gate, 'child');
    expect(registry.locate(root, gate, 'child')).toBe(initial);
    const replacement = root.runtime.nodeFactory(
      root.blueprintNode,
      null,
      root.runtime,
    );
    const next = registry.locate(replacement, gate, 'child');
    expect(next).not.toBe(initial);
    registry.remove(root);
    expect(registry.locate(replacement, gate, 'child')).toBe(next);
    registry.remove(replacement);
    expect(registry.locate(replacement, gate, 'child')).not.toBe(next);
  });
});
