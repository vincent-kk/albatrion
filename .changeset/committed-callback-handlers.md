---
"@winglet/react-utils": major
---

Breaking change: a discarded, suspended or throwing render could previously replace a callback or unmount handler; now only a committed handler runs.

`useHandle`, `useOnUnmount`, `useOnUnmountLayout`, `useTimeout` and `useVersion` read the latest committed handler. React 18 and 19 publish before layout effects. On React 16.14 and 17, the handler is published in the parent layout effect, so a child layout effect can read the previous commit. The public `useReference` render-time contract stays unchanged.

Before:

```tsx
function Editor({ value }: { value: string }) {
  const onSave = useHandle(() => save(value));
  useOnUnmount(() => save(value));
  return <button onClick={onSave}>Save</button>;
}
// "A" is committed and a render for "B" is discarded.
// Clicking Save or unmounting could save "B".
```

After:

```tsx
function Editor({ value }: { value: string }) {
  const onSave = useHandle(() => save(value));
  useOnUnmount(() => save(value));
  return <button onClick={onSave}>Save</button>;
}
// "A" is committed and a render for "B" is discarded.
// Clicking Save or unmounting saves "A".
```
