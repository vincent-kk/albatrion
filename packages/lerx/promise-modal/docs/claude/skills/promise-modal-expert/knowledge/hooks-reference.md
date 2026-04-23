# Hooks Reference

## useModal

Returns modal handlers tied to component lifecycle.

```typescript
import { useModal } from '@lerx/promise-modal';

function MyComponent() {
  const modal = useModal({
    ForegroundComponent: CustomForeground, // Hook-level config
  });

  const handleShow = async () => {
    await modal.alert({ title: 'Alert', content: 'Hello!' });
  };

  return <button onClick={handleShow}>Open Modal</button>;
}
```

**Key Feature**: Modals are automatically cleaned up when component unmounts.

| Feature | Static Handlers | useModal Hook |
|------|------------|-------------|
| Lifecycle | Independent | Tied to component |
| Cleanup | Manual | Auto on unmount |
| Usage Location | Anywhere | Inside React components |

---

## useActiveModalCount

Returns the count of currently active modals.

```typescript
import { useActiveModalCount } from '@lerx/promise-modal';

function App() {
  const count = useActiveModalCount();
  // Optional: Filter with condition
  const alertCount = useActiveModalCount(
    (modal) => modal?.type === 'alert' && modal.visible
  );

  return <div>Open modals: {count}</div>;
}
```

**Parameters**:
- `filter?: (modal: ModalNode) => boolean` - Optional filter function

**Returns**: `number` - Active modal count

---

## useModalAnimation

Provides animation state callbacks.

```typescript
import { useModalAnimation } from '@lerx/promise-modal';

function CustomForeground({ visible, children }) {
  const ref = useRef(null);

  useModalAnimation(visible, {
    onVisible: () => ref.current?.classList.add('visible'),
    onHidden: () => ref.current?.classList.remove('visible'),
  });

  return <div ref={ref}>{children}</div>;
}
```

**Parameters**:
- `visible: boolean` - Modal visibility state
- `callbacks: { onVisible?: () => void; onHidden?: () => void }` - State change callbacks

**Timing**:
- `onVisible`: When modal starts becoming visible
- `onHidden`: When modal starts becoming hidden

---

## useModalDuration

Returns modal animation duration.

```typescript
import { useModalDuration } from '@lerx/promise-modal';

function Component() {
  const { duration, milliseconds } = useModalDuration();
  // duration: '300ms', milliseconds: 300

  return <div>Animation duration: {duration}</div>;
}
```

**Returns**:
```typescript
{
  duration: string;      // CSS format (e.g., '300ms')
  milliseconds: number;  // Number format (e.g., 300)
}
```

---

## useDestroyAfter

Automatically destroys modal after specified time.

```typescript
import { useDestroyAfter } from '@lerx/promise-modal';

function ToastComponent({ id, duration }) {
  useDestroyAfter(id, duration);
  return <div>Toast message</div>;
}
```

**Parameters**:
- `id: number` - Modal ID
- `duration: number | string` - Wait time before destruction

**Use Case**: Auto-removal in toast notification implementation

---

## useSubscribeModal

Subscribes to modal state changes.

```typescript
import { useSubscribeModal } from '@lerx/promise-modal';

function ModalTracker({ modal }) {
  const version = useSubscribeModal(modal);

  useEffect(() => {
    console.log('Modal state changed');
  }, [version]);

  return <div>Version: {version}</div>;
}
```

**Parameters**:
- `modal: ModalNode` - Modal node to subscribe to

**Returns**: `number` - Modal version (increments on state change)

**Purpose**: React to modal internal state changes

---

## useModalOptions

Returns modal option configuration.

```typescript
import { useModalOptions } from '@lerx/promise-modal';

function ModalDebugInfo() {
  const options = useModalOptions();

  return (
    <div>
      <p>Duration: {options.duration}</p>
      <p>Backdrop: {options.backdrop}</p>
      <p>Manual Destroy: {options.manualDestroy ? 'Yes' : 'No'}</p>
    </div>
  );
}
```

**Returns**: `ModalOptions` - Current modal's options object

**Included Properties**:
- `duration` - Animation duration
- `backdrop` - Background configuration
- `manualDestroy` - Manual destruction mode
- `closeOnBackdropClick` - Close on backdrop click
- Other modal configuration options

---

## useModalBackdrop

Returns only modal background configuration.

```typescript
import { useModalBackdrop } from '@lerx/promise-modal';

function BackdropInfo() {
  const backdrop = useModalBackdrop();

  return <p>Current backdrop: {backdrop}</p>;
}
```

**Returns**: `ModalBackground` - Background configuration value

**Purpose**: Lighter alternative to `useModalOptions` when only backdrop configuration is needed
