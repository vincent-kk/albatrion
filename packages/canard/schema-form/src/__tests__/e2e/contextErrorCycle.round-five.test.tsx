import { act, cleanup, render } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import { Form, FormProvider, ValidationMode } from '../../index';

afterEach(cleanup);

const READ_LIMIT = 1_000;

const createContext = (
  role: string,
  reads: { count: number; stack?: string },
  wrap: (graph: object) => object,
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
  return { role, ...wrap(node) };
};

/** An application error that carries the request graph it failed on. */
class RequestError extends Error {
  constructor(public request: object) {
    super('request failed');
  }
}

const schema = {
  type: 'object',
  properties: {
    name: { type: 'string', controls: { visible: '@.role === "admin"' } },
  },
} as const;

const cases: [string, (graph: object) => object][] = [
  ['control: the graph itself (fixed in round 4)', (graph) => ({ graph })],
  [
    'an Error whose own enumerable property holds the graph',
    (graph) => ({ lastError: Object.assign(new Error('failed'), { graph }) }),
  ],
  [
    'an Error subclass instance holding the graph',
    (graph) => ({ lastError: new RequestError(graph) }),
  ],
];

it.each(cases)(
  'a Form whose rebuilt context holds %s re-renders in bounded time',
  async (_label, wrap) => {
    const reads: { count: number; stack?: string } = { count: 0 };
    const onError = vi.fn();
    const element = () => (
      <Form
        jsonSchema={schema}
        context={createContext('admin', reads, wrap)}
        validationMode={ValidationMode.None}
        onError={onError}
      />
    );
    const view = render(element());
    let thrown: unknown;
    try {
      await act(async () => {
        view.rerender(element());
      });
    } catch (error) {
      thrown = error;
    }
    const frames = reads.stack
      ?.split('\n')
      .filter((line) => line.includes('/src/') && !line.includes('__bounty__'))
      .slice(0, 3)
      .map((line) => line.trim().replace(/^.*\/packages\//, ''));
    expect({
      bounded: reads.count <= READ_LIMIT,
      frames,
      thrown: thrown instanceof Error ? thrown.message : thrown,
    }).toEqual({ bounded: true, frames: undefined, thrown: undefined });
  },
);

it('a FormProvider whose rebuilt context holds an Error with a cyclic own property re-renders in bounded time', async () => {
  const reads: { count: number; stack?: string } = { count: 0 };
  const element = () => (
    <FormProvider
      context={createContext('admin', reads, (graph) => ({
        lastError: Object.assign(new Error('failed'), { graph }),
      }))}
    >
      <Form jsonSchema={schema} validationMode={ValidationMode.None} />
    </FormProvider>
  );
  const view = render(element());
  let thrown: unknown;
  try {
    await act(async () => {
      view.rerender(element());
    });
  } catch (error) {
    thrown = error;
  }
  expect({
    bounded: reads.count <= READ_LIMIT,
    thrown: thrown instanceof Error ? thrown.message : thrown,
  }).toEqual({ bounded: true, thrown: undefined });
});
