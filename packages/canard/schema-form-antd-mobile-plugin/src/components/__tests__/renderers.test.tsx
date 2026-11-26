import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import {
  ErrorVisibility,
  Form,
  type FormProps,
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

it('names builtin radio options through the mobile field title', () => {
  render(
    <Form
      fieldInputDefinitions={plugin.fieldInputDefinitions}
      FieldRenderer={FieldRenderer}
      LabelRenderer={LabelRenderer}
      ErrorMessageRenderer={ErrorMessageRenderer}
      jsonSchema={{
        type: 'object',
        properties: {
          Size: {
            type: 'string',
            enum: ['S', 'M'],
            presentation: { inputType: 'radio' },
          },
        },
      }}
    />,
  );
  const label = screen.getByText('Size').closest('label')!;
  const group = screen.getByRole('radiogroup', { name: 'Size' });
  expect(group.getAttribute('aria-labelledby')).toBe(label.id);
  expect(label.htmlFor).toBe(group.id);
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

/** Render `jsonSchema` through the plugin's parts and inputs. */
const renderForm = (
  jsonSchema: JSONSchema,
  defaultValue?: FormProps['defaultValue'],
) =>
  render(
    <Form
      jsonSchema={jsonSchema}
      defaultValue={defaultValue}
      validationMode={0}
      fieldInputDefinitions={plugin.fieldInputDefinitions}
      FieldRenderer={FieldRenderer}
      LabelRenderer={LabelRenderer}
      ErrorMessageRenderer={ErrorMessageRenderer}
    />,
  );

/** Elements showing exactly `text` outside a `hidden` subtree. */
const visibleText = (text: string) =>
  screen.queryAllByText(text).filter((element) => !element.closest('[hidden]'));

/** `for`, `aria-labelledby` and `aria-describedby` targets no element carries. */
const danglingReferences = (container: HTMLElement) => {
  const missing: string[] = [];
  for (const label of container.querySelectorAll<HTMLLabelElement>(
    'label[for]',
  ))
    if (!document.getElementById(label.htmlFor))
      missing.push(`for=${label.htmlFor}`);
  for (const attribute of ['aria-labelledby', 'aria-describedby'])
    for (const element of container.querySelectorAll(`[${attribute}]`))
      for (const id of element.getAttribute(attribute)!.split(/\s+/))
        if (!document.getElementById(id)) missing.push(`${attribute}=${id}`);
  return missing;
};

it.each<[string, JSONSchema, FormProps['defaultValue']]>([
  ['strings', { type: 'string' }, { list: ['a'] }],
  [
    'radio groups',
    {
      type: 'string',
      enum: ['a', 'b'],
      presentation: { inputType: 'radiogroup' },
    },
    { list: ['a'] },
  ],
])(
  'points every reference of an array of %s at an existing element and shows no index',
  (_, items, defaultValue) => {
    const view = renderForm(
      { type: 'object', properties: { list: { type: 'array', items } } },
      defaultValue,
    );
    expect(danglingReferences(view.container)).toEqual([]);
    expect(visibleText('0')).toHaveLength(0);
  },
);

it('names a root checkbox group by a Form.Label with an empty path', () => {
  const view = render(
    <Form
      jsonSchema={{
        type: 'array',
        items: { type: 'string', enum: ['one', 'two'] },
        presentation: { inputType: 'checkbox' },
      }}
      validationMode={0}
      fieldInputDefinitions={plugin.fieldInputDefinitions}
      LabelRenderer={LabelRenderer}
    >
      <Form.Label path="">Tags</Form.Label>
      <Form.Input path="" />
    </Form>,
  );
  expect(view.getByRole('group', { name: 'Tags' }).id).toBe(
    view.getByText('Tags').closest('label')!.htmlFor,
  );
});

it.each([null, undefined, false, true, ''])(
  'preserves mobile Space item count for an empty message %s',
  (message) => {
    const view = render(
      <Form
        jsonSchema={{
          type: 'object',
          properties: { Text: { type: 'string' } },
        }}
        validationMode={0}
        errorVisibility={ErrorVisibility.Always}
        errors={[{ dataPath: '/Text', message: 'Issue' }]}
        formatError={() => message}
        FieldRenderer={FieldRenderer}
        LabelRenderer={LabelRenderer}
        ErrorMessageRenderer={ErrorMessageRenderer}
      />,
    );
    const space = view.container.querySelector(
      '[data-path="/Text"] > .adm-space',
    )!;
    expect(space.querySelectorAll(':scope > .adm-space-item')).toHaveLength(
      message === '' ? 2 : 1,
    );
  },
);
