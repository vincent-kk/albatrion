import { createContext, useContext, useState } from 'react';

import { act, cleanup, render, screen } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import { ModalProvider, confirm } from '@/promise-modal';
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

it('control: keeps a modal settled while shown displayed for its manual exit animation', async () => {
  render(<App />);
  const controller = new AbortController();
  act(() => {
    void confirm({ title: 'Delete?', signal: controller.signal });
  });
  const wrapper = screen.getByText('Confirm').closest('[tabindex="-1"]')!;
  await act(async () => controller.abort());
  expect(wrapper.classList.contains(foregroundVisible)).toBe(true);
});
