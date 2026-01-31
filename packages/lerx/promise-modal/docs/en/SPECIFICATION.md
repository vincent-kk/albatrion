# @lerx/promise-modal Specification

> Universal React Modal Utility with Promise-based API

## Overview

`@lerx/promise-modal` is a React-based universal modal utility that provides:

- **Promise-based interactions**: Alert, confirm, and prompt modals that return promises
- **Universal usage**: Can be used both inside and outside React components
- **High customizability**: Every component can be customized
- **Automatic lifecycle management**: Handles mount/unmount and animations

---

## Table of Contents

1. [Installation](#installation)
2. [Quick Start](#quick-start)
3. [Architecture](#architecture)
4. [Core API](#core-api)
   - [alert](#alert)
   - [confirm](#confirm)
   - [prompt](#prompt)
5. [Hooks](#hooks)
   - [useModal](#usemodal)
   - [useActiveModalCount](#useactivemodalcount)
   - [useModalAnimation](#usemodalanimation)
   - [useModalDuration](#usemodalduration)
   - [useDestroyAfter](#usedestroyafter)
   - [useSubscribeModal](#usesubscribemodal)
   - [useInitializeModal](#useinitializemodal)
   - [useModalOptions](#usemodaloptions)
   - [useModalBackdrop](#usemodalbackdrop)
6. [Components](#components)
   - [ModalProvider](#modalprovider)
   - [Custom Components](#custom-components)
7. [Type Definitions](#type-definitions)
8. [Usage Patterns](#usage-patterns)
9. [Advanced Examples](#advanced-examples)
10. [AbortSignal Support](#abortsignal-support)

---

## Installation

```bash
# Using yarn
yarn add @lerx/promise-modal

# Using npm
npm install @lerx/promise-modal
```

### Peer Dependencies

- React 18-19
- React DOM 18-19

### Compatibility

- Node.js 16.11.0 or later
- Modern browsers (Chrome 94+, Firefox 93+, Safari 15+)

---

## Quick Start

### 1. Setup Provider

```tsx
import { ModalProvider } from '@lerx/promise-modal';

function App() {
  return (
    <ModalProvider>
      <YourApp />
    </ModalProvider>
  );
}
```

### 2. Use Modal Functions

```tsx
import { alert, confirm, prompt } from '@lerx/promise-modal';

// Alert
await alert({
  title: 'Notice',
  content: 'Operation completed.',
});

// Confirm
const result = await confirm({
  title: 'Confirm',
  content: 'Are you sure?',
});

// Prompt
const name = await prompt<string>({
  title: 'Enter Name',
  defaultValue: '',
  Input: ({ value, onChange }) => (
    <input value={value} onChange={(e) => onChange(e.target.value)} />
  ),
});
```

---

## Architecture

### Layer Structure

```
┌─────────────────────────────────────────────────────────────┐
│                     Your Application                        │
├─────────────────────────────────────────────────────────────┤
│  Core API Layer                                             │
│  ├── alert()                                                │
│  ├── confirm()                                              │
│  └── prompt()                                               │
├─────────────────────────────────────────────────────────────┤
│  Application Layer                                          │
│  └── ModalManager (Singleton)                               │
│      ├── DOM anchoring                                      │
│      ├── Style injection                                    │
│      └── Modal lifecycle                                    │
├─────────────────────────────────────────────────────────────┤
│  Bootstrap Layer                                            │
│  └── ModalProvider                                          │
│      ├── Initialization                                     │
│      └── Component setup                                    │
├─────────────────────────────────────────────────────────────┤
│  Provider Layer                                             │
│  ├── ModalManagerContext                                    │
│  ├── ConfigurationContext                                   │
│  └── UserDefinedContext                                     │
├─────────────────────────────────────────────────────────────┤
│  Component Layer                                            │
│  ├── Anchor                                                 │
│  ├── Background                                             │
│  ├── Foreground                                             │
│  └── Fallback Components                                    │
└─────────────────────────────────────────────────────────────┘
```

### Design Patterns

| Pattern | Usage |
|---------|-------|
| **Promise-based API** | Modal functions return promises |
| **Provider Pattern** | Context providers for configuration |
| **Factory Pattern** | Node factory for modal types |
| **Observer Pattern** | Subscription system for state |
| **Singleton Pattern** | ModalManager for global state |

### Modal Node System

```
AbstractNode (Base Class)
├── AlertNode    → Simple notifications
├── ConfirmNode  → Yes/no confirmations
└── PromptNode   → Input collection
```

Each node provides:
- Subscription-based state management
- Promise resolution handling
- Lifecycle management

### Configuration Priority

Configuration is applied hierarchically, with lower levels overriding higher levels:

```
Provider Settings (lowest) < Hook Settings < Handler Settings (highest)
```

| Level | Location | Description |
|-------|----------|-------------|
| **Provider** | `ModalProvider` props | App-wide default settings |
| **Hook** | `useModal(config)` | Component-level settings |
| **Handler** | `alert/confirm/prompt(options)` | Per-modal settings |

#### Example

```typescript
// Provider level: global defaults
<ModalProvider options={{ duration: '500ms', closeOnBackdropClick: true }}>
  <App />
</ModalProvider>

// Hook level: component defaults (overrides Provider settings)
const modal = useModal({
  ForegroundComponent: CustomForeground,
});

// Handler level: individual modal (overrides Hook settings)
modal.alert({
  title: 'Notice',
  duration: 200, // 500ms → 200ms override
  ForegroundComponent: SpecialForeground, // CustomForeground override
});
```

---

## Core API

### alert

Opens a simple notification modal.

#### Signature

```typescript
function alert<B = any>(options: AlertProps<B>): Promise<void>;
```

#### Parameters

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `title` | `ReactNode` | - | Modal title |
| `subtitle` | `ReactNode` | - | Subtitle below title |
| `content` | `ReactNode \| ComponentType<AlertContentProps>` | - | Modal content |
| `subtype` | `'info' \| 'success' \| 'warning' \| 'error'` | `'info'` | Modal type |
| `dimmed` | `boolean` | `true` | Dim background |
| `closeOnBackdropClick` | `boolean` | `true` | Close on backdrop |
| `manualDestroy` | `boolean` | `false` | Manual destroy mode |
| `duration` | `number \| string` | - | Animation duration (Handler level override) |
| `background` | `ModalBackground<B>` | - | Background settings |
| `footer` | `AlertFooterRender \| FooterOptions \| false` | - | Footer config |
| `ForegroundComponent` | `ComponentType<ModalFrameProps>` | - | Custom foreground |
| `BackgroundComponent` | `ComponentType<ModalFrameProps>` | - | Custom background |
| `signal` | `AbortSignal` | - | AbortSignal for canceling modal |

#### Example

```typescript
await alert({
  title: 'Success',
  content: 'Your changes have been saved.',
  subtype: 'success',
  footer: { confirm: 'OK' },
});
```

---

### confirm

Opens a confirmation modal for user decisions.

#### Signature

```typescript
function confirm<B = any>(options: ConfirmProps<B>): Promise<boolean>;
```

#### Parameters

All options from `alert`, plus:

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `footer` | `ConfirmFooterRender \| FooterOptions \| false` | - | Footer config |

#### FooterOptions for confirm

```typescript
interface FooterOptions {
  confirm?: string;
  cancel?: string;
  hideConfirm?: boolean;
  hideCancel?: boolean;
}
```

#### Returns

- `true` - User clicked confirm button
- `false` - User clicked cancel or backdrop

#### Example

```typescript
const shouldDelete = await confirm({
  title: 'Delete Item',
  content: 'This action cannot be undone.',
  subtype: 'warning',
  footer: {
    confirm: 'Delete',
    cancel: 'Keep',
  },
});

if (shouldDelete) {
  await deleteItem();
}
```

---

### prompt

Opens a prompt modal to collect user input.

#### Signature

```typescript
function prompt<T, B = any>(options: PromptProps<T, B>): Promise<T>;
```

#### Parameters

All options from `alert`, plus:

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `Input` | `(props: PromptInputProps<T>) => ReactNode` | Yes | Input component |
| `defaultValue` | `T` | No | Default value |
| `disabled` | `(value: T) => boolean` | No | Disable confirm |
| `returnOnCancel` | `boolean` | No | Return default on cancel |

#### PromptInputProps

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

#### Example

```typescript
// Simple input
const email = await prompt<string>({
  title: 'Enter Email',
  defaultValue: '',
  Input: ({ value, onChange }) => (
    <input
      type="email"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  ),
  disabled: (value) => !value?.includes('@'),
});

// Complex object
interface UserData {
  name: string;
  age: number;
}

const userData = await prompt<UserData>({
  title: 'User Info',
  defaultValue: { name: '', age: 0 },
  Input: ({ value, onChange }) => (
    <form>
      <input
        value={value.name}
        onChange={(e) => onChange({ ...value, name: e.target.value })}
      />
      <input
        type="number"
        value={value.age}
        onChange={(e) => onChange({ ...value, age: Number(e.target.value) })}
      />
    </form>
  ),
});
```

---

## Hooks

### useModal

Returns modal handlers tied to component lifecycle.

```typescript
function useModal(config?: Partial<ModalOptions>): {
  alert: typeof alert;
  confirm: typeof confirm;
  prompt: typeof prompt;
};
```

#### Key Feature

Modals automatically cleanup when the component unmounts.

#### Comparison

| Feature | Static Functions | useModal Hook |
|---------|-----------------|---------------|
| Lifecycle | Independent | Tied to component |
| Cleanup | Manual | Automatic |
| Usage | Anywhere | Inside components |

#### Example

```typescript
function DeleteButton({ id }) {
  const modal = useModal();

  const handleDelete = async () => {
    if (await modal.confirm({ content: 'Delete?' })) {
      await deleteItem(id);
    }
  };

  return <button onClick={handleDelete}>Delete</button>;
}
```

---

### useActiveModalCount

Returns the count of active modals.

```typescript
function useActiveModalCount(
  validate?: (modal?: ModalNode) => boolean,
  refreshKey?: string | number
): number;
```

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `validate` | `(modal) => boolean` | Filter function |
| `refreshKey` | `string \| number` | Force refresh key |

#### Example

```typescript
function ModalCounter() {
  const total = useActiveModalCount();
  const alerts = useActiveModalCount((m) => m?.type === 'alert');

  return <div>Total: {total}, Alerts: {alerts}</div>;
}
```

---

### useModalAnimation

Provides animation state callbacks.

```typescript
function useModalAnimation(
  visible: boolean,
  options: {
    onVisible?: () => void;
    onHidden?: () => void;
  }
): void;
```

#### Features

- Uses `requestAnimationFrame` for optimal timing
- Separates enter/exit animations
- Works with CSS transitions

#### Example

```typescript
function AnimatedModal({ visible, children }) {
  const ref = useRef<HTMLDivElement>(null);

  useModalAnimation(visible, {
    onVisible: () => {
      ref.current?.classList.add('fade-in');
    },
    onHidden: () => {
      ref.current?.classList.remove('fade-in');
    },
  });

  return <div ref={ref}>{children}</div>;
}
```

---

### useModalDuration

Returns modal animation duration.

```typescript
function useModalDuration(modalId?: number): {
  duration: string;      // e.g., '300ms'
  milliseconds: number;  // e.g., 300
};
```

---

### useDestroyAfter

Auto-destroys modal after specified time.

```typescript
function useDestroyAfter(
  modalId: number,
  duration: string | number
): void;
```

#### Behavior

- Starts timer when modal becomes hidden
- Cancels timer if modal becomes visible again
- Removes modal from DOM after duration

#### Example

```typescript
function ToastMessage({ id }) {
  useDestroyAfter(id, 300); // Destroy 300ms after hidden
  return <div>Toast</div>;
}
```

---

### useSubscribeModal

Subscribes to modal state changes.

```typescript
function useSubscribeModal(modal?: ModalNode): number;
```

#### Returns

Version number that increments on each state change.

#### Example

```typescript
function ModalDebugger({ modal }) {
  const version = useSubscribeModal(modal);

  useEffect(() => {
    console.log('State changed:', modal?.visible);
  }, [version]);
}
```

---

### useInitializeModal

Manually initializes modal service.

```typescript
function useInitializeModal(options?: {
  mode?: 'auto' | 'manual';
}): {
  initialize: (anchor?: HTMLElement) => void;
  portal: ReactPortal | null;
};
```

#### Modes

| Mode | Description |
|------|-------------|
| `auto` | Initializes automatically |
| `manual` | Requires calling `initialize()` |

---

### useModalOptions

Returns modal options configuration.

```typescript
function useModalOptions(): ModalOptions;
```

#### Returns

```typescript
interface ModalOptions {
  duration?: number | string;     // Animation duration
  backdrop?: string;              // Backdrop overlay color
  manualDestroy?: boolean;        // Manual destroy mode
  closeOnBackdropClick?: boolean; // Close on backdrop click
  zIndex?: number;                // CSS z-index
}
```

#### Example

```typescript
function ModalDebugInfo() {
  const options = useModalOptions();

  return (
    <div>
      <p>Duration: {options.duration}</p>
      <p>Backdrop: {options.backdrop}</p>
    </div>
  );
}
```

---

### useModalBackdrop

Returns only modal backdrop configuration.

```typescript
function useModalBackdrop(): string | CSSProperties;
```

#### Example

```typescript
function BackdropInfo() {
  const backdrop = useModalBackdrop();

  return <p>Current backdrop: {backdrop}</p>;
}
```

---

## Components

### ModalProvider

Main provider component for initialization.

```typescript
interface ModalProviderProps {
  children: ReactNode;
  ForegroundComponent?: ComponentType<ModalFrameProps>;
  BackgroundComponent?: ComponentType<ModalFrameProps>;
  TitleComponent?: ComponentType<WrapperComponentProps>;
  SubtitleComponent?: ComponentType<WrapperComponentProps>;
  ContentComponent?: ComponentType<WrapperComponentProps>;
  FooterComponent?: ComponentType<FooterComponentProps>;
  options?: ModalOptions;
  context?: Record<string, any>;
  usePathname?: () => { pathname: string };  // Router integration
  root?: HTMLElement;                        // Custom root element
}
```

#### ModalOptions

```typescript
interface ModalOptions {
  duration?: number | string;
  backdrop?: string;
  manualDestroy?: boolean;
  closeOnBackdropClick?: boolean;
}
```

#### usePathname (Router Integration)

The `usePathname` prop enables router integration. Modals will automatically close when the route changes.

```typescript
import { useLocation } from 'react-router-dom';

<ModalProvider
  usePathname={useLocation}  // react-router-dom integration
  // ...
>
  <App />
</ModalProvider>
```

#### Example

```typescript
import { useLocation } from 'react-router-dom';

<ModalProvider
  usePathname={useLocation}
  ForegroundComponent={CustomForeground}
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
    theme: 'dark',
    locale: 'en-US',
  }}
>
  <App />
</ModalProvider>
```

---

### Custom Components

#### ModalFrameProps

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

#### FooterComponentProps

Props for footer components.

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

#### WrapperComponentProps

Props for title/subtitle/content components.

```typescript
interface WrapperComponentProps {
  children: ReactNode;
  context: any;
}
```

#### Custom Component Example

```typescript
const CustomForeground: FC<ModalFrameProps> = ({
  id,
  visible,
  children,
  onClose,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const { duration } = useModalDuration();

  useModalAnimation(visible, {
    onVisible: () => ref.current?.classList.add('visible'),
    onHidden: () => ref.current?.classList.remove('visible'),
  });

  useDestroyAfter(id, duration);

  return (
    <div
      ref={ref}
      style={{
        background: 'white',
        borderRadius: 12,
        padding: 24,
        opacity: 0,
        transition: `opacity ${duration}ms`,
      }}
    >
      {children}
    </div>
  );
};
```

---

## Type Definitions

### Modal Types

```typescript
type ModalType = 'alert' | 'confirm' | 'prompt';
type ModalSubtype = 'info' | 'success' | 'warning' | 'error';
```

### ModalBackground

```typescript
interface ModalBackground<T = any> {
  data?: T;
  [key: string]: any;
}
```

### Content Props

```typescript
interface AlertContentProps {
  onConfirm: () => void;
  context: any;
}

interface ConfirmContentProps {
  onConfirm: () => void;
  onCancel: () => void;
  context: any;
}

interface PromptContentProps<T> {
  value?: T;
  onChange: (value: T) => void;
  onConfirm: () => void;
  onCancel: () => void;
  context: any;
}
```

---

## Usage Patterns

### Pattern 1: Static API (Simplest)

```typescript
import { alert, confirm, prompt } from '@lerx/promise-modal';

// Use anywhere, even outside React
async function handleSubmit() {
  if (await confirm({ content: 'Save changes?' })) {
    await saveData();
    await alert({ content: 'Saved!' });
  }
}
```

### Pattern 2: useModal Hook (Recommended for Components)

```typescript
function EditForm() {
  const modal = useModal();

  const handleSave = async () => {
    if (await modal.confirm({ content: 'Save?' })) {
      // Modals auto-cleanup if component unmounts
    }
  };
}
```

### Pattern 3: Full Customization

```typescript
<ModalProvider
  ForegroundComponent={CustomForeground}
  FooterComponent={CustomFooter}
  options={{ duration: 400 }}
  context={{ theme: 'dark' }}
>
  <App />
</ModalProvider>
```

### Pattern 4: Per-Modal Override

```typescript
await alert({
  content: 'Special modal',
  ForegroundComponent: SpecialForeground,
  background: { variant: 'special' },
});
```

---

## Advanced Examples

### Toast Notifications

```typescript
const ToastForeground: FC<ModalFrameProps> = ({
  id,
  visible,
  children,
  onClose,
}) => {
  const ref = useRef<HTMLDivElement>(null);
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
        transform: 'translateX(-50%) translateY(100px)',
        opacity: 0,
        transition: `all ${duration}ms`,
      }}
    >
      {children}
    </div>
  );
};

export const toast = (message: ReactNode) => {
  return alert({
    content: message,
    ForegroundComponent: ToastForeground,
    footer: false,
    dimmed: false,
    closeOnBackdropClick: false,
  });
};
```

### Multi-Step Wizard

```typescript
async function registrationWizard() {
  // Step 1: Terms acceptance
  const accepted = await confirm({
    title: 'Terms of Service',
    content: <TermsContent />,
    footer: { confirm: 'I Accept', cancel: 'Decline' },
  });

  if (!accepted) return null;

  // Step 2: User information
  const userInfo = await prompt<{
    name: string;
    email: string;
  }>({
    title: 'Your Information',
    defaultValue: { name: '', email: '' },
    Input: RegistrationForm,
    disabled: (v) => !v.name || !v.email?.includes('@'),
  });

  if (!userInfo) return null;

  // Step 3: Confirmation
  await alert({
    title: 'Welcome!',
    content: `Account created for ${userInfo.name}`,
    subtype: 'success',
  });

  return userInfo;
}
```

### Custom Anchor (Iframe/Portal)

```typescript
function IframedModals() {
  const { initialize } = useInitializeModal({ mode: 'manual' });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      initialize(containerRef.current);
    }
  }, [initialize]);

  return (
    <div style={{ position: 'relative', height: 600 }}>
      <div ref={containerRef} style={{ height: '100%' }} />
      <ModalTriggerButtons />
    </div>
  );
}
```

---

## Lifecycle

```
Creation → Show → Hide → Destroy
    ↓        ↓       ↓       ↓
 open()   visible  onHide  onDestroy
    ↓      true     ↓        ↓
 nodeFactory  ↓   visible   alive
    ↓         ↓    false    false
  Promise   animation  ↓        ↓
    ↓       starts   duration  removed
   ...        ↓      passes    from DOM
              ↓         ↓
           interaction  destroy
              ↓
            resolve
```

---

## Best Practices

1. **Wrap app with ModalProvider** at the root level
2. **Use useModal in components** for automatic cleanup
3. **Use static API for utilities** outside React
4. **Customize at provider level** for consistent styling
5. **Use subtype for semantics** (info, success, warning, error)
6. **Always await or handle** promise rejections
7. **Keep modal content simple** - avoid complex state
8. **Test accessibility** - ensure keyboard navigation

---

## AbortSignal Support

Provides `AbortSignal` support for programmatically canceling modals.

### Basic Usage

```typescript
const controller = new AbortController();

alert({
  title: 'Cancelable Modal',
  content: 'This will auto-close in 3 seconds.',
  signal: controller.signal,
});

// Cancel modal after 3 seconds
setTimeout(() => {
  controller.abort();
}, 3000);
```

### Manual Abort Control

```typescript
function ManualAbortControl() {
  const [controller, setController] = useState<AbortController | null>(null);

  const handleOpen = () => {
    const newController = new AbortController();
    setController(newController);

    alert({
      title: 'Manual Cancel',
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
      <button onClick={handleOpen} disabled={!!controller}>
        Open Modal
      </button>
      <button onClick={handleAbort} disabled={!controller}>
        Cancel Modal
      </button>
    </div>
  );
}
```

### Batch Cancel Multiple Modals

```typescript
function MultipleModalsAbort() {
  const [controllers, setControllers] = useState<AbortController[]>([]);

  const handleOpenMultiple = () => {
    const newControllers: AbortController[] = [];

    for (let i = 0; i < 3; i++) {
      const controller = new AbortController();
      newControllers.push(controller);

      alert({
        title: `Modal ${i + 1}`,
        content: `This is modal number ${i + 1}.`,
        signal: controller.signal,
        closeOnBackdropClick: false,
      });
    }

    setControllers(newControllers);
  };

  const handleAbortAll = () => {
    controllers.forEach((controller) => controller.abort());
    setControllers([]);
  };

  return (
    <div>
      <button onClick={handleOpenMultiple}>Open 3 Modals</button>
      <button onClick={handleAbortAll}>Cancel All Modals</button>
    </div>
  );
}
```

### Pre-Aborted Signal Handling

```typescript
// If the signal is already aborted, the modal closes immediately
const controller = new AbortController();
controller.abort(); // Abort first

alert({
  title: 'Instant Close',
  content: 'Signal is already aborted, closing immediately.',
  signal: controller.signal,
}).then(() => {
  console.log('Modal closed immediately.');
});
```

---

## License

MIT License

---

## Version

Current: See package.json
