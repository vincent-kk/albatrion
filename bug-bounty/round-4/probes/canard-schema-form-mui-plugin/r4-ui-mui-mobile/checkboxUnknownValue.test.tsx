import { createRef } from 'react';

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import { Form, type FormHandle, type JSONSchema } from '@canard/schema-form';

import { plugin } from '../../index';

afterEach(cleanup);

/** A stored value outside the current enum, such as an option a later schema removed. */
const schema = {
  type: 'object',
  properties: {
    topics: {
      type: 'array',
      items: { type: 'string', enum: ['news', 'sports'] },
      presentation: { inputType: 'checkbox' },
    },
  },
} satisfies JSONSchema;

/**
 * Diagnostic for EQ11: the core default checkbox group keeps an unknown stored value when the
 * user checks another option. This records what the MUI group does with the same action.
 */
it('diagnostic: checking another option keeps the unknown stored value, as the core default does', () => {
  const ref = createRef<FormHandle>();
  render(
    <Form
      ref={ref}
      jsonSchema={schema}
      defaultValue={{ topics: ['legacy'] }}
      fieldInputDefinitions={plugin.fieldInputDefinitions}
      FieldRenderer={plugin.FieldRenderer}
    />,
  );
  fireEvent.click(screen.getByRole('checkbox', { name: 'news' }));
  expect(ref.current!.getValue()).toEqual({ topics: ['legacy', 'news'] });
});
