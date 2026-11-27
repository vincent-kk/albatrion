import { createContext, useContext, useState } from 'react';

import { act, cleanup, render, screen } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import { ModalProvider, confirm, useModal } from '@/promise-modal';
import { ModalManager } from '@/promise-modal/app';
import { visible as foregroundVisible } from '@/promise-modal/components/Foreground/styles/style';

afterEach(() => {
  cleanup();
  ModalManager.reset();
});

const Route = createContext('/editor');
const useAppPathname = () => ({ pathname: useContext(Route) });

let navigate: (path: string) => void = () => {};
function App({ manualDestroy = true }: { manualDestroy?: boolean }) {
  const [pathname, setPathname] = useState('/editor');
  navigate = setPathname;
  return (
    <Route.Provider value={pathname}>
      <ModalProvider usePathname={useAppPathname} options={{ manualDestroy }} />
    </Route.Provider>
  );
}

it('settling while route-hidden stays hidden equivalently with automatic and manual destruction', async () => {
  const outcomes = [];
  for (const manualDestroy of [false, true]) {
    render(<App manualDestroy={manualDestroy} />);
    const controller = new AbortController();
    let result: boolean | undefined;
    act(() => {
      void confirm({ title: 'Delete?', signal: controller.signal }).then(
        (value) => {
          result = value;
        },
      );
    });
    const wrapper = screen.getByText('Confirm').closest('[tabindex="-1"]')!;
    act(() => navigate('/other'));
    expect(wrapper.classList.contains(foregroundVisible)).toBe(false);
    await act(async () => controller.abort());
    if (manualDestroy) {
      const node = ModalManager.node(ModalManager.ids[0])!;
      expect(node.settled && node.alive && !node.visible).toBe(true);
    }
    outcomes.push({
      result,
      displayed: wrapper.classList.contains(foregroundVisible),
    });
    cleanup();
    ModalManager.reset();
  }
  expect(outcomes[0]).toEqual({ result: false, displayed: false });
  expect(outcomes[1]).toEqual(outcomes[0]);
});

let modal!: ReturnType<typeof useModal>;
function Caller() {
  modal = useModal();
  return null;
}
let removeCaller: () => void = () => {};
/** A caller mounted outside the route, so only its own removal ends it. */
function AppWithCaller() {
  const [pathname, setPathname] = useState('/editor');
  const [mounted, setMounted] = useState(true);
  navigate = setPathname;
  removeCaller = () => setMounted(false);
  return (
    <Route.Provider value={pathname}>
      <ModalProvider
        usePathname={useAppPathname}
        options={{ manualDestroy: true }}
      >
        {mounted && <Caller />}
      </ModalProvider>
    </Route.Provider>
  );
}

it('cancels a route-hidden request when its caller unmounts, and does not show it on return', async () => {
  render(<AppWithCaller />);
  let result: boolean | undefined;
  act(() => {
    void modal.confirm({ title: 'Leave?' }).then((value) => {
      result = value;
    });
  });
  const wrapper = screen.getByText('Confirm').closest('[tabindex="-1"]')!;
  await act(async () => navigate('/other'));
  expect(wrapper.classList.contains(foregroundVisible)).toBe(false);
  expect(result).toBeUndefined();
  await act(async () => removeCaller());
  expect(result).toBe(false);
  act(() => navigate('/editor'));
  expect({
    alive: wrapper.isConnected,
    displayed: wrapper.classList.contains(foregroundVisible),
  }).toEqual({ alive: true, displayed: false });
});
