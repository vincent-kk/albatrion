import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import { Form } from '@canard/schema-form';

import { FormGroup } from '../FormGroup';

afterEach(cleanup);

it('gives the field title its label id while preserving for', () => {
  render(
    <Form
      FieldRenderer={FormGroup}
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
