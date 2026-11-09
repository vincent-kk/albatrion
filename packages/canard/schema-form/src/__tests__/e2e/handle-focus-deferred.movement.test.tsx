import { act } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { type FormHarness, renderForm } from '../renderForm';
import {
  FocusSilentObserver,
  focusSchema,
  focusTarget,
  focusVirtualization,
} from './helpers/focusFixtures';

/** Each case owns one form and its pending focus lifetime. */
let form: FormHarness;
beforeEach(() => vi.stubGlobal('IntersectionObserver', FocusSilentObserver));
afterEach(() => {
  form?.unmount();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

// filid:contract exact-focus
describe.each([false, true])(
  'focus leaving a control strict=%s',
  (strictMode) => {
    it('remembers blur to the body before reveal removes the starting placeholder', async () => {
      const Placeholder = () => <button>deferred control</button>;
      form = await renderForm(focusSchema, {
        strictMode,
        virtualization: { ...focusVirtualization, Placeholder },
      });
      const control = form.wrapper('/outer')!.querySelector('button')!;
      control.focus();
      expect(document.activeElement).toBe(control);
      const focus = vi.spyOn(HTMLElement.prototype, 'focus');
      await act(async () => {
        form.handle.focus(focusTarget);
        control.blur();
        expect(document.activeElement).toBe(document.body);
        expect(control.isConnected).toBe(true);
      });
      const target = form.field(focusTarget);
      expect(target).not.toBeNull();
      expect(control.isConnected).toBe(false);
      expect(
        focus.mock.contexts.filter((element) => element === target),
      ).toHaveLength(0);
      expect(document.activeElement).toBe(document.body);
    });
    it('suppresses pending focus when blur moves focus to the page body', async () => {
      form = await renderForm(focusSchema, {
        validator: true,
        strictMode,
        virtualization: focusVirtualization,
      });
      const control = form.field('/first')!;
      control.focus();
      const focus = vi.spyOn(HTMLElement.prototype, 'focus');
      await act(async () => {
        form.handle.focus(focusTarget);
        control.blur();
      });
      const target = form.field(focusTarget);
      expect(target).not.toBeNull();
      expect(document.activeElement).toBe(document.body);
      expect(
        focus.mock.contexts.filter((element) => element === target),
      ).toHaveLength(0);
    });
    it('keeps pending focus when the starting element is removed during reveal', async () => {
      form = await renderForm(focusSchema, {
        validator: true,
        strictMode,
        virtualization: focusVirtualization,
      });
      const control = document.body.appendChild(
        document.createElement('button'),
      );
      try {
        control.focus();
        const focus = vi.spyOn(HTMLElement.prototype, 'focus');
        await act(async () => {
          form.handle.focus(focusTarget);
          control.remove();
        });
        const target = form.field(focusTarget);
        expect(target).not.toBeNull();
        expect(document.activeElement).toBe(target);
        expect(
          focus.mock.contexts.filter((element) => element === target),
        ).toHaveLength(1);
      } finally {
        control.remove();
      }
    });
  },
);
