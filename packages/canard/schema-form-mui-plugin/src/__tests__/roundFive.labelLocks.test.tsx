import { cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import { Form, type JSONSchema } from '@canard/schema-form';

import { plugin } from '../index';

afterEach(cleanup);

const cases: [string, 'disabled' | 'readOnly', JSONSchema, string][] = [
  ['date', 'disabled', { type: 'string', format: 'date' }, '2024-01-02'],
  ['time', 'disabled', { type: 'string', format: 'time' }, '12:30:00Z'],
  ['month', 'disabled', { type: 'string', format: 'month' }, '2024-01'],
  ['date', 'readOnly', { type: 'string', format: 'date' }, '2024-01-02'],
  ['time', 'readOnly', { type: 'string', format: 'time' }, '12:30:00Z'],
  ['month', 'readOnly', { type: 'string', format: 'month' }, '2024-01'],
  ['enum', 'disabled', { type: 'string', enum: ['a', 'b'] }, 'a'],
];

it.each(cases)(
  'the label for %s follows native focus behavior when %s',
  (kind, lock, field, value) => {
    const disabled = lock === 'disabled';
    const readOnly = lock === 'readOnly';
    const view = render(
      <Form
        disabled={disabled}
        readOnly={readOnly}
        jsonSchema={{ type: 'object', properties: { field } }}
        defaultValue={{ field: value }}
        fieldInputDefinitions={plugin.fieldInputDefinitions}
        LabelRenderer={plugin.LabelRenderer}
      >
        <Form.Label path="/field" />
        <Form.Input path="/field" />
      </Form>,
    );
    const label = view.container.querySelector<HTMLLabelElement>('label[for]');
    const control = label && document.getElementById(label.htmlFor);
    const native = view.container.querySelector<HTMLInputElement>(
      'input[aria-hidden="true"]',
    );
    if (!label || !control || !native)
      throw new Error('Missing label or its field controls');

    expect(control.getAttribute('role')).toBe(
      kind === 'enum' ? 'combobox' : 'group',
    );
    expect(native.disabled).toBe(disabled);
    expect(native.readOnly).toBe(readOnly);
    expect(control.contains(document.activeElement)).toBe(false);

    fireEvent.click(label);
    expect(control.contains(document.activeElement)).toBe(readOnly);
  },
);
