---
name: promise-modal-skill
description: "@lerx/promise-modal library expert. Guide users on React-based Promise modal utilities (alert, confirm, prompt), architecture, and customization."
---

# Promise Modal Expert

Guide users on the `@lerx/promise-modal` library for React-based Promise modal utilities. Apply this skill when users ask how to implement, configure, customize, or troubleshoot modal dialogs built with `@lerx/promise-modal`.

## Library Overview

`@lerx/promise-modal` is a universal modal utility for React that provides:

- Promise-based modal interactions (alert, confirm, prompt)
- Usage both inside and outside React components
- High-level component customization
- Automatic lifecycle management
- Programmatic modal cancellation via AbortSignal

## Architecture

The library uses a layered architecture:

1. **Core Layer** — Main API functions (alert, confirm, prompt)
2. **Application Layer** — ModalManager singleton for lifecycle and DOM management
3. **Bootstrap Layer** — ModalProvider component for initialization
4. **Provider Layer** — Context providers for configuration and state
5. **Component Layer** — Customizable UI components

## Configuration Priority

Configuration is applied hierarchically, with lower levels overriding higher levels:

```
Provider Config (Lowest) < Hook Config < Handler Config (Highest)
```

| Level | Location | Description |
|------|------|------|
| **Provider** | `ModalProvider` props | App-wide default configuration |
| **Hook** | `useModal(config)` | Component-level configuration |
| **Handler** | `alert/confirm/prompt(options)` | Individual modal configuration |

---

## Basic Usage Patterns

### Pattern A: Static API

Use static functions outside React components.

```typescript
import { alert, confirm, prompt } from '@lerx/promise-modal';

// Simple alert
await alert({
  title: 'Alert',
  content: 'Task completed successfully.',
  subtype: 'success'
});

// Confirmation modal
if (await confirm({
  title: 'Confirm',
  content: 'Are you sure you want to delete this?'
})) {
  // User confirmed
}

// Prompt input
const name = await prompt({
  title: 'Enter Name',
  defaultValue: '',
  Input: ({ value, onChange }) => (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Enter your name"
    />
  ),
});
```

### Pattern B: Component-Scoped with useModal

Tie modals to component lifecycle — automatically cleaned up on unmount.

```typescript
import { useModal } from '@lerx/promise-modal';

function MyComponent() {
  const modal = useModal({
    ForegroundComponent: CustomForeground, // Hook-level config
  });

  const handleDelete = async () => {
    if (await modal.confirm({ content: 'Delete this item?' })) {
      // Delete logic
    }
  };

  return <button onClick={handleDelete}>Delete</button>;
}
```

**Static API vs useModal**:

| Feature | Static Handlers | useModal Hook |
|------|------------|-------------|
| Lifecycle | Independent | Tied to component |
| Cleanup | Manual | Auto on unmount |
| Usage Location | Anywhere | Inside React components |

For advanced patterns (AbortSignal cancellation, toasts, nested modals, custom anchors, complex forms), see `knowledge/advanced-patterns.md`.

---

## Troubleshooting

### Modal Not Appearing

1. Verify `ModalProvider` is at app root
2. (For manual mode) Ensure `initialize()` was called
3. Check for z-index and CSS conflicts

### Modal Not Closing

1. Check `manualDestroy` option
2. Verify `closeOnBackdropClick` configuration
3. Ensure `onClose` or `onConfirm` is being called

### Animation Not Working

1. Verify `useModalAnimation` hook is used correctly
2. Check CSS transition properties
3. Confirm Provider's `duration` option

### prompt Type Errors

1. Specify generic type: `prompt<string>(...)`
2. Ensure `defaultValue` matches type
3. Check `onChange` handler type

---

## Best Practices

1. **Place ModalProvider at Root** — wrap the entire app
2. **Use useModal in Components** — for automatic cleanup
3. **Use Static API in Utilities** — for non-component code
4. **Customize at Provider Level** — set global styles once
5. **Use subtype Semantically** — info, success, warning, error
6. **Handle Promises Properly** — always await or handle rejection
7. **Keep Modal Content Simple** — avoid complex state in modals
8. **Test Accessibility** — verify keyboard navigation
9. **Leverage AbortSignal** — when programmatic modal closure is needed

---

## Resources

Load these files on demand for detailed API, patterns, and type definitions:

| File | Contents |
|------|------|
| `knowledge/api-reference.md` | Static functions (alert, confirm, prompt) and ModalProvider detailed API |
| `knowledge/hooks-reference.md` | Complete reference for 8 hooks (useModal, useActiveModalCount, etc.) |
| `knowledge/advanced-patterns.md` | Advanced patterns: AbortSignal, toast, nested modals, custom anchors, complex forms |
| `knowledge/type-definitions.md` | TypeScript interface definitions (ModalFrameProps, FooterComponentProps, PromptInputProps) |
