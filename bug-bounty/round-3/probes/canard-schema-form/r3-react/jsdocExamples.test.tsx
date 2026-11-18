import { cleanup, render } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import { Form, ValidationMode } from '@/schema-form';

afterEach(cleanup);

/**
 * CA1: FormLabel.tsx JSDoc example "Custom label layout", executed literally:
 *   <Form.Input path="/password" type="password" />
 * FormInputProps accepts the extra prop through OverridableFieldInputProps' index signature.
 */
const schema = {
  type: 'object',
  properties: { password: { type: 'string' } },
} as const;

it('the documented <Form.Input path="/password" type="password" /> renders a masked input', () => {
  const view = render(
    <Form jsonSchema={schema} validationMode={ValidationMode.None}>
      <div className="form-field">
        <div className="label-row">
          <Form.Label path="/password" />
          <span className="hint">Min 8 characters</span>
        </div>
        <Form.Input path="/password" type="password" />
      </div>
    </Form>,
  );
  const input = view.container.querySelector<HTMLInputElement>('input[id="/password"]')!;
  expect(input.type).toBe('password');
});

it('control: format password in the schema renders a masked input', () => {
  const view = render(
    <Form
      jsonSchema={{ type: 'object', properties: { password: { type: 'string', format: 'password' } } } as const}
      validationMode={ValidationMode.None}
    >
      <Form.Input path="/password" />
    </Form>,
  );
  expect(view.container.querySelector<HTMLInputElement>('input[id="/password"]')!.type).toBe('password');
});
