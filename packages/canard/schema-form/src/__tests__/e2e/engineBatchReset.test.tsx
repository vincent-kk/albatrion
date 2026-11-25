import { expect, it, vi } from 'vitest';

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

it('refuses a subtree reset whose earlier writes make the field inactive and keeps the write inside it', () => {
  const run = (batch: boolean) => {
    const onError = vi.fn();
    const root = mountEngineForm({
      jsonSchema: {
        type: 'object',
        properties: {
          on: { type: 'boolean' },
          o: {
            type: 'object',
            controls: { active: '/on === true' },
            properties: { x: { type: 'string' } },
          },
        },
      },
      defaultValue: { on: true, o: { x: 'loaded' } },
      onError,
    });
    const o = root.find('/o')!;
    const calls = () => {
      o.setValue({ x: 'inside' });
      root.find('/on')!.setValue(false);
      o.resetSubtree();
    };
    if (batch) root.batch(calls);
    else calls();
    const settled = {
      value: root.value,
      retained: root.inactiveValues,
      errors: onError.mock.calls.length,
    };
    root.find('/on')!.setValue(true);
    return { ...settled, reactivated: root.value };
  };
  expect(run(true)).toEqual({
    value: { on: false },
    retained: [{ path: '/o/x', value: 'inside' }],
    errors: 0,
    reactivated: { on: true, o: { x: 'inside' } },
  });
  expect(run(true)).toEqual(run(false));
});

it('refuses a subtree reset whose earlier writes remove the array item', () => {
  const run = (batch: boolean) => {
    const onError = vi.fn();
    const root = mountEngineForm({
      jsonSchema: {
        type: 'object',
        properties: { list: { type: 'array', items: { type: 'string' } } },
      },
      defaultValue: { list: ['a', 'b'] },
      onError,
    });
    const item = root.find('/list/1')!;
    const calls = () => {
      item.setValue('inside');
      root.find('/list')!.setValue(['a']);
      item.resetSubtree();
    };
    if (batch) root.batch(calls);
    else calls();
    return {
      value: root.value,
      isActive: item.isActive,
      errors: onError.mock.calls.length,
    };
  };
  expect(run(true)).toEqual({
    value: { list: ['a'] },
    isActive: false,
    errors: 0,
  });
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
