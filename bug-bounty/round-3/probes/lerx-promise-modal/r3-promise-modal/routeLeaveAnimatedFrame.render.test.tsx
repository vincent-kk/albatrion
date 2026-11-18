import {
  type PropsWithChildren,
  createContext,
  useContext,
  useRef,
  useState,
} from 'react';

import { act, cleanup, render, screen } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import {
  type ModalFrameProps,
  ModalProvider,
  useDestroyAfter,
  useModal,
  useModalAnimation,
  useModalDuration,
} from '@/promise-modal';
import { ModalManager } from '@/promise-modal/app';
import { visible as foregroundVisible } from '@/promise-modal/components/Foreground/styles/style';

afterEach(() => {
  cleanup();
  ModalManager.reset();
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

const Route = createContext('/editor');
const useAppPathname = () => ({ pathname: useContext(Route) });

let modal!: ReturnType<typeof useModal>;
function EditorPage() {
  modal = useModal();
  return <span>editor page</span>;
}

let navigate: (path: string) => void = () => {};
function App() {
  const [pathname, setPathname] = useState('/editor');
  navigate = setPathname;
  return (
    <Route.Provider value={pathname}>
      <ModalProvider
        usePathname={useAppPathname}
        ForegroundComponent={AnimatedFrame}
        options={{ manualDestroy: true }}
      >
        {pathname === '/editor' && <EditorPage />}
      </ModalProvider>
    </Route.Provider>
  );
}

const nextFrame = () =>
  act(() => new Promise<void>((resolve) => requestAnimationFrame(() => resolve())));

it('keeps a useModal request off the next route when leaving the page cancels it', async () => {
  render(<App />);
  let result: boolean | undefined;
  act(() => {
    void modal.confirm({ title: 'Discard changes?' }).then((value) => {
      result = value;
    });
  });
  await nextFrame();
  const section = screen.getByTestId('animated');
  expect(section.style.opacity).toBe('1');
  const wrapper = section.parentElement!;
  // Leaving the editor hides the request by route and unmounts its caller.
  await act(async () => navigate('/other'));
  expect(result).toBe(false);
  // README: "A settled modal never reappears, including in manual destruction mode."
  // The dialog is displayed again on /other, still fully opaque.
  expect({
    displayed: wrapper.classList.contains(foregroundVisible),
    opacity: section.style.opacity,
  }).toEqual({ displayed: false, opacity: '1' });
});
