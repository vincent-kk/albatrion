# @lerx/promise-modal

[![Typescript](https://img.shields.io/badge/typescript-✔-blue.svg)]()
[![Javascript](https://img.shields.io/badge/javascript-✔-yellow.svg)]()
[![React](https://img.shields.io/badge/react-✔-61DAFB.svg)]()

---

## Overview

`@lerx/promise-modal` is a universal modal utility based on React.

Key features include:

- Can be used even in places not included in React components
- After opening a modal, you can retrieve the result as a promise
- Supports various modal types (alert, confirm, prompt)
- Highly customizable component structure

---

## Installation

```bash
yarn add @lerx/promise-modal
```

or

```bash
npm install @lerx/promise-modal
```

---

## Compatibility

**Supported environments:**

- Node.js 16.11.0 or later
- Modern browsers (Chrome 94+, Firefox 93+, Safari 15+)

**For legacy environment support:**
Please use a transpiler like Babel to transform the code for your target environment.

---

## How to Use

### 1. Setting up the Modal Provider

Install `ModalProvider` at the root of your application:

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

You can also apply custom options and components:

```tsx
import { ModalProvider } from '@lerx/promise-modal';

import {
  CustomBackground,
  CustomContent,
  CustomFooter,
  CustomForeground,
  CustomSubtitle,
  CustomTitle,
} from './components';

function App() {
  return (
    <ModalProvider
      ForegroundComponent={CustomForeground}
      BackgroundComponent={CustomBackground}
      TitleComponent={CustomTitle}
      SubtitleComponent={CustomSubtitle}
      ContentComponent={CustomContent}
      FooterComponent={CustomFooter}
      options={{
        duration: '250ms', // Animation duration
        backdrop: 'rgba(0, 0, 0, 0.35)', // Background overlay color
        manualDestroy: false, // Default auto-destroy behavior
        closeOnBackdropClick: true, // Default backdrop click behavior
      }}
      context={{
        // Context values accessible in all modal components
        theme: 'light',
        locale: 'en-US',
      }}
    >
      <YourApp />
    </ModalProvider>
  );
}
```

### 2. Using Basic Modals

#### Alert Modal

Alert modals provide simple information display with a confirmation button.

```tsx
import { alert } from '@lerx/promise-modal';

// Basic usage
async function showAlert() {
  await alert({
    title: 'Notification',
    content: 'The task has been completed.',
  });
  console.log('User closed the modal.');
}

// Using various options
async function showDetailedAlert() {
  await alert({
    subtype: 'success', // 'info' | 'success' | 'warning' | 'error'
    title: 'Success',
    subtitle: 'Details',
    content: 'The task has been successfully completed.',
    dimmed: true, // Dim the background
    closeOnBackdropClick: true, // Close on backdrop click
    // If use close animation, you need to set manualDestroy to true
    manualDestroy: false, // Auto-destroy (false: auto, true: manual)
    // Data to pass to the background
    background: {
      data: 'custom-data',
    },
  });
}
```

#### Confirm Modal

Confirm modals are used for actions that require user confirmation.

```tsx
import { confirm } from '@lerx/promise-modal';

async function showConfirm() {
  const result = await confirm({
    title: 'Confirm',
    content: 'Are you sure you want to delete this?',
    // Custom footer text
    footer: {
      confirm: 'Delete',
      cancel: 'Cancel',
    },
  });

  if (result) {
    console.log('User clicked confirm.');
    // Execute delete logic
  } else {
    console.log('User clicked cancel.');
  }
}
```

#### Prompt Modal

Prompt modals are used to receive input from users.

```tsx
import { prompt } from '@lerx/promise-modal';

async function showPrompt() {
  // Text input
  const name = await prompt<string>({
    title: 'Enter Name',
    content: 'Please enter your name.',
    defaultValue: '', // Default value
    Input: ({ value, onChange }) => {
      // Important: value is the current value, onChange is the function to update the value
      return (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Enter name"
        />
      );
    },
    // Validate input to control the confirmation button
    disabled: (value) => (value?.length ?? 0) < 2,
  });

  console.log('Entered name:', name);

  // Complex data input
  const userInfo = await prompt<{ name: string; age: number }>({
    title: 'User Information',
    defaultValue: { name: '', age: 0 },
    Input: ({ value = { name: '', age: 0 }, onChange }) => (
      <div>
        <input
          value={value.name}
          onChange={(e) => onChange({ ...value, name: e.target.value })}
          placeholder="Name"
        />
        <input
          type="number"
          value={value.age}
          onChange={(e) => onChange({ ...value, age: Number(e.target.value) })}
          placeholder="Age"
        />
      </div>
    ),
  });

  console.log('User info:', userInfo);
}
```

### 3. Using Custom Components

You can customize the appearance and behavior of modals:

```tsx
import { css } from '@emotion/css';
import { ModalProvider, alert, confirm } from '@lerx/promise-modal';

// Custom foreground component
const CustomForegroundComponent = ({ children, type, ...props }) => {
  return (
    <div
      className={css`
        background-color: #ffffff;
        border-radius: 12px;
        box-shadow: 0 4px 24px rgba(0, 0, 0, 0.1);
        width: 90%;
        max-width: 500px;
        padding: 24px;
        position: relative;
      `}
    >
      {children}
    </div>
  );
};

// Custom background component (utilizing background data)
const CustomBackgroundComponent = ({ children, onClick, background }) => {
  // Apply different styles based on background data
  const getBgColor = () => {
    if (background?.data === 'alert') return 'rgba(0, 0, 0, 0.7)';
    if (background?.data === 'confirm') return 'rgba(0, 0, 0, 0.5)';
    if (background?.data === 'prompt') return 'rgba(0, 0, 0, 0.6)';
    return 'rgba(0, 0, 0, 0.4)';
  };

  return (
    <div
      className={css`
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: ${getBgColor()};
        z-index: 1000;
      `}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

// Custom title component
const CustomTitleComponent = ({ children, context }) => {
  return (
    <h2
      className={css`
        font-size: 24px;
        margin-bottom: 8px;
        color: ${context?.theme === 'dark' ? '#ffffff' : '#333333'};
      `}
    >
      {children}
    </h2>
  );
};

// Custom subtitle component
const CustomSubtitleComponent = ({ children, context }) => {
  return (
    <h3
      className={css`
        font-size: 16px;
        margin-bottom: 16px;
        color: ${context?.theme === 'dark' ? '#cccccc' : '#666666'};
      `}
    >
      {children}
    </h3>
  );
};

// Custom content component
const CustomContentComponent = ({ children, context }) => {
  return (
    <div
      className={css`
        margin-bottom: 24px;
        color: ${context?.theme === 'dark' ? '#eeeeee' : '#444444'};
      `}
    >
      {children}
    </div>
  );
};

// Custom footer component
const CustomFooterComponent = ({
  onConfirm,
  onClose,
  onCancel,
  type,
  disabled,
}) => {
  return (
    <div
      className={css`
        display: flex;
        justify-content: flex-end;
        gap: 12px;
        margin-top: 24px;
      `}
    >
      {/* Display cancel button for confirm and prompt modals */}
      {(type === 'confirm' || type === 'prompt') && (
        <button
          className={css`
            padding: 8px 16px;
            border: 1px solid #ccc;
            background: none;
            border-radius: 4px;
            cursor: pointer;
            &:hover {
              background-color: #f3f3f3;
            }
          `}
          onClick={type === 'confirm' ? () => onConfirm(false) : onCancel}
        >
          Cancel
        </button>
      )}
      <button
        className={css`
          padding: 8px 16px;
          background-color: #4a90e2;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: ${disabled ? 'not-allowed' : 'pointer'};
          opacity: ${disabled ? 0.6 : 1};
          &:hover {
            background-color: ${disabled ? '#4a90e2' : '#357ac7'};
          }
        `}
        onClick={() => onConfirm(type === 'confirm' ? true : undefined)}
        disabled={disabled}
      >
        Confirm
      </button>
    </div>
  );
};

// Global setup in provider
function App() {
  return (
    <ModalProvider
      ForegroundComponent={CustomForegroundComponent}
      BackgroundComponent={CustomBackgroundComponent}
      TitleComponent={CustomTitleComponent}
      SubtitleComponent={CustomSubtitleComponent}
      ContentComponent={CustomContentComponent}
      FooterComponent={CustomFooterComponent}
      options={{
        duration: 300, // Animation duration (ms)
      }}
      context={{
        // Context accessible in all modals
        theme: 'light',
        locale: 'en-US',
      }}
    >
      <YourApp />
    </ModalProvider>
  );
}

// Applying custom components to specific modals
async function showCustomAlert() {
  await alert({
    title: 'Notification',
    content: 'Content',
    // Custom component only for this modal
    ForegroundComponent: ({ children }) => (
      <div
        className={css`
          background-color: #f0f8ff;
          padding: 30px;
          border-radius: 16px;
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
        `}
      >
        {children}
      </div>
    ),
    // Pass background data
    background: {
      data: 'custom-alert',
    },
  });
}
```

### 4. Using Custom Anchors and Initialization

`root` selects the portal location: omit it for `document.body`, pass an element for that container, or pass `null` to defer. A ref alone still initializes automatically. `initialize(element)` selects a root imperatively; the last call or `root` prop change wins. The same anchor moves between containers, preserving open input and Promises. Changing to `null` detaches the anchor, preserves mounted modals, and queues new requests; restoring an element reattaches it and processes the queue. An initially null root creates no anchor. `useInitializeModal` accepts the same `root`; `mode: 'manual'` defers its initial root until `initialize(element)` or a later root change. Always render its returned `portal`.

You can specify the DOM element where modals will be rendered:

```tsx
import { useEffect, useRef } from 'react';

import {
  ModalProvider,
  ModalProviderHandle,
  alert,
  useInitializeModal,
} from '@lerx/promise-modal';

// Using refs
function CustomAnchorExample() {
  // Modal provider handle reference
  const modalProviderRef = useRef<ModalProviderHandle>(null);
  // Container reference for modal display
  const modalContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize modal when container is ready
    if (modalContainerRef.current && modalProviderRef.current) {
      modalProviderRef.current.initialize(modalContainerRef.current);
    }
  }, []);

  return (
    <ModalProvider ref={modalProviderRef}>
      <div>
        {/* Modals will render inside this div */}
        <div
          ref={modalContainerRef}
          style={{
            backgroundColor: '#f0f0f0',
            width: '100%',
            height: '500px',
            position: 'relative',
            overflow: 'hidden',
          }}
        />

        <button
          onClick={() =>
            alert({ title: 'Notice', content: 'Displayed in custom anchor.' })
          }
        >
          Show Modal
        </button>
      </div>
    </ModalProvider>
  );
}

// Using the useInitializeModal hook
function CustomAnchorWithHookExample() {
  // useInitializeModal hook (manual mode: manual initialization)
  const { initialize, portal } = useInitializeModal({ mode: 'manual' });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      // Initialize modal with container element
      initialize(containerRef.current);
    }
  }, [initialize]);

  return (
    <div>
      {/* Container for modal rendering */}
      <div
        ref={containerRef}
        style={{
          backgroundColor: '#f0f0f0',
          width: '100%',
          height: '500px',
        }}
      />

      <button
        onClick={() =>
          alert({ title: 'Notice', content: 'Displayed in custom anchor.' })
        }
      >
        Show Modal
      </button>

      {/* Portal rendering in another location (optional) */}
      <div id="another-container">{portal}</div>
    </div>
  );
}
```

### 5. Implementing Toast Messages

You can implement toast message functionality using `promise-modal`. This example is based on actual implementation in the project:

```tsx
import React, { type ReactNode, useEffect, useRef } from 'react';

import { css } from '@emotion/css';
import {
  ModalFrameProps,
  alert,
  useDestroyAfter,
  useModalAnimation,
  useModalDuration,
} from '@lerx/promise-modal';

// Toast foreground component definition
const ToastForeground = ({
  id,
  visible,
  children,
  onClose,
  hideAfterMs = 3000,
}) => {
  const modalRef = useRef(null);
  const { duration } = useModalDuration();

  // Auto-close after specified time
  useEffect(() => {
    const timer = setTimeout(onClose, hideAfterMs);
    return () => clearTimeout(timer);
  }, [onClose, hideAfterMs]);

  // Animation handling
  useModalAnimation(visible, {
    onVisible: () => {
      modalRef.current?.classList.add('visible');
    },
    onHidden: () => {
      modalRef.current?.classList.remove('visible');
    },
  });

  // Destroy after closing
  useDestroyAfter(id, duration);

  return (
    <div
      ref={modalRef}
      className={css`
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%) translateY(100px);
        opacity: 0;
        transition:
          transform ${duration},
          opacity ${duration};
        &.visible {
          transform: translateX(-50%) translateY(0);
          opacity: 1;
        }
      `}
    >
      {children}
    </div>
  );
};

// Toast message interface
interface ToastProps {
  message: ReactNode;
  duration?: number;
}

// Handler to remove previous toast
let onDestroyPrevToast: () => void;

// Toast display function
export const toast = ({ message, duration = 1250 }: ToastProps) => {
  // Remove previous toast if exists
  onDestroyPrevToast?.();

  return alert({
    content: message,
    ForegroundComponent: (props: ModalFrameProps) => {
      // Store destroy function of new toast
      onDestroyPrevToast = props.onDestroy;
      return <ToastForeground {...props} hideAfterMs={duration} />;
    },
    footer: false, // Hide footer
    dimmed: false, // Disable background dim
    closeOnBackdropClick: false, // Disable closing on backdrop click
  });
};

// Usage example
function showToastExample() {
  toast({
    message: (
      <div
        className={css`
          background-color: #333;
          color: white;
          padding: 12px 24px;
          border-radius: 8px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        `}
      >
        Task completed!
      </div>
    ),
    duration: 2000, // Auto-close after 2 seconds
  });
}
```

### 6. Various Modal Configuration Options

Examples utilizing various modal configuration options:

```tsx
import { alert, confirm } from '@lerx/promise-modal';

// Basic alert modal
async function showBasicAlert() {
  await alert({
    title: 'Basic Notification',
    content: 'This is an alert modal with default settings.',
  });
}

// Modal settings by type
async function showModalByType() {
  // Success notification
  await alert({
    title: 'Success',
    content: 'Task completed successfully.',
    subtype: 'success',
    dimmed: true,
  });

  // Warning confirmation
  const result = await confirm({
    title: 'Warning',
    content: 'This action cannot be undone. Continue?',
    subtype: 'warning',
    closeOnBackdropClick: false, // Prevent closing by backdrop click
  });

  // Error notification
  await alert({
    title: 'Error',
    content: 'Unable to complete the task.',
    subtype: 'error',
    // Custom footer text
    footer: {
      confirm: 'I understand',
    },
  });
}

// Using manual destroy mode
async function showManualDestroyModal() {
  await alert({
    title: 'Notification',
    content:
      "This modal won't close on backdrop click and requires confirmation button to close.",
    manualDestroy: true, // Enable manual destroy mode
    closeOnBackdropClick: false, // Prevent closing by backdrop click
  });
}

// Using background data
async function showModalWithBackground() {
  await alert({
    title: 'Background Data Usage',
    content: 'This modal passes data to the background component.',
    background: {
      data: 'custom-background-data',
      opacity: 0.8,
      blur: '5px',
    },
  });
}
```

---

## API Reference

### Core Functions

#### `alert(options)`

Opens a simple alert modal to display information to the user.

**Parameters:**

- `options`: Alert modal configuration object
  - `title?`: Modal title (ReactNode)
  - `subtitle?`: Subtitle (ReactNode)
  - `content?`: Modal content (ReactNode or component)
  - `subtype?`: Modal type ('info' | 'success' | 'warning' | 'error')
  - `background?`: Background settings (ModalBackground object)
  - `footer?`: Footer settings
    - Function: `(props: FooterComponentProps) => ReactNode`
    - Object: `{ confirm?: string; hideConfirm?: boolean }`
    - `false`: Hide footer
  - `dimmed?`: Whether to dim the background (boolean)
  - `manualDestroy?`: Enable manual destroy mode (boolean)
  - `closeOnBackdropClick?`: Whether to close on backdrop click (boolean)
  - `closeOnEscape?`: Escape override (see Accessibility for inheritance)
  - `trapFocus?`: Trap Tab when the top visible pending modal is dimmed (default `true`)
  - `lockScroll?`: Lock body scrolling for a pending dimmed modal (default `true`)
  - `ForegroundComponent?`: Custom foreground component
  - `BackgroundComponent?`: Custom background component

**Returns:** `Promise<void>` - Resolved when the modal is closed

```typescript
// Example
await alert({
  title: 'Notification',
  content: 'Content',
  subtype: 'info',
  closeOnBackdropClick: true,
});
```

#### `confirm(options)`

Opens a confirmation modal that requests user confirmation.

**Parameters:**

- `options`: Confirm modal configuration
  - Same options as `alert`, plus:
  - `footer?`: Footer settings
    - Function: `(props: FooterComponentProps) => ReactNode`
    - Object: `{ confirm?: string; cancel?: string; hideConfirm?: boolean; hideCancel?: boolean }`
    - `false`: Hide footer

**Returns:** `Promise<boolean>` - Resolves to true if confirmed, false if canceled

```typescript
// Example
const result = await confirm({
  title: 'Confirm',
  content: 'Do you want to proceed?',
  footer: {
    confirm: 'Confirm',
    cancel: 'Cancel',
  },
});
```

#### `prompt<T>(options)`

Opens a prompt modal to receive input from the user.

**Parameters:**

- `options`: Prompt modal configuration object
  - Same options as `alert`, plus:
  - `Input`: Function to render input field
    - `(props: PromptInputProps<T>) => ReactNode`
    - props: `{ value: T; onChange: (value: T) => void }`
  - `defaultValue?`: Default value (T)
  - `disabled?`: Function to determine if confirm button should be disabled
    - `(value: T | undefined) => boolean`
  - `returnOnCancel?`: If true, cancel resolves with the current input value instead of null (boolean)
  - `footer?`: Footer settings (similar to confirm)

**Returns:** `Promise<T | undefined | null>`

Confirmation returns the current input unchanged, including `undefined` when no value is supplied. Ordinary cancellation returns `null`. With `returnOnCancel: true`, cancellation returns the current value (or `defaultValue` before rendering), including `undefined`. Set `defaultValue: ''` when untouched confirmation should return an empty string. Check `result === null` for ordinary cancellation rather than relying on truthiness.


```typescript
// Example
const value = await prompt<string>({
  title: 'Input',
  defaultValue: '',
  Input: ({ value, onChange }) => (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  ),
  disabled: (value) => (value ?? '').trim() === '',
});
```

### Components

#### `ModalProvider` (or `BootstrapProvider`)

Component that initializes and provides the modal service.

**Props:**

- `ForegroundComponent?`: Custom foreground component
  - `(props: PropsWithChildren<ModalFrameProps>) => ReactNode`
- `BackgroundComponent?`: Custom background component
  - `(props: ModalFrameProps) => ReactNode`
- `TitleComponent?`: Custom title component
- `SubtitleComponent?`: Custom subtitle component
- `ContentComponent?`: Custom content component
- `FooterComponent?`: Custom footer component
  - `(props: FooterComponentProps) => ReactNode`
- `options?`: Global modal options
  - `duration?`: Milliseconds as a number or a decimal `ms`/`s` string
  - `backdrop?`: Backdrop click handling
  - Other options...
- `context?`: Context object to pass to modal components
- `root?`: Portal container; `undefined` uses body and `null` defers
- `usePathname?`: Custom pathname hook function

**Handle:**

- `initialize(element)`: Select the portal root

```typescript
// Example using ref for control
import { useRef } from 'react';
import { ModalProvider, ModalProviderHandle } from '@lerx/promise-modal';

function App() {
  const modalProviderRef = useRef<ModalProviderHandle>(null);

  const handleInitialize = () => {
    modalProviderRef.current?.initialize(document.body);
  };

  return (
    <ModalProvider ref={modalProviderRef}>
      <YourApp />
    </ModalProvider>
  );
}
```

### Hooks

#### `useModal`

Returns modal handler functions that share the component's lifecycle.

**Key Features:**

Unlike static handlers (`alert`, `confirm`, `prompt`), modals created with `useModal` automatically clean up when the component unmounts. This is useful when you want to ensure that modals opened within a specific component are automatically closed when that component is removed.

**Returns:**

- `alert`: Alert modal handler function
- `confirm`: Confirm modal handler function
- `prompt`: Prompt modal handler function

```typescript
import { useModal } from '@lerx/promise-modal';

function MyComponent() {
  const modal = useModal();

  const handleShowAlert = async () => {
    // Modal will be automatically cleaned up when MyComponent unmounts
    await modal.alert({
      title: 'Notice',
      content: 'This modal is tied to the component lifecycle.',
    });
  };

  const handleShowConfirm = async () => {
    const result = await modal.confirm({
      title: 'Confirm',
      content: 'Do you want to proceed?',
    });
    console.log('Result:', result);
  };

  return (
    <div>
      <button onClick={handleShowAlert}>Show Alert</button>
      <button onClick={handleShowConfirm}>Show Confirm</button>
    </div>
  );
}
```

**Comparison with Static Handlers:**

| Feature        | Static Handlers               | useModal Hook                |
| -------------- | ----------------------------- | ---------------------------- |
| Lifecycle      | Independent of components     | Tied to component lifecycle  |
| Cleanup        | Manual cleanup required       | Automatic cleanup on unmount |
| Usage Location | Anywhere (even outside React) | Inside React components only |

#### `useModalOptions`

Read global options for modals.

```typescript
import { useModalOptions } from '@lerx/promise-modal';

function Component() {
  // ConfigurationContextProps
  const options = useModalOptions();

  // ...
}
```

#### `useModalDuration`

Read modal animation duration.

```typescript
import { useModalDuration } from '@lerx/promise-modal';

function Component() {
  // duration is 300ms, milliseconds is 300
  const { duration, milliseconds } = useModalDuration();
  // ...
}
```

#### `useModalBackdrop`

Read modal backdrop settings.

```typescript
import { useModalBackdrop } from '@lerx/promise-modal';

function Component() {
  // backdrop is a CSSProperties object
  const backdrop = useModalBackdrop();
  // ...
}
```

#### `useInitializeModal`

Initializes the modal service. Usually called automatically by `ModalProvider`.

```typescript
import { useInitializeModal } from '@lerx/promise-modal';

function Component() {
  const { portal } = useInitializeModal();
  return <main>{portal}</main>;
}
```

### Accessibility

Escape cancels only the top visible pending modal. `closeOnEscape` resolves in this order: the call's Escape option, the call's `closeOnBackdropClick`, the Provider's Escape option, then the Provider's backdrop click option (default `true`). `useModal` configuration counts as call data; `undefined` inherits. Set `closeOnEscape: false` to keep Escape from cancelling a request. IME composition and events with `preventDefault()` are ignored.

For `alive && visible && dimmed && !settled` modals, the library moves focus into the top participant (preserving frame `autoFocus`), traps Tab only when the top visible pending modal is dimmed, and restores connected openers on settlement. `trapFocus` and `lockScroll` default to `true` at Provider and call level; set either to `false` to delegate that responsibility. When a nondimmed modal is on top, native Tab order applies while page isolation remains. Disabling the trap still moves focus initially. `dimmed: false` modals do not take focus, isolate the page, or lock scrolling.

The default frame supplies `role="dialog"` and `aria-modal="true"`. Custom foreground frames supply their own role, accessible name, and description; the library wrapper supplies focus behavior. Give every dialog an accessible name, for example with `aria-labelledby` referencing its visible title. A visible dimmed backdrop blocks page pointers even with `closeOnBackdropClick: false`. For a pass-through toast, set both `dimmed` and `closeOnBackdropClick` to `false`.

See [the accessibility contract](./docs/en/SPECIFICATION.md#accessibility) for isolation, scroll restoration, nested roots, and portal limits.

### Configuration and public interface

Provider component props (`ForegroundComponent`, `BackgroundComponent`, `TitleComponent`, `SubtitleComponent`, `ContentComponent`, `FooterComponent`) are captured at mount so parent rerenders do not remount open prompts. Changes are ignored, with one warning per changed prop in development and no warning in production. Pass changing data through `context`; options remain reactive.

Option precedence is defaults, Provider options, `useModal(config)`, then per-call arguments. `undefined` inherits; `0` and `false` override. `useModal(config)` captures mount-time defaults. Provider and per-call `duration` accept nonnegative milliseconds (`300`, `0.5`), milliseconds strings (`'300ms'`, `'0.5ms'`), or seconds strings (`'0.3s'`). Invalid values fall back to the default (the Provider duration for per-call overrides), with a development warning. `useModalOptions().duration` and `useModalDuration(id?).duration` return normalized milliseconds strings; use them directly in CSS without appending another `ms`.

`useModalOptions`, `useModalBackdrop`, `useModalDuration`, and `useDestroyAfter` belong inside modal frame, content, or footer components. Calling them in ordinary Provider children or outside the modal tree throws an error explaining the required location. `useModalBackdrop` returns CSS properties. Frames receive `group`, `subtype`, and `settled`, and alert content receives `context`. Use exported `AlertProps`, `ConfirmProps`, `PromptProps`, and `OverridableHandleProps` to type application wrappers. Frame `onClose` and content/footer `onCancel` both cancel the request; AbortSignal also resolves with its cancellation value rather than rejecting.

### Platform integration

Copies of the package with the same internal state version share one modal system in the same JavaScript realm. An `alert`, `confirm`, or `prompt` imported by another copy reaches the active Provider; style identity, ownership, and cleanup are shared. Incompatible state versions stay independent and warn in development. Keep one compatible package version across the application; different windows or realms do not share a system.

The default pathname hook uses the Navigation API when available. Otherwise it polls only while a modal is alive, including route-hidden modals and closed modals awaiting destruction. Requests opened after an idle route change belong to the pathname at opening time. Custom `usePathname` hooks continue to follow their router's pathname.

React 18 and 19 are supported. Both ESM and CommonJS bundles start with `'use client'` so React Server Component tooling recognizes the client boundary. DOM-free import and server rendering remain supported without layout-effect warnings in React 18, including when `useModalAnimation` runs in a server-rendered component; call modal functions only in the browser.

### Lifecycle and ownership

Modal results settle once. Navigating away through `usePathname` hides pending modals without settling them; returning restores them. Abort and `useModal` owner cleanup still cancel a hidden modal. A settled modal never appears again, including with `manualDestroy: true`.

Only one `ModalProvider` (or `useInitializeModal` bootstrap) owns the portal. Additional providers wait and warn once in development. When the owner unmounts, the first waiting provider takes over the open modals. With no waiter, open modals settle with their cancellation values: `alert` completes, `confirm` returns `false`, and `prompt` returns `null` (or its current value with `returnOnCancel: true`). Same-commit remounts, including StrictMode checks, preserve pending results and prompt input.

A content, input, or frame render error rejects that modal's Promise with the caught error; handle rejection with `try`/`catch`. Other modals and later requests continue working. Destroying a pending modal also cancels it before removing its frame.

`useModal` releases completed requests as soon as they settle and cancels only pending requests when its component unmounts. Static calls outlive their calling component, but still follow provider ownership and cancellation.

`useActiveModalCount` and `useSubscribeModal(id)` read the shared store and work in ordinary provider children or outside the provider. The count predicate receives a read-only `ModalNodeView`; it updates on node publications without a refresh key. `useDestroyAfter` belongs inside a modal frame and destroys an already settled, alive modal after the delay. Route hiding alone never starts that timer. Changing the delay reschedules destruction using the latest value.

The package can be imported without a DOM and `ModalProvider` can render on the server. Call `alert`, `confirm`, and `prompt` only in the browser; server rendering has no modal portal and reports an active count of zero.

#### `useSubscribeModal`

Subscribes to modal state changes.

```typescript
import { useSubscribeModal } from '@lerx/promise-modal';

function Component({ id }) {
  const version = useSubscribeModal(id);

  // ...
}
```

#### `useDestroyAfter`

Destroys an already settled modal after the specified delay.

```typescript
import { useDestroyAfter } from '@lerx/promise-modal';

function Component({ modalId }) {
  // Destroy 3 seconds after settlement
  useDestroyAfter(modalId, 3000);

  // ...
}
```

#### `useActiveModalCount`

Returns the number of currently active modals.

```typescript
import { useActiveModalCount } from '@lerx/promise-modal';

function Component() {
  const count = useActiveModalCount();

  return (
    <div>
      Currently open modals: {count}
    </div>
  );
}
```

#### `useModalAnimation`

Provides modal animation state and control.

```typescript
import { useModalAnimation } from '@lerx/promise-modal';

export const Foreground = ({
  id,
  visible,
  children,
  onClose,
  hideAfterMs,
}: PropsWithChildren<ForegroundProps>) => {
  const modalRef = useRef<HTMLDivElement>(null);
  useModalAnimation(visible, {
    onVisible: () => {
      modalRef.current?.classList.add(styles.visible);
    },
    onHidden: () => {
      modalRef.current?.classList.remove(styles.visible);
    },
  });
  ...
}
```

### Type Definitions

The library provides various types for TypeScript compatibility:

#### `ModalFrameProps`

Properties passed to the modal frame component.

```typescript
interface ModalFrameProps<Context = any, B = any> {
  id: number;
  type: 'alert' | 'confirm' | 'prompt';
  group?: string;
  subtype?: 'info' | 'success' | 'warning' | 'error';
  settled: boolean;
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
}
```

#### `FooterComponentProps`

Properties passed to the footer component.

```typescript
interface FooterComponentProps {
  onConfirm: () => void;
  onClose: () => void;
  // Other props...
}
```

#### `PromptInputProps<T>`

Properties passed to the input component in prompt modals.

```typescript
interface PromptInputProps<T> {
  value: T;
  onChange: (value: T) => void;
}
```

Additional types provided:

- `ModalBackground`: Modal background settings type
- `AlertContentProps`: Alert modal content component props
- `ConfirmContentProps`: Confirm modal content component props
- `PromptContentProps`: Prompt modal content component props
- `WrapperComponentProps`: Modal wrapper component props

---

## Advanced Usage Examples

### 1. Nested Modals (Opening Modals inside Other Modals)

You can open modals inside other modals to create complex user interactions.

```tsx
import { alert, confirm, prompt } from '@lerx/promise-modal';

// Multi-step modal workflow example
async function multiStepProcess() {
  // First modal: confirm to proceed
  const shouldProceed = await confirm({
    title: 'Start Task',
    content: 'This task involves multiple steps. Do you want to continue?',
    footer: {
      confirm: 'Proceed',
      cancel: 'Cancel',
    },
  });

  if (!shouldProceed) return;

  // Second modal: get user input
  const userName = await prompt<string>({
    title: 'User Information',
    content: 'Please enter your name.',
    defaultValue: '',
    Input: ({ value, onChange }) => (
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Name"
      />
    ),
  });

  if (!userName) return;

  // Third modal: final confirmation
  const confirmed = await confirm({
    title: 'Final Confirmation',
    content: `${userName}, are you sure you want to proceed?`,
    subtype: 'warning',
  });

  if (confirmed) {
    // Last modal: completion notification
    await alert({
      title: 'Complete',
      content: `${userName}, the task has been completed successfully.`,
      subtype: 'success',
    });
  }
}

// Opening modal from within a footer
async function nestedModalInFooter() {
  const result = await confirm({
    title: 'Confirmation Required',
    content: 'Do you want to proceed with this task?',
    // Custom footer that opens another modal
    footer: ({ onConfirm, onClose }) => {
      const handleConfirm = async () => {
        // Open another modal when confirm button is clicked
        const isConfirmed = await confirm({
          title: 'Final Confirmation',
          content: 'Are you really sure? This action cannot be undone.',
          closeOnBackdropClick: false,
          // Apply different design to second modal
          ForegroundComponent: CustomForegroundComponent,
        });

        // Process first modal result based on second modal result
        if (isConfirmed) onConfirm();
        else onClose();
      };

      return (
        <div>
          <button onClick={onClose}>Cancel</button>
          <button onClick={handleConfirm}>Next Step</button>
        </div>
      );
    },
  });

  if (result) {
    console.log('Proceeding with the task.');
  }
}

// Opening modal from within a prompt modal
async function promptWithNestedModal() {
  const value = await prompt<{ title: string; description: string }>({
    title: 'Create Content',
    defaultValue: { title: '', description: '' },
    Input: ({ value = { title: '', description: '' }, onChange }) => {
      // Show help modal when help button is clicked
      const showHelp = () => {
        alert({
          title: 'Help',
          content: 'Enter a title and description. Title is required.',
        });
      };

      return (
        <div>
          <div>
            <label>Title</label>
            <input
              value={value.title}
              onChange={(e) => onChange({ ...value, title: e.target.value })}
            />
          </div>
          <div>
            <label>Description</label>
            <textarea
              value={value.description}
              onChange={(e) =>
                onChange({ ...value, description: e.target.value })
              }
            />
          </div>
          <button type="button" onClick={showHelp}>
            Help
          </button>
        </div>
      );
    },
    disabled: (value) => !value?.title,
  });

  console.log('Input value:', value);
}
```

---

## License

This repository is licensed under the MIT License. Please refer to the [`LICENSE`](./LICENSE) file for details.

---

## Contact

For inquiries or suggestions related to the project, please create an issue.
