import { cleanup, fireEvent, render, waitFor } from '@testing-library/react';
import { computeAccessibleName } from 'dom-accessibility-api';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';

import {
  type FieldInputProps,
  Form,
  type JSONSchema,
} from '@canard/schema-form';

import { plugin } from '../index';

beforeEach(() =>
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  ),
);
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
const rows: [string, JSONSchema, unknown][] = [
  ['text', { type: 'string' }, 'hello'],
  [
    'textarea',
    { type: 'string', presentation: { inputType: 'textarea' } },
    'hello',
  ],
  ['number', { type: 'number' }, 3],
  ['integer', { type: 'integer' }, 3],
  ['boolean', { type: 'boolean' }, false],
  [
    'boolean switch',
    { type: 'boolean', presentation: { inputType: 'switch' } },
    true,
  ],
  [
    'string switch',
    {
      type: 'string',
      enum: ['yes', 'no'],
      presentation: { inputType: 'switch' },
    },
    'yes',
  ],
  [
    'radio',
    {
      type: 'string',
      enum: ['one', 'two'],
      presentation: { inputType: 'radio' },
    },
    'one',
  ],
  [
    'radiogroup',
    {
      type: 'string',
      enum: ['one', 'two'],
      presentation: { inputType: 'radiogroup' },
    },
    'one',
  ],
  [
    'checkbox group',
    {
      type: 'array',
      items: { type: 'string', enum: ['one', 'two'] },
      presentation: { inputType: 'checkbox' },
    },
    ['one'],
  ],
  ['slider', { type: 'number', presentation: { inputType: 'slider' } }, 3],
  ['enum select', { type: 'string', enum: ['one', 'two'] }, 'one'],
  ['URI', { type: 'string', format: 'uri' }, 'https://example.test'],
  ['date', { type: 'string', format: 'date' }, '2025-01-01'],

  ['array', { type: 'array', items: { type: 'string' } }, ['value']],
  [
    'object',
    { type: 'object', properties: { Child: { type: 'string' } } },
    { Child: 'value' },
  ],
  [
    'object array item',
    {
      type: 'array',
      items: { type: 'object', properties: { Child: { type: 'string' } } },
    },
    [{ Child: 'value' }],
  ],
  [
    'hidden object',
    {
      type: 'object',
      properties: { Child: { type: 'string' } },
      presentation: { FieldInputProps: { hideLabel: true } },
    },
    { Child: 'value' },
  ],
  [
    'boolean checkbox hint',
    { type: 'boolean', presentation: { inputType: 'checkbox' } },
    false,
  ],
  [
    'boolean radio hint',
    { type: 'boolean', presentation: { inputType: 'radio' } },
    false,
  ],
  [
    'radio hint without enum',
    { type: 'string', presentation: { inputType: 'radio' } },
    'value',
  ],
  [
    'nonbinary switch hint',
    {
      type: 'string',
      enum: ['one', 'two', 'three'],
      presentation: { inputType: 'switch' },
    },
    'one',
  ],

  ['month', { type: 'string', format: 'month' }, '2025-01'],
  ['time', { type: 'string', format: 'time' }, '12:30:00'],
];
const props = {
  fieldInputDefinitions: plugin.fieldInputDefinitions,
  FieldRenderer: plugin.FieldRenderer,
  LabelRenderer: plugin.LabelRenderer,
  ErrorMessageRenderer: plugin.ErrorMessageRenderer,
};
const visibleText = (root: HTMLElement) => {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const parts: string[] = [];
  while (walker.nextNode()) {
    const node = walker.currentNode;
    const parent = node.parentElement;
    if (!parent || parent.closest('style,script,[hidden],[aria-hidden="true"]'))
      continue;
    let visible = true;
    for (
      let element: HTMLElement | null = parent;
      element && element !== root;
      element = element.parentElement
    ) {
      const style = getComputedStyle(element);
      if (
        style.display === 'none' ||
        style.visibility === 'hidden' ||
        style.opacity === '0'
      ) {
        visible = false;
        break;
      }
    }
    if (visible) parts.push(node.textContent ?? '');
  }
  return parts.join(' ').replace(/\s+/g, ' ').trim();
};
const expectedText: Record<string, string> = {
  text: 'Field',
  textarea: 'Field hello',
  number: 'Field',
  integer: 'Field',
  boolean: 'Field',
  'boolean switch': 'Field',
  'string switch': 'yes no Field',
  radio: 'one two Field',
  radiogroup: 'one two Field',
  'checkbox group': 'one two Field',
  slider: 'Field 0 100',
  'enum select': 'Field one',
  URI: 'Field https://',
  date: 'Field 01 / 01 / 2025',
  array: 'Add',
  object: 'Child',
  'object array item': 'Child Add',
  'hidden object': 'Child',
  'boolean checkbox hint': 'Field',
  'boolean radio hint': 'Field',
  'radio hint without enum': 'Field',
  'nonbinary switch hint': 'Field one',
  month: 'Field 2025 - 01',
  time: 'Field 12 : 30 PM',
};
it('preserves the pre-id schema table while keeping every address and association unique (round-3 id review 4)', () => {
  const seen = new Set<number>();
  const definitions = plugin.fieldInputDefinitions.map((definition, index) => {
    const Component = definition.Component;
    const Capture = (inputProps: FieldInputProps) => {
      seen.add(index);
      return <Component {...inputProps} />;
    };
    return { ...definition, Component: Capture };
  });
  for (const [name, schema, value] of rows) {
    const view = render(
      <Form
        {...props}
        fieldInputDefinitions={definitions}
        jsonSchema={{ type: 'object', properties: { Field: schema } }}
        defaultValue={{ Field: value }}
      />,
    );
    const elements = Array.from(
      document.querySelectorAll<HTMLElement>('[id]'),
    ).filter((element) => element.id);
    expect(new Set(elements.map((element) => element.id)).size, name).toBe(
      elements.length,
    );
    for (const label of view.container.querySelectorAll<HTMLLabelElement>(
      'label[for]',
    )) {
      if (!label.htmlFor) continue;
      const target = document.getElementById(label.htmlFor);
      expect(target, name + ': label target').not.toBeNull();
      expect(
        label.control === target ||
          target!
            .getAttribute('aria-labelledby')
            ?.split(' ')
            .includes(label.id),
        name + ': label association',
      ).toBe(true);
    }
    for (const group of view.container.querySelectorAll<HTMLElement>(
      '[role="group"], [role="radiogroup"], fieldset:not([aria-hidden="true"])',
    )) {
      if (group.closest('[aria-hidden="true"]')) continue;
      expect(
        computeAccessibleName(group),
        name + ': every group has one name',
      ).not.toBe('');
    }
    for (const group of view.container.querySelectorAll<HTMLElement>(
      '[aria-labelledby]',
    )) {
      for (const address of group
        .getAttribute('aria-labelledby')!
        .split(' ')
        .filter(Boolean)) {
        expect(
          elements.filter((element) => element.id === address),
          name + ': sole group title',
        ).toHaveLength(1);
      }
      expect(
        computeAccessibleName(group),
        name + ': named group/control',
      ).not.toBe('');
    }
    for (const control of view.container.querySelectorAll<HTMLElement>(
      'input:not([type="hidden"]):not([aria-hidden="true"]), textarea:not([aria-hidden="true"]), [role="switch"], [role="slider"], [role="combobox"]',
    )) {
      expect(control.id, name + ': control address').not.toBe('');
      const path =
        control.closest('[data-path]')?.getAttribute('data-path') ?? '';
      if (!/\/\d+$/.test(path))
        expect(
          computeAccessibleName(control),
          name + ': reachable control',
        ).not.toBe('');
    }
    expect(visibleText(view.container).split(' ').sort(), name).toEqual(
      expectedText[name].split(' ').sort(),
    );
    cleanup();
  }
  expect(seen.size, 'every registered input definition is rendered').toBe(
    plugin.fieldInputDefinitions.length,
  );
}, 30000);

