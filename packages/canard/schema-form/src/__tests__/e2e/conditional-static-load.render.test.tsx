import { plugin } from '@canard/schema-form-ajv8-plugin';
import { afterEach, expect, it } from 'vitest';

import { type JSONSchema, ValidationMode } from '@/schema-form';

import { type FormHarness, renderForm } from '../renderForm';

/** Public constraints fixture retains its original vacuous properties guard. */
const schema = {
  type: 'object',
  required: ['value'],
  properties: {
    kind: { type: 'string', default: 'a' },
    value: { type: 'string', default: 'x' },
  },
  if: { properties: { kind: { const: 'a' } } },
  then: { properties: { value: { minLength: 2 } } },
  else: { properties: { value: { maxLength: 3 } } },
} satisfies JSONSchema;
/** Mounted form is disposed between validator bindings. */
let form: FormHarness;
afterEach(() => form?.unmount());
// filid:contract conditional-static-load-render
it.each([false, true])(
  'T10 publishes complete DOM and constraints with validator=%s',
  async (selected) => {
    const events: string[] = [];
    form = await renderForm(schema, {
      validatorFactory: selected ? plugin.validator : undefined,
      validationMode: selected ? ValidationMode.OnChange : ValidationMode.None,
      onChange: () => events.push('change'),
      onValidate: () => events.push('validate'),
    });
    expect(form.getValue()).toEqual({ kind: 'a', value: 'x' });
    expect(form.container.querySelectorAll('input')).toHaveLength(2);
    expect(form.node('/value')!.isRequired).toBe(true);
    if (selected) expect(form.node('/value')!.jsonSchema).toMatchObject({ minLength: 2 });
    else expect(form.node('/value')!.jsonSchema).not.toHaveProperty('minLength');
    const valueNode = form.node('/value');
    await form.setValue({ kind: 'b', value: 'x' });
    expect(form.node('/value')).toBe(valueNode);
    if (selected) expect(form.node('/value')!.jsonSchema).toMatchObject({ maxLength: 3 });
    else expect(form.node('/value')!.jsonSchema).not.toHaveProperty('maxLength');
    expect(form.value('/kind')).toBe('b');
    expect(events.filter((event) => event === 'change')).toHaveLength(1);
    if (selected) {
      expect(events[0]).toBe('validate');
      expect(events.indexOf('change')).toBeLessThan(
        events.lastIndexOf('validate'),
      );
      expect(form.node('/value')!.errors).toEqual([]);
    } else expect(events).toEqual(['change']);
  },
);
it('T10 unsupported required/control overlay keeps ordinary behavior', async () => {
  form = await renderForm(
    {
      ...schema,
      required: [],
      then: {
        required: ['value'],
        properties: { value: { controls: { visible: false } } },
      },
    },
    { validatorFactory: plugin.validator, validationMode: ValidationMode.None },
  );
  expect(form.node('/value')!.isRequired).toBe(true);
  expect(form.node('/value')!.isVisible).toBe(false);
});
