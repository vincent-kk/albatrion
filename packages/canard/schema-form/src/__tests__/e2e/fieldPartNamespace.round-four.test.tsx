import { act } from '@testing-library/react';
import { createRoot } from 'react-dom/client';
import { expect, it } from 'vitest';

import { Form, ValidationMode, getFieldPartId } from '../../index';

it.each(['ordinary-', 'app~2:', 'app with spaces~2:'])(
  'field and derived ids are injective with identifierPrefix %s',
  async (identifierPrefix) => {
    const keys = [
      '',
      'plain',
      'a~b',
      'a/b',
      'a:b',
      'a~2b',
      'plan-0',
      'plan-1',
      'a b',
    ];
    const parts = [
      '',
      'label',
      'description',
      'error',
      'range-start',
      'range-end',
      'protocol',
      'option:0',
      'option:1',
      '~2',
      ':',
      '/',
      'a b',
    ];
    const host = document.createElement('div');
    document.body.append(host);
    const root = createRoot(host, { identifierPrefix });
    try {
      await act(async () => {
        root.render(
          <Form
            jsonSchema={{
              type: 'object',
              properties: Object.fromEntries(
                keys.map((key) => [key, { type: 'string' }]),
              ),
            }}
            validationMode={ValidationMode.None}
          />,
        );
      });
      const fields = Array.from(
        host.querySelectorAll('input'),
        (input) => input.id,
      );
      expect(fields).toHaveLength(keys.length);
      expect(fields.every((id) => !id.includes('~2'))).toBe(true);
      const derived = fields.flatMap((id) =>
        parts.map((part) => getFieldPartId(id, part)),
      );
      expect(new Set(derived).size).toBe(derived.length);
      expect(derived.some((id) => fields.includes(id))).toBe(false);
      expect(
        derived.every((id) => id.split('~2').length === 2 && !/\s/.test(id)),
      ).toBe(true);
      const input = document.createElement('input'),
        label = document.createElement('label'),
        description = document.createElement('span');
      input.id = derived[0];
      label.id = derived[1];
      label.htmlFor = input.id;
      description.id = derived[2];
      input.setAttribute('aria-labelledby', label.id);
      input.setAttribute('aria-describedby', description.id);
      host.append(input, label, description);
      expect(label.control).toBe(input);
      expect(
        document.getElementById(input.getAttribute('aria-labelledby')!),
      ).toBe(label);
      expect(
        document.getElementById(input.getAttribute('aria-describedby')!),
      ).toBe(description);
    } finally {
      await act(async () => root.unmount());
      host.remove();
    }
  },
);
