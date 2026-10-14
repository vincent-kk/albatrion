import { describe, expect, it } from 'vitest';

import { blueprint } from '../index';

// filid:contract array-limits-and-slots
describe('legacy tuple additionalItems', () => {
  it('36C-02 compiles a schema additionalItems as the tail item template', () => {
    const node = blueprint({
      type: 'array',
      items: [{ type: 'string' }],
      additionalItems: { type: 'number' },
    }).root;
    expect(node.prefixItems?.[0].kind).toBe('string');
    expect(node.item).toMatchObject({
      kind: 'number',
      path: '/*',
      schemaPath: '#/additionalItems',
    });
  });

  it.each([false, true, undefined])(
    '36C-02 leaves the tail without a blueprint for additionalItems %s',
    (additionalItems) => {
      const node = blueprint({
        type: 'array',
        items: [{ type: 'string' }],
        additionalItems,
      }).root;
      expect(node.prefixItems?.[0].kind).toBe('string');
      expect(node.item).toBeUndefined();
    },
  );
});
