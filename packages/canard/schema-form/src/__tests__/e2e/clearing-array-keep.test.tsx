import { expect, it } from 'vitest';

import { renderForm } from '../renderForm';

it.each([false, true])(
  'restores compacted kept inputs on screen with previously inactive=%s',
  async (inactive) => {
    const form = await renderForm(
      {
        type: 'object',
        properties: {
          open: { type: 'boolean' },
          show: { type: 'boolean' },
          list: {
            type: 'array',
            controls: { active: '#/open', unsetOnInactive: true },
            items: {
              type: 'object',
              properties: {
                drop: { type: 'string' },
                keep: {
                  type: 'string',
                  controls: { active: '#/show', unsetOnInactive: false },
                },
              },
            },
          },
        },
      },
      {
        defaultValue: {
          open: true,
          show: true,
          list: [{ drop: 'discard' }, { drop: 'discard', keep: 'held' }],
        },
      },
    );
    try {
      if (inactive) await form.toggle('/show');
      await form.toggle('/open');
      expect(form.exists('/list/1/keep')).toBe(false);
      expect(form.handle.node!.inactiveValues).toEqual([
        { path: '/list/0/keep', value: 'held' },
      ]);
      await form.toggle('/open');
      expect(form.node('/list')!.children).toHaveLength(1);
      expect(form.exists('/list/0/keep')).toBe(!inactive);
      if (inactive) await form.toggle('/show');
      expect(form.value('/list/0/keep')).toBe('held');
      expect(form.getValue()).toEqual({
        open: true,
        show: true,
        list: [{ keep: 'held' }],
      });
    } finally {
      form.unmount();
    }
  },
);
