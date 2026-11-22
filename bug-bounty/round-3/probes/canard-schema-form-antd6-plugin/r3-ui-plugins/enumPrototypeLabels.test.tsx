import { createRef } from 'react';

import { cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { Form, type FormHandle } from '@canard/schema-form';

import { FieldInputRadioGroupDefinition } from '../../fieldInputs/FieldInputRadioGroup';
import { FieldInputStringCheckboxDefinition } from '../../fieldInputs/FieldInputStringCheckbox';
import { FieldInputStringEnumDefinition } from '../../fieldInputs/FieldInputStringEnum';
import { FieldInputStringSwitchDefinition } from '../../fieldInputs/FieldInputStringSwitch';

const preventWindowError = (event: ErrorEvent) => event.preventDefault();

beforeEach(() => {
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe = vi.fn();
      unobserve = vi.fn();
      disconnect = vi.fn();
    },
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
  cleanup();
  vi.restoreAllMocks();
  window.removeEventListener('error', preventWindowError);
});

const definitions = [
  FieldInputStringCheckboxDefinition,
  FieldInputStringSwitchDefinition,
  FieldInputRadioGroupDefinition,
  FieldInputStringEnumDefinition,
];

const reactChildErrors = (spy: ReturnType<typeof vi.spyOn>) =>
  spy.mock.calls
    .map((call) => call.map(String).join(' '))
    .filter((text) => /not valid as a React child/.test(text));

describe('enum values named like Object.prototype members (antd6)', () => {
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
              presentation: { inputType: 'radio' },
              enum: ['owner', 'constructor', 'inspector'],
            },
          },
        }}
      />,
    );
    const radios = Array.from(document.querySelectorAll('input[type="radio"]'));
    const labels = radios.map(
      (radio) => radio.closest('label')?.textContent ?? '',
    );
    expect(labels).toEqual(['owner', 'constructor', 'inspector']);
    expect(reactChildErrors(errors)).toEqual([]);
  });

  it('a radio option "__proto__" renders instead of crashing the field', () => {
    window.addEventListener('error', preventWindowError);
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const formRef = createRef<FormHandle>();
    const view = render(
      <Form
        ref={formRef}
        fieldInputDefinitions={definitions}
        jsonSchema={{
          type: 'object',
          properties: {
            key: {
              type: 'string',
              presentation: { inputType: 'radio' },
              enum: ['__proto__', 'plain'],
            },
          },
        }}
      />,
    );
    expect(Array.from(document.querySelectorAll('input[type="radio"]'))).toHaveLength(2);
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
              presentation: { inputType: 'checkbox' },
              items: { type: 'string', enum: ['toString', 'valueOf', 'map'] },
            },
          },
        }}
      />,
    );
    const labels = Array.from(document.querySelectorAll('input[type="checkbox"]'))
      .map((checkbox) => checkbox.closest('label')?.textContent ?? '');
    expect(labels).toEqual(['toString', 'valueOf', 'map']);
    expect(reactChildErrors(errors)).toEqual([]);
  });

  it('a select with alias labels shows "constructor" for the unlabeled option', () => {
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
              presentation: {
                FieldInputProps: { alias: { owner: 'Owner' } },
              },
            },
          },
        }}
      />,
    );
    fireEvent.mouseDown(document.querySelector('[role="combobox"]')!);
    const options = Array.from(
      document.querySelectorAll('.ant-select-item-option'),
    ).map((option) => option.textContent);
    expect(options).toEqual(['Owner', 'constructor']);
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
              presentation: { inputType: 'switch' },
              enum: ['constructor', 'owner'],
            },
          },
        }}
      />,
    );
    expect(view.container.textContent).toContain('owner');
    expect(view.container.textContent).toContain('constructor');
    expect(reactChildErrors(errors)).toEqual([]);
  });
});
