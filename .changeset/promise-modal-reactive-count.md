---
"@lerx/promise-modal": minor
---

Breaking change: `useActiveModalCount` removes its `refreshKey` argument and automatically follows node changes, including route hiding and destruction. It works in ordinary provider children and outside the provider. Predicate arguments use the exported read-only `ModalNodeView` type.

Before:

```tsx
const count = useActiveModalCount((node) => node?.visible, refreshKey);
```

After:

```tsx
const count = useActiveModalCount((node) => node.visible);
```
