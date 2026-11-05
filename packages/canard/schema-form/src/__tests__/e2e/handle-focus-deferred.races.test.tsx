import { act } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { type FieldInputProps, FieldNodeEventType } from '@/schema-form';

import { type FormHarness, renderForm } from '../renderForm';
import {
  FocusSilentObserver,
  focusSchema,
  focusTarget,
  focusVirtualization,
} from './helpers/focusFixtures';

/** Current form and its isolated error observers. */
let form: FormHarness;
beforeEach(() => vi.stubGlobal('IntersectionObserver', FocusSilentObserver));
afterEach(() => {
  form?.unmount();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

// filid:contract exact-focus
describe.each([false, true])('focus races strict=%s', (strictMode) => {
  it('replaces a pending request with a different target', async () => {
    form = await renderForm(focusSchema, {
      validator: true,
      strictMode,
      virtualization: focusVirtualization,
    });
    await act(async () => {
      form.handle.focus(focusTarget);
      form.handle.focus('/sibling');
    });
    expect(document.activeElement).toBe(form.field('/sibling'));
  });
  it('reuses an opening gate for the later request below it', async () => {
    form = await renderForm(focusSchema, {
      validator: true,
      strictMode,
      virtualization: focusVirtualization,
    });
    await act(async () => {
      form.handle.focus('/outer/first');
      form.handle.focus(focusTarget);
    });
    expect(form.field(focusTarget)).not.toBeNull();
    expect(document.activeElement).toBe(form.field(focusTarget));
  });
  it('respects a user focus movement before the reveal commit', async () => {
    form = await renderForm(focusSchema, {
      validator: true,
      strictMode,
      virtualization: focusVirtualization,
    });
    await act(async () => {
      form.handle.focus(focusTarget);
      form.field('/first')!.focus();
    });
    expect(document.activeElement).toBe(form.field('/first'));
  });
  it('remembers focus moving away and back to the starting control', async () => {
    form = await renderForm(focusSchema, {
      validator: true,
      strictMode,
      virtualization: focusVirtualization,
    });
    const outside = document.body.appendChild(document.createElement('button'));
    try {
      form.field('/first')!.focus();
      await act(async () => {
        form.handle.focus(focusTarget);
        outside.focus();
        form.field('/first')!.focus();
      });
      expect(document.activeElement).toBe(form.field('/first'));
    } finally {
      outside.remove();
    }
  });
  it('cancels a gate removed before commit and never focuses its later mount', async () => {
    form = await renderForm(
      {
        type: 'object',
        properties: {
          show: { type: 'boolean', default: true },
          outer: {
            ...focusSchema.properties!.outer,
            controls: { visible: '../show' },
          },
        },
      },
      { validator: true, strictMode, virtualization: focusVirtualization },
    );
    await act(async () => {
      form.handle.focus(focusTarget);
      form.node('/show')!.setValue(false);
    });
    await form.flush();
    await act(async () => form.node('/show')!.setValue(true));
    expect(form.field(focusTarget)).not.toBeNull();
    expect(document.activeElement).not.toBe(form.field(focusTarget));
  });
  it('handles a nested focus request from a mounted input onFocus without replay stealing it', async () => {
    const First = ({ path }: FieldInputProps) => (
      <input id={path} onFocus={() => form.handle.focus('/sibling')} />
    );
    form = await renderForm(focusSchema, {
      validator: true,
      strictMode,
      virtualization: focusVirtualization,
      fieldInputMap: { '/first': First },
    });
    await act(async () => form.handle.focus('/first'));
    expect(document.activeElement).toBe(form.field('/sibling'));
    await act(async () => form.handle.focus(focusTarget));
    expect(document.activeElement).toBe(form.field(focusTarget));
  });
  it('does not enqueue an uncancellable target request during another node delivery', async () => {
    form = await renderForm(focusSchema, {
      validator: true,
      strictMode,
      virtualization: focusVirtualization,
    });
    const unsubscribe = form.node('/first')!.subscribe(({ type }) => {
      if (type & FieldNodeEventType.UpdateValue) form.handle.focus('/sibling');
    });
    await act(async () => form.node('/first')!.setValue('changed'));
    expect(document.activeElement).toBe(form.field('/sibling'));
    unsubscribe();
    await act(async () => form.handle.focus(focusTarget));
    expect(document.activeElement).toBe(form.field(focusTarget));
  });
});
