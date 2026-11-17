import { act } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type {
  FieldInputProps,
  FieldRendererProps,
  JSONSchema,
} from '@/schema-form';

import { type FormHarness, renderForm } from '../renderForm';
import {
  FocusSilentObserver,
  focusSchema,
  focusTarget,
  focusVirtualization,
} from './helpers/focusFixtures';

/** Each test owns its form and releases its host error observer. */
let form: FormHarness;
beforeEach(() => vi.stubGlobal('IntersectionObserver', FocusSilentObserver));
afterEach(() => {
  form?.unmount();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

// filid:contract exact-focus
describe.each([false, true])('exact handle focus strict=%s', (strictMode) => {
  it('focuses through three gates once and leaves unrelated placeholders deferred', async () => {
    form = await renderForm(focusSchema, {
      validator: true,
      strictMode,
      virtualization: focusVirtualization,
    });
    expect(form.field(focusTarget)).toBeNull();
    const focus = vi.spyOn(HTMLElement.prototype, 'focus');
    await act(async () => form.handle.focus(focusTarget));
    expect(document.activeElement?.id).toBe(focusTarget);
    expect(form.field(focusTarget)).not.toBeNull();
    expect(document.activeElement).toBe(form.field(focusTarget));
    expect(
      focus.mock.contexts.filter(
        (element) => element === form.field(focusTarget),
      ),
    ).toHaveLength(1);
    expect(form.deferred('/sibling')).toBe(true);
  });
  it('premarks an intermediate virtual group rendered by a custom branch input', async () => {
    const GroupOnly = ({ ChildFields }: FieldInputProps) => (
      <>
        {ChildFields.filter((Child) => Child.field === 'group').map((Child) => (
          <Child key={Child.key} />
        ))}
      </>
    );
    const schema: JSONSchema = {
      type: 'object',
      properties: {
        first: { type: 'string' },
        outer: {
          type: 'object',
          properties: { first: { type: 'string' }, target: { type: 'string' } },
          options: {
            terminal: false,
            virtual: { group: { fields: ['target'] } },
          },
          presentation: { FieldInput: GroupOnly },
        },
      },
    };
    form = await renderForm(schema, {
      validator: true,
      strictMode,
      virtualization: focusVirtualization,
    });
    await act(async () => form.handle.focus('/outer/target'));
    expect(form.field('/outer/target')).not.toBeNull();
    expect(document.activeElement).toBe(form.field('/outer/target'));
  });
  it('selects the earliest DOM position when both references are placeholders', async () => {
    const schema: JSONSchema = {
      type: 'object',
      properties: { first: { type: 'string' }, target: { type: 'string' } },
      options: { virtual: { group: { fields: ['target'] } } },
    };
    form = await renderForm(schema, {
      validator: true,
      strictMode,
      virtualization: focusVirtualization,
    });
    await act(async () => form.handle.focus('/target'));
    expect(document.activeElement).toBe(form.field('/target'));
    expect(form.deferred('/group')).toBe(true);
  });
  it('keeps a mounted target direct while its second position remains behind an ancestor', async () => {
    const schema: JSONSchema = {
      type: 'object',
      properties: { target: { type: 'string' } },
      options: { virtual: { group: { fields: ['target'] } } },
    };
    form = await renderForm(schema, {
      validator: true,
      strictMode,
      virtualization: focusVirtualization,
    });
    await act(async () => form.handle.focus('/target'));
    expect(document.activeElement).toBe(form.field('/target'));
    expect(form.deferred('/group')).toBe(true);
  });
  it('ignores renderer-only buttons and opens the position containing a real Input', async () => {
    let targetPositions = 0;
    const Renderer = ({ node, Input }: FieldRendererProps) =>
      node.path === '/target' && ++targetPositions <= (strictMode ? 2 : 1) ? (
        <button>outside Input</button>
      ) : (
        <Input />
      );
    const schema: JSONSchema = {
      type: 'object',
      properties: { target: { type: 'string' } },
      options: { virtual: { group: { fields: ['target'] } } },
    };
    form = await renderForm(schema, {
      validator: true,
      strictMode,
      virtualization: focusVirtualization,
      FieldRenderer: Renderer,
    });
    expect(form.field('/target')).toBeNull();
    await act(async () => form.handle.focus('/target'));
    expect(form.field('/target')).not.toBeNull();
    expect(document.activeElement).toBe(form.field('/target'));
    expect(form.deferred('/group')).toBe(false);
  });
  it('does not reveal a path for a non-present target', async () => {
    const schema: JSONSchema = {
      type: 'object',
      properties: {
        first: { type: 'string' },
        outer: {
          type: 'object',
          properties: {
            target: { type: 'string', controls: { visible: false } },
          },
        },
      },
    };
    form = await renderForm(schema, {
      validator: true,
      strictMode,
      virtualization: focusVirtualization,
    });
    await act(async () => {
      form.handle.focus('/first');
      form.handle.focus('/outer/target');
    });
    expect(document.activeElement).toBe(form.field('/first'));
    expect(form.deferred('/outer')).toBe(true);
  });
  it('preserves ordinary focus with virtualization disabled', async () => {
    form = await renderForm(focusSchema, {
      validator: true,
      strictMode,
      virtualization: false,
    });
    await act(async () => form.handle.focus(focusTarget));
    expect(document.activeElement).toBe(form.field(focusTarget));
  });
});
