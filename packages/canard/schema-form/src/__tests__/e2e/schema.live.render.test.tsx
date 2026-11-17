import { StrictMode, createRef } from 'react';

import { act, cleanup, render } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import {
  Form,
  type FormChildrenProps,
  type FormHandle,
  type JSONSchema,
  ValidationMode,
} from '@/schema-form';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

const first = {
  type: 'object',
  properties: { a: { type: 'string' } },
} as const;
const second = {
  type: 'object',
  properties: { b: { type: 'string' } },
} as const;

it.each([false, true])(
  'keeps the current schema-node pair until reset applies the new props (StrictMode=%s)',
  (strict) => {
    const ref = createRef<FormHandle>();
    const seen: FormChildrenProps<JSONSchema>[] = [];
    const children = (props: FormChildrenProps<JSONSchema>) => {
      seen.push(props);
      return (
        <span>{Object.keys(props.jsonSchema.properties ?? {}).join(',')}</span>
      );
    };
    const element = (jsonSchema: JSONSchema) => {
      const form = (
        <Form
          ref={ref}
          jsonSchema={jsonSchema}
          defaultValue={{ b: 'new' }}
          validationMode={ValidationMode.None}
        >
          {children}
        </Form>
      );
      return strict ? <StrictMode>{form}</StrictMode> : form;
    };
    const view = render(element(first));
    const root = ref.current!.node;
    seen.length = 0;
    view.rerender(element(second));
    expect(ref.current!.node).toBe(root);
    expect(view.getByText('a')).toBeTruthy();
    expect(
      seen.every(({ jsonSchema, node }) => jsonSchema === node!.jsonSchema),
    ).toBe(true);
    act(() => ref.current!.reset());
    expect(ref.current!.node).not.toBe(root);
    expect(ref.current!.getValue()).toEqual({ b: 'new' });
    expect(view.getByText('b')).toBeTruthy();
    expect(
      seen.every(({ jsonSchema, node }) => jsonSchema === node!.jsonSchema),
    ).toBe(true);
    const replacement = ref.current!.node;
    expect(
      new Set(seen.map(({ node }) => node).filter((node) => node !== root))
        .size,
    ).toBe(1);
    view.rerender(element({ ...second }));
    expect(ref.current!.node).toBe(replacement);
  },
);

it('keeps edits for default-only changes and uses the new defaults on reset', () => {
  const ref = createRef<FormHandle>();
  const element = (defaultValue: string) => (
    <Form
      ref={ref}
      jsonSchema={{ type: 'string' }}
      defaultValue={defaultValue}
      validationMode={ValidationMode.None}
    />
  );
  const view = render(element('first'));
  const root = ref.current!.node;
  act(() => ref.current!.setValue('edited'));
  view.rerender(element('second'));
  expect(ref.current!.node).toBe(root);
  expect(ref.current!.getValue()).toBe('edited');
  act(() => ref.current!.reset());
  expect(ref.current!.getValue()).toBe('second');
});

it('retains the previous schema-node pair when a new schema cannot load and reports once', () => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
  vi.stubGlobal('reportError', vi.fn());
  const ref = createRef<FormHandle>();
  const onError = vi.fn();
  const pairs: FormChildrenProps<JSONSchema>[] = [];
  const invalid = {
    type: 'object',
    controls: { unknown: true },
  } as unknown as JSONSchema;
  const children = (props: FormChildrenProps<JSONSchema>) => {
    pairs.push(props);
    return null;
  };
  const element = (jsonSchema: JSONSchema) => (
    <Form
      ref={ref}
      jsonSchema={jsonSchema}
      validationMode={ValidationMode.None}
      onError={onError}
    >
      {children}
    </Form>
  );
  const view = render(element(first));
  const root = ref.current!.node;
  view.rerender(element(invalid));
  expect(onError).not.toHaveBeenCalled();
  act(() => ref.current!.reset());
  view.rerender(element(invalid));
  expect(ref.current!.node).toBe(root);
  expect(onError).toHaveBeenCalledTimes(1);
  expect(
    pairs.every(({ jsonSchema, node }) => jsonSchema === node!.jsonSchema),
  ).toBe(true);
});
