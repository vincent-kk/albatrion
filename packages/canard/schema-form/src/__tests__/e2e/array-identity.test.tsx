import { act } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import type { FormTypeInputProps } from '@/schema-form';

import { renderForm } from '../renderForm';

/** Expose the stable React item key supplied to a branch input consumer. */
const Items = ({ ChildNodeComponents }: FormTypeInputProps) => <>
  {ChildNodeComponents.map((Child) => <section key={Child.key} data-item-key={Child.key} data-item-path={Child.path}><Child /></section>)}
</>;

const arraySchema = { type: 'array', options: { terminal: false }, items: { type: 'string' }, presentation: { FormTypeInput: Items } } as const;

describe('NODE-051 / VALUE-034 — array consumer observations', () => {
  it('LANDING-164 whole-array reorder retains positional nodes and unchanged focused input', async () => {
    const form = await renderForm(arraySchema, { defaultValue: ['a', 'b', 'c'], instrument: true });
    try {
      const nodes = [form.node('/0'), form.node('/1'), form.node('/2')];
      const keys = Array.from(form.container.querySelectorAll('[data-item-key]'), (element) => element.getAttribute('data-item-key'));
      await form.user.click(form.field('/1')!);
      const focused = form.field('/1');
      const mounts = [0, 1, 2].map((index) => form.mountOrdinal(`/${index}`));
      await form.setValue(['c', 'b', 'a']);
      expect([form.node('/0'), form.node('/1'), form.node('/2')]).toEqual(nodes);
      expect(Array.from(form.container.querySelectorAll('[data-item-key]'), (element) => element.getAttribute('data-item-key'))).toEqual(keys);
      expect(form.field('/1')).toBe(focused);
      expect(document.activeElement).toBe(focused);
      expect(form.mountOrdinal('/1')).toBe(mounts[1]);
      expect(form.mountOrdinal('/0')).toBeGreaterThan(mounts[0]);
      expect(form.mountOrdinal('/2')).toBeGreaterThan(mounts[2]);
      expect([form.value('/0'), form.value('/1'), form.value('/2')]).toEqual(['c', 'b', 'a']);
    } finally { form.unmount(); }
  });

  it('NODE-051 remove shifts the surviving item key and focused DOM and push creates one item', async () => {
    const form = await renderForm(arraySchema, { defaultValue: ['a', 'b'], instrument: true });
    try {
      const node = form.node('/1')!;
      const key = form.container.querySelector('[data-item-path="/1"]')!.getAttribute('data-item-key');
      const input = form.field('/1');
      await form.user.click(input!);
      await act(async () => { const root = form.handle.node!; if (root.type === 'array') root.remove(0); });
      expect(form.node('/0')).toBe(node);
      expect(form.container.querySelector('[data-item-path="/0"]')!.getAttribute('data-item-key')).toBe(key);
      expect(form.field('/0')).toBe(input);
      expect(document.activeElement).toBe(input);
      await act(async () => { const root = form.handle.node!; if (root.type === 'array') root.push('c'); });
      expect(form.node('/0')).toBe(node);
      expect(form.container.querySelector('[data-item-path="/1"]')!.getAttribute('data-item-key')).not.toBe(key);
      expect(form.getValue()).toEqual(['b', 'c']);
    } finally { form.unmount(); }
  });

  it('VALUE-034 omitted trailing slots keep validation indexes and editable inputs', async () => {
    const form = await renderForm({ type: 'array', options: { omitTrailing: true }, items: { type: 'string', minLength: 2 } }, {
      defaultValue: ['valid', 'x', undefined], validator: true, showError: true,
    });
    try {
      const errors = await form.validate();
      expect(errors.some((error) => error.dataPath === '/1')).toBe(true);
      expect(errors.some((error) => error.dataPath === '/2')).toBe(false);
      expect(form.exists('/2')).toBe(true);
      expect(form.getValue()).toEqual(['valid', 'x']);
      expect(form.errorTexts().join(' ')).not.toBe('');
      await form.type('/1', 'valid');
      expect(await form.validate()).toEqual([]);
    } finally { form.unmount(); }
  });
});
