import { createRef } from 'react';

import { act, cleanup, render } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import { Form, type FormHandle, ValidationMode } from '../../index';

afterEach(cleanup);

it('a draft-07 fragment identifier has the same rendered fields as the inline schema', () => {
  const run = (ref: boolean) => {
    const inner = {
      type: 'object',
      properties: { city: { type: 'string', default: 'Seoul' } },
    } as const;
    const handle = createRef<FormHandle>();
    const errors: string[] = [];
    const view = render(
      <Form
        ref={handle}
        jsonSchema={
          ref
            ? {
                $schema: 'http://json-schema.org/draft-07/schema#',
                type: 'object',
                properties: { home: { $ref: '#/definitions/address' } },
                definitions: { address: { $id: '#address', ...inner } },
              }
            : { type: 'object', properties: { home: inner } }
        }
        validationMode={ValidationMode.None}
        onError={(record) => errors.push(record.code)}
      />,
    );
    const result = {
      value: handle.current?.getValue(),
      inputs: Array.from(
        view.container.querySelectorAll('input'),
        (input) => input.value,
      ),
      errors,
    };
    view.unmount();
    return result;
  };
  expect(run(true)).toEqual(run(false));
});

it.each([
  '{ return /^\\d+$/.test(../code); }',
  '{ const re = /^\\d+$/; return re.test(../code); }',
])('statement %s behaves like its expression form', async (expression) => {
  const run = async (derived: string) => {
    const handle = createRef<FormHandle>();
    const errors: string[] = [];
    const view = render(
      <Form
        ref={handle}
        jsonSchema={{
          type: 'object',
          properties: {
            code: { type: 'string' },
            ok: { type: 'boolean', controls: { derived } },
          },
        }}
        defaultValue={{ code: '1' }}
        validationMode={ValidationMode.None}
        onError={(record) => errors.push(record.code)}
      />,
    );
    const values: unknown[] = [handle.current?.getValue()];
    for (const value of ['abc', '42'])
      await act(async () => {
        handle.current?.findNode('/code')?.setValue(value);
        values.push(handle.current?.getValue());
      });
    view.unmount();
    return { values, errors };
  };
  expect(await run(expression)).toEqual(await run('/^\\d+$/.test(../code)'));
});

it.each(['/g/../top', '#/./top', '/g/x/../../top'])(
  'expression and watch at %s follow the canonical field',
  async (path) => {
    const run = async (pointer: string) => {
      const handle = createRef<FormHandle>();
      const view = render(
        <Form
          ref={handle}
          jsonSchema={{
            type: 'object',
            properties: {
              g: { type: 'object', properties: { x: { type: 'string' } } },
              top: { type: 'string' },
              out: {
                type: 'string',
                controls: {
                  derived: `(${pointer}) ?? "none"`,
                  watch: [pointer],
                },
              },
            },
          }}
          defaultValue={{ top: 'a' }}
          validationMode={ValidationMode.None}
        />,
      );
      const values: unknown[] = [handle.current?.getValue()];
      await act(async () => {
        handle.current?.findNode('/top')?.setValue('b');
      });
      values.push(handle.current?.getValue());
      const watched = handle.current?.findNode('/out')?.watchValues;
      view.unmount();
      return { values, watched };
    };
    expect(await run(path)).toEqual(await run('/top'));
  },
);
