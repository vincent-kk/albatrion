---
name: promise-modal-skill
description: '@lerx/promise-modal expert — Promise-based React modals (alert, confirm, prompt), ModalProvider setup, useModal, custom foreground/background components, toasts, and AbortSignal cancellation.'
---

# @lerx/promise-modal — Promise-returning modals driven by a node registry

Applies when working in a project that depends on `@lerx/promise-modal`: opening modals from inside or outside React, configuring `ModalProvider`, writing custom modal components, or explaining why a modal's promise settled with the value it did.

## Mental Model

**The promise belongs to the node, not to the React tree.** `alert`/`confirm`/`prompt` create a modal node in the `ModalManager` singleton and return a promise. The settlement channel travels with the modal data, so a modal opened _before_ `ModalProvider` mounts is queued, flushed at mount, and still settles that same promise (`src/core/handle/dispatchModal.ts`). React renders the node; it does not own it.

**Two independent lifecycle axes.** Every node carries `alive` and `visible`, both starting `true` (`src/core/node/ModalNode/AbstractNode.ts:79-80`):

| Axis      | `false` means                                           | Set by                   |
| --------- | ------------------------------------------------------- | ------------------------ |
| `visible` | Off screen, but still mounted and still in the registry | `onClose()` / `onHide()` |
| `alive`   | Removed from the registry and unmounted                 | `onDestroy()`            |

Closing and destroying are separate events, and the gap between them is where exit animations run — a node that is `!visible && alive` is mid-exit. Only a _close_ settles the promise; hiding does not.

**Config merges in one direction, later wins:**

```
ModalProvider props  <  useModal(config)  <  alert/confirm/prompt(options)
```

The provider's `duration`, `manualDestroy` and `closeOnBackdropClick` are spread first, then overwritten by the modal's own data (`src/providers/ModalManagerContext/ModalManagerContextProvider.tsx:51-58`); `useModal`'s config is spread underneath each call's args (`src/hooks/useModal.ts:31`).

## Decision Guide

|               | Static `alert`/`confirm`/`prompt`           | `useModal()`                                     |
| ------------- | ------------------------------------------- | ------------------------------------------------ |
| Callable from | Anywhere — event handlers, plain modules    | Inside a React component only                    |
| On unmount    | Nothing; the modal outlives its caller      | Every modal it opened is closed and settled      |
| Shared config | Per call                                    | Once, applied to every call from that hook       |
| Use when      | Utility code, fire-and-forget confirmations | The modal is meaningless once the component dies |

`useModal`'s cleanup settles rather than strands: mounted modals go through `closeModal`, still-queued ones are cancelled, so an awaiting caller receives the cancel value instead of a promise that never resolves (`src/hooks/useModal.ts:57-67`).

## Invariants & Gotchas

**`returnOnCancel: true` resolves with different values depending on where the cancel came from.** Two code paths exist, and they disagree once the user has typed:

| Cancel path                                                                                                    | Resolves with                            | Source                                                     |
| -------------------------------------------------------------------------------------------------------------- | ---------------------------------------- | ---------------------------------------------------------- |
| Anything after the modal mounted — user close, backdrop click, `useModal` unmount, **and `AbortSignal` abort** | current input value, `__value__ ?? null` | `PromptNode.ts:85`, reached via `closeModal` → `onClose()` |
| Cancel before the modal ever mounted — signal already aborted at call time, or aborted while still queued      | `defaultValue ?? null`                   | `prompt.ts:52`, via `dispatchModal.ts:49,67,76`            |

`__value__` is initialized to `defaultValue`, so both paths agree until the first `onChange`. Do not tell users "abort yields `defaultValue`" — a mounted, edited prompt yields the edit. With the default `returnOnCancel: false`, both paths yield `null`.

**`usePathname` hides and restores modals; it does not close them.** On every pathname change each live node is compared against its `initiator` — the pathname captured when the modal was opened — and gets `onShow()` if they match, `onHide()` otherwise (`ModalManagerContextProvider.tsx:74-83`, `initiator` assigned at line 57). Navigating away therefore parks a modal off screen with its promise still pending, and navigating back restores it. This is the one `ModalProvider` prop whose behavior cannot be guessed from its type, and it is documented nowhere else — the README lists it only as "Custom pathname hook function".

**Animate-then-unmount requires both hooks.** `useModalAnimation(visible, { onVisible, onHidden })` fires its callbacks in a `requestAnimationFrame` inside `useLayoutEffect`, and `useDestroyAfter(id, duration)` destroys the node `duration` ms after it becomes hidden-but-alive. Neither alone works: without the second the node lingers; without the first there is nothing to watch. `useDestroyAfter` captures `duration` once in a ref initializer, so a value that changes after mount is ignored.

**`useModal(config)` captures its config once.** `baseArgsRef = useRef(configuration)` (`useModal.ts:27`) — passing a freshly built object each render has no effect after the first. Per-call options are the reactive layer.

**Dismissing the previous toast** means capturing the foreground's `onDestroy` into a module-level variable, since `ForegroundComponent` receives the full `ModalFrameProps` (`types/base.ts:27`, `types/modal.ts:22-37`):

```tsx
let dismissPrevious: (() => void) | undefined;

export const toast = (content: ReactNode) => {
  dismissPrevious?.();
  return alert({
    content,
    footer: false,
    dimmed: false,
    closeOnBackdropClick: false,
    ForegroundComponent: (props) => {
      dismissPrevious = props.onDestroy;
      return <ToastForeground {...props} />;
    },
  });
};
```

**`disabled: (value) => boolean` gates the confirm button**, re-evaluated on every input change and forwarded to the footer as a plain boolean (`components/Foreground/components/PromptInner.tsx:61-64`, `FallbackComponents/FallbackFooter.tsx:15`). It is a gate, not a validator — it produces no message.

**The package exports nine hooks**, not eight: `useModal`, `useActiveModalCount`, `useDestroyAfter`, `useModalAnimation`, `useModalDuration`, `useSubscribeModal`, `useModalOptions`, `useModalBackdrop`, `useInitializeModal` (`src/index.ts`). `useInitializeModal` is the one usually forgotten — it is what manual-mode anchoring (`{ mode: 'manual' }`, rendering the returned `portal`) depends on.

## API Truth

Read shapes; do not reconstruct them from memory. This package's `README.md` is exhaustive and ships in `node_modules/@lerx/promise-modal/`:

- **Options, props, hook signatures, type definitions** — `README.md` §API Reference (core functions, `ModalProvider`, all nine hooks, `ModalFrameProps`/`FooterComponentProps`/`PromptInputProps`).
- **Worked examples** — `README.md` §How to Use (provider setup, custom components, custom anchors, toasts) and §Advanced Usage Examples (nested modals).
- **Authoritative signatures** — `dist/*.d.ts`.

Entry points: `alert`, `confirm`, `prompt`, `ModalProvider`, the nine hooks, and the type exports listed in `src/index.ts`.
