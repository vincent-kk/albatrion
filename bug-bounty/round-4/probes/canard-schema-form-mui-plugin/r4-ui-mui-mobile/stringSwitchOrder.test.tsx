import { createRef } from 'react';

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import { Form, type FormHandle, type JSONSchema } from '@canard/schema-form';

import { plugin } from '../../index';

afterEach(cleanup);

/**
 * EQ11: the same string switch schema in every UI plugin. antd5, antd6 and antd-mobile treat
 * enum[0] as the checked value (their own tests pin enum ['enabled', 'disabled'] with 'enabled'
 * on). This mirrors the MUI package's own `StringSwitch` story, whose enum is ['on', 'off'].
 */
const schema = {
  type: 'object',
  properties: {
    mode: {
      type: 'string',
      enum: ['on', 'off'],
      presentation: {
        inputType: 'switch',
        FieldInputProps: { alias: { on: 'alias on', off: 'alias off' } },
      },
    },
  },
} satisfies JSONSchema;

it('a stored enum[0] value shows the switch as checked, as in the antd plugins', () => {
  render(
    <Form
      jsonSchema={schema}
      defaultValue={{ mode: 'on' }}
      fieldInputDefinitions={plugin.fieldInputDefinitions}
      FieldRenderer={plugin.FieldRenderer}
    />,
  );
  expect((screen.getByRole('switch') as HTMLInputElement).checked).toBe(true);
});

it('switching on from an empty field stores enum[0], as in the antd plugins', () => {
  const ref = createRef<FormHandle>();
  render(
    <Form
      ref={ref}
      jsonSchema={schema}
      fieldInputDefinitions={plugin.fieldInputDefinitions}
      FieldRenderer={plugin.FieldRenderer}
    />,
  );
  fireEvent.click(screen.getByRole('switch'));
  expect((screen.getByRole('switch') as HTMLInputElement).checked).toBe(true);
  expect(ref.current!.getValue()).toEqual({ mode: 'on' });
});

it('the story alias labels the two switch states', () => {
  const { container } = render(
    <Form
      jsonSchema={schema}
      fieldInputDefinitions={plugin.fieldInputDefinitions}
      FieldRenderer={plugin.FieldRenderer}
    />,
  );
  expect(container.textContent).toContain('alias on');
  expect(container.textContent).toContain('alias off');
});

/**
 * README: the boolean switch supports custom labels for `checked`/`unchecked` states. antd5,
 * antd6 and antd-mobile read them from `presentation.FieldInputProps.alias`.
 */
it('the boolean switch shows custom checked and unchecked labels', () => {
  const { container } = render(
    <Form
      jsonSchema={{
        type: 'object',
        properties: {
          notify: {
            type: 'boolean',
            presentation: {
              inputType: 'switch',
              FieldInputProps: { alias: { checked: 'On', unchecked: 'Off' } },
            },
          },
        },
      }}
      defaultValue={{ notify: true }}
      fieldInputDefinitions={plugin.fieldInputDefinitions}
      FieldRenderer={plugin.FieldRenderer}
    />,
  );
  expect(container.textContent).toMatch(/On|Off/);
});
