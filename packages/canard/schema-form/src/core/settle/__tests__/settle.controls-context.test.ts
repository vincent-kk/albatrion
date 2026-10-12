import { describe, expect, it, vi } from 'vitest';

import type { BlueprintSchema } from '../../blueprint';
import { SetValueOption } from '../../types/value';
import { loadSchemaNodeAtMount } from '../index';
import { createTestTree } from './fixtures/createTestTree';

// filid:contract settle-state-keys
describe('context state keys', () => {
  it('GOAL-011 state-key load does not search the expression array per sibling', () => {
    const properties: Record<string, BlueprintSchema> = {};
    for (let index = 0; index < 64; index++)
      properties[`child${index}`] = { type: 'string', controls: {
        visible: 'true',
      } };
    const { root, blueprint } = createTestTree({ type: 'object', properties });
    const find = vi.spyOn(Array.prototype, 'find');
    const builds = vi.spyOn(Array.prototype, 'map');
    try {
      loadSchemaNodeAtMount(root, {}, SetValueOption.Overwrite);
      expect(find.mock.contexts.filter((target) =>
        target === blueprint.expressions)).toHaveLength(0);
      expect(builds.mock.contexts.filter((target) =>
        target === blueprint.expressions)).toHaveLength(1);
    } finally {
      find.mockRestore();
      builds.mockRestore();
    }
  });

  it('CONTROLS-073 evaluates a children item once for all addressed siblings', () => {
    const { root } = createTestTree({ type: 'object', controls: { children: [
      { targets: ['a', 'b'], controls: { readOnly: '@.locked()' } },
    ] }, properties: { a: { type: 'string' }, b: { type: 'string' } } });
    const locked = vi.fn(() => true);
    root.runtime.context = { locked };
    loadSchemaNodeAtMount(root, { a: 'a', b: 'b' }, SetValueOption.Overwrite);
    expect(locked).toHaveBeenCalledTimes(1);
    expect([root.structure?.a?.readOnly, root.structure?.b?.readOnly])
      .toEqual([true, true]);
  });

  it('ERROR-122 state key throw commits degraded and ignores that declaration', () => {
    const { root } = createTestTree({ type: 'object', properties: {
      child: { type: 'string', controls: { visible: '@.explode()' } },
    } });
    root.runtime.context = { explode: () => { throw new Error('state key'); } };
    expect(() => loadSchemaNodeAtMount(root, { child: 'c' },
      SetValueOption.Overwrite)).toThrow();
    expect(root.runtime.diagnostics).toMatchObject({
      status: 'degraded', cause: 'expression',
    });
    expect(root.structure?.child?.visible).toBe(true);
  });
});
