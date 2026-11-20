import { cleanup, render } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';
import { Form, type JSONSchema } from '@canard/schema-form';
import { plugin } from '../index';

afterEach(cleanup);
it.each<[string, JSONSchema, string]>([
  ['enum', { type: 'string', enum: ['a', 'b'] }, 'a'],
  ['date', { type: 'string', format: 'date' }, '2024-01-02'],
  ['time', { type: 'string', format: 'time' }, '12:30:00Z'],
  ['month', { type: 'string', format: 'month' }, '2024-01'],
])('round-5: Form.Label targets the operated %s control', (_kind, field, value) => {
  const view = render(<Form jsonSchema={{ type: 'object', properties: { field } }}
    defaultValue={{ field: value }} fieldInputDefinitions={plugin.fieldInputDefinitions}
    FieldRenderer={plugin.FieldRenderer} LabelRenderer={plugin.LabelRenderer}
    ErrorMessageRenderer={plugin.ErrorMessageRenderer}>
    <Form.Label path="/field" /><Form.Input path="/field" />
  </Form>);
  const label = view.container.querySelector('label[for]');
  const id = label?.getAttribute('for');
  expect(id).toBeTruthy();
  const target = id ? document.getElementById(id) : null;
  expect(target).toBeTruthy();
  expect(target?.closest('[aria-hidden="true"]')).toBeNull();
  expect(target?.tabIndex).toBeGreaterThanOrEqual(0);
  expect(view.getAllByRole(_kind === 'enum' ? 'combobox' : 'group', { name: 'field' })).toContain(target);
});
