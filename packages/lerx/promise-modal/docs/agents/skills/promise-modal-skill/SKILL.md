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

## Platform integration

Copies of the package with the same internal state version share one modal system in the same JavaScript realm. An `alert`, `confirm`, or `prompt` imported by another copy reaches the active Provider; style identity, ownership, and cleanup are shared. Incompatible state versions stay independent and warn in development. Keep one compatible package version across the application; different windows or realms do not share a system.

The default pathname hook uses the Navigation API when available. Otherwise it polls only while a modal is alive, including route-hidden modals and closed modals awaiting destruction. Requests opened after an idle route change belong to the pathname at opening time. Custom `usePathname` hooks continue to follow their router's pathname.

React 18 and 19 are supported. Both ESM and CommonJS bundles start with `'use client'` so React Server Component tooling recognizes the client boundary. DOM-free import and server rendering remain supported; call modal functions only in the browser.

## Results and input

`alert` completes without a value. `confirm` resolves `true` for confirmation and `false` for cancellation. `prompt<T>` returns `Promise<T | undefined | null>`: confirmation preserves the current input, including missing input as `undefined`; ordinary cancellation returns `null`. Set `defaultValue` to control untouched confirmation and use `result === null` to identify ordinary cancellation.

With `returnOnCancel: true`, an edited prompt returns its current value on user cancel, abort, caller cleanup, or provider removal. Before rendering it returns `defaultValue` (including `undefined`). Abort is cancellation, not rejection.

Functional `onChange` calls accumulate in event order. Calling `onConfirm` in that same event consumes the latest node value synchronously. `disabled` controls the confirm button; it is not a validation-message mechanism. Its argument and `Input` value remain possibly undefined even when `defaultValue` is supplied: guard validation callbacks and provide destructuring defaults before reading object fields. Prompt results also retain undefined in their type; check cancellation and missing input before reading result fields.

## Configuration and hooks

Configuration precedence is provider defaults, then `useModal(config)`, then per-call arguments. These layers ignore `undefined` while preserving `0` and `false`. `useModal(config)` captures its configuration at mount, so use call arguments for changing values.

`useActiveModalCount(validate?)` works anywhere and receives read-only `ModalNodeView` metadata. It updates on node publications without a refresh key. `useSubscribeModal(id)` likewise works without a provider context; pass the frame id rather than a node instance.

Use `useDestroyAfter(id, delay)` inside a frame to destroy an already settled modal after its exit animation. It does not close a modal or start on route hiding, and changing the delay reschedules destruction. Automatic destruction already handles non-manual modals; use this hook for a custom `manualDestroy` lifecycle. `useModalAnimation` supplies animation callbacks separately; neither hook requires the other.

`useInitializeModal({ mode: 'manual' })` returns `initialize(element)` and `portal`; render the portal and initialize the intended element. The default mode initializes on mount. A `ModalProvider` ref does not defer initialization. Use `root={null}` to defer; undefined means body and an element selects that container. The last root prop change or `initialize(element)` call wins. Root movement preserves the same anchor and open input; null detaches it and queues new requests until an element returns. Manual hook mode defers only the initial root. Custom frames receive operations such as `onClose`, `onConfirm`, and `onDestroy`; use those operations instead of mutating nodes.

Published API shapes live in the package declarations, setup and customization examples in `README.md`, and hook behavior in `docs/en/SPECIFICATION.md`.

Provider component props stay fixed at mount to preserve open inputs; identity changes warn once per prop in development. Send changing data through `context`. Options remain reactive. Provider and per-call durations accept nonnegative numbers (milliseconds) or decimal ms/s strings; invalid values fall back to defaults with a development warning. Duration hooks return normalized ms strings, ready for CSS without another suffix.

Configuration hooks and `useDestroyAfter` require the modal frame, content, or footer tree; ordinary Provider children are outside that tree and throw. Frame `onClose` and content/footer `onCancel` both cancel. Alert content receives `context`, and frames receive `group`, `subtype`, and `settled`. Use public Props types for application wrappers. Animation callbacks observe the last committed render, including during suspended transitions.

## Accessibility decisions

Escape cancels only the top visible pending modal and respects prevented or IME events. Resolve `closeOnEscape` from call Escape, call backdrop click, Provider Escape, then Provider backdrop click (default true); `useModal` defaults count as call data. A nonclosable top modal blocks Escape from reaching lower modals.

Only alive, visible, dimmed, unsettled modals participate in focus and page isolation. The library wrapper moves focus into the top participant on appearance or route return without overriding existing `autoFocus`, and restores a connected opener after settlement. By default it cycles Tab only when the top visible pending modal is dimmed. If another pending modal owns focus, leave it there; if an opener stays inert, focus the top remaining dimmed modal. A nondimmed modal on top keeps native Tab order while existing inert isolation remains. `trapFocus: false` delegates cycling but keeps initial focus movement and isolation. `lockScroll: false` delegates body scroll locking. Both options default true and accept Provider or call overrides.

Inert isolation snapshots siblings along the anchor's ancestor path to body and preserves existing attributes. Later body portals are not made inert, but they remain outside the wrapper's Tab cycle: custom frames must integrate their portal keyboard behavior. Scroll locking preserves body overflow and right padding. Route hiding, settlement, root detachment, and provider removal release participation; reappearance and reinitialization reevaluate it.

The fallback frame supplies dialog semantics; custom foreground frames must supply role, accessible name, and description. Label dialogs with title/description ids. Dimmed visible backdrops block page pointers regardless of click cancellation. For pass-through toasts use both `dimmed: false` and `closeOnBackdropClick: false`; these modals do not take or restore focus, isolate the page, or lock scrolling.
