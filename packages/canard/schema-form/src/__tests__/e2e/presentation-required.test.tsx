import { afterEach, expect, it } from 'vitest';

import {
  type FieldInputProps,
  type FieldRendererProps,
  Form,
} from '@/schema-form';

import { type FormHarness, renderForm } from '../renderForm';

/** Each case owns one public form and observes both rendered surfaces. */
let form: FormHarness;
afterEach(() => form?.unmount());

/** Expose display required without browser constraint validation. */
const Input = ({ path, required }: FieldInputProps) => (
  <input id={path} data-required={required} />
);

/** Render the input and expose the independently received renderer indicator. */
const Renderer = ({ Input, required }: FieldRendererProps) => (
  <div data-renderer-required={required}>
    <Input />
  </div>
);

it.each([false, true])(
  'presentation.required=%s changes display but not schema validation',
  async (required) => {
    form = await renderForm(
      {
        type: 'object',
        required: required ? [] : ['a'],
        properties: {
          a: { type: 'string', presentation: { required, FieldInput: Input } },
        },
      },
      {
        validator: true,
        children: <Form.Field path="/a" FieldRenderer={Renderer} />,
      },
    );
    expect(form.field('/a')!.getAttribute('data-required')).toBe(
      String(required),
    );
    expect(
      form.container
        .querySelector('[data-renderer-required]')!
        .getAttribute('data-renderer-required'),
    ).toBe(String(required));
    expect(form.node('/a')!.isRequired).toBe(!required);
    expect(
      (await form.handle.validate()).some(
        (error) => error.keyword === 'required',
      ),
    ).toBe(!required);
  },
);

it.each(['FieldInputProps', 'FieldRendererProps'])(
  'required in presentation.%s cannot replace the binding value',
  async (bag) => {
    form = await renderForm(
      {
        type: 'object',
        required: ['a'],
        properties: {
          a: {
            type: 'string',
            presentation: { FieldInput: Input, [bag]: { required: false } },
          },
        },
      },
      { children: <Form.Field path="/a" FieldRenderer={Renderer} /> },
    );
    expect(form.field('/a')!.getAttribute('data-required')).toBe('true');
    expect(
      form.container
        .querySelector('[data-renderer-required]')!
        .getAttribute('data-renderer-required'),
    ).toBe('true');
  },
);

it('presentation required does not change the input selection hint', async () => {
  const RequiredInput = ({ path, required }: FieldInputProps) => (
    <input
      id={path}
      data-required={required}
      data-selection="schema-required"
    />
  );
  const OptionalInput = ({ path }: FieldInputProps) => (
    <input id={path} data-selection="schema-optional" />
  );
  form = await renderForm(
    {
      type: 'object',
      required: ['a'],
      properties: { a: { type: 'string', presentation: { required: false } } },
    },
    {
      fieldInputDefinitions: [
        { test: { type: 'string', required: true }, Component: RequiredInput },
        { test: { type: 'string', required: false }, Component: OptionalInput },
      ],
    },
  );
  expect(form.field('/a')!.getAttribute('data-selection')).toBe(
    'schema-required',
  );
  expect(form.field('/a')!.getAttribute('data-required')).toBe('false');
});
