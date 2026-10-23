import { describe, expect, it, vi } from 'vitest';

import type { BlueprintSchema } from '@/schema-form/core/engine/blueprint';
import { WriteOption } from '@/schema-form/core/engine/types/value';

import { createTestTree } from '../../__tests__/fixtures/createTestTree';
import { loadFieldNodeAtMount } from '../loadFieldNodeAtMount';
import { writeFieldNode } from '../utils/write/writeFieldNode';

// filid:contract settle-state-keys-context
describe('context state keys', () => {
  it('GOAL-011 state-key load does not search the expression array per sibling', () => {
    const properties: Record<string, BlueprintSchema> = {};
    for (let index = 0; index < 64; index++)
      properties[`child${index}`] = {
        type: 'string',
        controls: {
          visible: 'true',
        },
      };
    const { root, blueprint } = createTestTree({ type: 'object', properties });
    const find = vi.spyOn(Array.prototype, 'find');
    const builds = vi.spyOn(Array.prototype, 'map');
    try {
      loadFieldNodeAtMount(root, {}, WriteOption.Overwrite);
      expect(
        find.mock.contexts.filter((target) => target === blueprint.expressions),
      ).toHaveLength(0);
      expect(
        builds.mock.contexts.filter(
          (target) => target === blueprint.expressions,
        ),
      ).toHaveLength(1);
    } finally {
      find.mockRestore();
      builds.mockRestore();
    }
  });

  it('CONTROLS-073 evaluates a fields entry once for all addressed siblings', () => {
    const { root } = createTestTree({
      type: 'object',
      controls: {
        fields: [{ targets: ['a', 'b'], controls: { readOnly: '@.locked()' } }],
      },
      properties: { a: { type: 'string' }, b: { type: 'string' } },
    });
    const locked = vi.fn(() => true);
    root.runtime.context = { locked };
    loadFieldNodeAtMount(root, { a: 'a', b: 'b' }, WriteOption.Overwrite);
    expect(locked).toHaveBeenCalledTimes(1);
    expect([root.structure?.a?.readOnly, root.structure?.b?.readOnly]).toEqual([
      true,
      true,
    ]);
  });

  it('ERROR-122 state key throw commits degraded and ignores that declaration', () => {
    const { root } = createTestTree({
      type: 'object',
      properties: {
        child: { type: 'string', controls: { visible: '@.explode()' } },
      },
    });
    root.runtime.context = {
      explode: () => {
        throw new Error('state key');
      },
    };
    expect(() =>
      loadFieldNodeAtMount(root, { child: 'c' }, WriteOption.Overwrite),
    ).toThrow();
    expect(root.runtime.diagnostics).toMatchObject({
      status: 'degraded',
      cause: 'expression',
    });
    expect(root.structure?.child?.visible).toBe(true);
  });
});

describe('state-key failures during settlement', () => {
  it('ERROR-122 throwing visible leaves an unrelated unsetOnInactive exit clear', () => {
    const { root } = createTestTree({
      type: 'object',
      properties: {
        flag: { type: 'boolean' },
        secret: {
          type: 'string',
          controls: {
            active: '../flag',
            unsetOnInactive: true,
          },
        },
        noisy: {
          type: 'string',
          controls: {
            visible:
              '!../flag ? (() => { throw new Error("visibility") })() : true',
          },
        },
      },
    });
    loadFieldNodeAtMount(
      root,
      { flag: true, secret: 'held' },
      WriteOption.Overwrite,
    );
    expect(() =>
      writeFieldNode(
        root.structure!.flag,
        false,
        'input',
        WriteOption.Overwrite,
      ),
    ).toThrow('State key expression failed');
    expect(root.structure?.secret).toBeUndefined();
    expect(
      root.runtime.latentRaw.has(JSON.stringify(['/secret', 'string'])),
    ).toBe(false);
  });
});
