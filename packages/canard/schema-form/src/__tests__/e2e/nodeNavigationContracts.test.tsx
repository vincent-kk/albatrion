import { createRef } from 'react';

import { cleanup, render } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import {
  Form,
  type FormHandle,
  ValidationMode,
} from '../../index';

afterEach(cleanup);

it('findNodes lists each alias match once and keeps the first match order', () => {
  const ref = createRef<FormHandle>();
  render(
    <Form
      ref={ref}
      validationMode={ValidationMode.None}
      jsonSchema={{
        type: 'object',
        properties: { start: { type: 'string' }, end: { type: 'string' } },
        options: { virtual: { period: { fields: ['start', 'end'] } } },
      }}
    />,
  );
  const root = ref.current!.node!;
  expect(root.findNodes('/*/*')).toEqual([
    root.find('/start'),
    root.find('/end'),
  ]);
  expect(root.findNodes('/*/..')).toEqual([root]);
});
