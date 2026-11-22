import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { Form } from '@canard/schema-form';

import { FieldInputRadioGroupDefinition } from '../../fieldInputs/FieldInputRadioGroup';
import { FieldInputStringCheckboxDefinition } from '../../fieldInputs/FieldInputStringCheckbox';
import { FieldInputStringSwitchDefinition } from '../../fieldInputs/FieldInputStringSwitch';

const preventWindowError = (event: ErrorEvent) => event.preventDefault();

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  window.removeEventListener('error', preventWindowError);
});

const definitions = [
  FieldInputStringCheckboxDefinition,
  FieldInputStringSwitchDefinition,
  FieldInputRadioGroupDefinition,
];

const reactChildErrors = (spy: ReturnType<typeof vi.spyOn>) =>
  spy.mock.calls
    .map((call) => call.map(String).join(' '))
    .filter((text) => /not valid as a React child/.test(text));

describe('enum values named like Object.prototype members (antd-mobile)', () => {
  it('a radio option "constructor" shows its own value as the label', () => {
    const errors = vi.spyOn(console, 'error');
    const view = render(
      <Form
        fieldInputDefinitions={definitions}
        jsonSchema={{
          type: 'object',
          properties: {
            role: {
              type: 'string',
              enum: ['owner', 'constructor', 'inspector'],
              presentation: { inputType: 'radio' },
            },
          },
        }}
      />,
    );
    const labels = Array.from(
      view.container.querySelectorAll('.adm-radio-content'),
    ).map((content) => content.textContent);
    expect(labels).toEqual(['owner', 'constructor', 'inspector']);
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
              enum: ['__proto__', 'plain'],
              presentation: { inputType: 'radio' },
            },
          },
        }}
      />,
    );
    expect(view.container.querySelectorAll('input[type="radio"]')).toHaveLength(
      2,
    );
    expect(view.container.textContent).toContain('__proto__');
  });

  it('a checkbox group option "toString" shows its own value as the label', () => {
    const errors = vi.spyOn(console, 'error');
    const view = render(
      <Form
        fieldInputDefinitions={definitions}
        jsonSchema={{
          type: 'object',
          properties: {
            methods: {
              type: 'array',
              items: { type: 'string', enum: ['toString', 'map'] },
              presentation: { inputType: 'checkbox' },
            },
          },
        }}
      />,
    );
    const labels = Array.from(
      view.container.querySelectorAll('.adm-checkbox-content'),
    ).map((content) => content.textContent);
    expect(labels).toEqual(['toString', 'map']);
    expect(reactChildErrors(errors)).toEqual([]);
  });

  it('a string switch with enum ["constructor", "owner"] labels its states', () => {
    const errors = vi.spyOn(console, 'error');
    const view = render(
      <Form
        fieldInputDefinitions={definitions}
        jsonSchema={{
          type: 'object',
          properties: {
            role: {
              type: 'string',
              enum: ['owner', 'constructor'],
              default: 'owner',
              presentation: { inputType: 'switch' },
            },
          },
        }}
      />,
    );
    expect(view.container.textContent).toContain('owner');
    expect(reactChildErrors(errors)).toEqual([]);
  });
});
