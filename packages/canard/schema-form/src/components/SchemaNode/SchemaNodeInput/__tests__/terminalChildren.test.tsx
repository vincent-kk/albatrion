import {
  type ComponentType,
  createRef,
  useLayoutEffect,
  useState,
} from 'react';

import { act, cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import { Form, type FormHandle } from '@/schema-form/components/Form';
import type { FieldInputProps, JSONSchema } from '@/schema-form/types';

/** An object made terminal by an inline input: the one shape whose empty child list is a mistake to read (round 180). */
const detectable = (Input: ComponentType<FieldInputProps>) =>
  ({
    type: 'object',
    properties: { leaf: { type: 'string' } },
    presentation: { FieldInput: Input },
  }) satisfies JSONSchema;

afterEach(() => {
  vi.unstubAllEnvs();
  cleanup();
  vi.restoreAllMocks();
});

it('round 180 hands a production build a plain empty list even with an error handler', async () => {
  vi.stubEnv('NODE_ENV', 'production');
  const onError = vi.fn();
  const lists: unknown[] = [];
  const Input = ({ ChildNodeComponents }: FieldInputProps) => {
    lists.push(ChildNodeComponents);
    return <input data-count={ChildNodeComponents.length} />;
  };
  render(
    <Form
      validationMode={0}
      jsonSchema={detectable(Input)}
      onError={onError}
    />,
  );
  await act(async () => {
    await Promise.resolve();
  });
  vi.unstubAllEnvs();
  const plain: unknown[] = [];
  const PlainInput = ({ ChildNodeComponents }: FieldInputProps) => {
    plain.push(ChildNodeComponents);
    return <input data-count={ChildNodeComponents.length} />;
  };
  render(
    <Form
      validationMode={0}
      jsonSchema={{
        type: 'string',
        presentation: { FieldInput: PlainInput },
      }}
      onError={onError}
    />,
  );
  expect(lists[0]).toBe(plain[0]);
  expect(onError).not.toHaveBeenCalled();
});

it('round 180 hands a string node a plain empty list in development', async () => {
  const onError = vi.fn();
  const Input = ({ ChildNodeComponents }: FieldInputProps) => (
    <input data-count={ChildNodeComponents.length} />
  );
  render(
    <Form
      validationMode={0}
      jsonSchema={{ type: 'string', presentation: { FieldInput: Input } }}
      onError={onError}
    />,
  );
  await act(async () => {
    await Promise.resolve();
  });
  expect(onError).not.toHaveBeenCalled();
});

it('ERROR-202 reports a terminal input first reading children in an event after mount', async () => {
  const onError = vi.fn();
  const warning = vi.spyOn(console, 'warn').mockImplementation(() => {});
  const Input = ({ ChildNodeComponents }: FieldInputProps) => (
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
      jsonSchema={detectable(Input)}
      onError={onError}
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
  const Input = ({ ChildNodeComponents }: FieldInputProps) => {
    useLayoutEffect(() => {
      void ChildNodeComponents[0];
    }, [ChildNodeComponents]);
    return <input />;
  };
  render(
    <Form
      validationMode={0}
      jsonSchema={detectable(Input)}
      onError={onError}
    />,
  );
  expect(onError.mock.calls.map(([record]) => record.code)).toEqual([
    'SCHEMA_FORM_WARNING.CHILD_NODE_COMPONENTS_ON_TERMINAL',
  ]);
});

it('ERROR-202 keeps the terminal empty list stable across a late render read', async () => {
  const onError = vi.fn();
  const lists: unknown[] = [];
  const Input = ({ ChildNodeComponents }: FieldInputProps) => {
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
      jsonSchema={detectable(Input)}
      onError={onError}
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
  const Input = ({ ChildNodeComponents }: FieldInputProps) => (
    <input data-count={ChildNodeComponents.length} />
  );
  render(
    <Form
      ref={ref}
      validationMode={0}
      jsonSchema={detectable(Input)}
      defaultValue="value"
      onError={onError}
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
