import { cleanup, render } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import { Form } from '../components/Form';
import { ValidationMode } from '../core';
import { ErrorVisibility } from '../types';

afterEach(cleanup);

it('renders the standalone error root without an outer span or inherited presentation props', () => {
  const view = render(
    <Form
      jsonSchema={{
        type: 'string',
        presentation: {
          FieldRendererProps: {
            className: 'schema-class',
            style: { color: 'red' },
          },
        },
      }}
      validationMode={ValidationMode.None}
      errorVisibility={ErrorVisibility.Always}
      errors={[{ dataPath: '', message: 'Issue' }]}
    >
      <Form.ErrorMessage
        path=""
        className="own-class"
        style={{ color: 'blue' }}
      />
    </Form>,
  );
  const error = view.getByText('Issue');
  expect(error.tagName).toBe('EM');
  expect(error.className).toBe('own-class');
  expect(error.closest('span')).toBeNull();
  expect(view.container.querySelector('.schema-class')).toBeNull();
  expect(error).toHaveProperty('style.color', 'blue');
});

it('always renders its empty root and explicitly forwards its own field context', () => {
  const context = { source: 'form' };
  const view = render(
    <Form
      jsonSchema={{
        type: 'string',
        presentation: { FieldRendererProps: { className: 'schema-class' } },
      }}
      validationMode={ValidationMode.None}
      context={context}
      ErrorMessageRenderer={({ children, context: received }) => (
        <em data-context={received?.source}>{children}</em>
      )}
    >
      <Form.ErrorMessage />
    </Form>,
  );
  const error = view.container.querySelector('em')!;
  expect(error).not.toBeNull();
  expect(error.textContent).toBe('');
  expect(error.getAttribute('class')).toBeNull();
  expect(error.getAttribute('data-context')).toBe('form');
});
