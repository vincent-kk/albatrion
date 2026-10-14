import { createRef, useState } from 'react';

import { act, cleanup, render } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import { SetValueOption, ValidationMode } from '@/schema-form/core';

import { ErrorBoundedFormCore } from '../components/FormCore/ErrorBoundedFormCore';
import type { FormHandle } from '../components/FormCore/type';

afterEach(cleanup);

it.each([
  ['same schema', false, false],
  ['regenerated', true, false],
  ['validator', false, true],
] as const)(
  'WRITE-044 commit re-check preserves reset suppression (%s)',
  (_, replacement, changeValidator) => {
    const ref = createRef<FormHandle>();
    const schema = {
      type: 'object',
      properties: {
        a: { type: 'string' },
        filled: { type: 'string', default: 'automatic' },
      },
    } as const;
    let setDefault!: (value: { a: string }) => void;
    const firstValidator = {
      compile: () => () => null,
      compileGuard: () => () => true,
    };
    const secondValidator = { ...firstValidator };
    const App = () => {
      const [defaultValue, updateDefault] = useState({ a: '1' });
      setDefault = updateDefault;
      const jsonSchema =
        replacement && defaultValue.a === '2'
          ? { ...schema, title: 'replacement' }
          : schema;
      const validatorFactory = changeValidator
        ? defaultValue.a === '2'
          ? secondValidator
          : firstValidator
        : undefined;
      return (
        <ErrorBoundedFormCore
          ref={ref}
          jsonSchema={jsonSchema}
          defaultValue={defaultValue}
          validatorFactory={validatorFactory}
          validationMode={ValidationMode.None}
        >
          <span />
        </ErrorBoundedFormCore>
      );
    };
    render(<App />);
    const original = ref.current!.node;
    act(() => {
      setDefault({ a: '2' });
      ref.current!.reset(SetValueOption.DisableAutomaticWrites);
    });
    expect(ref.current!.getValue()).toEqual({ a: '2' });
    expect(ref.current!.node === original).toBe(
      !replacement && !changeValidator,
    );
  },
);

it.each([false, true])(
  'WRITE-015 LANDING-039 reset load options override the Form default (replacement: %s)',
  (replacement) => {
    const ref = createRef<FormHandle>();
    const schema = {
      type: 'object',
      properties: { filled: { type: 'string', default: 'automatic' } },
    } as const;
    const nextSchema = { ...schema, title: 'replacement' };
    const view = render(
      <ErrorBoundedFormCore
        ref={ref}
        jsonSchema={schema}
        defaultValue={{}}
        validationMode={ValidationMode.None}
      >
        <span />
      </ErrorBoundedFormCore>,
    );
    const original = ref.current!.node;
    view.rerender(
      <ErrorBoundedFormCore
        ref={ref}
        jsonSchema={replacement ? nextSchema : schema}
        defaultValue={{}}
        validationMode={ValidationMode.None}
      >
        <span />
      </ErrorBoundedFormCore>,
    );
    act(() => ref.current!.reset(SetValueOption.DisableAutomaticWrites));
    expect(ref.current!.getValue()).toEqual({});
    expect(ref.current!.node === original).toBe(!replacement);
    view.rerender(
      <ErrorBoundedFormCore
        ref={ref}
        jsonSchema={schema}
        defaultValue={{}}
        validationMode={ValidationMode.None}
      >
        <span />
      </ErrorBoundedFormCore>,
    );
    act(() => ref.current!.reset());
    expect(ref.current!.getValue()).toEqual({ filled: 'automatic' });

    view.rerender(
      <ErrorBoundedFormCore
        ref={ref}
        jsonSchema={replacement ? nextSchema : schema}
        defaultValue={{}}
        disableAutomaticWrites
        validationMode={ValidationMode.None}
      >
        <span />
      </ErrorBoundedFormCore>,
    );
    act(() => ref.current!.reset());
    expect(ref.current!.getValue()).toEqual({});
    view.rerender(
      <ErrorBoundedFormCore
        ref={ref}
        jsonSchema={schema}
        defaultValue={{}}
        disableAutomaticWrites
        validationMode={ValidationMode.None}
      >
        <span />
      </ErrorBoundedFormCore>,
    );
    act(() => ref.current!.reset(SetValueOption.EnableAutomaticWrites));
    expect(ref.current!.getValue()).toEqual({ filled: 'automatic' });

    view.rerender(
      <ErrorBoundedFormCore
        ref={ref}
        jsonSchema={replacement ? nextSchema : schema}
        defaultValue={{}}
        validationMode={ValidationMode.None}
      >
        <span />
      </ErrorBoundedFormCore>,
    );
    act(() =>
      ref.current!.reset(
        SetValueOption.DisableAutomaticWrites |
          SetValueOption.EnableAutomaticWrites,
      ),
    );
    expect(ref.current!.getValue()).toEqual({});
    view.rerender(
      <ErrorBoundedFormCore
        ref={ref}
        jsonSchema={schema}
        defaultValue={{}}
        validationMode={ValidationMode.None}
      >
        <span />
      </ErrorBoundedFormCore>,
    );
    act(() =>
      ref.current!.reset(
        (SetValueOption.Overwrite | SetValueOption.Merge) as Parameters<
          FormHandle['reset']
        >[0],
      ),
    );
    expect(ref.current!.getValue()).toEqual({ filled: 'automatic' });
  },
);
