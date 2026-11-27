---
"@lerx/promise-modal": major
---

Breaking change: `prompt` tells an untouched confirmation apart from a cancellation, passing a ref to `ModalProvider` no longer defers initialization, `useModalOptions` throws outside the modal tree, and hand-built `ModalFrameProps` and `AlertContentProps` values need new required fields.

`prompt<T>()` returns `Promise<T | undefined | null>`. Confirming without input resolves `undefined`, and cancelling still resolves `null`. With `returnOnCancel: true`, cancelling without input also resolves `undefined` instead of `null`. Pass `defaultValue: ''` when an untouched prompt should produce an empty string.

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

Passing a ref to `ModalProvider` no longer defers initialization: modals mount in `document.body` until you call `initialize(element)`. Pass `root={null}` to wait for `initialize(element)` as before.

```tsx
// Before
<ModalProvider ref={modalRef}>{children}</ModalProvider>
// After
<ModalProvider ref={modalRef} root={null}>{children}</ModalProvider>
```

`useModalOptions` throws a descriptive error outside the modal tree instead of returning `undefined`. `useModalBackdrop`, `useModalDuration` and `useDestroyAfter` already failed there with a `TypeError` and now throw a descriptive error too. Call them in a frame, content or footer component.

```tsx
// Before: outside the modal tree the hook returned undefined.
const PageHeader = () => {
  const options = useModalOptions();
  return <Header zIndex={options?.zIndex} />;
};
// After: read the configuration where a modal renders.
const Frame = ({ children }: PropsWithChildren<ModalFrameProps>) => {
  const options = useModalOptions();
  return <Dialog zIndex={options.zIndex}>{children}</Dialog>;
};
```

A hand-built `ModalFrameProps` value must include `settled`, and frames also receive the optional `group` and `subtype`. Alert content now receives `context`, so a hand-built `AlertContentProps` value must include it.

This release also adds and fixes the following:

- The `root` prop of `ModalProvider` and the `root` option of `useInitializeModal`, which were accepted but ignored, now decide where modals mount: omit it for `document.body`, pass an element for that container, or pass `null` to defer. Changing the root, or calling `initialize(element)` again after initialization, moves open modals without remounting them; a repeated `initialize` call was previously ignored.
- Durations accept a number of milliseconds as well as `'300ms'` and `'0.3s'`, and the duration hooks return normalized `ms` strings. A numeric `options.duration` no longer makes every open reject.
- An explicit `undefined` in per-call arguments or `useModal(config)` inherits the setting from the level above instead of resetting it to the built-in default; `0` and `false` remain overrides.
- Changing a component prop of `ModalProvider` after mount logs a development warning. Component props stay fixed at mount, so pass changing data through `context`.
