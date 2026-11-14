import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import { Form } from '../components/Form';
import { ValidationMode } from '../core';

afterEach(cleanup);

it('owns one associated label root, honors children and shows a hidden required marker', () => {
  const view = render(<Form jsonSchema={{ type: 'object', required: ['name'], properties: { name: { type: 'string' } } }} validationMode={ValidationMode.None}><Form.Label path="/name">Custom</Form.Label><Form.Input path="/name" /><Form.Label path="/missing" /></Form>);
  const label = view.getByText('Custom').closest('label')!;
  expect(view.container.querySelectorAll('label')).toHaveLength(1);
  expect(label.control).toBe(view.container.querySelector('input'));
  expect(label.querySelector('span')?.getAttribute('aria-hidden')).toBe('true');
  expect(label.textContent).toBe('Custom *');
});

it('keeps standalone presentation overrides explicit and forwards its own context', () => {
  const view = render(<Form jsonSchema={{ type: 'string', presentation: { FieldRendererProps: { className: 'schema-class', style: { color: 'red' } } } }} validationMode={ValidationMode.None} context={{ source: 'form' }} LabelRenderer={({ children, className, style, htmlFor, id, context }) => <label className={className} style={style} htmlFor={htmlFor} id={id} data-context={context.source}>{children}</label>}><Form.Label>Own</Form.Label></Form>);
  const label = view.getByText('Own');
  expect(label.getAttribute('class')).toBeNull();
  expect(label.getAttribute('style')).toBeNull();
  expect(label.getAttribute('data-context')).toBe('form');
  expect(label.getAttribute('for')).toBeNull();
  expect(label.getAttribute('id')).toBeNull();
});

it.each(['checkbox', 'radio'])(
  'associates Form.Label with the builtin %s group',
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
      >
        <Form.Label path="/Size" />
        <Form.Input path="/Size" />
      </Form>,
    );
    const label = screen.getByText('Size').closest('label')!;
    expect(label.getAttribute('for')).toBe('/Size');
    expect(label.id).toBe('label:/Size');
    expect(
      screen
        .getByRole('group', { name: 'Size' })
        .getAttribute('aria-labelledby'),
    ).toBe('label:/Size');
  },
);

it('keeps Form.Label associated with a plain string input', () => {
  render(
    <Form
      jsonSchema={{
        type: 'object',
        properties: { Text: { type: 'string', title: 'Text' } },
      }}
    >
      <Form.Label path="/Text" />
      <Form.Input path="/Text" />
    </Form>,
  );
  const input = screen.getByRole<HTMLInputElement>('textbox');
  expect(screen.getByText('Text').closest('label')!.getAttribute('for')).toBe(
    input.id,
  );
  expect(input.id).toBe('/Text');
  expect(screen.getByText('Text').closest('label')!.id).toBe('label:/Text');
});

it('keeps Form.Label associated with a date-format input despite the radio hint', () => {
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
    >
      <Form.Label path="/When" />
      <Form.Input path="/When" />
    </Form>,
  );
  const input = view.container.querySelector<HTMLInputElement>('input')!;
  const label = screen.getByText('When').closest('label')!;
  expect(input.type).toBe('date');
  expect(label.getAttribute('for')).toBe(input.id);
  expect(label.id).toBe('label:/When');
});

it('omits for and id when the Form.Label path prop is undefined', () => {
  render(
    <Form
      jsonSchema={{
        type: 'string',
        enum: ['S', 'M'],
        presentation: { inputType: 'radio' },
      }}
      LabelRenderer={({ htmlFor, id }) => <label htmlFor={htmlFor} id={id}>Size</label>}
    >
      <Form.Label />
      <Form.Input />
    </Form>,
  );
  const label = screen.getByText('Size').closest('label')!;
  expect(label.hasAttribute('for')).toBe(false);
  expect(label.hasAttribute('id')).toBe(false);
});

it('avoids title id collisions with sibling input paths in Form.Label composition', () => {
  const view = render(
    <Form
      jsonSchema={{
        type: 'object',
        properties: {
          button: { type: 'string', title: 'Button' },
          'button-label': { type: 'string', title: 'Button label' },
        },
      }}
    >
      <Form.Label path="/button" />
      <Form.Input path="/button" />
      <Form.Label path="/button-label" />
      <Form.Input path="/button-label" />
    </Form>,
  );
  const ids = Array.from(view.container.querySelectorAll('[id]'), (el) => el.id);
  expect(ids.filter((id, index) => ids.indexOf(id) !== index)).toEqual([]);
  const inputs = screen.getAllByRole<HTMLInputElement>('textbox');
  expect(inputs.map((input) => input.id)).toEqual(['/button', '/button-label']);
  expect(screen.getByText('button').closest('label')!.control).toBe(inputs[0]);
  expect(screen.getByText('button-label').closest('label')!.control).toBe(
    inputs[1],
  );
});

it('names a root group with the label prefix when path is empty', () => {
  render(
    <Form
      jsonSchema={{
        type: 'string',
        enum: ['S', 'M'],
        presentation: { inputType: 'radio' },
      }}
      LabelRenderer={({ htmlFor, id }) => <label htmlFor={htmlFor} id={id}>Size</label>}
    >
      <Form.Label path="" />
      <Form.Input path="" />
    </Form>,
  );
  const label = screen.getByText('Size').closest('label')!;
  expect(label.getAttribute('for')).toBe('');
  expect(label.id).toBe('label:');
  expect(
    screen.getByRole('group', { name: 'Size' }).getAttribute('aria-labelledby'),
  ).toBe('label:');
});
