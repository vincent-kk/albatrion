import { createContext, useContext, useState } from 'react';

import { act, cleanup, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import { ModalProvider, confirm } from '@/promise-modal';
import { ModalManager } from '@/promise-modal/app';
import { visible as foregroundVisible } from '@/promise-modal/components/Foreground/styles/style';

afterEach(() => {
  cleanup();
  ModalManager.reset();
  vi.restoreAllMocks();
});

const Route = createContext('/editor');
const useAppPathname = () => ({ pathname: useContext(Route) });

let navigate: (path: string) => void = () => {};
function App({ manualDestroy }: { manualDestroy: boolean }) {
  const [pathname, setPathname] = useState('/editor');
  navigate = setPathname;
  return (
    <Route.Provider value={pathname}>
      <ModalProvider usePathname={useAppPathname} options={{ manualDestroy }} />
    </Route.Provider>
  );
}

it.each([false, true])(
  '(round-2 promise-modal 2) route hiding removes the frame from display and keyboard reach (manualDestroy=%s)',
  async (manualDestroy) => {
    render(<App manualDestroy={manualDestroy} />);
    let result: boolean | undefined;
    act(() => {
      void confirm({ title: 'Delete everything?' }).then((value) => {
        result = value;
      });
    });
    const confirmButton = screen.getByText('Confirm');
    act(() => navigate('/other'));
    const id = ModalManager.ids[0];
    expect(ModalManager.node(id)?.visible).toBe(false);
    const wrapper = confirmButton.closest('[tabindex="-1"]')!;
    // Contract: route hiding hides the request without settling it.
    expect(wrapper.classList.contains(foregroundVisible)).toBe(false);
    // In a browser the displayed frame keeps its controls in the Tab order of
    // the new route, so Enter on them settles a request the user cannot see.
    expect(confirmButton.closest('[inert]')).toBeNull();
    expect(result).toBeUndefined();
  },
);
