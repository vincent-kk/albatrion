import { createRef } from 'react';

import { act, cleanup, render } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import { Form, type FormHandle } from '@/schema-form/components/Form';
import { type SchemaNode, ValidationMode } from '@/schema-form/core';
import type { FormTypeInputProps } from '@/schema-form/types';

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

it('WRITE-043 preserves explicit undefined when resetting a same-schema form', () => {
  const ref = createRef<FormHandle>();
  const schema = { type: 'string' } as const;
  const view = render(
    <Form
      ref={ref}
      jsonSchema={schema}
      defaultValue="before"
      validationMode={ValidationMode.None}
    >
      <span />
    </Form>,
  );
  const root = ref.current!.node;
  view.rerender(
    <Form ref={ref} jsonSchema={schema} validationMode={ValidationMode.None}>
      <span />
    </Form>,
  );
  act(() => ref.current!.reset());
  expect(ref.current!.node).toBe(root);
  expect(ref.current!.getValue()).toBeUndefined();
});

it('ERROR-113 refuses core writes during committed buffered onError delivery', () => {
  vi.stubGlobal('reportError', vi.fn());
  let node: SchemaNode;
  let failure: unknown;
  const Input = (props: FormTypeInputProps) => {
    node = props.node;
    return <input />;
  };
  render(
    <Form
      jsonSchema={{ type: 'number', presentation: { FormTypeInput: Input } }}
      defaultValue="invalid"
      validationMode={ValidationMode.None}
      onError={() => {
        try {
          node!.setValue(3);
        } catch (error) {
          failure = error;
        }
      }}
    />,
  );
  expect(failure).toMatchObject({
    code: 'SCHEMA_FORM_ERROR.WRITE_IN_OBSERVER',
  });
  expect(node!.value).toBe('invalid');
});
