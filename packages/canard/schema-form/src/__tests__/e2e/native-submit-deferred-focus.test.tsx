import { act, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { JSONSchema } from '@/schema-form';

import { type FormHarness, renderForm } from '../renderForm';
import { FocusRootWithSubmit } from './helpers/FocusRootWithSubmit';
import {
  FocusSilentObserver,
  focusSchema,
  focusTarget,
  focusVirtualization,
} from './helpers/focusFixtures';

/** Current form with error records and host sink checked after each native submission. */
let form: FormHarness;
beforeEach(() => vi.stubGlobal('IntersectionObserver', FocusSilentObserver));
afterEach(() => {
  form?.unmount();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

// filid:contract exact-focus
describe.each([false, true])('native exact focus strict=%s', (strictMode) => {
  it.each(['enter', 'button'] as const)(
    'focuses the exact invalid descendant after %s submission',
    async (method) => {
      form = await renderForm(focusSchema, {
        validator: true,
        strictMode,
        virtualization: focusVirtualization,
        fieldInputMap: { '': FocusRootWithSubmit },
      });
      if (method === 'enter') {
        await form.user.click(form.field('/first')!);
        await form.user.keyboard('{Enter}');
      } else
        await form.user.click(
          form.container.querySelector('button[type="submit"]')!,
        );
      await waitFor(() => {
        expect(form.field(focusTarget)).not.toBeNull();
        expect(document.activeElement).toBe(form.field(focusTarget));
      });
      expect(form.deferred('/sibling')).toBe(true);
      expect(form.errorRecords()).toEqual([]);
      expect(form.sinkErrors()).toEqual([]);
    },
  );
  it('skips hidden and disabled invalid candidates before the deferred target', async () => {
    const schema: JSONSchema = {
      type: 'object',
      properties: {
        hidden: {
          type: 'string',
          minLength: 3,
          default: 'x',
          controls: { visible: false },
        },
        disabled: {
          type: 'string',
          minLength: 3,
          default: 'x',
          controls: { disabled: true },
        },
        ...focusSchema.properties,
      },
    };
    form = await renderForm(schema, {
      validator: true,
      strictMode,
      virtualization: focusVirtualization,
      fieldInputMap: { '': FocusRootWithSubmit },
    });
    await form.user.click(
      form.container.querySelector('button[type="submit"]')!,
    );
    await waitFor(() => {
      expect(form.field(focusTarget)).not.toBeNull();
      expect(document.activeElement).toBe(form.field(focusTarget));
    });
    expect(form.errorRecords()).toEqual([]);
    expect(form.sinkErrors()).toEqual([]);
  });
  it('focuses an invalid field whose own position is deferred', async () => {
    form = await renderForm(
      {
        type: 'object',
        properties: {
          first: { type: 'string' },
          target: { type: 'string', minLength: 3, default: 'x' },
        },
      },
      {
        validator: true,
        strictMode,
        virtualization: focusVirtualization,
        fieldInputMap: { '': FocusRootWithSubmit },
      },
    );
    expect(form.deferred('/target')).toBe(true);
    await form.user.click(
      form.container.querySelector('button[type="submit"]')!,
    );
    await waitFor(() =>
      expect(document.activeElement).toBe(form.field('/target')),
    );
    expect(form.errorRecords()).toEqual([]);
    expect(form.sinkErrors()).toEqual([]);
  });
  it('does not confuse a placeholder path prefix with a child edge', async () => {
    form = await renderForm(
      {
        type: 'object',
        properties: {
          first: { type: 'string' },
          late: { type: 'string' },
          later: { type: 'string' },
        },
      },
      { validator: true, strictMode, virtualization: focusVirtualization },
    );
    expect(form.deferred('/late')).toBe(true);
    expect(form.deferred('/later')).toBe(true);
    await act(async () => form.handle.focus('/later'));
    expect(document.activeElement).toBe(form.field('/later'));
    expect(form.deferred('/late')).toBe(true);
  });
  it('reveals and focuses only the requesting form with identical deferred paths', async () => {
    const other = await renderForm(focusSchema, {
      validator: true,
      strictMode,
      virtualization: focusVirtualization,
    });
    try {
      form = await renderForm(focusSchema, {
        validator: true,
        strictMode,
        virtualization: focusVirtualization,
      });
      expect(form.deferred('/outer')).toBe(true);
      expect(other.deferred('/outer')).toBe(true);
      const focus = vi.spyOn(HTMLElement.prototype, 'focus');
      await act(async () => form.handle.focus(focusTarget));
      const target = form.field(focusTarget);
      expect(target).not.toBeNull();
      expect(document.activeElement).toBe(target);
      expect(
        focus.mock.contexts.filter((element) => element === target),
      ).toHaveLength(1);
      expect(
        focus.mock.contexts.filter((element) =>
          element instanceof Node && other.container.contains(element),
        ),
      ).toHaveLength(0);
      expect(other.field(focusTarget)).toBeNull();
      expect(other.deferred('/outer')).toBe(true);
    } finally {
      other.unmount();
    }
  });
});