it.each<[string, JSONSchema]>([
  [
    'radio',
    {
      type: 'string',
      enum: ['one', 'two'],
      presentation: { inputType: 'radio' },
    },
  ],
  [
    'radiogroup',
    {
      type: 'string',
      enum: ['one', 'two'],
      presentation: { inputType: 'radiogroup' },
    },
  ],
  [
    'checkbox group',
    {
      type: 'array',
      items: { type: 'string', enum: ['one', 'two'] },
      presentation: { inputType: 'checkbox' },
    },
  ],
  ['text', { type: 'string' }],
  ['enum select', { type: 'string', enum: ['one', 'two'] }],
  [
    'slider',
    { type: 'number', format: 'slider', presentation: { inputType: 'slider' } },
  ],
])(
  'keeps %s addresses equivalent beside sibling named like a derived id and in two Forms',
  (_kind, fieldSchema) => {
    const schema: JSONSchema = {
      type: 'object',
      properties: {
        plan: fieldSchema,
        'plan-0': { type: 'string' },
        'plan-1': { type: 'string' },
        name: { type: 'string' },
        'name-label': { type: 'string' },
        'first name': { type: 'string' },
      },
    };
    const view = render(
      <>
        <Form {...props} jsonSchema={schema} />
        <Form {...props} jsonSchema={schema} />
      </>,
    );
    const identified = Array.from(
      document.querySelectorAll<HTMLElement>('[id]'),
    ).filter((element) => element.id);
    expect(new Set(identified.map((element) => element.id)).size).toBe(
      identified.length,
    );
    for (const element of identified)
      expect(
        Array.from(element.id).some((character) => {
          const code = character.charCodeAt(0);
          return code <= 32 || (code >= 127 && code <= 159);
        }),
      ).toBe(false);
    for (const element of view.container.querySelectorAll<HTMLElement>(
      '[aria-labelledby]',
    )) {
      for (const id of element
        .getAttribute('aria-labelledby')!
        .split(/\s+/)
        .filter(Boolean)) {
        expect(
          identified.filter((candidate) => candidate.id === id),
        ).toHaveLength(1);
      }
      expect(computeAccessibleName(element)).not.toBe('');
    }
    for (const label of view.container.querySelectorAll<HTMLLabelElement>(
      'label[for]',
    )) {
      expect(
        identified.filter((element) => element.id === label.htmlFor),
      ).toHaveLength(1);
    }
    const fields = view.container.querySelectorAll('[data-path="/plan"]');
    expect(fields).toHaveLength(2);
    for (const field of fields) {
      for (const control of field.querySelectorAll<HTMLElement>(
        'input:not([type="hidden"]):not([aria-hidden="true"]), [role="slider"], [role="combobox"]',
      )) {
        expect(control.id).not.toBe('');
        expect(computeAccessibleName(control)).not.toBe('');
      }
    }
  },
);

