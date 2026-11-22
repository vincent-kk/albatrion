import { expect, it } from 'vitest';

import { nodeFromJSONSchema } from '@/schema-form/__tests__/fixtures/nodeFromJSONSchema';
import { isArrayNode } from '@/schema-form/core/surface';

import { WriteOption as SetValueOption } from '../../types/value';

it.each([false, true])(
  'consumes a merge getter once before a subtree reset (per-call settlement=%s)',
  (perCall) => {
    const root = nodeFromJSONSchema({
      jsonSchema: {
        type: 'object',
        properties: {
          obj: {
            type: 'object',
            properties: { x: { type: 'number' }, y: { type: 'number' } },
          },
          reset: { type: 'number' },
          sibling: { type: 'number' },
          copy: { type: 'number', controls: { derived: '../obj/x * 2' } },
        },
      },
      defaultValue: { obj: { x: 0, y: 2 }, reset: 0, sibling: 0, copy: 0 },
      disableAutomaticWrites: true,
    });
    let reads = 0;
    const incoming = {
      get x() {
        return ++reads;
      },
    };
    const reset = root.find('/reset')!;
    root.batch(() => {
      root.find('/obj')!.setValue(
        incoming,
        perCall
          ? SetValueOption.Merge | SetValueOption.EnableAutomaticWrites
          : SetValueOption.Merge,
      );
      if (perCall) root.find('/sibling')!.setValue(2);
      reset.setValue(9);
      reset.resetSubtree();
    });

    expect(reads).toBe(1);
    expect(root.value).toEqual({
      obj: { x: 1, y: 2 },
      reset: 0,
      sibling: perCall ? 2 : 0,
      copy: perCall ? 2 : 0,
    });
  },
);

it('round-3: parent write followed by subtree reset equals sequential calls', () => {
  const run = (batch: boolean) => {
    const root = nodeFromJSONSchema({
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
it('round-3: array push then edited-item reset equals sequential calls', () => {
  const run = (batch: boolean) => {
    const root = nodeFromJSONSchema({
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
