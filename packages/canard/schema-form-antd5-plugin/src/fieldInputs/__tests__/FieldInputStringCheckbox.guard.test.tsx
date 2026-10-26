import { createElement, createRef } from 'react';

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import { Form, type FormHandle } from '@canard/schema-form';

import { FieldInputStringCheckboxDefinition } from '../FieldInputStringCheckbox';

afterEach(cleanup);

const schemaOf = (type: 'array' | ['array', 'null']) =>
  ({
    type,
    items: { type: 'string', enum: ['a', 'b'] },
    presentation: { inputType: 'checkbox' },
  }) as const;

const renderCheckbox = (
  type: 'array' | ['array', 'null'],
  defaultValue: unknown,
) => {
  const ref = createRef<FormHandle>();
  render(
    <Form
      ref={ref}
      fieldInputDefinitions={[FieldInputStringCheckboxDefinition]}
      jsonSchema={schemaOf(type)}
      defaultValue={defaultValue as never}
      onError={() => {}}
    />,
  );
  return ref;
};

const checkedBoxes = () =>
  screen
    .getAllByRole('checkbox')
    .filter((box) => (box as HTMLInputElement).checked);

it.each([
  ['string', 'ab'],
  ['object', { a: 1 }],
])(
  'renders a %s value without throwing and checks nothing, with the invalid marker',
  (_, value) => {
    renderCheckbox('array', value);
    expect(screen.getAllByRole('checkbox')).toHaveLength(2);
    expect(checkedBoxes()).toHaveLength(0);
    expect(screen.getByRole('group').getAttribute('aria-invalid')).toBe('true');
    expect(screen.getByRole('status').textContent).toBe('Invalid value');
  },
);

it.each([null, undefined])(
  'shows no marker for %s on a nullable schema',
  (value) => {
    renderCheckbox(['array', 'null'], value);
    expect(checkedBoxes()).toHaveLength(0);
    expect(screen.getByRole('group').hasAttribute('aria-invalid')).toBe(false);
    expect(screen.queryByRole('status')).toBeNull();
  },
);

it('writes exactly the one checked value and clears the marker', () => {
  const ref = renderCheckbox('array', 'ab');
  fireEvent.click(screen.getAllByRole('checkbox')[0]);
  expect(ref.current!.getValue()).toEqual(['a']);
  expect(screen.getByRole('group').hasAttribute('aria-invalid')).toBe(false);
  expect(screen.queryByRole('status')).toBeNull();
});

it.each([
  ['string', 'ab'],
  ['object', { a: 1 }],
])(
  'direct render of a %s value checks no box and does not throw',
  (_, value) => {
    const { container } = render(
      createElement(FieldInputStringCheckboxDefinition.Component, {
        name: 'c',
        jsonSchema: {
          type: 'array',
          items: { type: 'string', enum: ['a', 'b'] },
        },
        value,
        defaultValue: value,
        onChange: () => {},
        context: {},
        misfit: true,
      } as never),
    );
    const boxes = container.querySelectorAll('input[type="checkbox"]');
    expect(boxes).toHaveLength(2);
    for (const box of boxes)
      expect((box as HTMLInputElement).checked).toBe(false);
  },
);
