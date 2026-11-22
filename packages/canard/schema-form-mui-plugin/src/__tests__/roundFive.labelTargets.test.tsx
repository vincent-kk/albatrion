import { cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import { Form, type JSONSchema } from '@canard/schema-form';

import { plugin } from '../index';

afterEach(cleanup);
it.each<[string, JSONSchema, string]>([
  ['enum', { type: 'string', enum: ['a', 'b'] }, 'a'],
  ['date', { type: 'string', format: 'date' }, '2024-01-02'],
  ['time', { type: 'string', format: 'time' }, '12:30:00Z'],
  ['month', { type: 'string', format: 'month' }, '2024-01'],
])(
  'round-5: Form.Label targets the operated %s control',
  (_kind, field, value) => {
    const view = render(
      <Form
        jsonSchema={{ type: 'object', properties: { field } }}
        defaultValue={{ field: value }}
        fieldInputDefinitions={plugin.fieldInputDefinitions}
        FieldRenderer={plugin.FieldRenderer}
        LabelRenderer={plugin.LabelRenderer}
        ErrorMessageRenderer={plugin.ErrorMessageRenderer}
      >
        <Form.Label path="/field" />
        <Form.Input path="/field" />
      </Form>,
    );
    const label = view.container.querySelector('label[for]');
    const id = label?.getAttribute('for');
    expect(id).toBeTruthy();
    const target = id ? document.getElementById(id) : null;
    expect(target).toBeTruthy();
    expect(target?.closest('[aria-hidden="true"]')).toBeNull();
    expect(target?.tabIndex).toBeGreaterThanOrEqual(0);
    expect(
      view.getAllByRole(_kind === 'enum' ? 'combobox' : 'group', {
        name: 'field',
      }),
    ).toContain(target);
  },
);

it.each<[string, JSONSchema, string]>([
  ['enum', { type: 'string', enum: ['a', 'b'] }, 'a'],
  ['date', { type: 'string', format: 'date' }, '2024-01-02'],
  ['time', { type: 'string', format: 'time' }, '12:30:00Z'],
  ['month', { type: 'string', format: 'month' }, '2024-01'],
])(
  'round-5 core label references only the associated %s control',
  (kind, field, value) => {
    const view = render(
      <>
        {['first', 'second'].map((key) => (
          <Form
            key={key}
            jsonSchema={{ type: 'object', properties: { field } }}
            defaultValue={{ field: value }}
            fieldInputDefinitions={plugin.fieldInputDefinitions}
            LabelRenderer={plugin.LabelRenderer}
          >
            <Form.Label path="/field" />
            <Form.Input path="/field" />
          </Form>
        ))}
      </>,
    );
    const labels =
      view.container.querySelectorAll<HTMLLabelElement>('label[for]');
    const controls = view
      .getAllByRole(kind === 'enum' ? 'combobox' : 'group', { name: 'field' })
      .filter((control) =>
        Array.from(labels).some((label) => label.htmlFor === control.id),
      );
    expect(controls).toHaveLength(2);
    const ids = [...view.container.querySelectorAll('[id]')].map(
      (element) => element.id,
    );
    expect(new Set(ids).size).toBe(ids.length);
    for (const element of view.container.querySelectorAll(
      '[for], [aria-labelledby]',
    )) {
      for (const attribute of ['for', 'aria-labelledby'])
        for (const id of element.getAttribute(attribute)?.split(/\s+/) ?? [])
          expect(document.getElementById(id)).not.toBeNull();
    }
    for (const control of controls) {
      expect(
        Array.from(labels).some((label) => label.htmlFor === control.id),
      ).toBe(true);
    }
  },
);

it.each<[JSONSchema, string]>([
  [{ type: 'string', format: 'date' }, '2024-01-02'],
  [{ type: 'string', format: 'time' }, '12:30:00Z'],
  [{ type: 'string', format: 'month' }, '2024-01'],
])('forwards a field label click to an enabled picker editor', (field, value) => {
  const form = (disabled: boolean) => (
    <Form
      jsonSchema={{ type: 'object', properties: { field } }}
      defaultValue={{ field: value }}
      fieldInputDefinitions={plugin.fieldInputDefinitions}
      LabelRenderer={plugin.LabelRenderer}
      disabled={disabled}
    >
      <Form.Label path="/field">Field title</Form.Label>
      <Form.Input path="/field" />
    </Form>
  );
  const view = render(form(true));
  const label = () => view.container.querySelector<HTMLLabelElement>('label[for]')!;
  const target = () => document.getElementById(label().htmlFor)!;
  expect(target()).toBeTruthy();
  fireEvent.click(label());
  expect(target().contains(document.activeElement)).toBe(false);

  view.rerender(form(false));
  fireEvent.click(label());
  expect(target().contains(document.activeElement)).toBe(true);
});
