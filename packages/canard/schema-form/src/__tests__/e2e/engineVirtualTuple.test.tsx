import { expect, it } from 'vitest';

import { SetValueOption } from '../../index';
import { mountEngineForm } from './fixtures/mountEngineForm';

it('projects baseline values, divergence and retained storage in declared tuple order', () => {
  const root = mountEngineForm({
    jsonSchema: {
      type: 'object',
      properties: {
        on: { type: 'boolean' },
        a: { type: 'string' },
        b: { type: 'string', controls: { active: '/on === true' } },
      },
      options: { virtual: { pair: { fields: ['b', 'a'] } } },
    },
    defaultValue: { on: true, a: 'A', b: 'B' },
  });
  const pair = root.find('/pair')!;
  expect(pair.value).toEqual(['B', 'A']);
  expect(pair.defaultValue).toEqual(['B', 'A']);
  expect(pair.isDivergent).toBe(false);
  root.find('/b')!.setValue('edited');
  expect(pair.isDivergent).toBe(true);
  root.find('/on')!.setValue(false);
  expect(pair.value).toEqual([undefined, 'A']);
  expect(pair.defaultValue).toEqual(['B', 'A']);
  expect(pair.inactiveValues).toEqual([{ path: '/b', value: 'edited' }]);
  pair.setValue(undefined);
  expect(root.find('/a')!.value).toBeUndefined();
  expect(root.inactiveValues).toEqual([{ path: '/b', value: 'edited' }]);
  root.find('/on')!.setValue(true);
  expect(pair.value).toEqual(['edited', undefined]);
  pair.resetSubtree();
  expect(pair.value).toEqual(['B', 'A']);
});

it.each([false, true])(
  'keeps an empty virtual tuple without storage effects (batched=%s)',
  (batched) => {
    const root = mountEngineForm({
      jsonSchema: {
        type: 'object',
        properties: { a: { type: 'string' } },
        options: { virtual: { empty: { fields: [] } } },
      },
      defaultValue: { a: 'kept' },
    });
    const empty = root.find('/empty')!;
    expect(empty.value).toEqual([]);
    const writes = () => {
      empty.setValue([]);
      empty.setValue([], SetValueOption.Merge);
      empty.resetSubtree();
    };
    if (batched) root.batch(writes);
    else writes();
    expect(empty.value).toEqual([]);
    expect(root.value).toEqual({ a: 'kept' });
  },
);
