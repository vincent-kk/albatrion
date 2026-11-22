import { createRef } from 'react';

import { cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import { Form, type FormHandle } from '@canard/schema-form';

import { plugin } from '../index';

afterEach(cleanup);

it('adds null as the empty value of a nullable enum array item', () => {
  const ref = createRef<FormHandle>();
  const view = render(
    <Form
      ref={ref}
      jsonSchema={{
        type: 'array',
        items: { type: ['string', 'null'], enum: ['red', 'green', null] },
      }}
      defaultValue={[]}
      fieldInputDefinitions={plugin.fieldInputDefinitions}
    />,
  );
  fireEvent.click(view.getByRole('button', { name: 'Add' }));
  expect(ref.current?.getValue()).toEqual([null]);
});
