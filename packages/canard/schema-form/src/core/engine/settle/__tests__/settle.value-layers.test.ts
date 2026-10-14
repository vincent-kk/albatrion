import { describe, expect, it, vi } from 'vitest';

import { FieldNodeState } from '@/schema-form/core/engine/types/state';
import { WriteOption } from '@/schema-form/core/engine/types/value';

import { loadFieldNodeAtMount } from '../utils/load/loadFieldNodeAtMount';
import { writeFieldNode } from '../utils/write/writeFieldNode';
import { createTestTree } from './fixtures/createTestTree';

describe('settled value rule layers', () => {
  it('CONTROLS-073 fields derived reaches each addressed target', () => {
    const { root } = createTestTree({
      type: 'object',
      controls: {
        fields: [{ targets: ['a', 'b'], controls: { derived: './source' } }],
      },
      properties: {
        source: { type: 'string' },
        a: { type: 'string' },
        b: { type: 'string' },
      },
    });
    loadFieldNodeAtMount(root, { source: 'first' }, WriteOption.Overwrite);
    expect([root.structure?.a?.raw, root.structure?.b?.raw]).toEqual([
      'first',
      'first',
    ]);
    writeFieldNode(
      root.structure!.source,
      'second',
      'input',
      WriteOption.Overwrite,
    );
    expect([root.structure?.a?.raw, root.structure?.b?.raw]).toEqual([
      'second',
      'second',
    ]);
  });

  it('CONTROLS-077 fragment derived reaches direct children only', () => {
    const { root } = createTestTree({
      type: 'object',
      properties: {
        source: { type: 'string' },
        outside: { type: 'string' },
      },
      allOf: [
        {
          controls: { derived: './source' },
          properties: {
            inside: { type: 'string' },
          },
        },
      ],
    });
    loadFieldNodeAtMount(
      root,
      { source: 'from-source' },
      WriteOption.Overwrite,
    );
    expect(root.structure?.inside?.raw).toBe('from-source');
    expect(root.structure?.outside?.raw).toBeUndefined();
  });

  it('CONTROLS-073 fields derived evaluates once for all targets', () => {
    const { root } = createTestTree({
      type: 'object',
      controls: {
        fields: [{ targets: ['a', 'b'], controls: { derived: '@.derive()' } }],
      },
      properties: { a: { type: 'string' }, b: { type: 'string' } },
    });
    const derive = vi.fn(() => 'shared');
    root.runtime.context = { derive };
    loadFieldNodeAtMount(root, {}, WriteOption.Overwrite);
    expect(derive).toHaveBeenCalledTimes(1);
    expect([root.structure?.a?.raw, root.structure?.b?.raw]).toEqual([
      'shared',
      'shared',
    ]);
  });

  it('CONTROLS-073 fields unsetValue evaluates one expression for all targets', () => {
    const { root } = createTestTree({
      type: 'object',
      controls: {
        fields: [
          { targets: ['a', 'b'], controls: { unsetValue: '@.clear()' } },
        ],
      },
      properties: { a: { type: 'string' }, b: { type: 'string' } },
    });
    const clear = vi.fn(() => true);
    root.runtime.context = { clear };
    loadFieldNodeAtMount(root, { a: 'A', b: 'B' }, WriteOption.Overwrite);
    expect(clear).toHaveBeenCalledTimes(2);
    expect([root.structure?.a?.raw, root.structure?.b?.raw]).toEqual([
      undefined,
      undefined,
    ]);
  });

  it('CONTROLS-073 fields resetInteraction evaluates once for all targets', () => {
    const { root } = createTestTree({
      type: 'object',
      controls: {
        fields: [
          {
            targets: ['a', 'b'],
            controls: { resetInteraction: './trigger && @.reset()' },
          },
        ],
      },
      properties: {
        trigger: { type: 'boolean' },
        a: { type: 'string' },
        b: { type: 'string' },
      },
    });
    const reset = vi.fn(() => true);
    root.runtime.context = { reset };
    loadFieldNodeAtMount(
      root,
      { trigger: false, a: 'A', b: 'B' },
      WriteOption.Overwrite,
    );
    root.structure!.a.interactionState = {
      [FieldNodeState.Dirty]: true,
      [FieldNodeState.Touched]: true,
    };
    root.structure!.b.interactionState = {
      [FieldNodeState.Dirty]: true,
      [FieldNodeState.Touched]: true,
    };
    writeFieldNode(
      root.structure!.trigger,
      true,
      'input',
      WriteOption.Overwrite,
    );
    expect(reset).toHaveBeenCalledTimes(1);
    expect(root.structure?.a?.interactionState[FieldNodeState.Dirty]).toBe(
      false,
    );
    expect(root.structure?.a?.interactionState[FieldNodeState.Touched]).toBe(
      false,
    );
    expect(root.structure?.b?.interactionState[FieldNodeState.Dirty]).toBe(
      false,
    );
    expect(root.structure?.b?.interactionState[FieldNodeState.Touched]).toBe(
      false,
    );
  });
});
