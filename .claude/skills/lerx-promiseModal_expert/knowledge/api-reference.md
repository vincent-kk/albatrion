# API Reference

## Static Functions

### `alert(options)`

Opens a simple notification modal.

```typescript
import { alert } from '@lerx/promise-modal';

await alert({
  title: 'Alert',
  content: 'Task completed successfully.',
  subtype: 'success', // 'info' | 'success' | 'warning' | 'error'
  dimmed: true,
  closeOnBackdropClick: true,
  manualDestroy: false,
  signal: abortController.signal, // Optional AbortSignal
});
```

**Options**:

| Option | Type | Description |
|------|------|------|
| `title` | `ReactNode` | Modal title |
| `subtitle` | `ReactNode` | Subtitle below title |
| `content` | `ReactNode \| ComponentType` | Modal content |
| `subtype` | `'info' \| 'success' \| 'warning' \| 'error'` | Modal styling type |
| `dimmed` | `boolean` | Whether to darken background |
| `closeOnBackdropClick` | `boolean` | Close on backdrop click |
| `manualDestroy` | `boolean` | Manual destruction mode |
| `duration` | `number \| string` | Animation duration |
| `background` | `ModalBackground` | Background configuration |
| `footer` | `Function \| Object \| false` | Footer configuration |
| `ForegroundComponent` | `ComponentType` | Custom foreground component |
| `BackgroundComponent` | `ComponentType` | Custom background component |
| `signal` | `AbortSignal` | AbortSignal for modal cancellation |

**Return Value**: `Promise<void>`

---

### `confirm(options)`

Opens a confirmation modal for user decision.

```typescript
import { confirm } from '@lerx/promise-modal';

const result = await confirm({
  title: 'Confirm',
  content: 'Are you sure you want to delete this?',
  footer: {
    confirm: 'Delete',
    cancel: 'Cancel',
  },
});

if (result) {
  console.log('User confirmed');
} else {
  console.log('User cancelled');
}
```

**Options**: Same options available as `alert()`

**Return Value**: `Promise<boolean>` - `true` if confirmed, `false` if cancelled

---

### `prompt<T>(options)`

Opens a prompt modal to collect user input.

```typescript
import { prompt } from '@lerx/promise-modal';

// Simple text input
const name = await prompt<string>({
  title: 'Enter Name',
  defaultValue: '',
  Input: ({ value, onChange }) => (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Enter your name"
    />
  ),
  disabled: (value) => value.length < 2,
});

// Complex object input
const userInfo = await prompt<{ name: string; age: number }>({
  title: 'User Information',
  defaultValue: { name: '', age: 0 },
  Input: ({ value, onChange }) => (
    <div>
      <input
        value={value.name}
        onChange={(e) => onChange({ ...value, name: e.target.value })}
      />
      <input
        type="number"
        value={value.age}
        onChange={(e) => onChange({ ...value, age: Number(e.target.value) })}
      />
    </div>
  ),
});
```

**Additional Options**:

| Option | Type | Description |
|------|------|------|
| `Input` | `(props: PromptInputProps<T>) => ReactNode` | Input component (required) |
| `defaultValue` | `T` | Default input value |
| `disabled` | `(value: T) => boolean` | Condition to disable confirm button |
| `returnOnCancel` | `boolean` | Whether to return default value on cancel |

**Return Value**: `Promise<T>`

---

## ModalProvider

Main Provider component for initialization.

```typescript
import { ModalProvider } from '@lerx/promise-modal';
import { useLocation } from 'react-router-dom';

function App() {
  return (
    <ModalProvider
      usePathname={useLocation}  // Router integration (auto-close on path change)
      ForegroundComponent={CustomForeground}
      BackgroundComponent={CustomBackground}
      TitleComponent={CustomTitle}
      SubtitleComponent={CustomSubtitle}
      ContentComponent={CustomContent}
      FooterComponent={CustomFooter}
      options={{
        duration: '200ms',
        backdrop: 'rgba(0, 0, 0, 0.35)',
        manualDestroy: true,
        closeOnBackdropClick: true,
      }}
      context={{
        theme: 'light',
        locale: 'en-US',
      }}
    >
      <YourApp />
    </ModalProvider>
  );
}
```

**Props**:

| Prop | Type | Description |
|------|------|------|
| `usePathname` | `() => { pathname: string }` | Router path hook (closes modals on path change) |
| `ForegroundComponent` | `ComponentType<ModalFrameProps>` | Custom foreground component |
| `BackgroundComponent` | `ComponentType<ModalFrameProps>` | Custom background component |
| `TitleComponent` | `ComponentType` | Custom title component |
| `SubtitleComponent` | `ComponentType` | Custom subtitle component |
| `ContentComponent` | `ComponentType` | Custom content component |
| `FooterComponent` | `ComponentType<FooterComponentProps>` | Custom footer component |
| `options` | `ModalOptions` | Global modal options |
| `context` | `any` | User-defined context data |
