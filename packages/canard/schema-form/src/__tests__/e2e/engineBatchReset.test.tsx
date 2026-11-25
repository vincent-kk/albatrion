import { expect, it } from 'vitest';

import { isArrayNode } from '../../index';
import { SetValueOption } from '../../index';
import { mountEngineForm } from './fixtures/mountEngineForm';

it('parent write followed by subtree reset equals sequential calls', () => {
  const run = (batch: boolean) => {
    const root = mountEngineForm({
      jsonSchema: {
        type: 'object',
        properties: {
          o: { type: 'object', properties: { a: { type: 'string' } } },
          s: { type: 'string' },
        },
      },
      defaultValue: { o: { a: 'loaded' }, s: 'loaded' },
    });
    const o = root.find('/o')!;
    let inside: unknown;
    const calls = () => {
      root.setValue({ o: { a: 'server' }, s: 'server' });
      o.resetSubtree();
      inside = o.value;
    };
    if (batch) root.batch(calls);
    else calls();
    return { inside, value: root.value };
  };
  expect(run(true)).toEqual(run(false));
});
it('array push then edited-item reset equals sequential calls', () => {
  const run = (batch: boolean) => {
    const root = mountEngineForm({
      jsonSchema: { type: 'array', items: { type: 'string' } },
      defaultValue: ['a', 'b'],
    });
    if (!isArrayNode(root)) throw new Error('Expected array');
    const item = root.children![0];
    item.setValue('EDITED');
    const calls = () => {
      root.push('c');
      item.resetSubtree();
    };
    if (batch) root.batch(calls);
    else calls();
    return root.value;
  };
  expect(run(true)).toEqual(run(false));
});

it('keeps a non-enumerable declared Merge value before a disjoint subtree reset', () => {
  const root = mountEngineForm({
    jsonSchema: {
      type: 'object',
      properties: {
        box: { type: 'object', properties: { n: { type: 'number' } } },
        reset: { type: 'number' },
      },
    },
    defaultValue: { box: { n: 1 }, reset: 0 },
  });
  const reset = root.find('/reset')!;
  root.batch(() => {
    root
      .find('/box')!
      .setValue(
        Object.defineProperty({}, 'n', { value: '5' }),
        SetValueOption.Merge,
      );
    reset.setValue(9);
    reset.resetSubtree();
  });
  expect(root.value).toEqual({ box: { n: 5 }, reset: 0 });
});
