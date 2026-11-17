import { createRef, useState } from 'react';

import { act, cleanup, render } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import { Form, type FormHandle } from '@/schema-form/components/Form';
import { ValidationMode } from '@/schema-form/core';

import { useFormSubmit } from '../form/useFormSubmit';

afterEach(cleanup);

const deferred = () => {
  let resolve!: () => void;
  const promise = new Promise<void>((r) => {
    resolve = r;
  });
  return { promise, resolve };
};

it('useFormSubmit pending tracks a Form that mounts after the hook subscribed', async () => {
  const ref = createRef<FormHandle>();
  const gate = deferred();
  let show!: () => void;
  const Host = () => {
    const [visible, setVisible] = useState(false);
    show = () => setVisible(true);
    const { pending } = useFormSubmit(ref);
    return (
      <>
        <output>{String(pending)}</output>
        {visible && (
          <Form
            ref={ref}
            jsonSchema={{ type: 'string' }}
            validationMode={ValidationMode.None}
            onSubmit={() => gate.promise}
          >
            <span />
          </Form>
        )}
      </>
    );
  };
  const view = render(<Host />);
  act(() => show());
  let operation!: Promise<unknown>;
  await act(async () => {
    operation = ref.current!.submit();
  });
  expect(ref.current!.submit.pending).toBe(true);
  expect(view.container.querySelector('output')!.textContent).toBe('true');
  await act(async () => {
    gate.resolve();
    await operation;
  });
});

it('useFormSubmit pending tracks the Form after it remounts with a new key', async () => {
  const ref = createRef<FormHandle>();
  const gate = deferred();
  let bump!: () => void;
  const Host = () => {
    const [key, setKey] = useState(0);
    bump = () => setKey((k) => k + 1);
    const { pending } = useFormSubmit(ref);
    return (
      <>
        <output>{String(pending)}</output>
        <Form
          key={key}
          ref={ref}
          jsonSchema={{ type: 'string' }}
          validationMode={ValidationMode.None}
          onSubmit={() => gate.promise}
        >
          <span />
        </Form>
      </>
    );
  };
  const view = render(<Host />);
  act(() => bump());
  let operation!: Promise<unknown>;
  await act(async () => {
    operation = ref.current!.submit();
  });
  expect(ref.current!.submit.pending).toBe(true);
  expect(view.container.querySelector('output')!.textContent).toBe('true');
  await act(async () => {
    gate.resolve();
    await operation;
  });
});
