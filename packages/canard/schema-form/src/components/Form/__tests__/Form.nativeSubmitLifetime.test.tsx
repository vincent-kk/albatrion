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
import { ExternalFormContextProvider } from '@/schema-form/providers/ExternalFormContext';
import type { FieldRendererProps } from '@/schema-form/types';

import type { FormHandle } from '../components/FormCore';
import { awaitNativeSubmitVerdict } from './fixtures/awaitNativeSubmitVerdict';
import {
  type NativeSubmitForm,
  type NativeSubmitFormOptions,
  mountNativeSubmitForm,
} from './fixtures/mountNativeSubmitForm';

// A native-submit verdict acts only while the submit's load, root and mount are current, under the committed policy (ERROR-139).

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
  form.validator.hold();
  await form.user.click(form.button());
  await waitFor(() => expect(form.validator.heldCount()).toBe(1));
  act(() => interrupt[name](form));
  await act(async () => form.validator.release());
  await awaitNativeSubmitVerdict(validate);
  form.expectNothingReported();
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

it('ERROR-139 FormProvider showError turned false during validation: no reveal, nothing reported', async () => {
  let setPolicy!: (value: boolean | undefined) => void;
  const Policy = ({ children }: { children: ReactNode }) => {
    const [showError, set] = useState<boolean | undefined>(undefined);
    setPolicy = set;
    return (
      <ExternalFormContextProvider showError={showError}>
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
  act(() => setPolicy(false));
  await act(async () => form.validator.release());
  await awaitNativeSubmitVerdict(validate);
  await settleValidation(() => form.ref.current?.node);
  form.expectNothingReported();
  expect(form.errorText('/a')).toBe('');
  expect(document.activeElement).not.toBe(form.field('/a'));
});

it('ERROR-139 a discarded render that turns the policy on is not read: no reveal, nothing reported', async () => {
  let setPolicy!: (value: boolean) => void;
  const never = new Promise<never>(() => undefined);
  const Suspender = ({ on }: { on: boolean }) => {
    if (on) throw never;
    return null;
  };
  const Policy = ({ children }: { children: ReactNode }) => {
    const [showError, set] = useState(false);
    setPolicy = set;
    return (
      <ExternalFormContextProvider showError={showError}>
        <Suspender on={showError} />
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
  await act(async () => startTransition(() => setPolicy(true)));
  expect(form.view.queryByText('fallback')).toBeNull();
  await act(async () => form.validator.release());
  await awaitNativeSubmitVerdict(validate);
  await settleValidation(() => form.ref.current?.node);
  form.expectNothingReported();
  expect(form.errorText('/a')).toBe('');
  expect(document.activeElement).not.toBe(form.field('/a'));
});

it.skipIf(inject('reactMajor') !== '18')(
  'ERROR-139 React 18 legacy root: a layout effect that resets on reveal leaves no throw and no stale focus (React 19 has no legacy root)',
  async () => {
    const handle = createRef<FormHandle>();
    let armed = false;
    let resets = 0;
    const ResettingRenderer = ({ Input, errorVisible }: FieldRendererProps) => {
      useLayoutEffect(() => {
        if (!armed || !errorVisible) return;
        armed = false;
        resets++;
        handle.current!.reset();
      }, [errorVisible]);
      return <Input />;
    };
    const form = await mountNativeSubmitForm({
      legacyRoot: true,
      formProps: { ref: handle, FieldRenderer: ResettingRenderer },
    });
    const validate = vi.spyOn(handle.current!.node!, 'validate');
    armed = true;
    await form.user.click(form.button());
    await awaitNativeSubmitVerdict(validate);
    await settleValidation(() => handle.current?.node);
    expect(resets).toBe(1);
    form.expectNothingReported();
    expect(document.activeElement).not.toBe(form.field('/a'));
  },
);
