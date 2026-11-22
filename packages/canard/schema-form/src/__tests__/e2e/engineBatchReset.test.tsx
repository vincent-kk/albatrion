import { expect, it } from 'vitest';

import { isArrayNode } from '../../index';
import { SetValueOption } from '../../index';
import { mountEngineForm } from './fixtures/mountEngineForm';

it.each([false, true])(
  'consumes a merge getter once before a subtree reset (per-call settlement=%s)',
  (perCall) => {
    const root = mountEngineForm({
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
      root
        .find('/obj')!
        .setValue(
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

it('runs a virtual mark before a constituent reset when its other member is inactive', () => {
  const root = mountEngineForm({
    jsonSchema: {
      type: 'object',
      properties: {
        on: { type: 'boolean' },
        a: {
          type: 'string',
          controls: {
            injectTo: (value) =>
              value === 'marked' ? { '../c': 'reacted' } : {},
          },
        },
        b: { type: 'string', controls: { active: '/on === true' } },
        c: { type: 'string' },
      },
      options: { virtual: { pair: { fields: ['a', 'b'] } } },
    },
    defaultValue: { a: 'base', c: 'base', on: false },
  });
  const a = root.find('/a')!;
  expect(root.find('/b')).toBeNull();

  root.batch(() => {
    root.find('/pair')!.setValue(['marked', undefined]);
    a.resetSubtree();
  });

  expect(root.value).toEqual({ a: 'base', c: 'reacted', on: false });
});

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
