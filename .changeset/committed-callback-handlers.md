---
"@winglet/react-utils": major
---

Breaking change: `useHandle`, `useOnUnmount`, `useOnUnmountLayout`, `useTimeout` and `useVersion` now run the handler or callback from the last committed render, so a call made before the current render commits runs the previous commit's function.

Two kinds of call see the difference. A call made during render, such as invoking a `useHandle` callback in the component body, runs the previously committed handler; only the first render, which has nothing committed yet, runs its own. On React 16.14 and 17 the handler is published in the parent's layout effect, so a child's layout effect that calls it after an update runs the previous commit's handler; React 18 and 19 publish before any layout effect runs. Where a call needs the function of the render in progress, call that function directly, or read it through `useReference`, whose render-time contract is unchanged.

Before:

```tsx
const getLabel = useHandle(() => format(value));
return <Label text={getLabel()} getLabel={getLabel} />;
// text used the value of this render
```

After:

```tsx
const getLabel = useHandle(() => format(value));
return <Label text={format(value)} getLabel={getLabel} />;
```

In return, a render that is discarded, suspends or throws can no longer replace the handler:

```tsx
function Editor({ value }: { value: string }) {
  const onSave = useHandle(() => save(value));
  useOnUnmount(() => save(value));
  return <button onClick={onSave}>Save</button>;
}
// "A" is committed and a render for "B" is discarded.
// Before: clicking Save or unmounting could save "B".
// After: it saves "A".
```
