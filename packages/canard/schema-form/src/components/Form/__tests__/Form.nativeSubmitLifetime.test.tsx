import {
  type ReactNode,
  Suspense,
  createRef,
  startTransition,
  useLayoutEffect,
  useState,
} from 'react';

import { act, cleanup, waitFor } from '@testing-library/react';
import { afterEach, expect, inject, it, vi } from 'vitest';

import { settleValidation } from '@/schema-form/__tests__/helpers/settleValidation';
import { ValidationMode } from '@/schema-form/core';
import { ExternalFormContextProvider } from '@/schema-form/providers/ExternalFormContext';
import { ErrorVisibility } from '@/schema-form/types';
import type { FieldRendererProps } from '@/schema-form/types';

import type { FormHandle } from '../components/FormCore';
import { awaitNativeSubmitVerdict } from './fixtures/awaitNativeSubmitVerdict';
import {
  type NativeSubmitForm,
  type NativeSubmitFormOptions,
  mountNativeSubmitForm,
} from './fixtures/mountNativeSubmitForm';

// A native-submit verdict acts only while the submit's load and mount are current, under the committed policy (ERROR-139).

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

/** Interruptions that retire a pending native submit. */
const interrupt = {
  reset: (form: NativeSubmitForm) => form.ref.current!.reset(),
  rebuild: (form: NativeSubmitForm) => form.ref.current!.rebuild(),
  unmount: (form: NativeSubmitForm) => form.view.unmount(),
} as const;

/**
 * Retire a pending native submit and assert that its verdict leaves no trace.
 * @param name - Interruption applied while the validator is held.
 * @param options - Render variant.
 */
const expectDroppedVerdict = async (
  name: keyof typeof interrupt,
  options: NativeSubmitFormOptions,
) => {
  const form = await mountNativeSubmitForm(options);
  const validate = vi.spyOn(form.ref.current!.node!, 'validate');
  const focusRequests = form.spyFocusRequests('/a');
  form.validator.hold();
  await form.user.click(form.button());
  await waitFor(() => expect(form.validator.heldCount()).toBe(1));
  act(() => interrupt[name](form));
  await act(async () => form.validator.release());
  await awaitNativeSubmitVerdict(validate);
  form.expectNothingReported();
  expect(focusRequests(), 'Focus requests on /a').toBe(0);
  if (name === 'unmount') return;
  await settleValidation(() => form.ref.current?.node);
  expect(form.errorText('/a')).toBe('');
  expect(document.activeElement).not.toBe(form.field('/a'));
};

it.each([
  ['reset', 'concurrent root', {}],
  ['rebuild', 'concurrent root', {}],
  ['unmount', 'concurrent root', {}],
  ['reset', 'StrictMode', { strictMode: true }],
  ['rebuild', 'StrictMode', { strictMode: true }],
  ['unmount', 'StrictMode', { strictMode: true }],
] as const)(
  'ERROR-139 %s during validation drops the verdict (%s)',
  (name, _, options) => expectDroppedVerdict(name, options),
);

it
  .skipIf(inject('reactMajor') !== '18')
  .each([['reset'], ['rebuild'], ['unmount']] as const)(
  'ERROR-139 %s during validation drops the verdict (React 18 legacy root; React 19 has no legacy root)',
  (name) => expectDroppedVerdict(name, { legacyRoot: true }),
);

it('ERROR-139 FormProvider errorVisibility turned false during validation: no reveal, nothing reported', async () => {
  let setPolicy!: (value: ErrorVisibility | undefined) => void;
  const Policy = ({ children }: { children: ReactNode }) => {
    const [errorVisibility, set] = useState<ErrorVisibility | undefined>(
      undefined,
    );
    setPolicy = set;
    return (
      <ExternalFormContextProvider errorVisibility={errorVisibility}>
        {children}
      </ExternalFormContextProvider>
    );
  };
  const form = await mountNativeSubmitForm({
    wrap: (node) => <Policy>{node}</Policy>,
  });
  const validate = vi.spyOn(form.ref.current!.node!, 'validate');
  form.validator.hold();
  await form.user.click(form.button());
  await waitFor(() => expect(form.validator.heldCount()).toBe(1));
  act(() => setPolicy(ErrorVisibility.Never));
  await act(async () => form.validator.release());
  await awaitNativeSubmitVerdict(validate);
  await settleValidation(() => form.ref.current?.node);
  form.expectNothingReported();
  expect(form.errorText('/a')).toBe('');
  expect(document.activeElement).not.toBe(form.field('/a'));
});

