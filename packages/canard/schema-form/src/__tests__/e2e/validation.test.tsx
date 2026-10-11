import { findScenarioHandle, playScenario, registerScenarioHandle, validationScenarios } from '@aileron/schema-form-scenarios';
import Ajv from 'ajv/dist/2020';
import { afterEach, expect, it } from 'vitest';

import { Form, type JSONSchema, type ValidationIssue } from '@/schema-form';

import { createRenderValidator } from '../helpers/createRenderValidator';
import { type FormHarness, renderForm } from '../renderForm';

let form: FormHarness;
afterEach(() => form?.unmount());

for (const scenario of validationScenarios) it(`TEST-023 ${scenario.name}`, async () => {
  form = await renderForm(scenario.schema as JSONSchema, { defaultValue: scenario.initialValue, validator: true, showError: true, children: <><Form.Group /><Form.Error /></> });
  const base = findScenarioHandle(form.container).adapter;
  const unregister = registerScenarioHandle(form.container, form.handle, {
    execute: base.execute, settle: base.settle,
    async assert(observation) {
      const { errors, ...rest } = observation;
      await base.assert(rest);
      if (errors) {
        await form.validate();
        for (const [path, expected] of Object.entries(errors)) {
          const actual = form.node(path)?.errors;
          expect(actual, `validation issue count at ${path}`).toHaveLength(expected.length);
          expect(actual, `validation issue contract at ${path}`).toMatchObject(expected);
        }
      }
    },
  });
  try { await playScenario(scenario, form.container); }
  finally { unregister(); }
  expect(form.errorTexts().length).toBeGreaterThan(0);
});

it('TEST-005 nullable-formats', async () => {
  const base = createRenderValidator();
  const ajv = new Ajv({ strict: false, allErrors: true });
  ajv.addFormat('email', /^[^@\s]+@[^@\s]+\.[^@\s]+$/);
  form = await renderForm({ type: 'object', properties: { email: { type: ['string', 'null'], format: 'email' } } }, {
    defaultValue: { email: null }, showError: true,
    validatorFactory: { ...base, compile(schema) {
      const validate = ajv.compile(schema);
      return (value) => validate(value) ? null : (validate.errors ?? []).map((error): ValidationIssue => ({ dataPath: error.instancePath, schemaPath: error.schemaPath, keyword: error.keyword, message: error.message }));
    } },
  });
  expect(await form.validate()).toEqual([]);
  await form.type('/email', 'invalid');
  expect(await form.validate()).toEqual([expect.objectContaining({ dataPath: '/email', keyword: 'format' })]);
  expect(form.errorTexts().length).toBeGreaterThan(0);
  await form.type('/email', 'valid@example.test');
  expect(await form.validate()).toEqual([]);
});

it('LANDING-115 active conditional required and maxItems errors exclude inactive fragments', async () => {
  form = await renderForm({ type: 'object', properties: { enabled: { type: 'boolean' } }, allOf: [
    { if: { properties: { enabled: { const: true } }, required: ['enabled'] }, then: { properties: { text: { type: 'string' }, rows: { type: 'array', maxItems: 1, items: { type: 'string' } } }, required: ['text'] } },
  ] }, { defaultValue: { enabled: true, rows: ['a', 'b'] }, validator: true, showError: true });
  const errors = await form.validate();
  expect(errors).toEqual(expect.arrayContaining([expect.objectContaining({ dataPath: '/text', keyword: 'required' }), expect.objectContaining({ dataPath: '/rows', keyword: 'maxItems' })]));
  expect(form.errorTexts().length).toBeGreaterThan(0);
  await form.toggle('/enabled');
  const inactive = await form.validate();
  expect(inactive.filter((error) => error.dataPath === '/text' || error.dataPath === '/rows')).toEqual([]);
  expect(form.exists('/text')).toBe(false);
  expect(form.exists('/rows')).toBe(false);
});

it('TEST-005 nullable price rejects values outside minimum and maximum', async () => {
  form = await renderForm({ type: 'object', properties: { price: { type: ['number', 'null'], minimum: 0, maximum: 100 } } }, { defaultValue: { price: null }, validator: true, showError: true });
  await form.type('/price', '-1');
  expect(await form.validate()).toEqual([expect.objectContaining({ dataPath: '/price', keyword: 'minimum' })]);
  await form.type('/price', '101');
  expect(await form.validate()).toEqual([expect.objectContaining({ dataPath: '/price', keyword: 'maximum' })]);
  await form.setValue({ price: null });
  expect(await form.validate()).toEqual([]);
});
