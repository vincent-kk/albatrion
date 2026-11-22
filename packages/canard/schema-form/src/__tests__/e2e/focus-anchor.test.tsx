import * as React from 'react';
import { forwardRef, useImperativeHandle, useRef } from 'react';

import { act, render } from '@testing-library/react';
import { createPortal } from 'react-dom';
import { afterEach, expect, it, vi } from 'vitest';

import {
  type FieldInputProps,
  FieldNodeRequestType,
  Form,
  type FormHandle,
} from '@/schema-form';

import { type FormHarness, renderForm } from '../renderForm';
import {
  FocusSilentObserver,
  focusSchema,
  focusTarget,
  focusVirtualization,
} from './helpers/focusFixtures';

let form: FormHarness;
afterEach(() => {
  form?.unmount();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

it('prefers the public handle and restores DOM order when its ref detaches', async () => {
  const called = vi.fn();
  const Control = forwardRef<{ focus(): void }>(function Control(_, ref) {
    const element = useRef<HTMLDivElement>(null);
    useImperativeHandle(
      ref,
      () => ({
        focus() {
          called(this);
          element.current?.focus();
        },
      }),
      [],
    );
    return <div ref={element} tabIndex={-1} aria-label="custom control" />;
  });
  const Input = ({ context, focusRef }: FieldInputProps) => (
    <>
      <button type="button">first fallback</button>
      <input aria-label="text selection" defaultValue="value" />
      <Control
        ref={
          context && 'enabled' in context && context.enabled
            ? focusRef
            : undefined
        }
      />
    </>
  );
  form = await renderForm(
    { type: 'string', presentation: { FieldInput: Input } },
    { context: { enabled: true } },
  );
  await act(async () => form.handle.focus(''));
  expect(called).toHaveBeenCalledExactlyOnceWith(
    expect.objectContaining({ focus: expect.any(Function) }),
  );
  expect(document.activeElement).toBe(
    form.container.querySelector('[aria-label="custom control"]'),
  );
  const text = form.container.querySelector('input')!;
  await act(async () => form.handle.select(''));
  expect(text.selectionStart).toBe(0);
  expect(text.selectionEnd).toBe(text.value.length);
  expect(called).toHaveBeenCalledTimes(1);

  await form.rerenderContext({ enabled: false });
  await act(async () => form.handle.focus(''));
  expect(document.activeElement).toBe(form.container.querySelector('button'));
  expect(called).toHaveBeenCalledTimes(1);
});

it('focuses a same-document portal target after nested reveal and while already mounted', async () => {
  vi.stubGlobal('IntersectionObserver', FocusSilentObserver);
  const focus = vi.spyOn(HTMLElement.prototype, 'focus');
  const Input = ({ focusRef }: FieldInputProps) =>
    createPortal(
      <div tabIndex={-1} ref={focusRef} aria-label="portal anchor" />,
      document.body,
    );
  form = await renderForm(focusSchema, {
    strictMode: true,
    virtualization: focusVirtualization,
    fieldInputMap: { [focusTarget]: Input },
  });
  expect(document.querySelector('[aria-label="portal anchor"]')).toBeNull();
  await act(async () => form.handle.focus(focusTarget));
  const target = document.querySelector('[aria-label="portal anchor"]');
  expect(document.activeElement).toBe(target);
  expect(focus).toHaveBeenCalledTimes(1);
  act(() => {
    form.handle.focus(focusTarget);
    expect(focus).toHaveBeenCalledTimes(2);
  });
});

it('keeps the two mounted anchors for one node through a controlled reset', async () => {
  const focuses = vi.spyOn(HTMLElement.prototype, 'focus');
  const First = ({ focusRef }: FieldInputProps) => (
    <div tabIndex={-1} aria-label="first position" ref={focusRef} />
  );
  const Second = ({ focusRef }: FieldInputProps) => (
    <div tabIndex={-1} aria-label="second position" ref={focusRef} />
  );
  form = await renderForm(
    { type: 'string', presentation: { controlled: true } },
    {
      defaultValue: 'initial',
      children: (
        <>
          <Form.Input path="" FieldInput={First} />
          <Form.Input path="" FieldInput={Second} />
        </>
      ),
    },
  );
  const first = form.container.querySelector('[aria-label="first position"]');
  const second = form.container.querySelector('[aria-label="second position"]');
  await act(async () => form.handle.focus(''));
  expect(focuses.mock.contexts).toEqual([first, second]);
  expect(document.activeElement).toBe(second);
  await form.setValue('changed');
  await form.reset();
  focuses.mockClear();
  await act(async () => form.handle.focus(''));
  expect(focuses.mock.contexts).toEqual([first, second]);
});

it.skipIf(!React.Activity)(
  'drops hidden Activity anchors until their position reconnects',
  () => {
    const focuses = vi.spyOn(HTMLElement.prototype, 'focus');
    const ref = React.createRef<FormHandle>();
    const Input = ({ focusRef }: FieldInputProps) => (
      <div tabIndex={-1} ref={focusRef} aria-label="activity anchor" />
    );
    const schema = {
      type: 'string',
      presentation: { FieldInput: Input },
    } as const;
    const tree = (mode: 'visible' | 'hidden') => (
      <React.Activity mode={mode}>
        <Form ref={ref} jsonSchema={schema} />
      </React.Activity>
    );
    const view = render(tree('visible'));
    try {
      const node = ref.current!.node!;
      act(() => node.request(FieldNodeRequestType.Focus));
      expect(document.activeElement).toBe(
        view.getByLabelText('activity anchor'),
      );
      view.rerender(tree('hidden'));
      act(() => node.request(FieldNodeRequestType.Focus));
      expect(focuses).toHaveBeenCalledTimes(1);
      view.rerender(tree('visible'));
      act(() => node.request(FieldNodeRequestType.Focus));
      expect(focuses).toHaveBeenCalledTimes(2);
      expect(document.activeElement).toBe(
        view.getByLabelText('activity anchor'),
      );
    } finally {
      view.unmount();
    }
  },
);
