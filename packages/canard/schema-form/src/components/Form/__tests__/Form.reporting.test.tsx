import { createRef } from 'react';

import {
  act,
  cleanup,
  fireEvent,
  render,
  waitFor,
} from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import { ValidationMode } from '@/schema-form/core';

import { ErrorBoundedFormCore } from '../components/FormCore/ErrorBoundedFormCore';
import type { FormHandle } from '../components/FormCore/type';

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

it('ERROR-026 excludes schema-validation submission results from onError', async () => {
  const sink = vi.fn();
  vi.stubGlobal('reportError', sink);
  const onError = vi.fn();
  const validatorFactory = {
    compile: () => () => [
      { dataPath: '', keyword: 'required', message: 'required' },
    ],
    compileGuard: () => () => true,
  };
  const view = render(
    <ErrorBoundedFormCore
      jsonSchema={{ type: 'string' }}
      validatorFactory={validatorFactory}
      validationMode={ValidationMode.OnRequest}
      onError={onError}
    >
      <span />
    </ErrorBoundedFormCore>,
  );
  fireEvent.submit(view.container.querySelector('form')!);
  await waitFor(() => expect(sink).toHaveBeenCalledOnce());
  expect(onError).not.toHaveBeenCalled();
});

it('ERROR-028 propagates a core observer exception at the caller boundary', () => {
  const sink = vi.fn();
  vi.stubGlobal('reportError', sink);
  const observerError = new Error('observer');
  const ref = createRef<FormHandle>();
  render(
    <ErrorBoundedFormCore
      ref={ref}
      jsonSchema={{ type: 'number' }}
      validationMode={ValidationMode.None}
      onError={() => {
        throw observerError;
      }}
    >
      <span />
    </ErrorBoundedFormCore>,
  );
  expect(() => act(() => ref.current!.setValue('invalid'))).toThrow(
    observerError,
  );
  expect(ref.current!.getValue()).toBe('invalid');
  expect(sink).not.toHaveBeenCalled();
});
