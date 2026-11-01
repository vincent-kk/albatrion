import { createRef } from 'react';

import { act, cleanup, render } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import { Form, type FormHandle } from '@/schema-form/components/Form';
import { ValidationMode } from '@/schema-form/core';

import { createValidationFrameClock } from '../helpers/createValidationFrameClock';

const issues = [
  { dataPath: '/a', message: 'a' },
  { dataPath: '/b', message: 'b' },
];

/** Each run is independently settled to expose both supersession orders. */
const mountAsync = () => {
  const clock = createValidationFrameClock();
  const ref = createRef<FormHandle>();
  const runs: {
    resolve: (value: typeof issues) => void;
    reject: (error: Error) => void;
  }[] = [];
  const validate = vi.fn(
    () =>
      new Promise<typeof issues>((resolve, reject) => {
        runs.push({ resolve, reject });
      }),
  );
  const onError = vi.fn();
  const host = vi.fn();
  vi.stubGlobal('reportError', host);
  render(
    <Form
      ref={ref}
      jsonSchema={{
        type: 'object',
        properties: { a: { type: 'string' }, b: { type: 'string' } },
      }}
      defaultValue={{ a: 'a', b: 'b' }}
      validationMode={ValidationMode.OnChange}
      validatorFactory={{
        compile: () => validate,
        compileGuard: () => () => true,
      }}
      onError={onError}
    >
      <span />
    </Form>,
  );
  const frames = async (count = 2) =>
    act(async () => {
      for (let index = 0; index < count; index++) {
        clock.frame();
        await clock.task();
      }
    });
  const complete = async (index: number, failure?: Error, verdict = issues) =>
    act(async () => {
      if (failure) runs[index].reject(failure);
      else runs[index].resolve(verdict);
      await clock.task();
    });
  return { ref, runs, validate, onError, host, frames, complete };
};

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

it('DR-13 gate avoids a fourth run when two writes supersede an async verdict', async () => {
  const f = mountAsync();
  await f.frames();
  await f.complete(0, undefined, []);
  act(() => f.ref.current!.findNode('/a')!.setValue('first'));
  await f.frames();
  act(() => f.ref.current!.findNode('/a')!.setValue('second'));
  await f.frames();
  expect(f.validate).toHaveBeenCalledTimes(3);
  await f.complete(1);
  await f.frames();
  await f.complete(2);
  await f.frames(3);
  expect(f.validate).toHaveBeenCalledTimes(3);
});

it('DR-13 gate hands slot targets to a successor that resolves first', async () => {
  const f = mountAsync();
  await f.frames();
  act(() => f.ref.current!.findNode('/a')!.resetSubtree());
  await f.frames();
  await f.complete(1);
  expect(f.ref.current!.findNode('/b')!.errors).toHaveLength(1);
  await f.complete(0);
  await f.frames();
  expect(f.validate).toHaveBeenCalledTimes(2);
});

it('DR-13 gate keeps the superseded cadence rejection silent and assigns both targets', async () => {
  const f = mountAsync();
  await f.frames();
  await f.complete(0, undefined, []);
  act(() => f.ref.current!.findNode('/a')!.resetSubtree());
  await f.frames();
  act(() => f.ref.current!.findNode('/b')!.resetSubtree());
  await f.frames();
  await f.complete(1, new Error('stale cadence'));
  await f.complete(2);
  expect(f.ref.current!.findNode('/a')!.errors).toHaveLength(1);
  expect(f.ref.current!.findNode('/b')!.errors).toHaveLength(1);
  expect(f.onError).not.toHaveBeenCalled();
  expect(f.host).not.toHaveBeenCalled();
});

it('DR-13 gate reports the superseded slot rejection and hands its sibling target on', async () => {
  const f = mountAsync();
  await f.frames();
  act(() => f.ref.current!.findNode('/a')!.resetSubtree());
  await f.frames();
  await f.complete(0, new Error('stale slot'));
  await f.complete(1);
  expect(f.ref.current!.findNode('/b')!.errors).toHaveLength(1);
  expect(f.onError).toHaveBeenCalledOnce();
  expect(f.host).toHaveBeenCalledOnce();
});

it('DR-13 gate preserves the cadence record while an explicit subtree verdict settles', async () => {
  const f = mountAsync();
  await f.frames();
  await f.complete(0, undefined, []);
  act(() => f.ref.current!.findNode('/a')!.resetSubtree());
  await f.frames();
  const subtree = f.ref.current!.findNode('/b')!.validate();
  await f.complete(2);
  await subtree;
  act(() => f.ref.current!.findNode('/b')!.resetSubtree());
  await f.frames();
  await f.complete(3);
  expect(f.ref.current!.findNode('/a')!.errors).toHaveLength(1);
  await f.complete(1);
});

it('DR-13 gate hands an explicit root run to a subtree successor', async () => {
  const f = mountAsync();
  await f.frames();
  await f.complete(0, undefined, []);
  const explicit = f.ref.current!.validate();
  act(() => f.ref.current!.findNode('/a')!.resetSubtree());
  await f.frames();
  await f.complete(2);
  expect(f.ref.current!.findNode('/b')!.errors).toHaveLength(1);
  await f.complete(1);
  await explicit;
  await f.frames();
  expect(f.validate).toHaveBeenCalledTimes(3);
});

it('DR-13 gate preserves the pre-existing caller-only superseded subtree verdict', async () => {
  const f = mountAsync();
  await f.frames();
  await f.complete(0, undefined, []);
  const subtree = f.ref.current!.findNode('/a')!.validate();
  act(() => f.ref.current!.findNode('/b')!.setValue('changed'));
  await f.frames();
  await f.complete(1);
  expect(await subtree).toHaveLength(2);
  expect(f.ref.current!.findNode('/a')!.errors).toHaveLength(0);
  await f.complete(2);
  expect(f.ref.current!.findNode('/a')!.errors).toHaveLength(1);
});
