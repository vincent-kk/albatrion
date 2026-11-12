import { createRef } from 'react';

import { act, cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import { Form, type FormHandle } from '@/schema-form/components/Form';
import { ValidationMode } from '@/schema-form/core';
import { ErrorVisibility } from '@/schema-form/types';

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
    render(
      <Form
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
    else expect(title.getAttribute('for')).toBe('/Size');
    expect(title.id).toBe('label:/Size');
    expect(
      within(title.parentElement!)
        .getByRole('group', { name: 'Size' })
        .getAttribute('aria-labelledby'),
    ).toBe('label:/Size');
  },
);

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
  expect(input.id).toBe('/Text');
  expect(screen.getByText('Text').id).toBe('label:/Text');
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
  expect(title.id).toBe('label:/When');
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
  expect(inputs.map((input) => input.id)).toEqual(['/button', '/button-label']);
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
  expect(input.id).toBe('/button-label');
  expect(screen.getByText('button-label').closest('label')!.control).toBe(
    input,
  );
});
