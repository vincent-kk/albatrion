---
"@lerx/promise-modal": minor
---

Breaking change: a modal content, input, or frame render failure rejects that modal's Promise with the caught error. Handle rejection instead of assuming the result always resolves; other modals and later requests remain usable.

Before:

```tsx
await alert({ content: Details });
```

After:

```tsx
try {
  await alert({ content: Details });
} catch (error) {
  reportRenderFailure(error);
}
```

A failure in the shared rendering area rejects all affected modals and allows the next request to retry rendering.
