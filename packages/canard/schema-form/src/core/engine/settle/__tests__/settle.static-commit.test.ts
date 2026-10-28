import { afterEach, expect, it, vi } from 'vitest';

import { createTestTree } from '../../__tests__/fixtures/createTestTree';
import { WriteOption } from '../../types/value';
import * as declarationKeys from '../../utils/controls/getCommittedDeclarationKey';
import { loadFieldNodeAtMount } from '../loadFieldNodeAtMount';
import { getControlLayers } from '../utils/controls/getControlLayers';
import { readDefault } from '../utils/transition/readDefault';
import { writeFieldNode } from '../utils/write/writeFieldNode';

afterEach(() => vi.restoreAllMocks());

// filid:contract settle-b9-static-commit
it('does not revisit 1000 retained required flags and bounds declaration-key work', () => {
  const { root } = createTestTree({
    type: 'object',
    properties: {
      type: { type: 'string', default: 'a' },
      ...Object.fromEntries(
        Array.from({ length: 1000 }, (_, index) => [
          `pad_${index}`,
          { type: 'number', default: index },
        ]),
      ),
    },
    oneOf: ['a', 'b'].map((type) => ({
      controls: { active: `./type === "${type}"` },
      properties: { x: { type: 'string', default: type } },
    })),
  });
  loadFieldNodeAtMount(root, {}, WriteOption.Overwrite);
  writeFieldNode(root.structure!.type, 'b', 'input', WriteOption.Overwrite);
  let requiredReads = 0;
  for (let index = 0; index < 1000; index++) {
    const child = root.structure![`pad_${index}`];
    let required = child.required;
    Object.defineProperty(child, 'required', {
      configurable: true,
      enumerable: true,
      get() {
        requiredReads++;
        return required;
      },
      set(value: boolean) {
        required = value;
      },
    });
  }
  const keys = vi.spyOn(declarationKeys, 'getCommittedDeclarationKey');
  writeFieldNode(root.structure!.type, 'a', 'input', WriteOption.Overwrite);
  expect(requiredReads).toBe(0);
  expect(keys.mock.calls.length).toBeLessThanOrEqual(16);
});

it('reads static control and default declarations without a committed-key lookup', () => {
  const { root } = createTestTree({
    type: 'object',
    properties: {
      kind: { type: 'boolean', default: false },
      fixed: { type: 'number', default: 7, controls: { readOnly: '../kind' } },
    },
    oneOf: [false, true].map((kind) => ({
      controls: { active: `./kind === ${kind}` },
      properties: { x: { type: 'string' } },
    })),
  });
  loadFieldNodeAtMount(root, {}, WriteOption.Overwrite);
  writeFieldNode(root.structure!.kind, true, 'input', WriteOption.Overwrite);
  const get = vi.spyOn(root.runtime.committedDeclarationIds!, 'get');
  const fixed = root.structure!.fixed;
  expect(getControlLayers(fixed, new Map()).length).toBeGreaterThan(0);
  expect(readDefault(fixed, new Map())).toBe(7);
  expect(get).not.toHaveBeenCalled();
});

it('updates existing required flags when branch required identities differ', () => {
  const { root } = createTestTree({
    type: 'object',
    properties: { kind: { type: 'boolean', default: false } },
    oneOf: [false, true].map((kind) => ({
      controls: { active: `./kind === ${kind}` },
      properties: { shared: { type: 'string' } },
      required: kind ? ['shared'] : [],
    })),
  });
  loadFieldNodeAtMount(root, {}, WriteOption.Overwrite);
  const shared = root.structure!.shared;
  expect(shared.required).toBe(false);
  writeFieldNode(root.structure!.kind, true, 'input', WriteOption.Overwrite);
  expect(root.structure!.shared).toBe(shared);
  expect(shared.required).toBe(true);
  writeFieldNode(root.structure!.kind, false, 'input', WriteOption.Overwrite);
  expect(shared.required).toBe(false);
});

it('sets required on newly entering children when the required array is retained', () => {
  const { root } = createTestTree({
    type: 'object',
    required: ['a', 'b'],
    properties: { kind: { type: 'boolean', default: false } },
    oneOf: [false, true].map((kind) => ({
      controls: { active: `./kind === ${kind}` },
      properties: { [kind ? 'b' : 'a']: { type: 'string' } },
    })),
  });
  loadFieldNodeAtMount(root, {}, WriteOption.Overwrite);
  expect(root.structure!.a.required).toBe(true);
  writeFieldNode(root.structure!.kind, true, 'input', WriteOption.Overwrite);
  expect(root.structure!.b.required).toBe(true);
});
