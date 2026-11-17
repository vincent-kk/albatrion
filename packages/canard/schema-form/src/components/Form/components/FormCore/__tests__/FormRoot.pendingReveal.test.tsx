import { createRef, startTransition, useState } from 'react';

import { act, cleanup, render } from '@testing-library/react';
import { flushSync } from 'react-dom';
import { afterEach, expect, it } from 'vitest';

import { ValidationMode } from '@/schema-form/core';
import { ErrorVisibility, type FieldRendererProps } from '@/schema-form/types';

import { FormCore } from '../FormCore';
import type { FormHandle } from '../types/handle';

afterEach(cleanup);

const validator = { compile: () => () => [], compileGuard: () => () => true };
const errors = [{ dataPath: '', message: 'required' }];
const Renderer = ({
  Input,
  errorVisible,
  errorMessage,
}: FieldRendererProps) => (
  <>
    <Input />
    <output data-testid="visible">{String(errorVisible)}</output>
    <output data-testid="error">{errorMessage}</output>
  </>
);

it('a pending reveal cannot cross committed A to B to A policy changes', () => {
  const ref = createRef<FormHandle>();
  let setPolicy!: (value: ErrorVisibility) => void;
  const Host = () => {
    const [policy, set] = useState(ErrorVisibility.Never);
    setPolicy = set;
    return (
      <FormCore
        ref={ref}
        jsonSchema={{ type: 'string' }}
        validatorFactory={validator}
        validationMode={ValidationMode.OnRequest}
        FieldRenderer={Renderer}
        errorVisibility={policy}
        errors={errors}
      />
    );
  };
  const view = render(<Host />);
  act(() => {
    startTransition(() => ref.current!.revealErrors());
    flushSync(() => setPolicy(ErrorVisibility.AfterTouch));
    expect(view.getByTestId('visible').textContent).toBe('false');
    flushSync(() => setPolicy(ErrorVisibility.Never));
    expect(view.getByTestId('visible').textContent).toBe('false');
  });
  expect(view.getByTestId('error').textContent).toBe('');
});
