import { act, fireEvent } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import { type FieldInputProps, Form } from '@/schema-form';

import { type FormHarness, renderForm } from '../renderForm';

/** Each test owns a public Form instance. */
let form: FormHarness;
afterEach(() => form?.unmount());

it.each(['Input', 'Render', 'Field'] as const)(
  'Form.%s cannot replace the binding change handler',
  async (surface) => {
    const changed = vi.fn();
    const overrides: Record<string, unknown> = { onChange: changed };
    const layout =
      surface === 'Input' ? (
        <Form.Input path="/name" {...overrides} />
      ) : surface === 'Render' ? (
        <Form.Render path="/name" {...overrides}>
          {({ Input }) => <Input />}
        </Form.Render>
      ) : (
        <Form.Field path="/name" {...overrides} />
      );
    form = await renderForm(
      { type: 'object', properties: { name: { type: 'string' } } },
      { children: layout },
    );
    await form.type('/name', 'saved');
    expect(changed).not.toHaveBeenCalled();
    expect(form.getValue()).toEqual({ name: 'saved' });
  },
);

it.each(['Input', 'Render', 'Field'] as const)(
  'Form.%s cannot replace file registration',
  async (surface) => {
    const attached = vi.fn();
    const overrides: Record<string, unknown> = { onFileAttach: attached };
    const FileInput = ({ path, onFileAttach }: FieldInputProps) => (
      <input
        id={path}
        type="file"
        onChange={(event) => onFileAttach(event.target.files?.[0])}
      />
    );
    form = await renderForm(
      { type: 'object', properties: { file: { type: 'string' } } },
      {
        children:
          surface === 'Input' ? (
            <Form.Input path="/file" FieldInput={FileInput} {...overrides} />
          ) : surface === 'Render' ? (
            <Form.Render path="/file" FieldInput={FileInput} {...overrides}>
              {({ Input }) => <Input />}
            </Form.Render>
          ) : (
            <Form.Field path="/file" FieldInput={FileInput} {...overrides} />
          ),
      },
    );
    const file = new File(['contents'], 'example.txt');
    await act(async () =>
      fireEvent.change(form.field('/file')!, { target: { files: [file] } }),
    );
    expect(attached).not.toHaveBeenCalled();
    expect(form.handle.getAttachedFilesMap().get('/file')).toEqual([file]);
  },
);

it('rejects a layout callback in the public type', () => {
  // @ts-expect-error Layout callbacks cannot replace binding-owned handlers.
  const layout = <Form.Input onChange={() => undefined} />;
  const renderChange = (
    // @ts-expect-error Layout callbacks cannot replace binding-owned handlers.
    <Form.Render onChange={() => undefined}>
      {({ Input }) => <Input />}
    </Form.Render>
  );
  // @ts-expect-error Layout callbacks cannot replace binding-owned handlers.
  const fieldChange = <Form.Field onChange={() => undefined} />;
  // @ts-expect-error Layout callbacks cannot replace file registration.
  const inputAttach = <Form.Input onFileAttach={() => undefined} />;
  const renderAttach = (
    // @ts-expect-error Layout callbacks cannot replace file registration.
    <Form.Render onFileAttach={() => undefined}>
      {({ Input }) => <Input />}
    </Form.Render>
  );
  // @ts-expect-error Layout callbacks cannot replace file registration.
  const fieldAttach = <Form.Field onFileAttach={() => undefined} />;
  expect([
    layout,
    renderChange,
    fieldChange,
    inputAttach,
    renderAttach,
    fieldAttach,
  ]).toHaveLength(6);
});
