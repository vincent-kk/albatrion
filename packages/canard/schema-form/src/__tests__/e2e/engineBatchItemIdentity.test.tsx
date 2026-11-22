import { expect, it } from 'vitest';

import { FieldNodeEventType, FieldNodeState, isArrayNode } from '../../index';
import { mountEngineForm } from './fixtures/mountEngineForm';

const create = () => {
  const changes: unknown[] = [];
  const root = mountEngineForm({
    jsonSchema: {
      type: 'object',
      properties: {
        list: { type: 'array', items: { type: 'string' } },
        flag: { type: 'boolean' },
      },
    },
    defaultValue: { list: ['a', 'b', 'c'] },
    onChange: (value) => changes.push(value),
  });
  const list = root.find('/list');
  if (!isArrayNode(list)) throw new Error('Expected array');
  const first = list.children![0];
  first.setExternalErrors([{ dataPath: first.path, keyword: 'server' }]);
  first.setState({ [FieldNodeState.Touched]: true });
  changes.length = 0;
  return { root, list, changes };
};

it.each([
  'insert',
  'remove',
  'pop',
  'push',
  'update',
  'clear',
  'relocate',
] as const)(
  'round-3: batched %s with item writes preserves sequential value, identity and state',
  (verb) => {
    const run = (batch: boolean) => {
      const { root, list } = create();
      const held = list.children![1];
      const first = list.children![0];
      const calls = () => {
        if (verb === 'insert') list.insert(0, 'n');
        if (verb === 'remove') list.remove(0);
        if (verb === 'pop') list.pop();
        if (verb === 'push') list.push('d');
        if (verb === 'update') list.update(0, 'new');
        if (verb === 'clear') list.clear();
        if (verb === 'relocate') list.insert(0, list.remove(1));
        held.setValue('B');
      };
      if (batch) root.batch(calls);
      else calls();
      return {
        value: root.value,
        heldPath: held.path,
        isHeldPresent: held.isPresent,
        firstIndex: list.children!.indexOf(first),
        heldIndex: list.children!.indexOf(held),
        items: list.children!.map((node) => ({
          value: node.value,
          errors: node.errors.map((issue) => issue.keyword),
          touched: node.isTouched,
        })),
        errors: root.globalErrors.map((issue) => issue.dataPath),
      };
    };
    expect(run(true)).toEqual(run(false));
  },
);

it('round-3: reads after an array verb see its arrangement; delivery remains at the outer batch', () => {
  const { root, list, changes } = create();
  const values: unknown[] = [];
  root.subscribe((event) => {
    if (event.type & FieldNodeEventType.UpdateValue) values.push(root.value);
  });
  root.batch(() => {
    list.remove(0);
    expect(list.value).toEqual(['b', 'c']);
    expect(values).toEqual([]);
    expect(changes).toEqual([]);
    root.batch(() => {
      list.insert(0, 'n');
      list.children![1].setValue('B');
    });
    expect(values).toEqual([]);
    expect(changes).toEqual([]);
  });
  expect(root.value).toEqual({ list: ['n', 'B', 'c'] });
  expect(values).toEqual([root.value]);
  expect(changes).toEqual([root.value]);
});
it('round-3: a throwing batch keeps an applied arrangement and emits its final value once', () => {
  const { root, list, changes } = create();
  const error = new Error('caller');
  expect(() =>
    root.batch(() => {
      list.remove(0);
      throw error;
    }),
  ).toThrow(error);
  expect(list.value).toEqual(['b', 'c']);
  expect(changes).toEqual([root.value]);
});
it('round-3: visitSubtree uses the same item identity rule as direct calls', () => {
  const run = (visit: boolean) => {
    const { root, list } = create();
    const held = list.children![1];
    const calls = () => {
      list.remove(0);
      held.setValue('B');
    };
    if (visit)
      root.visitSubtree((node) => {
        if (node === list) calls();
      });
    else calls();
    return { value: root.value, first: list.children![0] === held };
  };
  expect(run(true)).toEqual(run(false));
});

it('round-3: writing an item removed by pop cannot resurrect it inside a batch', () => {
  const run = (batch: boolean) => {
    const { root, list } = create();
    const last = list.children![2];
    const calls = () => {
      list.pop();
      last.setValue('revived');
    };
    if (batch) root.batch(calls);
    else calls();
    return root.value;
  };
  expect(run(true)).toEqual(run(false));
});

it('keeps the first previous value for a listener registered between batch array verbs', () => {
  const root = mountEngineForm({
    jsonSchema: { type: 'array', items: { type: 'number' } },
    defaultValue: [0],
  });
  if (!isArrayNode(root)) throw new Error('Expected array');
  const payloads: unknown[] = [];
  root.batch(() => {
    root.push(1);
    root.subscribe((event) => {
      if (event.type & FieldNodeEventType.UpdateValue)
        payloads.push(event.payload?.[FieldNodeEventType.UpdateValue]);
    });
    root.pop();
  });
  expect(payloads).toEqual([
    {
      previous: { value: [0], outputValue: [0] },
      current: { value: [0], outputValue: [0] },
    },
  ]);
});
