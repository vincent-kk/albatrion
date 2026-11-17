import { useState } from 'react';

import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import { ModalManager } from '@/promise-modal/app';
import { confirmHandler, promptHandler } from '@/promise-modal/core';
import { useModal } from '@/promise-modal/core/handle';

import { BootstrapProvider } from '../BootstrapProvider';

/** Dispatches the document-level keyboard event used by the manager. */
const escape = (init: KeyboardEventInit = {}) =>
  fireEvent(
    document,
    new KeyboardEvent('keydown', {
      key: 'Escape',
      bubbles: true,
      cancelable: true,
      ...init,
    }),
  );

afterEach(() => {
  cleanup();
  ModalManager.reset();
  vi.restoreAllMocks();
});

it('closes only the top modal after click-based reordering', async () => {
  render(<BootstrapProvider />);
  let first!: ReturnType<typeof confirmHandler>;
  let second!: ReturnType<typeof confirmHandler>;
  act(() => {
    first = confirmHandler({ title: 'first' });
    second = confirmHandler({ title: 'second' });
  });
  fireEvent.click(screen.getByText('first'));
  act(() => escape());
  expect(first.modalNode?.settled).toBe(true);
  expect(second.modalNode?.settled).toBe(false);
  await expect(first.promiseHandler).resolves.toBe(false);
});

it('skips route-hidden and settled nodes', () => {
  let setPath!: (path: string) => void;
  const usePathname = () => {
    const [pathname, update] = useState('/a');
    setPath = update;
    return { pathname };
  };
  render(<BootstrapProvider usePathname={usePathname} />);
  let hidden!: ReturnType<typeof confirmHandler>;
  let visible!: ReturnType<typeof confirmHandler>;
  act(() => {
    hidden = confirmHandler({ title: 'hidden' });
  });
  act(() => setPath('/b'));
  act(() => {
    visible = confirmHandler({ title: 'visible', manualDestroy: true });
  });
  act(() => {
    visible.modalNode?.onConfirm();
  });
  let pending!: ReturnType<typeof confirmHandler>;
  act(() => {
    pending = confirmHandler({ title: 'pending' });
    ModalManager.raise(visible.modalNode!.id);
  });
  act(() => escape());
  expect(pending.modalNode?.settled).toBe(true);
  expect(hidden.modalNode?.settled).toBe(false);
});

it.each([{ isComposing: true }, { keyCode: 229 }])(
  'ignores IME events %j and then accepts Escape',
  (init) => {
    render(<BootstrapProvider />);
    let handle!: ReturnType<typeof confirmHandler>;
    act(() => {
      handle = confirmHandler({ title: 'ime' });
    });
    act(() => escape(init));
    expect(handle.modalNode?.settled).toBe(false);
    act(() => escape());
    expect(handle.modalNode?.settled).toBe(true);
  },
);

it('respects defaultPrevented events', () => {
  render(<BootstrapProvider />);
  let handle!: ReturnType<typeof confirmHandler>;
  act(() => {
    handle = confirmHandler({});
  });
  const event = new KeyboardEvent('keydown', {
    key: 'Escape',
    bubbles: true,
    cancelable: true,
  });
  event.preventDefault();
  act(() => fireEvent(document, event));
  expect(handle.modalNode?.settled).toBe(false);
  act(() => escape());
  expect(handle.modalNode?.settled).toBe(true);
});

it('cancels prompt with null', async () => {
  render(<BootstrapProvider />);
  let handle!: ReturnType<typeof promptHandler<string>>;
  act(() => {
    handle = promptHandler<string>({
      Input: () => <input />,
      defaultValue: 'value',
    });
  });
  act(() => escape());
  expect(handle.modalNode?.settled).toBe(true);
  await expect(handle.promiseHandler).resolves.toBeNull();
});

it.each([
  { provider: { closeOnBackdropClick: false }, modal: {}, expected: false },
  {
    provider: { closeOnBackdropClick: false },
    modal: { closeOnEscape: true },
    expected: true,
  },
  {
    provider: { closeOnEscape: true },
    modal: { closeOnBackdropClick: false },
    expected: false,
  },
  {
    provider: { closeOnEscape: false },
    modal: { closeOnBackdropClick: true },
    expected: true,
  },
  {
    provider: { closeOnEscape: false },
    modal: { closeOnEscape: undefined, closeOnBackdropClick: undefined },
    expected: false,
  },
])('resolves Escape precedence: %j', ({ provider, modal, expected }) => {
  render(<BootstrapProvider options={provider} />);
  let handle!: ReturnType<typeof confirmHandler>;
  act(() => {
    handle = confirmHandler(modal);
  });
  expect(handle.modalNode?.closeOnEscape).toBe(expected);
  act(() => escape());
  expect(handle.modalNode?.settled).toBe(expected);
});

it('treats useModal configuration as per-modal data', () => {
  const Open = () => {
    const { confirm } = useModal({
      closeOnBackdropClick: false,
      closeOnEscape: true,
    });
    return (
      <button onClick={() => void confirm({ title: 'hook' })}>open</button>
    );
  };
  render(
    <BootstrapProvider options={{ closeOnEscape: false }}>
      <Open />
    </BootstrapProvider>,
  );
  fireEvent.click(screen.getByText('open'));
  const node = ModalManager.node(ModalManager.ids[0]);
  act(() => escape());
  expect(node?.settled).toBe(true);
});

it('owns one keydown listener and removes it on detach and reset', () => {
  const add = vi.spyOn(document, 'addEventListener');
  const remove = vi.spyOn(document, 'removeEventListener');
  const view = render(<BootstrapProvider />);
  const calls = add.mock.calls.filter(([type]) => type === 'keydown');
  expect(calls).toHaveLength(1);
  view.unmount();
  expect(
    remove.mock.calls.some(
      ([type, listener]) => type === 'keydown' && listener === calls[0][1],
    ),
  ).toBe(true);
  const second = render(<BootstrapProvider />);
  const latest = add.mock.calls.filter(([type]) => type === 'keydown').at(-1);
  act(() => ModalManager.reset());
  expect(
    remove.mock.calls.some(
      ([type, listener]) => type === 'keydown' && listener === latest?.[1],
    ),
  ).toBe(true);
  second.unmount();
});

it('does not skip a nonclosable top modal to cancel a lower one', () => {
  render(<BootstrapProvider />);
  let lower!: ReturnType<typeof confirmHandler>;
  let upper!: ReturnType<typeof confirmHandler>;
  act(() => {
    lower = confirmHandler({ title: 'lower' });
    upper = confirmHandler({ title: 'upper', closeOnEscape: false });
  });
  act(() => escape());
  expect(lower.modalNode?.settled).toBe(false);
  expect(upper.modalNode?.settled).toBe(false);
  act(() => upper.modalNode?.onClose());
  act(() => escape());
  expect(lower.modalNode?.settled).toBe(true);
});
