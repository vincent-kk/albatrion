import { StrictMode, useState } from 'react';

import { act, cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import { ModalProvider, confirm, useModal } from '@/promise-modal';
import { ModalManager } from '@/promise-modal/app';

afterEach(() => {
  cleanup();
  ModalManager.reset();
});

it('StrictMode: shown content restores the opener on abort from inside, body, and outside', async () => {
  for (const focus of ['inside', 'body', 'outside'] as const) {
    const view = render(
      <StrictMode>
        <ModalProvider options={{ duration: 0 }}>
          <button>opener</button>
          <input aria-label="outside" />
        </ModalProvider>
      </StrictMode>,
    );
    const opener = view.getByText('opener');
    opener.focus();
    const controller = new AbortController();
    act(() => {
      void confirm({
        content: <input aria-label="inside" />,
        signal: controller.signal,
      });
    });
    const inside = view.getByLabelText('inside');
    const outside = view.getByLabelText('outside');
    if (focus === 'inside') inside.focus();
    else if (focus === 'outside') outside.focus();
    else opener.ownerDocument.body.focus();
    const before = document.activeElement;
    await act(async () => controller.abort());
    if (focus === 'outside') expect(document.activeElement).toBe(before);
    else expect(document.activeElement).toBe(opener);
    view.unmount();
    ModalManager.reset();
  }
});

it('re-suspends after focus was inside and still returns focus to the opener', async () => {
  const gate = new Promise<void>(() => {});
  function Content() {
    const [blocked, setBlocked] = useState(false);
    if (blocked) throw gate;
    return <button onClick={() => setBlocked(true)}>suspend</button>;
  }
  const view = render(
    <ModalProvider options={{ duration: 0 }}>
      <button>opener</button>
    </ModalProvider>,
  );
  const opener = view.getByText('opener');
  opener.focus();
  const controller = new AbortController();
  act(() => {
    void confirm({ content: <Content />, signal: controller.signal });
  });
  const inside = view.getByText('suspend');
  inside.focus();
  act(() => fireEvent.click(inside));
  expect(view.getByText('suspend').closest('[style*="none"]')).not.toBeNull();
  const active = document.activeElement;
  if (active instanceof HTMLElement && active.closest('[style*="none"]'))
    active.blur();
  await act(async () => controller.abort());
  expect(document.activeElement).toBe(opener);
  view.unmount();
});

it('useModal cleanup under StrictMode restores the opener when focus is on the body', async () => {
  let open = () => {};
  let mounted = true;
  function Caller() {
    const modal = useModal();
    open = () => {
      void modal.confirm({ content: <input aria-label="inside" /> });
    };
    return null;
  }
  const app = () => (
    <StrictMode>
      <button>opener</button>
      {mounted && <Caller />}
      <ModalProvider options={{ duration: 0 }} />
    </StrictMode>
  );
  const view = render(app());
  const opener = view.getByText('opener');
  opener.focus();
  act(() => open());
  document.body.focus();
  mounted = false;
  await act(async () => view.rerender(app()));
  expect(document.activeElement).toBe(opener);
  view.unmount();
});
