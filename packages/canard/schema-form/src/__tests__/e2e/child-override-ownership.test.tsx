import { useState } from 'react';

import { afterEach, expect, it } from 'vitest';

import {
  type FieldInputProps,
  type FieldRendererProps,
  Form,
  type JSONSchema,
} from '@/schema-form';

import { type FormHarness, renderForm } from '../renderForm';

/** Each test owns a public Form instance. */
let form: FormHarness;
afterEach(() => form?.unmount());

/** Expose the input indicator without enabling native constraint validation. */
const Input = ({ path, value, required }: FieldInputProps<string>) => (
  <input id={path} value={value ?? ''} readOnly data-required={required} />
);

/** Expose the renderer indicator independently from the input. */
const Renderer = ({ Input, required }: FieldRendererProps) => (
  <div data-renderer-required={required}>
    <Input />
  </div>
);

/** Only the parent state changes; neither node values nor schemas change. */
const Parent = ({ ChildFields }: FieldInputProps) => {
  const [required, setRequired] = useState<boolean | undefined>(false);
  return (
    <>
      <button type="button" onClick={() => setRequired(true)}>
        require
      </button>
      <button type="button" onClick={() => setRequired(undefined)}>
        inherit
      </button>
      {ChildFields.map((Child) => (
        <Child key={Child.key} required={required} FieldRenderer={Renderer} />
      ))}
    </>
  );
};

/** A required child remains schema-required regardless of its displayed indicator. */
const schema: JSONSchema = {
  type: 'object',
  options: { terminal: false },
  presentation: { FieldInput: Parent },
  required: ['name'],
  properties: { name: { type: 'string', presentation: { FieldInput: Input } } },
};

it.each(['value', 'defaultValue'] as const)(
  'Child cannot override %s',
  async (property) => {
    const overrides: Record<string, unknown> = {
      [property]: 'foreign',
    };
    const Parent = ({ ChildFields }: FieldInputProps) => (
      <>
        {ChildFields.map((Child) => (
          <Child key={Child.key} {...overrides} />
        ))}
      </>
    );
    const Read = (props: FieldInputProps<string>) => (
      <input
        id={props.path}
        defaultValue={props[property]}
        data-received-value={props.value}
        data-received-default-value={props.defaultValue}
      />
    );
    form = await renderForm(
      {
        type: 'object',
        options: { terminal: false },
        presentation: { FieldInput: Parent },
        properties: {
          name: { type: 'string', presentation: { FieldInput: Read } },
        },
      },
      { defaultValue: { name: 'node' } },
    );
    const input = form.field('/name')!;
    expect(input.getAttribute('data-received-value')).toBe('node');
    expect(input.getAttribute('data-received-default-value')).toBe('node');
    expect(input.value).toBe('node');
    expect(form.node('/name')!.value).toBe('node');
  },
);

it('Child required=false reaches both renderer and input', async () => {
  form = await renderForm(schema);
  expect(
    form.container
      .querySelector('[data-renderer-required]')!
      .getAttribute('data-renderer-required'),
  ).toBe('false');
  expect(form.field('/name')!.getAttribute('data-required')).toBe('false');
});

it('parent-only required changes reach renderer and input after mount', async () => {
  form = await renderForm(schema);
  const input = form.field('/name');
  await form.user.click(form.container.querySelector('button')!);
  expect(
    form.container
      .querySelector('[data-renderer-required]')!
      .getAttribute('data-renderer-required'),
  ).toBe('true');
  expect(form.field('/name')!.getAttribute('data-required')).toBe('true');
  expect(form.field('/name')).toBe(input);
});

it('undefined required falls back to the schema in both surfaces', async () => {
  form = await renderForm(schema);
  await form.user.click(form.container.querySelectorAll('button')[1]);
  expect(
    form.container
      .querySelector('[data-renderer-required]')!
      .getAttribute('data-renderer-required'),
  ).toBe('true');
  expect(form.field('/name')!.getAttribute('data-required')).toBe('true');
});

it('required=false does not remove schema validation', async () => {
  form = await renderForm(schema, { validator: true });
  const errors = await form.handle.validate();
  expect(errors.some((error) => error.keyword === 'required')).toBe(true);
});

