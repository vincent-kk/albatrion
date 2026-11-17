import { StrictMode, useEffect, useRef } from 'react';

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

import {
  BootstrapProvider,
  type BootstrapProviderHandle,
  useBootstrap,
} from '../BootstrapProvider';

const roots: HTMLElement[] = [];
const makeRoot = () => {
  const root = document.createElement('div');
  document.body.appendChild(root);
  roots.push(root);
  return root;
};
const anchors = () => document.querySelectorAll('[id^="promise-modal-"]');
afterEach(() => {
  cleanup();
  ModalManager.reset();
  for (const root of roots.splice(0)) root.remove();
  vi.restoreAllMocks();
});

it('moves one anchor with the documented ref initialization example', () => {
  function App({ root }: { root?: HTMLElement }) {
    const provider = useRef<BootstrapProviderHandle>(null);
    const container = useRef<HTMLDivElement>(null);
    useEffect(() => {
      if (container.current) provider.current?.initialize(container.current);
    }, []);
    return (
      <BootstrapProvider ref={provider} root={root}>
        <div ref={container} data-testid="container" />
      </BootstrapProvider>
    );
  }
  const view = render(<App />);
  expect(anchors()).toHaveLength(1);
  expect(screen.getByTestId('container').contains(anchors()[0])).toBe(true);
  const next = makeRoot();
  view.rerender(<App root={next} />);
  expect(anchors()).toHaveLength(1);
  expect(next.contains(anchors()[0])).toBe(true);
});

it('initializes automatically with a ref unless root is null', () => {
  render(<BootstrapProvider ref={{ current: null }} />);
  expect(anchors()).toHaveLength(1);
});

it('moves an open prompt between roots without remounting input or settling', async () => {
  const first = makeRoot();
  const second = makeRoot();
  const view = render(<BootstrapProvider root={first} />);
  const settled = vi.fn();
  let handled!: ReturnType<typeof promptHandler<string>>;
  act(() => {
    handled = promptHandler<string>({
      Input: ({ value, onChange }) => (
        <input
          aria-label="value"
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
        />
      ),
    });
    handled.promiseHandler.then(settled);
  });
  const input = screen.getByLabelText('value');
  fireEvent.change(input, { target: { value: 'retained' } });
  const anchor = anchors()[0];
  view.rerender(<BootstrapProvider root={null} />);
  expect(input.isConnected).toBe(false);
  expect(settled).not.toHaveBeenCalled();
  view.rerender(<BootstrapProvider root={second} />);
  expect(second.contains(anchor)).toBe(true);
  expect(screen.getByLabelText('value')).toBe(input);
  expect((input as HTMLInputElement).value).toBe('retained');
  expect(settled).not.toHaveBeenCalled();
  fireEvent.click(screen.getByText('Confirm'));
  await expect(handled.promiseHandler).resolves.toBe('retained');
});

it('detaches for null, retains open nodes, queues new requests and resumes', () => {
  const root = makeRoot();
  const view = render(<BootstrapProvider root={root} />);
  act(() => {
    alertHandler({ title: 'existing' });
  });
  const anchor = anchors()[0];
  view.rerender(<BootstrapProvider root={null} />);
  expect(anchor.isConnected).toBe(false);
  expect(ModalManager.ids).toHaveLength(1);
  act(() => {
    alertHandler({ title: 'queued' });
  });
  expect(ModalManager.ids).toHaveLength(1);
  expect(ModalManager.prerender).toHaveLength(1);
  view.rerender(<BootstrapProvider root={root} />);
  expect(anchors()[0]).toBe(anchor);
  expect(screen.getByText('existing')).toBeDefined();
  expect(screen.getByText('queued')).toBeDefined();
});

it('queues requests before and after a null initial root until a root appears', () => {
  alertHandler({ title: 'before' });
  const view = render(<BootstrapProvider root={null} />);
  act(() => {
    alertHandler({ title: 'after' });
  });
  expect(anchors()).toHaveLength(0);
  expect(ModalManager.ids).toHaveLength(0);
  expect(ModalManager.prerender).toHaveLength(2);
  view.rerender(<BootstrapProvider root={makeRoot()} />);
  expect(screen.getByText('before')).toBeDefined();
  expect(screen.getByText('after')).toBeDefined();
});

it('keeps one anchor under StrictMode with a declared root', () => {
  const root = makeRoot();
  render(
    <StrictMode>
      <BootstrapProvider root={root} />
    </StrictMode>,
  );
  expect(anchors()).toHaveLength(1);
  expect(root.contains(anchors()[0])).toBe(true);
});

it('keeps a null-root owner while a waiter exists and removes null waiters', () => {
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  const root = makeRoot();
  const waiter = makeRoot();
  const view = render(
    <>
      <BootstrapProvider key="owner" root={root} />
      <BootstrapProvider key="waiter" root={waiter} />
    </>,
  );
  view.rerender(
    <>
      <BootstrapProvider key="owner" root={null} />
      <BootstrapProvider key="waiter" root={waiter} />
    </>,
  );
  expect(anchors()).toHaveLength(0);
  view.rerender(
    <>
      <BootstrapProvider key="owner" root={null} />
      <BootstrapProvider key="waiter" root={null} />
    </>,
  );
  view.rerender(<BootstrapProvider key="waiter" root={null} />);
  expect(anchors()).toHaveLength(0);
});

it('uses the last initialize or root change and supports manual hook initialization', () => {
  const first = makeRoot();
  const second = makeRoot();
  let initialize!: (root: HTMLElement) => void;
  function App({ root }: { root: HTMLElement | null }) {
    const bootstrap = useBootstrap({ mode: 'manual', root });
    initialize = bootstrap.initialize;
    return bootstrap.portal;
  }
  const view = render(<App root={first} />);
  expect(anchors()).toHaveLength(0);
  act(() => initialize(second));
  expect(second.contains(anchors()[0])).toBe(true);
  view.rerender(<App root={first} />);
  expect(second.contains(anchors()[0])).toBe(true);
  view.rerender(<App root={null} />);
  expect(anchors()).toHaveLength(0);
  view.rerender(<App root={first} />);
  expect(first.contains(anchors()[0])).toBe(true);
});
