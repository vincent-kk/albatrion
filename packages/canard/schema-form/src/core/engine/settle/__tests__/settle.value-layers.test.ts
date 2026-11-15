import { describe, expect, it, vi } from 'vitest';

import { FieldNodeState } from '@/schema-form/core/engine/types/state';
import {
  FieldNodeWriteKind,
  WriteOption,
} from '@/schema-form/core/engine/types/value';

import { createTestTree } from '../../__tests__/fixtures/createTestTree';
import { loadFieldNodeAtMount } from '../loadFieldNodeAtMount';
import { writeFieldNode } from '../utils/write/writeFieldNode';

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
    expect([
      root.childrenByName?.a?.source,
      root.childrenByName?.b?.source,
    ]).toEqual(['first', 'first']);
    writeFieldNode(
      root.childrenByName!['source'],
      'second',
      FieldNodeWriteKind.Input,
      WriteOption.Overwrite,
    );
    expect([
      root.childrenByName?.a?.source,
      root.childrenByName?.b?.source,
    ]).toEqual(['second', 'second']);
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
    expect(root.childrenByName?.inside?.source).toBe('from-source');
    expect(root.childrenByName?.outside?.source).toBeUndefined();
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
    expect([
      root.childrenByName?.a?.source,
      root.childrenByName?.b?.source,
    ]).toEqual(['shared', 'shared']);
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
    expect([
      root.childrenByName?.a?.source,
      root.childrenByName?.b?.source,
    ]).toEqual([undefined, undefined]);
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
    root.childrenByName!.a.storedState = {
      [FieldNodeState.Edited]: true,
      [FieldNodeState.Touched]: true,
    };
    root.childrenByName!.b.storedState = {
      [FieldNodeState.Edited]: true,
      [FieldNodeState.Touched]: true,
    };
    writeFieldNode(
      root.childrenByName!.trigger,
      true,
      FieldNodeWriteKind.Input,
      WriteOption.Overwrite,
    );
    expect(reset).toHaveBeenCalledTimes(1);
    expect(root.childrenByName?.a?.storedState[FieldNodeState.Edited]).toBe(
      false,
    );
    expect(root.childrenByName?.a?.storedState[FieldNodeState.Touched]).toBe(
      false,
    );
    expect(root.childrenByName?.b?.storedState[FieldNodeState.Edited]).toBe(
      false,
    );
    expect(root.childrenByName?.b?.storedState[FieldNodeState.Touched]).toBe(
      false,
    );
  });
});
