---
"@lerx/promise-modal": minor
---

Breaking change: `useSubscribeModal` receives a numeric modal id and works without a provider context. Pass the `id` supplied to a custom frame.

Before:

```tsx
const version = useSubscribeModal(modal);
```

After:

```tsx
const version = useSubscribeModal(id);
```
