import { createRef, useLayoutEffect, useState } from 'react';

import { act, cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import { Form, type FormHandle } from '@/schema-form/components/Form';
import type { FormTypeInputProps } from '@/schema-form/types';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

it('ERROR-202 reports a terminal input first reading children in an event after mount', async () => {
  const onError = vi.fn();
  const warning = vi.spyOn(console, 'warn').mockImplementation(() => {});
  const Input = ({ ChildNodeComponents }: FormTypeInputProps) => (
    <button
      onClick={() => {
        void ChildNodeComponents.length;
      }}
    >
      Read children
    </button>
  );
  const view = render(
    <Form
      validationMode={0}
      jsonSchema={{ type: 'string' }}
      onError={onError}
      formTypeInputDefinitions={[
        { test: { type: 'string' }, Component: Input },
      ]}
    />,
  );
  expect(onError).not.toHaveBeenCalled();
  fireEvent.click(view.getByText('Read children'));
  await act(async () => {
    await Promise.resolve();
  });
  expect(
    onError.mock.calls.filter(
      ([record]) =>
        record.code === 'SCHEMA_FORM_WARNING.CHILD_NODE_COMPONENTS_ON_TERMINAL',
    ),
  ).toHaveLength(1);
  fireEvent.click(view.getByText('Read children'));
  await act(async () => {
    await Promise.resolve();
  });
  expect(onError).toHaveBeenCalledTimes(1);
  expect(warning).not.toHaveBeenCalled();
});

it('ERROR-202 reports a child layout read after the initial render', () => {
  const onError = vi.fn();
  const Input = ({ ChildNodeComponents }: FormTypeInputProps) => {
    useLayoutEffect(() => {
      void ChildNodeComponents[0];
    }, [ChildNodeComponents]);
    return <input />;
  };
  render(
    <Form
      validationMode={0}
      jsonSchema={{ type: 'string' }}
      onError={onError}
      formTypeInputDefinitions={[
        { test: { type: 'string' }, Component: Input },
      ]}
    />,
  );
  expect(onError.mock.calls.map(([record]) => record.code)).toEqual([
    'SCHEMA_FORM_WARNING.CHILD_NODE_COMPONENTS_ON_TERMINAL',
  ]);
});

it('ERROR-202 keeps the terminal empty list stable across a late render read', async () => {
  const onError = vi.fn();
  const lists: unknown[] = [];
  const Input = ({ ChildNodeComponents }: FormTypeInputProps) => {
    const [read, setRead] = useState(false);
    lists.push(ChildNodeComponents);
    return (
      <button onClick={() => setRead(true)}>
        {read ? ChildNodeComponents.length : 'Later'}
      </button>
    );
  };
  render(
    <Form
      validationMode={0}
      jsonSchema={{ type: 'string' }}
      onError={onError}
      formTypeInputDefinitions={[
        { test: { type: 'string' }, Component: Input },
      ]}
    />,
  );
  fireEvent.click(document.querySelector('button')!);
  await act(async () => {
    await Promise.resolve();
  });
  expect(lists[0]).toBe(lists[1]);
  expect(onError.mock.calls.map(([record]) => record.code)).toEqual([
    'SCHEMA_FORM_WARNING.CHILD_NODE_COMPONENTS_ON_TERMINAL',
  ]);
});

it('ERROR-202 reports the first terminal child read again after a retained-root reset starts a new load', async () => {
  const ref = createRef<FormHandle>();
  const onError = vi.fn();
  const Input = ({ ChildNodeComponents }: FormTypeInputProps) => (
    <input data-count={ChildNodeComponents.length} />
  );
  render(
    <Form
      ref={ref}
      validationMode={0}
      jsonSchema={{ type: 'string' }}
      defaultValue="value"
      onError={onError}
      formTypeInputDefinitions={[
        { test: { type: 'string' }, Component: Input },
      ]}
    />,
  );
  const warnings = () =>
    onError.mock.calls.filter(
      ([record]) =>
        record.code === 'SCHEMA_FORM_WARNING.CHILD_NODE_COMPONENTS_ON_TERMINAL',
    ).length;
  expect(warnings()).toBe(1);
  const root = ref.current!.node;
  act(() => ref.current!.reset());
  await act(async () => {
    await Promise.resolve();
  });
  expect(ref.current!.node).toBe(root);
  expect(warnings()).toBe(2);
  act(() => ref.current!.setValue('next'));
  await act(async () => {
    await Promise.resolve();
  });
  expect(warnings()).toBe(2);
});
