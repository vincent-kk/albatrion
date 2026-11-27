import { createRef } from 'react';

import { cleanup, render } from '@testing-library/react';
import { afterEach } from 'vitest';

import {
  Form,
  type FormHandle,
  type FormProps,
  type InferFieldNode,
  type JSONSchema,
  ValidationMode,
} from '../../../index';

afterEach(cleanup);

/** Open a public Form and return its published node for engine contract tests. */
export const mountEngineForm = <Schema extends JSONSchema>(
  props: FormProps<Schema>,
): InferFieldNode<Schema> => {
  const handle = createRef<FormHandle<Schema>>();
  render(
    <Form ref={handle} validationMode={ValidationMode.None} {...props}>
      <span />
    </Form>,
  );
  const node = handle.current?.node;
  if (!node) throw new Error('Expected the mounted Form node');
  return node;
};
