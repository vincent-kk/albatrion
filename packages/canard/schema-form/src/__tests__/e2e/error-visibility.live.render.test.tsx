import {
  Suspense,
  createRef,
  startTransition,
  useLayoutEffect,
  useState,
} from 'react';

import { act, cleanup, render } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import {
  ErrorVisibility,
  FieldNodeState,
  type FieldRendererProps,
  Form,
  type FormHandle,
  FormProvider,
  ValidationMode,
} from '@/schema-form';

afterEach(cleanup);

const Renderer = ({ Input, path, errorVisible }: FieldRendererProps) => (
  <>
    <Input />
    <span data-testid={path} data-visible={String(errorVisible)} />
  </>
);
const schema = {
  type: 'object',
  properties: { a: { type: 'string' } },
} as const;
const errors = [{ dataPath: '/a', message: 'required' }];
const validator = { compile: () => () => [], compileGuard: () => () => true };

/** Mount a real Form and change only the two public policy props. */
const fixture = (
  formPolicy?: ErrorVisibility,
  providerPolicy?: ErrorVisibility,
) => {
  const ref = createRef<FormHandle>();
  const onStateChange = vi.fn();
  const element = () => (
    <FormProvider errorVisibility={providerPolicy}>
      <Form
        ref={ref}
        jsonSchema={schema}
        errors={errors}
        validationMode={ValidationMode.OnRequest}
        validatorFactory={validator}
        FieldRenderer={Renderer}
        errorVisibility={formPolicy}
        onStateChange={onStateChange}
      />
    </FormProvider>
  );
  const view = render(element());
  const root = ref.current!.node!;
  const input = view.container.querySelector('input');
  return {
    ref,
    view,
    root,
    input,
    onStateChange,
    visible: () =>
      view.getByTestId('/a').getAttribute('data-visible') === 'true',
    form(policy?: ErrorVisibility) {
      formPolicy = policy;
      view.rerender(element());
    },
    provider(policy?: ErrorVisibility) {
      providerPolicy = policy;
      view.rerender(element());
    },
  };
};

it('applies Form policy changes without replacing nodes, input, values or interaction state', () => {
  const f = fixture(ErrorVisibility.Never);
  act(() => {
    f.ref.current!.setValue({ a: 'edited' });
    f.ref.current!.findNode('/a')!.setState({ [FieldNodeState.Edited]: true });
  });
  const state = f.ref.current!.findNode('/a')!.state;
  const input = f.view.container.querySelector('input');
  expect(f.visible()).toBe(false);
  f.form(ErrorVisibility.Always);
  expect(f.visible()).toBe(true);
  f.form(ErrorVisibility.Never);
  expect(f.visible()).toBe(false);
  expect(f.ref.current!.node).toBe(f.root);
  expect(f.view.container.querySelector('input')).toBe(input);
  expect(f.ref.current!.getValue()).toEqual({ a: 'edited' });
  expect(f.ref.current!.findNode('/a')!.state).toBe(state);
});

it('applies inherited FormProvider changes without remounting', () => {
  const f = fixture(undefined, ErrorVisibility.Never);
  f.provider(ErrorVisibility.Always);
  expect(f.visible()).toBe(true);
  f.provider(ErrorVisibility.Never);
  expect(f.visible()).toBe(false);
  expect(f.ref.current!.node).toBe(f.root);
  expect(f.view.container.querySelector('input')).toBe(f.input);
});

it('reveal and reset use the latest base without validation or node-state writes', () => {
  const f = fixture(ErrorVisibility.Never);
  const validate = vi.spyOn(f.root, 'validate');
  const retained = f.ref.current!;
  act(() => retained.revealErrors());
  expect(f.visible()).toBe(true);
  act(() => retained.resetErrorVisibility());
  expect(f.visible()).toBe(false);
  f.form(ErrorVisibility.AfterTouch);
  act(() => retained.revealErrors());
  expect(f.visible()).toBe(true);
  act(() => retained.resetErrorVisibility());
  expect(f.visible()).toBe(false);
  f.form(ErrorVisibility.Always);
  act(() => retained.revealErrors());
  act(() => retained.resetErrorVisibility());
  expect(f.visible()).toBe(true);
  expect(validate).not.toHaveBeenCalled();
  expect(f.onStateChange).not.toHaveBeenCalled();
  expect(f.ref.current!.getErrors()).toEqual(errors);
});

