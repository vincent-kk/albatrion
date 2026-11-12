# @lerx/promise-modal

Promise-based React modals, inside or outside components. See the [specification](./docs/en/SPECIFICATION.md) for lifecycle and integration contracts.

## Installation and compatibility

```sh
yarn add @lerx/promise-modal
```

Use matching React and React DOM versions, 18 or 19. Browser interaction requires a DOM; page isolation uses the browser’s `inert` support. Both ESM and CommonJS bundles declare `'use client'`. DOM-free import and server rendering are supported without React 18 layout-effect warnings; call modal functions only in the browser. Server rendering has no modal portal and reports zero active modals.

## Setup

```tsx
import { ModalProvider, alert } from '@lerx/promise-modal';

export function App() {
  return (
    <ModalProvider options={{ duration: '250ms' }}>
      <button onClick={() => void alert({ title: 'Hello' })}>Open alert</button>
    </ModalProvider>
  );
}
```

## Results and input

`alert` completes without a value; `confirm` resolves `true` on confirmation and `false` on cancellation. `prompt<T>` returns `Promise<T | undefined | null>`: confirmation preserves the current input, including `undefined`; ordinary cancellation returns `null`. With `returnOnCancel: true`, cancellation returns the current value, or `defaultValue` before rendering. Set `defaultValue: ''` for an untouched empty string. Guard both `null` and `undefined` before using result fields.

```tsx
import { alert, confirm, prompt } from '@lerx/promise-modal';

export async function editName() {
  if (!(await confirm({ title: 'Edit name?' }))) return;
  const name = await prompt<string>({
    title: 'Name',
    defaultValue: '',
    Input: ({ value, onChange }) => (
      <input
        aria-label="Name"
        value={value ?? ''}
        onChange={(event) => onChange(event.target.value)}
      />
    ),
    disabled: (value) => !value?.trim(),
  });
  if (name === null || name === undefined) return;
  await alert({ title: 'Saved', content: name, subtype: 'success' });
}
```

Functional `onChange` updates accumulate in event order, and confirmation in the same event reads the latest value. `disabled` controls the confirmation button; it does not guard calls to `onConfirm` from custom controls.

## Custom components

Use the exported props types rather than copying their shapes. A foreground receives `children`; a background receives frame metadata and optional `background.data`, without children or an `onClick` prop. A Provider footer receives labels, hide flags, optional `onCancel`, and argument-free `onConfirm`; it receives neither `type` nor `onClose`. Render a cancel button only when `onCancel` exists. Frame `onClose` cancels; content and footer use `onCancel`.

```tsx
import type { PropsWithChildren } from 'react';

import {
  type FooterComponentProps,
  type ModalFrameProps,
  ModalProvider,
  type WrapperComponentProps,
  confirm,
} from '@lerx/promise-modal';

function Frame({ id, children }: PropsWithChildren<ModalFrameProps>) {
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

function Content({ children }: WrapperComponentProps) {
  return <div>{children}</div>;
}

function Footer({
  onConfirm,
  onCancel,
  disabled,
  confirmLabel,
  cancelLabel,
  hideConfirm,
  hideCancel,
}: FooterComponentProps) {
  return (
    <footer>
      {!hideCancel && onCancel && (
        <button onClick={onCancel}>{cancelLabel ?? 'Cancel'}</button>
      )}
      {!hideConfirm && (
        <button onClick={onConfirm} disabled={disabled}>
          {confirmLabel ?? 'Confirm'}
        </button>
      )}
    </footer>
  );
}

function Background({ background }: ModalFrameProps<object, string>) {
  return <span>{background?.data}</span>;
}

export function CustomApp() {
  return (
    <ModalProvider
      ForegroundComponent={Frame}
      BackgroundComponent={Background}
      ContentComponent={Content}
      FooterComponent={Footer}
      context={{ theme: 'light' }}
    >
      <button
        onClick={() =>
          void confirm({ content: 'Save?', background: { data: 'review' } })
        }
      >
        Review
      </button>
    </ModalProvider>
  );
}
```

