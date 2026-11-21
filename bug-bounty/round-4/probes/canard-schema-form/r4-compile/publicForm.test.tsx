import { Component, type ReactNode, createRef } from 'react';

import { act, cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { Form, type FormHandle, ValidationMode } from '../../index';

afterEach(cleanup);

class Boundary extends Component<
  { onCatch: (error: unknown) => void; children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: unknown) {
    this.props.onCatch(error);
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

const mount = async (
  jsonSchema: any,
  defaultValue: any,
  step?: (handle: FormHandle) => void,
) => {
  const handle = createRef<FormHandle>();
  const errors: string[] = [];
  const caught: string[] = [];
  const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
  try {
    await act(async () => {
      render(
        <Boundary onCatch={(error: any) => caught.push(String(error?.code ?? error))}>
          <Form
            ref={handle}
            validationMode={ValidationMode.None}
            jsonSchema={jsonSchema}
            defaultValue={defaultValue}
            onError={(record: any) => errors.push(String(record.code))}
          />
        </Boundary>,
      );
    });
    let thrown: unknown;
    if (step && handle.current)
      await act(async () => {
        try {
          step(handle.current!);
        } catch (error) {
          thrown = String((error as any)?.code ?? error);
        }
      });
    return {
      value: handle.current?.getValue(),
      errors,
      caught,
      thrown,
    };
  } finally {
    consoleError.mockRestore();
  }
};

describe('public Form: draft-07 fragment $id', () => {
  it('a definition with $id "#address" referenced by JSON pointer renders its field', async () => {
    const result = await mount(
      {
        $schema: 'http://json-schema.org/draft-07/schema#',
        type: 'object',
        properties: { home: { $ref: '#/definitions/address' } },
        definitions: {
          address: {
            $id: '#address',
            type: 'object',
            properties: { city: { type: 'string', default: 'Seoul' } },
          },
        },
      },
      {},
    );
    expect(result).toEqual({
      value: { home: { city: 'Seoul' } },
      errors: [],
      caught: [],
      thrown: undefined,
    });
  });
});

describe('public Form: regular expression literal after return', () => {
  it('a derived statement body returning /^\\d+$/.test(../code) follows the code field', async () => {
    const result = await mount(
      {
        type: 'object',
        properties: {
          code: { type: 'string' },
          ok: {
            type: 'boolean',
            controls: { derived: '{ return /^\\d+$/.test(../code); }' },
          },
        },
      },
      { code: '1' },
      (handle) => (handle.findNode('/code') as any).setValue('123'),
    );
    expect(result).toEqual({
      value: { code: '123', ok: true },
      errors: [],
      caught: [],
      thrown: undefined,
    });
  });
});

describe('public Form: a schema that fails to compile, then a valid schema (FP4)', () => {
  const bad = {
    type: 'object',
    properties: { x: { type: 'string', controls: { derived: '../a ===' } } },
  };
  const good = {
    type: 'object',
    properties: { x: { type: 'string', default: 'ok' } },
  };
  it('reset after replacing the schema loads the valid schema and submits', async () => {
    const handle = createRef<FormHandle>();
    const errors: string[] = [];
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    const view = (schema: any) => (
      <Form
        ref={handle}
        validationMode={ValidationMode.None}
        jsonSchema={schema}
        onError={(record: any) => errors.push(String(record.code))}
      />
    );
    let rerender!: (ui: any) => void;
    await act(async () => {
      rerender = render(view(bad)).rerender;
    });
    const afterBad = { handle: !!handle.current, errors: [...errors] };
    await act(async () => {
      rerender(view(good));
    });
    await act(async () => {
      handle.current?.reset();
    });
    let submitted: unknown;
    let rejected: unknown;
    await act(async () => {
      try {
        submitted = await handle.current?.submit();
      } catch (error) {
        rejected = String((error as any)?.code ?? error);
      }
    });
    consoleError.mockRestore();
    expect({
      afterBad,
      value: handle.current?.getValue(),
      errors,
      rejected,
    }).toEqual({
      afterBad: { handle: true, errors: ['JSON_SCHEMA_ERROR.CREATE_DYNAMIC_FUNCTION'] },
      value: { x: 'ok' },
      errors: ['JSON_SCHEMA_ERROR.CREATE_DYNAMIC_FUNCTION'],
      rejected: undefined,
    });
    void submitted;
  });
});

describe('public Form: allOf keyword warning through $ref', () => {
  it('onError receives ALL_OF_KEYWORD_IGNORED_FOR_FORM for a $ref allOf part as for the inline part', async () => {
    const inline = await mount(
      {
        type: 'object',
        properties: { a: { type: 'string' } },
        allOf: [{ not: { required: ['a'] } }],
      },
      {},
    );
    const viaRef = await mount(
      {
        type: 'object',
        properties: { a: { type: 'string' } },
        allOf: [{ $ref: '#/$defs/N' }],
        $defs: { N: { not: { required: ['a'] } } },
      },
      {},
    );
    expect(inline.errors).toContain('SCHEMA_FORM_WARNING.ALL_OF_KEYWORD_IGNORED_FOR_FORM');
    expect(viaRef.errors).toEqual(inline.errors);
  });
});

describe('public Form: absolute path with a parent step', () => {
  it('derived "(/g/../top) ?? \\"none\\"" reads /top like find("/g/../top") does', async () => {
    let found: unknown;
    const result = await mount(
      {
        type: 'object',
        properties: {
          g: { type: 'object', properties: { x: { type: 'string' } } },
          top: { type: 'string' },
          out: { type: 'string', controls: { derived: '(/g/../top) ?? "none"' } },
        },
      },
      { top: 'a' },
      (handle) => {
        found = handle.findNode('/g/../top')?.path;
        (handle.findNode('/top') as any).setValue('b');
      },
    );
    expect({ found, out: (result.value as any)?.out, errors: result.errors }).toEqual({
      found: '/top',
      out: 'b',
      errors: [],
    });
  });
});
