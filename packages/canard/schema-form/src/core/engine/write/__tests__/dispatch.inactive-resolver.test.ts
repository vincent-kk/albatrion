import { expect, it, vi } from 'vitest';

import { makeFieldNodeTree } from '@/schema-form/core/__tests__/makeFieldNodeTree';
import { FormErrorCode, FormWarningCode } from '@/schema-form/errors';

it.each(['declaration', 'listener'])(
  'refuses value, array, batch and reset writes in a %s',
  (source) => {
    const report = vi.fn();
    const batch = vi.fn();
    let attempts = (): void => {};
    const resolver = () => {
      attempts();
      return 'retained';
    };
    const { root, runtime } = makeFieldNodeTree(
      {
        type: 'object',
        properties: {
          open: { type: 'boolean' },
          stable: { type: 'string' },
          list: { type: 'array', items: { type: 'string' } },
          value: {
            type: 'string',
            controls: {
              active: '../open',
              ...(source === 'declaration' ? { inactiveValue: resolver } : {}),
            },
          },
        },
      },
      { errorReporter: { hasConsumer: () => true, report } },
    );
    root.setValue({
      open: true,
      stable: 'unchanged',
      list: ['first'],
      value: 'before',
    });
    const value = root.find('/value')!;
    const list = root.find('/list')!;
    if (list.type !== 'array') throw new Error('Expected array');
    const commit = Reflect.get(runtime, 'commitNumber');
    attempts = () => {
      value.setValue('illegal');
      root.find('/stable')!.setValue('illegal');
      list.push('illegal');
      list.pop();
      list.insert(0, 'illegal');
      list.remove(0);
      list.update(0, 'illegal');
      list.clear();
      root.batch(batch);
      value.resetSubtree();
      root.resetSubtree();
    };
    if (source === 'listener') value.onInactive(resolver);
    root.find('/open')!.setValue(false);
    expect(batch).not.toHaveBeenCalled();
    expect(root.value).toEqual({
      open: false,
      stable: 'unchanged',
      list: ['first'],
    });
    expect(root.inactiveValues).toEqual([
      { path: '/value', value: 'retained' },
    ]);
    expect(Reflect.get(runtime, 'commitNumber')).toBe(commit + 1);
    expect(
      report.mock.calls.filter(
        ([record]) => record.code === FormWarningCode.WriteInInactiveResolver,
      ),
    ).toHaveLength(11);
  },
);

it.each(['declaration', 'listener'])(
  'records a throwing %s after preserving the committed exit',
  (source) => {
    const report = vi.fn();
    const cause = new Error('inactive resolver failed');
    const resolver = () => {
      throw cause;
    };
    const { root } = makeFieldNodeTree(
      {
        type: 'object',
        properties: {
          open: { type: 'boolean' },
          value: {
            type: 'string',
            controls: {
              active: '../open',
              ...(source === 'declaration' ? { inactiveValue: resolver } : {}),
            },
          },
        },
      },
      { errorReporter: { hasConsumer: () => true, report } },
    );
    root.setValue({ open: true, value: 'before' });
    if (source === 'listener') root.find('/value')!.onInactive(resolver);
    expect(() => root.find('/open')!.setValue(false)).toThrow(
      expect.objectContaining({ code: FormErrorCode.ExpressionThrew }),
    );
    expect(root.value).toEqual({ open: false });
    expect(root.find('/value')).toBeNull();
    expect(root.inactiveValues).toEqual([{ path: '/value', value: 'before' }]);
    expect(root.diagnostics).toMatchObject({
      status: 'degraded',
      cause: 'expression',
    });
    expect(report).toHaveBeenCalledWith(
      expect.objectContaining({
        code: FormErrorCode.ExpressionThrew,
        details: expect.objectContaining({ cause, path: '/value' }),
      }),
    );
  },
);

it('restores normal writes after resolver completion', () => {
  const { root } = makeFieldNodeTree({
    type: 'object',
    properties: {
      open: { type: 'boolean' },
      stable: { type: 'string' },
      value: {
        type: 'string',
        controls: { active: '../open', inactiveValue: () => 'retained' },
      },
    },
  });
  root.setValue({ open: true, stable: 'before', value: 'before' });
  root.find('/open')!.setValue(false);
  root.find('/stable')!.setValue('after');
  expect(root.find('/stable')!.value).toBe('after');
});
