import { createRef } from 'react';

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  type FieldInputProps,
  Form,
  type FormHandle,
  type JSONSchema,
} from '@canard/schema-form';

import { FieldInputBooleanSwitchDefinition } from '../FieldInputBooleanSwitch';
import { FieldInputStringSwitchDefinition } from '../FieldInputStringSwitch';

afterEach(cleanup);

/** Mount a switch through the plugin definition and observe committed values. */
const renderSwitch = (kind: string, disabled = false) => {
  const schema: JSONSchema =
    kind === 'boolean'
      ? { type: 'boolean', presentation: { inputType: 'switch' } }
      : {
          type: 'string',
          enum: ['enabled', 'disabled'],
          presentation: { inputType: 'switch' },
        };
  const off = kind === 'boolean' ? false : 'disabled';
  const on = kind === 'boolean' ? true : 'enabled';
  const changed = vi.fn();
  const ref = createRef<FormHandle>();
  render(
    <Form
      ref={ref}
      disabled={disabled}
      jsonSchema={schema}
      defaultValue={off}
      onChange={(value) => changed(value)}
      fieldInputDefinitions={[
        FieldInputBooleanSwitchDefinition,
        FieldInputStringSwitchDefinition,
      ]}
    />,
  );
  changed.mockClear();
  return { ref, changed, off, on, control: screen.getByRole('switch') };
};

describe.each(['boolean', 'string'])('%s switch keyboard access', (kind) => {
  it('keeps focus after a click', async () => {
    const { control, ref, on } = renderSwitch(kind);
    await userEvent.click(control);
    expect(ref.current!.getValue()).toBe(on);
    expect(document.activeElement).toBe(control);
    expect(control.tabIndex).toBe(0);
  });

  it.each([' ', 'Enter'])(
    'toggles both ways with %j using click values',
    async (key) => {
      const { control, ref, changed, on, off } = renderSwitch(kind);
      control.focus();
      fireEvent.keyDown(control, { key });
      expect(ref.current!.getValue()).toBe(on);
      fireEvent.keyDown(control, { key });
      expect(ref.current!.getValue()).toBe(off);
      expect(changed.mock.calls).toEqual([[on], [off]]);
      expect(document.activeElement).toBe(control);
      await userEvent.click(control);
      await userEvent.click(control);
      expect(changed.mock.calls).toEqual([[on], [off], [on], [off]]);
    },
  );

  it.each([' ', 'Enter'])(
    'ignores repeated %j keydowns until the next press',
    (key) => {
      const { control, ref, changed, on, off } = renderSwitch(kind);
      control.focus();
      fireEvent.keyDown(control, { key });
      expect(ref.current!.getValue()).toBe(on);
      expect(fireEvent.keyDown(control, { key, repeat: true })).toBe(false);
      expect(ref.current!.getValue()).toBe(on);
      expect(changed.mock.calls).toEqual([[on]]);
      fireEvent.keyUp(control, { key });
      fireEvent.keyDown(control, { key });
      expect(ref.current!.getValue()).toBe(off);
      expect(changed.mock.calls).toEqual([[on], [off]]);
    },
  );

  it('removes disabled controls from tab order and ignores activation keys', async () => {
    const { control, ref, changed, off } = renderSwitch(kind, true);
    await userEvent.tab();
    expect(document.activeElement).not.toBe(control);
    expect(fireEvent.keyDown(control, { key: ' ' })).toBe(true);
    expect(fireEvent.keyDown(control, { key: 'Enter' })).toBe(true);
    await userEvent.click(control);
    expect(document.activeElement).not.toBe(control);
    expect(control.getAttribute('tabindex')).toBeNull();
    expect(ref.current!.getValue()).toBe(off);
    expect(changed).not.toHaveBeenCalled();
  });

  it('prevents Space scrolling and leaves unrelated keys alone', () => {
    const { control, ref, off } = renderSwitch(kind);
    expect(fireEvent.keyDown(control, { key: 'ArrowDown' })).toBe(true);
    expect(ref.current!.getValue()).toBe(off);
    expect(fireEvent.keyDown(control, { key: ' ' })).toBe(false);
  });
});

it('keeps the switch and its focus under an overriding hybrid parent', async () => {
  const ref = createRef<FormHandle>();
  const parentChanged = vi.fn();
  const Parent = ({
    ChildFields,
    onChange,
  }: FieldInputProps<Record<string, unknown>>) => (
    <>
      {ChildFields.map((Child) => (
        <Child
          key={Child.key}
          onChange={(input) => {
            parentChanged(input);
            onChange((previous) => ({ ...previous, [Child.field]: input }));
          }}
        />
      ))}
    </>
  );
  render(
    <Form
      ref={ref}
      defaultValue={{ enabled: false }}
      fieldInputDefinitions={[FieldInputBooleanSwitchDefinition]}
      jsonSchema={{
        type: 'object',
        options: { terminal: false },
        presentation: { FieldInput: Parent },
        properties: {
          enabled: { type: 'boolean', presentation: { inputType: 'switch' } },
        },
      }}
    />,
  );
  const control = screen.getByRole('switch');
  await userEvent.click(control);
  expect(ref.current!.getValue()).toEqual({ enabled: true });
  expect(screen.getByRole('switch')).toBe(control);
  expect(document.activeElement).toBe(control);
  await userEvent.keyboard(' ');
  expect(ref.current!.getValue()).toEqual({ enabled: false });
  expect(parentChanged.mock.calls).toEqual([[true], [false]]);
  expect(screen.getByRole('switch')).toBe(control);
  expect(document.activeElement).toBe(control);
});
