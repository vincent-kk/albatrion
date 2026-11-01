import { createRef } from 'react';

import { plugin as ajv6 } from '@canard/schema-form-ajv6-plugin';
import { plugin as ajv7 } from '@canard/schema-form-ajv7-plugin';
import { plugin as ajv8 } from '@canard/schema-form-ajv8-plugin';
import { act, cleanup, render } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';

import { createDuplicateIdValidator } from '@/schema-form/__tests__/fixtures/createDuplicateIdValidator';
import { Form, type FormHandle } from '@/schema-form/components/Form';
import * as core from '@/schema-form/core';
import type { BlueprintSchema } from '@/schema-form/core/engine/blueprint';
import { readValidationEntry } from '@/schema-form/core/engine/validation/utils/cache/readValidationEntry';
import { releaseValidationRoot } from '@/schema-form/core/engine/validation/utils/lifetime/releaseValidationRoot';
import { retainValidationRoot } from '@/schema-form/core/engine/validation/utils/lifetime/retainValidationRoot';
import { FormErrorCode, type FormErrorRecord } from '@/schema-form/errors';

/** Slot delivery is captured at the existing core scheduling boundary. */
const slots: (() => void)[] = [];
beforeEach(() => {
  slots.length = 0;
  vi.spyOn(core, 'scheduleValidationSlot').mockImplementation((callback) => {
    slots.push(callback);
  });
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

/** Drain this load generation and its validation promise continuations. */
const releaseSlots = async () => {
  await act(async () => {
    for (const callback of slots.splice(0)) callback();
    await Promise.resolve();
  });
};

it('DR-1 B3 ignores an unmounted-run pin for a same-id replacement after commit', async () => {
  const ref = createRef<FormHandle>();
  const onError = vi.fn();
  const host = vi.fn();
  vi.stubGlobal('reportError', host);
  const registered: BlueprintSchema[] = [];
  let settle: () => void = () => {};
  const validator = {
    compile: (copy: BlueprintSchema) => {
      if (registered.length) throw new Error('schema with key already exists');
      registered.push(copy);
      if (typeof copy === 'object' && copy !== null && copy.type === 'string')
        return () =>
          new Promise<[]>((resolve) => {
            settle = () => resolve([]);
          });
      return () => [];
    },
    compileGuard: () => () => true,
    release: (copy: BlueprintSchema) => {
      const index = registered.indexOf(copy);
      if (index >= 0) registered.splice(index, 1);
    },
  };
  const first = { $id: 'urn:dr1-b3', type: 'string' } as const;
  const next = { $id: 'urn:dr1-b3', type: 'number' } as const;
  const view = render(
    <Form
      ref={ref}
      jsonSchema={first}
      validatorFactory={validator}
      validationMode={core.ValidationMode.OnRequest}
      onError={onError}
    >
      <span />
    </Form>,
  );
  await releaseSlots();
  const pending = ref.current!.validate();
  view.rerender(
    <Form
      ref={ref}
      jsonSchema={next}
      validatorFactory={validator}
      validationMode={core.ValidationMode.OnRequest}
      onError={onError}
    >
      <span />
    </Form>,
  );
  act(() => ref.current!.reset());
  await releaseSlots();
  await act(async () => {
    settle();
    await pending;
  });
  expect(
    onError.mock.calls.filter(
      ([record]) => record.code === FormErrorCode.ValidatorCompileFailed,
    ),
  ).toHaveLength(0);
  await expect(ref.current!.validate()).resolves.toEqual([]);
  expect(host).not.toHaveBeenCalled();
});

it('DR-1 pins an unmounted load verdict across nine unrelated root releases', async () => {
  let resolve: () => void = () => {
    throw new Error('verdict did not start');
  };
  let held: BlueprintSchema;
  const started = vi.fn();
  const release = vi.fn((_copy: BlueprintSchema) => {});
  const validator = {
    compile: (copy: BlueprintSchema) => {
      if (typeof copy === 'object' && copy !== null && copy.title === 'held') {
        held = copy;
        return async () => {
          started();
          await new Promise<void>((done) => {
            resolve = done;
          });
          if (release.mock.calls.some(([released]) => released === copy))
            throw new Error('released mid-run');
          return [];
        };
      }
      return () => [];
    },
    compileGuard: () => () => true,
    release,
  };
  const onError = vi.fn();
  const host = vi.fn();
  vi.stubGlobal('reportError', host);
  const view = render(
    <Form
      jsonSchema={{ type: 'string', title: 'held' }}
      validatorFactory={validator}
      onError={onError}
    >
      <span />
    </Form>,
  );
  view.unmount();
  await releaseSlots();
  expect(started).toHaveBeenCalledOnce();
  for (let index = 0; index < 9; index++) {
    const root = { type: 'string', title: `other-${index}` };
    retainValidationRoot(validator, root);
    readValidationEntry(validator, root);
    releaseValidationRoot(validator, root);
  }
  const releasedBeforeSettle = release.mock.calls.some(
    ([copy]) => copy === held!,
  );
  await act(async () => {
    resolve();
  });
  expect.soft(releasedBeforeSettle).toBe(false);
  expect(onError).not.toHaveBeenCalled();
  expect(host).not.toHaveBeenCalled();
});

it.each([false, true])(
  'DR-2 forwards the slot failure then bundled handler errors (handler throws=%s)',
  async (throws) => {
    const host = vi.fn();
    vi.stubGlobal('reportError', host);
    const consumerFailure = new Error('onError consumer');
    const onError = vi.fn((_record: FormErrorRecord) => {
      if (throws) throw consumerFailure;
    });
    const crash = new Error('validator run');
    render(
      <Form
        jsonSchema={{ type: 'string' }}
        onError={onError}
        validatorFactory={{
          compile: () => () => {
            throw crash;
          },
          compileGuard: () => () => true,
        }}
      >
        <span />
      </Form>,
    );
    await releaseSlots();
    expect(onError).toHaveBeenCalledOnce();
    const original = onError.mock.calls[0][0];
    expect(original).toMatchObject({
      code: FormErrorCode.ValidatorThrew,
      origin: 'validate',
    });
    expect(host.mock.calls.map(([error]) => error)).toEqual(
      throws ? [original.error, consumerFailure] : [original.error],
    );
  },
);

it.each([
  ['double', undefined],
  ['ajv6', ajv6.validator],
  ['ajv7', ajv7.validator],
  ['ajv8', ajv8.validator],
] as const)(
  'DR-3 rebuilds an if-gated same-id schema and preserves guard evaluation (%s)',
  async (name, shipped) => {
    const double = createDuplicateIdValidator();
    const validator = shipped ?? double.validator;
    const ref = createRef<FormHandle>();
    const onError = vi.fn();
    const host = vi.fn();
    vi.stubGlobal('reportError', host);
    const schema = {
      $id: `urn:dr3:${name}`,
      type: 'object',
      properties: { flag: { type: 'boolean' } },
      if: { properties: { flag: { const: true } }, required: ['flag'] },
      then: { properties: { gated: { type: 'string' } } },
    } as const;
    const view = render(
      <Form
        ref={ref}
        jsonSchema={schema}
        defaultValue={{ flag: true }}
        validatorFactory={validator}
        onError={onError}
      >
        <span />
      </Form>,
    );
    await releaseSlots();
    const previous = ref.current!.node;
    view.rerender(
      <Form
        ref={ref}
        jsonSchema={{ ...schema, title: 'replacement' }}
        defaultValue={{ flag: true }}
        validatorFactory={validator}
        onError={onError}
      >
        <span />
      </Form>,
    );
    act(() => ref.current!.rebuild());
    expect(ref.current!.node).not.toBe(previous);
    await releaseSlots();
    await act(async () => {
      await expect(ref.current!.validate()).resolves.toEqual([]);
    });
    expect(ref.current!.findNode('/gated')).not.toBeNull();
    act(() => ref.current!.findNode('/flag')!.setValue(false));
    expect(ref.current!.findNode('/gated')).toBeNull();
    expect(onError).not.toHaveBeenCalled();
    expect(host).not.toHaveBeenCalled();
    if (name === 'double') expect(double.compileGuard).toHaveBeenCalled();
  },
);
