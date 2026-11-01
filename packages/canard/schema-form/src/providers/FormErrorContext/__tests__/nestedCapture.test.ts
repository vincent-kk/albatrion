import { expect, it, vi } from 'vitest';

import { FormErrorCode, SchemaFormError } from '@/schema-form/errors';

import { createCyclicCaptureFailure } from './helpers/createCyclicCaptureFailure';
import { createKnownCaptureService } from './helpers/createKnownCaptureService';

/** Construct a candidate error bundle without normalizing its elements. */
const bundle = (errors: readonly unknown[]) =>
  new SchemaFormError(FormErrorCode.MultipleErrors, 'nested', { errors });

it('DR-16 guard [all bundles known] captures an unseen inner leaf once', () => {
  const { service, onError, A, H } = createKnownCaptureService();
  const failure = bundle([bundle([A, new Error('unseen')]), H]);
  service.capture(failure, 'render', 'stack');
  expect(onError).toHaveBeenCalledExactlyOnceWith(
    expect.objectContaining({
      error: failure,
      code: FormErrorCode.RenderFailed,
    }),
  );
});

it.each([
  ['empty', []],
  ['sparse', new Array(1)],
] as const)(
  'DR-16 guard [dense nonempty] captures an inner %s bundle',
  (_label, errors) => {
    const { service, onError, H } = createKnownCaptureService();
    const failure = bundle([bundle(errors), H]);
    service.capture(failure, 'render', 'stack');
    expect(onError).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({ error: failure }),
    );
  },
);

it('DR-16 guard [own indices] captures an inherited inner index', () => {
  const { service, onError, A, H } = createKnownCaptureService();
  const errors = new Array(1);
  Object.setPrototypeOf(errors, { 0: A });
  const failure = bundle([bundle(errors), H]);
  service.capture(failure, 'render', 'stack');
  expect(onError).toHaveBeenCalledExactlyOnceWith(
    expect.objectContaining({ error: failure }),
  );
});

it('DR-16 guard [revisit known; no visited set] captures an outer cycle and terminates', () => {
  const { service, onError, A } = createKnownCaptureService();
  const onRead = vi.fn();
  const failure = createCyclicCaptureFailure(A, onRead);
  expect(() => service.capture(failure, 'render', 'stack')).not.toThrow();
  expect(onRead.mock.calls.length).toBeLessThan(128);
  expect(onError).toHaveBeenCalledExactlyOnceWith(
    expect.objectContaining({ error: failure }),
  );
});

it('DR-16 guard [revisit known; no visited set] captures an inner cycle and terminates', () => {
  const { service, onError, A } = createKnownCaptureService();
  const onRead = vi.fn();
  const failure = bundle([createCyclicCaptureFailure(A, onRead)]);
  expect(() => service.capture(failure, 'render', 'stack')).not.toThrow();
  expect(onRead.mock.calls.length).toBeLessThan(128);
  expect(onError).toHaveBeenCalledExactlyOnceWith(
    expect.objectContaining({ error: failure }),
  );
});

it('DR-16 guard [duck-type nested bundles] captures a plain nested lookalike', () => {
  const { service, onError, A, B, H } = createKnownCaptureService();
  const failure = bundle([
    { code: FormErrorCode.MultipleErrors, details: { errors: [A, B] } },
    H,
  ]);
  service.capture(failure, 'render', 'stack');
  expect(onError).toHaveBeenCalledExactlyOnceWith(
    expect.objectContaining({ error: failure }),
  );
});

it('DR-16 guard [revisit known] captures a shared nested instance', () => {
  const { service, onError, A } = createKnownCaptureService();
  const shared = bundle([A]);
  const failure = bundle([shared, shared]);
  service.capture(failure, 'render', 'stack');
  expect(onError).toHaveBeenCalledExactlyOnceWith(
    expect.objectContaining({ error: failure }),
  );
});

it.each([null, undefined, 'primitive', 1])(
  'DR-16 guard [known objects] captures an inner primitive %s',
  (value) => {
    const { service, onError, A, H } = createKnownCaptureService();
    const failure = bundle([bundle([A, value]), H]);
    service.capture(failure, 'render', 'stack');
    expect(onError).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({ error: failure }),
    );
  },
);

it('DR-16 red deep known nesting neither throws nor reports', () => {
  const { service, onError, A } = createKnownCaptureService();
  let failure = bundle([A]);
  for (let depth = 0; depth < 50000; depth++) failure = bundle([failure]);
  expect(() => service.capture(failure, 'render', 'stack')).not.toThrow();
  expect(onError.mock.calls.length).toBe(0);
});

it('DR-16 guard [recursive details.errors] captures a prototype-only instance without throwing', () => {
  const { service, onError, H } = createKnownCaptureService();
  const bare: SchemaFormError = Object.create(SchemaFormError.prototype);
  Object.defineProperty(bare, 'code', { value: FormErrorCode.MultipleErrors });
  const failure = bundle([bare, H]);
  expect(() => service.capture(failure, 'render', 'stack')).not.toThrow();
  expect(onError).toHaveBeenCalledExactlyOnceWith(
    expect.objectContaining({ error: failure }),
  );
});

it('DR-16 red recognizes a known nested SchemaFormError subclass on load', () => {
  const { service, onError, A, B, H } = createKnownCaptureService();
  class NestedFailure extends SchemaFormError {}
  service.capture(
    bundle([
      new NestedFailure(FormErrorCode.MultipleErrors, 'subclass', {
        errors: [A, B],
      }),
      H,
    ]),
    'load',
  );
  expect(onError).not.toHaveBeenCalled();
});
