import { afterEach, expect, it } from 'vitest';

import {
  type FieldInputProps,
  type FieldRendererProps,
  Form,
} from '@/schema-form';

import { type FormHarness, renderForm } from '../renderForm';

/** Each case owns one layout surface and observes the actual input props. */
let form: FormHarness;
afterEach(() => form?.unmount());

it.each([
  ['Input', 'value'],
  ['Input', 'defaultValue'],
  ['Render', 'value'],
  ['Render', 'defaultValue'],
  ['Field', 'value'],
  ['Field', 'defaultValue'],
  ['RendererInput', 'value'],
  ['RendererInput', 'defaultValue'],
])('%s cannot override node-owned %s', async (surface, property) => {
  const overrides: Record<string, unknown> = { [property]: 'foreign' };
  const Read = (props: FieldInputProps<string>) => (
    <input
      id={props.path}
      defaultValue={props[property]}
      data-received-value={props.value}
      data-received-default-value={props.defaultValue}
    />
  );
  const layout =
    surface === 'Input' ? (
      <Form.Input path="/name" FieldInput={Read} {...overrides} />
    ) : surface === 'Render' ? (
      <Form.Render path="/name" FieldInput={Read} {...overrides}>
        {({ Input }) => <Input />}
      </Form.Render>
    ) : surface === 'Field' ? (
      <Form.Field path="/name" FieldInput={Read} {...overrides} />
    ) : (
      <Form.Render path="/name" FieldInput={Read}>
        {({ Input }) => <Input {...overrides} />}
      </Form.Render>
    );
  form = await renderForm(
    { type: 'object', properties: { name: { type: 'string' } } },
    { defaultValue: { name: 'node' }, children: layout },
  );
  const input = form.field('/name')!;
  expect(input.getAttribute('data-received-value')).toBe('node');
  expect(input.getAttribute('data-received-default-value')).toBe('node');
  expect(input.value).toBe('node');
  expect(form.node('/name')!.value).toBe('node');
});

it('rejects value and defaultValue overrides on every public surface', () => {
  const Parent = ({ ChildFields }: FieldInputProps) => {
    const Child = ChildFields[0];
    // @ts-expect-error Child values belong to the node binding.
    const value = <Child value="foreign" />;
    // @ts-expect-error Child defaults belong to the node binding.
    const defaultValue = <Child defaultValue="foreign" />;
    return (
      <>
        {value}
        {defaultValue}
      </>
    );
  };
  const Renderer = ({ Input }: FieldRendererProps) => {
    // @ts-expect-error Renderer Input values belong to the node binding.
    const value = <Input value="foreign" />;
    // @ts-expect-error Renderer Input defaults belong to the node binding.
    const defaultValue = <Input defaultValue="foreign" />;
    return (
      <>
        {value}
        {defaultValue}
      </>
    );
  };
  const layouts = [
    // @ts-expect-error Form.Input values belong to the node binding.
    <Form.Input key="Input-value" value="foreign" />,
    // @ts-expect-error Form.Input defaults belong to the node binding.
    <Form.Input key="Input-defaultValue" defaultValue="foreign" />,
    // @ts-expect-error Form.Render values belong to the node binding.
    <Form.Render key="Render-value" value="foreign">
      {Renderer}
    </Form.Render>,
    // @ts-expect-error Form.Render defaults belong to the node binding.
    <Form.Render key="Render-defaultValue" defaultValue="foreign">
      {Renderer}
    </Form.Render>,
    // @ts-expect-error Form.Field values belong to the node binding.
    <Form.Field key="Field-value" value="foreign" />,
    // @ts-expect-error Form.Field defaults belong to the node binding.
    <Form.Field key="Field-defaultValue" defaultValue="foreign" />,
  ];
  expect(Parent).toBeTypeOf('function');
  expect(layouts).toHaveLength(6);
});
