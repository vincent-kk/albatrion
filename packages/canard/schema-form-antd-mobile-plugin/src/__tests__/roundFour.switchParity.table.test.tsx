import { createRef } from 'react';

import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Switch } from 'antd-mobile';
import { computeAccessibleName } from 'dom-accessibility-api';
import { afterEach, expect, it, vi } from 'vitest';

import { Form, type FormHandle, type JSONSchema } from '@canard/schema-form';

import { plugin } from '../index';

afterEach(cleanup);
it.each(['on', 'off'])(
  'string switch agrees with enum order when stored %s',
  (stored) => {
    const ref = createRef<FormHandle>();
    render(
      <Form
        ref={ref}
        jsonSchema={{
          type: 'object',
          properties: {
            mode: {
              type: 'string',
              enum: ['on', 'off'],
              presentation: { inputType: 'switch' },
            },
          },
        }}
        defaultValue={{ mode: stored }}
        fieldInputDefinitions={plugin.fieldInputDefinitions}
        FieldRenderer={plugin.FieldRenderer}
        LabelRenderer={plugin.LabelRenderer}
      />,
    );
    const control = screen.getByRole('switch');
    const checked =
      control instanceof HTMLInputElement
        ? control.checked
        : control.getAttribute('aria-checked') === 'true';
    expect(checked).toBe(stored === 'on');
    fireEvent.click(control);
    expect(ref.current!.getValue()).toEqual({
      mode: stored === 'on' ? 'off' : 'on',
    });
  },
);
it.each([
  {
    source: 'alias',
    alias: { checked: 'Alias on', unchecked: 'Alias off' },
    context: {},
    on: 'Alias on',
    off: 'Alias off',
  },
  {
    source: 'context over alias',
    alias: { checked: 'Alias on', unchecked: 'Alias off' },
    context: {
      checkboxLabels: { checked: 'Context on', unchecked: 'Context off' },
    },
    on: 'Context on',
    off: 'Context off',
  },
  {
    source: 'absent',
    alias: undefined,
    context: {},
    on: undefined,
    off: undefined,
  },
])(
  'boolean state label follows $source for both states',
  ({ alias, context, on, off }) => {
    for (const checked of [false, true]) {
      const schema = {
        type: 'object',
        properties: {
          notify: {
            type: 'boolean',
            presentation: { inputType: 'switch', FieldInputProps: { alias } },
          },
        },
      } satisfies JSONSchema;
      const { container, unmount } = render(
        <Form
          jsonSchema={schema}
          defaultValue={{ notify: checked }}
          context={context}
          fieldInputDefinitions={plugin.fieldInputDefinitions}
          FieldRenderer={plugin.FieldRenderer}
          LabelRenderer={plugin.LabelRenderer}
        />,
      );
      const control = screen.getByRole('switch');
      expect(computeAccessibleName(control)).toBe('notify');
      const expected = checked ? on : off;
      if (expected !== undefined)
        expect(container.textContent).toContain(expected);
      else expect(container.textContent).not.toMatch(/Alias|Context/);
      if (context && 'checkboxLabels' in context)
        expect(container.textContent).not.toContain('Alias');
      unmount();
    }
  },
);

it.each([
  {
    source: 'alias',
    alias: { on: 'Alias on', off: 'Alias off' },
    context: {},
    prefix: 'Alias',
  },
  {
    source: 'context before alias',
    alias: { on: 'Alias on', off: 'Alias off' },
    context: { switchLabels: { on: 'Context on', off: 'Context off' } },
    prefix: 'Context',
  },
  {
    source: 'empty context masks alias',
    alias: { on: 'Alias on', off: 'Alias off' },
    context: { switchLabels: {} },
    prefix: '',
  },
])(
  'string switch map follows $source in either state',
  ({ alias, context, prefix }) => {
    for (const stored of ['on', 'off']) {
      const ref = createRef<FormHandle>();
      const view = render(
        <Form
          ref={ref}
          jsonSchema={{
            type: 'object',
            properties: {
              mode: {
                type: 'string',
                enum: ['on', 'off'],
                presentation: {
                  inputType: 'switch',
                  FieldInputProps: { alias },
                },
              },
            },
          }}
          defaultValue={{ mode: stored }}
          context={context}
          fieldInputDefinitions={plugin.fieldInputDefinitions}
          FieldRenderer={plugin.FieldRenderer}
          LabelRenderer={plugin.LabelRenderer}
        />,
      );
      expect(view.container.textContent).toContain(
        prefix ? prefix + ' ' + stored : stored,
      );
      if (prefix !== 'Alias')
        expect(view.container.textContent).not.toContain('Alias');
      const control = screen.getByRole('switch');
      const checked =
        control instanceof HTMLInputElement
          ? control.checked
          : control.getAttribute('aria-checked') === 'true';
      expect(checked).toBe(stored === 'on');
      fireEvent.click(control);
      expect(ref.current!.getValue()).toEqual({
        mode: stored === 'on' ? 'off' : 'on',
      });
      view.unmount();
    }
  },
);

