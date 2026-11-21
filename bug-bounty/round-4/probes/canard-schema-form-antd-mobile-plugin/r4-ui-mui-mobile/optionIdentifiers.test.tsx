import { createRef } from 'react';

import { act, cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import {
  type ArrayNode,
  Form,
  type FormHandle,
  type JSONSchema,
} from '@canard/schema-form';

import { plugin } from '../../index';

afterEach(cleanup);

/** A radio field and a sibling text field whose property name is the radio name plus "-1". */
const schema = {
  type: 'object',
  properties: {
    contact: {
      type: 'string',
      enum: ['email', 'phone'],
      presentation: { inputType: 'radio' },
    },
    'contact-1': { type: 'string' },
  },
} satisfies JSONSchema;

it('IN3: an option id never equals the id of a sibling field whose name ends in -<index>', () => {
  const { container } = render(
    <Form
      jsonSchema={schema}
      fieldInputDefinitions={plugin.fieldInputDefinitions}
      FieldRenderer={plugin.FieldRenderer}
      LabelRenderer={plugin.LabelRenderer}
    />,
  );
  const ids = Array.from(container.querySelectorAll('[id]')).map(
    (element) => element.id,
  );
  expect(ids.filter((id, index) => ids.indexOf(id) !== index)).toEqual([]);
});

it('IN3: clicking the label of the field "contact-1" does not change the radio field "contact"', () => {
  const ref = createRef<FormHandle>();
  const { container } = render(
    <Form
      ref={ref}
      jsonSchema={schema}
      defaultValue={{ contact: 'email' }}
      fieldInputDefinitions={plugin.fieldInputDefinitions}
      FieldRenderer={plugin.FieldRenderer}
      LabelRenderer={plugin.LabelRenderer}
    />,
  );
  const textInput = container.querySelector<HTMLInputElement>(
    'input[type="text"]',
  )!;
  const label = container.querySelector<HTMLLabelElement>(
    `label[for="${textInput.id}"]`,
  )!;
  expect(label.textContent).toContain('contact-1');
  fireEvent.click(label);
  expect(ref.current!.getValue()).toEqual({ contact: 'email' });
  expect(label.control).toBe(textInput);
});

/** Natively checked radios, as `<path>-<option index>` read from the scoped option ids. */
const nativeChecked = (container: HTMLElement) =>
  Array.from(container.querySelectorAll<HTMLInputElement>('input[type=radio]'))
    .filter((input) => input.checked)
    .map((input) => input.id.slice(input.id.indexOf(':') + 1));

it('IN3: inserting an item at index 0 keeps every loaded radio selection natively checked', async () => {
  const ref = createRef<FormHandle>();
  const { container } = render(
    <Form
      ref={ref}
      jsonSchema={{
        type: 'object',
        properties: {
          plans: {
            type: 'array',
            items: {
              type: 'string',
              enum: ['basic', 'pro'],
              presentation: { inputType: 'radio' },
            },
          },
        },
      }}
      defaultValue={{ plans: ['basic', 'pro'] }}
      fieldInputDefinitions={plugin.fieldInputDefinitions}
      FieldRenderer={plugin.FieldRenderer}
    />,
  );
  await act(async () => {
    await Promise.resolve();
  });
  expect(nativeChecked(container)).toEqual(['/plans/0-0', '/plans/1-1']);
  await act(async () => {
    (ref.current!.findNode('/plans') as ArrayNode).insert(0, 'pro');
    await Promise.resolve();
  });
  expect(ref.current!.getValue()).toEqual({ plans: ['pro', 'basic', 'pro'] });
  expect(nativeChecked(container)).toEqual([
    '/plans/0-1',
    '/plans/1-0',
    '/plans/2-1',
  ]);
});
