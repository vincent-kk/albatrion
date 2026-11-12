import { type PropsWithChildren, useEffect } from 'react';

import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import { ModalManager } from '@/promise-modal/app';
import { alertHandler, promptHandler } from '@/promise-modal/core';
import { useModal } from '@/promise-modal/hooks/useModal';
import { useModalDuration } from '@/promise-modal/hooks/useModalDuration';
import { useConfigurationOptions } from '@/promise-modal/providers';
import type { ModalFrameProps } from '@/promise-modal/types';

import { BootstrapProvider } from '../BootstrapProvider';

afterEach(() => {
  cleanup();
  ModalManager.reset();
  vi.restoreAllMocks();
});

it('R7 inherits provider values for explicit undefined modal fields', () => {
  render(
    <BootstrapProvider
      options={{
        duration: '80ms',
        manualDestroy: true,
        closeOnBackdropClick: false,
      }}
    />,
  );
  let handled!: ReturnType<typeof alertHandler>;
  act(() => {
    handled = alertHandler({
      duration: undefined,
      manualDestroy: undefined,
      closeOnBackdropClick: undefined,
    });
  });
  expect(handled.modalNode).toMatchObject({
    duration: 80,
    manualDestroy: true,
    closeOnBackdropClick: false,
  });
});

it('R7 inherits useModal defaults while preserving explicit zero and false', () => {
  function Caller() {
    const { alert } = useModal({
      duration: 60,
      manualDestroy: true,
      closeOnBackdropClick: false,
    });
    return (
      <button
        onClick={() => {
          void alert({
            duration: undefined,
            manualDestroy: undefined,
            closeOnBackdropClick: undefined,
          });
        }}
      >
        open
      </button>
    );
  }
  render(
    <BootstrapProvider>
      <Caller />
    </BootstrapProvider>,
  );
  fireEvent.click(screen.getByText('open'));
  expect(ModalManager.node(ModalManager.ids[0])).toMatchObject({
    duration: 60,
    manualDestroy: true,
    closeOnBackdropClick: false,
  });
  let handled!: ReturnType<typeof alertHandler>;
  act(() => {
    handled = alertHandler({
      duration: 0,
      manualDestroy: false,
      closeOnBackdropClick: false,
    });
  });
  expect(handled.modalNode).toMatchObject({
    duration: 0,
    manualDestroy: false,
    closeOnBackdropClick: false,
  });
});

it.each([
  { duration: 300, expected: '300ms' },
  { duration: '300.0ms', expected: '300ms' },
  { duration: '0.3s', expected: '300ms' },
  { duration: 0.5, expected: '0.5ms' },
  { duration: '0.5ms', expected: '0.5ms' },
  { duration: '0.0005s', expected: '0.5ms' },
] as const)(
  'R8 normalizes provider duration $duration to $expected',
  ({ duration, expected }) => {
    function Frame({ id, children }: PropsWithChildren<ModalFrameProps>) {
      const global = useConfigurationOptions();
      const local = useModalDuration(id);
      return (
        <section
          data-testid="duration"
          data-global={global.duration}
          data-local={local.duration}
        >
          {children}
        </section>
      );
    }
    render(
      <BootstrapProvider ForegroundComponent={Frame} options={{ duration }} />,
    );
    act(() => {
      alertHandler({});
    });
    expect(screen.getByTestId('duration').dataset).toMatchObject({
      global: expected,
      local: expected,
    });
    expect(
      document
        .querySelector('[style*="--transition-duration"]')
        ?.getAttribute('style'),
    ).toContain(`--transition-duration: ${expected}`);
  },
);

it('R8 uses defaults for undefined provider options and warns for invalid duration', () => {
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
  const invalid = JSON.parse('{"duration":"invalid"}');
  const view = render(
    <BootstrapProvider options={{ zIndex: undefined, duration: undefined }} />,
  );
  act(() => {
    alertHandler({});
  });
  expect(ModalManager.node(ModalManager.ids[0])?.duration).toBe(300);
  expect(
    document.querySelector('[style*="--z-index"]')?.getAttribute('style'),
  ).toContain('--z-index: 1000');
  view.rerender(<BootstrapProvider options={invalid} />);
  act(() => {
    alertHandler({});
  });
  expect(ModalManager.node(ModalManager.ids[1])?.duration).toBe(300);
  expect(warn).toHaveBeenCalledWith(expect.stringContaining('duration'));
});

it('R8 normalizes per-call duration strings without rejecting the request', () => {
  render(<BootstrapProvider options={{ duration: '100ms' }} />);
  let handled!: ReturnType<typeof alertHandler>;
  act(() => {
    handled = alertHandler({ duration: '0.025s' });
  });
  expect(handled.modalNode?.duration).toBe(25);
});

it('R17 warns once per changed component prop and keeps prompt input mounted', () => {
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
  const mounted = vi.fn();
  const view = render(
    <BootstrapProvider
      ContentComponent={({ children }) => {
        useEffect(mounted, []);
        return <article>{children}</article>;
      }}
    />,
  );
  act(() => {
    promptHandler<string>({
      content: 'input',
      Input: ({ value, onChange }) => (
        <input
          aria-label="value"
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
        />
      ),
    });
  });
  fireEvent.change(screen.getByLabelText('value'), {
    target: { value: 'retained' },
  });
  for (let index = 0; index < 2; index++)
    view.rerender(
      <BootstrapProvider
        ContentComponent={({ children }) => <aside>{children}</aside>}
        TitleComponent={({ children }) => <h1>{children}</h1>}
      />,
    );
  expect((screen.getByLabelText('value') as HTMLInputElement).value).toBe(
    'retained',
  );
  expect(mounted).toHaveBeenCalledTimes(1);
  expect(
    warn.mock.calls.filter(([message]) =>
      String(message).includes('ContentComponent'),
    ),
  ).toHaveLength(1);
  expect(
    warn.mock.calls.filter(([message]) =>
      String(message).includes('TitleComponent'),
    ),
  ).toHaveLength(1);
});

it('R17 captures component props at bootstrap mount even while root is null', () => {
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
  const InitialContent = ({ children }: PropsWithChildren) => (
    <article data-testid="initial-content">{children}</article>
  );
  const LaterContent = ({ children }: PropsWithChildren) => (
    <aside>{children}</aside>
  );
  const view = render(
    <BootstrapProvider root={null} ContentComponent={InitialContent} />,
  );
  view.rerender(
    <BootstrapProvider root={null} ContentComponent={LaterContent} />,
  );
  expect(
    warn.mock.calls.filter(([message]) =>
      String(message).includes('ContentComponent'),
    ),
  ).toHaveLength(1);
  view.rerender(
    <BootstrapProvider root={document.body} ContentComponent={LaterContent} />,
  );
  act(() => {
    alertHandler({ content: 'initial component' });
  });
  expect(screen.getByTestId('initial-content').textContent).toBe(
    'initial component',
  );
  expect(
    warn.mock.calls.filter(([message]) =>
      String(message).includes('ContentComponent'),
    ),
  ).toHaveLength(1);
});
