---
"@lerx/promise-modal": major
---

Breaking change: pending `useModal` requests stay pending when React Activity hides only the caller and the `ModalProvider` stays visible. In the beta, hiding the caller cancelled its requests. Showing the caller again preserves the pending request. Removing the caller, including while hidden, still cancels it and resolves a pending confirmation to `false`.

If your application relied on cancellation when hiding the caller, pass an `AbortSignal` to the request and abort it when you hide the caller.

Before:

```tsx
const result = modal.confirm({ title: 'Continue?' });
setCallerMode('hidden');
```

After:

```tsx
const controller = new AbortController();
const result = modal.confirm({ title: 'Continue?', signal: controller.signal });
controller.abort();
setCallerMode('hidden');
```
