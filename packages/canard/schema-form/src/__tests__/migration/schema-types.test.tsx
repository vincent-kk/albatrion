import { afterEach, expect, expectTypeOf, it } from 'vitest';

import { isTerminalNode, type FormTypeInputProps, type InferValueType } from '@/schema-form';

import { type FormHarness, renderForm } from '../renderForm';

let form: FormHarness;
afterEach(() => form?.unmount());

it('LANDING-173 singleton type arrays honor nullable true', async () => {
  form = await renderForm({ type: ['string'], nullable: true }, { defaultValue: null });
  expect(form.handle.node?.type).toBe('string');
  expect(form.handle.node?.nullable).toBe(true);
  expect(form.getValue()).toBeNull();
  expect(form.field('')).not.toBeNull();
});

it('LANDING-176 typeless allOf infers a string node and input', async () => {
  form = await renderForm({ allOf: [{ type: 'string' }] }, { defaultValue: 'text' });
  expect(form.handle.node?.type).toBe('string');
  expect(form.value('')).toBe('text');
});

it('LANDING-178 typeless nullable false overlay does not remove null', async () => {
  form = await renderForm({ type: ['string', 'null'], allOf: [{ nullable: false }] }, { defaultValue: null });
  expect(form.handle.node?.nullable).toBe(true);
  expect(form.getValue()).toBeNull();
  expect(form.field('')).not.toBeNull();
});

it('LANDING-189 readonly type arrays infer the precise public value union', async () => {
  const schema = { type: ['string', 'number'] } as const;
  expectTypeOf<InferValueType<typeof schema>>().toEqualTypeOf<string | number>();
  form = await renderForm(schema, { defaultValue: 42 });
  expect(form.getValue()).toBe(42);
  expect(form.value('')).toBe('42');
});

it('LANDING-149 inline virtual inputs remain branches with referenced children', async () => {
  const Virtual = ({ ChildNodeComponents }: FormTypeInputProps) =>
    <section data-virtual>{ChildNodeComponents.map((Child) => <Child key={Child.key} />)}</section>;
  form = await renderForm({ type: 'object', properties: { name: { type: 'string' } },
    options: { virtual: { group: { fields: ['name'], presentation: { FormTypeInput: Virtual } } } },
  }, { defaultValue: { name: 'kept' } });
  expect(form.node('/group')?.strategy).toBe('branch');
  expect(isTerminalNode(form.node('/group')!)).toBe(false);
  expect(form.container.querySelector('[data-virtual] input')?.getAttribute('id')).toBe('/name');
});

it('LANDING-149 unsupported terminal combinations fail with blueprint diagnostics', async () => {
  form = await renderForm({ type: 'string', options: { terminal: false } });
  expect(form.field('')).toBeNull();
  expect(form.errorRecords()).toEqual(expect.arrayContaining([
    expect.objectContaining({ code: 'JSON_SCHEMA_ERROR.TERMINAL_OPTION_UNSUPPORTED' }),
  ]));
});
