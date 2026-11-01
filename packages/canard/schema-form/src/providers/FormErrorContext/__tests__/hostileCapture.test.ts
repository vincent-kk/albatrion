import { expect, it } from 'vitest';

import { FormErrorCode, SchemaFormError } from '@/schema-form/errors';

import { createKnownCaptureService } from './helpers/createKnownCaptureService';

const bundle = (errors: unknown[]) =>
  new SchemaFormError(FormErrorCode.MultipleErrors, 'candidate', { errors });

it.each([
  ['NaN', NaN],
  ['negative', -1],
  ['string-zero', '0'],
  ['fraction', 0.5],
] as const)('AM16 capture rejects invalid length %s', (_label, length) => {
  const { service, onError, A, H } = createKnownCaptureService();
  let reads = 0;
  const errors = new Proxy([A], {
    get: (target, key, receiver) => {
      if (key !== 'length') return Reflect.get(target, key, receiver);
      if (++reads > 8) throw new Error('length fuse');
      return length;
    },
  });
  const failure = bundle([bundle(errors), H]);
  expect(() => service.capture(failure, 'render', 'stack')).not.toThrow();
  expect(reads).toBeLessThanOrEqual(2);
  expect(onError).toHaveBeenCalledTimes(1);
  expect(onError.mock.calls[0][0].error).toBe(failure);
});

it('AM16 capture rejects a nested length changing from one to Infinity', () => {
  const { service, onError, A, H } = createKnownCaptureService();
  let reads = 0;
  const errors = new Proxy([A], {
    get: (target, key, receiver) => {
      if (key === 'length') {
        if (++reads > 8) throw new Error('length fuse');
        return reads === 1 ? 1 : Infinity;
      }
      return typeof key === 'string' && /^\d+$/.test(key)
        ? A
        : Reflect.get(target, key, receiver);
    },
    getOwnPropertyDescriptor: (target, key) =>
      typeof key === 'string' && /^\d+$/.test(key)
        ? { value: A, writable: true, enumerable: true, configurable: true }
        : Reflect.getOwnPropertyDescriptor(target, key),
  });
  const failure = bundle([bundle(errors), H]);
  expect(() => service.capture(failure, 'render', 'stack')).not.toThrow();
  expect(reads).toBeLessThanOrEqual(2);
  expect(onError).toHaveBeenCalledTimes(1);
  expect(onError.mock.calls[0][0].error).toBe(failure);
});

it('AM16 capture terminates when an index getter keeps appending', () => {
  const { service, onError, A, H } = createKnownCaptureService();
  const errors: unknown[] = [];
  let reads = 0;
  const get = (): unknown => {
    if (++reads > 16) throw new Error('append fuse');
    Object.defineProperty(errors, errors.length, { get, configurable: true });
    return A;
  };
  Object.defineProperty(errors, 0, { get, configurable: true });
  const failure = bundle([bundle(errors), H]);
  expect(() => service.capture(failure, 'render', 'stack')).not.toThrow();
  expect(reads).toBeLessThanOrEqual(1);
  expect(onError).toHaveBeenCalledTimes(1);
  expect(onError.mock.calls[0][0].error).toBe(failure);
});

it('AM16 capture rejects a bundle beyond the one-million element budget', () => {
  const { service, onError, A } = createKnownCaptureService();
  const failure = bundle(new Array(1_000_001).fill(A));
  expect(() => service.capture(failure, 'render', 'stack')).not.toThrow();
  expect(onError).toHaveBeenCalledTimes(1);
  expect(onError.mock.calls[0][0].error).toBe(failure);
});

it('AM16 capture shares the element budget across nested arrays', () => {
  const { service, onError, A } = createKnownCaptureService();
  const failure = bundle([
    bundle(new Array(600_000).fill(A)),
    bundle(new Array(600_000).fill(A)),
  ]);
  expect(() => service.capture(failure, 'render', 'stack')).not.toThrow();
  expect(onError).toHaveBeenCalledTimes(1);
  expect(onError.mock.calls[0][0].error).toBe(failure);
});
