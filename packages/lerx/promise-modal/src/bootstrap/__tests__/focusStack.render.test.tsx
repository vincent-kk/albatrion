import { type PropsWithChildren, useState } from 'react';

import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import { ModalManager } from '@/promise-modal/app';
import { alertHandler, confirmHandler } from '@/promise-modal/core';
import type { ModalFrameProps } from '@/promise-modal/types';

import { BootstrapProvider } from '../BootstrapProvider';

/** Exposes committed context so a focus assertion also proves a real rerender. */
const ContextFrame = ({
  children,
  context,
}: PropsWithChildren<ModalFrameProps>) => (
  <section
    data-testid="context-frame"
    data-version={'version' in context ? String(context.version) : ''}
  >
    {children}
  </section>
);

afterEach(() => {
  cleanup();
  ModalManager.reset();
});

it('keeps native Tab order for a nondimmed top modal above a dimmed modal', () => {
  const view = render(<BootstrapProvider />);
  act(() => {
    confirmHandler({ title: 'lower dimmed' });
    alertHandler({
      dimmed: false,
      closeOnBackdropClick: false,
      content: (
        <>
          <button>toast-first</button>
          <button>toast-last</button>
        </>
      ),
      footer: false,
    });
  });
  const last = screen.getByText('toast-last');
  last.focus();
  const event = new KeyboardEvent('keydown', {
    key: 'Tab',
    bubbles: true,
    cancelable: true,
  });
  fireEvent(last, event);
  expect(event.defaultPrevented).toBe(false);
  expect(document.activeElement).toBe(last);
  expect(view.container.hasAttribute('inert')).toBe(true);
});

it('moves focus back into a route-restored modal and restores its page opener on close', () => {
  let setPath!: (pathname: string) => void;
  const useTestPathname = () => {
    const [pathname, update] = useState('/origin');
    setPath = update;
    return { pathname };
  };
  render(
    <BootstrapProvider usePathname={useTestPathname}>
      <button>page opener</button>
    </BootstrapProvider>,
  );
  const opener = screen.getByText('page opener');
  opener.focus();
  let handle!: ReturnType<typeof confirmHandler>;
  act(() => {
    handle = confirmHandler({
      content: <button>modal control</button>,
      footer: false,
    });
  });
  expect(document.activeElement).toBe(screen.getByText('modal control'));
  act(() => setPath('/away'));
  opener.focus();
  expect(document.activeElement).toBe(opener);
  act(() => setPath('/origin'));
  expect(document.activeElement).toBe(screen.getByText('modal control'));
  act(() => handle.modalNode?.onClose());
  expect(document.activeElement).toBe(opener);
});

it('focuses only the top participant when a stack reappears on its route', () => {
  let setPath!: (pathname: string) => void;
  const useTestPathname = () => {
    const [pathname, update] = useState('/origin');
    setPath = update;
    return { pathname };
  };
  render(
    <BootstrapProvider usePathname={useTestPathname}>
      <button>page opener</button>
    </BootstrapProvider>,
  );
  act(() => {
    confirmHandler({ content: <button>lower control</button>, footer: false });
    confirmHandler({ content: <button>upper control</button>, footer: false });
  });
  expect(document.activeElement).toBe(screen.getByText('upper control'));
  act(() => setPath('/away'));
  screen.getByText('page opener').focus();
  act(() => setPath('/origin'));
  expect(document.activeElement).toBe(screen.getByText('upper control'));
});

it('preserves the user-selected inner control through a committed context change', () => {
  const view = render(
    <BootstrapProvider
      ForegroundComponent={ContextFrame}
      context={{ version: 1 }}
    />,
  );
  act(() => {
    confirmHandler({
      content: (
        <>
          <button>first control</button>
          <button>user-selected control</button>
        </>
      ),
      footer: false,
    });
  });
  const selected = screen.getByText('user-selected control');
  selected.focus();
  view.rerender(
    <BootstrapProvider
      ForegroundComponent={ContextFrame}
      context={{ version: 2 }}
    />,
  );
  expect(screen.getByTestId('context-frame').getAttribute('data-version')).toBe(
    '2',
  );
  expect(document.activeElement).toBe(selected);
});

it('keeps different initiators from participating together after a route commit', () => {
  let setPath!: (pathname: string) => void;
  const useTestPathname = () => {
    const [pathname, update] = useState('/first');
    setPath = update;
    return { pathname };
  };
  render(<BootstrapProvider usePathname={useTestPathname} />);
  let first!: ReturnType<typeof confirmHandler>;
  let second!: ReturnType<typeof confirmHandler>;
  act(() => {
    first = confirmHandler({
      content: <button>first route control</button>,
      footer: false,
    });
  });
  act(() => setPath('/second'));
  act(() => {
    second = confirmHandler({
      content: <button>second route control</button>,
      footer: false,
    });
  });
  expect(first.modalNode?.initiator).toBe('/first');
  expect(second.modalNode?.initiator).toBe('/second');
  expect(first.modalNode?.visible).toBe(false);
  expect(second.modalNode?.visible).toBe(true);
  act(() => setPath('/first'));
  expect(first.modalNode?.visible).toBe(true);
  expect(second.modalNode?.visible).toBe(false);
  expect(document.activeElement).toBe(screen.getByText('first route control'));
});
