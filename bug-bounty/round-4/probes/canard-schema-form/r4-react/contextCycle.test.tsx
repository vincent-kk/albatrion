import { act, cleanup, render } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import { Form, FormProvider, ValidationMode } from '@/schema-form';

afterEach(cleanup);

/**
 * RG1 of round 3 item 7 (context compared by content in a package-local snapshot): a context whose
 * plain-object content contains a reference cycle, rebuilt on every render (for example a
 * normalized graph with parent links). field-input.md compares context by content; the comparison
 * must finish. The `self` getter counts reads so a non-terminating comparison throws instead of
 * hanging the test thread.
 */
const READ_LIMIT = 100_000;

const createCyclicContext = (
  role: string,
  reads: { count: number; stack?: string },
) => {
  const node: Record<string, unknown> = { role };
  Object.defineProperty(node, 'self', {
    enumerable: true,
    get() {
      if (++reads.count > READ_LIMIT) {
        const error = new Error('context comparison did not terminate');
        reads.stack ??= error.stack;
        throw error;
      }
      return node;
    },
  });
  return { graph: node };
};

const schema = {
  type: 'object',
  properties: {
    name: { type: 'string', controls: { visible: '@.graph.role === "admin"' } },
  },
} as const;

it('a Form whose rebuilt context contains a cycle re-renders in bounded time', async () => {
  const reads: { count: number; stack?: string } = { count: 0 };
  const onError = vi.fn();
  const view = render(
    <Form
      jsonSchema={schema}
      context={createCyclicContext('admin', reads)}
      validationMode={ValidationMode.None}
      onError={onError}
    />,
  );
  await act(async () => {
    view.rerender(
      <Form
        jsonSchema={schema}
        context={createCyclicContext('admin', reads)}
        validationMode={ValidationMode.None}
        onError={onError}
      />,
    );
  });
  const looping = reads.stack
    ?.split('\n')
    .filter((line) => line.includes('/src/') && !line.includes('__bounty__'))
    .slice(0, 3)
    .map((line) => line.trim().replace(/^.*\/src\//, ''))
    .join(' <- ');
  expect(looping).toBeUndefined();
  expect({
    reads: reads.count <= READ_LIMIT,
    errors: onError.mock.calls.map(([record]) => record.message),
  }).toEqual({ reads: true, errors: [] });
});

it('a FormProvider whose rebuilt context contains a cycle re-renders in bounded time', async () => {
  const reads = { count: 0 };
  const onError = vi.fn();
  const element = () => (
    <FormProvider context={createCyclicContext('admin', reads)}>
      <Form
        jsonSchema={schema}
        validationMode={ValidationMode.None}
        onError={onError}
      />
    </FormProvider>
  );
  let thrown: unknown;
  const view = render(element());
  try {
    await act(async () => {
      view.rerender(element());
    });
  } catch (error) {
    thrown = error;
  }
  expect({
    reads: reads.count <= READ_LIMIT,
    thrown: thrown instanceof Error ? thrown.message : thrown,
  }).toEqual({ reads: true, thrown: undefined });
});
