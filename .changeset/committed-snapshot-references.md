---
"@winglet/react-utils": major
---

Breaking change: useSnapshotReference publishes its current value at commit, so reading current during an update render returns the previous committed snapshot. Use useSnapshot for a value needed by the current render; retain useSnapshotReference for imperative readers.

Before:

```tsx
const reference = useSnapshotReference(data);
return <span>{reference.current.title}</span>;
```

After:

```tsx
const snapshot = useSnapshot(data);
return <span>{snapshot.title}</span>;
```

useSnapshot and useRestProperties also keep their comparison caches at commit, so suspended or abandoned renders no longer invalidate equal committed values.
