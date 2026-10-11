import { createRef } from 'react';

import { act, cleanup, fireEvent, render, type RenderResult } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import { Form, type FormHandle } from '@/schema-form/components/Form';
import { ValidationMode } from '@/schema-form/core';

afterEach(cleanup);

/** Require the union fallback's accessible native textbox for draft assertions. */
const getTextbox = (view: RenderResult): HTMLInputElement => {
  const input = view.getByRole('textbox');
  if (!(input instanceof HTMLInputElement)) throw new Error('Expected a native textbox');
  return input;
};

it('REACT-033 LANDING-186 renders the default union input and retains string members', () => {
  const ref = createRef<FormHandle>();
  const view = render(
    <Form
      ref={ref}
      jsonSchema={{ type: ['number', 'string'] }}
      validationMode={ValidationMode.None}
    />,
  );
  const input = view.getByRole('textbox');
  fireEvent.change(input, { target: { value: '42' } });
  expect(ref.current!.getValue()).toBe('42');
});

it('REACT-033 retains invalid drafts until blur and clears nullable unions to undefined', () => {
  const ref = createRef<FormHandle>();
  const view = render(<Form ref={ref} jsonSchema={{ type: ['number', 'boolean', 'null'] }}
    defaultValue={2} validationMode={ValidationMode.None} />);
  const input = getTextbox(view);
  fireEvent.change(input, { target: { value: 'incomplete' } });
  expect(input.value).toBe('incomplete');
  expect(ref.current!.getValue()).toBe(2);
  fireEvent.blur(input);
  expect(input.value).toBe('2');
  fireEvent.change(input, { target: { value: '42' } });
  expect(ref.current!.getValue()).toBe(42);
  fireEvent.change(input, { target: { value: '' } });
  expect(ref.current!.getValue()).toBeUndefined();
  act(() => ref.current!.setValue(null));
  expect(input.value).toBe('');
});

it('REACT-033 marks container serialization failures without replacing them with an editable draft', () => {
  const cyclic: Record<string, unknown> = {};
  cyclic.self = cyclic;
  const view = render(<Form jsonSchema={{ type: ['object', 'string'] }}
    defaultValue={cyclic} validationMode={ValidationMode.None} onError={() => {}} />);
  const input = getTextbox(view);
  expect(input.value).toBe('');
  expect(input.readOnly).toBe(true);
  expect(input.getAttribute('aria-invalid')).toBe('true');
  expect(view.getByRole('status').textContent).toContain('Invalid');
});

it('REACT-033 keeps IME composition entirely in the input draft', () => {
  const ref = createRef<FormHandle>();
  const onChange = vi.fn();
  const view = render(<Form ref={ref} jsonSchema={{ type: ['number', 'string'] }}
    defaultValue="before" onChange={onChange} validationMode={ValidationMode.None} />);
  const input = getTextbox(view);
  fireEvent.compositionStart(input);
  fireEvent.change(input, { target: { value: '42' } });
  expect(input.value).toBe('42');
  expect(ref.current!.getValue()).toBe('before');
  expect(onChange).not.toHaveBeenCalled();
  fireEvent.blur(input);
  expect(onChange).not.toHaveBeenCalled();
  fireEvent.compositionEnd(input);
  expect(ref.current!.getValue()).toBe('42');
  expect(onChange).toHaveBeenCalledTimes(1);
});

it('REACT-033 re-evaluates the retained draft when the effective list changes', () => {
  const ref = createRef<FormHandle>();
  const view = render(<Form ref={ref} jsonSchema={{ type: 'object', properties: {
    narrow: { type: 'boolean' },
    field: { type: ['number', 'string'], allOf: [
      { controls: { active: '#/narrow' }, type: 'number' },
    ] },
  } }} defaultValue={{ narrow: true, field: 2 }} validationMode={ValidationMode.None} />);
  const input = getTextbox(view);
  fireEvent.change(input, { target: { value: 'draft' } });
  expect(ref.current!.findNode('/field')!.value).toBe(2);
  act(() => ref.current!.findNode('/narrow')!.setValue(false));
  expect(input.value).toBe('draft');
  expect(ref.current!.findNode('/field')!.value).toBe('draft');
});

it('REACT-033 defers effective-list draft re-evaluation until composition ends', () => {
  const ref = createRef<FormHandle>();
  const view = render(<Form ref={ref} jsonSchema={{ type: 'object', properties: {
    narrow: { type: 'boolean' },
    field: { type: ['number', 'string'], allOf: [
      { controls: { active: '#/narrow' }, type: 'number' },
    ] },
  } }} defaultValue={{ narrow: true, field: 2 }} validationMode={ValidationMode.None} />);
  const input = getTextbox(view);
  fireEvent.compositionStart(input);
  fireEvent.change(input, { target: { value: 'draft' } });
  act(() => ref.current!.findNode('/narrow')!.setValue(false));
  expect(ref.current!.findNode('/field')!.value).toBe(2);
  fireEvent.compositionEnd(input);
  expect(ref.current!.findNode('/field')!.value).toBe('draft');
});

it('REACT-033 displays containers read-only and marks mismatched primitives', () => {
  const ref = createRef<FormHandle>();
  const view = render(<Form ref={ref} jsonSchema={{ type: ['object', 'string'] }}
    defaultValue={{ key: 1 }} validationMode={ValidationMode.None} />);
  const input = getTextbox(view);
  expect(input.readOnly).toBe(true);
  expect(input.value).toBe('{"key":1}');
  act(() => ref.current!.setValue(['invalid']));
  const current = getTextbox(view);
  expect(current.readOnly).toBe(true);
  expect(current.value).toBe('["invalid"]');
  expect(current.getAttribute('aria-invalid')).toBe('true');
  expect(view.getByRole('status').textContent).toContain('Invalid');
});

it('REACT-033 renders an empty read-only display when no primitive kind is effective', () => {
  const view = render(<Form jsonSchema={{ type: ['object', 'array'] }}
    validationMode={ValidationMode.None} />);
  const input = getTextbox(view);
  expect(input.readOnly).toBe(true);
  expect(input.value).toBe('');
});
