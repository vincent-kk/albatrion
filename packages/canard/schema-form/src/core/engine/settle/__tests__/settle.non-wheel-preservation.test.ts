import { afterEach, describe, expect, it, vi } from 'vitest';

import type { BlueprintSchema } from '../../blueprint';
import { FieldNodeEventType } from '../../record';
import { WriteOption } from '../../types/value';
import * as comparisons from '../../utils/compute/sameValue';
import { dispatchMount, dispatchSetValue } from '../../write';
import { createDispatchTree } from '../../__tests__/fixtures/createDispatchTree';

afterEach(() => vi.restoreAllMocks());

// filid:contract settle-non-wheel-reference-cost
describe('H2 non-wheel reference preservation', () => {
  it.each([250, 1000, 4000])(
    'bounds comparison work and avoids whole-value keys beside %i static siblings',
    (count) => {
      const properties: Record<string, BlueprintSchema> = {
        kind: { type: 'string', default: 'a' },
      };
      for (let index = 0; index < count; index++)
        properties['pad_' + index] = { type: 'number', default: index };
      const { root } = createDispatchTree({
        type: 'object',
        properties,
        oneOf: ['a', 'b'].map((kind) => ({
          controls: { active: `./kind === '${kind}'` },
          properties: { payload: { type: 'string', default: kind } },
        })),
      });
      dispatchMount(root, {}, WriteOption.Overwrite, {
        deferValidation: true,
      });
      const leaf = root.structure!['pad_' + (count - 1)];
      const compare = vi.spyOn(comparisons, 'sameValue');
      const keys = vi.spyOn(Object, 'keys');

      dispatchSetValue(leaf, -1);

      const calls = compare.mock.calls.length;
      const wholeKeys = keys.mock.calls.filter(
        ([value]) =>
          value !== null &&
          typeof value === 'object' &&
          Object.hasOwn(value, 'pad_' + (count - 1)),
      ).length;
      keys.mockRestore();
      compare.mockRestore();
      console.info('H2_WORK', JSON.stringify({ count, calls, wholeKeys }));
      expect(Reflect.get(Object(root.emit), leaf.name)).toBe(-1);
      expect(calls).toBeLessThanOrEqual(8);
      // Module spies miss sameValue's local recursion; key enumeration exposes that work.
      expect(wholeKeys).toBe(0);
    },
  );

  it('keeps unchanged ancestors public values and shape identities after derived restoration', () => {
    let tick = 10;
    const { root } = createDispatchTree({
      type: 'object',
      properties: {
        outer: {
          type: 'object',
          properties: {
            group: {
              type: 'object',
              properties: {
                value: {
                  type: 'number',
                  controls: {
                    derived: '../value * 0',
                    injectTo: () => ({ '/other': ++tick }),
                  },
                },
              },
            },
          },
        },
        other: { type: 'number' },
        switcher: {
          type: 'object',
          properties: {
            flag: { type: 'boolean' },
            gated: { type: 'string', controls: { active: '../flag' } },
          },
        },
      },
    });
    dispatchMount(
      root,
      { outer: { group: { value: 0 } }, other: 1, switcher: { flag: false } },
      WriteOption.Overwrite,
      { deferValidation: true },
    );
    const outer = root.structure!.outer;
    const group = outer.structure!.group;
    const before = [outer, group].map((node) => ({
      node,
      value: Reflect.get(node, 'value'),
      outputValue: Reflect.get(node, 'outputValue'),
      children: node.children,
      schema: node.schema,
      active: node.active,
      revision: node.revisionLedger[FieldNodeEventType.UpdateValue] ?? 0,
    }));
    const previousOther = root.structure!.other.local;

    dispatchSetValue(group.structure!.value, 1);

    expect(root.structure!.other.local).not.toBe(previousOther);
    for (const previous of before) {
      const node = previous.node;
      expect(Reflect.get(node, 'value')).toBe(previous.value);
      expect(Reflect.get(node, 'outputValue')).toBe(previous.outputValue);
      expect(node.children).toBe(previous.children);
      expect(node.schema).toBe(previous.schema);
      expect(node.active).toBe(previous.active);
      expect(node.revisionLedger[FieldNodeEventType.UpdateValue] ?? 0).toBe(
        previous.revision,
      );
    }
    expect(Reflect.get(Object(root.local), 'outer')).toBe(outer.emit);
    expect(Reflect.get(Object(outer.local), 'group')).toBe(group.emit);
  });
});
