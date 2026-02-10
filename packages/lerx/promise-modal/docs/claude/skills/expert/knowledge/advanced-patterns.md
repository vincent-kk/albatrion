# Advanced Patterns

## Pattern 3: Modal Cancellation with AbortSignal

Programmatically cancel modals.

```typescript
import { alert } from '@lerx/promise-modal';
import { useState } from 'react';

function ManualAbortControl() {
  const [controller, setController] = useState<AbortController | null>(null);

  const handleOpen = () => {
    const newController = new AbortController();
    setController(newController);

    alert({
      title: 'Manually Cancelable',
      content: 'Click "Cancel" button to close this modal.',
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

**Use Cases**:
- Timer-based auto-close
- Close modals in response to external events
- Programmatic modal control

---

## Pattern 4: Toast Implementation

Implement auto-dismissing toast notifications.

```typescript
import { alert, useModalAnimation, useModalDuration, useDestroyAfter } from '@lerx/promise-modal';
import { useRef, useEffect } from 'react';

const ToastForeground = ({ id, visible, children, onClose, onDestroy }) => {
  const ref = useRef(null);
  const { duration } = useModalDuration();

  // Auto-close after 3 seconds
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  // Handle animations
  useModalAnimation(visible, {
    onVisible: () => ref.current?.classList.add('visible'),
    onHidden: () => ref.current?.classList.remove('visible'),
  });

  // Remove from DOM after animation
  useDestroyAfter(id, duration);

  return <div ref={ref}>{children}</div>;
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
```

**Usage Example**:
```typescript
toast('Task completed successfully!');
toast('An error occurred.', 2000);
```

---

## Pattern 5: Nested Modals

Display multiple modals sequentially in steps.

```typescript
import { alert, confirm, prompt } from '@lerx/promise-modal';

async function multiStepProcess() {
  // Step 1: Start confirmation
  if (!await confirm({
    title: 'Start?',
    content: 'Do you want to continue?'
  })) return;

  // Step 2: Collect user info
  const name = await prompt({
    title: 'Name',
    defaultValue: '',
    Input: ({ value, onChange }) => (
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Enter your name"
      />
    ),
  });

  if (!name) return;

  // Step 3: Completion notification
  await alert({
    title: 'Complete',
    content: `Hello, ${name}!`,
    subtype: 'success',
  });
}
```

**Notes**:
- Each modal opens after the previous one closes
- Natural flow through Promise chaining
- Entire process stops if user cancels

---

## Pattern 6: Custom Anchor

Render modals inside a specific DOM element.

```typescript
import { useInitializeModal } from '@lerx/promise-modal';
import { useRef, useEffect } from 'react';

function CustomAnchorExample() {
  const { initialize, portal } = useInitializeModal({ mode: 'manual' });
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      initialize(containerRef.current);
    }
  }, [initialize]);

  return (
    <div>
      <h1>Custom Modal Container</h1>
      <div
        ref={containerRef}
        style={{
          position: 'relative',
          height: 500,
          border: '2px solid #ccc',
        }}
      />
      {portal}
    </div>
  );
}
```

**Use Cases**:
- Restrict modals to specific area
- Manage multiple modal containers
- Use modals inside iframe or Shadow DOM

---

## Pattern 7: Complex Form Input

Collect complex form data using prompt.

```typescript
import { prompt } from '@lerx/promise-modal';

interface UserForm {
  name: string;
  email: string;
  age: number;
  agree: boolean;
}

async function collectUserInfo() {
  const userInfo = await prompt<UserForm>({
    title: 'Enter User Information',
    defaultValue: {
      name: '',
      email: '',
      age: 18,
      agree: false,
    },
    Input: ({ value, onChange }) => (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <input
          type="text"
          placeholder="Name"
          value={value.name}
          onChange={(e) => onChange({ ...value, name: e.target.value })}
        />
        <input
          type="email"
          placeholder="Email"
          value={value.email}
          onChange={(e) => onChange({ ...value, email: e.target.value })}
        />
        <input
          type="number"
          placeholder="Age"
          value={value.age}
          onChange={(e) => onChange({ ...value, age: Number(e.target.value) })}
        />
        <label>
          <input
            type="checkbox"
            checked={value.agree}
            onChange={(e) => onChange({ ...value, agree: e.target.checked })}
          />
          I agree to the terms
        </label>
      </div>
    ),
    disabled: (value) => !value.name || !value.email || !value.agree,
  });

  console.log('Collected info:', userInfo);
}
```

**Key Points**:
- Type-safe handling of complex objects
- Validation with `disabled` function
- Confirm button disabled until all fields are filled

---

## Pattern 8: Conditional Modal Styles

Display different styled modals based on situation.

```typescript
import { alert } from '@lerx/promise-modal';

type NotificationType = 'info' | 'success' | 'warning' | 'error';

function notify(type: NotificationType, message: string) {
  return alert({
    title: {
      info: 'Information',
      success: 'Success',
      warning: 'Warning',
      error: 'Error',
    }[type],
    content: message,
    subtype: type,
    footer: {
      confirm: 'OK',
    },
  });
}

// Usage examples
notify('success', 'Data saved successfully.');
notify('error', 'Network error occurred.');
```

**Advantages**:
- Consistent notification interface
- Automatic styling by type
- Reusable utility function
