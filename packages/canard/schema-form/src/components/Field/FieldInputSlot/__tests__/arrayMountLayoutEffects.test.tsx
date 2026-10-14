import type { DependencyList, EffectCallback } from 'react';

import { cleanup, render } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import { Form } from '@/schema-form/components/Form';
import type { FieldInputProps } from '@/schema-form/types/fieldInput';

/** Layout-effect runs of every module that imports `useLayoutEffect` from React in this file's graph. */
const layoutRuns = vi.hoisted(() => ({ count: 0 }));

vi.mock('react', async (importOriginal) => {
  const runtime = await importOriginal<
    typeof import('react') & {
      default: typeof import('react');
    }
  >();
  const originalLayoutEffect =
    runtime.useLayoutEffect ?? runtime.default.useLayoutEffect;
  const useLayoutEffect = (effect: EffectCallback, deps?: DependencyList) =>
    originalLayoutEffect(() => {
      layoutRuns.count++;
      return effect();
    }, deps);
  return {
    ...runtime,
    default: { ...runtime.default, useLayoutEffect },
    useLayoutEffect,
  };
});

afterEach(cleanup);

const Input = ({ defaultValue, path }: FieldInputProps) => (
  <input defaultValue={defaultValue as string | undefined} id={path} />
);

/** Count the layout effects one mount of an `items` array with `length` string items runs. */
const mountLayoutRuns = (length: number) => {
  layoutRuns.count = 0;
  render(
    <Form
      jsonSchema={{
        type: 'object',
        properties: { items: { type: 'array', items: { type: 'string' } } },
      }}
      defaultValue={{
        items: Array.from({ length }, (_, index) => `v${index}`),
      }}
      fieldInputDefinitions={[{ test: { type: 'string' }, Component: Input }]}
    />,
  );
  const runs = layoutRuns.count;
  cleanup();
  return runs;
};

it('improvement 32 mounts each array item with two layout effects: its child mount count and its input commit', () => {
  const empty = mountLayoutRuns(0);
  const filled = mountLayoutRuns(200);
  expect(filled - empty).toBe(2 * 200);
});
