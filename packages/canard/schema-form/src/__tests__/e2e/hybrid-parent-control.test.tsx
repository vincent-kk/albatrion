import { act, fireEvent } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import type { FieldInputProps, JSONSchema } from '@/schema-form';

import { type FormHarness, renderForm } from '../renderForm';

/** Each scenario owns the mounted form and its host error observer. */
let form: FormHarness;
afterEach(() => form?.unmount());

/** Draw a declared controlled string directly from its current value. */
const Controlled = ({ path, value, onChange }: FieldInputProps<string>) => (
  <input
    id={path}
    value={value ?? ''}
    onChange={(event) => onChange(event.target.value)}
  />
);

/** Child callbacks close over this render's parent value. */
const Parent = ({
  ChildFields,
  value,
  onChange,
}: FieldInputProps<Record<string, unknown>>) => (
  <>
    {ChildFields.map((Child) => (
      <Child
        key={Child.key}
        onChange={(input) => onChange({ ...value, [Child.field]: input })}
      />
    ))}
  </>
);

/** Build a nonterminal hybrid pair, optionally replacing its child contract and parent input. */
const pairSchema = (
  a: JSONSchema = { type: 'string' },
  ParentInput = Parent,
  b: JSONSchema = { type: 'string' },
): JSONSchema => ({
  type: 'object',
  properties: {
    pair: {
      type: 'object',
      options: { terminal: false },
      presentation: { FieldInput: ParentInput },
      properties: { a, b },
    },
  },
});

it('H1 keeps the undeclared child and its focus after hybrid typing', async () => {
  form = await renderForm(pairSchema());
  const input = form.field('/pair/a')!;
  input.focus();
  fireEvent.change(input, { target: { value: 'x' } });
  await form.flush();
  expect(form.getValue()).toEqual({ pair: { a: 'x' } });
  expect(form.field('/pair/a')).toBe(input);
  expect(document.activeElement).toBe(input);
});

it.each([false, true])(
  'H2 retains both sibling edits with controlled=%s',
  async (controlled) => {
    const child: JSONSchema = {
      type: 'string',
      ...(controlled
        ? { presentation: { FieldInput: Controlled, controlled: true } }
        : {}),
    };
    form = await renderForm(pairSchema(child, Parent, child));
    const sibling = form.field('/pair/b');
    await form.type('/pair/a', 'x');
    expect(form.field('/pair/b')).toBe(sibling);
    await form.type('/pair/b', 'y');
    expect(form.getValue()).toEqual({ pair: { a: 'x', b: 'y' } });
    expect(form.value('/pair/a')).toBe('x');
  },
);

it('H3 keeps the emitting child and refreshes a computed sibling', async () => {
  const Compute = ({
    ChildFields,
    value,
    onChange,
  }: FieldInputProps<Record<string, unknown>>) => (
    <>
      {ChildFields.map((Child) => (
        <Child
          key={Child.key}
          onChange={(input) =>
            onChange({
              ...value,
              [Child.field]: input,
              b: `computed:${input}`,
            })
          }
        />
      ))}
    </>
  );
  form = await renderForm(pairSchema(undefined, Compute));
  const a = form.field('/pair/a');
  const b = form.field('/pair/b');
  await form.type('/pair/a', 'x');
  expect(form.getValue()).toEqual({ pair: { a: 'x', b: 'computed:x' } });
  expect(form.value('/pair/b')).toBe('computed:x');
  expect(form.field('/pair/b')).not.toBe(b);
  expect(form.field('/pair/a')).toBe(a);
});

it('H4 refreshes an undeclared child when its parent transforms the value', async () => {
  const Upper = ({
    ChildFields,
    onChange,
  }: FieldInputProps<Record<string, unknown>>) => (
    <>
      {ChildFields.map((Child) => (
        <Child
          key={Child.key}
          onChange={(input) =>
            onChange({ [Child.field]: String(input).toUpperCase() })
          }
        />
      ))}
    </>
  );
  form = await renderForm(pairSchema(undefined, Upper));
  const input = form.field('/pair/a');
  await form.type('/pair/a', 'x');
  expect(form.getValue()).toEqual({ pair: { a: 'X' } });
  expect(form.value('/pair/a')).toBe('X');
  expect(form.field('/pair/a')).not.toBe(input);
});

it('H5 keeps a declared controlled child while displaying the transformed value', async () => {
  const Upper = ({
    ChildFields,
    onChange,
  }: FieldInputProps<Record<string, unknown>>) => (
    <>
      {ChildFields.map((Child) => (
        <Child
          key={Child.key}
          onChange={(input) =>
            onChange({ [Child.field]: String(input).toUpperCase() })
          }
        />
      ))}
    </>
  );
  form = await renderForm(
    pairSchema(
      {
        type: 'string',
        presentation: { FieldInput: Controlled, controlled: true },
      },
      Upper,
    ),
  );
  const input = form.field('/pair/a');
  await form.type('/pair/a', 'x');
  expect(form.getValue()).toEqual({ pair: { a: 'X' } });
  expect(form.value('/pair/a')).toBe('X');
  expect(form.field('/pair/a')).toBe(input);
});

it('H6 refreshes a child transformed by a derived rule in the same settlement', async () => {
  const Source = ({
    ChildFields,
    onChange,
  }: FieldInputProps<Record<string, unknown>>) => (
    <>
      {ChildFields.map((Child) => (
        <Child
          key={Child.key}
          onChange={(input) =>
            onChange({ a: input, b: String(input).toUpperCase() })
          }
        />
      ))}
    </>
  );
  form = await renderForm(
    pairSchema({ type: 'string', controls: { derived: '../b' } }, Source),
  );
  const input = form.field('/pair/a');
  await form.type('/pair/a', 'x');
  expect(form.node('/pair/a')!.value).toBe('X');
  expect(form.value('/pair/a')).toBe('X');
  expect(form.field('/pair/a')).not.toBe(input);
});

