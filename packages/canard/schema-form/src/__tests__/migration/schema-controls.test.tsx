import { act } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import { SchemaNodeEventType, type FormTypeInputProps, type JSONSchema } from '@/schema-form';

import { type FormHarness, renderForm } from '../renderForm';

let form: FormHarness;
afterEach(() => form?.unmount());

it('LANDING-005 branches expose active nodes without branch selection APIs', async () => {
  form = await renderForm({ type: 'object', oneOf: [
    { properties: { a: { type: 'string' } } },
    { properties: { b: { type: 'string' } } },
  ] });
  expect(form.exists('/a')).toBe(true);
  expect(form.exists('/b')).toBe(true);
  expect(form.node('/a')?.active).toBe(true);
  expect(form.handle.node).not.toHaveProperty('oneOfIndex');
  expect(form.handle.node).not.toHaveProperty('anyOfIndices');
});

it('LANDING-010 allOf conditional fragments contribute rendered children', async () => {
  form = await renderForm({ type: 'object', properties: { enabled: { type: 'boolean' } },
    allOf: [{ if: { properties: { enabled: { const: true } }, required: ['enabled'] },
      then: { properties: { detail: { type: 'string', default: 'shown' } } } }],
  }, { validator: true, defaultValue: { enabled: false } });
  expect(form.exists('/detail')).toBe(false);
  await form.toggle('/enabled');
  expect(form.value('/detail')).toBe('shown');
});

it('LANDING-011 switching branches does not refill a shared existing node', async () => {
  form = await renderForm({ type: 'object', properties: { flag: { type: 'boolean' } },
    oneOf: [
      { controls: { active: './flag' }, properties: { shared: { type: 'string', default: 'first' } } },
      { controls: { active: '!./flag' }, properties: { shared: { type: 'string', default: 'second' } } },
    ],
  }, { defaultValue: { flag: true } });
  const shared = form.node('/shared');
  await form.clear('/shared');
  await form.toggle('/flag');
  expect(form.node('/shared')).toBe(shared);
  expect(form.value('/shared')).toBe('');
  expect(form.getValue()).toEqual({ flag: false });
});

it('LANDING-017 active visible and disabled are read from controls', async () => {
  form = await renderForm({ type: 'object', properties: {
    off: { type: 'string', controls: { active: false } },
    hidden: { type: 'string', controls: { visible: false } },
    locked: { type: 'string', controls: { disabled: true } },
  } });
  expect(form.node('/off')).toBeNull();
  expect(form.exists('/off')).toBe(false);
  expect(form.node('/hidden')?.visible).toBe(false);
  expect(form.field('/hidden')).toBeNull();
  expect(form.field('/locked')).toHaveProperty('disabled', true);
});

it('LANDING-027 conditional required does not select node presence', async () => {
  form = await renderForm({ type: 'object', properties: {
    flag: { type: 'boolean' }, name: { type: 'string' },
  }, if: { properties: { flag: { const: true } }, required: ['flag'] },
  then: { required: ['name'] } }, { validator: true, defaultValue: { flag: false } });
  const node = form.node('/name');
  expect(form.exists('/name')).toBe(true);
  await form.toggle('/flag');
  expect(form.node('/name')).toBe(node);
  expect(form.exists('/name')).toBe(true);
});

it('LANDING-033 flat control aliases no longer drive the input', async () => {
  const schema = { type: 'string', '&disabled': true, computed: { disabled: true } } as JSONSchema;
  form = await renderForm(schema);
  expect(form.field('')).toHaveProperty('disabled', false);
  await form.type('', 'editable');
  expect(form.getValue()).toBe('editable');
});

it('LANDING-132 conditional required updates the input required flag', async () => {
  const Input = ({ path, required }: FormTypeInputProps) =>
    <input id={path} required={required} />;
  form = await renderForm({ type: 'object', properties: {
    flag: { type: 'boolean' }, name: { type: 'string' },
  }, if: { properties: { flag: { const: true } }, required: ['flag'] },
  then: { required: ['name'] } }, { validator: true, defaultValue: { flag: false },
    formTypeInputDefinitions: [{ test: { type: 'string' }, Component: Input }],
  });
  expect(form.node('/name')?.required).toBe(false);
  await form.toggle('/flag');
  expect(form.node('/name')?.required).toBe(true);
  expect(form.field('/name')).toHaveProperty('required', true);
  await form.toggle('/flag');
  expect(form.field('/name')).toHaveProperty('required', false);
});

it('LANDING-136 expressions observe omitted empty strings as undefined', async () => {
  form = await renderForm({ type: 'object', properties: {
    name: { type: 'string' },
    exact: { type: 'string', controls: { active: '../name === ""' } },
    absent: { type: 'string', controls: { active: '!../name' } },
  } }, { defaultValue: { name: '' } });
  expect(form.exists('/exact')).toBe(false);
  expect(form.exists('/absent')).toBe(true);
  await act(async () => form.node('/name')!.setValue('present'));
  expect(form.exists('/absent')).toBe(false);
});

it('LANDING-038 effective schemas are memoized per active fragment set and notify changes', async () => {
  form = await renderForm({ type: 'object', properties: { flag: { type: 'boolean' } },
    oneOf: [
      { controls: { active: './flag' }, title: 'enabled' },
      { controls: { active: '!./flag' }, title: 'disabled' },
    ],
  }, { defaultValue: { flag: false } });
  const node = form.handle.node!;
  const initial = node.jsonSchema;
  let deliveries = 0;
  node.subscribe((event) => {
    if (event.type & SchemaNodeEventType.UpdateJsonSchema) deliveries++;
  });
  await form.toggle('/flag');
  const enabled = node.jsonSchema;
  expect(enabled).toMatchObject({ title: 'enabled' });
  expect(enabled).not.toBe(initial);
  expect(deliveries).toBe(1);
  await form.toggle('/flag');
  expect(node.jsonSchema).toBe(initial);
  expect(node.jsonSchema).toMatchObject({ title: 'disabled' });
  expect(deliveries).toBe(2);
});
