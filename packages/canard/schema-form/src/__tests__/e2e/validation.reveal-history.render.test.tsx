import {
  Suspense,
  createRef,
  startTransition,
  useLayoutEffect,
  useState,
} from 'react';

import { act, cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import {
  type FieldInputProps,
  type FieldRendererProps,
  Form,
  type FormHandle,
  FormProvider,
  ShowError,
  useChildFieldErrors,
} from '@/schema-form';

import { createValidationFrameClock } from '../helpers/createValidationFrameClock';
import { readFieldNodeRuntime } from '../helpers/readFieldNodeRuntime';
import { settleValidation } from '../helpers/settleValidation';

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});
const Renderer = ({
  Input,
  errorVisible,
  errorMessage,
}: FieldRendererProps) => (
  <>
    <Input />
    <span data-testid="error">{errorVisible ? errorMessage : ''}</span>
  </>
);
const Input = () => <input aria-label="field" />;
type Issue = { dataPath: string; message: string };
const fixture = async (showError: boolean | ShowError = true) => {
  const ref = createRef<FormHandle>();
  let slow = false;
  const finishes: ((issues: readonly Issue[]) => void)[] = [];
  const validator = {
    compileGuard: () => () => true,
    compile: () => (value: unknown) =>
      slow
        ? new Promise<readonly Issue[]>((resolve) => finishes.push(resolve))
        : value === 'abc'
          ? []
          : [{ dataPath: '', message: 'too short' }],
  };
  const view = render(
    <Form
      ref={ref}
      jsonSchema={{ type: 'string' }}
      defaultValue="ab"
      showError={showError}
      FieldRenderer={Renderer}
      fieldInputMap={{ '': Input }}
      validatorFactory={validator}
      formatError={(e) => e.message ?? null}
    />,
  );
  await settleValidation(() => ref.current?.node);
  const clock = createValidationFrameClock();
  return {
    ref,
    view,
    clock,
    finishes,
    slow: () => {
      slow = true;
    },
    text: () => view.getByTestId('error').textContent,
  };
};
it('IR-6 H a quiet reveal stays hidden until its release', async () => {
  const f = await fixture(false);
  act(() => f.ref.current!.node!.setState({ 4: true }));
  expect(f.text()).toBe('');
  await act(async () => {
    f.clock.frame();
    await f.clock.task();
  });
  expect(f.text()).toBe('too short');
});
it('IR-6 H standalone ErrorVisible off then on never restores an earlier pending verdict', async () => {
  const f = await fixture();
  f.slow();
  act(() => f.ref.current!.setValue('abc'));
  await act(async () => {
    f.clock.frame();
    await f.clock.task();
  });
  act(() => f.ref.current!.node!.setState({ 4: false }));
  await f.clock.task();
  act(() => f.ref.current!.node!.setState({ 4: true }));
  expect(f.text()).toBe('');
  await act(async () => {
    f.finishes[0]([]);
    await f.clock.task();
  });
  expect(f.text()).toBe('');
});
it('IR-6 H one batch hides and re-reveals without losing an eligible painted error', async () => {
  const f = await fixture();
  act(() =>
    f.ref.current!.node!.batch(() => {
      f.ref.current!.node!.setState({ 4: false });
      f.ref.current!.node!.setState({ 4: true });
    }),
  );
  expect(f.text()).toBe('too short');
  await act(async () => {
    f.clock.frame();
    expect(f.text()).toBe('too short');
    await f.clock.task();
  });
  expect(f.text()).toBe('too short');
});
it('IR-6 D root validate releases a quiet reveal before any frame and preserves it through a write', async () => {
  const f = await fixture(false);
  act(() => f.ref.current!.node!.setState({ 4: true }));
  await act(async () => {
    await f.ref.current!.validate();
  });
  expect(f.text()).toBe('too short');
  f.slow();
  act(() => f.ref.current!.setValue('abc'));
  expect(f.text()).toBe('too short');
  await act(async () => {
    f.clock.frame();
    expect(f.text()).toBe('too short');
    await f.clock.task();
  });
  await act(async () => {
    f.finishes[0]([]);
    await f.clock.task();
  });
  expect(f.text()).toBe('');
});
it('IR-6 H committed showError before clearState retains an eligible error during a pending write', async () => {
  const f = await fixture(false);
  act(() => f.ref.current!.node!.setState({ 4: true }));
  await act(async () => {
    f.clock.frame();
    await f.clock.task();
  });
  expect(f.text()).toBe('too short');
  act(() => f.ref.current!.showError());
  act(() => f.ref.current!.clearState());
  f.slow();
  act(() => f.ref.current!.setValue('abc'));
  expect(f.text()).toBe('too short');
  await act(async () => {
    f.clock.frame();
    await f.clock.task();
  });
  await act(async () => {
    f.finishes[0]([]);
    await f.clock.task();
  });
  expect(f.text()).toBe('');
});
it('IR-6 H limit v a same-handler policy reveal and clearState counts the unpainted combination', async () => {
  const f = await fixture(false);
  act(() => {
    f.ref.current!.node!.setState({ 4: true });
  });
  await act(async () => {
    f.clock.frame();
    await f.clock.task();
  });
  expect(f.text()).toBe('too short');
  act(() => {
    f.ref.current!.showError();
    f.ref.current!.clearState();
  });
  expect(f.text()).toBe('');
  await act(async () => {
    f.clock.frame();
    await f.clock.task();
  });
  expect(f.text()).toBe('');
  await act(async () => {
    f.clock.frame();
    await f.clock.task();
  });
  expect(f.text()).toBe('too short');
});
it('IR-6 H provider policy changes hold a pending previous verdict', async () => {
  const ref = createRef<FormHandle>();
  const validator = {
    compileGuard: () => () => true,
    compile: () => (value: unknown) =>
      value === 'abc' ? [] : [{ dataPath: '', message: 'too short' }],
  };
  const form = (
    <Form
      ref={ref}
      jsonSchema={{ type: 'string' }}
      defaultValue="ab"
      FieldRenderer={Renderer}
      fieldInputMap={{ '': Input }}
      validatorFactory={validator}
      formatError={(e) => e.message ?? null}
    />
  );
  const view = render(<FormProvider showError={false}>{form}</FormProvider>);
  await settleValidation(() => ref.current?.node);
  const clock = createValidationFrameClock();
  act(() => ref.current!.setValue('abc'));
  view.rerender(<FormProvider showError={true}>{form}</FormProvider>);
  expect(view.getByTestId('error').textContent).toBe('');
  await act(async () => {
    clock.frame();
    await clock.task();
  });
  expect(view.getByTestId('error').textContent).toBe('');
});
it('IR-6 H transition layout normalization never exposes the old verdict to a same-commit paint probe', async () => {
  const ref = createRef<FormHandle>();
  const probes: string[] = [];
  let reveal!: () => void;
  const Normalizer = ({ node }: FieldInputProps) => {
    useLayoutEffect(() => {
      node.setValue('normalized');
    }, [node]);
    return null;
  };
  const Probe = () => {
    useLayoutEffect(() => {
      probes.push(
        document.querySelector('[data-testid="error"]')?.textContent ?? '',
      );
    });
    return null;
  };
  const validator = {
    compileGuard: () => () => true,
    compile: () => (value: unknown) => [
      { dataPath: '', message: value === 'ab' ? 'old error' : 'new verdict' },
    ],
  };
  const App = () => {
    const [shown, setShown] = useState(false);
    reveal = () =>
      startTransition(() => {
        ref.current!.node!.setState({ 4: true });
        setShown(true);
      });
    return (
      <Form
        ref={ref}
        jsonSchema={{ type: 'string' }}
        defaultValue="ab"
        showError={false}
        FieldRenderer={Renderer}
        fieldInputMap={{ '': Normalizer }}
        validatorFactory={validator}
        formatError={(e) => e.message ?? null}
      >
        {shown ? <Form.Render path="">{Renderer}</Form.Render> : null}
        <Probe />
      </Form>
    );
  };
  const view = render(<App />);
  await settleValidation(() => ref.current?.node);
  const clock = createValidationFrameClock();
  probes.length = 0;
  await act(async () => reveal());
  expect(probes.length).toBeGreaterThan(0);
  expect(probes).not.toContain('old error');
  await act(async () => {
    clock.frame();
    await clock.task();
  });
  expect(view.getByTestId('error').textContent).toBe('new verdict');
});

