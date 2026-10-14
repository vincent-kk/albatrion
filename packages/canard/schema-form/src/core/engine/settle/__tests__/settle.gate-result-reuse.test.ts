import { describe, expect, it, vi } from 'vitest';

import { WriteOption } from '@/schema-form/core/engine/types/value';

import { loadFieldNodeAtMount } from '../utils/load/loadFieldNodeAtMount';
import { writeFieldNode } from '../utils/write/writeFieldNode';
import { createTestTree } from './fixtures/createTestTree';

describe('pure gate projection baseline', () => {
  it('settles true and false conditions while retaining equal output references', () => {
    const { root } = createTestTree({
      type: 'object',
      properties: {
        kind: { type: 'string', default: 'a' },
      },
      anyOf: ['a', 'b'].map((kind) => ({
        controls: { active: `./kind === '${kind}'` },
        properties: { [kind]: { type: 'string', default: kind } },
      })),
    });
    loadFieldNodeAtMount(root, { kind: 'a' }, WriteOption.Overwrite);
    expect(root.emit).toEqual({ kind: 'a', a: 'a' });
    expect(root.emit).toBe(root.emit);
    writeFieldNode(root.structure!.kind, 'b', 'input', WriteOption.Overwrite);
    expect(root.emit).toEqual({ kind: 'b', b: 'b' });
    const emitted = root.emit;
    writeFieldNode(root.structure!.kind, 'b', 'input', WriteOption.Overwrite);
    expect(root.emit).toBe(emitted);
  });

  it('keeps user callbacks and repeated throws on the full evaluation path', () => {
    const callback = vi.fn(() => true);
    const { root } = createTestTree({
      type: 'object',
      properties: { kind: { type: 'string' } },
      anyOf: [
        {
          controls: { active: '@.gate()' },
          properties: { payload: { type: 'string', default: 'P' } },
        },
      ],
    });
    root.runtime.context = { gate: callback };
    loadFieldNodeAtMount(root, { kind: 'a' }, WriteOption.Overwrite);
    expect(root.emit).toEqual({ kind: 'a', payload: 'P' });
    expect(callback.mock.calls.length).toBeGreaterThan(1);
    const throwing = vi.fn(() => {
      throw new Error('gate');
    });
    root.runtime.context = { gate: throwing };
    expect(() =>
      writeFieldNode(
        root,
        { kind: 'b' },
        'callerReplace',
        WriteOption.Overwrite,
      ),
    ).toThrow();
    expect(throwing.mock.calls.length).toBeGreaterThan(1);
  });

  it('preserves another pure decision when an unrelated key changes', () => {
    const { root } = createTestTree({
      type: 'object',
      properties: {
        kind: { type: 'string' },
        toggle: { type: 'boolean' },
      },
      anyOf: [
        {
          controls: { active: "./kind === 'a'" },
          properties: { payload: { type: 'string', default: 'P' } },
        },
        {
          controls: { active: './toggle === true' },
          properties: { toggled: { type: 'string' } },
        },
      ],
    });
    loadFieldNodeAtMount(
      root,
      { kind: 'a', toggle: false },
      WriteOption.Overwrite,
    );
    writeFieldNode(
      root.structure!.toggle,
      true,
      'input',
      WriteOption.Overwrite,
    );
    expect(root.emit).toEqual({ kind: 'a', toggle: true, payload: 'P' });
  });

  it('recovers the projected value after another gate throws', () => {
    const { root } = createTestTree({
      type: 'object',
      properties: {
        kind: { type: 'string' },
        toggle: { type: 'boolean' },
      },
      anyOf: [
        {
          controls: { active: "./kind === 'a'" },
          properties: { payload: { type: 'string', default: 'P' } },
        },
        {
          controls: { active: '@.gate() && ./toggle' },
          properties: { toggled: { type: 'string' } },
        },
      ],
    });
    root.runtime.context = { gate: () => true };
    loadFieldNodeAtMount(
      root,
      { kind: 'a', toggle: false },
      WriteOption.Overwrite,
    );
    root.runtime.context = {
      gate: () => {
        throw new Error('failed settlement');
      },
    };
    expect(() =>
      writeFieldNode(
        root.structure!.toggle,
        true,
        'input',
        WriteOption.Overwrite,
      ),
    ).toThrow();
    root.runtime.context = { gate: () => true };
    writeFieldNode(
      root.structure!.toggle,
      false,
      'input',
      WriteOption.Overwrite,
    );
    expect(root.emit).toEqual({ kind: 'a', toggle: false, payload: 'P' });
  });
});