Provider component props are fixed at mount to preserve open prompt input. Identity changes are ignored and warn once per prop in development; production does not warn. Pass changing data through `context`; options remain reactive for their consumers and future requests, while existing nodes retain their resolved per-modal options. Frames receive `group`, `subtype`, and `settled`; alert content also receives `context`. String titles, subtitles, and content use the corresponding Provider wrappers; React elements render directly.

### Per-call footers and nested modals

A per-call footer has the callbacks for that modal kind. Alert has confirmation only; confirm has confirmation and cancellation; prompt additionally has `value`, functional `onChange`, and `disabled`. Callback arguments do not set the result: confirm returns its boolean and prompt reads its current input.

```tsx
import { confirm } from '@lerx/promise-modal';

export function nestedConfirmation() {
  return confirm({
    title: 'Review',
    footer: ({ onConfirm, onCancel }) => (
      <>
        <button onClick={onCancel}>Cancel</button>
        <button
          onClick={async () => {
            if (
              await confirm({
                title: 'Are you sure?',
                closeOnBackdropClick: false,
              })
            ) {
              onConfirm();
            } else {
              onCancel();
            }
          }}
        >
          Continue
        </button>
      </>
    ),
  });
}
```

## Roots and initialization

Omit `root` for `document.body`, pass an element for that container, or pass `null` to defer. A ref alone does not defer initialization. `initialize(element)` selects a root imperatively; the last root prop change or initialize call wins. Moving the same anchor preserves input and Promises. Switching to null detaches it and queues new requests while retaining mounted modals; restoring an element resumes them. An initially null root creates no anchor.

```tsx
import { useState } from 'react';

import { ModalProvider, prompt } from '@lerx/promise-modal';

export function ContainerApp() {
  const [root, setRoot] = useState<HTMLDivElement | null>(null);
  return (
    <ModalProvider root={root}>
      <div ref={setRoot} />
      <button
        onClick={() =>
          void prompt<string>({
            title: 'Container prompt',
            defaultValue: '',
            Input: ({ value, onChange }) => (
              <input
                aria-label="Value"
                value={value ?? ''}
                onChange={(event) => onChange(event.target.value)}
              />
            ),
          })
        }
      >
        Open in container
      </button>
    </ModalProvider>
  );
}
```

`useInitializeModal` accepts the same root. Manual mode defers only its initial root, until `initialize(element)` or a later root change. Always render the returned portal.

```tsx
import { useEffect, useRef } from 'react';

import { alert, useInitializeModal } from '@lerx/promise-modal';

export function ManualApp() {
  const container = useRef<HTMLDivElement>(null);
  const { initialize, portal } = useInitializeModal({ mode: 'manual' });
  useEffect(() => {
    if (container.current) initialize(container.current);
  }, [initialize]);
  return (
    <>
      <div ref={container} />
      <button onClick={() => void alert({ title: 'Hello' })}>Open</button>
      {portal}
    </>
  );
}
```

## Component ownership and options

Use `useModal` when unmounting the caller should cancel its pending requests; settled requests leave its tracking list immediately. Static calls can outlive their caller but still follow Provider ownership. `useModal(config)` captures mount-time defaults, so pass changing values per call.

```tsx
import { type OverridableHandleProps, useModal } from '@lerx/promise-modal';

const defaults: OverridableHandleProps = { group: 'editor', duration: '0.3s' };

export function SaveButton() {
  const modal = useModal(defaults);
  return (
    <button
      onClick={async () => {
        const accepted = await modal.confirm({ title: 'Save?', duration: 150 });
        console.log(accepted);
      }}
    >
      Save
    </button>
  );
}
```

