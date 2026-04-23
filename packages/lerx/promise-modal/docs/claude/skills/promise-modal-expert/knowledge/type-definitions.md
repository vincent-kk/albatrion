# Type Definitions

## ModalFrameProps

Props passed to Foreground/Background components.

```typescript
interface ModalFrameProps<Context = any, B = any> {
  id: number;
  type: 'alert' | 'confirm' | 'prompt';
  alive: boolean;
  visible: boolean;
  initiator: string;
  manualDestroy: boolean;
  closeOnBackdropClick: boolean;
  background?: ModalBackground<B>;
  onConfirm: () => void;
  onClose: () => void;
  onChange: (value: any) => void;
  onDestroy: () => void;
  onChangeOrder: Function;
  context: Context;
  children: ReactNode;
}
```

**Property Descriptions**:

| Property | Type | Description |
|------|------|------|
| `id` | `number` | Unique modal ID |
| `type` | `'alert' \| 'confirm' \| 'prompt'` | Modal type |
| `alive` | `boolean` | Whether modal exists in DOM |
| `visible` | `boolean` | Whether modal is visible on screen |
| `initiator` | `string` | Identifier of modal creator |
| `manualDestroy` | `boolean` | Whether manual destruction mode is enabled |
| `closeOnBackdropClick` | `boolean` | Whether close on backdrop click is enabled |
| `background` | `ModalBackground<B>` | Background configuration |
| `onConfirm` | `() => void` | Confirm button click handler |
| `onClose` | `() => void` | Modal close handler |
| `onChange` | `(value: any) => void` | Value change handler (for prompt) |
| `onDestroy` | `() => void` | Modal destruction handler |
| `onChangeOrder` | `Function` | Modal order change handler |
| `context` | `Context` | User-defined context data |
| `children` | `ReactNode` | Modal internal content |

---

## FooterComponentProps

Props for custom footer components.

```typescript
interface FooterComponentProps {
  type: 'alert' | 'confirm' | 'prompt';
  onConfirm: (value?: any) => void;
  onClose: () => void;
  onCancel?: () => void;
  disabled?: boolean;
  footer?: FooterOptions;
  context: any;
}
```

**Property Descriptions**:

| Property | Type | Description |
|------|------|------|
| `type` | `'alert' \| 'confirm' \| 'prompt'` | Modal type |
| `onConfirm` | `(value?: any) => void` | Confirm button click handler |
| `onClose` | `() => void` | Close button click handler |
| `onCancel` | `() => void` | Cancel button click handler (optional) |
| `disabled` | `boolean` | Confirm button disabled state (optional) |
| `footer` | `FooterOptions` | Footer configuration options (optional) |
| `context` | `any` | User-defined context data |

**Usage Example**:

```typescript
const CustomFooter: React.FC<FooterComponentProps> = ({
  type,
  onConfirm,
  onClose,
  disabled,
  footer,
}) => {
  return (
    <div className="custom-footer">
      {type !== 'alert' && (
        <button onClick={onClose}>
          {footer?.cancel || 'Cancel'}
        </button>
      )}
      <button onClick={() => onConfirm()} disabled={disabled}>
        {footer?.confirm || 'Confirm'}
      </button>
    </div>
  );
};
```

---

## PromptInputProps<T>

Props for prompt input components.

```typescript
interface PromptInputProps<T> {
  value?: T;
  defaultValue?: T;
  onChange: (value: T | undefined) => void;
  onConfirm: () => void;
  onCancel: () => void;
  context: any;
}
```

**Property Descriptions**:

| Property | Type | Description |
|------|------|------|
| `value` | `T` | Current input value (optional) |
| `defaultValue` | `T` | Default input value (optional) |
| `onChange` | `(value: T \| undefined) => void` | Value change handler |
| `onConfirm` | `() => void` | Confirm action handler (e.g., Enter key) |
| `onCancel` | `() => void` | Cancel action handler (e.g., Escape key) |
| `context` | `any` | User-defined context data |

**Usage Examples**:

```typescript
// Simple text input
const TextInput: React.FC<PromptInputProps<string>> = ({
  value = '',
  onChange,
  onConfirm,
}) => {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyPress={(e) => e.key === 'Enter' && onConfirm()}
    />
  );
};

// Complex object input
interface FormData {
  name: string;
  email: string;
}

const FormInput: React.FC<PromptInputProps<FormData>> = ({
  value = { name: '', email: '' },
  onChange,
}) => {
  return (
    <div>
      <input
        value={value.name}
        onChange={(e) => onChange({ ...value, name: e.target.value })}
      />
      <input
        value={value.email}
        onChange={(e) => onChange({ ...value, email: e.target.value })}
      />
    </div>
  );
};
```
