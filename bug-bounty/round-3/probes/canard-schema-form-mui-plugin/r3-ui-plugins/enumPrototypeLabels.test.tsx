import { cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { Form } from '@canard/schema-form';

import { FieldInputRadioGroupDefinition } from '../../fieldInputs/FieldInputRadioGroup';
import { FieldInputStringCheckboxDefinition } from '../../fieldInputs/FieldInputStringCheckbox';
import { FieldInputStringEnumDefinition } from '../../fieldInputs/FieldInputStringEnum';

const preventWindowError = (event: ErrorEvent) => event.preventDefault();

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  window.removeEventListener('error', preventWindowError);
});

const definitions = [
  FieldInputStringCheckboxDefinition,
  FieldInputRadioGroupDefinition,
  FieldInputStringEnumDefinition,
];

const reactChildErrors = (spy: ReturnType<typeof vi.spyOn>) =>
  spy.mock.calls
    .map((call) => call.map(String).join(' '))
    .filter((text) => /not valid as a React child/.test(text));

const alias = { owner: 'Owner' };

describe('enum values named like Object.prototype members with alias labels (mui)', () => {
  it('a radio option "constructor" shows its own value as the label', () => {
    const errors = vi.spyOn(console, 'error');
    render(
      <Form
        fieldInputDefinitions={definitions}
        jsonSchema={{
          type: 'object',
          properties: {
            role: {
              type: 'string',
              enum: ['owner', 'constructor'],
              presentation: { inputType: 'radio', FieldInputProps: { alias } },
            },
          },
        }}
      />,
    );
    const labels = Array.from(
      document.querySelectorAll('input[type="radio"]'),
    ).map((radio) => radio.closest('label')?.textContent ?? '');
    expect(labels).toEqual(['Owner', 'constructor']);
    expect(reactChildErrors(errors)).toEqual([]);
  });

  it('a radio option "__proto__" renders instead of crashing the field', () => {
    window.addEventListener('error', preventWindowError);
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const view = render(
      <Form
        fieldInputDefinitions={definitions}
        jsonSchema={{
          type: 'object',
          properties: {
            key: {
              type: 'string',
              enum: ['owner', '__proto__'],
              presentation: { inputType: 'radio', FieldInputProps: { alias } },
            },
          },
        }}
      />,
    );
    expect(document.querySelectorAll('input[type="radio"]')).toHaveLength(2);
    expect(view.container.textContent).toContain('__proto__');
  });

  it('a checkbox group option "toString" shows its own value as the label', () => {
    const errors = vi.spyOn(console, 'error');
    render(
      <Form
        fieldInputDefinitions={definitions}
        jsonSchema={{
          type: 'object',
          properties: {
            methods: {
              type: 'array',
              items: { type: 'string', enum: ['owner', 'toString'] },
              presentation: {
                inputType: 'checkbox',
                FieldInputProps: { alias },
              },
            },
          },
        }}
      />,
    );
    const labels = Array.from(
      document.querySelectorAll('input[type="checkbox"]'),
    ).map((checkbox) => checkbox.closest('label')?.textContent ?? '');
    expect(labels).toEqual(['Owner', 'toString']);
    expect(reactChildErrors(errors)).toEqual([]);
  });

  it('a select option "constructor" shows its own value as the label', () => {
    const errors = vi.spyOn(console, 'error');
    render(
      <Form
        fieldInputDefinitions={definitions}
        jsonSchema={{
          type: 'object',
          properties: {
            role: {
              type: 'string',
              enum: ['owner', 'constructor'],
              presentation: { FieldInputProps: { alias } },
            },
          },
        }}
      />,
    );
    fireEvent.mouseDown(document.querySelector('[role="combobox"]')!);
    const options = Array.from(
      document.querySelectorAll('[role="option"]'),
    ).map((option) => option.textContent);
    expect(options).toEqual(['Owner', 'constructor']);
    expect(reactChildErrors(errors)).toEqual([]);
  });
});
