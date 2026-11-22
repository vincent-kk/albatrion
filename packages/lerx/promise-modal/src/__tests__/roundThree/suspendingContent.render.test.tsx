import { Suspense, lazy } from 'react';

import { act, cleanup, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import { ModalProvider, confirm, prompt } from '@/promise-modal';
import { ModalManager } from '@/promise-modal/app';

afterEach(() => {
  cleanup();
  ModalManager.reset();
  vi.restoreAllMocks();
});

/** A code-split dialog body whose chunk arrives when the test resolves it. */
const createLazyContent = () => {
  let load!: () => void;
  const chunk = new Promise<void>((resolve) => {
    load = resolve;
  });
  const Content = lazy(() =>
    chunk.then(() => ({ default: () => <p>Heavy form loaded</p> })),
  );
  return { Content, load };
};

function App() {
  return (
    <Suspense fallback={<p>Loading page</p>}>
      <ModalProvider>
        <main>page</main>
      </ModalProvider>
    </Suspense>
  );
}

it('keeps a request whose code-split content suspends, and its peers, pending', async () => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
  render(<App />);
  let draft: string | null | undefined = 'pending';
  act(() => {
    void prompt<string>({
      title: 'Draft',
      defaultValue: 'typed text',
      Input: ({ value, onChange }) => (
        <input
          aria-label="Draft"
          value={value ?? ''}
          onChange={(event) => onChange(event.target.value)}
        />
      ),
    }).then((value) => {
      draft = value;
    });
  });
  expect(screen.getByLabelText('Draft')).toBeTruthy();
  const { Content, load } = createLazyContent();
  let accepted: boolean | undefined;
  let thrown: unknown;
  try {
    await act(async () => {
      void confirm({ title: 'Heavy', content: <Content /> }).then((value) => {
        accepted = value;
      });
    });
    await act(async () => {
      load();
    });
    await act(async () => {});
  } catch (error) {
    thrown = error;
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50));
    });
    console.info('after-crash', {
      page: !!screen.queryByText('page'),
      fallback: !!screen.queryByText('Loading page'),
      accepted,
      draft,
      ids: ModalManager.ids.length,
    });
  }
  // Suspension is not a failure and not a user decision; nothing may settle,
  // and opening one request must not throw out of the application's root.
  expect({
    thrown: thrown instanceof Error ? thrown.message.slice(0, 31) : thrown,
    accepted,
    draft,
  }).toEqual({ thrown: undefined, accepted: undefined, draft: 'pending' });
  expect(screen.getByText('Heavy form loaded')).toBeTruthy();
});

it('reports what happens with no Suspense boundary above the Provider (diagnostic)', async () => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
  render(
    <ModalProvider>
      <main>page</main>
    </ModalProvider>,
  );
  const { Content, load } = createLazyContent();
  let outcome: unknown = 'pending';
  let thrown: unknown;
  try {
    await act(async () => {
      void confirm({ title: 'Heavy', content: <Content /> }).then(
        (value) => {
          outcome = value;
        },
        (error: unknown) => {
          outcome = `rejected: ${String(error).slice(0, 60)}`;
        },
      );
    });
    await act(async () => {
      load();
    });
    await act(async () => {});
  } catch (error) {
    thrown = error;
  }
  expect({
    thrown: thrown instanceof Error ? thrown.message.slice(0, 31) : thrown,
    outcome,
    loaded: !!screen.queryByText('Heavy form loaded'),
  }).toEqual({ thrown: undefined, outcome: 'pending', loaded: true });
});

it('control: the same lazy content renders when the content brings its own Suspense', async () => {
  render(<App />);
  const { Content, load } = createLazyContent();
  let accepted: boolean | undefined;
  await act(async () => {
    void confirm({
      title: 'Heavy',
      content: (
        <Suspense fallback={<p>Loading form</p>}>
          <Content />
        </Suspense>
      ),
    }).then((value) => {
      accepted = value;
    });
  });
  await act(async () => {
    load();
  });
  await act(async () => {});
  expect(accepted).toBeUndefined();
  expect(screen.getByText('Heavy form loaded')).toBeTruthy();
});
