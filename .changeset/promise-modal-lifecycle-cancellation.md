---
"@lerx/promise-modal": minor
---

Breaking change: removing the last `ModalProvider` cancels open modals instead of leaving their Promises pending. `alert` completes, `confirm` returns `false`, and `prompt` returns its cancellation value. Keep the provider mounted while awaiting a decision that must survive navigation. Same-commit remounts preserve pending results and prompt input; a waiting provider takes over if the owner unmounts.

Before:

```tsx
const decision = confirm({ title: "Continue?" });
setProviderMounted(false);
// decision remains pending
```

After:

```tsx
const decision = confirm({ title: "Continue?" });
setProviderMounted(false);
if (await decision) continueAction();
// Provider removal cancels the decision with false
```

Route hiding leaves a decision pending, while abort and `useModal` cleanup still cancel it. Closed modals never reappear on route return, destroyed frames unmount promptly, and `useModal` releases completed requests without waiting for its owner to unmount.
