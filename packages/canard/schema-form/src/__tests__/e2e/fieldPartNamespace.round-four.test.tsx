import { act } from '@testing-library/react';
import { createRoot } from 'react-dom/client';
import { expect, it } from 'vitest';

import { Form, ValidationMode, type FieldInputProps } from '../../index';

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
    const captured: FieldInputProps[] = [];
    const Input = (props: FieldInputProps) => { captured.push(props); return <input id={props.inputId} />; };
    const host = document.createElement('div');
    document.body.append(host);
    const root = createRoot(host, { identifierPrefix });
    try {
      await act(async () => {
        root.render(
          <Form
            fieldInputDefinitions={[{ test: { type: 'string' }, Component: Input }]}
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
      expect(fields.every((id) => id.endsWith('~input'))).toBe(true);
      const derived = captured.flatMap((props) =>
        parts.map((part) => props.getInputId(part)),
      );
      expect(new Set(derived).size).toBe(derived.length);
      expect(derived.some((id) => fields.includes(id))).toBe(false);
      expect(
        // eslint-disable-next-line no-control-regex -- Assert the HTML-unsafe code-unit boundary.
        derived.every((id) => !/[\u0000-\u0020]/.test(id)),
      ).toBe(true);
      const input = document.createElement('input'),
        label = document.createElement('label'),
        description = document.createElement('span');
      input.id = captured[0].getInputId( 'probe-control');
      label.id = captured[0].getInputId( 'probe-label');
      label.htmlFor = input.id;
      description.id = captured[0].getInputId( 'probe-description');
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
