import { createRef } from 'react';

import { act, cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import {
  type FieldInputProps,
  type FieldRendererProps,
  Form,
  type FormHandle,
  ShowError,
} from '@/schema-form';

import { createValidationFrameClock } from '../helpers/createValidationFrameClock';
import { settleValidation } from '../helpers/settleValidation';

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});
it.each([false, true])(
  'IR-6 H Edited resetInteraction never displays too short beneath abc (pending ErrorVisible toggle=%s)',
  async (toggle) => {
    const ref = createRef<FormHandle>();
    let slow = false;
    const finishes: ((
      issues: readonly { dataPath: string; message: string }[],
    ) => void)[] = [];
    const Text = ({ value, onChange }: FieldInputProps) => (
      <input
        aria-label="a"
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
      />
    );
    const Branch = ({ ChildFields }: FieldInputProps) => (
      <>
        {ChildFields.map((Child) => (
          <Child key={Child.key} />
        ))}
      </>
    );
    const Renderer = ({
      Input,
      path,
      errorVisible,
      errorMessage,
    }: FieldRendererProps) => (
      <>
        <Input />
        <span data-testid={'error' + path}>
          {errorVisible ? errorMessage : ''}
        </span>
      </>
    );
    const view = render(
      <Form
        ref={ref}
        jsonSchema={{
          type: 'object',
          properties: {
            kind: { type: 'boolean' },
            a: {
              type: 'string',
              minLength: 3,
              controls: { resetInteraction: '../kind' },
            },
          },
        }}
        defaultValue={{ kind: false, a: 'a' }}
        showError={ShowError.Edited}
        FieldRenderer={Renderer}
        fieldInputDefinitions={[
          { test: { type: 'object' }, Component: Branch },
          { test: { type: 'string' }, Component: Text },
          { test: () => true, Component: () => null },
        ]}
        validatorFactory={{
          compileGuard: () => () => true,
          compile: () => (value: unknown) => {
            const issues =
              (value as { a: string }).a.length < 3
                ? [{ dataPath: '/a', message: 'too short' }]
                : [];
            return slow
              ? new Promise<readonly { dataPath: string; message: string }[]>(
                  (resolve) => finishes.push(resolve),
                )
              : issues;
          },
        }}
        formatError={(e) => e.message ?? null}
      />,
    );
    await settleValidation(() => ref.current?.node);
    const clock = createValidationFrameClock();
    fireEvent.change(view.getByLabelText('a'), { target: { value: 'ab' } });
    await act(async () => {
      clock.frame();
      await clock.task();
    });
    expect(view.getByTestId('error/a').textContent).toBe('too short');
    slow = true;
    act(() => ref.current!.findNode('/kind')!.setValue(true));
    expect(ref.current!.findNode('/a')!.state[1]).toBeFalsy();
    fireEvent.change(view.getByLabelText('a'), { target: { value: 'abc' } });
    expect((view.getByLabelText('a') as HTMLInputElement).value).toBe('abc');
    expect(ref.current!.findNode('/a')!.state[1]).toBe(true);
    if (toggle) {
      act(() => ref.current!.findNode('/a')!.setState({ 4: false }));
      act(() => ref.current!.findNode('/a')!.setState({ 4: true }));
    }
    expect(view.getByTestId('error/a').textContent).toBe('');
    await act(async () => {
      clock.frame();
      await clock.task();
    });
    expect(view.getByTestId('error/a').textContent).toBe('');
    await act(async () => {
      clock.frame();
      await clock.task();
    });
    expect(view.getByTestId('error/a').textContent).toBe('');
    expect(finishes.length).toBeGreaterThan(0);
    await act(async () => {
      finishes[finishes.length - 1]([]);
      await clock.task();
    });
    expect(view.getByTestId('error/a').textContent).toBe('');
  },
);
