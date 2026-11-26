import { cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';

import {
  ErrorVisibility,
  Form,
  type FormProps,
  type JSONSchema,
} from '@canard/schema-form';

import { plugin } from '../../index';
import { ErrorMessageRenderer } from '../ErrorMessageRenderer';
import { FieldRenderer } from '../FieldRenderer';
import { LabelRenderer } from '../LabelRenderer';

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

/** Render an object Form of `properties` through the plugin's parts and inputs. */
const renderForm = (
  properties: Record<string, JSONSchema>,
  props: Partial<FormProps> = {},
  required?: string[],
) =>
  render(
    <Form
      jsonSchema={{ type: 'object', properties, ...(required && { required }) }}
      validationMode={0}
      fieldInputDefinitions={plugin.fieldInputDefinitions}
      FieldRenderer={FieldRenderer}
      LabelRenderer={LabelRenderer}
      ErrorMessageRenderer={ErrorMessageRenderer}
      {...props}
    />,
  );

/** Elements showing exactly `text` outside a `hidden` subtree. */
const visibleText = (text: string) =>
  screen.queryAllByText(text).filter((element) => !element.closest('[hidden]'));

const address: Record<string, JSONSchema> = {
  address: { type: 'object', properties: { city: { type: 'string' } } },
};
const list: Record<string, JSONSchema> = {
  list: { type: 'array', items: { type: 'string' } },
};
const people: Record<string, JSONSchema> = {
  people: {
    type: 'array',
    items: { type: 'object', properties: { nick: { type: 'string' } } },
  },
};
const tags: Record<string, JSONSchema> = {
  tags: {
    type: 'array',
    items: { type: 'string', enum: ['one', 'two'] },
    presentation: { inputType: 'checkbox' },
  },
};
const range: Record<string, JSONSchema> = {
  range: {
    type: 'array',
    format: 'slider',
    items: { type: 'number' },
    minItems: 2,
    maxItems: 2,
  },
};
/** One array per item kind; every item is the array's first, named `0`. */
const arrayItems: Record<string, JSONSchema> = {
  texts: { type: 'array', items: { type: 'string' } },
  counts: { type: 'array', items: { type: 'number' } },
  flags: { type: 'array', items: { type: 'boolean' } },
  choices: { type: 'array', items: tags.tags },
  grid: { type: 'array', items: { type: 'array', items: { type: 'string' } } },
  spans: { type: 'array', items: range.range },
  picks: {
    type: 'array',
    items: {
      type: 'string',
      enum: ['a', 'b'],
      presentation: { inputType: 'radiogroup' },
    },
  },
};
const arrayItemsValue = {
  texts: ['a'],
  counts: [5],
  flags: [true],
  choices: [['one']],
  grid: [['a']],
  spans: [[20, 40]],
  picks: ['a'],
};

it('hides the nested object title and keeps its leaf label', () => {
  renderForm(address);
  expect(visibleText('address')).toHaveLength(0);
  const label = screen.getByText('city').closest('label')!;
  expect(label).not.toBeNull();
  expect(label.htmlFor).toBe(screen.getByRole('textbox').id);
});

it('names a nested array group by its hidden title', () => {
  renderForm(list, { defaultValue: { list: ['a'] } });
  const group = screen.getByRole('group', { name: 'list' });
  expect(
    document.getElementById(group.getAttribute('aria-labelledby')!),
  ).toBeTruthy();
  expect(visibleText('list')).toHaveLength(0);
});

it('gives array items no title and keeps the item leaf label', () => {
  renderForm(people, { defaultValue: { people: [{ nick: 'x' }] } });
  expect(visibleText('0')).toHaveLength(0);
  const label = screen.getByText('nick').closest('label')!;
  expect(label.htmlFor).toBe(screen.getByRole('textbox').id);
});

it('marks required leaves but not a required nested object', () => {
  renderForm({ name: { type: 'string' }, ...address }, {}, ['name', 'address']);
  const marks = screen.queryAllByText('*');
  expect(marks).toHaveLength(1);
  expect(marks[0].closest('label')?.textContent).toBe('name*');
});

it('shows root and branch validation messages', () => {
  const view = renderForm(address, {
    errorVisibility: ErrorVisibility.Always,
    errors: [
      { dataPath: '', message: 'Root issue' },
      { dataPath: '/address', message: 'Branch issue' },
    ],
  });
  expect(visibleText('Root issue')).toHaveLength(1);
  const branch = view.container.querySelector(
    '[data-path="/address"] > .adm-space',
  )!;
  expect(branch.lastElementChild?.textContent).toBe('Branch issue');
});

it.each([
  ['checkbox group', tags, 'tags'],
  ['range slider', range, 'range'],
] as const)('names the %s by its hidden title', (_, properties, name) => {
  const view = renderForm(properties);
  const group = screen.getByRole('group', { name });
  const title = document.getElementById(
    group.getAttribute('aria-labelledby')!,
  )!;
  expect(title.closest('[hidden]')).toBe(title);
  expect(visibleText(name)).toHaveLength(0);
  expect(view.container.querySelector('label[for]')).toBeNull();
});

it('names each array item group by its hidden index', () => {
  const view = renderForm(arrayItems, { defaultValue: arrayItemsValue });
  const item = (path: string) =>
    within(view.container.querySelector<HTMLElement>(`[data-path="${path}"]`)!);
  for (const path of ['/counts/0', '/choices/0', '/grid/0', '/spans/0'])
    expect(item(path).getByRole('group', { name: '0' })).toBeTruthy();
  expect(item('/picks/0').getByRole('radiogroup', { name: '0' })).toBeTruthy();
  expect(item('/flags/0').getByRole('checkbox', { name: '0' })).toBeTruthy();
  expect(visibleText('0')).toHaveLength(0);
});

it.each([
  ['nested object', address, undefined],
  ['nested array', list, { list: ['a'] }],
  ['array of objects', people, { people: [{ nick: 'x' }] }],
  ['checkbox group', tags, undefined],
  ['range slider', range, undefined],
  ['array items', arrayItems, arrayItemsValue],
] as const)(
  'points every label and title reference of the %s form at an existing element',
  (_, properties, defaultValue) => {
    const view = renderForm(properties, { defaultValue });
    for (const label of view.container.querySelectorAll<HTMLLabelElement>(
      'label[for]',
    ))
      expect(document.getElementById(label.htmlFor)).not.toBeNull();
    for (const element of view.container.querySelectorAll('[aria-labelledby]'))
      for (const id of element.getAttribute('aria-labelledby')!.split(' '))
        expect(document.getElementById(id)).not.toBeNull();
  },
);
