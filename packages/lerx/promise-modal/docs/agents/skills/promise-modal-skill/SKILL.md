---
name: promise-modal-skill
description: '@lerx/promise-modal expert — Promise results, provider ownership, custom frames, path hiding, animation cleanup, and AbortSignal cancellation.'
---

# Promise-returning modals

Use this skill when opening or customizing `@lerx/promise-modal` modals. Read the published declarations for shapes and the README for complete setup examples.

## Lifecycle decisions

A Promise belongs to a modal request rather than its calling React component. Static `alert`, `confirm`, and `prompt` calls may outlive that component. Use `useModal` when unmounting the caller should cancel its pending requests; completed requests leave its tracking list immediately, including rejected requests.

Keep three states separate:

| State     | Meaning                                                                                  |
| --------- | ---------------------------------------------------------------------------------------- |
| `alive`   | The modal remains in the store and its frame can stay mounted.                           |
| `visible` | The modal is displayed on its initiating route.                                          |
| `settled` | Its first result or error is final; subsequent confirmation and cancellation do nothing. |

Route hiding changes visibility without settling the result. Returning restores only pending modals. Hidden pending modals still respond to abort and caller cleanup. A closed `manualDestroy` modal stays alive until destruction but never reappears on route return. Destroying a pending modal first settles its cancellation result.

## Ownership and failures

Mount one `ModalProvider` or `useInitializeModal` bootstrap for the application. Extra bootstraps wait, warn once in development, and take over in registration order when the owner unmounts. With no waiter, provider removal cancels open modals after the current commit. Same-commit remounts and StrictMode checks preserve pending requests and prompt input. Requests queued before mounting retain their original Promise.

Handle render failures with `try`/`catch`: a failing content, input, or frame rejects only its modal's Promise. Peers and future requests continue rendering. A failure in the shared anchor rejects and destroys every alive modal; the anchor retries only when another modal registers, preventing an immediate retry loop.

The package supports DOM-free import and server rendering, but call modal functions only in the browser. Server rendering has no portal and counts zero active modals.

## Results and input

`alert` completes without a value. `confirm` resolves `true` for confirmation and `false` for cancellation. `prompt` resolves the current input on confirmation, mapping missing input to `null`; cancellation also returns `null` unless `returnOnCancel` is true. Set `defaultValue` when those outcomes must be distinguished.

With `returnOnCancel: true`, an edited prompt returns its current value on user cancel, abort, caller cleanup, or provider removal. Before rendering it returns `defaultValue ?? null`. Abort is cancellation, not rejection.

Functional `onChange` calls accumulate in event order. Calling `onConfirm` in that same event consumes the latest node value synchronously. `disabled` controls the confirm button; it is not a validation-message mechanism.

## Configuration and hooks

Configuration precedence is provider defaults, then `useModal(config)`, then per-call arguments. These layers use object spreads, so an explicit `undefined` can replace an earlier setting; omit optional keys when inheriting. `useModal(config)` captures its configuration at mount, so use call arguments for changing values.

`useActiveModalCount(validate?)` works anywhere and receives read-only `ModalNodeView` metadata. It updates on node publications without a refresh key. `useSubscribeModal(id)` likewise works without a provider context; pass the frame id rather than a node instance.

Use `useDestroyAfter(id, delay)` inside a frame to destroy an already settled modal after its exit animation. It does not close a modal or start on route hiding, and it captures the delay at mount. Automatic destruction already handles non-manual modals; use this hook for a custom `manualDestroy` lifecycle. `useModalAnimation` supplies animation callbacks separately; neither hook requires the other.

`useInitializeModal({ mode: 'manual' })` returns `initialize(element)` and `portal`; render the portal and initialize the intended element. The default mode initializes on mount. A `ModalProvider` ref uses explicit initialization; passing a ref suppresses automatic initialization. Custom frames receive operations such as `onClose`, `onConfirm`, and `onDestroy`; use those operations instead of mutating nodes.

Published API shapes live in the package declarations, setup and customization examples in `README.md`, and hook behavior in `docs/en/SPECIFICATION.md`.
