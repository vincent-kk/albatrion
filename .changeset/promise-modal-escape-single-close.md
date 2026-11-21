---
"@lerx/promise-modal": major
---

Breaking change: one Escape press now closes at most one modal even when a control inside the top modal settles it without calling `preventDefault`. Previously the modal below was cancelled by the same press.

A prompt whose input cancels on Escape is the common case. The lower `confirm` now stays pending:

```tsx
void confirm({ title: 'Leave the page?' });
void prompt<string>({
  title: 'Rename',
  Input: ({ value, onChange, onCancel }) => (
    <input
      value={value ?? ''}
      onChange={(event) => onChange(event.target.value)}
      onKeyDown={(event) => {
        if (event.key === 'Escape') onCancel();
      }}
    />
  ),
});
// Before: one Escape cancelled the prompt and the confirm.
// After: one Escape cancels only the prompt; a second Escape cancels the confirm.
```

If you relied on one press closing both, cancel the lower modal yourself in the same handler, for example through its `signal`:

```tsx
const lowerController = new AbortController();
void confirm({ title: 'Leave the page?', signal: lowerController.signal });

// Before: relied on the shared Escape press
onKeyDown={(event) => {
  if (event.key === 'Escape') onCancel();
}}
// After: close the lower request explicitly
onKeyDown={(event) => {
  if (event.key === 'Escape') {
    onCancel();
    lowerController.abort();
  }
}}
```

Calling `preventDefault` in the handler still stops the library from closing any modal for that press.
