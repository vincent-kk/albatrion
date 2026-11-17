import { createRef } from 'react';

import { cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import { Form, type FormHandle } from '@/schema-form/components/Form';

afterEach(cleanup);

it.each([
  ['nullable', { type: ['number', 'null'] }],
  ['nonnullable', { type: 'number' }],
] as const)(
  'publishes undefined, not null, for a cleared %s number input',
  (_, jsonSchema) => {
    const ref = createRef<FormHandle>();
    const view = render(
      <Form ref={ref} jsonSchema={jsonSchema} defaultValue={2} />,
    );
    fireEvent.change(view.container.querySelector('input')!, {
      target: { value: '' },
    });
    expect(ref.current!.getValue()).toBeUndefined();
  },
);
