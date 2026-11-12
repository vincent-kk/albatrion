# @lerx/promise-modal Specification

Start with the [README](../../README.md) for installation, results, components, roots, configuration, and animation. This reference covers integration choices; use the published declarations for exact prop shapes. Each TypeScript block below is a standalone example.

## Public API and results

Use `alert`, `confirm`, and `prompt` in browser event handlers or browser utilities. `alert` returns `Promise<void>`, `confirm` returns `Promise<boolean>`, and `prompt<T>` returns `Promise<T | undefined | null>`. Confirmation returns the current prompt value without conversion; ordinary cancellation returns null. `returnOnCancel: true` instead returns the current value, including undefined, or defaultValue before rendering. A pre-aborted signal creates no modal. Rendering and opening failures reject rather than cancel.

### Application wrappers

Exported Props types let wrappers preserve the public call contract. `AlertProps` and `ConfirmProps` require a background type argument; `PromptProps<T>` can use its default background type. Nodes and their mutation methods are internal.

```tsx
import {
  type AlertProps,
  type ConfirmProps,
  type PromptProps,
  alert,
  confirm,
  prompt,
} from '@lerx/promise-modal';

export const notify = (props: AlertProps<unknown>) => alert(props);
export const ask = (props: ConfirmProps<unknown>) => confirm(props);
export const read = <T,>(props: PromptProps<T>) => prompt<T>(props);
```

### Prompt controls and footers

Input values and validators remain possibly undefined even with a defaultValue. Use controlled inputs initialized from `value`, so a Provider handoff or remount displays the current node value. `defaultValue` remains the original seed. Functional updates accumulate, and same-event confirmation reads the latest value. A custom footer must honor `disabled` itself; programmatic confirmation does not run validation. `PromptContentProps` has confirmation, cancellation, and context, without input value or change handlers; those belong to Input and the per-call prompt footer.

```tsx
import { prompt } from '@lerx/promise-modal';

export function editQuantity() {
  return prompt<number>({
    title: 'Quantity',
    defaultValue: 0,
    Input: ({ value, onChange }) => (
      <input
        aria-label="Quantity"
        type="number"
        value={value ?? 0}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    ),
    footer: ({ value, onChange, onConfirm, onCancel, disabled }) => (
      <>
        <span>{value}</span>
        <button
          onClick={() => {
            onChange((current) => (current ?? 0) + 1);
            onConfirm();
          }}
        >
          Add and confirm
        </button>
        <button disabled={disabled} onClick={onConfirm}>
          Confirm
        </button>
        <button onClick={onCancel}>Cancel</button>
      </>
    ),
  });
}
```

## Hooks

Hooks follow React’s unconditional top-level calling rules. The modal tree consists of frame, content, input, footer, and wrapper components rendered through the portal; ordinary Provider children are outside its configuration contexts.

| Hook                                   | Contract and location                                                                                                                                                                                                           |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `useModal(config?)`                    | Any component; stable functions, mount-time config, cancels pending requests on caller unmount and releases settled handles.                                                                                                    |
| `useActiveModalCount(validate?)`       | Any component; defaults to visible nodes. A custom predicate replaces the default, so include `node.visible` to count only visible matches. Hidden or settled but alive nodes remain available to predicates. SSR returns zero. |
| `useSubscribeModal(id)`                | Any component; returns a publication version, not modal state. Missing/destroyed ids return -1; SSR returns zero. Read frame props for state; this does not expose nodes.                                                       |
| `useModalOptions()`                    | Modal tree only; normalized Provider options, not effective per-modal overrides.                                                                                                                                                |
| `useModalBackdrop()`                   | Modal tree only; Provider backdrop as CSS properties.                                                                                                                                                                           |
| `useModalDuration(id?)`                | Modal tree only; normalized ms string and milliseconds. Omit id for Provider timing; pass a live id for that modal’s timing. Missing ids fall back to Provider timing.                                                          |
| `useDestroyAfter(id, delay)`           | Modal tree only; destroys a settled alive node after a number or ms/s delay. Route hiding does not start it; a changed delay reschedules it. Use for custom manual destruction.                                                 |
| `useModalAnimation(visible, handlers)` | Any component; visibility callbacks run on the next animation frame, using committed callbacks; obsolete frames cancel. Does not destroy.                                                                                       |
| `useInitializeModal(props?)`           | Any component; initializes the system and returns portal plus initialize(element). Render the portal. Use instead of an additional ModalProvider.                                                                               |

