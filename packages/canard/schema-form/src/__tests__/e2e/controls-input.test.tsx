import { act } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { Form, SchemaNodeEventType, SchemaNodeState, type FormTypeInputProps, type FormTypeRendererProps } from '@/schema-form';

import { renderForm } from '../renderForm';

/** Ordinary controlled consumer; the binding owns finishInput on focus out. */
const Controlled = ({ path, value, onChange }: FormTypeInputProps) =>
  <input id={path} value={value ?? ''} onChange={(event) => onChange(event.target.value)} />;

/** Render virtual branch children using the component contract, not node internals. */
const Virtual = ({ ChildNodeComponents }: FormTypeInputProps) =>
  <section data-virtual>{ChildNodeComponents.map((Component) => <Component key={Component.key} />)}</section>;

describe('TEST-020 — finishInput and consumer presentation', () => {
  it('LANDING-145 uncontrolled blur trim refreshes the input while typing preserves spaces', async () => {
    const form = await renderForm({ type: 'object', properties: { text: { type: 'string', options: { trim: true } } } });
    try {
      await form.type('/text', '  word  ');
      const before = form.field('/text');
      expect([form.value('/text'), form.node('/text')?.value]).toEqual(['  word  ', '  word  ']);
      await form.user.tab();
      expect([form.value('/text'), form.node('/text')?.value]).toEqual(['word', 'word']);
      expect(form.field('/text')).not.toBe(before);
    } finally { form.unmount(); }
  });

  it('WRITE-083 controlled blur trim replaces raw and DOM and preserves dirty state', async () => {
    const form = await renderForm({ type: 'object', properties: { text: { type: 'string', options: { trim: true }, presentation: { FormTypeInput: Controlled } } } });
    try {
      await form.type('/text', '  word  ');
      const dirty = form.node('/text')!.state[SchemaNodeState.Dirty];
      await form.user.tab();
      expect([form.value('/text'), form.node('/text')?.value]).toEqual(['word', 'word']);
      expect(dirty).toBe(true);
      expect(form.node('/text')!.state[SchemaNodeState.Dirty]).toBe(dirty);
      await act(async () => {
        await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
      });
      expect(form.node('/text')!.state[SchemaNodeState.Touched]).toBe(true);
    } finally { form.unmount(); }
  });

  it('TEST-020 unchanged trim emits no value delivery and focus select reach the input', async () => {
    const form = await renderForm({ type: 'object', properties: { text: { type: 'string', options: { trim: true } } } }, { defaultValue: { text: 'word' } });
    const valueDelivery = vi.fn();
    const unsubscribe = form.node('/text')!.subscribe((event) => {
      if (event.type & SchemaNodeEventType.UpdateValue) valueDelivery();
    });
    try {
      await act(async () => { form.handle.focus('/text'); form.handle.select('/text'); });
      const field = form.field('/text') as HTMLInputElement;
      expect(document.activeElement).toBe(field);
      expect([field.selectionStart, field.selectionEnd]).toEqual([0, 4]);
      await form.user.tab();
      expect(valueDelivery).not.toHaveBeenCalled();
      expect(form.changeLog()).toEqual([]);
    } finally { unsubscribe(); form.unmount(); }
  });

  it('LANDING-034 presentation props and custom renderer receive the committed value', async () => {
    const form = await renderForm({ type: 'object', properties: { name: { type: 'string', presentation: {
      FormTypeInputProps: { placeholder: 'Name', className: 'custom-name' },
    } } } }, { defaultValue: { name: 'loaded' }, children: <Form.Render path="/name">
      {({ Input, value }: FormTypeRendererProps) => <section><output>{String(value ?? '')}</output><Input /></section>}
    </Form.Render> });
    try {
      expect(form.field('/name')?.getAttribute('placeholder')).toBe('Name');
      expect(form.field('/name')?.classList.contains('custom-name')).toBe(true);
      await form.type('/name', 'edited');
      expect(form.container.querySelector('output')?.textContent).toBe('edited');
      expect(form.getValue()).toEqual({ name: 'edited' });
    } finally { form.unmount(); }
  });

  it('LANDING-167 inline virtual input receives children and resolves the referenced node', async () => {
    const form = await renderForm({ type: 'object', properties: { name: { type: 'string' } }, options: {
      virtual: { group: { fields: ['name'], presentation: { FormTypeInput: Virtual } } },
    } }, { defaultValue: { name: 'loaded' } });
    try {
      expect(form.node('/group/name')).toBe(form.node('/name'));
      expect(form.container.querySelector('[data-virtual] input')?.getAttribute('id')).toBe('/name');
      await act(async () => { form.node('/group')!.setValue(['whole']); });
      expect(form.getValue()).toEqual({ name: 'whole' });
      expect(form.value('/name')).toBe('whole');
    } finally { form.unmount(); }
  });
});