it('same-value rerenders keep reveal; a committed base change clears it', () => {
  const f = fixture(ErrorVisibility.Never);
  act(() => f.ref.current!.revealErrors());
  f.form(ErrorVisibility.Never);
  expect(f.visible()).toBe(true);
  f.form(ErrorVisibility.AfterTouch);
  expect(f.visible()).toBe(false);
});

it('A to B to A cannot revive an earlier Form reveal', () => {
  const f = fixture(ErrorVisibility.Never);
  act(() => f.ref.current!.revealErrors());
  f.form(ErrorVisibility.AfterEdit);
  expect(f.visible()).toBe(false);
  f.form(ErrorVisibility.Never);
  expect(f.visible()).toBe(false);
});

it('a masked Provider change keeps reveal until the effective base changes', () => {
  const f = fixture(ErrorVisibility.Never, ErrorVisibility.AfterEdit);
  act(() => f.ref.current!.revealErrors());
  f.provider(ErrorVisibility.AfterTouch);
  expect(f.visible()).toBe(true);
  f.form(undefined);
  expect(f.visible()).toBe(false);
});

it('node false beats Form reveal; undefined inherits without clearing interaction flags', () => {
  const f = fixture(ErrorVisibility.Never);
  const node = f.ref.current!.findNode('/a')!;
  act(() =>
    node.setState({
      [FieldNodeState.ErrorVisibility]: false,
      [FieldNodeState.Edited]: true,
      [FieldNodeState.Touched]: true,
    }),
  );
  act(() => f.ref.current!.revealErrors());
  expect(f.visible()).toBe(false);
  act(() => node.setState({ [FieldNodeState.ErrorVisibility]: undefined }));
  expect(f.visible()).toBe(true);
  expect(node.isEdited).toBe(true);
  expect(node.isTouched).toBe(true);
  act(() => f.ref.current!.resetErrorVisibility());
  expect(f.visible()).toBe(false);
  act(() => node.setState({ [FieldNodeState.ErrorVisibility]: true }));
  expect(f.visible()).toBe(true);
});

it('reset and rebuild clear the Form reveal', () => {
  const f = fixture(ErrorVisibility.Never);
  act(() => f.ref.current!.revealErrors());
  act(() => f.ref.current!.reset());
  expect(f.visible()).toBe(false);
  act(() => f.ref.current!.revealErrors());
  act(() => f.ref.current!.rebuild());
  expect(f.visible()).toBe(false);
});

it('a newly committed base never renders with the old reveal', () => {
  const seen: boolean[] = [];
  const ref = createRef<FormHandle>();
  const Probe = ({ errorVisible, Input }: FieldRendererProps) => {
    useLayoutEffect(() => {
      seen.push(errorVisible);
    });
    return <Input />;
  };
  const element = (policy: ErrorVisibility) => (
    <Form
      ref={ref}
      jsonSchema={{ type: 'string' }}
      validationMode={ValidationMode.OnRequest}
      validatorFactory={validator}
      FieldRenderer={Probe}
      errorVisibility={policy}
    />
  );
  const view = render(element(ErrorVisibility.Never));
  act(() => ref.current!.revealErrors());
  seen.length = 0;
  view.rerender(element(ErrorVisibility.AfterTouch));
  expect(seen.length).toBeGreaterThan(0);
  expect(seen).not.toContain(true);
});

it('an abandoned base-policy render leaves the committed reveal intact', () => {
  const ref = createRef<FormHandle>();
  let setPolicy!: (policy: ErrorVisibility) => void;
  const pending = new Promise<never>(() => undefined);
  const Suspend = ({ policy }: { policy: ErrorVisibility }) => {
    if (policy === ErrorVisibility.AfterTouch) throw pending;
    return null;
  };
  const Host = () => {
    const [policy, set] = useState(ErrorVisibility.Never);
    setPolicy = set;
    return (
      <>
        <Form
          ref={ref}
          jsonSchema={schema}
          FieldRenderer={Renderer}
          validatorFactory={validator}
          validationMode={ValidationMode.OnRequest}
          errorVisibility={policy}
        />
        <Suspend policy={policy} />
      </>
    );
  };
  const view = render(
    <Suspense fallback={<span>pending</span>}>
      <Host />
    </Suspense>,
  );
  act(() => ref.current!.revealErrors());
  act(() => startTransition(() => setPolicy(ErrorVisibility.AfterTouch)));
  expect(view.getByTestId('/a').getAttribute('data-visible')).toBe('true');
  act(() => setPolicy(ErrorVisibility.Never));
  expect(view.getByTestId('/a').getAttribute('data-visible')).toBe('true');
});
