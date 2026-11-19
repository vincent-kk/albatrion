import { act, cleanup, fireEvent, render } from '@testing-library/react';
import { createRef } from 'react';
import { afterEach, expect, it } from 'vitest';

import { Form, type FormHandle, ValidationMode } from '@/schema-form';

afterEach(cleanup);

/**
 * IN3 / RG1 of round 3 items 1 and 6: the built-in radio and checkbox inputs derive option ids as
 * `${id}-${index}` (FieldInputStringRadio.tsx:61, FieldInputStringCheckbox.tsx:75), and
 * field-input.md teaches the same pattern. A sibling field named `<name>-<index>` has the scoped
 * id `${formId}:/<name>-<index>`, which equals an option id of the group.
 */
const createSchema = (radioSibling: string, checkboxSibling: string) =>
  ({
    type: 'object',
    properties: {
      plan: {
        type: 'string',
        enum: ['free', 'pro'],
        presentation: { inputType: 'radio' },
      },
      [radioSibling]: { type: 'string' },
      tags: {
        type: 'array',
        items: { type: 'string', enum: ['a', 'b'] },
        presentation: { inputType: 'checkbox' },
      },
      [checkboxSibling]: { type: 'string' },
    },
  }) as const;

const mount = (radioSibling: string, checkboxSibling: string) => {
  const handle = createRef<FormHandle>();
  const view = render(
    <Form
      ref={handle}
      jsonSchema={createSchema(radioSibling, checkboxSibling)}
      defaultValue={{ plan: 'free', tags: [] }}
      validationMode={ValidationMode.None}
    />,
  );
  const ids = [...view.container.querySelectorAll('[id]')].map(
    (element) => element.id,
  );
  const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
  const labelOf = (name: string) =>
    [...view.container.querySelectorAll('label')].find(
      (label) => label.textContent === name,
    )!;
  return { handle, view, duplicates, labelOf };
};

it('control: siblings without a derived-id name keep ids unique and their labels inert for the groups', async () => {
  const { handle, duplicates, labelOf } = mount('planNote', 'tagsNote');
  expect(duplicates).toEqual([]);
  const loaded = handle.current!.getValue();
  await act(async () => {
    fireEvent.click(labelOf('planNote'));
    fireEvent.click(labelOf('tagsNote'));
  });
  expect(handle.current!.getValue()).toEqual(loaded);
  expect(loaded).toEqual({ plan: 'free' });
});

it('ids stay unique when a sibling is named after a built-in radio option id', () => {
  const { duplicates } = mount('plan-1', 'tagsNote');
  expect(duplicates).toEqual([]);
});

it('clicking the label of a sibling named plan-1 leaves the radio value unchanged', async () => {
  const { handle, view, labelOf } = mount('plan-1', 'tagsNote');
  const label = labelOf('plan-1');
  await act(async () => {
    fireEvent.click(label);
  });
  expect({
    plan: (handle.current!.getValue() as { plan?: string }).plan,
    labelControlIsTextInput: (label as HTMLLabelElement).control?.getAttribute('type'),
    checkedRadio: (
      view.container.querySelector('input[type="radio"]:checked') as HTMLInputElement | null
    )?.value,
  }).toEqual({
    plan: 'free',
    labelControlIsTextInput: 'text',
    checkedRadio: 'free',
  });
});

it('ids stay unique when a sibling is named after a built-in checkbox option id', () => {
  const { duplicates } = mount('planNote', 'tags-0');
  expect(duplicates).toEqual([]);
});

it('clicking the label of a sibling named tags-0 leaves the checkbox value unchanged', async () => {
  const { handle, labelOf } = mount('planNote', 'tags-0');
  const label = labelOf('tags-0');
  await act(async () => {
    fireEvent.click(label);
  });
  expect({
    tags: (handle.current!.getValue() as { tags?: string[] }).tags ?? [],
    labelControlType: (label as HTMLLabelElement).control?.getAttribute('type'),
  }).toEqual({ tags: [], labelControlType: 'text' });
});
