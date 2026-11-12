import type { ComponentProps, PropsWithChildren } from 'react';

import {
  type AlertProps,
  type ConfirmProps,
  type ModalFrameProps,
  type ModalNodeView,
  ModalProvider,
  type ModalProviderProps,
  type OverridableHandleProps,
  type PromptProps,
  alert,
  confirm,
  prompt,
  useActiveModalCount,
  useSubscribeModal,
} from '@lerx/promise-modal';
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from '@testing-library/react';
import { afterEach, describe, expect, expectTypeOf, it } from 'vitest';

/**
 * Exercises the built `dist/` output rather than `src/`.
 *
 * Importing by the published specifier resolves through package.json `exports`,
 * so this is the only suite that runs what consumers actually install. Every
 * other test in this package imports through the `@/promise-modal` alias or
 * relatively, and therefore only ever sees `src/`.
 *
 * What it guards: this package publishes a single bundled file, and bundling is
 * where module-evaluation semantics can shift — DOM-independent module evaluation, class declaration form, and
 * dead-code elimination. Driving one real modal round-trip through the bundle
 * covers all three; a surface-only check would not.
 *
 * Uses only the published surface on purpose: the singleton reset helper the
 * source tests call is internal, so cases here must tolerate shared state.
 */
describe('@lerx/promise-modal 빌드 산출물', () => {
  afterEach(cleanup);

  it('published entry point 가 문서화된 API 를 노출한다', () => {
    expect(typeof alert).toBe('function');
    expect(typeof confirm).toBe('function');
    expect(typeof prompt).toBe('function');
    expect(ModalProvider).toBeTruthy();
  });

  it('alert() 이 렌더되고 Confirm 클릭 시 resolve 된다', async () => {
    render(<ModalProvider>{null}</ModalProvider>);

    let pending!: Promise<void>;
    act(() => {
      pending = alert({ title: 'Built Alert' });
    });

    const confirmButton = await screen.findByText('Confirm');
    expect(screen.getByText('Built Alert')).toBeDefined();

    fireEvent.click(confirmButton);
    await expect(pending).resolves.toBeUndefined();
  });
});

/** Exercises the published read-only predicate and id subscription contracts. */
function PublicFrame({ id, children }: PropsWithChildren<ModalFrameProps>) {
  const version = useSubscribeModal(id);
  return (
    <section data-testid="public-frame" data-version={version}>
      {children}
    </section>
  );
}

it('published hooks count and subscribe from their public arguments', async () => {
  const Count = () => (
    <output>
      {useActiveModalCount(
        (node: ModalNodeView) => node.visible && node.group === 'public',
      )}
    </output>
  );
  render(
    <ModalProvider ForegroundComponent={PublicFrame}>
      <Count />
    </ModalProvider>,
  );
  expect(screen.getByRole('status').textContent).toBe('0');
  let result!: Promise<void>;
  act(() => {
    result = alert({ group: 'public' });
  });
  expect(screen.getByRole('status').textContent).toBe('1');
  const initial = screen.getByTestId('public-frame').dataset.version;
  fireEvent.click(screen.getByText('Confirm'));
  await expect(result).resolves.toBeUndefined();
  expect(screen.getByRole('status').textContent).toBe('0');
  expect(screen.getByTestId('public-frame').dataset.version).not.toBe(initial);
});

/** Consumes public wrapper types exactly as an application does. */
it('publishes wrapper props, prompt result types and frame metadata', async () => {
  const inlineProviderProps: ModalProviderProps = {
    ForegroundComponent: ({ children }) => <section>{children}</section>,
  };
  expectTypeOf(inlineProviderProps).toMatchTypeOf<ModalProviderProps>();
  expectTypeOf<
    ComponentProps<NonNullable<ModalProviderProps['ForegroundComponent']>>
  >().toEqualTypeOf<PropsWithChildren<ModalFrameProps>>();
  expectTypeOf<
    NonNullable<ModalProviderProps['BackgroundComponent']>
  >().toEqualTypeOf<
    NonNullable<OverridableHandleProps['BackgroundComponent']>
  >();
  const overrides: OverridableHandleProps = {
    duration: '0.5s',
    group: 'typed',
    subtype: 'warning',
    manualDestroy: true,
  };
  const alertProps: AlertProps<unknown> = {
    ...overrides,
    content: ({ context, onConfirm }) => (
      <button onClick={onConfirm}>
        {String('label' in context ? context.label : '')}
      </button>
    ),
  };
  const confirmProps: ConfirmProps<unknown> = { title: 'typed confirm' };
  const promptProps: PromptProps<string> = { Input: () => null };
  expectTypeOf<ReturnType<typeof prompt<string>>>().toEqualTypeOf<
    Promise<string | undefined | null>
  >();
  expectTypeOf(promptProps).toMatchTypeOf<PromptProps<string>>();
  expectTypeOf(confirmProps).toMatchTypeOf<OverridableHandleProps>();
  function Frame({
    group,
    subtype,
    settled,
    children,
  }: PropsWithChildren<ModalFrameProps>) {
    return (
      <section
        data-testid="metadata"
        data-group={group}
        data-subtype={subtype}
        data-settled={settled}
      >
        {children}
      </section>
    );
  }
  render(
    <ModalProvider
      ForegroundComponent={Frame}
      BackgroundComponent={Frame}
      context={{ label: 'context passed' }}
    />,
  );
  let pending!: Promise<void>;
  act(() => {
    pending = alert(alertProps);
  });
  const frames = screen
    .getAllByTestId('metadata')
    .filter((frame) => frame.dataset.group === 'typed');
  expect(frames).toHaveLength(2);
  for (const frame of frames)
    expect(frame.dataset).toMatchObject({
      group: 'typed',
      subtype: 'warning',
      settled: 'false',
    });
  fireEvent.click(screen.getByText('context passed'));
  await pending;
  for (const frame of frames) expect(frame.dataset.settled).toBe('true');
});
