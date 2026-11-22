import { createRef } from 'react';

import { act, cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { Form, type FormHandle } from '@canard/schema-form';

import { fieldInputDefinitions } from '../../fieldInputs';

afterEach(cleanup);

const schema = {
  type: 'object',
  properties: {
    span: {
      type: 'array',
      format: 'date-range',
      items: { type: 'string', format: 'date' },
    },
  },
} as const;

describe('diagnostic: date range markup in antd6', () => {
  it('diagnostic: prints the markup of a date range field', async () => {
    const ref = createRef<FormHandle>();
    const { container } = render(
      <Form
        ref={ref}
        fieldInputDefinitions={fieldInputDefinitions}
        jsonSchema={schema}
        defaultValue={{ span: ['2024-01-10', '2024-01-12'] }}
      />,
    );
    const inputs = Array.from(container.querySelectorAll('input')).map(
      (input) => [input.tagName, input.getAttribute('type'), input.value],
    );
    const editable = Array.from(
      container.querySelectorAll('[contenteditable], [role="textbox"], [role="combobox"], [class*="picker-input"]'),
    ).map((node) => [node.tagName, node.className, node.textContent]);
    expect({ inputs, editable, html: container.innerHTML.slice(0, 1500) }).toEqual({});
  });
});
