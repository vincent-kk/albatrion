import * as React from 'react';
import { StrictMode, Suspense, createRef } from 'react';

import { act, fireEvent, render } from '@testing-library/react';
import { expect, inject, vi } from 'vitest';

import { Form, type FormHandle, ValidationMode } from '@/schema-form';

import { HiddenFormGate } from '../../helpers/HiddenFormGate';
import { repeatHiddenInput } from './repeatHiddenInput';

/** Hide a committed public Form, write through a retained producer and compare its revealed input.
 * @param boundary - Supported React lifecycle boundary, using Activity only on React 19.
 * @param strict - Whether React replays mount effects through StrictMode.
 * @param writer - Public producer retained before the Form ref disconnects.
 * @param composing - Start an IME session whose end event cannot arrive while hidden.
 * @param legacyRoot - Exercise React 18's legacy root without concurrent effect disconnection.
 * @returns Resolves after 20 fresh mounts; rejects with every stale input and callback mismatch.
 */
export const exerciseHiddenInput = async (
  boundary: 'activity' | 'suspense',
  strict: boolean,
  writer: 'setValue' | 'reset' | 'node',
  composing = false,
  legacyRoot = false,
) => {
  return repeatHiddenInput(
    20,
    `hidden-resync React ${inject('reactMajor')} ${boundary} strict=${strict} ${writer} composing=${composing} legacy=${legacyRoot}`,
    async (cycle, compare) => {
      const ref = createRef<FormHandle>();
      const onChange = vi.fn();
      const form = (
        <Form
          ref={ref}
          jsonSchema={{
            type: 'object',
            properties: { value: { type: 'string' } },
          }}
          defaultValue={{ value: 'initial' }}
          validationMode={ValidationMode.None}
          onChange={onChange}
        />
      );
      const wrap = (hidden: boolean) => {
        const child =
          boundary === 'activity' ? (
            <React.Activity mode={hidden ? 'hidden' : 'visible'}>
              {form}
            </React.Activity>
          ) : (
            <Suspense fallback={<span data-testid="fallback">hidden</span>}>
              {form}
              <HiddenFormGate hidden={hidden} />
            </Suspense>
          );
        return strict ? <StrictMode>{child}</StrictMode> : child;
      };
      const view = render(wrap(false), { legacyRoot });
      const handle = ref.current!;
      const root = handle.node!;
      const input = view.container.querySelector('input')!;
      fireEvent.change(input, { target: { value: `visible-${cycle}` } });
      expect(handle.findNode('/value')!.value).toBe(`visible-${cycle}`);
      if (composing) fireEvent.compositionStart(input);
      view.rerender(wrap(true));
      expect(input.closest('form')!.style.display).toBe('none');
      const next = writer === 'reset' ? 'initial' : `hidden-${cycle}`;
      onChange.mockClear();
      act(() => {
        if (writer === 'reset') handle.reset();
        else if (writer === 'node') root.setValue({ value: next });
        else handle.setValue({ value: next });
      });
      expect(handle.findNode('/value')!.value).toBe(next);
      expect(onChange).toHaveBeenCalledExactlyOnceWith({ value: next });
      view.rerender(wrap(false));
      const shown = view.container.querySelector('input')!;
      const stale = await compare(
        () => view.container.querySelector('input')!.value,
        next,
      );
      if (!stale) {
        fireEvent.change(shown, { target: { value: `after-${cycle}` } });
        expect(handle.findNode('/value')!.value).toBe(`after-${cycle}`);
      }
      expect(onChange).toHaveBeenCalledTimes(stale ? 1 : 2);
      view.unmount();
    },
  );
};
