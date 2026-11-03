import { createRef } from 'react';

import { act, render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import {
  Form,
  FormErrorCode,
  type FormProps,
  type FormHandle,
  type JSONSchema,
  ValidationMode,
  isJSONSchemaError,
} from '@/schema-form';

import { observeErrorSink } from '../helpers/observeErrorSink';
import { renderForm } from '../renderForm';

describe('object inference around a discriminator', () => {
  it('O1 infers an untyped object union without a discriminator and mounts all branches', async () => {
    const form = await renderForm(
      {
        oneOf: [
          {
            type: 'object',
            properties: { first: { type: 'string', default: 'first' } },
          },
          {
            type: 'object',
            properties: { second: { type: 'number', default: 2 } },
          },
        ],
      },
      { validationMode: ValidationMode.None },
    );
    expect(form.handle.node?.type).toBe('object');
    expect(form.exists('/first')).toBe(true);
    expect(form.exists('/second')).toBe(true);
    expect(form.getValue()).toEqual({ first: 'first', second: 2 });
    expect(form.errorRecords()).toEqual([]);
    form.unmount();
  });

  it('O2 reports UNKNOWN_JSON_SCHEMA through onError and the fallback until an explicit object host is supplied', async () => {
    const sink = observeErrorSink();
    const ref = createRef<FormHandle>();
    const records: Parameters<NonNullable<FormProps['onError']>>[0][] = [];
    const runtime: JSONSchema = JSON.parse(
      '{"controls":{"discriminator":"kind"},"oneOf":[{"type":"object","properties":{"kind":{"type":"string","const":"a"},"first":{"type":"string","default":"first"}}}]}',
    );
    const view = render(
      <Form
        key="untyped"
        ref={ref}
        jsonSchema={runtime}
        defaultValue={{ kind: 'a' }}
        validationMode={ValidationMode.None}
        onError={(record) => records.push(record)}
      />,
    );
    expect(view.container.textContent).toContain(
      'Unable to load form.',
    );
    const failure = records.find(
      ({ code }) => code === FormErrorCode.UnknownJsonSchema,
    );
    expect(failure).toMatchObject({
      code: FormErrorCode.UnknownJsonSchema,
      level: 'error',
      origin: 'load',
      details: { schemaPath: '#' },
    });
    expect(isJSONSchemaError(failure?.error)).toBe(true);
    expect(sink.errors()).toContain(failure?.error);
    const fixed: JSONSchema = { ...runtime, type: 'object' };
    view.rerender(
      <Form
        key="typed"
        ref={ref}
        jsonSchema={fixed}
        defaultValue={{ kind: 'a' }}
        validationMode={ValidationMode.None}
        onError={(record) => records.push(record)}
      />,
    );
    await act(async () => {
      await Promise.resolve();
    });
    expect(view.container.querySelector('[data-path="/first"]')).not.toBeNull();
    expect(ref.current?.getValue()).toEqual({ kind: 'a', first: 'first' });
    expect(records.filter(({ level }) => level === 'error')).toHaveLength(1);
    view.unmount();
    sink.cleanup();
  });

  it.each(['allOf', '$ref'])(
    'O3 uses a statically object host declared through %s at run time',
    async (source) => {
      const runtime: JSONSchema = JSON.parse(
        JSON.stringify({
          ...(source === 'allOf'
            ? { allOf: [{ type: 'object' }] }
            : { $ref: '#/$defs/host', $defs: { host: { type: 'object' } } }),
          properties: { kind: { type: 'string', enum: ['a', 'b'] } },
          controls: { discriminator: 'kind' },
          oneOf: [
            {
              properties: {
                kind: { const: 'a' },
                first: { type: 'string', default: 'first' },
              },
            },
            {
              properties: {
                kind: { const: 'b' },
                second: { type: 'string', default: 'second' },
              },
            },
          ],
        }),
      );
      const form = await renderForm(runtime, {
        defaultValue: { kind: 'a' },
        validationMode: ValidationMode.None,
      });
      expect(form.exists('/first')).toBe(true);
      expect(form.exists('/second')).toBe(false);
      await form.selectOption('/kind', 'b');
      expect(form.exists('/first')).toBe(false);
      expect(form.exists('/second')).toBe(true);
      expect(form.getValue()).toEqual({ kind: 'b', second: 'second' });
      expect(form.errorRecords()).toEqual([]);
      form.unmount();
    },
  );
});
