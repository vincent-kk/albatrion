import { createRef } from 'react';

import { act, cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import { expectedFieldPartId } from '@/schema-form/__tests__/fixtures/expectedFieldPartId';
import { Form, type FormHandle } from '@/schema-form/components/Form';
import { ValidationMode } from '@/schema-form/core';
import { ErrorVisibility } from '@/schema-form/types';
import type {
  AllowedValue,
  FieldRendererProps,
  JSONSchema,
} from '@/schema-form/types';

import { FieldRenderer } from '../components/FieldRenderer';

afterEach(cleanup);

it('omits empty group errors and delegates branch messages to the registered error part', () => {
  const ref = createRef<FormHandle>();
  const view = render(
    <Form
      ref={ref}
      jsonSchema={{
        type: 'object',
        properties: {
          group: { type: 'object', properties: { child: { type: 'string' } } },
        },
      }}
      validationMode={ValidationMode.None}
      errorVisibility={ErrorVisibility.Always}
      ErrorMessageRenderer={({ node, children }) => (
        <em data-owner={node.path}>{children}</em>
      )}
    />,
  );
  expect(view.container.querySelectorAll('em')).toHaveLength(0);
  act(() =>
    ref
      .current!.findNode('/group/child')!
      .setExternalErrors([{ dataPath: '/group/child', message: 'Child' }]),
  );
  expect(view.getByText('Child').getAttribute('data-owner')).toBe(
    '/group/child',
  );
  expect(
    Array.from(view.container.querySelectorAll('em')).find(
      (message) =>
        message.closest('[data-path]')?.getAttribute('data-path') === '/group',
    ),
  ).toBeUndefined();
  act(() =>
    ref
      .current!.findNode('/group')!
      .setExternalErrors([{ dataPath: '/group', message: 'Own' }]),
  );
  expect(view.getByText('Own').getAttribute('data-owner')).toBe('/group');
});

it.each(['checkbox', 'radio'])(
  'names the builtin %s options group while preserving its title layout',
  (inputType) => {
    let groupLabelId = '';
    const Renderer = (props: FieldRendererProps) => {
      if (props.path === '/Size') groupLabelId = props.labelId;
      return <FieldRenderer {...props} />;
    };
    render(
      <Form
        FieldRenderer={Renderer}
        jsonSchema={{
          type: 'object',
          properties: {
            Size:
              inputType === 'checkbox'
                ? {
                    type: 'array',
                    title: 'Size',
                    items: { type: 'string', enum: ['S', 'M'] },
                    presentation: { inputType },
                  }
                : {
                    type: 'string',
                    title: 'Size',
                    enum: ['S', 'M'],
                    presentation: { inputType },
                  },
          },
        }}
      />,
    );
    const title = screen.getByText('Size');
    expect(title.tagName).toBe(inputType === 'checkbox' ? 'LEGEND' : 'LABEL');
    if (inputType === 'checkbox')
      expect(title.parentElement?.tagName).toBe('FIELDSET');
    else
      expect(expectedFieldPartId(title.getAttribute('for')!, 'label')).toBe(
        groupLabelId,
      );
    expect(title.id).toBe(groupLabelId);
    expect(
      within(title.parentElement!)
        .getByRole('group', { name: 'Size' })
        .getAttribute('aria-labelledby'),
    ).toBe(groupLabelId);
  },
);

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

/** Paths of the fields showing `text` outside a `hidden` subtree. */
const shownPaths = (text: string) =>
  screen
    .queryAllByText(text)
    .filter((element) => !element.closest('[hidden]'))
    .map((element) =>
      element.closest('[data-path]')?.getAttribute('data-path'),
    );

const strings: JSONSchema = { type: 'array', items: { type: 'string' } };
const radios: JSONSchema = {
  type: 'array',
  items: {
    type: 'string',
    enum: ['a', 'b'],
    presentation: { inputType: 'radio' },
  },
};
/** One single-control field per built-in input; the array of each names its item `0`. */
const controls: Record<string, JSONSchema> = {
  text: { type: 'string' },
  count: { type: 'number' },
  flag: { type: 'boolean' },
  size: { type: 'string', enum: ['S', 'M'] },
  day: { type: 'string', format: 'date' },
  union: { type: ['string', 'number'] },
};

it.each<[string, JSONSchema, AllowedValue]>([
  ['strings', strings, { list: ['a'] }],
  ['radio groups', radios, { list: ['a'] }],
])(
  'points every reference of an array of %s at an existing element and shows no index',
  (_, list, defaultValue) => {
    const view = render(
      <Form
        jsonSchema={{ type: 'object', properties: { list } }}
        defaultValue={defaultValue}
      />,
    );
    expect(danglingReferences(view.container)).toEqual([]);
    expect(shownPaths('0')).toEqual([]);
  },
);

it('names a root checkbox group by a Form.Label with an empty path', () => {
  render(
    <Form
      jsonSchema={{
        type: 'array',
        items: { type: 'string', enum: ['one', 'two'] },
        presentation: { inputType: 'checkbox' },
      }}
    >
      <Form.Label path="">Tags</Form.Label>
      <Form.Input path="" />
    </Form>,
  );
  expect(screen.getByRole('group', { name: 'Tags' })).toBeTruthy();
});

it('names the control of each array item by its hidden index', () => {
  const properties: Record<string, JSONSchema> = { picks: radios };
  for (const key in controls)
    properties[key] = { type: 'array', items: controls[key] };
  const view = render(
    <Form
      jsonSchema={{ type: 'object', properties }}
      defaultValue={{
        text: ['a'],
        count: [1],
        flag: [true],
        size: ['S'],
        day: ['2024-01-01'],
        union: ['u'],
        picks: ['a'],
      }}
    />,
  );
  const item = (path: string) =>
    within(view.container.querySelector<HTMLElement>(`[data-path="${path}"]`)!);
  expect(item('/text/0').getByRole('textbox', { name: '0' })).toBeTruthy();
  expect(item('/count/0').getByRole('spinbutton', { name: '0' })).toBeTruthy();
  expect(item('/flag/0').getByRole('checkbox', { name: '0' })).toBeTruthy();
  expect(item('/size/0').getByRole('combobox', { name: '0' })).toBeTruthy();
  expect(item('/day/0').getByLabelText('0')).toHaveProperty('type', 'date');
  expect(item('/union/0').getByRole('textbox', { name: '0' })).toBeTruthy();
  expect(item('/picks/0').getByRole('group', { name: '0' })).toBeTruthy();
  expect(shownPaths('0')).toEqual([]);
});

it('keeps the label name of each single control outside an array', () => {
  const view = render(
    <Form jsonSchema={{ type: 'object', properties: controls }} />,
  );
  expect(view.getByRole('textbox', { name: 'text' })).toBeTruthy();
  expect(view.getByRole('spinbutton', { name: 'count' })).toBeTruthy();
  expect(view.getByRole('checkbox', { name: 'flag' })).toBeTruthy();
  expect(view.getByRole('combobox', { name: 'size' })).toBeTruthy();
  expect(view.getByLabelText('day')).toHaveProperty('type', 'date');
  expect(view.getByRole('textbox', { name: 'union' })).toBeTruthy();
  expect(view.container.querySelector('[aria-labelledby]')).toBeNull();
});

it('keeps a plain string title associated with its input', () => {
  render(
    <Form
      jsonSchema={{
        type: 'object',
        properties: { Text: { type: 'string', title: 'Text' } },
      }}
    />,
  );
  const input = screen.getByRole<HTMLInputElement>('textbox');
  expect(screen.getByText('Text').getAttribute('for')).toBe(input.id);
  expect(input.id).toMatch(/^.+:\/Text~input$/);
  expect(screen.getByText('Text').id).toBe(
    expectedFieldPartId(input.id, 'label'),
  );
  expect(screen.getByText('Text').textContent).toBe('Text');
  expect(screen.getByText('Text').childNodes).toHaveLength(1);
});

it('keeps the title associated with a date-format input despite the radio hint', () => {
  const view = render(
    <Form
      jsonSchema={{
        type: 'object',
        properties: {
          When: {
            type: 'string',
            format: 'date',
            enum: ['2024-01-01'],
            presentation: { inputType: 'radio' },
          },
        },
      }}
    />,
  );
  const input = view.container.querySelector<HTMLInputElement>('input')!;
  const title = screen.getByText('When');
  expect(input.type).toBe('date');
  expect(title.getAttribute('for')).toBe(input.id);
  expect(title.id).toBe(expectedFieldPartId(input.id, 'label'));
});

it('avoids title id collisions with sibling input paths', () => {
  const view = render(
    <Form
      jsonSchema={{
        type: 'object',
        properties: {
          button: { type: 'string', title: 'Button' },
          'button-label': { type: 'string', title: 'Button label' },
        },
      }}
    />,
  );
  const ids = Array.from(
    view.container.querySelectorAll('[id]'),
    (el) => el.id,
  );
  expect(ids.filter((id, index) => ids.indexOf(id) !== index)).toEqual([]);
  const inputs = screen.getAllByRole<HTMLInputElement>('textbox');
  expect(inputs.map((input) => input.id)).toEqual([
    expect.stringMatching(/^.+:\/button~input$/),
    expect.stringMatching(/^.+:\/button-label~input$/),
  ]);
  expect(screen.getByText('button').closest('label')!.control).toBe(inputs[0]);
  expect(screen.getByText('button-label').closest('label')!.control).toBe(
    inputs[1],
  );
});

it('keeps a sibling textbox associated when the button field is a radio group', () => {
  const view = render(
    <Form
      jsonSchema={{
        type: 'object',
        properties: {
          button: {
            type: 'string',
            enum: ['S', 'M'],
            presentation: { inputType: 'radio' },
          },
          'button-label': { type: 'string' },
        },
      }}
    />,
  );
  const ids = Array.from(
    view.container.querySelectorAll('[id]'),
    (el) => el.id,
  );
  expect(ids.filter((id, index) => ids.indexOf(id) !== index)).toEqual([]);
  expect(screen.getAllByRole('radio')).toHaveLength(2);
  const input = screen.getByRole<HTMLInputElement>('textbox');
  expect(input.id).toMatch(/^.+:\/button-label~input$/);
  expect(screen.getByText('button-label').closest('label')!.control).toBe(
    input,
  );
});