Configuration hooks and `useDestroyAfter` throw an explanatory Error outside the modal tree, including ordinary Provider children.

```tsx
import {
  type ModalNodeView,
  useActiveModalCount,
  useSubscribeModal,
} from '@lerx/promise-modal';

const visibleEditors = (node: ModalNodeView) =>
  node.visible && node.group === 'editor';

export function ModalStatus({ id }: { id: number }) {
  const total = useActiveModalCount();
  const editors = useActiveModalCount(visibleEditors);
  const version = useSubscribeModal(id);
  return (
    <output>
      {total} visible, {editors} editors, subscription version {version}
    </output>
  );
}
```

```tsx
import {
  type ModalFrameProps,
  useModalBackdrop,
  useModalDuration,
  useModalOptions,
} from '@lerx/promise-modal';

export function FrameDetails({ id }: ModalFrameProps) {
  const options = useModalOptions();
  const backdrop = useModalBackdrop();
  const { duration, milliseconds } = useModalDuration(id);
  return (
    <aside style={backdrop}>
      Provider duration: {options.duration}; this modal: {duration} (
      {milliseconds}ms)
    </aside>
  );
}
```

## Configuration and components

Precedence, duration normalization, mount-time component identity, and typed frame/footer examples live in the README. `backdrop` controls shared backdrop CSS, while `background: { data }` carries application data to the optional custom background. It is not an arbitrary CSS object. `footer: false` hides the footer; label options accept React nodes. Provider FooterComponent receives labels and callbacks; per-call footer functions receive modal-kind callbacks instead of label props. No footer receives onClose, and onConfirm takes no arguments.

## Accessibility

Escape acts on the highest stacking order among alive, visible, unsettled modals, including after click reordering. It cancels only when that node's effective `closeOnEscape` is true; it never skips a nonclosable top modal to close a lower one. The resolution order is per-call `closeOnEscape`, per-call `closeOnBackdropClick`, Provider `closeOnEscape`, Provider `closeOnBackdropClick` (default true). `useModal` defaults are per-call data. Explicit undefined inherits. Prevented events, `isComposing`, and key code 229 are ignored; detaching the root suspends keyboard handling. Escape returns the ordinary cancellation result, including `null` for a prompt unless `returnOnCancel` is enabled.

Only `alive && visible && dimmed && !settled` modals participate in focus, inert isolation, and scroll locking. On appearance or route return, focus moves once into the top participant, to its first tabbable control or outer wrapper (`tabIndex={-1}`); existing internal focus, including `autoFocus`, remains. Tab and Shift+Tab cycle only when the top visible pending modal is dimmed and its `trapFocus` is true. A nondimmed modal on top keeps native Tab order; existing inert isolation still protects the page. Provider and per-call `trapFocus` and `lockScroll` default to true and use ordinary undefined-inheriting option merging. `trapFocus: false` disables cycling, not initial focus movement or page isolation.

On settlement, page effects update before focus returns to the connected opener. Focus already inside another pending modal remains there. If the opener is still inert because another dimmed modal remains, focus moves to the top remaining dimmed modal. A disconnected opener is ignored. Hiding by route, closing, and destruction release participation immediately, even during a manual exit animation. Reappearance and reinitialization reevaluate the pending store. A detached (`root={null}`) anchor neither isolates nor locks the page.

Isolation sets the `inert` attribute on siblings along the anchor's ancestor path up to `document.body`. Existing inert attributes are preserved, and only attributes introduced by the library are removed. The snapshot is taken when the first participating modal appears or its root moves; later DOM additions remain untouched so dropdown portals appended to body keep working. Such external portals are outside the wrapper's Tab cycle; custom frames own their portal keyboard integration.

While any participating modal has `lockScroll: true`, body overflow is hidden. Scrollbar widths strictly between 0 and 100px are added to computed right padding to avoid page movement. The original inline overflow and right padding (including priorities) return when the last scroll-lock participant leaves. Provider removal releases page effects and the single document keydown listener.

