import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { act, cleanup, render } from '@testing-library/react';
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
  const registry = globalThis as unknown as Registry;
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

it('keeps the newest dialog of an independent copy interactive while a dialog of this copy is open', async () => {
  const other = await loadIncompatibleCopy();
  render(
    <>
      <main>page</main>
      <ModalProvider />
      <other.ModalProvider />
    </>,
  );
  expect(anchors()).toHaveLength(2);
  act(() => {
    void confirm({ title: 'This copy' });
  });
  act(() => {
    void other.alert({ title: 'Other copy' });
  });
  const [mine, theirs] = anchors();
  expect({
    pageInert: !!document.querySelector('main')?.closest('[inert]'),
    otherCopyDialogInert: theirs.hasAttribute('inert'),
    thisCopyDialogInert: mine.hasAttribute('inert'),
  }).toEqual({
    pageInert: true,
    otherCopyDialogInert: false,
    thisCopyDialogInert: true,
  });
});

it('releases the body scroll lock after dialogs of two independent copies close in opening order', async () => {
  const other = await loadIncompatibleCopy();
  render(
    <>
      <main>page</main>
      <ModalProvider options={{ duration: 0 }} />
      <other.ModalProvider options={{ duration: 0 }} />
    </>,
  );
  const mine = new AbortController();
  const theirs = new AbortController();
  act(() => {
    void confirm({ title: 'This copy', signal: mine.signal });
  });
  act(() => {
    void other.confirm({ title: 'Other copy', signal: theirs.signal });
  });
  expect(document.body.style.overflow).toBe('hidden');
  act(() => mine.abort());
  const whileOtherOpen = document.body.style.overflow;
  act(() => theirs.abort());
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 10));
  });
  expect({
    whileOtherOpen,
    afterBothClosed: document.body.style.overflow,
    liveNodes: ModalManager.ids.length + other.Manager.ids.length,
  }).toEqual({ whileOtherOpen: 'hidden', afterBothClosed: '', liveNodes: 0 });
});

/** README "Custom components" frame: the dialog is named by `title-${id}`. */
function Frame({ id, children }: React.PropsWithChildren<ModalFrameProps>) {
  return (
    <section
      role="dialog"
      aria-modal="true"
      aria-labelledby={`title-${id}`}
      style={{ background: 'white', padding: 24 }}
    >
      <h2 id={`title-${id}`}>Review changes</h2>
      {children}
    </section>
  );
}

it('gives the README frame title ids that stay unique when two independent copies each open a dialog', async () => {
  const other = await loadIncompatibleCopy();
  render(
    <>
      <ModalProvider ForegroundComponent={Frame} />
      <other.ModalProvider ForegroundComponent={Frame} />
    </>,
  );
  act(() => {
    void confirm({ title: 'This copy' });
  });
  act(() => {
    void other.confirm({ title: 'Other copy' });
  });
  const labels = [...document.querySelectorAll('[role="dialog"]')].map(
    (dialog) => dialog.getAttribute('aria-labelledby'),
  );
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
