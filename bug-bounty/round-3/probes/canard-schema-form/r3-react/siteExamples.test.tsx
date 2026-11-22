/**
 * CA1: the React examples of documents/docs/canard/schema-form/examples/index.mdx and
 * examples/media-registration.mdx, copied verbatim (imports rewritten to the source alias).
 */
import { plugin } from '@canard/schema-form-ajv8-plugin';
import {
  act,
  cleanup,
  fireEvent,
  render,
  waitFor,
} from '@testing-library/react';
import { useRef, useState } from 'react';
import { afterEach, expect, it, vi } from 'vitest';

import {
  type FieldInputProps,
  Form,
  type FormHandle,
  isValidationError,
  useFormSubmit,
} from '@/schema-form';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

// ---- examples/index.mdx "Custom layout" ----
const composedSchema = {
  type: 'object',
  properties: {
    title: { type: 'string' },
    count: { type: 'number' },
    enabled: { type: 'boolean' },
  },
} as const;

function ComposedForm() {
  return (
    <Form jsonSchema={composedSchema}>
      {({ value }) => (
        <>
          <Form.Label path="/title" />
          <Form.Input path="/title" />
          <Form.ErrorMessage path="/title" />
          <Form.Input path="/count" />
          <Form.Input path="/enabled" />
          <output>{JSON.stringify(value)}</output>
          <button type="submit">Submit</button>
        </>
      )}
    </Form>
  );
}

it('ComposedForm: typing in title updates the output of the function children', () => {
  const view = render(<ComposedForm />);
  const title = view.container.querySelector<HTMLInputElement>('input[id="/title"]')!;
  act(() => {
    fireEvent.change(title, { target: { value: 'Hello' } });
  });
  const enabled = view.container.querySelector<HTMLInputElement>('input[id="/enabled"]')!;
  act(() => {
    fireEvent.click(enabled);
  });
  expect(JSON.parse(view.container.querySelector('output')!.textContent!)).toEqual({
    title: 'Hello',
    enabled: true,
  });
});

// ---- examples/index.mdx "Custom FieldInput" ----
function TextInput({
  path, value, onChange, readOnly, disabled, placeholder, className,
}: FieldInputProps<string>) {
  return (
    <textarea
      id={path}
      value={value ?? ''}
      readOnly={readOnly}
      disabled={disabled}
      placeholder={placeholder}
      className={className}
      onChange={(event) => onChange(event.target.value || undefined)}
    />
  );
}

const customSchema = {
  type: 'object',
  properties: { text: { type: 'string', title: 'Text' } },
} as const;

function CustomInputForm({ formRef }: { formRef: React.Ref<FormHandle<typeof customSchema>> }) {
  return (
    <Form
      ref={formRef}
      jsonSchema={customSchema}
      fieldInputDefinitions={[{ test: { type: 'string' }, Component: TextInput }]}
    />
  );
}

it('CustomInputForm: the textarea edits the value and clearing it removes the value', () => {
  const ref = { current: null as FormHandle<typeof customSchema> | null };
  const view = render(<CustomInputForm formRef={ref} />);
  const area = view.container.querySelector('textarea')!;
  act(() => {
    fireEvent.change(area, { target: { value: 'abc' } });
  });
  expect([ref.current?.getValue(), area.value]).toEqual([{ text: 'abc' }, 'abc']);
  act(() => {
    fireEvent.change(area, { target: { value: '' } });
  });
  expect([ref.current?.getValue(), area.value]).toEqual([{}, '']);
});

// ---- examples/index.mdx "Submit with a typed handle" ----
const submitSchema = {
  type: 'object',
  properties: { text: { type: 'string', minLength: 3 } },
  required: ['text'],
} as const;
type Value = { text?: string };

const submitted: unknown[] = [];

