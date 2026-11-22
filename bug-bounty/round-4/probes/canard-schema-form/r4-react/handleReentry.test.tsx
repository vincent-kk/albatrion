import { act, cleanup, fireEvent, render } from '@testing-library/react';
import { createRef, useRef } from 'react';
import { afterEach, expect, it, vi } from 'vitest';

import {
  Form,
  type FormHandle,
  ValidationMode,
  useFormSubmit,
} from '@/schema-form';

afterEach(cleanup);

/** LC2: callbacks that call the Form handle while they run. */
const schema = {
  type: 'object',
  properties: { name: { type: 'string' } },
} as const;

const validator = {
  compile: () => (value: { name?: string }) =>
    value?.name === 'bad'
      ? [{ dataPath: '/name', keyword: 'bad', message: 'bad' }]
      : null,
  compileGuard: () => () => true,
};

it('onSubmit that resets the form: the reset holds and the next submit runs', async () => {
  const handle = createRef<FormHandle<typeof schema>>();
  const submitted: unknown[] = [];
  render(
    <Form
      ref={handle}
      jsonSchema={schema}
      defaultValue={{ name: 'start' }}
      validatorFactory={validator}
      onSubmit={(value) => {
        submitted.push(value);
        handle.current!.reset();
      }}
    />,
  );
  await act(async () => {
    handle.current!.setValue({ name: 'first' });
  });
  await act(async () => {
    await handle.current!.submit();
  });
  expect(handle.current!.getValue()).toEqual({ name: 'start' });
  await act(async () => {
    handle.current!.setValue({ name: 'second' });
  });
  await act(async () => {
    await handle.current!.submit();
  });
  expect(submitted).toEqual([{ name: 'first' }, { name: 'second' }]);
  expect(handle.current!.submit.pending).toBeFalsy();
});

it('onChange that submits (autosave) submits the typed value', async () => {
  const handle = createRef<FormHandle<typeof schema>>();
  const onSubmit = vi.fn();
  const view = render(
    <Form
      ref={handle}
      jsonSchema={schema}
      validatorFactory={validator}
      onChange={() => {
        void handle.current?.submit();
      }}
      onSubmit={onSubmit}
    >
      <Form.Input path="/name" />
    </Form>,
  );
  const input = view.container.querySelector('input')!;
  await act(async () => {
    fireEvent.change(input, { target: { value: 'typed' } });
  });
  await vi.waitFor(() => expect(onSubmit).toHaveBeenCalled());
  expect(onSubmit.mock.calls.at(-1)?.[0]).toEqual({ name: 'typed' });
});

it('onValidate that normalizes through setValue settles', async () => {
  const handle = createRef<FormHandle<typeof schema>>();
  const onValidate = vi.fn((errors: readonly unknown[]) => {
    if (errors.length) handle.current?.setValue({ name: 'good' });
  });
  const view = render(
    <Form
      ref={handle}
      jsonSchema={schema}
      validatorFactory={validator}
      validationMode={ValidationMode.OnChange}
      onValidate={onValidate}
    >
      <Form.Input path="/name" />
    </Form>,
  );
  const input = view.container.querySelector('input')!;
  await act(async () => {
    fireEvent.change(input, { target: { value: 'bad' } });
  });
  // Waits for settlement instead of a fixed delay, which a loaded parallel run can exceed.
  await vi.waitFor(
    () => {
      expect(handle.current!.getValue()).toEqual({ name: 'good' });
      expect(handle.current!.getErrors()).toEqual([]);
    },
    { timeout: 3000 },
  );
  expect(onValidate.mock.calls.length).toBeLessThan(10);
});

it('useFormSubmit pending returns to false after onSubmit resets the form', async () => {
  let observed: { pending?: boolean } = {};
  const resolvers: (() => void)[] = [];
  const Page = () => {
    const ref = useRef<FormHandle<typeof schema>>(null);
    const { pending, submit } = useFormSubmit(ref);
    observed = { pending };
    return (
      <>
        <Form
          ref={ref}
          jsonSchema={schema}
          validatorFactory={validator}
          onSubmit={() =>
            new Promise<void>((resolve) => {
              resolvers.push(() => {
                ref.current!.reset();
                resolve();
              });
            })
          }
        />
        <button type="button" onClick={() => void submit()}>
          save
        </button>
      </>
    );
  };
  const view = render(<Page />);
  await act(async () => {
    fireEvent.click(view.getByText('save'));
  });
  await vi.waitFor(() => expect(resolvers.length).toBe(1));
  expect(observed.pending).toBe(true);
  await act(async () => {
    resolvers[0]();
  });
  expect(observed.pending).toBe(false);
});
