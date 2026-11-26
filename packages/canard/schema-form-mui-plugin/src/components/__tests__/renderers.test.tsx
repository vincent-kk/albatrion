// @vitest-environment jsdom
import { cleanup, render, within } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import {
  ErrorVisibility,
  Form,
  type JSONSchema,
  registerPlugin,
} from '@canard/schema-form';

import { plugin } from '../../index';
import { ErrorMessageRenderer } from '../ErrorMessageRenderer';
import { FieldRenderer } from '../FieldRenderer';
import { LabelRenderer } from '../LabelRenderer';

afterEach(() => {
  cleanup();
  registerPlugin(null);
});

it('keeps the mui group free of a separate label', () => {
  const view = render(
    <Form
      FieldRenderer={FieldRenderer}
      LabelRenderer={LabelRenderer}
      ErrorMessageRenderer={ErrorMessageRenderer}
      jsonSchema={{ type: 'object', properties: { Text: { type: 'string' } } }}
    />,
  );
  expect(view.container.querySelector('label')).toBeNull();
  expect(view.getByRole('textbox')).not.toBeNull();
});

it('forwards standalone label content, addresses and root styling without nesting labels', () => {
  const view = render(
    <Form
      jsonSchema={{
        type: 'object',
        required: ['Text'],
        properties: { Text: { type: 'string' } },
      }}
      validationMode={0}
      LabelRenderer={LabelRenderer}
    >
      <Form.Label
        path="/Text"
        className="caption"
        style={{ color: 'rgb(1, 2, 3)' }}
      >
        Caption
      </Form.Label>
      <Form.Input path="/Text" />
    </Form>,
  );
  const label = view.getByText('Caption').closest('label')!;
  expect(label).not.toBeNull();
  expect(view.container.querySelectorAll('label')).toHaveLength(1);
  expect(label.id).not.toBe('');
  expect(label.htmlFor).toBe(view.getByRole('textbox').id);
  expect(label.classList.contains('caption')).toBe(true);
  expect(label.style.color).toBe('rgb(1, 2, 3)');
  expect(label.querySelector('[aria-hidden="true"]')?.textContent).toContain(
    '*',
  );
});

it('forwards standalone error children and root styling', () => {
  const view = render(
    <Form
      jsonSchema={{ type: 'object', properties: { Text: { type: 'string' } } }}
      validationMode={0}
      errorVisibility={ErrorVisibility.Always}
      errors={[{ dataPath: '/Text', message: 'Issue' }]}
      ErrorMessageRenderer={ErrorMessageRenderer}
    >
      <Form.ErrorMessage
        path="/Text"
        className="issue"
        style={{ color: 'rgb(4, 5, 6)' }}
      />
    </Form>,
  );
  const error = view.getByText('Issue');
  expect(error.classList.contains('issue')).toBe(true);
  expect(error.style.color).toBe('rgb(4, 5, 6)');
});

it('registers the label and error parts without an input frame', () => {
  expect(plugin).toHaveProperty('LabelRenderer', LabelRenderer);
  expect(plugin).toHaveProperty('ErrorMessageRenderer', ErrorMessageRenderer);
  expect(plugin).not.toHaveProperty('InputRenderer');
  registerPlugin(plugin);
  const view = render(
    <Form
      jsonSchema={{ type: 'object', properties: { Text: { type: 'string' } } }}
      validationMode={0}
      errorVisibility={ErrorVisibility.Always}
      errors={[{ dataPath: '/Text', message: 'Issue' }]}
    >
      <Form.Label path="/Text">Caption</Form.Label>
      <Form.ErrorMessage path="/Text" />
    </Form>,
  );
  expect(view.getByText('Caption').closest('label')?.id).toBeTruthy();
  expect(view.getByText('Issue')).toBeTruthy();
});

