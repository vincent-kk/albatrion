import { describe, expect, it, vi } from 'vitest';

import { SetValueOption } from '../../types/value';
import { loadSchemaNodeAtMount, writeSchemaNode } from '../index';
import { createTestTree } from './fixtures/createTestTree';

describe('pure gate projection baseline', () => {
  it('settles true and false conditions while retaining equal output references', () => {
    const { root } = createTestTree({ type: 'object', properties: {
      kind: { type: 'string', default: 'a' },
    }, anyOf: ['a', 'b'].map(kind => ({ controls: { active: `./kind === '${kind}'` },
      properties: { [kind]: { type: 'string', default: kind } } })) });
    loadSchemaNodeAtMount(root, { kind: 'a' }, SetValueOption.Overwrite);
    expect(root.emit).toEqual({ kind: 'a', a: 'a' });
    expect(root.emit).toBe(root.emit);
    writeSchemaNode(root.structure!.kind, 'b', 'input', SetValueOption.Overwrite);
    expect(root.emit).toEqual({ kind: 'b', b: 'b' });
    const emitted = root.emit;
    writeSchemaNode(root.structure!.kind, 'b', 'input', SetValueOption.Overwrite);
    expect(root.emit).toBe(emitted);
  });

  it('keeps user callbacks and repeated throws on the full evaluation path', () => {
    const callback = vi.fn(() => true);
    const { root } = createTestTree({ type: 'object', properties: { kind: { type: 'string' } },
      anyOf: [{ controls: { active: '@.gate()' }, properties: { payload: { type: 'string', default: 'P' } } }] });
    root.runtime.context = { gate: callback };
    loadSchemaNodeAtMount(root, { kind: 'a' }, SetValueOption.Overwrite);
    expect(root.emit).toEqual({ kind: 'a', payload: 'P' });
    expect(callback.mock.calls.length).toBeGreaterThan(1);
    const throwing = vi.fn(() => { throw new Error('gate'); });
    root.runtime.context = { gate: throwing };
    expect(() => writeSchemaNode(root, { kind: 'b' }, 'callerReplace', SetValueOption.Overwrite)).toThrow();
    expect(throwing.mock.calls.length).toBeGreaterThan(1);
  });

  it('preserves another pure decision when an unrelated key changes', () => {
    const { root } = createTestTree({ type: 'object', properties: {
      kind: { type: 'string' }, toggle: { type: 'boolean' },
    }, anyOf: [
      { controls: { active: "./kind === 'a'" }, properties: { payload: { type: 'string', default: 'P' } } },
      { controls: { active: './toggle === true' }, properties: { toggled: { type: 'string' } } },
    ] });
    loadSchemaNodeAtMount(root, { kind: 'a', toggle: false }, SetValueOption.Overwrite);
    writeSchemaNode(root.structure!.toggle, true, 'input', SetValueOption.Overwrite);
    expect(root.emit).toEqual({ kind: 'a', toggle: true, payload: 'P' });
  });

  it('recovers the projected value after another gate throws', () => {
    const { root } = createTestTree({ type: 'object', properties: {
      kind: { type: 'string' }, toggle: { type: 'boolean' },
    }, anyOf: [
      { controls: { active: "./kind === 'a'" }, properties: { payload: { type: 'string', default: 'P' } } },
      { controls: { active: '@.gate() && ./toggle' }, properties: { toggled: { type: 'string' } } },
    ] });
    root.runtime.context = { gate: () => true };
    loadSchemaNodeAtMount(root, { kind: 'a', toggle: false }, SetValueOption.Overwrite);
    root.runtime.context = { gate: () => { throw new Error('failed settlement'); } };
    expect(() => writeSchemaNode(root.structure!.toggle, true, 'input', SetValueOption.Overwrite)).toThrow();
    root.runtime.context = { gate: () => true };
    writeSchemaNode(root.structure!.toggle, false, 'input', SetValueOption.Overwrite);
    expect(root.emit).toEqual({ kind: 'a', toggle: false, payload: 'P' });
  });
});
