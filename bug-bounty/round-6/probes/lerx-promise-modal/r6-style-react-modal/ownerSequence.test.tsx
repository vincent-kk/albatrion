import { Activity, useState } from 'react';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { ModalProvider, confirm } from '../../index';
import { ModalManager } from '../../app';

afterEach(() => { cleanup(); ModalManager.reset(); vi.restoreAllMocks(); });

async function nestedCancellation(suspended: boolean) {
  const gate = new Promise<void>(() => {});
  let block = () => {};
  function Content() {
    const [blocked, setBlocked] = useState(false);
    block = () => setBlocked(true);
    if (blocked) throw gate;
    return <button>Inner opener</button>;
  }
  const view = render(<><main><button>Page opener</button></main><ModalProvider options={{ duration: 0 }} /></>);
  const opener = screen.getByText('Page opener');
  opener.focus();
  const signal = new AbortController();
  const results: boolean[] = [];
  act(() => { void confirm({ content: <Content />, signal: signal.signal }).then(value => results.push(value)); });
  screen.getByText('Inner opener').focus();
  act(() => { void confirm({ content: <button>Top control</button>, signal: signal.signal }).then(value => results.push(value)); });
  screen.getByText('Top control').focus();
  if (suspended) act(() => block());
  await act(async () => signal.abort());
  await act(async () => { await new Promise(resolve => setTimeout(resolve, 30)); });
  const outcome = { results, restored: document.activeElement === opener, inert: !!opener.closest('[inert]'), count: ModalManager.ids.length };
  view.unmount();
  await act(async () => {});
  ModalManager.reset();
  return outcome;
}

it('M1 shared cancellation with a suspended lower owner restores like the connected stack', async () => {
  const shown = await nestedCancellation(false);
  expect(shown).toEqual({ results: [false, false], restored: true, inert: false, count: 0 });
  expect(await nestedCancellation(true)).toEqual(shown);
});

it.skipIf(!Activity)('M2 an Activity hidden-shown-hidden-shown request restores to its original opener', async () => {
  const app = (hidden: boolean) => <><main><button>Open</button></main><Activity mode={hidden ? 'hidden' : 'visible'}><ModalProvider options={{ duration: 0 }} /></Activity></>;
  const view = render(app(false));
  const opener = screen.getByText('Open');
  opener.focus();
  const signal = new AbortController();
  let value: boolean | undefined;
  act(() => { void confirm({ content: <input aria-label="inside" />, signal: signal.signal }).then(result => { value = result; }); });
  for (let round = 0; round < 2; round++) {
    await act(async () => view.rerender(app(true)));
    expect(opener.closest('[inert]')).toBeNull();
    await act(async () => view.rerender(app(false)));
    expect(opener.closest('[inert]')).not.toBeNull();
    expect(document.activeElement).toBe(screen.getByLabelText('inside'));
  }
  await act(async () => signal.abort());
  expect({ value, restored: document.activeElement === opener }).toEqual({ value: false, restored: true });
});

it('M3 the surviving waiter owns styles and requests after its owner is removed', async () => {
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  const previousStyleCount = document.head.querySelectorAll('style').length;
  const left = document.createElement('div');
  const right = document.createElement('div');
  document.body.append(left, right);
  const app = (owner: boolean) => <>{owner && <ModalProvider root={left} options={{ duration: 0 }} />}<ModalProvider root={right} options={{ duration: 0 }} /></>;
  const view = render(app(true));
  let result: boolean | undefined;
  act(() => { void confirm({ title: 'Handoff', content: 'pending' }).then(value => { result = value; }); });
  expect(left.querySelector('[role="dialog"]')).not.toBeNull();
  await act(async () => view.rerender(app(false)));
  expect(right.querySelector('[role="dialog"]')).not.toBeNull();
  await act(async () => { await new Promise(resolve => setTimeout(resolve, 40)); });
  expect(document.head.querySelectorAll('style').length).toBe(previousStyleCount + 1);
  await act(async () => fireEvent.keyDown(document, { key: 'Escape' }));
  expect(result).toBe(false);
  view.unmount();
  await act(async () => {});
  expect(document.body.style.overflow).toBe('');
  expect(document.head.querySelectorAll('style').length).toBe(previousStyleCount);
  left.remove(); right.remove();
});
