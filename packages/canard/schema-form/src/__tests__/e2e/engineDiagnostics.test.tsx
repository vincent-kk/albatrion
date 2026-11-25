import { createRef } from 'react';

import { act, render } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import {
  type FieldNode,
  Form,
  FormErrorCode,
  type FormHandle,
} from '../../index';
import { mountEngineForm } from './fixtures/mountEngineForm';

afterEach(() => vi.unstubAllGlobals());

it.each([300, 1000])(
  'reports recursive shape divergence while loading depth %s',
  (depth) => {
    type Item = { value: string; children?: Item[] };
    let value: Item = { value: 'leaf' };
    for (let index = 0; index < depth; index++)
      value = { value: 'parent', children: [value] };
    const onError = vi.fn();
    const reportError = vi.fn();
    vi.stubGlobal('reportError', reportError);
    mountEngineForm({
      jsonSchema: {
        $defs: {
          item: {
            type: 'object',
            properties: {
              value: { type: 'string' },
              children: { type: 'array', items: { $ref: '#/$defs/item' } },
            },
          },
        },
        $ref: '#/$defs/item',
      },
      defaultValue: value,
      onError,
    });
    expect(onError).toHaveBeenCalledWith(
      expect.objectContaining({ code: FormErrorCode.RecursiveShapeDiverged }),
    );
    expect(reportError).toHaveBeenCalledWith(
      expect.objectContaining({ code: FormErrorCode.RecursiveShapeDiverged }),
    );
  },
);

const nestedLists = (levels: number): unknown[] => {
  let value: unknown[] = [];
  for (let level = 1; level < levels; level++) value = [value];
  return value;
};
const deepestDepth = (root: FieldNode): number => {
  let deepest = 0;
  root.visitSubtree((node) => {
    deepest = Math.max(deepest, node.depth);
  });
  return deepest;
};

it.each([
  ['loads', 256, undefined],
  ['loads', 257, FormErrorCode.RecursiveShapeDiverged],
  ['activates', 256, undefined],
  ['activates', 257, FormErrorCode.RecursiveShapeDiverged],
] as const)(
  '%s a value whose deepest node would sit %i levels below the root with error %s',
  (path, deepest, code) => {
    const onError = vi.fn();
    vi.stubGlobal('reportError', vi.fn());
    const $defs = {
      list: { type: 'array', items: { $ref: '#/$defs/list' } },
    } as const;
    const root =
      path === 'loads'
        ? mountEngineForm({
            jsonSchema: { $defs, $ref: '#/$defs/list' },
            defaultValue: nestedLists(deepest + 1),
            onError,
          })
        : mountEngineForm({
            jsonSchema: {
              $defs,
              type: 'object',
              properties: {
                on: { type: 'boolean' },
                list: {
                  $ref: '#/$defs/list',
                  controls: { active: '../on === true' },
                },
              },
            },
            defaultValue: { on: false, list: nestedLists(deepest) },
            onError,
          });
    if (path === 'activates') {
      expect(root.find('/list')).toBeNull();
      let thrown: unknown;
      try {
        act(() => root.find('/on')!.setValue(true));
      } catch (error) {
        thrown = error;
      }
      expect(thrown).toEqual(
        code ? expect.objectContaining({ code }) : undefined,
      );
    }
    expect(onError.mock.calls.map(([record]) => record.code)).toEqual(
      code ? [code] : [],
    );
    expect(deepestDepth(root)).toBe(code ? deepest - 1 : deepest);
  },
);

it('keeps a failed collection expression degraded until a form reset', () => {
  const handle = createRef<FormHandle>();
  render(
    <Form
      ref={handle}
      jsonSchema={{
        type: 'object',
        properties: {
          items: {
            type: 'array',
            items: { type: 'number' },
            options: { omitEmpty: true },
          },
          count: { type: 'number', controls: { derived: '(../items).length' } },
          other: { type: 'string' },
        },
      }}
      defaultValue={{ items: [1, 2] }}
    >
      {() => null}
    </Form>,
  );
  const root = handle.current!.node!;
  expect(root.find('/count')!.value).toBe(2);
  expect(() => act(() => root.find('/items')!.setValue([]))).toThrow();
  expect(root.diagnostics.status).toBe('degraded');
  act(() => root.find('/other')!.setValue('unrelated'));
  expect(root.diagnostics.status).toBe('degraded');
  act(() => handle.current!.reset());
  expect(root.diagnostics.status).toBe('stable');
  expect(root.find('/count')!.value).toBe(2);
});
