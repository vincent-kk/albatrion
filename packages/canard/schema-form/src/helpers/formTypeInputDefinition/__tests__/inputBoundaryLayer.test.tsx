import { createRef, useState } from 'react';

import { act, cleanup, render } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import { Form, type FormHandle } from '@/schema-form/components/Form';
import type { FormTypeInputProps } from '@/schema-form/types';

afterEach(cleanup);

it('F-B keeps the same boundary with a direct raw input child when Refresh applies a new generation', () => {
  const ref = createRef<FormHandle>();
  let mounts = 0;
  const Input = ({ path, defaultValue, ...props }: FormTypeInputProps) => {
    const [mount] = useState(() => ++mounts);
    expect(props).not.toHaveProperty('inputGeneration');
    return <input id={path} data-mount={mount} defaultValue={defaultValue} />;
  };
  const view = render(
    <Form
      ref={ref}
      jsonSchema={{ type: 'string' }}
      defaultValue="committed"
      formTypeInputDefinitions={[
        { test: { type: 'string' }, Component: Input },
      ]}
    />,
  );
  const initial = view.container.querySelector('input')!;
  const fiberKey = Object.keys(initial).find((key) =>
    key.startsWith('__reactFiber$'),
  )!;
  const fiber = (
    initial as unknown as Record<
      string,
      {
        return: {
          type: unknown;
          return: { type: { name?: string }; stateNode: object };
        };
      }
    >
  )[fiberKey];
  expect(fiber.return.type).toBe(Input);
  expect(fiber.return.return.type.name).toBe('ErrorBoundary');
  const boundary = fiber.return.return.stateNode;
  initial.value = 'draft';
  initial.setSelectionRange(1, 3);
  act(() => ref.current!.refresh());
  const refreshed = view.container.querySelector('input')!;
  const next = (
    refreshed as unknown as typeof initial & Record<string, typeof fiber>
  )[fiberKey];
  expect(refreshed).not.toBe(initial);
  expect(next.return.type).toBe(Input);
  expect(next.return.return.stateNode).toBe(boundary);
  expect(refreshed.value).toBe('committed');
  expect(refreshed.selectionStart).toBe(refreshed.selectionEnd);
  expect(mounts).toBe(2);
});