it('H7 keeps an array item when its parent writes the whole array', async () => {
  const ArrayParent = ({
    ChildFields,
    value,
    onChange,
  }: FieldInputProps<string[]>) => (
    <>
      {ChildFields.map((Child, index) => (
        <Child
          key={Child.key}
          onChange={(input) =>
            onChange(
              (value ?? []).map((entry, position) =>
                position === index ? input : entry,
              ),
            )
          }
        />
      ))}
    </>
  );
  form = await renderForm(
    {
      type: 'array',
      options: { terminal: false },
      items: { type: 'string' },
      presentation: { FieldInput: ArrayParent },
    },
    { defaultValue: ['', 'b'] },
  );
  const input = form.field('/0');
  await form.type('/0', 'x');
  expect(form.getValue()).toEqual(['x', 'b']);
  expect(form.field('/0')).toBe(input);
});

it('H8 keeps the emitting grandchild through two hybrid parents', async () => {
  form = await renderForm(
    pairSchema({
      type: 'object',
      options: { terminal: false },
      presentation: { FieldInput: Parent },
      properties: { leaf: { type: 'string' } },
    }),
  );
  const input = form.field('/pair/a/leaf');
  await form.type('/pair/a/leaf', 'x');
  expect(form.getValue()).toEqual({ pair: { a: { leaf: 'x' } } });
  expect(form.field('/pair/a/leaf')).toBe(input);
});

it('H9 preserves the composing input through composition end and the next edit', async () => {
  form = await renderForm(pairSchema());
  const input = form.field('/pair/a')!;
  input.focus();
  fireEvent.compositionStart(input);
  fireEvent.change(input, { target: { value: '하' } });
  await form.flush();
  expect(form.field('/pair/a')).toBe(input);
  fireEvent.compositionEnd(input);
  await form.flush();
  expect(form.field('/pair/a')).toBe(input);
  fireEvent.change(input, { target: { value: '한' } });
  await form.flush();
  expect(form.getValue()).toEqual({ pair: { a: '한' } });
  expect(document.activeElement).toBe(input);
});

it('H10 leaves the local draft and node unchanged when the parent rejects input', async () => {
  const reject = vi.fn();
  const Reject = ({ ChildFields }: FieldInputProps) => (
    <>
      {ChildFields.map((Child) => (
        <Child key={Child.key} onChange={reject} />
      ))}
    </>
  );
  form = await renderForm(pairSchema(undefined, Reject));
  const before = form.getValue();
  const input = form.field('/pair/a');
  await form.type('/pair/a', 'x');
  expect(reject).toHaveBeenCalledOnce();
  expect(form.getValue()).toEqual(before);
  expect(form.value('/pair/a')).toBe('x');
  expect(form.field('/pair/a')).toBe(input);
});

it('H11 refreshes undeclared children for caller writes and reset after hybrid typing', async () => {
  form = await renderForm(pairSchema(), {
    defaultValue: { pair: { a: 'initial' } },
  });
  fireEvent.change(form.field('/pair/a')!, { target: { value: 'typed' } });
  await form.flush();
  const typed = form.field('/pair/a');
  await form.setValue({ pair: { a: 'caller' } });
  expect(form.field('/pair/a')).not.toBe(typed);
  expect(form.value('/pair/a')).toBe('caller');
  const caller = form.field('/pair/a');
  await form.reset();
  expect(form.field('/pair/a')).not.toBe(caller);
  expect(form.value('/pair/a')).toBe('initial');
});

it('H12 reads the latest parent closure for a sibling file attachment', async () => {
  const received = vi.fn();
  const Files = ({
    ChildFields,
    value,
    onChange,
  }: FieldInputProps<Record<string, unknown>>) => (
    <>
      {ChildFields.map((Child) => (
        <Child
          key={Child.key}
          onChange={(input) => onChange({ ...value, [Child.field]: input })}
          onFileAttach={(files) => received(value?.a, files)}
        />
      ))}
    </>
  );
  const FileInput = ({ path, onFileAttach }: FieldInputProps) => (
    <input
      id={path}
      type="file"
      onChange={(event) => onFileAttach(event.target.files?.[0])}
    />
  );
  form = await renderForm(
    pairSchema(undefined, Files, {
      type: 'string',
      presentation: { FieldInput: FileInput },
    }),
  );
  const input = form.field('/pair/b')!;
  await form.type('/pair/a', 'x');
  expect(form.field('/pair/b')).toBe(input);
  const file = new File(['content'], 'attachment.txt');
  await act(async () => fireEvent.change(input, { target: { files: [file] } }));
  expect(received).toHaveBeenCalledExactlyOnceWith('x', file);
});

it('H13 blocks overridden callbacks on readOnly and disabled children', async () => {
  const changed = vi.fn();
  const Locked = ({ ChildFields }: FieldInputProps) => (
    <>
      {ChildFields.map((Child) => (
        <Child key={Child.key} onChange={changed} />
      ))}
    </>
  );
  form = await renderForm(
    pairSchema(
      {
        type: 'string',
        controls: { readOnly: true },
        presentation: { FieldInput: Controlled },
      },
      Locked,
      {
        type: 'string',
        controls: { disabled: true },
        presentation: { FieldInput: Controlled },
      },
    ),
  );
  const before = form.getValue();
  fireEvent.change(form.field('/pair/a')!, { target: { value: 'x' } });
  fireEvent.change(form.field('/pair/b')!, { target: { value: 'y' } });
  await form.flush();
  expect(changed).not.toHaveBeenCalled();
  expect(form.getValue()).toEqual(before);
});
