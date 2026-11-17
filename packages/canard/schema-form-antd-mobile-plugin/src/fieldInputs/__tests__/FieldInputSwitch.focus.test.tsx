import { createRef } from 'react';

import { act, cleanup, render, screen } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import { Form, type FormHandle, type JSONSchema } from '@canard/schema-form';

import { FieldInputBooleanSwitchDefinition } from '../FieldInputBooleanSwitch';
import { FieldInputStringSwitchDefinition } from '../FieldInputStringSwitch';

afterEach(cleanup);

it.each(['boolean', 'string'])(
  'focus(path) reaches the %s switch',
  async (kind) => {
    const ref = createRef<FormHandle>();
    const schema: JSONSchema =
      kind === 'boolean'
        ? { type: 'boolean', presentation: { inputType: 'switch' } }
        : {
            type: 'string',
            enum: ['on', 'off'],
            presentation: { inputType: 'switch' },
          };
    render(
      <Form
        ref={ref}
        jsonSchema={schema}
        fieldInputDefinitions={[
          FieldInputBooleanSwitchDefinition,
          FieldInputStringSwitchDefinition,
        ]}
      />,
    );
    await act(async () => ref.current!.focus(''));
    expect(document.activeElement).toBe(screen.getByRole('switch'));
  },
);
