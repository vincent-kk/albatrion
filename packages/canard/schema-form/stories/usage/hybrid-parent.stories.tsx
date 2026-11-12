// Loaded by Storybook CSF; usage plays inspect this page's inputs, mount counts and value readout.
import { useLayoutEffect, useRef, useState } from 'react';

import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import {
  type FieldInputProps,
  type FieldRendererProps,
  Form,
  type FormHandle,
  FormProvider,
  type JSONSchema,
} from '../../src';
import { ajvValidatorPlugin } from '../components/validator';

/** Consumer-owned parent policy selected by the example. */
type Mode =
  | 'typing'
  | 'siblings'
  | 'transform-draft'
  | 'transform-controlled'
  | 'array'
  | 'nested'
  | 'reject'
  | 'checkbox'
  | 'computed'
  | 'required-display';

/** The example owns captured public callbacks solely for its same-event demo button. */
type ExampleContext = {
  mode: Mode;
  changes: Map<string, FieldInputProps<string>['onChange']>;
};

/** A value-driven input only when its schema explicitly declares that contract. */
function Text({
  path,
  value,
  defaultValue,
  onChange,
  jsonSchema,
  required,
  context,
}: FieldInputProps<string, ExampleContext>) {
  context.changes.set(path, onChange);
  return (
    <input
      aria-label={path}
      data-required={required}
      {...(jsonSchema.presentation?.controlled
        ? { value: value ?? '' }
        : { defaultValue: defaultValue ?? '' })}
      onChange={(event) => onChange(event.target.value)}
    />
  );
}

/** Show the renderer indicator without enabling browser-required validation. */
function RequiredRenderer({ Input, required }: FieldRendererProps) {
  return (
    <div>
      <span aria-label="Required mark">
        {required ? 'required' : 'optional'}
      </span>
      <Input />
    </div>
  );
}

/** Relay each object child through the parent, preserving pending sibling edits. */
function Parent({
  ChildFields,
  onChange,
  context,
}: FieldInputProps<Record<string, unknown>, ExampleContext>) {
  return (
    <>
      {ChildFields.map((Child) => (
        <Child
          key={Child.key}
          FieldRenderer={
            context.mode === 'required-display' ? RequiredRenderer : undefined
          }
          onChange={(input) => {
            if (context.mode === 'reject') return;
            onChange((previous) => ({
              ...previous,
              [Child.field]:
                context.mode.startsWith('transform') &&
                typeof input === 'string'
                  ? input.toUpperCase()
                  : input,
              ...(context.mode === 'computed' && Child.field === 'a'
                ? { b: `computed:${String(input)}` }
                : {}),
            }));
          }}
        />
      ))}
    </>
  );
}

/** Array positions keep their identity while the parent replaces the whole array value. */
function ArrayParent({ ChildFields, onChange }: FieldInputProps<string[]>) {
  return (
    <>
      {ChildFields.map((Child, index) => (
        <Child
          key={Child.key}
          onChange={(input) =>
            onChange((previous) =>
              (previous ?? []).map((value, position) =>
                position === index ? input : value,
              ),
            )
          }
        />
      ))}
    </>
  );
}

/**
 * Render a consumer-owned example and count actual input DOM mounts, including built-in checkboxes.
 * @param mode - Parent policy and schema demonstrated by this page.
 * @returns Inputs, per-position mount counts and the current committed Form value.
 */
