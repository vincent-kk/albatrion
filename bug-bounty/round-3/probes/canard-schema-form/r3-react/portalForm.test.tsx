import { plugin } from '@canard/schema-form-ajv8-plugin';
import { act, cleanup, fireEvent, render, waitFor } from '@testing-library/react';
import { createRef } from 'react';
import { createPortal } from 'react-dom';
import { afterEach, expect, it, vi } from 'vitest';

import {
  type FieldInputProps,
  Form,
  type FormHandle,
  ValidationMode,
} from '@/schema-form';

afterEach(cleanup);

/**
 * IN2: a dialog with its own Form, opened from inside another Form and portalled to document.body.
 * imperative-and-layout.md "Compose one data tree": another Form creates a separate tree whose
 * validation and submission are not part of the outer operation; the portal keeps the DOM valid
 * (no nested form elements).
 */
const innerSchema = {
  type: 'object',
  properties: { label: { type: 'string', default: 'new tag' } },
} as const;

const outerSchema = {
  type: 'object',
  properties: {
    title: { type: 'string', minLength: 3 },
    tag: { type: 'string' },
  },
  required: ['title'],
} as const;

it('submitting a portalled dialog Form does not submit the Form that opened it', async () => {
  const outerSubmit = vi.fn();
  const innerSubmit = vi.fn();
  const outerError = vi.fn();
  const outer = createRef<FormHandle<typeof outerSchema>>();
  const view = render(
    <Form
      ref={outer}
      jsonSchema={outerSchema}
      validatorFactory={plugin.validator}
      defaultValue={{ title: 'Ok title' }}
      onSubmit={outerSubmit}
      onError={outerError}
    >
      <Form.Input path="/title" />
      {createPortal(
        <div data-testid="dialog">
          <Form
            jsonSchema={innerSchema}
            validationMode={ValidationMode.None}
            onSubmit={innerSubmit}
          >
            <Form.Input path="/label" />
            <button type="submit">Create tag</button>
          </Form>
        </div>,
        document.body,
      )}
    </Form>,
  );
  const dialogForm = view
    .getByTestId('dialog')
    .querySelector('form') as HTMLFormElement;
  await act(async () => {
    fireEvent.submit(dialogForm);
  });
  await waitFor(() => expect(innerSubmit).toHaveBeenCalledTimes(1));
  await new Promise((resolve) => setTimeout(resolve, 50));
  expect(outerSubmit).toHaveBeenCalledTimes(0);
});

/** A custom input that edits its value through a dialog Form rendered in a portal. */
const TagPicker = ({ onChange }: FieldInputProps<string>) =>
  createPortal(
    <div data-testid="picker">
      <Form
        jsonSchema={innerSchema}
        validationMode={ValidationMode.None}
        onSubmit={(value) => onChange(value.label)}
      >
        <Form.Input path="/label" />
        <button type="submit">Pick</button>
      </Form>
    </div>,
    document.body,
  );

const pickerSchema = {
  type: 'object',
  properties: {
    title: { type: 'string', minLength: 3 },
    tag: { type: 'string', presentation: { FieldInput: TagPicker } },
  },
  required: ['title'],
} as const;

it('focus and blur inside a dialog Form leave the touched state of the field that opened it', async () => {
  const outer = createRef<FormHandle<typeof pickerSchema>>();
  const view = render(
    <Form
      ref={outer}
      jsonSchema={pickerSchema}
      validationMode={ValidationMode.None}
    />,
  );
  const inner = view
    .getByTestId('picker')
    .querySelector<HTMLInputElement>('input')!;
  act(() => {
    inner.focus();
    fireEvent.focus(inner);
    fireEvent.change(inner, { target: { value: 'edited' } });
    inner.blur();
    fireEvent.blur(inner);
  });
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 100));
  });
  const tag = outer.current!.findNode('/tag')!;
  expect({ touched: tag.isTouched, edited: tag.isEdited }).toEqual({
    touched: false,
    edited: false,
  });
});

it('submitting the dialog Form of a custom input does not submit the outer Form', async () => {
  const outerSubmit = vi.fn();
  const outer = createRef<FormHandle<typeof pickerSchema>>();
  const view = render(
    <Form
      ref={outer}
      jsonSchema={pickerSchema}
      validatorFactory={plugin.validator}
      validationMode={ValidationMode.OnRequest}
      onSubmit={outerSubmit}
    />,
  );
  const pickerForm = view
    .getByTestId('picker')
    .querySelector('form') as HTMLFormElement;
  const pick = pickerForm.querySelector('button')!;
  pick.focus();
  await act(async () => {
    fireEvent.submit(pickerForm);
  });
  await waitFor(() => expect(outer.current?.getValue()).toEqual({ tag: 'new tag' }));
  await new Promise((resolve) => setTimeout(resolve, 50));
  expect({
    outerSubmit: outerSubmit.mock.calls.length,
    outerTitleErrors: outer.current!.findNode('/title')!.errors.length,
    focused: (document.activeElement as HTMLElement | null)?.id || document.activeElement?.tagName,
  }).toEqual({ outerSubmit: 0, outerTitleErrors: 0, focused: 'BUTTON' });
});

it('submitting the dialog Form of a custom input does not call the outer onSubmit (valid outer form)', async () => {
  const outerSubmit = vi.fn();
  const outer = createRef<FormHandle<typeof pickerSchema>>();
  const view = render(
    <Form
      ref={outer}
      jsonSchema={pickerSchema}
      validatorFactory={plugin.validator}
      defaultValue={{ title: 'Ok title' }}
      onSubmit={outerSubmit}
    />,
  );
  const pickerForm = view
    .getByTestId('picker')
    .querySelector('form') as HTMLFormElement;
  await act(async () => {
    fireEvent.submit(pickerForm);
  });
  await waitFor(() =>
    expect(outer.current?.getValue()).toEqual({ title: 'Ok title', tag: 'new tag' }),
  );
  await new Promise((resolve) => setTimeout(resolve, 50));
  expect(outerSubmit.mock.calls).toEqual([]);
});
