import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import { ErrorVisibility, Form, registerPlugin } from '@canard/schema-form';

import { plugin } from '../../index';
import { FormErrorMessage } from '../FormErrorMessage';
import { FormGroup } from '../FormGroup';
import { FormLabel } from '../FormLabel';

afterEach(() => {
  cleanup();
  registerPlugin(null);
});

it('gives the field title its label id while preserving for', () => {
  render(
    <Form
      FieldRenderer={FormGroup}
      LabelRenderer={FormLabel}
      ErrorMessageRenderer={FormErrorMessage}
      jsonSchema={{
        type: 'object',
        properties: { Text: { type: 'string' } },
      }}
    />,
  );
  const label = screen.getByText('Text').closest('label')!;
  expect(label.id).toBe('label:/Text');
  expect(label.getAttribute('for')).toBe('/Text');
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
      LabelRenderer={FormLabel}
    >
      <Form.Label
        path="/Text"
        className="caption"
        style={{ color: 'rgb(1, 2, 3)' }}
      >
        Caption
      </Form.Label>
    </Form>,
  );
  const label = view.getByText('Caption').closest('label')!;
  expect(label).not.toBeNull();
  expect(view.container.querySelectorAll('label')).toHaveLength(1);
  expect(label.id).toBe('label:/Text');
  expect(label.htmlFor).toBe('/Text');
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
      ErrorMessageRenderer={FormErrorMessage}
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
  expect(plugin).toHaveProperty('LabelRenderer', FormLabel);
  expect(plugin).toHaveProperty('ErrorMessageRenderer', FormErrorMessage);
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
  expect(view.getByText('Caption').closest('label')?.id).toBe('label:/Text');
  expect(view.getByText('Issue')).toBeTruthy();
});

it('omits a separate label for direct array items', () => {
  const view = render(
    <Form
      jsonSchema={{ type: 'array', items: { type: 'string' } }}
      defaultValue={['value']}
      validationMode={0}
      FieldRenderer={FormGroup}
      LabelRenderer={FormLabel}
      ErrorMessageRenderer={FormErrorMessage}
    />,
  );
  expect(view.container.querySelector('label[for="/0"]')).toBeNull();
  expect(view.container.querySelector('input[id="/0"]')).not.toBeNull();
});

it('retains the empty error root and its existing layout', () => {
  const view = render(
    <Form
      jsonSchema={{ type: 'object', properties: { Text: { type: 'string' } } }}
      validationMode={0}
      FieldRenderer={FormGroup}
      LabelRenderer={FormLabel}
      ErrorMessageRenderer={FormErrorMessage}
    />,
  );
  const error = view.container.querySelector(
    '[data-path="/Text"] .ant-typography-danger',
  );
  expect(error).not.toBeNull();
  expect(error?.textContent).toBe('');
});
