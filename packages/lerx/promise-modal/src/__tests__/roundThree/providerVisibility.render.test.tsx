import { Activity, Fragment, StrictMode, Suspense, lazy } from 'react';
import type { PropsWithChildren } from 'react';

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
  confirm,
  prompt,
  useModal,
} from '@/promise-modal';
import { ModalManager } from '@/promise-modal/app';

const Suspender = lazy(() => new Promise<{ default: () => null }>(() => {}));
function Visibility({
  hidden,
  kind,
  children,
}: PropsWithChildren<{ hidden: boolean; kind: string }>) {
  return kind === 'activity' ? (
    <Activity mode={hidden ? 'hidden' : 'visible'}>{children}</Activity>
  ) : (
    <Suspense fallback={<span>loading</span>}>
      {children}
      {hidden && <Suspender />}
    </Suspense>
  );
}
afterEach(() => {
  cleanup();
  ModalManager.reset();
  vi.restoreAllMocks();
});

function Input({ value, onChange }: PromptInputProps<string>) {
  return (
    <input
      value={value ?? ''}
      onChange={(event) => onChange(event.target.value)}
    />
  );
}

async function outside(kind: string, hide: boolean, strict: boolean) {
  const Wrapper = strict ? StrictMode : Fragment;
  const app = (hidden: boolean) => (
    <Wrapper>
      <Visibility hidden={hidden} kind={kind}>
        <ModalProvider />
      </Visibility>
    </Wrapper>
  );
  const view = render(app(false));
  let result: string | null | undefined;
  act(() => {
    void prompt<string>({ title: 'Draft', Input }).then((value) => {
      result = value;
    });
  });
  const node = ModalManager.node(ModalManager.ids[0]);
  fireEvent.change(screen.getByRole('textbox'), {
    target: { value: 'retained draft' },
  });
  await act(async () => view.rerender(app(hide)));
  if (hide) {
    expect(document.body.style.overflow).toBe('');
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(result).toBeUndefined();
  }
  await act(async () => view.rerender(app(false)));
  const input = screen.getByRole<HTMLInputElement>('textbox');
  const outcome = {
    pending: result === undefined,
    value: input.value,
    sameNode: ModalManager.node(ModalManager.ids[0]) === node,
    focused: document.activeElement === input,
  };
  view.unmount();
  await act(async () => {});
  ModalManager.reset();
  return outcome;
}
it.for(['activity', 'suspense'])(
  'outside caller survives %s hide equivalently to remaining visible',
  async (kind, { skip }) => {
    if (kind === 'activity' && !Activity) skip('Activity requires React 19');
    const control = await outside(kind, false, false);
    expect(await outside(kind, true, false)).toEqual(control);
    expect(await outside(kind, true, true)).toEqual(control);
  },
);

let caller: ReturnType<typeof useModal>;
function Caller() {
  caller = useModal();
  return <span>caller</span>;
}
async function inside(kind: string, hideProvider: boolean) {
  const app = (hide: boolean) => (
    <Visibility kind={kind} hidden={hideProvider && hide}>
      <ModalProvider>{(!hide || hideProvider) && <Caller />}</ModalProvider>
    </Visibility>
  );
  const view = render(app(false));
  let result: boolean | undefined;
  act(() => {
    void caller.confirm({ title: 'Owned' }).then((value) => {
      result = value;
    });
  });
  await act(async () => view.rerender(app(true)));
  const outcome = result;
  view.unmount();
  await act(async () => {});
  ModalManager.reset();
  return outcome;
}
it.for(['activity', 'suspense'])(
  'inside caller %s hide cancels equivalently to caller unmount',
  async (kind, { skip }) => {
    if (kind === 'activity' && !Activity) skip('Activity requires React 19');
    const unmounted = await inside(kind, false);
    expect(unmounted).toBe(false);
    expect(await inside(kind, true)).toBe(unmounted);
  },
);

it.for([
  ['activity', false],
  ['activity', true],
  ['suspense', false],
  ['suspense', true],
] as const)(
  '%s Provider removal cancels after hidden=%s',
  async ([kind, hidden], { skip }) => {
    if (kind === 'activity' && !Activity) skip('Activity requires React 19');
    const app = (hide: boolean) => (
      <Visibility kind={kind} hidden={hide}>
        <ModalProvider />
      </Visibility>
    );
    const view = render(app(false));
    let result: boolean | undefined;
    act(() => {
      void confirm({ title: 'Owned' }).then((value) => {
        result = value;
      });
    });
    if (hidden) await act(async () => view.rerender(app(true)));
    await act(async () => view.unmount());
    expect(result).toBe(false);
    expect(ModalManager.ids).toHaveLength(0);
  },
);
it.for(['activity', 'suspense'])(
  '%s hidden owner hands pending requests to the visible waiter only on actual removal',
  async (kind, { skip }) => {
    if (kind === 'activity' && !Activity) skip('Activity requires React 19');
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const app = (hidden: boolean, owner = true) => (
      <>
        {owner && (
          <Visibility kind={kind} hidden={hidden}>
            <ModalProvider />
          </Visibility>
        )}
        <ModalProvider />
      </>
    );
    const view = render(app(false));
    let result: boolean | undefined;
    act(() => {
      void confirm({ title: 'Transferred' }).then((value) => {
        result = value;
      });
    });
    const node = ModalManager.node(ModalManager.ids[0]);
    await act(async () => view.rerender(app(true)));
    expect(result).toBeUndefined();
    expect(screen.queryByText('Transferred')).toBeNull();
    await act(async () => view.rerender(app(true, false)));
    expect(result).toBeUndefined();
    expect(ModalManager.node(ModalManager.ids[0])).toBe(node);
    expect(screen.getByText('Transferred')).toBeTruthy();
    fireEvent.keyDown(document, { key: 'Escape' });
    await act(async () => {});
    expect(result).toBe(false);
  },
);
