# Promise Modal Guide Command

**Package**: `@lerx/promise-modal`
**Expert Skill**: `promise-modal-expert` (directory-based skill)

## Purpose

This command provides an interactive Q&A guide for users of the `@lerx/promise-modal` library. When invoked, help users understand and effectively use the library based on their specific questions and use cases.

## Activation

This command should be used when users:
- Have questions about `@lerx/promise-modal`
- Need help implementing modals
- Want to understand specific API usage
- Experience library-related issues
- Need code examples for specific scenarios

## Response Strategy

### Step 1: Identify Question Category

Classify user questions into one of the following:

1. **Getting Started** - Installation, setup, basic usage
2. **API Usage** - Specific function/hook usage
3. **Customization** - Custom components, styling, theming
4. **Advanced Patterns** - Toast, nested modals, animations, AbortSignal
5. **Troubleshooting** - Error resolution, debugging

### Step 2: Provide Structured Response

Follow this response pattern for each category:

---

## Category: Getting Started

### Related Questions:
- "How do I install promise-modal?"
- "How do I set up the Provider?"
- "What is the basic usage?"

### Response Template:

```markdown
## Installation

```bash
yarn add @lerx/promise-modal
# or
npm install @lerx/promise-modal
```

## Basic Setup

1. Wrap your app with ModalProvider:

```tsx
import { ModalProvider } from '@lerx/promise-modal';
import { useLocation } from 'react-router-dom'; // Optional router integration

function App() {
  return (
    <ModalProvider
      usePathname={useLocation}  // Router integration (auto-close on path change)
      options={{
        duration: '200ms',
        backdrop: 'rgba(0, 0, 0, 0.35)',
        manualDestroy: true,
      }}
    >
      <YourApp />
    </ModalProvider>
  );
}
```

2. Use modal functions anywhere:

```tsx
import { alert, confirm, prompt } from '@lerx/promise-modal';

// Simple alert
await alert({ title: 'Alert', content: 'Hello!' });

// Confirmation
const result = await confirm({ title: 'Confirm', content: 'Continue?' });

// User input
const value = await prompt<string>({
  title: 'Input',
  defaultValue: '',
  Input: ({ value, onChange }) => (
    <input value={value} onChange={(e) => onChange(e.target.value)} />
  ),
});
```
```

---

## Category: API Usage

### `alert` Questions:

```markdown
## alert() API

Opens a simple notification modal.

**Signature:**
```typescript
alert(options: AlertProps): Promise<void>
```

**Key Options:**
- `title`: Modal title (ReactNode)
- `content`: Modal content (ReactNode or Component)
- `subtype`: 'info' | 'success' | 'warning' | 'error'
- `dimmed`: Darken background (boolean)
- `closeOnBackdropClick`: Close on backdrop click (boolean)
- `signal`: AbortSignal for modal cancellation

**Example:**
```tsx
await alert({
  title: 'Success',
  content: 'Task completed!',
  subtype: 'success',
  dimmed: true,
});
```
```

### `confirm` Questions:

```markdown
## confirm() API

Opens a confirmation modal with yes/no options.

**Signature:**
```typescript
confirm(options: ConfirmProps): Promise<boolean>
```

**Return Value:**
- `true` - User clicked confirm
- `false` - User clicked cancel or backdrop

**Example:**
```tsx
const shouldDelete = await confirm({
  title: 'Delete Item',
  content: 'Are you sure you want to delete this?',
  footer: {
    confirm: 'Delete',
    cancel: 'Cancel',
  },
});

if (shouldDelete) {
  // Perform deletion
}
```
```

### `prompt` Questions:

```markdown
## prompt<T>() API

Opens a modal to collect user input.

**Signature:**
```typescript
prompt<T>(options: PromptProps<T>): Promise<T>
```

**Key Options:**
- `Input`: Custom input component (required)
- `defaultValue`: Initial value
- `disabled`: Function to disable confirm button

**Simple Example:**
```tsx
const name = await prompt<string>({
  title: 'Enter Name',
  defaultValue: '',
  Input: ({ value, onChange }) => (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  ),
  disabled: (value) => value.trim() === '',
});
```

**Complex Data Example:**
```tsx
interface UserData {
  name: string;
  email: string;
}

const userData = await prompt<UserData>({
  title: 'User Information',
  defaultValue: { name: '', email: '' },
  Input: ({ value, onChange }) => (
    <form>
      <input
        value={value.name}
        onChange={(e) => onChange({ ...value, name: e.target.value })}
        placeholder="Name"
      />
      <input
        value={value.email}
        onChange={(e) => onChange({ ...value, email: e.target.value })}
        placeholder="Email"
      />
    </form>
  ),
});
```
```

### `useModal` Questions:

```markdown
## useModal() Hook

Returns modal handlers tied to component lifecycle.

**Key Feature:** Automatic cleanup on component unmount.

**Example:**
```tsx
import { useModal } from '@lerx/promise-modal';

