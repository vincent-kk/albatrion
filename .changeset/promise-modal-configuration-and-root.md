---
"@lerx/promise-modal": major
---

Breaking change: `prompt` tells an untouched confirmation apart from a cancellation, the `root` prop of `ModalProvider` decides where modals mount, and configuration hooks reject use outside the modal tree.

`prompt<T>()` returns `Promise<T | undefined | null>`. Confirming without input resolves `undefined`, and cancelling still resolves `null`. Pass `defaultValue: ''` when an untouched confirmation should produce an empty string.

```tsx
// Before
const result: string | null = await prompt<string>({ Input });
if (result === null) handleCancelOrEmptyInput();
// After
const result: string | undefined | null = await prompt<string>({ Input });
if (result === null) handleCancel();
else if (result === undefined) handleUntouchedConfirmation();
else handleValue(result);
```

Passing a ref to `ModalProvider` no longer defers initialization. The default root is `document.body`; pass `root={null}` to wait for `initialize(element)`.

```tsx
// Before
<ModalProvider ref={modalRef}>{children}</ModalProvider>
// After
<ModalProvider ref={modalRef} root={null}>{children}</ModalProvider>
```

`useModalOptions`, `useModalBackdrop`, `useModalDuration` and `useDestroyAfter` throw a descriptive error outside the modal tree. Call them in a frame, content or footer component.

```tsx
// Before: the hook was called from a component outside the modal tree.
const PageHeader = () => {
  const options = useModalOptions();
  return <Header dimmed={options.dimmed} />;
};
// After: read the configuration where a modal renders.
const Frame = ({ children }: ModalFrameProps) => {
  const options = useModalOptions();
  return <Dialog dimmed={options.dimmed}>{children}</Dialog>;
};
```

A hand-built `ModalFrameProps` value must include `settled`. Frames also receive the optional `group` and `subtype`.

This release also adds and fixes the following:

- `ModalProvider` and `useInitializeModal` accept `root`: omit it for `document.body`, pass an element for that container, or pass `null` to defer. Changing the root moves open modals without remounting them.
- Durations accept a number of milliseconds as well as `'300ms'` and `'0.3s'`, and the duration hooks return normalized `ms` strings. A numeric `options.duration` no longer makes every open reject.
- An explicit `undefined` in per-call arguments or `useModal(config)` inherits the setting from the level above; `0` and `false` remain overrides.
- Provider component props are read once at mount, so an open prompt keeps its input across parent re-renders. Pass changing data through `context`.
- Alert content receives `context`.
