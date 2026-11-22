import { expect, it } from 'vitest';

import { nodeFromJSONSchema } from '@/schema-form/__tests__/fixtures/nodeFromJSONSchema';
import { isArrayNode } from '@/schema-form/core/surface';

it('restores equal nested outputs without restoring removed item identities', () => {
  const changes: unknown[] = [];
  const schema = {
    type: 'object',
    properties: {
      list: {
        type: 'array',
        items: { type: 'object', properties: { value: { type: 'string' } } },
      },
    },
  } as const;
  const root = nodeFromJSONSchema({
    jsonSchema: schema,
    defaultValue: { list: [{ value: 'kept' }] },
    onChange: (value) => changes.push(value),
  });
  const list = root.find('/list');
  if (!isArrayNode(list)) throw new Error('Expected array');
  const initial = root.outputValue;
  const initialList = list.outputValue;
  const initialItem = list.children?.[0].outputValue;
  const oldItem = list.children?.[0];
  changes.length = 0;
  root.batch(() => {
    list.remove(0);
    list.push({ value: 'kept' });
  });
  expect(root.outputValue).toBe(initial);
  expect(list.outputValue).toBe(initialList);
  expect(list.children?.[0]).not.toBe(oldItem);
  expect(list.children?.[0].outputValue).toBe(initialItem);
  expect(changes).toEqual([]);
});
it('keeps omitted prototype-like field outputs absent while reconciling the parent', () => {
  const schema = {
    type: 'object',
    properties: {
      constructor: { type: 'string' },
      list: { type: 'array', items: { type: 'number' } },
    },
  } as const;
  const root = nodeFromJSONSchema({
    jsonSchema: schema,
    defaultValue: { constructor: undefined, list: [1] },
  });
  const list = root.find('/list');
  if (!isArrayNode(list)) throw new Error('Expected array');
  expect(root.find('/constructor')?.outputValue).toBeUndefined();
  root.batch(() => {
    list.push(2);
    list.pop();
  });
  expect(root.find('/constructor')?.outputValue).toBeUndefined();
});
