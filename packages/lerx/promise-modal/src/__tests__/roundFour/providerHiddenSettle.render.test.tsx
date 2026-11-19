import * as React from 'react';
import { Suspense, lazy, useRef } from 'react';
import type { PropsWithChildren } from 'react';

import { act, cleanup, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import {
  type ModalFrameProps,
  ModalProvider,
  confirm,
  useDestroyAfter,
  useModal,
  useModalAnimation,
  useModalDuration,
} from '@/promise-modal';
import { ModalManager } from '@/promise-modal/app';
import { visible as foregroundVisible } from '@/promise-modal/components/Foreground/styles/style';

/**
 * Angle RG1 (round 3 items 2 and 5): a manualDestroy request that settles while
 * its Provider is hidden, by the documented hidden-caller cancellation or by abort.
 */
const Activity = (React as { Activity?: React.ComponentType<any> }).Activity;
const Suspender = lazy(() => new Promise<{ default: () => null }>(() => {}));
function Visibility({
  hidden,
  kind,
  children,
}: PropsWithChildren<{ hidden: boolean; kind: 'activity' | 'suspense' }>) {
  if (kind === 'activity' && Activity)
    return <Activity mode={hidden ? 'hidden' : 'visible'}>{children}</Activity>;
  return (
    <Suspense fallback={<span>loading</span>}>
      {children}
      {hidden && <Suspender />}
    </Suspense>
  );
}

afterEach(() => {
  cleanup();
  ModalManager.reset();
  vi.restoreAllMocks();
});

/** README "Animation and destruction" frame, verbatim apart from the test id. */
function AnimatedFrame({
  id,
  visible,
  children,
}: PropsWithChildren<ModalFrameProps>) {
  const ref = useRef<HTMLDivElement>(null);
  const { duration } = useModalDuration(id);
  useModalAnimation(visible, {
    onVisible: () => {
      if (ref.current) ref.current.style.opacity = '1';
    },
    onHidden: () => {
      if (ref.current) ref.current.style.opacity = '0';
    },
  });
  useDestroyAfter(id, duration);
  return (
    <section
      ref={ref}
      data-testid="animated"
      role="dialog"
      aria-modal="true"
      aria-label="Notification"
      aria-hidden={!visible}
      style={{
        opacity: 0,
        transition: `opacity ${duration}`,
        background: 'white',
        padding: 24,
      }}
    >
      {children}
    </section>
  );
}

let modal!: ReturnType<typeof useModal>;
function EditorPage() {
  modal = useModal();
  return <span>editor page</span>;
}

const nextFrame = () =>
  act(
    () =>
      new Promise<void>((resolve) => requestAnimationFrame(() => resolve())),
  );

async function scenario(
  kind: 'activity' | 'suspense',
  how: 'hidden caller' | 'abort',
) {
  const app = (hidden: boolean) => (
    <Visibility hidden={hidden} kind={kind}>
      <ModalProvider
        ForegroundComponent={AnimatedFrame}
        options={{ manualDestroy: true, duration: '300ms' }}
      >
        <EditorPage />
      </ModalProvider>
    </Visibility>
  );
  const view = render(app(false));
  const controller = new AbortController();
  let result: boolean | undefined;
  act(() => {
    const request =
      how === 'hidden caller'
        ? modal.confirm({ title: 'Discard changes?' })
        : confirm({ title: 'Discard changes?', signal: controller.signal });
    void request.then((value) => {
      result = value;
    });
  });
  await nextFrame();
  const wrapper = screen.getByTestId('animated').parentElement!;
  expect(screen.getByTestId('animated').style.opacity).toBe('1');
  await act(async () => view.rerender(app(true)));
  if (how === 'abort') act(() => controller.abort());
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 10));
  });
  expect(result).toBe(false);
  await act(async () => view.rerender(app(false)));
  return {
    displayedOnShow: wrapper.isConnected && wrapper.classList.contains(foregroundVisible),
    opacityOnShow: screen.queryByTestId('animated')?.style.opacity,
  };
}

for (const kind of ['activity', 'suspense'] as const)
  for (const how of ['hidden caller', 'abort'] as const)
    it.skipIf(kind === 'activity' && !Activity)(
      `does not display a manualDestroy request settled by ${how} while its Provider was hidden (${kind})`,
      async () => {
        const outcome = await scenario(kind, how);
        // README:354, "A settled modal never reappears, including in manual destruction mode."
        expect(outcome).toEqual({
          displayedOnShow: false,
          opacityOnShow: outcome.opacityOnShow,
        });
      },
    );
