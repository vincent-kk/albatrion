import { createRef } from 'react';

import { act, cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import {
  type FieldInputProps,
  Form,
  type FormHandle,
  ValidationMode,
} from '../../index';

afterEach(cleanup);
const WholeArray = ({ defaultValue, onChange }: FieldInputProps<string[]>) => (
  <input
    defaultValue={JSON.stringify(defaultValue)}
    onChange={(event) => onChange([event.target.value])}
  />
);
const schema = {
  type: 'object',
  properties: { list: { type: 'array', items: { type: 'string' } } },
} as const;
describe('round-2 schema-form 3: whole-value branch inputs', () => {
  it.each(['root', 'array', 'item'] as const)(
    'delivers same-length external %s writes',
    async (origin) => {
      const ref = createRef<FormHandle>();
      const view = render(
        <Form
          ref={ref}
          jsonSchema={schema}
          defaultValue={{ list: ['a'] }}
          validationMode={ValidationMode.None}
          fieldInputMap={{ '/list': WholeArray }}
        />,
      );
      await act(() => {
        if (origin === 'root') ref.current!.setValue({ list: ['b'] });
        else
          ref
            .current!.findNode(origin === 'array' ? '/list' : '/list/0')!
            .setValue(origin === 'array' ? ['b'] : 'b');
      });
      expect(view.container.querySelector('input')!.value).toBe('["b"]');
    },
  );
});
