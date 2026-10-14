import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import { Form } from '@canard/schema-form';

import { FormGroup } from '../FormGroup';

afterEach(cleanup);

it('names builtin radio options through the mobile field title', () => {
  render(
    <Form
      FieldRenderer={FormGroup}
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
  expect(screen.getByRole('group').getAttribute('aria-labelledby')).toBe(
    'label:/Size',
  );
  const group = screen.getByRole('group', { name: 'Size' });
  expect(group.getAttribute('aria-labelledby')).toBe('label:/Size');
  const label = screen.getByText('Size').closest('label')!;
  expect(label.id).toBe('label:/Size');
  expect(label.getAttribute('for')).toBe('/Size');
});
