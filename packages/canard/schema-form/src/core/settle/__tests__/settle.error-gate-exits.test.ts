import { describe, expect, it, vi } from 'vitest';

import type { BlueprintSchema } from '../../blueprint';
import { SetValueOption } from '../../types/value';
import { loadSchemaNodeAtMount, writeSchemaNode } from '../index';
import { createTestTree } from './fixtures/createTestTree';

// filid:contract settle-gates
describe('throwing gate exit isolation', () => {
  it('SETTLE-017 active gates do not search the expression array per sibling', () => {
    const properties: Record<string, BlueprintSchema> = {
      source: { type: 'string' },
    };
    for (let index = 0; index < 64; index++)
      properties[`child${index}`] = { type: 'string', controls: {
        active: '../source !== "off"',
      } };
    const { root, blueprint } = createTestTree({ type: 'object', properties });
    const find = vi.spyOn(Array.prototype, 'find');
    try {
      loadSchemaNodeAtMount(root, { source: 'on' }, SetValueOption.Overwrite);
      expect(find.mock.contexts.filter((target) =>
        target === blueprint.expressions)).toHaveLength(0);
    } finally {
      find.mockRestore();
    }
  });

  it('ERROR-125 throwing ancestor gate preserves an earlier latent child exit', () => {
    const { root } = createTestTree({ type: 'object', properties: {
      k: { type: 'boolean' }, z: { type: 'string' },
      h: { type: 'object', controls: {
        active: '@.gate()', unsetOnInactive: true,
      }, properties: {
        d: { type: 'string', controls: { active: '../../k' } },
        e: { type: 'string' },
      } },
    } });
    root.runtime.context = { gate: () => true };
    loadSchemaNodeAtMount(root, { k: true, h: { d: 'D', e: 'E' } },
      SetValueOption.Overwrite);
    writeSchemaNode(root.structure!.k, false, 'input', SetValueOption.Overwrite);
    const latentKey = JSON.stringify(['/h/d', 'string']);
    expect(root.runtime.latentRaw.get(latentKey)).toBe('D');
    root.runtime.context = { gate: () => { throw new Error('gate'); } };
    expect(() => writeSchemaNode(root, { z: 'go' }, 'callerPartial',
      SetValueOption.Merge)).toThrow('Gate evaluation failed');
    expect(root.structure?.h).toBeUndefined();
    expect(root.runtime.latentRaw.get(latentKey)).toBe('D');
  });

  it('ERROR-125 throwing gate preserves its exit while another clears and derive runs', () => {
    const { root } = createTestTree({ type: 'object', properties: {
      flag: { type: 'boolean' }, source: { type: 'string' },
      bad: { type: 'object', properties: {
        child: { type: 'string' },
      }, controls: {
        active: '@.gate()', unsetOnInactive: true,
      } },
      other: { type: 'string', controls: {
        active: '../flag', unsetOnInactive: true,
      } },
      target: { type: 'string', controls: { derived: '../source' } },
    } });
    root.runtime.context = { gate: () => true };
    loadSchemaNodeAtMount(root, { flag: true, source: 'A', bad: { child: 'B' },
      other: 'O' }, SetValueOption.Overwrite);
    root.runtime.context = { gate: () => { throw new Error('gate'); } };
    expect(() => writeSchemaNode(root, { flag: false, source: 'C' },
      'callerPartial', SetValueOption.Merge)).toThrow('Gate evaluation failed');
    expect(root.structure?.bad).toBeUndefined();
    expect(root.structure?.other).toBeUndefined();
    expect(root.runtime.latentRaw.get(JSON.stringify(['/bad/child', 'string'])))
      .toBe('B');
    expect(root.runtime.latentRaw.has(JSON.stringify(['/other', 'string'])))
      .toBe(false);
    expect(root.structure?.target?.raw).toBe('C');
  });
});
