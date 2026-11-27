import { act } from 'react';

import { expect, it } from 'vitest';

import type { JSONSchema } from '@/schema-form';

import { renderForm } from '../renderForm';

it('rebuild replaces a prepared branch host and retains the reset value and DOM', async () => {
  const schema: JSONSchema = {
    type: 'object',
    properties: {
      kind: { type: 'number', default: 0 },
      fixed: { type: 'string', default: 'fixed' },
    },
    oneOf: [
      {
        controls: { active: './kind === 0' },
        properties: { a: { type: 'string', default: 'a' } },
      },
      {
        controls: { active: './kind === 1' },
        properties: { b: { type: 'string', default: 'b' } },
      },
    ],
  };
  const form = await renderForm(schema);
  try {
    await act(async () => {
      form.node('/kind')!.setValue(1);
    });
    await act(async () => {
      form.node('/kind')!.setValue(0);
    });
    const previous = form.node('/kind');
    await act(async () => {
      form.handle.rebuild();
    });
    expect(form.node('/kind')).not.toBe(previous);
    expect(form.getValue()).toEqual({ kind: 0, fixed: 'fixed', a: 'a' });
    expect(form.exists('/a')).toBe(true);
    expect(form.exists('/b')).toBe(false);
    await act(async () => {
      form.node('/kind')!.setValue(1);
    });
    expect(form.getValue()).toEqual({ kind: 1, fixed: 'fixed', b: 'b' });
    expect(form.exists('/a')).toBe(false);
    expect(form.exists('/b')).toBe(true);
  } finally {
    form.unmount();
  }
});
