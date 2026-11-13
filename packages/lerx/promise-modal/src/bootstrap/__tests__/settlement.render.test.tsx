import { StrictMode, useState } from 'react';

import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import { ModalManager } from '@/promise-modal/app';
import {
  alertHandler,
  confirmHandler,
  promptHandler,
} from '@/promise-modal/core';
import { useModal } from '@/promise-modal/core/handle';
import { useDestroyAfter } from '@/promise-modal/providers/ModalManagerContext';

import { BootstrapProvider } from '../BootstrapProvider';

/** Flushes cancellation microtasks without waiting on an orphaned Promise. */
const flush = async () => {
  await act(async () => {
    await Promise.resolve();
  });
};
afterEach(() => {
  cleanup();
  ModalManager.reset();
  vi.restoreAllMocks();
});

it('R1 destroys and unmounts the frame immediately', async () => {
  render(<BootstrapProvider />);
  act(() => {
    alertHandler({ title: 'gone', duration: 0 });
  });
  fireEvent.click(await screen.findByText('Confirm'));
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 10));
  });
  expect(screen.queryByText('gone')).toBeNull();
});

it.each([false, true])(
  'R2 cancels open modals on provider unmount (strict=%s)',
  async (strict) => {
    const provider = <BootstrapProvider />;
    const view = render(
      strict ? <StrictMode>{provider}</StrictMode> : provider,
    );
    const results: unknown[] = [];
    act(() => {
      alertHandler({}).promiseHandler.then((value) => results.push(value));
      confirmHandler({}).promiseHandler.then((value) => results.push(value));
      promptHandler({ Input: () => null }).promiseHandler.then((value) =>
        results.push(value),
      );
    });
    view.unmount();
    await flush();
    expect(results).toEqual([undefined, false, null]);
  },
);

it('R15 destroying before close resolves the cancellation value', async () => {
  render(
    <BootstrapProvider
      ForegroundComponent={({
        onDestroy,
        children,
      }: import('react').PropsWithChildren<
        import('@/promise-modal/types/frame').ModalFrameProps
      >) => (
        <div>
          <button onClick={onDestroy}>destroy</button>
          {children}
        </div>
      )}
    />,
  );
  const result = vi.fn();
  act(() => {
    confirmHandler({}).promiseHandler.then(result);
  });
  fireEvent.click(await screen.findByText('destroy'));
  await flush();
  expect(result).toHaveBeenCalledWith(false);
});

it('R11 accumulates functional prompt changes in one event before synchronous confirm', async () => {
  render(<BootstrapProvider />);
  const result = vi.fn();
  act(() => {
    promptHandler<number>({
      defaultValue: 0,
      Input: ({ value, onChange, onConfirm }) => (
        <button
          onClick={() => {
            onChange((v) => (v ?? 0) + 1);
            onChange((v) => (v ?? 0) + 1);
            onConfirm();
          }}
        >
          value:{value}
        </button>
      ),
    }).promiseHandler.then(result);
  });
  fireEvent.click(await screen.findByText('value:0'));
  expect(screen.getByText('value:2')).toBeDefined();
  await flush();
  expect(result).toHaveBeenCalledWith(2);
});

it('R3 aborts a route-hidden modal without showing it on return', async () => {
  let setPath!: (path: string) => void;
  const usePathname = () => {
    const [pathname, update] = useState('/a');
    setPath = update;
    return { pathname };
  };
  render(<BootstrapProvider usePathname={usePathname} />);
  const controller = new AbortController();
  const result = vi.fn();
  let handled!: ReturnType<typeof confirmHandler>;
  act(() => {
    handled = confirmHandler({
      signal: controller.signal,
      manualDestroy: true,
    });
    handled.promiseHandler.then(result);
  });
  act(() => setPath('/b'));
  act(() => controller.abort());
  await flush();
  expect(result).toHaveBeenCalledWith(false);
  act(() => setPath('/a'));
  expect(handled.modalNode?.visible).toBe(false);
});

it('R4 cancels when the useModal owner unmounts in the route-change commit', async () => {
  let setPath!: (path: string) => void;
  const result = vi.fn();
  const Owner = () => {
    const { confirm } = useModal();
    return (
      <button
        onClick={() => {
          confirm({}).then(result);
        }}
      >
        open
      </button>
    );
  };
  const App = () => {
    const [pathname, update] = useState('/a');
    setPath = update;
    return (
      <>
        <BootstrapProvider usePathname={() => ({ pathname })} />
        {pathname === '/a' && <Owner />}
      </>
    );
  };
  render(<App />);
  fireEvent.click(screen.getByText('open'));
  act(() => setPath('/b'));
  await flush();
  expect(result).toHaveBeenCalledWith(false);
});

it('R5 preserves an unsettled route-hidden modal using useDestroyAfter', async () => {
  let setPath!: (path: string) => void;
  const usePathname = () => {
    const [pathname, update] = useState('/a');
    setPath = update;
    return { pathname };
  };
  const Frame = ({
    id,
    children,
  }: import('@/promise-modal/types/frame').ModalFrameProps & {
    children?: import('react').ReactNode;
  }) => {
    useDestroyAfter(id, 0);
    return <div>{children}</div>;
  };
  render(
    <BootstrapProvider usePathname={usePathname} ForegroundComponent={Frame} />,
  );
  let handled!: ReturnType<typeof alertHandler>;
  act(() => {
    handled = alertHandler({ title: 'preserved', manualDestroy: true });
  });
  act(() => setPath('/b'));
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 10));
  });
  expect(handled.modalNode?.alive).toBe(true);
  act(() => setPath('/a'));
  expect(handled.modalNode?.visible).toBe(true);
});

it('R14 clears the shared backdrop when the last modal is route-hidden', () => {
  let setPath!: (path: string) => void;
  const usePathname = () => {
    const [pathname, update] = useState('/a');
    setPath = update;
    return { pathname };
  };
  render(<BootstrapProvider usePathname={usePathname} />);
  act(() => {
    alertHandler({});
  });
  const backdrop = document.querySelector<HTMLElement>('[class^="backdrop-"]')!;
  expect(backdrop.style.opacity).toBe('1');
  act(() => setPath('/b'));
  expect(backdrop.style.opacity).toBe('0');
});

it('R21 never shows a settled manualDestroy modal on route return', async () => {
  let setPath!: (path: string) => void;
  const usePathname = () => {
    const [pathname, update] = useState('/a');
    setPath = update;
    return { pathname };
  };
  render(<BootstrapProvider usePathname={usePathname} />);
  let handled!: ReturnType<typeof alertHandler>;
  act(() => {
    handled = alertHandler({ manualDestroy: true });
  });
  fireEvent.click(await screen.findByText('Confirm'));
  act(() => setPath('/b'));
  act(() => setPath('/a'));
  expect(handled.modalNode?.visible).toBe(false);
});