function SubmitForm() {
  const formRef = useRef<FormHandle<typeof submitSchema, Value>>(null);
  const { submit, pending } = useFormSubmit(formRef);
  const [failure, setFailure] = useState('');

  async function save() {
    setFailure('');
    try {
      await submit();
    } catch (error) {
      if (!isValidationError(error)) setFailure(String(error));
    }
  }

  return (
    <>
      <Form<typeof submitSchema, Value>
        ref={formRef}
        jsonSchema={submitSchema}
        defaultValue={{ text: 'Ready' }}
        validatorFactory={plugin.validator}
        onSubmit={(value) => submitted.push(value)}
      />
      <button type="button" disabled={pending} onClick={save}>Save</button>
      <button type="button" onClick={() => formRef.current?.reset()}>Reset</button>
      <output>{failure}</output>
    </>
  );
}

it('SubmitForm: a valid save submits, an invalid save stays on the form, and reset restores', async () => {
  submitted.length = 0;
  const view = render(<SubmitForm />);
  const [save, reset] = Array.from(view.container.querySelectorAll('button'));
  await act(async () => {
    fireEvent.click(save);
  });
  await waitFor(() => expect(submitted).toEqual([{ text: 'Ready' }]));
  const input = view.container.querySelector<HTMLInputElement>('input[id="/text"]')!;
  act(() => {
    fireEvent.change(input, { target: { value: 'ab' } });
  });
  await act(async () => {
    fireEvent.click(save);
  });
  await waitFor(() => expect(save.disabled).toBe(false));
  expect(submitted).toEqual([{ text: 'Ready' }]);
  expect(view.container.querySelector('output')!.textContent).toBe('');
  act(() => {
    fireEvent.click(reset);
  });
  expect(
    view.container.querySelector<HTMLInputElement>('input[id="/text"]')!.value,
  ).toBe('Ready');
});

// ---- examples/media-registration.mdx ----
function FilesInput({ path, onFileAttach, onChange, readOnly, disabled }: FieldInputProps<string[]>) {
  return (
    <input
      id={path}
      type="file"
      multiple
      disabled={readOnly || disabled}
      onChange={(event) => {
        const files = Array.from(event.target.files ?? []);
        onFileAttach(files.length ? files : undefined);
        onChange(files.length ? files.map((file) => file.name) : undefined);
      }}
    />
  );
}

const mediaSchema = {
  type: 'object',
  properties: {
    files: {
      type: 'array',
      items: { type: 'string' },
      title: 'Files',
      presentation: { FieldInput: FilesInput },
    },
  },
} as const;

const uploads: Array<[string, unknown]> = [];

function MediaUpload() {
  const formRef = useRef<FormHandle<typeof mediaSchema>>(null);
  return (
    <Form
      ref={formRef}
      jsonSchema={mediaSchema}
      onSubmit={async (value) => {
        const body = new FormData();
        body.append('value', JSON.stringify(value));
        for (const [path, files] of formRef.current?.getAttachedFilesMap() ?? []) {
          for (const file of files) body.append(path, file);
        }
        for (const entry of body.entries()) uploads.push([entry[0], entry[1]]);
      }}
    >
      <Form.Field />
      <button type="submit">Upload</button>
    </Form>
  );
}

it('MediaUpload: submit sends the JSON value and each attached file under its node path', async () => {
  uploads.length = 0;
  const view = render(<MediaUpload />);
  const input = view.container.querySelector<HTMLInputElement>('input[type="file"]')!;
  const a = new File(['a'], 'a.txt');
  const b = new File(['b'], 'b.txt');
  act(() => {
    fireEvent.change(input, { target: { files: [a, b] } });
  });
  await act(async () => {
    fireEvent.submit(view.container.querySelector('form')!);
  });
  await waitFor(() => expect(uploads.length).toBeGreaterThan(0));
  expect(uploads.map(([key, value]) => [key, value instanceof File ? value.name : value])).toEqual([
    ['value', JSON.stringify({ files: ['a.txt', 'b.txt'] })],
    ['/files', 'a.txt'],
    ['/files', 'b.txt'],
  ]);
});
