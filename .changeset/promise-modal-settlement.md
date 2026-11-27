---
"@lerx/promise-modal": major
---

Breaking change: every promise the package hands out now settles, and two hooks changed their signatures to follow modals without help from the caller.

`useSubscribeModal` takes a modal id instead of the modal object. Pass the `id` that a custom frame receives.

```tsx
// Before
const version = useSubscribeModal(modal);
// After
const version = useSubscribeModal(id);
```

`useActiveModalCount` no longer takes `refreshKey`. It follows node changes by itself, including route hiding and destruction, and works in any child of `ModalProvider`. Its predicate receives the exported read-only `ModalNodeView`.

```tsx
// Before
const count = useActiveModalCount((node) => node?.visible, refreshKey);
// After
const count = useActiveModalCount((node) => node.visible);
```

Removing the last `ModalProvider` cancels the open modals instead of leaving their promises pending: `alert` completes, `confirm` resolves `false`, and `prompt` resolves its cancellation value. A provider that remounts in the same commit keeps pending results and prompt input.

```tsx
const decision = confirm({ title: 'Continue?' });
setProviderMounted(false);
// Before: decision stays pending forever.
// After: decision resolves false.
```

A render failure in a modal's content rejects that modal's promise with the caught error, while other modals and later requests keep working. Handle the rejection where the modal is opened.

```tsx
// Before: the promise never settles when Details throws while rendering.
await alert({ content: Details });
// After
try {
  await alert({ content: Details });
} catch (error) {
  reportRenderFailure(error);
}
```

This release also fixes the following:

- `useDestroyAfter` waits for the modal to settle, and navigating away only hides a pending modal.
- A change to `options.zIndex` reaches modals that are already open.
- Successive functional `prompt` input updates accumulate in event order, and confirming is synchronous.
- The package imports, and `ModalProvider` server-renders, without a DOM. Call the modal-opening functions only in the browser.
