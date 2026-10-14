import { describe, expect, it } from 'vitest';

import { isTestFieldNode } from '@/schema-form/core/__tests__/fixtures/testFieldNode';
import { makeFieldNodeTree } from '@/schema-form/core/__tests__/makeFieldNodeTree';
import type { ArrayNode } from '@/schema-form/core/surface';

// filid:contract derive-rank
describe('array item derivation', () => {
  it('35C-08 SETTLE-017 derives each item from its own sibling and new path', () => {
    const { root } = makeFieldNodeTree({
      type: 'array',
      items: {
        type: 'object',
        properties: {
          source: { type: 'string' },
          target: { type: 'string', controls: { derived: '../source' } },
        },
      },
    });
    if (!isTestFieldNode(root)) throw new Error('Expected a runtime FieldNode');
    const array = root as ArrayNode;
    root.setValue([{ source: 'A' }, { source: 'B' }]);
    expect(root.value).toEqual([
      { source: 'A', target: 'A' },
      { source: 'B', target: 'B' },
    ]);
    root.find('/1/source')?.setValue('C');
    expect(root.find('/1/target')?.value).toBe('C');
    expect(root.find('/0/target')?.value).toBe('A');
    array.remove(0);
    root.find('/0/source')?.setValue('D');
    expect(root.find('/0/target')?.value).toBe('D');
    array.push({ source: 'E' });
    expect(root.find('/1/target')?.value).toBe('E');
  });

  it('35C-08 WRITE-028 unsets only the item whose rule turns true', () => {
    const { root } = makeFieldNodeTree({
      type: 'array',
      items: {
        type: 'object',
        properties: {
          clear: { type: 'boolean' },
          target: { type: 'string', controls: { unsetValue: '../clear' } },
        },
      },
    });
    root.setValue([
      { clear: false, target: 'A' },
      { clear: false, target: 'B' },
    ]);
    root.find('/1/clear')?.setValue(true);
    expect(root.find('/0/target')?.value).toBe('A');
    expect(root.find('/1/target')?.value).toBeUndefined();
  });

  it('35C-08 CONTROLS-073 resolves fields derived targets per item', () => {
    const { root } = makeFieldNodeTree({
      type: 'array',
      items: {
        type: 'object',
        controls: {
          fields: [{ targets: ['target'], controls: { derived: './source' } }],
        },
        properties: {
          source: { type: 'string' },
          target: { type: 'string' },
        },
      },
    });
    root.setValue([{ source: 'A' }, { source: 'B' }]);
    expect(root.find('/0/target')?.value).toBe('A');
    expect(root.find('/1/target')?.value).toBe('B');
    root.find('/0/source')?.setValue('C');
    expect(root.find('/0/target')?.value).toBe('C');
    expect(root.find('/1/target')?.value).toBe('B');
  });

  it('35C-08 CONTROLS-079 resolves injectTo targets through array slots', () => {
    const { root } = makeFieldNodeTree({
      type: 'array',
      items: {
        type: 'object',
        properties: {
          source: {
            type: 'string',
            controls: {
              injectTo: (value: unknown) => ({ '../target': value }),
            },
          },
          target: { type: 'string' },
        },
      },
    });
    root.setValue([{ source: 'A' }, { source: 'B' }]);
    expect(root.find('/0/target')?.value).toBe('A');
    expect(root.find('/1/target')?.value).toBe('B');
  });
});
