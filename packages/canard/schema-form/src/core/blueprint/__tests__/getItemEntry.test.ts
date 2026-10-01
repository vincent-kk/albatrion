import { describe, expect, it } from 'vitest';

import { blueprint, getItemEntry } from '../index';

// filid:contract array-limits-and-slots
describe('getItemEntry', () => {
  it('NODE-052 chooses prefixItems before items by slot', () => {
    const template = blueprint({
      type: 'object',
      properties: {
        arr: {
          type: 'array',
          prefixItems: [{ type: 'string' }],
          items: { type: 'number' },
        },
      },
    }).root.childEntries[0].node;
    expect(getItemEntry(template, 0)).toMatchObject({
      name: '0',
      hostPath: '/arr',
      node: { kind: 'string', path: '/arr/0' },
    });
    expect(getItemEntry(template, 1)).toMatchObject({
      name: '1',
      hostPath: '/arr',
      node: { kind: 'number', path: '/arr/*' },
    });
  });

  it('NODE-052 reuses the same frozen entry for one template and slot', () => {
    const template = blueprint({ type: 'array', items: { type: 'string' } }).root;
    const first = getItemEntry(template, 2)!;
    expect(getItemEntry(template, 2)).toBe(first);
    expect(getItemEntry(template, 3)).not.toBe(first);
    expect(Object.isFrozen(first)).toBe(true);
    expect(Object.isFrozen(first.declarations)).toBe(true);
    expect(Object.isFrozen(first.declarations[0])).toBe(true);
  });

  it('35C-08 keeps the template gate objects so gate-keyed maps still match', () => {
    const template = blueprint({
      type: 'array',
      items: {
        type: 'object',
        properties: { a: { type: 'string' } },
        controls: { active: '../0/a === "x"' },
      },
    }).root;
    const entry = getItemEntry(template, 0)!;
    const gates = template.item!.declarations.flatMap((declaration) => declaration.gates);
    expect(gates.length).toBeGreaterThan(0);
    entry.declarations.forEach((declaration, index) =>
      declaration.gates.forEach((gate, gateIndex) =>
        expect(gate).toBe(template.item!.declarations[index].gates[gateIndex])));
  });

  it('NODE-052 has no entry for a blueprint-less slot', () => {
    const template = blueprint({
      type: 'array',
      prefixItems: [{ type: 'string' }],
      items: false,
    }).root;
    expect(getItemEntry(template, 1)).toBeUndefined();
    expect(getItemEntry(template, 1)).toBeUndefined();
  });

  it('35C-08 keeps declaration and gate paths at the template origin', () => {
    const template = blueprint({
      type: 'object',
      properties: {
        arr: {
          type: 'array',
          items: { type: 'string', controls: { active: '../enabled' } },
        },
      },
    }).root.childEntries[0].node;
    const entry = getItemEntry(template, 3)!;
    expect(entry.declarations[0]).toMatchObject({
      name: '3',
      path: '/arr/*',
      hostPath: '/arr',
      schemaPath: '#/properties/arr/items',
    });
    expect(entry.declarations[0].gates[0].hostPath).toBe('/arr/*');
  });

  it('35C-08 rebinds a shared item reference to its array declaration', () => {
    const root = blueprint({
      type: 'object',
      $defs: { value: { type: 'string' } },
      properties: {
        a: { type: 'array', items: { $ref: '#/$defs/value' } },
        b: { type: 'array', items: { $ref: '#/$defs/value' } },
      },
    }).root;
    const first = getItemEntry(root.childEntries[0].node, 0)!;
    const second = getItemEntry(root.childEntries[1].node, 0)!;
    expect(first.node).toBe(second.node);
    expect(second.declarations[0]).toMatchObject({
      name: '0',
      path: first.node.path,
      hostPath: '/b',
      schemaPath: '#/properties/b/items',
    });
  });
});
