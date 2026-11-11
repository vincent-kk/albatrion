import { useState } from 'react';

import { act, fireEvent } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import {
  type FieldInputProps,
  type FieldRendererProps,
  Form,
  type JSONSchema,
  VirtualizationBackfill,
} from '@/schema-form';

import { type FormHarness, renderForm } from '../renderForm';

/** Each scenario owns its form and any explicitly captured input callbacks. */
let form: FormHarness;
/** Input callbacks are captured by public FieldInput props for synchronous event probes. */
const changes = new Map<string, FieldInputProps<string>['onChange']>();
afterEach(() => {
  form?.unmount();
  changes.clear();
  vi.unstubAllGlobals();
});

/** An undeclared draft input exposes its public callback for event-boundary probes. */
const Draft = ({ path, defaultValue, onChange }: FieldInputProps<string>) => {
  changes.set(path, onChange);
  return (
    <input
      id={path}
      defaultValue={defaultValue ?? ''}
      onChange={(event) => onChange(event.target.value)}
    />
  );
};

/** Compose a parent write with the latest pending value when events share one batch. */
const Parent = ({
  ChildFields,
  onChange,
}: FieldInputProps<Record<string, unknown>>) => (
  <>
    {ChildFields.map((Child) => (
      <Child
        key={Child.key}
        onChange={(input) =>
          onChange((previous) => ({ ...previous, [Child.field]: input }))
        }
      />
    ))}
  </>
);

/** Build a hybrid root with overridable string children for edge scenarios. */
const schemaFor = (
  a: JSONSchema = { type: 'string', presentation: { FieldInput: Draft } },
  ParentInput = Parent,
  b: JSONSchema = { type: 'string', presentation: { FieldInput: Draft } },
): JSONSchema => ({
  type: 'object',
  options: { terminal: false },
  presentation: { FieldInput: ParentInput },
  properties: { a, b },
});

it('E1 refreshes reordered array items and aligns their displayed and node values', async () => {
  const Reorder = ({
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
              (value ?? [])
                .map((entry, position) => (position === index ? input : entry))
                .reverse(),
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
      presentation: { FieldInput: Reorder },
      items: { type: 'string' },
    },
    { defaultValue: ['a', ''] },
  );
  const first = form.field('/0');
  const second = form.field('/1');
  await form.type('/1', 'x');
  expect(form.getValue()).toEqual(['x', 'a']);
  expect([form.value('/0'), form.value('/1')]).toEqual(['x', 'a']);
  expect([form.node('/0')!.value, form.node('/1')!.value]).toEqual(['x', 'a']);
  expect(form.field('/0')).not.toBe(first);
  expect(form.field('/1')).not.toBe(second);
});

it('E2 evaluates the built-in checkbox updater before relaying and preserves selection and DOM', async () => {
  const received: unknown[] = [];
  const Choices = ({
    ChildFields,
    onChange,
  }: FieldInputProps<Record<string, unknown>>) => (
    <>
      {ChildFields.map((Child) => (
        <Child
          key={Child.key}
          onChange={(input) => {
            received.push(input);
            onChange({ [Child.field]: input });
          }}
        />
      ))}
    </>
  );
  form = await renderForm(
    schemaFor(
      {
        type: 'array',
        options: { terminal: true },
        presentation: { inputType: 'checkbox' },
        items: { type: 'string', enum: ['red', 'blue'] },
      },
      Choices,
    ),
  );
  const checkbox = form.container.querySelector<HTMLInputElement>(
    'input[type="checkbox"]',
  )!;
  expect(checkbox).not.toBeNull();
  await form.user.click(checkbox);
  expect(received).toEqual([['red']]);
  expect(form.getValue()).toEqual({ a: ['red'] });
  expect(form.container.querySelector('input[type="checkbox"]')).toBe(checkbox);
  expect(checkbox.checked).toBe(true);
});

it('E3 refreshes the same child for a reentrant Form onChange write', async () => {
  form = await renderForm(schemaFor(), {
    onChange: (value) => {
      if (value.a === 'x') form.node('/a')!.setValue('followup');
    },
  });
  const input = form.field('/a');
  await form.type('/a', 'x');
  expect(form.getValue()).toEqual({ a: 'followup' });
  expect(form.value('/a')).toBe('followup');
  expect(form.field('/a')).not.toBe(input);
});

it('E4 preserves a child inside a user batch and refreshes it on the next caller write', async () => {
  form = await renderForm(schemaFor());
  const input = form.field('/a')!;
  await act(async () =>
    form.handle.node!.batch(() =>
      fireEvent.change(input, { target: { value: 'x' } }),
    ),
  );
  expect(form.getValue()).toEqual({ a: 'x' });
  expect(form.field('/a')).toBe(input);
  await form.setValue({ a: 'next' });
  expect(form.value('/a')).toBe('next');
  expect(form.field('/a')).not.toBe(input);
});

