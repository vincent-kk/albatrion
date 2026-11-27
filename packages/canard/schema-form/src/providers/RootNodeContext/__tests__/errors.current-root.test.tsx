import { createRef } from 'react';

import { act, cleanup, render } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import { Form, type FormHandle } from '@/schema-form/components/Form';
import { ValidationMode } from '@/schema-form/core';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

it('DR-10 applies a fresh errors prop to the latest root when reset and schema change share a batch', () => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
  const ref = createRef<FormHandle>();
  const onError = vi.fn();
  const initial = { type: 'string' } as const;
  const replacement = { type: 'number' } as const;
  const view = render(
    <Form
      ref={ref}
      jsonSchema={initial}
      errors={[]}
      onError={onError}
      validationMode={ValidationMode.None}
    >
      <span />
    </Form>,
  );
  const previous = ref.current!.node;
  act(() => {
    ref.current!.reset();
    view.rerender(
      <Form
        ref={ref}
        jsonSchema={replacement}
        errors={[]}
        onError={onError}
        validationMode={ValidationMode.None}
      >
        <span />
      </Form>,
    );
  });
  expect(ref.current).not.toBeNull();
  expect(ref.current!.node).not.toBe(previous);
  expect(ref.current!.node?.type).toBe('number');
  expect(onError).not.toHaveBeenCalled();
});
