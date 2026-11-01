import { StrictMode, createRef } from 'react';

import { act, cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, expect, inject, it, vi } from 'vitest';

import {
  Form,
  FormErrorCode,
  type FormHandle,
  type FormProps,
  FormWarningCode,
  ValidationMode,
} from '@/schema-form';

import { createValidationFrameClock } from '../helpers/createValidationFrameClock';
import { observeErrorSink } from '../helpers/observeErrorSink';
import { renderLegacyOrigin } from '../helpers/renderLegacyOrigin';

// Public Form callbacks are the observation boundary for every origin.
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

const assertRecords = (
  onError: ReturnType<typeof vi.fn<NonNullable<FormProps['onError']>>>,
  origin: string,
  code: string,
) => {
  expect(
    onError.mock.calls.map(([record]) => ({
      code: record.code,
      origin: record.origin,
    })),
  ).toEqual([{ code, origin }]);
  for (const [record] of onError.mock.calls) {
    expect(record).toHaveProperty('origin');
    expect(record).not.toHaveProperty('surface');
    expect(record).not.toHaveProperty('aggregate');
  }
};

it('T1 T3 construction warnings carry load and no exposure fields', () => {
  const onError = vi.fn<NonNullable<FormProps['onError']>>();
  render(
    <Form
      jsonSchema={{ type: 'number' }}
      defaultValue="bad"
      validationMode={ValidationMode.None}
      onError={onError}
    />,
  );
  assertRecords(onError, 'load', FormWarningCode.Misfit);
});

it('T1 T3 public write listener errors carry write', () => {
  const ref = createRef<FormHandle>();
  const onError = vi.fn<NonNullable<FormProps['onError']>>();
  render(
    <Form
      ref={ref}
      jsonSchema={{ type: 'string' }}
      validationMode={ValidationMode.None}
      onError={onError}
    />,
  );
  const failure = new Error('write listener');
  ref.current!.node!.subscribe(() => {
    throw failure;
  });
  onError.mockClear();
  act(() => {
    expect(() => ref.current!.setValue('next')).toThrow(failure);
  });
  assertRecords(onError, 'write', FormErrorCode.ListenerThrew);
});

it('T1 T3 throwing onChange carries write', () => {
  const ref = createRef<FormHandle>();
  const onError = vi.fn<NonNullable<FormProps['onError']>>();
  const failure = new Error('onChange');
  render(
    <Form
      ref={ref}
      jsonSchema={{ type: 'string' }}
      validationMode={ValidationMode.None}
      onError={onError}
      onChange={() => {
        throw failure;
      }}
    />,
  );
  onError.mockClear();
  act(() => {
    expect(() => ref.current!.setValue('next')).toThrow(failure);
  });
  assertRecords(onError, 'write', FormErrorCode.ListenerThrew);
});

it('T1 T3 explicit whole-schema compile failure carries validate', async () => {
  createValidationFrameClock();
  const ref = createRef<FormHandle>();
  const onError = vi.fn<NonNullable<FormProps['onError']>>();
  render(
    <Form
      ref={ref}
      jsonSchema={{ type: 'string' }}
      onError={onError}
      validatorFactory={{
        compile: () => {
          throw new Error('compile');
        },
        compileGuard: () => () => true,
      }}
    />,
  );
  onError.mockClear();
  await act(async () => {
    await expect(ref.current!.validate()).rejects.toMatchObject({
      code: FormErrorCode.ValidatorCompileFailed,
    });
  });
  assertRecords(onError, 'validate', FormErrorCode.ValidatorCompileFailed);
});

it('T1 T3 automatic load-slot compile failure carries validate', async () => {
  const clock = createValidationFrameClock();
  observeErrorSink();
  const onError = vi.fn<NonNullable<FormProps['onError']>>();
  render(
    <Form
      jsonSchema={{ type: 'string' }}
      onError={onError}
      validatorFactory={{
        compile: () => {
          throw new Error('slot compile');
        },
        compileGuard: () => () => true,
      }}
    />,
  );
  onError.mockClear();
  await act(async () => {
    clock.frame();
    await vi.runOnlyPendingTimersAsync();
    await clock.task();
  });
  assertRecords(onError, 'validate', FormErrorCode.ValidatorCompileFailed);
});

it('T1 T3 native submit owns SubmitWhileDegraded', async () => {
  createValidationFrameClock();
  observeErrorSink();
  const onError = vi.fn<NonNullable<FormProps['onError']>>();
  const view = render(
    <Form
      jsonSchema={{
        type: 'string',
        controls: { derived: '(() => { throw new Error("derive") })()' },
      }}
      validationMode={ValidationMode.None}
      onError={onError}
    />,
  );
  onError.mockClear();
  await act(async () => {
    fireEvent.submit(view.container.querySelector('form')!);
    await Promise.resolve();
  });
  assertRecords(onError, 'submit', FormErrorCode.SubmitWhileDegraded);
});

it('T1 T3 render boundary owns render and preserves error identity', () => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
  const failure = new Error('renderer');
  const onError = vi.fn<NonNullable<FormProps['onError']>>();
  const Renderer = (): never => {
    throw failure;
  };
  render(
    <Form
      jsonSchema={{ type: 'string' }}
      validationMode={ValidationMode.None}
      FieldRenderer={Renderer}
      onError={onError}
    />,
  );
  assertRecords(onError, 'render', FormErrorCode.RenderFailed);
  expect(onError.mock.calls[0][0].error).toBe(failure);
});

it.each(['mount', 'reset', 'rebuild'] as const)(
  'round b StrictMode %s reports exactly one load warning',
  (operation) => {
    const ref = createRef<FormHandle>();
    const onError = vi.fn<NonNullable<FormProps['onError']>>();
    onError.mockClear();
    render(
      <StrictMode>
        <Form
          ref={ref}
          jsonSchema={{ type: 'number' }}
          defaultValue="bad"
          validationMode={ValidationMode.None}
          onError={onError}
        />
      </StrictMode>,
    );
    if (operation !== 'mount') {
      onError.mockClear();
      act(() => ref.current![operation]());
    }
    assertRecords(onError, 'load', FormWarningCode.Misfit);
  },
);

it('round b React 18 legacy-root mount has exact operation records', (context) => {
  if (inject('reactMajor') !== '18') context.skip();
  const { onError } = renderLegacyOrigin();
  assertRecords(onError, 'load', FormWarningCode.Misfit);
});

it('round b React 18 legacy-root reset has exact operation records', (context) => {
  if (inject('reactMajor') !== '18') context.skip();
  const { ref, onError } = renderLegacyOrigin();
  onError.mockClear();
  act(() => ref.current!.reset());
  assertRecords(onError, 'load', FormWarningCode.Misfit);
});

it('round b React 18 legacy-root write has exact operation records', (context) => {
  if (inject('reactMajor') !== '18') context.skip();
  const { ref, onError } = renderLegacyOrigin();
  const failure = new Error('legacy write');
  ref.current!.node!.subscribe(() => {
    throw failure;
  });
  onError.mockClear();
  act(() => {
    expect(() => ref.current!.setValue(3)).toThrow(failure);
  });
  assertRecords(onError, 'write', FormErrorCode.ListenerThrew);
});
