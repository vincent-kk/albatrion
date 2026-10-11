import { act } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Form, type JSONSchema, type FormTypeRendererProps } from '@/schema-form';

import { renderForm } from '../renderForm';

/** Multiple consumers subscribe independently to the same branch commit. */
const Views = () => <>
  <section data-view="first"><Form.Render>{({ Input }) => <Input />}</Form.Render></section>
  <section data-view="second"><Form.Render>{({ Input }) => <Input />}</Form.Render></section>
  <section data-view="split"><Form.Label path="/name" /><Form.Input path="/name" /><Form.Error path="/name" /></section>
  <Form.Render>{({ value }: FormTypeRendererProps) => <output>{JSON.stringify(value)}</output>}</Form.Render>
</>;

describe('VALIDATE-010 / VALIDATE-036 split render disposition', () => {
  it('VALIDATE-010 branch switches update children and errors together', async () => {
    const schema: JSONSchema = { type: 'object', properties: { kind: { type: 'string' }, name: { type: 'string', minLength: 3, title: 'Name' } }, oneOf: [
      { controls: { active: './kind === "a"' }, properties: { kind: { const: 'a' }, a: { type: 'string' } } },
      { controls: { active: './kind === "b"' }, properties: { kind: { const: 'b' }, b: { type: 'string' } } },
    ] };
    const form = await renderForm(schema, { validator: true, showError: true, defaultValue: { kind: 'a', name: 'x', a: 'A' }, children: <Views /> });
    try {
      expect((await form.validate()).length).toBeGreaterThan(0);
      expect(form.container.querySelector('[data-view="split"] em')?.textContent).toBeTruthy();
      await form.setValue({ kind: 'b', name: 'valid', b: 'B' });
      expect(await form.validate()).toEqual([]);
      for (const view of form.container.querySelectorAll('[data-view="first"], [data-view="second"]')) {
        expect(view.querySelector('[data-path="/a"]')).toBeNull();
        expect(view.querySelector('[data-path="/b"] input')?.getAttribute('id')).toBe('/b');
      }
      expect(form.errorTexts()).toEqual([]);
      expect(form.container.querySelector('output')?.textContent).toBe('{"kind":"b","name":"valid","b":"B"}');
    } finally { form.unmount(); }
  });

  it('VALIDATE-036 standard oneOf has no error when another branch is valid', async () => {
    const form = await renderForm({ type: 'object', properties: { name: { type: 'string' }, pick: { type: 'boolean' } }, oneOf: [
      { controls: { active: './pick' }, properties: { name: { minLength: 10 } }, required: ['name'] },
      { controls: { active: '!./pick' }, properties: { name: { maxLength: 3 } }, required: ['name'] },
    ] }, { validator: true, showError: true, defaultValue: { name: 'ok', pick: true }, children: <Views /> });
    try {
      expect(await form.validate()).toEqual([]);
      expect(form.errorTexts()).toEqual([]);
      await act(async () => { form.node('/pick')!.setValue(false); });
      expect(await form.validate()).toEqual([]);
      expect(form.value('/name')).toBe('ok');
    } finally { form.unmount(); }
  });

  it('LANDING-207 ungated recursive object variants report RECURSIVE_SHAPE_UNBOUNDED with fallback DOM', async () => {
    const schema: JSONSchema = { $defs: { node: { type: 'object', properties: {
      next: { anyOf: [{ $ref: '#/$defs/node' }, { type: 'null' }] },
    } } }, $ref: '#/$defs/node' };
    const form = await renderForm(schema);
    try {
      expect(form.errorRecords().map(({ code }) => code)).toContain('JSON_SCHEMA_ERROR.RECURSIVE_SHAPE_UNBOUNDED');
      expect(form.container.textContent).toContain('Unable to load form.');
      expect(form.renderedPaths()).toEqual([]);
    } finally { form.unmount(); }
  });
});
