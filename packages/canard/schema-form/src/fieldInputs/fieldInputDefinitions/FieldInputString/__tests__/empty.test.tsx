import { createRef } from 'react';

import { cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import { Form, type FormHandle } from '@/schema-form/components/Form';

afterEach(cleanup);

it.each([
  ['nullable', ['string', 'null']],
  ['nonnullable', 'string'],
] as const)(
  'publishes undefined, not null, for a cleared %s string input',
  (_, type) => {
    const ref = createRef<FormHandle>();
    const view = render(
      <Form
        ref={ref}
        jsonSchema={{ type: type as never }}
        defaultValue={'abc' as never}
      />,
    );
    fireEvent.change(view.container.querySelector('input')!, {
      target: { value: '' },
    });
    expect(ref.current!.getValue()).toBeUndefined();
  },
);
