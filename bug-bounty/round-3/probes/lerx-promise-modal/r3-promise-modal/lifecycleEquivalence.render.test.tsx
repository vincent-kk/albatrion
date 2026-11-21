import { Fragment, StrictMode } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';

import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import {
  ModalProvider,
  confirm,
  prompt,
  useActiveModalCount,
} from '@/promise-modal';
import { ModalManager } from '@/promise-modal/app';

afterEach(() => {
  cleanup();
  ModalManager.reset();
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

function Status() {
  const count = useActiveModalCount();
  return <output>{count} open</output>;
}

/** Records what a consumer observes through a nested prompt-over-confirm flow. */
const runFlow = async () => {
  const opener = screen.getByText('Open');
  opener.focus();
  let confirmResult: boolean | undefined;
  let promptResult: string | null | undefined;
  void confirm({ title: 'Lower' }).then((value) => {
    confirmResult = value;
  });
  await act(async () => {});
  await act(async () => {
    void prompt<string>({
      title: 'Upper',
      defaultValue: '',
      Input: ({ value, onChange }) => (
        <input
          aria-label="Upper input"
          value={value ?? ''}
          onChange={(event) => onChange(event.target.value)}
        />
      ),
    }).then((value) => {
      promptResult = value;
    });
  });
  const input = screen.getByLabelText('Upper input') as HTMLInputElement;
  const focusedUpper = document.activeElement === input;
  await act(async () => {
    fireEvent.change(input, { target: { value: 'typed' } });
  });
  await act(async () => {
    fireEvent.keyDown(input, { key: 'Escape' });
  });
  const afterFirstEscape = { confirmResult, promptResult };
  await act(async () => {
    fireEvent.keyDown(document.activeElement ?? document.body, {
      key: 'Escape',
    });
  });
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 350));
  });
  return {
    focusedUpper,
    afterFirstEscape,
    confirmResult,
    promptResult,
    focusReturned: document.activeElement === opener,
    status: screen.getByRole('status').textContent,
    inert: document.querySelectorAll('[inert]').length,
    overflow: document.body.style.overflow,
    ids: ModalManager.ids.length,
  };
};

const expected = {
  focusedUpper: true,
  afterFirstEscape: { confirmResult: undefined, promptResult: null },
  confirmResult: false,
  promptResult: null,
  focusReturned: true,
  status: '0 open',
  inert: 0,
  overflow: '',
  ids: 0,
};

function App() {
  return (
    <ModalProvider>
      <button>Open</button>
      <Status />
    </ModalProvider>
  );
}

it.each([
  ['plain', Fragment],
  ['StrictMode', StrictMode],
] as const)('gives the nested flow the same result under %s', async (_, Wrapper) => {
  render(
    <Wrapper>
      <App />
    </Wrapper>,
  );
  const flow = runFlow();
  expect(await flow).toEqual({ ...expected });
});

it('hydrates a server-rendered Provider without errors and then opens modals', async () => {
  // jsdom defines window, so the module selects useLayoutEffect even for this
  // in-process server render; only the hydration below is checked for errors.
  const html = renderToString(<App />);
  const error = vi.spyOn(console, 'error').mockImplementation(() => {});
  const container = document.createElement('div');
  container.innerHTML = html;
  document.body.append(container);
  let root!: ReturnType<typeof hydrateRoot>;
  await act(async () => {
    root = hydrateRoot(container, <App />);
  });
  expect(error.mock.calls.map((call) => String(call[0]))).toEqual([]);
  let result: boolean | undefined;
  await act(async () => {
    void confirm({ title: 'After hydration' }).then((value) => {
      result = value;
    });
  });
  expect(screen.getByText('After hydration')).toBeTruthy();
  expect(screen.getByRole('status').textContent).toBe('1 open');
  await act(async () => {
    fireEvent.click(screen.getByText('Confirm'));
  });
  expect(result).toBe(true);
  act(() => root.unmount());
});