Precedence is library defaults, Provider options, `useModal` configuration, then call arguments. `undefined` inherits; `0` and `false` override. `duration` accepts nonnegative numbers in milliseconds, decimal ms strings, or decimal s strings: `300`, `'300ms'`, `'0.3s'`. Invalid values fall back to the Provider duration for a call, or the library default for a Provider, with a development warning. Use normalized duration strings directly in CSS without appending `ms`. The [hook reference](./docs/en/SPECIFICATION.md#hooks) distinguishes Provider timing from per-modal timing.

## Animation and destruction

Automatic destruction removes a closed non-manual modal after its resolved duration. For an exit animation, set `manualDestroy: true` and have the frame destroy after settlement. `useDestroyAfter` never closes a request and never starts from route hiding alone; changing its delay reschedules destruction. `useModalAnimation` runs committed visibility callbacks on the next animation frame and cancels obsolete scheduled callbacks. These hooks are independent.

```tsx
import { type PropsWithChildren, useRef } from 'react';

import {
  type ModalFrameProps,
  ModalProvider,
  alert,
  useDestroyAfter,
  useModalAnimation,
  useModalDuration,
} from '@lerx/promise-modal';

function AnimatedFrame({
  id,
  visible,
  children,
}: PropsWithChildren<ModalFrameProps>) {
  const ref = useRef<HTMLDivElement>(null);
  const { duration } = useModalDuration(id);
  useModalAnimation(visible, {
    onVisible: () => {
      if (ref.current) ref.current.style.opacity = '1';
    },
    onHidden: () => {
      if (ref.current) ref.current.style.opacity = '0';
    },
  });
  useDestroyAfter(id, duration);
  return (
    <section
      ref={ref}
      role="dialog"
      aria-modal="true"
      aria-label="Notification"
      aria-hidden={!visible}
      style={{
        opacity: 0,
        transition: `opacity ${duration}`,
        background: 'white',
        padding: 24,
      }}
    >
      {children}
    </section>
  );
}

export function AnimatedApp() {
  return (
    <ModalProvider
      ForegroundComponent={AnimatedFrame}
      options={{ manualDestroy: true }}
    >
      <button
        onClick={() => void alert({ title: 'Animated', duration: '0.3s' })}
      >
        Open
      </button>
    </ModalProvider>
  );
}
```

## Accessibility

Escape walks visible pending modals from top to bottom and cancels the first whose effective `closeOnEscape` is true, preventing the event's default behavior. It skips non-accepting nondimmed modals and stops at a non-accepting dimmed modal without preventing the event. The resolution order is call Escape, call backdrop click, Provider Escape, then Provider backdrop click (default true). `useModal` defaults count as call data. Prevented and IME events are ignored. A dimmed modal with Escape disabled blocks Escape from reaching lower modals.

Visible pending dimmed modals move focus inside, isolate the page, and by default trap Tab and lock body scrolling. `trapFocus: false` disables cycling, not initial focus or isolation; `lockScroll: false` disables scroll locking. Both options accept Provider and call overrides. Nondimmed modals do not take or restore focus, isolate the page, or lock scrolling. Custom foregrounds supply role, accessible name, and description; the library wrapper supplies focus behavior. The fallback frame supplies dialog role and aria-modal but still needs an accessible name from the application. See the [accessibility contract](./docs/en/SPECIFICATION.md#accessibility) for stacks, roots, and external portal limits.

A visible dimmed backdrop blocks pointers even with `closeOnBackdropClick: false`. For pass-through toasts, set both `dimmed` and `closeOnBackdropClick` to false.

## Failures and lifecycle

Results settle once. Render failures in content, input, or a frame reject that request; catch errors at the call site. Peers and later requests continue working. Destroying a pending modal cancels it before removing its frame. AbortSignal resolves with the cancellation result, rather than rejecting.

```tsx
import { alert } from '@lerx/promise-modal';

export async function showBrokenContent() {
  try {
    await alert({
      content: () => {
        throw new Error('Cannot render');
      },
    });
  } catch (error) {
    console.error('Modal failed', error);
  }
  await alert({ title: 'Other requests still work' });
}
```

Route navigation hides pending requests without settling them; returning restores them. Hidden modals still respond to abort and caller cleanup. A settled modal never reappears, including in manual destruction mode. One bootstrap owns the portal; extra Providers wait and warn once in development. When the owner unmounts, the first waiter takes over; with no waiter, open requests cancel after the current commit. Same-commit remounts and StrictMode checks preserve pending results and prompt input. Queued pre-mount requests remain queued.

## Further reference

See the [specification](./docs/en/SPECIFICATION.md) for all hooks, cancellation, routing, toasts, and public wrapper types. The published declarations are the source of truth for prop shapes; no node classes are public. The packaged [agent skill](./docs/agents/skills/promise-modal-skill/SKILL.md) explains integration decisions.

## License

MIT.