it('E5 commits a parent write before its exception and does not suppress the next refresh', async () => {
  const failure = new Error('parent callback rejected');
  const Throwing = ({
    ChildFields,
    onChange,
  }: FieldInputProps<Record<string, unknown>>) => (
    <>
      {ChildFields.map((Child) => (
        <Child
          key={Child.key}
          onChange={(input) => {
            onChange({ [Child.field]: input });
            throw failure;
          }}
        />
      ))}
    </>
  );
  form = await renderForm(schemaFor(undefined, Throwing));
  const draft = form.field('/a')!;
  draft.value = 'x';
  await act(async () => {
    expect(() => changes.get('/a')!('x')).toThrow(failure);
  });
  expect(form.getValue()).toEqual({ a: 'x' });
  expect(form.value('/a')).toBe('x');
  const input = form.field('/a');
  await form.setValue({ a: 'next' });
  expect(form.value('/a')).toBe('next');
  expect(form.field('/a')).not.toBe(input);
});

it('E6 keeps virtual-group child values aligned with the parent projection', async () => {
  const Group = ({
    ChildFields,
    value,
    onChange,
  }: FieldInputProps<unknown[]>) => (
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
  const VirtualParent = ({
    ChildFields,
    value,
    onChange,
  }: FieldInputProps<Record<string, unknown>>) => (
    <>
      {ChildFields.filter((Child) => Child.field === 'group').map((Child) => (
        <Child
          key={Child.key}
          onChange={(input: unknown[]) =>
            onChange({ ...value, a: input[0], b: input[1] })
          }
        />
      ))}
    </>
  );
  form = await renderForm(
    {
      ...schemaFor(undefined, VirtualParent),
      options: {
        terminal: false,
        virtual: {
          group: { fields: ['a', 'b'], presentation: { FieldInput: Group } },
        },
      },
    },
    { defaultValue: { a: '', b: 'b' } },
  );
  await form.type('/a', 'x');
  expect(form.getValue()).toEqual({ a: 'x', b: 'b' });
  expect([form.value('/a'), form.value('/b')]).toEqual(['x', 'b']);
  await form.type('/b', 'y');
  expect(form.getValue()).toEqual({ a: 'x', b: 'y' });
  expect([form.value('/a'), form.value('/b')]).toEqual(['x', 'y']);
});

it('E7 trims on blur after hybrid input and refreshes the changed draft', async () => {
  form = await renderForm(
    schemaFor({
      type: 'string',
      options: { trim: true },
      presentation: { FieldInput: Draft },
    }),
  );
  fireEvent.change(form.field('/a')!, { target: { value: '  word  ' } });
  await form.flush();
  expect(form.value('/a')).toBe('  word  ');
  const input = form.field('/a')!;
  fireEvent.blur(input);
  await form.flush();
  expect(form.getValue()).toEqual({ a: 'word' });
  expect(form.value('/a')).toBe('word');
  expect(form.field('/a')).not.toBe(input);
});

it.each(['Input', 'Render'])(
  'E8 uses the latest preferred callback through Form.%s',
  async (surface) => {
    const received = vi.fn();
    const Layout = () => {
      const [version, setVersion] = useState('first');
      return (
        <>
          <button type="button" onClick={() => setVersion('latest')}>
            update
          </button>
          {surface === 'Input' ? (
            <Form.Input
              path="/a"
              FieldInput={Draft}
              onChange={(value) => received(version, value)}
            />
          ) : (
            <Form.Render
              path="/a"
              FieldInput={Draft}
              onChange={(value) => received(version, value)}
            >
              {({ Input }) => <Input />}
            </Form.Render>
          )}
        </>
      );
    };
    form = await renderForm(
      { type: 'object', properties: { a: { type: 'string' } } },
      { children: <Layout /> },
    );
    const input = form.field('/a');
    await form.user.click(form.container.querySelector('button')!);
    expect(form.field('/a')).toBe(input);
    await form.type('/a', 'x');
    expect(received).toHaveBeenCalledExactlyOnceWith('latest', 'x');
  },
);

it('E9 reveals a deferred child with the latest parent callback', async () => {
  /** Keep deferred fields hidden until the explicit focus request. */
  class SilentObserver {
    /** No browser intersections are delivered by this test observer. */
    observe() {}
    /** No subscription state is retained. */
    unobserve() {}
    /** No asynchronous work survives teardown. */
    disconnect() {}
  }
  vi.stubGlobal('IntersectionObserver', SilentObserver);
  const Snapshot = ({
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
  form = await renderForm(schemaFor(undefined, Snapshot), {
    virtualization: {
      threshold: 2,
      eagerCount: 1,
      backfill: VirtualizationBackfill.None,
    },
  });
  expect(form.deferred('/b')).toBe(true);
  await form.type('/a', 'x');
  await act(async () => form.handle.focus('/b'));
  expect(form.deferred('/b')).toBe(false);
  await form.type('/a', 'x2');
  await form.type('/b', 'y');
  expect(form.getValue()).toEqual({ a: 'x2', b: 'y' });
});

it('E10 prefers the child callback and falls back to the current parent when removed', async () => {
  const child = vi.fn();
  const parent = vi.fn();
  const Renderer = ({ Input }: FieldRendererProps) => {
    const [own, setOwn] = useState(true);
    return (
      <>
        <button type="button" onClick={() => setOwn(false)}>
          remove
        </button>
        <Input onChange={own ? child : undefined} />
      </>
    );
  };
  const Callbacks = ({
    ChildFields,
    value,
    onChange,
  }: FieldInputProps<Record<string, unknown>>) => (
    <>
      {ChildFields.map((Child) => (
        <Child
          key={Child.key}
          FieldRenderer={Child.field === 'b' ? Renderer : undefined}
          onChange={(input) => {
            parent(Child.field, value?.a, input);
            onChange({ ...value, [Child.field]: input });
          }}
        />
      ))}
    </>
  );
  form = await renderForm(schemaFor(undefined, Callbacks));
  await form.type('/a', 'x');
  parent.mockClear();
  fireEvent.change(form.field('/b')!, { target: { value: 'own' } });
  await form.flush();
  expect(child).toHaveBeenCalledExactlyOnceWith('own', expect.any(Number));
  expect(parent).not.toHaveBeenCalled();
  await form.user.click(form.container.querySelector('button')!);
  await form.type('/a', 'x2');
  parent.mockClear();
  fireEvent.change(form.field('/b')!, { target: { value: 'fallback' } });
  await form.flush();
  expect(parent).toHaveBeenCalledExactlyOnceWith('b', 'x2', 'fallback');
  expect(form.getValue()).toEqual({ a: 'x2', b: 'fallback' });
});

it('E11 aligns the child after a conditional schema changes its input declaration', async () => {
  const Alternate = ({
    path,
    defaultValue,
    onChange,
  }: FieldInputProps<string>) => (
    <input
      id={path}
      data-alternate
      defaultValue={defaultValue}
      onChange={(event) => onChange(event.target.value)}
    />
  );
  form = await renderForm(
    {
      ...schemaFor(),
      if: { required: ['a'], properties: { a: { const: 'x' } } },
      then: { properties: { a: { presentation: { FieldInput: Alternate } } } },
    },
    { validator: true },
  );
  const input = form.field('/a');
  await form.type('/a', 'x');
  expect(form.getValue()).toEqual({ a: 'x' });
  expect(form.value('/a')).toBe('x');
  expect(form.field('/a')).not.toBe(input);
  expect(form.field('/a')!.hasAttribute('data-alternate')).toBe(true);
});

it('E12 preserves a draft emitted through a renderer Input callback override', async () => {
  const Renderer = ({ Input, node }: FieldRendererProps) => (
    <Input onChange={(input) => node.setValue(input)} />
  );
  form = await renderForm(
    { type: 'string', presentation: { FieldInput: Draft } },
    { FieldRenderer: Renderer },
  );
  const input = form.field('')!;
  fireEvent.change(input, { target: { value: 'x' } });
  await form.flush();
  expect(form.getValue()).toBe('x');
  expect(form.field('')).toBe(input);
});

it('E13 preserves both child emissions in one event when the parent uses an updater', async () => {
  form = await renderForm(schemaFor());
  const a = form.field('/a')!;
  const b = form.field('/b')!;
  await act(async () =>
    form.handle.node!.batch(() => {
      fireEvent.change(a, { target: { value: 'x' } });
      fireEvent.change(b, { target: { value: 'y' } });
    }),
  );
  expect(form.getValue()).toEqual({ a: 'x', b: 'y' });
  expect([form.value('/a'), form.value('/b')]).toEqual(['x', 'y']);
});

it('E14 writes directly after the hybrid parent removes its onChange', async () => {
  const received = vi.fn();
  const EnabledParent = ({
    ChildFields,
    onChange,
  }: FieldInputProps<Record<string, unknown>>) => {
    const [enabled, setEnabled] = useState(true);
    const parentFn = (input: unknown) => {
      received(input);
      onChange({ a: input });
    };
    return (
      <>
        <button type="button" onClick={() => setEnabled(false)}>
          disable parent callback
        </button>
        {ChildFields.map((Child) => (
          <Child key={Child.key} onChange={enabled ? parentFn : undefined} />
        ))}
      </>
    );
  };
  form = await renderForm(schemaFor(undefined, EnabledParent));
  await form.type('/a', 'x');
  expect(received).toHaveBeenCalledExactlyOnceWith('x');
  await form.user.click(form.container.querySelector('button')!);
  received.mockClear();
  await form.type('/a', 'direct');
  expect(received).not.toHaveBeenCalled();
  expect(form.getValue()).toEqual({ a: 'direct' });
  expect(form.value('/a')).toBe('direct');
});