it('applies the context labels and enum order after external writes, reset and live locks (DETAIL)', async () => {
  const ref = createRef<FormHandle>();
  const onChange = vi.fn();
  const schema: JSONSchema = {
    type: 'object',
    properties: {
      mode: {
        type: 'string',
        title: 'Mode',
        enum: ['on', 'off'],
        presentation: {
          inputType: 'switch',
          FieldInputProps: { alias: { on: 'Alias on', off: 'Alias off' } },
        },
      },
    },
  };
  const form = (lock?: 'readOnly' | 'disabled') => (
    <Form
      ref={ref}
      jsonSchema={schema}
      defaultValue={{ mode: 'off' }}
      context={{ switchLabels: { on: 'Context on', off: 'Context off' } }}
      fieldInputDefinitions={plugin.fieldInputDefinitions}
      FieldRenderer={plugin.FieldRenderer}
      LabelRenderer={plugin.LabelRenderer}
      onChange={onChange}
      readOnly={lock === 'readOnly'}
      disabled={lock === 'disabled'}
    />
  );
  const view = render(form());
  const control = () => screen.getByRole('switch');
  const assertMode = (mode: string) => {
    const element = control();
    const checked =
      element instanceof HTMLInputElement
        ? element.checked
        : element.getAttribute('aria-checked') === 'true';
    expect(checked).toBe(mode === 'on');
    expect(view.container.textContent).toContain(`Context ${mode}`);
    expect(ref.current!.getValue()).toEqual({ mode });
  };
  assertMode('off');
  for (const mode of ['on', 'off', 'on', 'off']) {
    await act(async () => ref.current!.setValue({ mode }));
    assertMode(mode);
  }
  onChange.mockClear();
  fireEvent.click(control());
  assertMode('on');
  expect(onChange).toHaveBeenCalledTimes(1);
  expect(onChange).toHaveBeenCalledWith({ mode: 'on' });
  await act(async () => ref.current!.reset());
  assertMode('off');
  for (const lock of ['readOnly', 'disabled'] as const) {
    view.rerender(form(lock));
    onChange.mockClear();
    fireEvent.click(control());
    expect(onChange).not.toHaveBeenCalled();
    assertMode('off');
  }
});

it('plain Ant Design Mobile Switch skips Tab and never saves on Space or Enter', async () => {
  const onChange = vi.fn();
  const keys = userEvent.setup();
  render(
    <>
      <button>Before</button>
      <Switch onChange={onChange} />
      <button>After</button>
    </>,
  );
  const widget = screen.getByRole('switch');

  await keys.tab();
  expect(document.activeElement).toBe(
    screen.getByRole('button', { name: 'Before' }),
  );
  await keys.tab();
  const after = screen.getByRole('button', { name: 'After' });
  expect(document.activeElement).toBe(after);
  widget.focus();
  expect(document.activeElement).toBe(after);

  for (const key of [' ', 'Enter']) {
    fireEvent.keyDown(widget, { key });
    fireEvent.keyUp(widget, { key });
  }
  expect(onChange).not.toHaveBeenCalled();
  fireEvent.click(widget);
  expect(onChange).toHaveBeenCalledTimes(1);
  expect(onChange).toHaveBeenCalledWith(true);
});

it('keeps native focus and activation behavior and saves one unlocked boolean click', async () => {
  const ref = createRef<FormHandle>();
  const onChange = vi.fn();
  const keys = userEvent.setup();
  const schema: JSONSchema = {
    type: 'object',
    properties: {
      notify: { type: 'boolean', presentation: { inputType: 'switch' } },
    },
  };
  const form = (lock?: 'readOnly' | 'disabled') => (
    <>
      <button>Before</button>
      <Form
        ref={ref}
        defaultValue={{ notify: false }}
        jsonSchema={schema}
        fieldInputDefinitions={plugin.fieldInputDefinitions}
        onChange={onChange}
        readOnly={lock === 'readOnly'}
        disabled={lock === 'disabled'}
        validationMode={0}
      />
      <button>After</button>
    </>
  );
  const view = render(form());
  const widget = screen.getByRole('switch');

  await keys.tab();
  expect(document.activeElement).toBe(
    screen.getByRole('button', { name: 'Before' }),
  );
  await keys.tab();
  const after = screen.getByRole('button', { name: 'After' });
  expect(document.activeElement).toBe(after);
  await act(async () => ref.current!.focus('/notify'));
  expect(document.activeElement).toBe(after);

  for (const key of [' ', 'Enter']) {
    fireEvent.keyDown(widget, { key });
    fireEvent.keyUp(widget, { key });
  }
  expect(onChange).not.toHaveBeenCalled();
  expect(ref.current!.getValue()).toEqual({ notify: false });

  fireEvent.click(widget);
  expect(onChange).toHaveBeenCalledTimes(1);
  expect(onChange).toHaveBeenCalledWith({ notify: true });
  expect(ref.current!.getValue()).toEqual({ notify: true });

  for (const lock of ['readOnly', 'disabled'] as const) {
    view.rerender(form(lock));
    onChange.mockClear();
    fireEvent.click(screen.getByRole('switch'));
    expect(onChange).not.toHaveBeenCalled();
    expect(ref.current!.getValue()).toEqual({ notify: true });
  }
});