it('ERROR-139 a discarded render that turns the policy on is not read: no reveal, nothing reported', async () => {
  let setPolicy!: (value: ErrorVisibility) => void;
  const never = new Promise<never>(() => undefined);
  const Suspender = ({ on }: { on: boolean }) => {
    if (on) throw never;
    return null;
  };
  const Policy = ({ children }: { children: ReactNode }) => {
    const [errorVisibility, set] = useState(ErrorVisibility.Never);
    setPolicy = set;
    return (
      <ExternalFormContextProvider errorVisibility={errorVisibility}>
        <Suspender on={errorVisibility === ErrorVisibility.Always} />
        {children}
      </ExternalFormContextProvider>
    );
  };
  const form = await mountNativeSubmitForm({
    wrap: (node) => (
      <Suspense fallback={<span>fallback</span>}>
        <Policy>{node}</Policy>
      </Suspense>
    ),
  });
  const validate = vi.spyOn(form.ref.current!.node!, 'validate');
  form.validator.hold();
  await form.user.click(form.button());
  await waitFor(() => expect(form.validator.heldCount()).toBe(1));
  await act(async () =>
    startTransition(() => setPolicy(ErrorVisibility.Always)),
  );
  expect(form.view.queryByText('fallback')).toBeNull();
  await act(async () => form.validator.release());
  await awaitNativeSubmitVerdict(validate);
  await settleValidation(() => form.ref.current?.node);
  form.expectNothingReported();
  expect(form.errorText('/a')).toBe('');
  expect(document.activeElement).not.toBe(form.field('/a'));
});

it.skipIf(inject('reactMajor') !== '18')(
  'ERROR-139 React 18 legacy root: a layout effect that rebuilds on reveal leaves no Focus request on the replaced tree and nothing reported (React 19 has no legacy root)',
  async () => {
    const handle = createRef<FormHandle>();
    let armed = false;
    let rebuilds = 0;
    const RebuildingRenderer = ({
      Input,
      errorVisible,
    }: FieldRendererProps) => {
      useLayoutEffect(() => {
        if (!armed || !errorVisible) return;
        armed = false;
        rebuilds++;
        handle.current!.rebuild();
      }, [errorVisible]);
      return <Input />;
    };
    const form = await mountNativeSubmitForm({
      legacyRoot: true,
      formProps: {
        ref: handle,
        FieldRenderer: RebuildingRenderer,
        validationMode: ValidationMode.OnRequest,
      },
    });
    const root = handle.current!.node!;
    const validate = vi.spyOn(root, 'validate');
    const focusRequests = form.spyFocusRequests('/a');
    armed = true;
    await form.user.click(form.button());
    await awaitNativeSubmitVerdict(validate);
    expect(rebuilds, 'the reveal ran the rebuild').toBe(1);
    expect(handle.current!.node, 'the rebuild replaced the root').not.toBe(
      root,
    );
    form.expectNothingReported();
    expect(focusRequests(), 'Focus requests on the replaced /a').toBe(0);
    await settleValidation(() => handle.current?.node);
    expect(document.activeElement).not.toBe(form.field('/a'));
  },
);

it.skipIf(inject('reactMajor') !== '18')(
  'ERROR-139 React 18 legacy root rechecks Never after the reveal commit before requesting focus',
  async () => {
    let setPolicy!: (policy: ErrorVisibility) => void;
    let armed = false;
    const Policy = ({ children }: { children: ReactNode }) => {
      const [policy, set] = useState(ErrorVisibility.AfterTouch);
      setPolicy = set;
      return (
        <ExternalFormContextProvider errorVisibility={policy}>
          {children}
        </ExternalFormContextProvider>
      );
    };
    const Renderer = ({ Input, errorVisible }: FieldRendererProps) => {
      useLayoutEffect(() => {
        if (!armed || !errorVisible) return;
        armed = false;
        setPolicy(ErrorVisibility.Never);
      }, [errorVisible]);
      return <Input />;
    };
    const form = await mountNativeSubmitForm({
      legacyRoot: true,
      wrap: (node) => <Policy>{node}</Policy>,
      formProps: {
        FieldRenderer: Renderer,
        validationMode: ValidationMode.OnRequest,
      },
    });
    const validate = vi.spyOn(form.ref.current!.node!, 'validate');
    const focusRequests = form.spyFocusRequests('/a');
    armed = true;
    await form.user.click(form.button());
    await awaitNativeSubmitVerdict(validate);
    expect(armed).toBe(false);
    expect(focusRequests()).toBe(0);
    form.expectNothingReported();
  },
);
