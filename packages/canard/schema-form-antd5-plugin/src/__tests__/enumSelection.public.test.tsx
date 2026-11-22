import { cleanup, render } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import { Form } from '@canard/schema-form';

import { plugin } from '../index';

afterEach(cleanup);

it.each([
  { value: null, count: 0 },
  { value: [null], count: 1 },
  { value: ['null'], count: 1 },
])(
  'shows the correct tags when an enum array starts at $value',
  ({ value, count }) => {
    const { container } = render(
      <Form
        fieldInputDefinitions={plugin.fieldInputDefinitions}
        jsonSchema={{
          type: ['array', 'null'],
          items: { type: ['string', 'null'], enum: [null, 'null'] },
        }}
        defaultValue={value}
      />,
    );
    const selected = container.querySelectorAll(
      '.ant-select-selection-item-content',
    );
    expect(selected).toHaveLength(count);
  },
);
