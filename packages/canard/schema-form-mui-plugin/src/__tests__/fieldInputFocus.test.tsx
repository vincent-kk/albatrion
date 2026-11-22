import { createRef } from 'react';

import {
  act,
  cleanup,
  fireEvent,
  render,
  waitForElementToBeRemoved,
} from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import { Form, type FormHandle, type JSONSchema } from '@canard/schema-form';

import { plugin } from '../index';

afterEach(cleanup);

const cases = [
  {
    name: 'enum Select',
    field: { type: 'string', enum: ['alpha', 'beta'] },
    value: 'alpha',
    selector: '[role="combobox"]',
  },
  {
    name: 'URI address',
    field: { type: 'string', format: 'uri' },
    value: 'https://example.com',
    selector: 'input[type="text"]:not([aria-hidden])',
  },
  {
    name: 'date editor',
    field: { type: 'string', format: 'date' },
    value: '2024-01-15',
    selector: '[role="group"][tabindex="0"]',
  },
  {
    name: 'month editor',
    field: { type: 'string', format: 'month' },
    value: '2024-01',
    selector: '[role="group"][tabindex="0"]',
  },
  {
    name: 'time editor',
    field: { type: 'string', format: 'time' },
    value: '10:30:00Z',
    selector: '[role="group"][tabindex="0"]',
  },
] satisfies {
  name: string;
  field: JSONSchema;
  value: string;
  selector: string;
}[];

it.each(cases)(
  'focus(path) reaches the primary control for the $name',
  async ({ field, value, selector }) => {
    const ref = createRef<FormHandle>();
    const { container } = render(
      <Form
        ref={ref}
        fieldInputDefinitions={plugin.fieldInputDefinitions}
        FieldRenderer={plugin.FieldRenderer}
        jsonSchema={{ type: 'object', properties: { field } }}
        defaultValue={{ field: value }}
        validationMode={0}
      />,
    );
    const target = container
      .querySelector('[data-path="/field"]')
      ?.querySelector(selector);
    expect(target).toBeTruthy();

    await act(async () => {
      ref.current!.focus('/field');
    });

    expect(target?.contains(document.activeElement)).toBe(true);
  },
);

const renderEnumForms = () => {
  const jsonSchema = {
    type: 'object',
    properties: { field: { type: 'string', enum: ['alpha', 'beta'] } },
  } satisfies JSONSchema;
  return render(
    <>
      {[0, 1].map((key) => (
        <Form
          key={key}
          fieldInputDefinitions={plugin.fieldInputDefinitions}
          FieldRenderer={plugin.FieldRenderer}
          jsonSchema={jsonSchema}
          defaultValue={{ field: 'alpha' }}
        />
      ))}
    </>,
  );
};

it('assigns distinct addresses to Select native inputs with the same leaf name', () => {
  const { container, getAllByRole } = renderEnumForms();
  const inputs = Array.from(
    container.querySelectorAll<HTMLInputElement>('input[name="field"]'),
  );
  expect(inputs).toHaveLength(2);
  const inputIds = inputs.map((input) => input.id);
  expect(inputIds).not.toContain('');
  expect(new Set(inputIds).size).toBe(2);
  for (const combobox of getAllByRole('combobox')) {
    expect(inputIds).not.toContain(combobox.id);
  }
});

it('assigns distinct menu addresses to Selects with the same leaf name', async () => {
  const view = renderEnumForms();
  const menuIds: string[] = [];
  for (const combobox of view.getAllByRole('combobox')) {
    fireEvent.mouseDown(combobox, { button: 0 });
    const listbox = view.getByRole('listbox');
    const menu = listbox.closest<HTMLElement>('[role="presentation"]');
    expect(menu?.id).toBeTruthy();
    menuIds.push(menu!.id);
    fireEvent.keyDown(listbox, { key: 'Escape' });
    await waitForElementToBeRemoved(listbox);
  }
  expect(new Set(menuIds).size).toBe(2);
});

it('stores an enum Select choice as one string', () => {
  const ref = createRef<FormHandle>();
  const view = render(
    <Form
      ref={ref}
      jsonSchema={{ type: 'string', enum: ['alpha', 'beta'] }}
      defaultValue="alpha"
      fieldInputDefinitions={plugin.fieldInputDefinitions}
    />,
  );
  fireEvent.mouseDown(view.getByRole('combobox'), { button: 0 });
  fireEvent.click(view.getByRole('option', { name: 'beta' }));
  expect(ref.current?.getValue()).toBe('beta');
});
