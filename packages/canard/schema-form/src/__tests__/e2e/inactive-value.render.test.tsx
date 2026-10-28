import { expect, it, vi } from 'vitest';

import { renderForm } from '../renderForm';

it('shows declared and listener exit values after re-entry', async () => {
  const form = await renderForm(
    {
      type: 'object',
      properties: {
        open: { type: 'boolean' },
        declared: {
          type: 'string',
          controls: { active: '../open', inactiveValue: 'declared exit' },
        },
        observed: { type: 'string', controls: { active: '../open' } },
      },
    },
    { defaultValue: { open: true, declared: 'before', observed: 'before' } },
  );
  try {
    form.node('/observed')!.onInactive(() => 'listener exit');
    await form.toggle('/open');
    expect(form.exists('/declared')).toBe(false);
    expect(form.exists('/observed')).toBe(false);
    await form.toggle('/open');
    expect(form.value('/declared')).toBe('declared exit');
    expect(form.value('/observed')).toBe('listener exit');
  } finally {
    form.unmount();
  }
});

it('does not call onInactive or inactiveValue during form unmount', async () => {
  const resolver = vi.fn(() => 'after');
  const listener = vi.fn(() => 'after');
  const form = await renderForm(
    {
      type: 'object',
      properties: {
        value: { type: 'string', controls: { inactiveValue: resolver } },
      },
    },
    { defaultValue: { value: 'before' } },
  );
  form.node('/value')!.onInactive(listener);
  form.unmount();
  expect(resolver).not.toHaveBeenCalled();
  expect(listener).not.toHaveBeenCalled();
});
