import { cloneElement, createRef } from 'react';

import { act, cleanup, render } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import {
  type FieldInputProps,
  Form,
  type FormHandle,
  type JSONSchema,
} from '@/schema-form';

afterEach(cleanup);

/** The documented fragment sits verbatim inside a schema; Prettier must not reindent it. */
// prettier-ignore
const visibleSchema = {
  type: 'object',
  properties: {
    toggle: { type: 'boolean' },
    other: { type: 'string' },
conditionalField: {
  type: 'string',
  controls: { visible: '../toggle === true' },
}
  },
} satisfies JSONSchema;

it('visible hides the field and keeps its value', () => {
  const ref = createRef<FormHandle>();
  const view = render(
    <Form
      ref={ref}
      jsonSchema={visibleSchema}
      defaultValue={{ toggle: false, conditionalField: 'kept' }}
    />,
  );
  expect(ref.current!.findNode('/conditionalField')!.isVisible).toBe(false);
  expect(view.queryByDisplayValue('kept')).toBeNull();
  expect(ref.current!.getValue()).toEqual({
    toggle: false,
    conditionalField: 'kept',
  });
  act(() => ref.current!.findNode('/toggle')!.setValue(true));
  expect(ref.current!.findNode('/conditionalField')!.isVisible).toBe(true);
  expect(view.getByDisplayValue('kept')).toBeTruthy();
});

const received: unknown[] = [];

/** Records the dependency values Form hands to the input. */
function TotalInput({ watchValues }: FieldInputProps<number>) {
  received.push(watchValues[0]);
  return (
    <output aria-label="Total watch">{JSON.stringify(watchValues[0])}</output>
  );
}

// prettier-ignore
const watchSchema = {
  type: 'object',
  properties: {
    items: { type: 'array', items: { type: 'number' } },
total: { type: 'number', controls: { watch: ['../items'] } },
// FieldInput receives watchValues[0] and computes with useMemo
  },
} satisfies JSONSchema;

it('hands the watched path value to the input as watchValues[0]', () => {
  received.length = 0;
  const ref = createRef<FormHandle>();
  const view = render(
    <Form
      ref={ref}
      jsonSchema={watchSchema}
      defaultValue={{ items: [1, 2] }}
      fieldInputMap={{ '/total': TotalInput }}
    />,
  );
  expect(view.getByLabelText('Total watch').textContent).toBe('[1,2]');
  act(() => ref.current!.findNode('/items')!.setValue([1, 2, 3]));
  expect(view.getByLabelText('Total watch').textContent).toBe('[1,2,3]');
  expect(received.at(-1)).toEqual([1, 2, 3]);
});

/** Renders the documented JSX against the schema supplied by the caller. */
function createContextForm(schema: JSONSchema) {
  // prettier-ignore
  const form = (
<Form
  jsonSchema={schema}
  context={{ userRole: 'admin', permissions: { canEdit: true } }}
/>
  );
  return form;
}

// prettier-ignore
const contextSchema = {
  type: 'object',
  properties: {
    secret: {
      type: 'string',
controls: {
  visible: '@.userRole === "admin"',
  readOnly: '(@).permissions?.canEdit !== true',
}
    },
  },
} satisfies JSONSchema;

it('reads context through @.field and (@).a?.b', () => {
  const ref = createRef<FormHandle>();
  const form = createContextForm(contextSchema);
  const view = render(cloneElement(form, { ref }));
  const secret = () => ref.current!.findNode('/secret')!;
  expect(secret().isVisible).toBe(true);
  expect(secret().isReadOnly).toBe(false);
  view.rerender(
    cloneElement(form, {
      ref,
      context: { userRole: 'guest', permissions: { canEdit: false } },
    }),
  );
  expect(secret().isVisible).toBe(false);
  expect(secret().isReadOnly).toBe(true);
  view.rerender(cloneElement(form, { ref, context: { userRole: 'admin' } }));
  expect(secret().isVisible).toBe(true);
  expect(secret().isReadOnly).toBe(true);
});

// prettier-ignore
const schema = {
  type: 'object',
  properties: {
    type: { type: 'string', enum: ['A', 'B'], default: 'A' },
  },
  oneOf: [
    {
      controls: { active: "./type === 'A'" },
      properties: { fieldA: { type: 'string' } },
    },
    {
      controls: { active: "./type === 'B'" },
      properties: { fieldB: { type: 'number' } },
    },
  ],
} satisfies JSONSchema;
// type='A' → { type: 'A', fieldA: … }   (fieldB is dropped)

