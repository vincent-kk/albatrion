import { createRef } from 'react';

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import { Form, type FormHandle, type JSONSchema } from '@canard/schema-form';

import { plugin } from '../../index';

afterEach(cleanup);

/**
 * A stored value outside the current enum, such as an option a later schema removed.
 * The core default checkbox group keeps it on toggle; antd5, antd6 and MUI drop it.
 */
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

const mount = (withPlugin: boolean) => {
  const ref = createRef<FormHandle>();
  render(
    <Form
      ref={ref}
      jsonSchema={schema}
      defaultValue={{ topics: ['legacy'] }}
      {...(withPlugin
        ? {
            fieldInputDefinitions: plugin.fieldInputDefinitions,
            FieldRenderer: plugin.FieldRenderer,
          }
        : {})}
    />,
  );
  return ref;
};

const box = (label: string) =>
  screen
    .getAllByRole('checkbox')
    .find((element) => element.closest('label')?.textContent === label)!;

it('control: the core default checkbox group keeps the unknown value when another option is checked', () => {
  const ref = mount(false);
  fireEvent.click(box('news'));
  expect(ref.current!.getValue()).toEqual({ topics: ['legacy', 'news'] });
});

it('checking another option never stores a JSON-quoted spelling of the unknown value', () => {
  const ref = mount(true);
  fireEvent.click(box('news'));
  const topics = (ref.current!.getValue() as { topics: string[] }).topics;
  expect(topics).toContain('news');
  expect(topics).not.toContain('"legacy"');
});