function MyComponent() {
  const modal = useModal();

  const handleAction = async () => {
    // These modals will auto-close if component unmounts
    if (await modal.confirm({ content: 'Proceed?' })) {
      await modal.alert({ content: 'Done!' });
    }
  };

  return <button onClick={handleAction}>Execute</button>;
}
```

**With Configuration:**
```tsx
const modal = useModal({
  ForegroundComponent: CustomForeground,
  dimmed: true,
  duration: 300,
});
```
```

---

## Category: Configuration Priority

```markdown
## Configuration Priority

Configuration is applied hierarchically:

```
Provider Config (Lowest) < Hook Config < Handler Config (Highest)
```

**Example:**
```tsx
// Provider level: Global defaults
<ModalProvider options={{ duration: '500ms', closeOnBackdropClick: true }}>
  <App />
</ModalProvider>

// Hook level: Component defaults (overrides Provider config)
const modal = useModal({
  ForegroundComponent: CustomForeground,
});

// Handler level: Individual modal (overrides Hook config)
modal.alert({
  title: 'Alert',
  duration: 200, // Override 500ms → 200ms
  ForegroundComponent: SpecialForeground, // Override CustomForeground
});
```
```

---

## Category: Customization

### Component Customization Questions:

```markdown
## Custom Components

### Custom Foreground

```tsx
const CustomForeground = ({ children, visible, id }) => {
  const ref = useRef(null);
  const { duration } = useModalDuration();

  useModalAnimation(visible, {
    onVisible: () => ref.current?.classList.add('active'),
    onHidden: () => ref.current?.classList.remove('active'),
  });

  useDestroyAfter(id, duration);

  return (
    <div
      ref={ref}
      style={{
        background: 'white',
        borderRadius: 12,
        padding: 24,
        maxWidth: 500,
      }}
    >
      {children}
    </div>
  );
};

// Use in Provider
<ModalProvider ForegroundComponent={CustomForeground}>
  <App />
</ModalProvider>

// Or in individual modal
alert({
  content: 'Hello',
  ForegroundComponent: CustomForeground,
});
```

### Custom Footer

```tsx
const CustomFooter = ({ onConfirm, onClose, type, disabled }) => (
  <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
    {type !== 'alert' && (
      <button onClick={onClose}>Cancel</button>
    )}
    <button onClick={() => onConfirm()} disabled={disabled}>
      Confirm
    </button>
  </div>
);
```
```

### Styling/Theming Questions:

```markdown
## Theming with Context

```tsx
<ModalProvider
  context={{
    theme: 'dark',
    primaryColor: '#007bff',
  }}
>
  <App />
</ModalProvider>

// Access in custom components
const CustomTitle = ({ children, context }) => (
  <h2 style={{ color: context.theme === 'dark' ? '#fff' : '#333' }}>
    {children}
  </h2>
);
```
```

---

## Category: Advanced Patterns

### AbortSignal Questions:

```markdown
## Modal Cancellation with AbortSignal

Programmatically cancel modals.

**Basic Usage:**
```tsx
const controller = new AbortController();

alert({
  title: 'Cancelable Modal',
  content: 'Auto-closes in 3 seconds.',
  signal: controller.signal,
});

// Cancel modal after 3 seconds
setTimeout(() => {
  controller.abort();
}, 3000);
```

**Manual Abort Control:**
```tsx
function ManualAbortControl() {
  const [controller, setController] = useState<AbortController | null>(null);

  const handleOpen = () => {
    const newController = new AbortController();
    setController(newController);

    alert({
      title: 'Manual Cancel',
      content: 'Click "Cancel" button to close modal.',
      signal: newController.signal,
      closeOnBackdropClick: false,
    }).then(() => {
      setController(null);
    });
  };

  const handleAbort = () => {
    if (controller) {
      controller.abort();
    }
  };

  return (
    <div>
      <button onClick={handleOpen} disabled={!!controller}>Open Modal</button>
      <button onClick={handleAbort} disabled={!controller}>Cancel Modal</button>
    </div>
  );
}
```

**Batch Cancel Multiple Modals:**
```tsx
const controllers: AbortController[] = [];

for (let i = 0; i < 3; i++) {
  const controller = new AbortController();
  controllers.push(controller);

  alert({
    title: `Modal ${i + 1}`,
    signal: controller.signal,
  });
}

// Cancel all modals
controllers.forEach((c) => c.abort());
```
```

### Toast Implementation Questions:

```markdown
## Toast Implementation

```tsx
import { alert, useModalAnimation, useDestroyAfter, useModalDuration } from '@lerx/promise-modal';

const ToastForeground = ({ id, visible, children, onClose, onDestroy }) => {
  const ref = useRef(null);
  const { duration } = useModalDuration();

  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  useModalAnimation(visible, {
    onVisible: () => ref.current?.classList.add('visible'),
    onHidden: () => ref.current?.classList.remove('visible'),
  });

  useDestroyAfter(id, duration);

  return (
    <div
      ref={ref}
      style={{
        position: 'fixed',
        bottom: 20,
        left: '50%',
        transform: 'translateX(-50%)',
        background: '#333',
        color: 'white',
        padding: '12px 24px',
        borderRadius: 8,
        opacity: 0,
        transition: 'opacity 300ms',
      }}
      className={visible ? 'visible' : ''}
    >
      {children}
    </div>
  );
};

