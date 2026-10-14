import { describe, expect, it } from 'vitest';

import { type FieldNode, ValidationMode, isArrayNode } from '../index';
import { nodeFromJSONSchema } from '../surface/utils/nodeFromJSONSchema';

const createRoot = (): FieldNode =>
  nodeFromJSONSchema({
    jsonSchema: {
      type: 'object',
      properties: {
        list: {
          type: 'array',
          items: {
            type: 'object',
            properties: { field: { type: 'string' } },
          },
        },
      },
    },
    defaultValue: { list: [{ field: 'a' }, { field: 'b' }] },
    validationMode: ValidationMode.None,
  });

describe('external errors of removed array rows (208C-01)', () => {
  it('drops a removed row field contribution from the root list', () => {
    const root = createRoot();
    const list = root.find('/list')!;
    const row2 = { dataPath: '/list/1/field', message: 'row2' };
    const row1 = { dataPath: '/list/0/field', message: 'row1' };
    root.find('/list/0/field')!.setExternalErrors([row1]);
    root.find('/list/1/field')!.setExternalErrors([row2]);
    expect(root.errors).toEqual([row1, row2]);
    if (!isArrayNode(list)) throw new Error('list is not an array node');
    list.remove(1);
    expect(root.errors).toEqual([row1]);
  });

  it('keeps the list clean when the removed row was the only contributor', () => {
    const root = createRoot();
    const list = root.find('/list')!;
    const row2 = { dataPath: '/list/1/field', message: 'row2' };
    root.find('/list/1/field')!.setExternalErrors([row2]);
    if (!isArrayNode(list)) throw new Error('list is not an array node');
    list.remove(1);
    expect(root.errors).toEqual([]);
  });
});
