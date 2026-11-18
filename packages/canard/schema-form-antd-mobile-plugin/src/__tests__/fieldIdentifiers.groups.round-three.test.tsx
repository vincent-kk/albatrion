import { cleanup, render } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import { Form, type JSONSchema } from '@canard/schema-form';

import { plugin } from '../index';

afterEach(cleanup);

it.each<[string, JSONSchema]>([
  [
    'radio',
    {
      type: 'string',
      enum: ['one', 'two'],
      presentation: { inputType: 'radio' },
    },
  ],
  [
    'checkbox',
    {
      type: 'array',
      items: { type: 'string', enum: ['one', 'two'] },
      presentation: { inputType: 'checkbox' },
    },
  ],
  ['branch', { type: 'object', properties: { Child: { type: 'string' } } }],
])(
  'scopes the %s group title and option addresses like separate fields',
  (kind, fieldSchema) => {
    const props = {
      fieldInputDefinitions: plugin.fieldInputDefinitions,
      FieldRenderer: plugin.FieldRenderer,
      LabelRenderer: plugin.LabelRenderer,
      ErrorMessageRenderer: plugin.ErrorMessageRenderer,
      jsonSchema: {
        type: 'object',
        properties: { Field: fieldSchema },
      } satisfies JSONSchema,
    };
    const view = render(
      <>
        <Form {...props} />
        <Form {...props} />
      </>,
    );
    const fields = Array.from(
      view.container.querySelectorAll<HTMLElement>('[data-path="/Field"]'),
    );
    expect(fields).toHaveLength(2);
    const titles = fields.map((field) => {
      const group = field.querySelector<HTMLElement>('[aria-labelledby]');
      expect(group).not.toBeNull();
      const title = document.getElementById(
        group!.getAttribute('aria-labelledby')!,
      );
      expect(title).not.toBeNull();
      expect(field.contains(title)).toBe(true);
      return title!;
    });
    expect(titles[0].textContent).toBe(titles[1].textContent);
    expect(titles[0].id).not.toBe(titles[1].id);
    for (const field of fields) {
      const options = field.querySelectorAll<HTMLInputElement>(
        'input[type="radio"], input[type="checkbox"]',
      );
      if (kind !== 'branch') expect(options).toHaveLength(2);
      for (const option of options) {
        expect(option.id).toContain(':/Field');
        expect(option.labels?.length).toBeGreaterThan(0);
        if (kind === 'radio') expect(option.name).toContain(':/Field');
      }
    }
  },
);
