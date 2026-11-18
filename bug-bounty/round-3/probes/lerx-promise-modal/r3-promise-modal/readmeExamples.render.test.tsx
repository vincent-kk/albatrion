import {
  type PropsWithChildren,
  type ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';

import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import {
  type ModalFrameProps,
  ModalProvider,
  alert,
  confirm,
  prompt,
} from '@/promise-modal';
import { ModalManager } from '@/promise-modal/app';

afterEach(() => {
  cleanup();
  ModalManager.reset();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

const flush = () => act(async () => {});

// README "Results and input", verbatim.
async function editName() {
  if (!(await confirm({ title: 'Edit name?' }))) return;
  const name = await prompt<string>({
    title: 'Name',
    defaultValue: '',
    Input: ({ value, onChange }) => (
      <input
        aria-label="Name"
        value={value ?? ''}
        onChange={(event) => onChange(event.target.value)}
      />
    ),
    disabled: (value) => !value?.trim(),
  });
  if (name === null || name === undefined) return;
  await alert({ title: 'Saved', content: name, subtype: 'success' });
}

it('runs the README editName flow literally', async () => {
  render(<ModalProvider />);
  let done = false;
  await act(async () => {
    void editName().then(() => {
      done = true;
    });
  });
  await act(async () => fireEvent.click(screen.getByText('Confirm')));
  await flush();
  const input = screen.getByLabelText('Name') as HTMLInputElement;
  const confirmButtons = () => screen.getAllByText('Confirm');
  const promptConfirm = confirmButtons()[confirmButtons().length - 1];
  expect((promptConfirm as HTMLButtonElement).disabled).toBe(true);
  await act(async () => fireEvent.change(input, { target: { value: 'Ann' } }));
  expect((promptConfirm as HTMLButtonElement).disabled).toBe(false);
  await act(async () => fireEvent.click(promptConfirm));
  await flush();
  expect(screen.getByText('Ann')).toBeTruthy();
  const all = confirmButtons();
  await act(async () => fireEvent.click(all[all.length - 1]));
  await flush();
  expect(done).toBe(true);
});

// README "Per-call footers and nested modals", verbatim.
function nestedConfirmation() {
  return confirm({
    title: 'Review',
    footer: ({ onConfirm, onCancel }) => (
      <>
        <button onClick={onCancel}>Cancel</button>
        <button
          onClick={async () => {
            if (
              await confirm({
                title: 'Are you sure?',
                closeOnBackdropClick: false,
              })
            ) {
              onConfirm();
            } else {
              onCancel();
            }
          }}
        >
          Continue
        </button>
      </>
    ),
  });
}

it.each([
  ['Confirm', true],
  ['Cancel', false],
] as const)(
  'runs the README nestedConfirmation literally (inner %s)',
  async (choice, expected) => {
    render(<ModalProvider />);
    let result: boolean | undefined;
    await act(async () => {
      void nestedConfirmation().then((value) => {
        result = value;
      });
    });
    await act(async () => fireEvent.click(screen.getByText('Continue')));
    expect(screen.getByText('Are you sure?')).toBeTruthy();
    const buttons = screen.getAllByText(choice);
    await act(async () => fireEvent.click(buttons[buttons.length - 1]));
    await flush();
    expect(result).toBe(expected);
  },
);

// SPECIFICATION "Toasts", verbatim.
function ToastFrame({ children, onClose }: PropsWithChildren<ModalFrameProps>) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);
  return (
    <aside
      role="status"
      style={{
        position: 'fixed',
        bottom: 20,
        background: '#222',
        color: 'white',
      }}
    >
      {children}
    </aside>
  );
}

function toast(message: ReactNode) {
  return alert({
    content: message,
    footer: false,
    dimmed: false,
    closeOnBackdropClick: false,
    ForegroundComponent: ToastFrame,
  });
}

it('closes the SPECIFICATION toast after 3 seconds even while other modals publish', async () => {
  vi.useFakeTimers();
  render(<ModalProvider />);
  let closed = false;
  await act(async () => {
    void toast('Saved').then(() => {
      closed = true;
    });
  });
  // Unrelated modals open and close while the toast is up.
  for (let step = 0; step < 6; step++) {
    await act(async () => {
      void confirm({ title: `Peer ${step}`, dimmed: false });
      vi.advanceTimersByTime(400);
    });
  }
  await act(async () => {
    vi.advanceTimersByTime(800);
  });
  expect(closed).toBe(true);
});

// SPECIFICATION "Ownership and route visibility", verbatim.
const Route = createContext('/editor');
function useAppPathname() {
  return { pathname: useContext(Route) };
}

function RoutedApp() {
  const [pathname, setPathname] = useState('/editor');
  return (
    <Route.Provider value={pathname}>
      <ModalProvider usePathname={useAppPathname}>
        <button onClick={() => setPathname('/editor')}>Editor</button>
        <button
          onClick={() =>
            void alert({
              title: 'Editor request',
              content: () => (
                <button onClick={() => setPathname('/other')}>
                  Hide by changing route
                </button>
              ),
            })
          }
        >
          Open
        </button>
      </ModalProvider>
    </Route.Provider>
  );
}

it('runs the SPECIFICATION RoutedApp literally', async () => {
  render(<RoutedApp />);
  await act(async () => fireEvent.click(screen.getByText('Open')));
  const id = ModalManager.ids[0];
  await act(async () =>
    fireEvent.click(screen.getByText('Hide by changing route')),
  );
  expect(ModalManager.node(id)?.visible).toBe(false);
  expect(screen.getByText('Editor').closest('[inert]')).toBeNull();
  await act(async () => fireEvent.click(screen.getByText('Editor')));
  expect(ModalManager.node(id)?.visible).toBe(true);
  expect(ModalManager.node(id)?.settled).toBe(false);
});
