import { createRef } from 'react';

import { act, cleanup, render } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import {
  type FieldInputProps,
  type FieldRendererProps,
  Form,
  type FormHandle,
} from '@/schema-form';

import { advanceValidationFrame } from '../helpers/advanceValidationFrame';
import { settleValidation } from '../helpers/settleValidation';

afterEach(cleanup);
const Input = ({ errorVisible }: FieldInputProps) => (
  <span data-testid="input-visibility">{String(errorVisible)}</span>
);
const Renderer = ({
  Input,
  errorVisible,
  errorMessage,
}: FieldRendererProps) => (
  <>
    <Input />
    <span data-testid="error">{errorVisible ? errorMessage : null}</span>
  </>
);

it.each([true, false])(
  'IR-6 pending remount retains baseline eligibility (previously visible=%s)',
  async (visible) => {
    const ref = createRef<FormHandle>();
    let finish!: (issues: readonly []) => void;
    const view = render(
      <Form
        ref={ref}
        jsonSchema={{ type: 'string' }}
        defaultValue="old"
        FieldRenderer={Renderer}
        fieldInputMap={{ '': Input }}
        formatError={(error) => error.message ?? null}
        validatorFactory={{
          compile: () => (value) =>
            value === 'old'
              ? [{ dataPath: '', message: 'old error' }]
              : new Promise<readonly []>((resolve) => {
                  finish = resolve;
                }),
          compileGuard: () => () => true,
        }}
      />,
    );
    await settleValidation(() => ref.current?.node);
    if (visible) {
      act(() => ref.current!.showError());
      await advanceValidationFrame();
    }
    act(() => {
      ref.current!.setValue('new');
      if (!visible) ref.current!.showError();
    });
    expect(view.getByTestId('input-visibility').textContent).toBe(
      String(visible),
    );
    act(() => ref.current!.remount(''));
    expect(view.getByTestId('input-visibility').textContent).toBe(
      String(visible),
    );
    expect(view.getByTestId('error').textContent).toBe(
      visible ? 'old error' : '',
    );
    await advanceValidationFrame();
    await act(async () => {
      finish([]);
    });
    await settleValidation(() => ref.current?.node);
    expect(view.getByTestId('error').textContent).toBe('');
  },
);
