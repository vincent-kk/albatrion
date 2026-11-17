import { createRef, useLayoutEffect, useState } from 'react';

import { act, cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, beforeEach, expect, inject, it, vi } from 'vitest';

import { createValidationFrameClock } from '@/schema-form/__tests__/helpers/createValidationFrameClock';
import * as core from '@/schema-form/core';
import type { FieldRendererProps } from '@/schema-form/types';
import { ErrorVisibility } from '@/schema-form/types';

import { FormCore } from '../FormCore';
import type { FormHandle } from '../types/handle';

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
  vi.useRealTimers();
  vi.unstubAllGlobals();
});
const releaseSlots = async () => {
  await act(async () => {
    for (const callback of slots.splice(0)) callback();
  });
};

it.each([false, true])(
  'native failure/verdict from the old epoch is silent (failure=%s)',
  async (failure) => {
    const ref = createRef<FormHandle>();
    const host = vi.fn();
    vi.stubGlobal('reportError', host);
    const onError = vi.fn(),
      onValidate = vi.fn();
    let resolve!: (issues: { dataPath: string; message: string }[]) => void;
    let reject!: (error: unknown) => void;
    const validator = {
      compile: () => () =>
        new Promise<{ dataPath: string; message: string }[]>((yes, no) => {
          resolve = yes;
          reject = no;
        }),
      compileGuard: () => () => true,
    };
    const schema = { type: 'string' } as const;
    const form = (validationMode: core.ValidationMode) => (
      <FormCore
        ref={ref}
        jsonSchema={schema}
        validationMode={validationMode}
        validatorFactory={validator}
        onError={onError}
        onValidate={onValidate}
      >
        <button type="submit">submit</button>
      </FormCore>
    );
    const view = render(form(core.ValidationMode.OnRequest));
    await releaseSlots();
    fireEvent.submit(view.container.querySelector('form')!);
    view.rerender(form(core.ValidationMode.None));
    onValidate.mockClear();
    await act(async () => {
      failure
        ? reject(new Error('old native failure'))
        : resolve([{ dataPath: '', message: 'old invalid' }]);
    });
    expect(onError).not.toHaveBeenCalled();
    expect(host).not.toHaveBeenCalled();
    expect(onValidate).not.toHaveBeenCalled();
    expect(ref.current!.getErrors()).toEqual([]);
  },
);

it.skipIf(inject('reactMajor') !== '18')(
  'legacy release → layout mode switch cannot deliver the discarded verdict',
  async () => {
    createValidationFrameClock();
    const ref = createRef<FormHandle>();
    const onValidate = vi.fn();
    let switchMode!: () => void;
    let armed = false;
    const Renderer = ({
      Input,
      errorVisible,
      errorMessage,
    }: FieldRendererProps) => {
      useLayoutEffect(() => {
        if (armed && errorVisible) {
          armed = false;
          switchMode();
        }
      }, [errorVisible]);
      return (
        <>
          <Input />
          <span>{errorVisible ? errorMessage : ''}</span>
        </>
      );
    };
    const validator = {
      compile: () => () => [{ dataPath: '', message: 'invalid' }],
      compileGuard: () => () => true,
    };
    const schema = { type: 'string' } as const;
    const App = () => {
      const [mode, setMode] = useState(core.ValidationMode.OnChange);
      switchMode = () => setMode(core.ValidationMode.None);
      return (
        <FormCore
          ref={ref}
          jsonSchema={schema}
          validationMode={mode}
          validatorFactory={validator}
          onValidate={onValidate}
          FieldRenderer={Renderer}
          errorVisibility={ErrorVisibility.AfterTouch}
          formatError={(issue) => issue.message ?? null}
        />
      );
    };
    const view = render(<App />, { legacyRoot: true });
    await releaseSlots();
    onValidate.mockClear();
    armed = true;
    act(() =>
      ref.current!.node!.setState({ [core.FieldNodeState.Touched]: true }),
    );
    await act(async () => {
      await ref.current!.validate();
    });
    expect(armed).toBe(false);
    expect(ref.current!.getErrors()).toEqual([]);
    expect(view.queryByText('invalid')).toBeNull();
    expect(onValidate.mock.calls.map(([errors]) => errors)).not.toContainEqual([
      { dataPath: '', message: 'invalid' },
    ]);
  },
);

it.skipIf(inject('reactMajor') !== '18')(
  'legacy native reveal rechecks the epoch even when the next mode keeps errors',
  async () => {
    const ref = createRef<FormHandle>();
    let setMode!: (mode: core.ValidationMode) => void;
    let armed = false;
    const Renderer = ({ Input, errorVisible }: FieldRendererProps) => {
      useLayoutEffect(() => {
        if (armed && errorVisible) {
          armed = false;
          setMode(core.ValidationMode.OnChange);
        }
      }, [errorVisible]);
      return <Input />;
    };
    const validator = {
      compile: () => () => [{ dataPath: '', message: 'invalid' }],
      compileGuard: () => () => true,
    };
    const schema = { type: 'string' } as const;
    const App = () => {
      const [mode, set] = useState(core.ValidationMode.OnRequest);
      setMode = set;
      return (
        <FormCore
          ref={ref}
          jsonSchema={schema}
          validationMode={mode}
          validatorFactory={validator}
          FieldRenderer={Renderer}
          errorVisibility={ErrorVisibility.AfterTouch}
        />
      );
    };
    const view = render(<App />, { legacyRoot: true });
    await releaseSlots();
    const request = vi.spyOn(ref.current!.node!, 'request');
    armed = true;
    await act(async () => {
      fireEvent.submit(view.container.querySelector('form')!);
    });
    expect(armed).toBe(false);
    expect(
      request.mock.calls.filter(
        ([kind]) => kind === core.FieldNodeRequestType.Focus,
      ),
    ).toHaveLength(0);
  },
);

it('native rejection after a same-root reset still reports once to onError and the host', async () => {
  const ref = createRef<FormHandle>();
  const host = vi.fn(),
    onError = vi.fn();
  vi.stubGlobal('reportError', host);
  let reject!: (failure: unknown) => void;
  const validator = {
    compile: () => () =>
      new Promise<[]>((_, fail) => {
        reject = fail;
      }),
    compileGuard: () => () => true,
  };
  const view = render(
    <FormCore
      ref={ref}
      jsonSchema={{ type: 'string' }}
      validationMode={core.ValidationMode.OnRequest}
      validatorFactory={validator}
      onError={onError}
    >
      <button type="submit">submit</button>
    </FormCore>,
  );
  await releaseSlots();
  const root = ref.current!.node;
  fireEvent.submit(view.container.querySelector('form')!);
  act(() => ref.current!.reset());
  expect(ref.current!.node).toBe(root);
  await act(async () => {
    reject(new Error('same-root native failure'));
  });
  expect(onError).toHaveBeenCalledOnce();
  expect(host).toHaveBeenCalledOnce();
});
