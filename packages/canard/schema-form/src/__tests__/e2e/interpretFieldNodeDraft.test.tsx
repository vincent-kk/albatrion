import { createRef } from 'react';

import { cleanup, render } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import {
  Form,
  type FormHandle,
  ValidationMode,
  interpretFieldNodeDraft,
} from '../../index';

afterEach(cleanup);

it('REACT-033 exports interpretFieldNodeDraft to interpret union drafts without writing', () => {
  const ref = createRef<FormHandle>();
  render(
    <Form
      ref={ref}
      jsonSchema={{ type: ['number', 'boolean'] }}
      validationMode={ValidationMode.None}
    />,
  );
  const node = ref.current!.node!;
  expect(interpretFieldNodeDraft(node, '42')).toEqual({
    value: 42,
    isMember: true,
  });
  expect(interpretFieldNodeDraft(node, 'true')).toEqual({
    value: true,
    isMember: true,
  });
  expect(interpretFieldNodeDraft(node, 'abc')).toEqual({
    value: 'abc',
    isMember: false,
  });
  expect(node.value).toBeUndefined();
});
