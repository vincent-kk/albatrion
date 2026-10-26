import { createRef } from 'react';

import { cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import { Form, type FormHandle } from '@/schema-form/components/Form';

afterEach(cleanup);

it.each([
  ['nullable', ['number', 'null']],
  ['nonnullable', 'number'],
] as const)(
  'publishes undefined, not null, for a cleared %s number input',
  (_, type) => {
    const ref = createRef<FormHandle>();
    const view = render(
      <Form
        ref={ref}
        jsonSchema={{ type: type as never }}
        defaultValue={2 as never}
      />,
    );
    fireEvent.change(view.container.querySelector('input')!, {
      target: { value: '' },
    });
    expect(ref.current!.getValue()).toBeUndefined();
  },
);