function HybridExample({ mode }: { mode: Mode }) {
  const container = useRef<HTMLDivElement>(null);
  const handle = useRef<FormHandle>(null);
  const [changes] = useState(
    () => new Map<string, FieldInputProps<string>['onChange']>(),
  );
  const [validation, setValidation] = useState('not checked');
  const [mounts, setMounts] = useState<Record<string, number>>({});
  const [schema] = useState<JSONSchema>(() => {
    const text: JSONSchema = {
      type: 'string',
      presentation: {
        FieldInput: Text,
        ...(mode === 'required-display' ? { required: false } : {}),
        ...(mode === 'transform-controlled' || mode === 'siblings'
          ? { controlled: true }
          : {}),
      },
    };
    if (mode === 'array')
      return {
        type: 'array',
        options: { terminal: false },
        presentation: { FieldInput: ArrayParent },
        items: text,
      };
    const child: JSONSchema =
      mode === 'checkbox'
        ? {
            type: 'array',
            options: { terminal: true },
            items: { type: 'string', enum: ['red', 'blue'] },
            presentation: { inputType: 'checkbox' },
          }
        : mode === 'nested'
          ? {
              type: 'object',
              options: { terminal: false },
              presentation: { FieldInput: Parent },
              properties: { leaf: text },
            }
          : text;
    return {
      type: 'object',
      ...(mode === 'required-display' ? { required: ['a'] } : {}),
      options: { terminal: false },
      presentation: { FieldInput: Parent },
      properties: {
        a: child,
        ...(['siblings', 'computed'].includes(mode) ? { b: text } : {}),
      },
    };
  });
  useLayoutEffect(() => {
    const root = container.current!;
    const seen = new WeakSet<Element>();
    const counts: Record<string, number> = {};
    const observe = () => {
      let changed = false;
      root.querySelectorAll('input').forEach((input, index) => {
        if (seen.has(input)) return;
        seen.add(input);
        const name = input.getAttribute('aria-label') ?? `checkbox-${index}`;
        counts[name] = (counts[name] ?? 0) + 1;
        changed = true;
      });
      if (changed) setMounts({ ...counts });
    };
    observe();
    const observer = new MutationObserver(observe);
    observer.observe(root, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);
  return (
    <section>
      <p>
        {mode === 'reject'
          ? 'The parent rejects edits: the draft stays visible while the committed value stays empty.'
          : mode === 'transform-draft'
            ? 'Uppercasing remounts an undeclared draft input. Click it again to continue typing.'
            : mode === 'transform-controlled'
              ? 'A controlled input displays uppercase values and keeps its DOM and focus.'
              : 'Child edits travel through the parent. Compare the committed value with the input mount counts.'}
      </p>
      <div ref={container}>
        <Form
          ref={handle}
          jsonSchema={schema}
          defaultValue={mode === 'array' ? ['', 'b'] : {}}
          context={{ mode, changes }}
        >
          {({ value }) => (
            <>
              <Form.Field />
              <output aria-label="Current value">
                {JSON.stringify(value)}
              </output>
            </>
          )}
        </Form>
      </div>
      {mode === 'required-display' && (
        <>
          <button
            type="button"
            onClick={async () => {
              const errors = await handle.current?.validate();
              setValidation(
                errors?.some((error) => error.keyword === 'required')
                  ? 'required'
                  : 'valid',
              );
            }}
          >
            Validate
          </button>
          <output aria-label="Validation result">{validation}</output>
        </>
      )}
      {mode === 'siblings' && (
        <button
          type="button"
          onClick={() =>
            handle.current?.node?.batch(() => {
              changes.get('/a')?.('batch-a');
              changes.get('/b')?.('batch-b');
            })
          }
        >
          Emit both in one event
        </button>
      )}
      <p>
        Input mounts:{' '}
        <output aria-label="Input mounts">{JSON.stringify(mounts)}</output>
      </p>
    </section>
  );
}

export default {
  title: 'Usage/Hybrid parent',
  component: HybridExample,
} satisfies Meta<typeof HybridExample>;
/** Every play asserts only this consumer example's visible readouts and input identity. */
type Story = StoryObj<typeof HybridExample>;

/** H1: synchronous unmodified relay keeps the draft input and focus. */
export const Typing: Story = {
  args: { mode: 'typing' },
  async play({ canvasElement }) {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox', { name: '/a' });
    await userEvent.type(input, 'hello');
    await expect(canvas.getByRole('textbox', { name: '/a' })).toBe(input);
    await expect(input).toHaveFocus();
    await expect(canvas.getByLabelText('Current value')).toHaveTextContent(
      '{"a":"hello"}',
    );
    await expect(canvas.getByLabelText('Input mounts')).toHaveTextContent(
      '{"/a":1}',
    );
  },
};

/** H2/E13: sequential and same-event child edits both preserve pending sibling values. */
export const SiblingEdits: Story = {
  args: { mode: 'siblings' },
  async play({ canvasElement }) {
    const canvas = within(canvasElement);
    const a = canvas.getByRole('textbox', { name: '/a' });
    const b = canvas.getByRole('textbox', { name: '/b' });
    await userEvent.type(a, 'x');
    await userEvent.type(b, 'y');
    await expect(canvas.getByRole('textbox', { name: '/a' })).toBe(a);
    await expect(canvas.getByRole('textbox', { name: '/b' })).toBe(b);
    await expect(b).toHaveFocus();
    await expect(canvas.getByLabelText('Current value')).toHaveTextContent(
      '{"a":"x","b":"y"}',
    );
    await expect(canvas.getByLabelText('Input mounts')).toHaveTextContent(
      '{"/a":1,"/b":1}',
    );
    await userEvent.click(
      canvas.getByRole('button', { name: 'Emit both in one event' }),
    );
    await expect(canvas.getByLabelText('Current value')).toHaveTextContent(
      '{"a":"batch-a","b":"batch-b"}',
    );
    await expect(a).toHaveValue('batch-a');
    await expect(b).toHaveValue('batch-b');
    await expect(canvas.getByRole('textbox', { name: '/a' })).toBe(a);
    await expect(canvas.getByRole('textbox', { name: '/b' })).toBe(b);
    await expect(canvas.getByLabelText('Input mounts')).toHaveTextContent(
      '{"/a":1,"/b":1}',
    );
  },
};

/** H4: transforming a draft remounts it and releases focus. */
export const TransformDraft: Story = {
  args: { mode: 'transform-draft' },
  async play({ canvasElement }) {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox', { name: '/a' });
    await userEvent.type(input, 'x');
    await expect(canvas.getByRole('textbox', { name: '/a' })).not.toBe(input);
    await expect(canvas.getByRole('textbox', { name: '/a' })).toHaveValue('X');
    await expect(canvas.getByRole('textbox', { name: '/a' })).not.toHaveFocus();
    await expect(canvas.getByLabelText('Current value')).toHaveTextContent(
      '{"a":"X"}',
    );
    await waitFor(() =>
      expect(canvas.getByLabelText('Input mounts')).toHaveTextContent(
        '{"/a":2}',
      ),
    );
  },
};

/** H5: declaring a genuinely controlled input preserves its instance during transformation. */
export const TransformControlled: Story = {
  args: { mode: 'transform-controlled' },
  async play({ canvasElement }) {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox', { name: '/a' });
    await userEvent.type(input, 'xy');
    await expect(canvas.getByRole('textbox', { name: '/a' })).toBe(input);
    await expect(input).toHaveValue('XY');
    await expect(input).toHaveFocus();
    await expect(canvas.getByLabelText('Current value')).toHaveTextContent(
      '{"a":"XY"}',
    );
    await expect(canvas.getByLabelText('Input mounts')).toHaveTextContent(
      '{"/a":1}',
    );
  },
};

/** H7: whole-array parent writes preserve the emitting item. */
export const ArrayParentEdits: Story = {
  args: { mode: 'array' },
  async play({ canvasElement }) {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox', { name: '/0' });
    await userEvent.type(input, 'x');
    await expect(canvas.getByRole('textbox', { name: '/0' })).toBe(input);
    await expect(input).toHaveFocus();
    await expect(canvas.getByLabelText('Current value')).toHaveTextContent(
      '["x","b"]',
    );
    await expect(canvas.getByLabelText('Input mounts')).toHaveTextContent(
      '{"/0":1,"/1":1}',
    );
  },
};

/** H8: two parent relays preserve the originating grandchild. */
export const NestedParents: Story = {
  args: { mode: 'nested' },
  async play({ canvasElement }) {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox', { name: '/a/leaf' });
    await userEvent.type(input, 'x');
    await expect(canvas.getByRole('textbox', { name: '/a/leaf' })).toBe(input);
    await expect(input).toHaveFocus();
    await expect(canvas.getByLabelText('Current value')).toHaveTextContent(
      '{"a":{"leaf":"x"}}',
    );
    await expect(canvas.getByLabelText('Input mounts')).toHaveTextContent(
      '{"/a/leaf":1}',
    );
  },
};

/** H10: declining a write leaves the local draft without changing the node. */
export const RejectedInput: Story = {
  args: { mode: 'reject' },
  async play({ canvasElement }) {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox', { name: '/a' });
    await userEvent.type(input, 'draft');
    await expect(canvas.getByRole('textbox', { name: '/a' })).toBe(input);
    await expect(input).toHaveValue('draft');
    await expect(input).toHaveFocus();
    await expect(canvas.getByLabelText('Current value')).toHaveTextContent(
      '{}',
    );
    await expect(canvas.getByLabelText('Input mounts')).toHaveTextContent(
      '{"/a":1}',
    );
  },
};

/** E2: the built-in checkbox updater reaches the parent as an evaluated array. */
export const CheckboxUpdater: Story = {
  args: { mode: 'checkbox' },
  async play({ canvasElement }) {
    const canvas = within(canvasElement);
    const checkbox = canvas.getAllByRole('checkbox')[0];
    await userEvent.click(checkbox);
    await expect(canvas.getAllByRole('checkbox')[0]).toBe(checkbox);
    await expect(checkbox).toBeChecked();
    await expect(checkbox).toHaveFocus();
    await expect(canvas.getByLabelText('Current value')).toHaveTextContent(
      '{"a":["red"]}',
    );
    await expect(canvas.getByLabelText('Input mounts')).toHaveTextContent(
      '{"checkbox-0":1,"checkbox-1":1}',
    );
  },
};

/** H3: a computed sibling refreshes while the originating input keeps focus. */
export const ComputedSibling: Story = {
  args: { mode: 'computed' },
  async play({ canvasElement }) {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox', { name: '/a' });
    const sibling = canvas.getByRole('textbox', { name: '/b' });
    await userEvent.type(input, 'x');
    await expect(canvas.getByRole('textbox', { name: '/a' })).toBe(input);
    await expect(canvas.getByRole('textbox', { name: '/b' })).not.toBe(sibling);
    await expect(input).toHaveFocus();
    await expect(canvas.getByLabelText('Current value')).toHaveTextContent(
      '{"a":"x","b":"computed:x"}',
    );
    await waitFor(() =>
      expect(canvas.getByLabelText('Input mounts')).toHaveTextContent(
        '{"/a":1,"/b":2}',
      ),
    );
  },
};

/** A presentation override hides the mark while schema validation still requires the child. */
export const RequiredDisplay: Story = {
  args: { mode: 'required-display' },
  render: (args) => (
    <FormProvider validatorFactory={ajvValidatorPlugin}>
      <HybridExample {...args} />
    </FormProvider>
  ),
  async play({ canvasElement }) {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox', { name: '/a' });
    await expect(canvas.getByLabelText('Required mark')).toHaveTextContent(
      'optional',
    );
    await expect(input).toHaveAttribute('data-required', 'false');
    await expect(canvas.getByLabelText('Current value')).toHaveTextContent(
      '{}',
    );
    await expect(canvas.getByLabelText('Input mounts')).toHaveTextContent(
      '{"/a":1}',
    );
    await userEvent.click(canvas.getByRole('button', { name: 'Validate' }));
    await expect(canvas.getByLabelText('Validation result')).toHaveTextContent(
      'required',
    );
    await expect(canvas.getByRole('textbox', { name: '/a' })).toBe(input);
    await expect(canvas.getByLabelText('Input mounts')).toHaveTextContent(
      '{"/a":1}',
    );
  },
};