// Pattern for removing previous toast
let onDestroyPrevToast: () => void;

export const toast = (message: ReactNode, duration = 1250) => {
  onDestroyPrevToast?.(); // Remove previous toast

  return alert({
    content: message,
    ForegroundComponent: (props) => {
      onDestroyPrevToast = props.onDestroy;
      return <ToastForeground {...props} />;
    },
    footer: false,
    dimmed: false,
    closeOnBackdropClick: false,
  });
};

// Usage
toast('Task completed successfully!');
```
```

### Nested Modal Questions:

```markdown
## Nested Modals

```tsx
async function multiStepWizard() {
  // Step 1: Confirm
  const proceed = await confirm({
    title: 'Start Wizard',
    content: 'We will guide you through the setup.',
  });

  if (!proceed) return;

  // Step 2: User input
  const username = await prompt<string>({
    title: 'Step 1: Username',
    defaultValue: '',
    Input: ({ value, onChange }) => (
      <input value={value} onChange={(e) => onChange(e.target.value)} />
    ),
  });

  if (!username) return;

  // Step 3: Confirm and complete
  const confirmed = await confirm({
    title: 'Step 2: Confirm',
    content: `Create account "${username}"?`,
  });

  if (confirmed) {
    await alert({
      title: 'Complete!',
      content: `Welcome, ${username}!`,
      subtype: 'success',
    });
  }
}
```
```

### Custom Anchor Questions:

```markdown
## Custom Modal Anchor

```tsx
import { ModalProvider, useInitializeModal, alert } from '@lerx/promise-modal';

function CustomAnchorExample() {
  const { initialize } = useInitializeModal({ mode: 'manual' });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      initialize(containerRef.current);
    }
  }, [initialize]);

  return (
    <div>
      {/* Modals render inside this container */}
      <div
        ref={containerRef}
        style={{
          position: 'relative',
          width: '100%',
          height: 500,
          overflow: 'hidden',
        }}
      />
      <button onClick={() => alert({ content: 'Inside custom container!' })}>
        Show Modal
      </button>
    </div>
  );
}
```
```

---

## Category: Troubleshooting

### Common Issues:

```markdown
## Troubleshooting Guide

### Modal Not Appearing

**Cause 1:** Missing ModalProvider
```tsx
// ❌ Wrong
function App() {
  return <MyApp />;
}

// ✅ Correct
function App() {
  return (
    <ModalProvider>
      <MyApp />
    </ModalProvider>
  );
}
```

**Cause 2:** z-index conflict
```css
/* Ensure modal has highest z-index */
.modal-container {
  z-index: 9999;
}
```

### Modal Not Closing

**Cause 1:** manualDestroy is true
```tsx
// Modal won't auto-close
alert({ content: 'Hello', manualDestroy: true });

// Must call onDestroy manually
```

**Cause 2:** closeOnBackdropClick is false
```tsx
// Won't close on backdrop click
alert({ content: 'Hello', closeOnBackdropClick: false });
```

### prompt TypeScript Errors

**Cause:** Missing generic type
```tsx
// ❌ Wrong - TypeScript can't infer type
const value = await prompt({ ... });

// ✅ Correct - Specify type
const value = await prompt<string>({ ... });
```

### Animation Not Working

**Cause:** Not using useModalAnimation
```tsx
// ❌ Wrong - Checking visible directly
if (visible) element.classList.add('show');

// ✅ Correct - Use hook
useModalAnimation(visible, {
  onVisible: () => element.classList.add('show'),
  onHidden: () => element.classList.remove('show'),
});
```
```

---

## Response Format

When answering questions, follow this structure:

1. **Brief Answer**: One-line summary
2. **Code Example**: Working code snippet
3. **Explanation**: Key points to understand
4. **Related API**: Links to related features
5. **Common Pitfalls**: What to avoid

---

## Example Interaction

**User**: "How do I disable the confirm button until a required field is filled?"

**Response**:
```markdown
Use the `disabled` option in `prompt()`:

```tsx
const email = await prompt<string>({
  title: 'Enter Email',
  defaultValue: '',
  Input: ({ value, onChange }) => (
    <input
      type="email"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="your@email.com"
    />
  ),
  // Disable confirm button until valid email
  disabled: (value) => !value.includes('@') || value.length < 5,
});
```

**Key Points:**
- `disabled` receives the current value
- Returns `true` to disable confirm button
- Updates reactively as user types

**Related:** `PromptInputProps`, `FooterComponentProps.disabled`
```

---

## Knowledge Sources

For more detailed information, refer to the related skill's in-depth knowledge:

| Topic | Knowledge File |
|------|-----------|
| Comprehensive Guide | `promise-modal-expert` (directory skill) |
| API Reference | `knowledge/api-reference.md` |
| Hooks Reference | `knowledge/hooks-reference.md` |
| Advanced Patterns | `knowledge/advanced-patterns.md` |
| Type Definitions | `knowledge/type-definitions.md` |

See SPECIFICATION documentation for full API specs.