it('IR-6 H blur stays hidden at both frame callbacks and releases after the second task', async () => {
  const f = await fixture(ShowError.Touched);
  fireEvent.blur(f.view.getByLabelText('field'));
  await act(async () => {
    f.clock.frame();
    await f.clock.task();
  });
  expect(f.text()).toBe('');
  act(() => f.clock.frame());
  expect(f.text()).toBe('');
  await act(async () => {
    await f.clock.task();
  });
  expect(f.text()).toBe('too short');
});
it('IR-6 H root rebuild commits its policy before a pending handle reveal', async () => {
  const f = await fixture(false);
  const old = f.ref.current!.node;
  act(() => f.ref.current!.rebuild());
  expect(f.ref.current!.node).not.toBe(old);
  await act(async () => {
    f.clock.frame();
    await f.clock.task();
    f.clock.frame();
    await f.clock.task();
  });
  f.slow();
  act(() => {
    f.ref.current!.setValue('abc');
    f.ref.current!.showError();
  });
  expect(f.text()).toBe('');
  await act(async () => {
    f.clock.frame();
    await f.clock.task();
  });
  await act(async () => {
    f.finishes[0]([]);
    await f.clock.task();
  });
  expect(f.text()).toBe('');
});
it('IR-6 H a suspended policy render cannot replace the committed engine policy', async () => {
  const ref = createRef<FormHandle>();
  let suspend = false;
  const never = new Promise<void>(() => undefined);
  const Suspender = ({ node }: FieldInputProps) => {
    useChildFieldErrors(node);
    if (suspend) throw never;
    return <input />;
  };
  const view = render(
    <Suspense fallback="hidden">
      <Form
        ref={ref}
        jsonSchema={{ type: 'string' }}
        defaultValue="ab"
        showError={false}
        FieldRenderer={Renderer}
        fieldInputMap={{ '': Suspender }}
        validatorFactory={{
          compileGuard: () => () => true,
          compile: () => (value: unknown) =>
            value === 'abc' ? [] : [{ dataPath: '', message: 'too short' }],
        }}
        formatError={(e) => e.message ?? null}
      />
    </Suspense>,
  );
  await settleValidation(() => ref.current?.node);
  expect(ref.current).not.toBeNull();
  const handle = ref.current!;
  const root = handle.node!;
  const clock = createValidationFrameClock();
  suspend = true;
  await act(async () => {
    startTransition(() => handle.showError());
  });
  await act(async () => {
    clock.frame();
    await clock.task();
  });
  expect(
    (
      readFieldNodeRuntime(root) as unknown as {
        revealPolicy?: { value: unknown };
      }
    ).revealPolicy?.value,
  ).toBe(false);
  suspend = false;
  act(() => {
    handle.showError();
    handle.setValue('abc');
  });
  expect(view.getByTestId('error').textContent).toBe('');
  await act(async () => {
    clock.frame();
    await clock.task();
  });
  expect(view.getByTestId('error').textContent).toBe('');
});