it('Form.Field forwards the required indicator to its renderer', async () => {
  form = await renderForm(
    {
      type: 'object',
      required: ['name'],
      properties: { name: { type: 'string' } },
    },
    {
      children: (
        <Form.Field
          path="/name"
          required={false}
          FieldRenderer={Renderer}
          FieldInput={Input}
        />
      ),
    },
  );
  expect(
    form.container
      .querySelector('[data-renderer-required]')!
      .getAttribute('data-renderer-required'),
  ).toBe('false');
  expect(form.field('/name')!.getAttribute('data-required')).toBe('false');
});

it('preserves presentation required until a boolean child override wins', async () => {
  const Parent = ({ ChildFields }: FieldInputProps) => {
    const [required, setRequired] = useState<boolean | undefined>();
    return (
      <>
        <button type="button" onClick={() => setRequired(true)}>
          override required
        </button>
        <button type="button" onClick={() => setRequired(false)}>
          override optional
        </button>
        <button type="button" onClick={() => setRequired(undefined)}>
          inherit presentation
        </button>
        {ChildFields.map((Child) => (
          <Child key={Child.key} required={required} FieldRenderer={Renderer} />
        ))}
      </>
    );
  };
  form = await renderForm(
    {
      type: 'object',
      options: { terminal: false },
      presentation: { FieldInput: Parent },
      required: ['a'],
      properties: {
        a: {
          type: 'string',
          presentation: {
            FieldInput: Input,
            required: false,
          },
        },
      },
    },
    { validator: true },
  );
  const input = form.field('/a');
  const renderer = form.container.querySelector('[data-renderer-required]')!;
  expect(form.node('/a')!.isRequired).toBe(true);
  expect(input!.getAttribute('data-required')).toBe('false');
  expect(renderer.getAttribute('data-renderer-required')).toBe('false');
  const errors = await form.handle.validate();
  expect(errors.some((error) => error.keyword === 'required')).toBe(true);
  await form.user.click(form.container.querySelectorAll('button')[0]);
  expect(form.field('/a')!.getAttribute('data-required')).toBe('true');
  expect(renderer.getAttribute('data-renderer-required')).toBe('true');
  await form.user.click(form.container.querySelectorAll('button')[1]);
  expect(form.field('/a')!.getAttribute('data-required')).toBe('false');
  expect(renderer.getAttribute('data-renderer-required')).toBe('false');
  await form.user.click(form.container.querySelectorAll('button')[2]);
  expect(form.field('/a')!.getAttribute('data-required')).toBe('false');
  expect(renderer.getAttribute('data-renderer-required')).toBe('false');
  expect(form.field('/a')).toBe(input);
});

it.each([false, undefined])(
  'optional schema with presentation required=true respects override %s',
  async (required) => {
    const Parent = ({ ChildFields }: FieldInputProps) => (
      <>
        {ChildFields.map((Child) => (
          <Child key={Child.key} required={required} FieldRenderer={Renderer} />
        ))}
      </>
    );
    form = await renderForm({
      type: 'object',
      options: { terminal: false },
      presentation: { FieldInput: Parent },
      properties: {
        a: {
          type: 'string',
          presentation: {
            FieldInput: Input,
            required: true,
          },
        },
      },
    });
    expect(form.node('/a')!.isRequired).toBe(false);
    const expected = required === false ? 'false' : 'true';
    expect(form.field('/a')!.getAttribute('data-required')).toBe(expected);
    expect(
      form.container
        .querySelector('[data-renderer-required]')!
        .getAttribute('data-renderer-required'),
    ).toBe(expected);
  },
);

it.each([true, false, undefined])(
  'renderer Input required=%s respects boolean overrides and shared fallback',
  async (required) => {
    const overrides: Record<string, unknown> = { required };
    const Renderer = ({ Input, required }: FieldRendererProps) => (
      <div data-renderer-required={required}>
        <Input {...overrides} />
      </div>
    );
    const Parent = ({ ChildFields }: FieldInputProps) => (
      <>
        {ChildFields.map((Child) => (
          <Child key={Child.key} required={false} FieldRenderer={Renderer} />
        ))}
      </>
    );
    form = await renderForm({
      type: 'object',
      required: ['a'],
      options: { terminal: false },
      presentation: { FieldInput: Parent },
      properties: {
        a: { type: 'string', presentation: { FieldInput: Input } },
      },
    });
    expect(
      form.container
        .querySelector('[data-renderer-required]')!
        .getAttribute('data-renderer-required'),
    ).toBe('false');
    expect(form.field('/a')!.getAttribute('data-required')).toBe(
      required === true ? 'true' : 'false',
    );
  },
);