The fallback foreground supplies `role="dialog"` and `aria-modal="true"`. Custom foreground frames supply their own role, accessible name, and description; the wrapper supplies the focus baseline. Label every dialog, for example using `aria-labelledby` and `aria-describedby` tied to its title and description. A visible backdrop receives pointers when `dimmed || closeOnBackdropClick`, but clicks cancel only with `closeOnBackdropClick`. Use `dimmed: false, closeOnBackdropClick: false` for pass-through toasts; they do not move or restore focus, isolate the page, or lock scrolling.

## Ownership and route visibility

One ModalProvider or useInitializeModal bootstrap owns the portal. Additional bootstraps warn once in development and wait; cleanup removes only that bootstrap’s ownership or waiting registration. The first waiter takes over when the owner leaves. With no waiter, a microtask cancels alive nodes unless the system reinitializes during the same commit. Pre-mount queued requests remain queued, so keep a browser bootstrap mounted to process them.

`alive` means retained in the store, `visible` means displayed, and `settled` means the first result or error is final. Route hiding preserves pending results; only pending nodes can reappear. Abort and caller cleanup cancel even hidden requests. A manual closed node may remain alive for exit animation but cannot show again. `useDestroyAfter` starts only after settlement.

The default pathname hook uses Navigation API events when available, otherwise polls only with alive nodes, including hidden requests and exit frames. Default requests use pathname at opening time. Supply a router hook returning `{ pathname }` to track your router; the following example uses context so both the page and modal content can change the same route.

```tsx
import { createContext, useContext, useState } from 'react';

import { ModalProvider, alert } from '@lerx/promise-modal';

const Route = createContext('/editor');
function useAppPathname() {
  return { pathname: useContext(Route) };
}

export function RoutedApp() {
  const [pathname, setPathname] = useState('/editor');
  return (
    <Route.Provider value={pathname}>
      <ModalProvider usePathname={useAppPathname}>
        <button onClick={() => setPathname('/editor')}>Editor</button>
        <button
          onClick={() =>
            void alert({
              title: 'Editor request',
              content: () => (
                <button onClick={() => setPathname('/other')}>
                  Hide by changing route
                </button>
              ),
            })
          }
        >
          Open
        </button>
      </ModalProvider>
    </Route.Provider>
  );
}
```

## AbortSignal cancellation

Abort resolves ordinary cancellation: alert completes, confirm is false, prompt is null unless returnOnCancel returns the current input. One signal can cancel several requests. Pre-aborted requests skip creation; queued requests are removed before rendering. Settlement removes the abort listener, so later aborts do nothing. A manual abort button on the page is inert behind a dimmed modal; put it inside the modal, use an external event/timer, or deliberately use a nondimmed presentation.

```tsx
import { confirm } from '@lerx/promise-modal';

export async function cancelAfterDelay() {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 3000);
  try {
    return await confirm({ title: 'Continue?', signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}
```

## Toasts

A timeout that calls frame onClose closes the request; useDestroyAfter alone does not. This toast uses automatic destruction and no page isolation. If adding an exit animation, use the manual frame pattern in the README.

```tsx
import { type PropsWithChildren, type ReactNode, useEffect } from 'react';

import { type ModalFrameProps, alert } from '@lerx/promise-modal';

function ToastFrame({ children, onClose }: PropsWithChildren<ModalFrameProps>) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);
  return (
    <aside
      role="status"
      style={{
        position: 'fixed',
        bottom: 20,
        background: '#222',
        color: 'white',
      }}
    >
      {children}
    </aside>
  );
}

export function toast(message: ReactNode) {
  return alert({
    content: message,
    footer: false,
    dimmed: false,
    closeOnBackdropClick: false,
    ForegroundComponent: ToastFrame,
  });
}
```

## Render failures

Catch opening and render failures at the requesting call. A presenter failure rejects and destroys only that modal; peers and future requests survive. A shared anchor failure rejects and destroys all alive nodes, then retries only when another modal registers. Cancellation and rejection are distinct; do not record a failed confirmation render as a user declining.

## Platform integration

React 18 and 19 share the same public contract. Both runtime bundles start with use client; DOM-free import and server rendering remain supported without layout-effect warnings. Server rendering creates no portal, counts zero modals, and must not call browser modal functions.

Compatible internal state versions share a system within one JavaScript realm, including requests, style identity, ownership, keyboard, and page effects. Incompatible versions remain isolated and warn in development. Other windows/realms are not shared: root examples target elements in the current document, not an iframe document. CommonJS TypeScript-specific .d.cts declarations are not supplied.
