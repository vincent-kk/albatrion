import { useLayoutEffect, useState } from 'react';

import { act, cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import { Form } from '@/schema-form/components/Form';
import {
  FieldNodeEventType,
  FieldNodeState,
  ValidationMode,
} from '@/schema-form/core';
import {
  FormErrorCode,
  type FormErrorRecord,
  SchemaFormError,
} from '@/schema-form/errors';
import type { FieldInputProps } from '@/schema-form/types';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

it('DR-16 red a layout write reports A and B once and preserves the boundary bundle', async () => {
  const A = new Error('listener A');
  const B = new Error('listener B');
  const H = new Error('onError H');
  const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
  const onError = vi.fn((record: FormErrorRecord) => {
    if (record.error === A) throw H;
  });
  const Field = ({ node, path }: FieldInputProps) => {
    const [tick, setTick] = useState(0);
    useLayoutEffect(() => {
      const offA = node.subscribe((event) => {
        if (event.type & FieldNodeEventType.UpdateState) throw A;
      });
      const offB = node.subscribe((event) => {
        if (event.type & FieldNodeEventType.UpdateState) throw B;
      });
      return () => {
        offA();
        offB();
      };
    }, [node]);
    useLayoutEffect(() => {
      if (tick) node.setState({ [FieldNodeState.Touched]: true });
    }, [node, tick]);
    return (
      <button id={path} onClick={() => setTick((value) => value + 1)}>
        write
      </button>
    );
  };
  const view = render(
    <Form
      jsonSchema={{
        type: 'object',
        properties: {
          a: { type: 'string', presentation: { FieldInput: Field } },
        },
      }}
      validationMode={ValidationMode.None}
      onError={onError}
    />,
  );
  await act(async () => {
    fireEvent.click(view.container.querySelector('button')!);
  });
  expect(
    onError.mock.calls.map(([record]) => ({
      code: record.code,
      origin: record.origin,
      error: record.error,
    })),
  ).toEqual([
    { code: FormErrorCode.ListenerThrew, origin: 'write', error: A },
    { code: FormErrorCode.ListenerThrew, origin: 'write', error: B },
  ]);
  expect(onError.mock.calls[0][0].error).toBe(A);
  expect(onError.mock.calls[1][0].error).toBe(B);
  const boundaryCalls = consoleError.mock.calls.filter(
    ([message]) => message === 'ErrorBoundary caught an error:',
  );
  expect(boundaryCalls).toHaveLength(1);
  const outer = boundaryCalls[0][1];
  expect(outer).toBeInstanceOf(SchemaFormError);
  expect(outer).toMatchObject({
    code: FormErrorCode.MultipleErrors,
    details: { errors: [expect.any(SchemaFormError), H] },
  });
  const inner = (outer as SchemaFormError).details.errors as SchemaFormError[];
  const leaves = inner[0].details.errors as unknown[];
  expect(leaves).toHaveLength(2);
  expect(leaves[0]).toBe(A);
  expect(leaves[1]).toBe(B);
});
