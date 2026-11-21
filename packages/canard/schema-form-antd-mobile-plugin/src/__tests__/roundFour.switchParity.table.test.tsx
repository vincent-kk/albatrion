import { createRef } from 'react';

import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from '@testing-library/react';
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
  fireEvent.click(control());
  assertMode('on');
  expect(onChange).toHaveBeenLastCalledWith({ mode: 'on' });
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

it('leaves native Switch keyboard behavior to the library', () => {
  const ref = createRef<FormHandle>();
  render(
    <Form
      ref={ref}
      defaultValue={false}
      jsonSchema={{ type: 'boolean', presentation: { inputType: 'switch' } }}
      fieldInputDefinitions={plugin.fieldInputDefinitions}
    />,
  );
  const widget = screen.getByRole('switch');
  fireEvent.keyDown(widget, { key: ' ' });
  expect(ref.current?.getValue()).toBe(false);
  fireEvent.click(widget);
  expect(ref.current?.getValue()).toBe(true);
});
