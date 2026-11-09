import { useLayoutEffect, useRef } from 'react';

import { act } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { FieldInputProps } from '@/schema-form';

import { type FormHarness, renderForm } from '../renderForm';
import {
  FocusSilentObserver,
  focusSchema,
  focusTarget,
  focusVirtualization,
} from './helpers/focusFixtures';

/** Each case releases its form before restoring browser observations. */
let form: FormHarness;
beforeEach(() => vi.stubGlobal('IntersectionObserver', FocusSilentObserver));
afterEach(() => {
  form?.unmount();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

// filid:contract exact-focus
describe.each([false, true])(
  'no-gate focus fallback strict=%s',
  (strictMode) => {
    it('suppresses fallback focus after movement before the microtask', async () => {
      const Input = ({ path }: FieldInputProps) => <input id={path} disabled />;
      form = await renderForm(focusSchema, {
        strictMode,
        virtualization: { ...focusVirtualization, threshold: 100 },
        fieldInputMap: { [focusTarget]: Input },
      });
      const target = form.field(focusTarget)!;
      const control = form.field('/first')!;
      expect(target).not.toBeNull();
      expect(form.deferredPaths()).toHaveLength(0);
      const focus = vi.spyOn(target, 'focus');
      await act(async () => {
        form.handle.focus(focusTarget);
        control.focus();
      });
      expect(document.activeElement).toBe(control);
      expect(focus).not.toHaveBeenCalled();
    });

    it('releases listeners after a reentrant Mount produces no focus event', async () => {
      const Input = ({ path }: FieldInputProps) => {
        const requested = useRef(false);
        useLayoutEffect(() => {
          if (requested.current) return;
          requested.current = true;
          form.handle.focus(path);
        }, [path]);
        return <input id={path} />;
      };
      form = await renderForm(focusSchema, {
        strictMode,
        virtualization: focusVirtualization,
        fieldInputMap: { [focusTarget]: Input },
      });
      const add = vi.spyOn(document, 'addEventListener');
      const remove = vi.spyOn(document, 'removeEventListener');
      const focus = vi
        .spyOn(HTMLElement.prototype, 'focus')
        .mockImplementation(() => {});
      await act(async () => form.handle.focus(focusTarget));
      const target = form.field(focusTarget);
      expect(target).not.toBeNull();
      expect(
        focus.mock.contexts.filter((element) => element === target),
      ).toHaveLength(1);
      expect(document.activeElement).toBe(document.body);
      for (const event of ['focusin', 'focusout']) {
        const listeners = add.mock.calls.filter(([name]) => name === event);
        expect(listeners).toHaveLength(2);
        for (const [, listener] of listeners)
          expect(remove).toHaveBeenCalledWith(event, listener, true);
      }
    });
  },
);