it('omits a separate label for direct array items', () => {
  const view = render(
    <Form
      jsonSchema={{ type: 'array', items: { type: 'string' } }}
      defaultValue={['value']}
      validationMode={0}
      FieldRenderer={FieldRenderer}
      LabelRenderer={LabelRenderer}
      ErrorMessageRenderer={ErrorMessageRenderer}
    />,
  );
  expect(view.container.querySelector('label')).toBeNull();
  expect(view.getByRole('textbox')).toHaveProperty('value', 'value');
});

/** One array per item kind; every item is the array's first, named `0`. */
const arrayItems: JSONSchema = {
  type: 'object',
  properties: {
    texts: { type: 'array', items: { type: 'string' } },
    counts: { type: 'array', items: { type: 'number' } },
    flags: { type: 'array', items: { type: 'boolean' } },
    choices: {
      type: 'array',
      items: {
        type: 'array',
        items: { type: 'string', enum: ['one', 'two'] },
        presentation: { inputType: 'checkbox' },
      },
    },
    grid: {
      type: 'array',
      items: { type: 'array', items: { type: 'string' } },
    },
    // The slider shows its bounds; a lower bound of 0 would read as an index.
    levels: {
      type: 'array',
      items: {
        type: 'number',
        minimum: 10,
        presentation: { inputType: 'slider' },
      },
    },
    picks: {
      type: 'array',
      items: {
        type: 'string',
        enum: ['a', 'b'],
        presentation: { inputType: 'radiogroup' },
      },
    },
  },
};
const arrayItemsValue = {
  texts: ['a'],
  counts: [5],
  flags: [true],
  choices: [['one']],
  grid: [['a']],
  levels: [20],
  picks: ['a'],
};

/** Render the array item form through the plugin's parts and inputs. */
const renderArrayItems = () =>
  render(
    <Form
      jsonSchema={arrayItems}
      defaultValue={arrayItemsValue}
      validationMode={0}
      fieldInputDefinitions={plugin.fieldInputDefinitions}
      FieldRenderer={FieldRenderer}
      LabelRenderer={LabelRenderer}
      ErrorMessageRenderer={ErrorMessageRenderer}
    />,
  );

it('points every label and title reference of array items at an existing element', () => {
  const view = renderArrayItems();
  for (const label of view.container.querySelectorAll<HTMLLabelElement>(
    'label[for]',
  ))
    expect(document.getElementById(label.htmlFor)).not.toBeNull();
  for (const element of view.container.querySelectorAll('[aria-labelledby]'))
    for (const id of element.getAttribute('aria-labelledby')!.split(' '))
      expect(document.getElementById(id)).not.toBeNull();
});

it('names each array item by its hidden index', () => {
  const view = renderArrayItems();
  const item = (path: string) =>
    within(view.container.querySelector<HTMLElement>(`[data-path="${path}"]`)!);
  expect(item('/texts/0').getByRole('textbox', { name: '0' })).toBeTruthy();
  expect(item('/counts/0').getByRole('spinbutton', { name: '0' })).toBeTruthy();
  expect(item('/flags/0').getByRole('checkbox', { name: '0' })).toBeTruthy();
  expect(item('/levels/0').getByRole('slider', { name: '0' })).toBeTruthy();
  expect(item('/picks/0').getByRole('radiogroup', { name: '0' })).toBeTruthy();
  for (const path of ['/choices/0', '/grid/0'])
    expect(item(path).getByRole('group', { name: '0' })).toBeTruthy();
  expect(
    view.queryAllByText('0').filter((element) => !element.closest('[hidden]')),
  ).toHaveLength(0);
});

it('retains the empty error root and its existing layout', () => {
  const view = render(
    <Form
      jsonSchema={{ type: 'object', properties: { Text: { type: 'string' } } }}
      validationMode={0}
      FieldRenderer={FieldRenderer}
      LabelRenderer={LabelRenderer}
      ErrorMessageRenderer={ErrorMessageRenderer}
    />,
  );
  const error = view.container.querySelector(
    '[data-path="/Text"] .MuiFormHelperText-root',
  );
  expect(error).not.toBeNull();
  expect(error?.textContent).toBe('');
});