it('keeps equal leaf-name select display and menu addresses local to their fields', async () => {
  const jsonSchema: JSONSchema = {
    type: 'object',
    properties: {
      left: {
        type: 'object',
        properties: { choice: { type: 'string', enum: ['one', 'two'] } },
      },
      right: {
        type: 'object',
        properties: { choice: { type: 'string', enum: ['one', 'two'] } },
      },
    },
  };
  const captured = new Map<string, FieldInputProps>();
  const definitions = plugin.fieldInputDefinitions.map((definition) => {
    const Component = definition.Component;
    const Capture = (inputProps: FieldInputProps) => {
      captured.set(inputProps.inputId, inputProps);
      return <Component {...inputProps} />;
    };
    return { ...definition, Component: Capture };
  });
  const view = render(
    <>
      <Form
        {...props}
        fieldInputDefinitions={definitions}
        jsonSchema={jsonSchema}
      />
      <Form
        {...props}
        fieldInputDefinitions={definitions}
        jsonSchema={jsonSchema}
      />
    </>,
  );
  const controls = view.getAllByRole('combobox');
  expect(controls).toHaveLength(4);
  expect(new Set(controls.map((control) => control.id)).size).toBe(4);
  const menuIds: string[] = [];
  for (const control of controls) {
    const input = Array.from(captured.values()).find(
      (inputProps) => inputProps.getInputId('display') === control.id,
    );
    expect(input).toBeDefined();
    fireEvent.mouseDown(control);
    const menu = view.getByRole('listbox');
    expect(
      document.getElementById(input!.getInputId('menu'))?.contains(menu),
    ).toBe(true);
    expect(menu.id).not.toBe('');
    menuIds.push(menu.id);
    fireEvent.keyDown(menu, { key: 'Escape' });
    await waitFor(() => expect(view.queryByRole('listbox')).toBeNull());
  }
  expect(new Set(menuIds).size).toBe(4);
});
