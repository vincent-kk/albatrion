---
"@canard/schema-form": patch
---

A branch input that overrides its children's `onChange` now keeps the typing child's DOM when it synchronously commits the emitted value unchanged, and sibling children use the current parent callback.

The overridden callback now receives the evaluated value instead of an updater function. A parent that evaluates a child's function itself can remove that step. Keep a functional update for the parent so multiple child edits in one event preserve each other.

Before:

```tsx
<Child
  onChange={(input) =>
    onChange((prev) => ({
      ...prev,
      [Child.field]:
        typeof input === "function" ? input(prev?.[Child.field]) : input,
    }))
  }
/>
```

After:

```tsx
<Child
  onChange={(input) => onChange((prev) => ({ ...prev, [Child.field]: input }))}
/>
```