it('keeps only the active oneOf branch values', () => {
  const ref = createRef<FormHandle>();
  render(<Form ref={ref} jsonSchema={schema} />);
  act(() => ref.current!.setValue({ type: 'A', fieldA: 'a', fieldB: 5 }));
  expect(ref.current!.getValue()).toEqual({ type: 'A', fieldA: 'a' });
  act(() => ref.current!.setValue({ type: 'B', fieldA: 'a', fieldB: 5 }));
  expect(ref.current!.getValue()).toEqual({ type: 'B', fieldB: 5 });
});

/** The documented fragment sits verbatim inside a schema; Prettier must not reindent it. */
// prettier-ignore
const pathEndSchema = {
  type: 'object',
  properties: {
    items: { type: 'array', items: { type: 'string' } },
    limits: { type: 'object', properties: { basic: { type: 'number' }, pro: { type: 'number' } } },
    tier: { type: 'string' },
    a: { type: 'number' },
    b: { type: 'number' },
count: { type: 'number', controls: { derived: '(../items)?.length ?? 0' } },
first: { type: 'string', controls: { derived: '(../items)[0]' } },
second: { type: 'string', controls: { derived: '../items/1' } },
limit: { type: 'number', controls: { derived: '(../limits)[(../tier)]' } },
highest: { type: 'number', controls: { derived: 'Math.max(../a , ../b)' } },
half: { type: 'number', controls: { derived: '(../a) / 2' } },
  },
} satisfies JSONSchema;

const pathEndDefaultValue = {
  items: ['x', 'y'],
  limits: { basic: 3, pro: 9 },
  tier: 'basic',
  a: 9,
  b: 4,
};

it('a parenthesized path is indexed, called on and divided', () => {
  const ref = createRef<FormHandle>();
  render(
    <Form
      ref={ref}
      jsonSchema={pathEndSchema}
      defaultValue={pathEndDefaultValue}
    />,
  );
  expect(ref.current!.getValue()).toMatchObject({
    count: 2,
    first: 'x',
    second: 'y',
    limit: 3,
    highest: 9,
    half: 4.5,
  });
  act(() => ref.current!.findNode('/tier')!.setValue('pro'));
  expect(ref.current!.getValue()).toMatchObject({ limit: 9 });
  act(() => ref.current!.findNode('/limits/pro')!.setValue(12));
  expect(ref.current!.getValue()).toMatchObject({ limit: 12 });
  act(() => ref.current!.findNode('/items/0')!.setValue('z'));
  expect(ref.current!.getValue()).toMatchObject({ first: 'z' });
});

it.each([
  '../a>5',
  '../a+1',
  '../a===9',
  '../a??0',
  '../items.length',
  '../items?.length',
  '../items[0]',
  '../limits[../tier]',
])('%s reads a property of that literal name and yields undefined', (expression) => {
  const ref = createRef<FormHandle>();
  render(
    <Form
      ref={ref}
      jsonSchema={{
        type: 'object',
        properties: {
          items: { type: 'array', items: { type: 'string' } },
          limits: {
            type: 'object',
            properties: { basic: { type: 'number' }, pro: { type: 'number' } },
          },
          tier: { type: 'string' },
          a: { type: 'number' },
          b: { type: 'number' },
          out: {
            type: 'string',
            controls: { derived: 'String( ' + expression + ' )' },
          },
        },
      }}
      defaultValue={pathEndDefaultValue}
    />,
  );
  expect(ref.current!.findNode('/out')!.value).toBe('undefined');
});

it('a bracket or an operator written against a path belongs to the property name', () => {
  const ref = createRef<FormHandle>();
  render(
    <Form
      ref={ref}
      jsonSchema={{
        type: 'object',
        properties: {
          'list[0]': { type: 'number' },
          'a>5': { type: 'number' },
          x: { type: 'number', controls: { derived: '../list[0]' } },
          y: { type: 'number', controls: { derived: '../a>5' } },
        },
      }}
      defaultValue={{ 'list[0]': 7, 'a>5': 8 }}
    />,
  );
  expect(ref.current!.getValue()).toMatchObject({ x: 7, y: 8 });
});

it.each(['Math.max(../a, ../b)', '[../a, ../b].length', '(../a)/2'])(
  '%s fails to compile',
  async (expression) => {
    const onError = vi.fn();
    const swallow = (event: ErrorEvent) => event.preventDefault();
    window.addEventListener('error', swallow);
    render(
      <Form
        jsonSchema={{
          type: 'object',
          properties: {
            a: { type: 'number' },
            b: { type: 'number' },
            out: { type: 'number', controls: { derived: expression } },
          },
        }}
        onError={onError}
      />,
    );
    await vi.waitFor(() => expect(onError).toHaveBeenCalled());
    expect(onError).toHaveBeenCalledWith(
      expect.objectContaining({
        code: 'JSON_SCHEMA_ERROR.CREATE_DYNAMIC_FUNCTION',
      }),
    );
    window.removeEventListener('error', swallow);
  },
);
