import { useState } from 'react';

import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import {
  ModalProvider,
  type PromptInputProps,
  alert,
  confirm,
  prompt,
  useModal,
} from '@/promise-modal';
import { ModalManager } from '@/promise-modal/app';

/** Angle EQ10: several requests opened (and closed) in one task against one at a time. */
afterEach(() => {
  cleanup();
  ModalManager.reset();
  vi.restoreAllMocks();
});

function Input({ value, onChange }: PromptInputProps<string>) {
  return (
    <input
      aria-label="Name"
      value={value ?? ''}
      onChange={(event) => onChange(event.target.value)}
    />
  );
}

const flush = () =>
  act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 10));
  });

type Results = Record<string, unknown>;
function openAll(results: Results, signal?: AbortSignal) {
  void alert({ title: 'A', signal }).then(() => (results.alert = 'done'));
  void confirm({ title: 'C', signal }).then((v) => (results.confirm = v));
  void prompt<string>({ title: 'P', Input, signal }).then(
    (v) => (results.prompt = v),
  );
}

function page(onOpen: () => void) {
  return (
    <ModalProvider options={{ duration: 0 }}>
      <main>
        <button onClick={onOpen}>Open</button>
      </main>
    </ModalProvider>
  );
}

function state() {
  return {
    focus:
      document.activeElement?.textContent ||
      document.activeElement?.getAttribute('aria-label') ||
      document.activeElement?.tagName,
    inert: !!document.querySelector('main')?.closest('[inert]'),
    overflow: document.body.style.overflow,
    live: ModalManager.ids.length,
  };
}

const settledState = { focus: 'Open', inert: false, overflow: '', live: 0 };

it('settles three requests opened in one task with three Escape presses, top first', async () => {
  const results: Results = {};
  render(page(() => openAll(results)));
  const opener = screen.getByText('Open');
  opener.focus();
  act(() => fireEvent.click(opener));
  const steps: unknown[] = [];
  for (let press = 0; press < 3; press++) {
    act(() => {
      fireEvent.keyDown(document.activeElement ?? document.body, {
        key: 'Escape',
      });
    });
    await flush();
    steps.push({ ...results });
  }
  expect(steps).toEqual([
    { prompt: null },
    { prompt: null, confirm: false },
    { prompt: null, confirm: false, alert: 'done' },
  ]);
  expect(state()).toEqual(settledState);
});

it('settles the same three requests opened one at a time with three Escape presses', async () => {
  const results: Results = {};
  render(page(() => {}));
  const opener = screen.getByText('Open');
  opener.focus();
  act(() => {
    void alert({ title: 'A' }).then(() => (results.alert = 'done'));
  });
  act(() => {
    void confirm({ title: 'C' }).then((v) => (results.confirm = v));
  });
  act(() => {
    void prompt<string>({ title: 'P', Input }).then(
      (v) => (results.prompt = v),
    );
  });
  for (let press = 0; press < 3; press++) {
    act(() => {
      fireEvent.keyDown(document.activeElement ?? document.body, {
        key: 'Escape',
      });
    });
    await flush();
  }
  expect(results).toEqual({ prompt: null, confirm: false, alert: 'done' });
  expect(state()).toEqual(settledState);
});

it('settles three requests opened in one task through one shared signal', async () => {
  const results: Results = {};
  const controller = new AbortController();
  render(page(() => openAll(results, controller.signal)));
  const opener = screen.getByText('Open');
  opener.focus();
  act(() => fireEvent.click(opener));
  act(() => controller.abort());
  await flush();
  expect(results).toEqual({ alert: 'done', confirm: false, prompt: null });
  expect(state()).toEqual(settledState);
});

it('cancels three requests opened in one task from a useModal caller that leaves', async () => {
  const results: Results = {};
  function Caller() {
    const modal = useModal();
    return (
      <button
        onClick={() => {
          void modal.alert({ title: 'A' }).then(() => (results.alert = 'done'));
          void modal.confirm({ title: 'C' }).then((v) => (results.confirm = v));
          void modal
            .prompt<string>({ title: 'P', Input })
            .then((v) => (results.prompt = v));
        }}
      >
        Caller
      </button>
    );
  }
  function App() {
    const [shown, setShown] = useState(true);
    return (
      <ModalProvider options={{ duration: 0 }}>
        <main>
          <button onClick={() => {}}>Open</button>
          {shown && <Caller />}
          <button data-testid="hide" onClick={() => setShown(false)} />
        </main>
      </ModalProvider>
    );
  }
  render(<App />);
  screen.getByText('Open').focus();
  act(() => fireEvent.click(screen.getByText('Caller')));
  act(() => fireEvent.click(screen.getByTestId('hide')));
  await flush();
  expect(results).toEqual({ alert: 'done', confirm: false, prompt: null });
  expect({ ...state(), focus: undefined }).toEqual({
    ...settledState,
    focus: undefined,
  });
});

it('confirms the top prompt opened in one task with typed input while lower requests stay pending', async () => {
  const results: Results = {};
  render(page(() => openAll(results)));
  act(() => fireEvent.click(screen.getByText('Open')));
  fireEvent.change(screen.getByLabelText('Name'), {
    target: { value: 'typed' },
  });
  const confirms = screen.getAllByText('Confirm');
  act(() => fireEvent.click(confirms[confirms.length - 1]));
  await flush();
  expect(results).toEqual({ prompt: 'typed' });
  expect(ModalManager.ids.length).toBe(2);
});
