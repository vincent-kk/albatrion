import { afterEach, expect, expectTypeOf, it, vi } from 'vitest';

import {
  type FieldInputHint,
  type FieldInputProps,
  type FieldInputTestObject,
  type FieldNodeType,
  Form,
} from '@/schema-form';

import { type FormHarness, renderForm } from '../renderForm';

let form: FormHarness;
afterEach(() => {
  form?.unmount();
  vi.restoreAllMocks();
});

it('LANDING-035 named renderer props drive the retained Form compound components', async () => {
  form = await renderForm(
    { type: 'string' },
    {
      FieldRenderer: () => <span data-renderer="group" />,
      FormLabelRenderer: () => <span data-renderer="label" />,
      FormInputRenderer: () => <span data-renderer="input" />,
      FormErrorRenderer: () => <span data-renderer="error" />,
      children: (
        <>
          <Form.Field />
          <Form.Label />
          <Form.Input />
          <Form.Error />
        </>
      ),
    },
  );
  expect(
    [...form.container.querySelectorAll('[data-renderer]')].map((element) =>
      element.getAttribute('data-renderer'),
    ),
  ).toEqual(['group', 'label', 'input', 'error']);
});

it('LANDING-129 union leaves render the default string draft input', async () => {
  form = await renderForm(
    { type: ['string', 'number', 'null'] },
    { defaultValue: 'draft' },
  );
  expect(form.handle.node?.type).toBe('union');
  expect(form.handle.node?.nullable).toBe(true);
  expect(form.value('')).toBe('draft');
  await form.type('', '42');
  expect(form.getValue()).toBe('42');
});

it('LANDING-181 integer hints and input props use number plus integer schemaType', async () => {
  let hint: FieldInputHint | undefined;
  let input: FieldInputProps | undefined;
  const Input = (props: FieldInputProps) => {
    input = props;
    return <input id={props.path} defaultValue={props.value} />;
  };
  form = await renderForm(
    { type: 'integer' },
    {
      defaultValue: 3,
      fieldInputDefinitions: [
        {
          test: (value) => {
            hint = value;
            return true;
          },
          Component: Input,
        },
      ],
    },
  );
  expect(hint).toMatchObject({ type: 'number', schemaType: 'integer' });
  expect(input).toMatchObject({ type: 'number', schemaType: 'integer' });
  expect(form.value('')).toBe('3');
});

it('LANDING-182 number selection includes integer and schemaType selects integer alone', async () => {
  const Integer = ({ path }: FieldInputProps) => (
    <input id={path} data-kind="integer" />
  );
  const Number = ({ path }: FieldInputProps) => (
    <input id={path} data-kind="number" />
  );
  form = await renderForm(
    {
      type: 'object',
      properties: {
        whole: { type: 'integer' },
        decimal: { type: 'number' },
      },
    },
    {
      fieldInputDefinitions: [
        { test: { schemaType: 'integer' }, Component: Integer },
        { test: { type: 'number' }, Component: Number },
      ],
    },
  );
  expect(form.field('/whole')?.dataset.kind).toBe('integer');
  expect(form.field('/decimal')?.dataset.kind).toBe('number');
  form.unmount();
  form = await renderForm(
    { type: 'integer' },
    {
      fieldInputDefinitions: [{ test: { type: 'number' }, Component: Number }],
    },
  );
  expect(form.field('')?.dataset.kind).toBe('number');
});

it('LANDING-185 test objects accept node kinds and a separate schemaType', async () => {
  expectTypeOf<NonNullable<FieldInputTestObject['type']>>().toEqualTypeOf<
    FieldNodeType | FieldNodeType[]
  >();
  const Input = ({ path }: FieldInputProps) => (
    <input id={path} data-union="yes" />
  );
  const test: FieldInputTestObject = { type: 'union' };
  form = await renderForm(
    { type: ['string', 'number'] },
    {
      fieldInputDefinitions: [{ test, Component: Input }],
    },
  );
  expect(form.field('')?.dataset.union).toBe('yes');
});

it('LANDING-186 unknown test keys are ignored and reported in development', async () => {
  const warning = vi.spyOn(console, 'warn').mockImplementation(() => {});
  const Input = ({ path }: FieldInputProps) => (
    <input id={path} data-selected="yes" />
  );
  form = await renderForm(
    { type: 'string' },
    {
      fieldInputDefinitions: [
        {
          test: {
            type: 'string',
            typo: 'would-not-match',
          } as FieldInputTestObject,
          Component: Input,
        },
      ],
    },
  );
  expect(form.field('')?.dataset.selected).toBe('yes');
  expect(warning).toHaveBeenCalledWith(
    'SCHEMA_FORM_WARNING.FORM_TYPE_TEST_INVALID',
    expect.objectContaining({ invalid: ['typo'] }),
  );
});

it('LANDING-187 default union input is available without a user definition', async () => {
  form = await renderForm({ type: ['number', 'boolean'] }, { defaultValue: 2 });
  expect(form.field('')).not.toBeNull();
  expect(form.value('')).toBe('2');
  await form.type('', '3');
  await form.user.tab();
  expect(form.getValue()).toBe(3);
});

it('LANDING-191 renderers receive union in the public node kind union', async () => {
  form = await renderForm(
    { type: ['string', 'boolean'] },
    {
      defaultValue: 'text',
      FieldRenderer: ({ type, Input }) => (
        <section data-kind={type}>
          <Input />
        </section>
      ),
    },
  );
  expect(form.container.querySelector('[data-kind="union"]')).not.toBeNull();
  expect(form.value('')).toBe('text');
});
