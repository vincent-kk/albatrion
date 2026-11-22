import { createRef } from 'react';

import { act, render } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import { Form, FormErrorCode, type FormHandle } from '../../index';
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
