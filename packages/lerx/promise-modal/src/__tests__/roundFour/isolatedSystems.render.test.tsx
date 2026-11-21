import * as React from 'react';

import { act, cleanup, render } from '@testing-library/react';
import * as ReactDOM from 'react-dom';
import { afterEach, expect, it, vi } from 'vitest';

import {
  type ModalFrameProps,
  ModalProvider,
  alert,
  confirm,
} from '@/promise-modal';
import { ModalManager } from '@/promise-modal/app';

/**
 * Angle IN3: an incompatible package copy (another state version) runs an
 * independent modal system, as `getModalManagerState` documents. Simulated by
 * occupying the registry slot with a foreign version before a second copy loads.
 */
const registryKey = Symbol.for('@lerx/promise-modal');
type Registry = Record<symbol, unknown>;

let restoreRegistry: (() => void) | undefined;
afterEach(() => {
  cleanup();
  ModalManager.reset();
  restoreRegistry?.();
  restoreRegistry = undefined;
  vi.doUnmock('react');
  vi.doUnmock('react-dom');
  vi.restoreAllMocks();
  document.body.style.removeProperty('overflow');
});

async function loadIncompatibleCopy() {
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  const registry: Registry = globalThis;
  const shared = registry[registryKey];
  registry[registryKey] = { version: 99 };
  restoreRegistry = () => {
    registry[registryKey] = shared;
  };
  vi.doMock('react', () => React);
  vi.doMock('react-dom', () => ReactDOM);
  vi.resetModules();
  const copy = await import('@/promise-modal');
  const app = await import('@/promise-modal/app');
  return { ...copy, Manager: app.ModalManager };
}

function anchors() {
  return [...document.body.children].filter((element) =>
    element.id.startsWith('promise-modal-'),
  );
}

it('refuses an incompatible Provider without making the existing modal or page inert permanently', async () => {
  const other = await loadIncompatibleCopy();
  render(
    <>
      <main>page</main>
      <ModalProvider />
      <other.ModalProvider />
    </>,
  );
  expect(anchors()).toHaveLength(1);
  const mine = new AbortController();
  const theirs = new AbortController();
  act(() => {
    void confirm({ title: 'This copy', signal: mine.signal });
  });
  let rejected: Promise<void>;
  await act(async () => {
    rejected = expect(
      other.alert({ title: 'Other copy', signal: theirs.signal }),
    ).rejects.toThrow(/incompatible state version/i);
    theirs.abort();
    await rejected;
  });
  expect(anchors()[0].hasAttribute('inert')).toBe(false);
  act(() => mine.abort());
  expect(document.body.style.overflow).toBe('');
  expect(document.querySelector('main')?.hasAttribute('inert')).toBe(false);
});

it('rejects queued requests when an incompatible Provider mounts, without acquiring page resources', async () => {
  const other = await loadIncompatibleCopy();
  const controller = new AbortController();
  const request = other.confirm({ title: 'Queued', signal: controller.signal });
  const rejection = expect(request).rejects.toThrow(
    /incompatible state version/i,
  );
  render(<other.ModalProvider />);
  controller.abort();
  await act(async () => {
    await rejection;
  });
  expect(anchors()).toHaveLength(0);
  expect(document.body.style.overflow).toBe('');
  expect(other.Manager.ids).toHaveLength(0);
});

it('keeps compatible dialog labels unique while refusing an incompatible copy', async () => {
  const other = await loadIncompatibleCopy();
  function Frame({ id, children }: React.PropsWithChildren<ModalFrameProps>) {
    return (
      <section role="dialog" aria-labelledby={`title-${id}`}>
        <h2 id={`title-${id}`}>Review</h2>
        {children}
      </section>
    );
  }
  render(
    <>
      <ModalProvider ForegroundComponent={Frame} />
      <other.ModalProvider ForegroundComponent={Frame} />
    </>,
  );
  act(() => {
    void confirm({ title: 'First' });
    void confirm({ title: 'Second' });
  });
  const controller = new AbortController();
  await act(async () => {
    const rejected = expect(
      other.confirm({ signal: controller.signal }),
    ).rejects.toThrow(/incompatible state version/i);
    controller.abort();
    await rejected;
  });
  const labels = [...document.querySelectorAll('[role="dialog"]')].map(
    (dialog) => dialog.getAttribute('aria-labelledby'),
  );
  expect(labels).toHaveLength(2);
  expect(new Set(labels).size).toBe(labels.length);
});

it('control: one copy releases the scroll lock after two dialogs close in opening order', async () => {
  render(
    <>
      <main>page</main>
      <ModalProvider options={{ duration: 0 }} />
    </>,
  );
  const first = new AbortController();
  const second = new AbortController();
  act(() => {
    void confirm({ title: 'First', signal: first.signal });
    void alert({ title: 'Second', signal: second.signal });
  });
  act(() => first.abort());
  const whileSecondOpen = document.body.style.overflow;
  act(() => second.abort());
  expect({
    whileSecondOpen,
    afterBothClosed: document.body.style.overflow,
  }).toEqual({ whileSecondOpen: 'hidden', afterBothClosed: '' });
});
