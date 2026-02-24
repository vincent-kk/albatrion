# @winglet/react-utils — Specification

**Version**: 0.10.0
**Description**: React utility library — custom hooks, HOCs, and utility functions
**License**: MIT

---

## Table of Contents

1. [Installation](#installation)
2. [Quick Start](#quick-start)
3. [Sub-path Imports](#sub-path-imports)
4. [Hooks API](#hooks-api)
   - [useConstant](#useconstant)
   - [useTruthyConstant](#usetruthyconstant)
   - [useMemorize](#usememorize)
   - [useReference](#usereference)
   - [useHandle](#usehandle)
   - [useSnapshot](#usesnapshot)
   - [useSnapshotReference](#usesnapshotreference)
   - [useRestProperties](#userestproperties)
   - [useOnMount](#useonmount)
   - [useOnMountLayout](#useonmountlayout)
   - [useOnUnmount](#useonunmount)
   - [useOnUnmountLayout](#useonunmountlayout)
   - [useEffectUntil](#useeffectuntil)
   - [useLayoutEffectUntil](#uselayouteffectuntil)
   - [useDebounce](#usedebounce)
   - [useTimeout](#usetimeout)
   - [useVersion](#useversion)
   - [useWindowSize](#usewindowsize)
5. [Portal System](#portal-system)
6. [Higher-Order Components](#higher-order-components)
   - [withErrorBoundary](#witherrorboundary)
   - [withErrorBoundaryForwardRef](#witherrorboundaryforwardref)
   - [withUploader](#withuploader)
7. [Utility Functions](#utility-functions)
   - [Filter](#filter)
   - [Object](#object)
   - [Render](#render)
8. [Type Definitions](#type-definitions)
9. [Compatibility](#compatibility)

---

## Installation

```bash
npm install @winglet/react-utils
# or
yarn add @winglet/react-utils
```

**Peer dependencies** (install separately):

```bash
npm install react react-dom
# React 16, 17, 18, or 19 are all supported
```

---

## Quick Start

```tsx
import {
  useConstant,
  useHandle,
  useOnMount,
  useWindowSize,
  Portal,
  withErrorBoundary,
} from '@winglet/react-utils';

// Stable configuration object (never recreated)
const config = useConstant({ apiUrl: '/api', timeout: 5000 });

// Stable event handler that always uses latest state
const handleSubmit = useHandle(() => submitForm(formData));

// Run once on mount
useOnMount(() => {
  analytics.track('page_view');
});

// Responsive layout
const { width } = useWindowSize();
const isMobile = width < 768;

// Portal for modals
const App = Portal.with(() => (
  <div>
    <Portal><Modal /></Portal>
    <Portal.Anchor />
  </div>
));

// Crash protection
const SafeWidget = withErrorBoundary(Widget, <p>Failed to load.</p>);
```

---

## Sub-path Imports

Use sub-path imports to reduce bundle size:

| Sub-path | Contents |
|----------|----------|
| `@winglet/react-utils` | All exports |
| `@winglet/react-utils/hook` | All 18 hooks |
| `@winglet/react-utils/hoc` | `withErrorBoundary`, `withErrorBoundaryForwardRef`, `withUploader` |
| `@winglet/react-utils/portal` | `Portal` compound object |
| `@winglet/react-utils/filter` | `isReactComponent`, `isReactElement`, `isClassComponent`, `isFunctionComponent`, `isMemoComponent` |
| `@winglet/react-utils/object` | `remainOnlyReactComponent` |
| `@winglet/react-utils/render` | `renderComponent` |

---

## Hooks API

### useConstant

Creates a constant value that persists throughout the entire component lifecycle.

```typescript
function useConstant<T>(input: T): T
```

The value is stored on the first render and never recomputed. If a function is passed, the function itself is stored (not called). Use `useTruthyConstant` for lazy factory initialization.

**Parameters**:
- `input` — The value to store permanently. Any type.

**Returns**: The constant value, identical on every render.

```tsx
const MyComponent = () => {
  // Stable object — never triggers React.memo re-renders
  const defaultConfig = useConstant({ showIcon: true, pageSize: 20 });

  // Expensive one-time computation
  const lookupTable = useConstant(() => buildLookupTable(rawData));
  // Note: the function is STORED, not called. Use useTruthyConstant for factory calls.

  return <ExpensiveChild config={defaultConfig} />;
};
```

---

### useTruthyConstant

Creates a lazily initialized constant. If a function is provided, it is called on first access (when the stored value is falsy).

```typescript
function useTruthyConstant<T>(input: T | (() => T)): T
```

**Parameters**:
- `input` — A value or a factory function. Functions are called lazily.

**Returns**: The constant value.

**Caution**: Re-initializes if the stored value becomes falsy (`null`, `undefined`, `0`, `''`, `false`). Do not use for values that legitimately can be falsy.

```tsx
// Service instantiated only when first accessed
const analyticsService = useTruthyConstant(() => new AnalyticsService(config));
```

---

### useMemorize

Memoizes a value or factory function result, recomputing when dependencies change.

```typescript
// Function overload
function useMemorize<R>(input: () => R, dependencies?: DependencyList): R;
// Value overload
function useMemorize<T>(input: T, dependencies?: DependencyList): T;
```

**Parameters**:
- `input` — A value to memoize or a factory function that returns the value.
- `dependencies` — Dependency array (defaults to `[]`).

**Returns**: The memoized value.

```tsx
// Memoize an inline object (prevents new reference on every render)
const config = useMemorize({ theme, locale }, [theme, locale]);

// Memoize expensive computation
const processed = useMemorize(
  () => rawData.map(item => expensiveTransform(item)),
  [rawData],
);
```

---

### useReference

Creates a ref whose `current` property is always updated to the latest value on every render.

```typescript
function useReference<T>(value: T): RefObject<T>
```

**Parameters**:
- `value` — The value to track. Updated on every render.

**Returns**: A stable `RefObject<T>`. The ref object itself never changes; only `ref.current` is updated.

**Primary use case**: Access current state/props inside async callbacks, timers, or cleanup functions without stale closures.

```tsx
const [count, setCount] = useState(0);
const countRef = useReference(count);

// This interval callback never goes stale
const logCount = useCallback(() => {
  console.log(countRef.current); // always current
}, [countRef]);

useEffect(() => {
  const id = setInterval(logCount, 1000);
  return () => clearInterval(id);
}, [logCount]);
```

---

### useHandle

Creates a stable callback function that always calls the latest version of the provided handler.

```typescript
function useHandle<P extends any[], R>(
  handler?: (...args: P) => R
): (...args: P) => R
```

**Parameters**:
- `handler` — Optional. The function to wrap. If `undefined`, the returned function returns `null`.

**Returns**: A stable function reference that never changes identity.

**Use case**: Pass event handlers to `React.memo` children without causing re-renders.

```tsx
const [data, setData] = useState(initialData);

// handleClick identity never changes — ExpensiveChild never re-renders
const handleClick = useHandle(() => process(data));

return <ExpensiveChild onClick={handleClick} />;
```

---

### useSnapshot

Returns a stable object reference that updates only when the object's contents change (deep comparison).

```typescript
function useSnapshot<T extends object | undefined>(
  input: T,
  omit?: Set<keyof T> | Array<keyof T>
): T
```

**Parameters**:
- `input` — The object to track.
- `omit` — Optional. Properties to exclude from deep comparison.

**Returns**: The same object reference as long as the deep content is unchanged.

```tsx
// Effect only re-runs when config content actually changes
const stableConfig = useSnapshot({ theme: user.theme, locale: user.locale });
useEffect(() => { initWidget(stableConfig); }, [stableConfig]);

// Exclude volatile fields (e.g., timestamps) from comparison
const stableResponse = useSnapshot(apiResponse, ['timestamp', 'requestId']);
```

**vs useRestProperties**: `useSnapshot` does deep comparison; `useRestProperties` does shallow.

---

### useSnapshotReference

Same deep-comparison logic as `useSnapshot`, but returns a ref object.

```typescript
function useSnapshotReference<T extends object | undefined>(
  input: T,
  omit?: Set<keyof T> | Array<keyof T>
): RefObject<T>
```

**Parameters**:
- `input` — The object to track.
- `omit` — Optional. Properties to exclude from deep comparison.

**Returns**: A `RefObject<T>` whose `current` updates only on content change.

```tsx
const dataRef = useSnapshotReference(complexData);

// Stable callback — only recreates when data structure changes
const processData = useCallback(() => {
  const result = expensiveComputation(dataRef.current);
  onProcess(result);
}, [dataRef]);
```

---

### useRestProperties

Maintains referential stability for object props using shallow equality comparison.

```typescript
function useRestProperties<T extends Dictionary>(props: T): T
```

**Parameters**:
- `props` — The properties object to stabilize.

**Returns**: Previous object reference if contents are shallowly equal; new object otherwise.

```tsx
const Button = ({ variant, size, ...restProps }) => {
  const stableRest = useRestProperties(restProps);
  return (
    <MemoizedButton variant={variant} size={size} {...stableRest} />
  );
};
```

---

### useOnMount

Executes a side effect once when the component mounts.

```typescript
function useOnMount(handler: EffectCallback): void
```

**Parameters**:
- `handler` — Effect function. Can return a cleanup function.

```tsx
useOnMount(() => {
  const ws = new WebSocket('wss://api.example.com');
  ws.onmessage = (e) => handleMessage(JSON.parse(e.data));
  return () => ws.close(); // cleanup on unmount
});
```

---

### useOnMountLayout

Synchronous version of `useOnMount`. Runs before browser paint via `useLayoutEffect`.

```typescript
function useOnMountLayout(handler: EffectCallback): void
```

**Parameters**:
- `handler` — Synchronous effect. Can return a cleanup function.

**Use for**: Preventing flash of unstyled content, initial DOM measurements, scroll restoration.

```tsx
useOnMountLayout(() => {
  const saved = localStorage.getItem('theme');
  if (saved === 'dark') document.documentElement.classList.add('dark');
});
```

---

### useOnUnmount

Executes a cleanup function when the component unmounts.

```typescript
function useOnUnmount(handler: Fn): void
```

**Parameters**:
- `handler` — Cleanup function. Captured at mount time (stale closure).

**Important**: Use `useReference` to access current state values in the cleanup function.

```tsx
// Access current state on unmount
const formDataRef = useReference(formData);
const isDirtyRef = useReference(isDirty);

useOnUnmount(() => {
  if (isDirtyRef.current) {
    localStorage.setItem('draft', JSON.stringify(formDataRef.current));
  }
});
```

---

### useOnUnmountLayout

Synchronous cleanup on unmount via `useLayoutEffect`.

```typescript
function useOnUnmountLayout(handler: Fn): void
```

**Use for**: Removing DOM elements before reflow, stopping animations, restoring global styles synchronously.

```tsx
useOnMountLayout(() => {
  document.body.style.overflow = 'hidden';
});
useOnUnmountLayout(() => {
  document.body.style.overflow = ''; // restore before next paint
});
```

---

### useEffectUntil

Runs an effect repeatedly until it returns `true`, then permanently stops.

```typescript
function useEffectUntil<D extends DependencyList>(
  effect: () => boolean,
  dependencies?: D
): void
```

**Parameters**:
- `effect` — Function returning `boolean`. Return `true` to stop permanently.
- `dependencies` — Optional dependency array.

```tsx
// Keep trying to connect until successful
useEffectUntil(() => {
  const socket = connectToWebSocket(url);
  if (socket.readyState === WebSocket.OPEN) {
    setConnection(socket);
    return true; // stop
  }
  return false; // keep retrying
}, [url]);
```

---

### useLayoutEffectUntil

Synchronous version of `useEffectUntil` using `useLayoutEffect`.

```typescript
function useLayoutEffectUntil<D extends DependencyList>(
  effect: () => boolean,
  dependencies?: D
): void
```

```tsx
// Adjust font size until it fits, without visual flicker
useLayoutEffectUntil(() => {
  const el = containerRef.current;
  if (!el) return false;
  if (el.scrollWidth > el.clientWidth) {
    setFontSize(prev => prev - 1);
    return false;
  }
  return true;
}, [fontSize]);
```

---

### useDebounce

Debounces a callback function triggered by dependency changes.

```typescript
function useDebounce(
  callback: Fn,
  dependencyList?: DependencyList,
  ms?: number,
  options?: { immediate?: boolean }
): { isIdle: () => boolean; cancel: () => void }
```

**Parameters**:
- `callback` — Function to debounce.
- `dependencyList` — Dependencies that trigger the debounce.
- `ms` — Delay in milliseconds (default: `0`).
- `options.immediate` — Execute immediately when idle, then debounce (default: `true`).

**Returns**: `{ isIdle, cancel }` — `isIdle()` returns whether no execution is pending; `cancel()` aborts.

```tsx
const [query, setQuery] = useState('');

const { cancel } = useDebounce(
  () => searchAPI(query),
  [query],
  300,
);

// Clean up pending debounce on unmount
useEffect(() => cancel, [cancel]);
```

---

### useTimeout

Provides manual control over a `setTimeout` with React lifecycle integration.

```typescript
function useTimeout(
  callback: Fn,
  timeout?: number
): { isIdle: () => boolean; schedule: () => void; cancel: () => void }
```

**Parameters**:
- `callback` — Function to execute after the timeout.
- `timeout` — Delay in milliseconds (default: `0`).

**Returns**:
- `isIdle()` — Returns `true` if no timeout is pending.
- `schedule()` — Starts or resets the timeout.
- `cancel()` — Aborts any pending timeout.

```tsx
const { schedule, cancel } = useTimeout(() => setVisible(false), 3000);

return (
  <Notification
    onMouseEnter={cancel}   // pause dismiss timer
    onMouseLeave={schedule} // restart dismiss timer
  >
    {message}
  </Notification>
);
```

---

### useVersion

Returns a version counter and an update function. Calling `update()` increments the counter and triggers a re-render.

```typescript
function useVersion(callback?: Fn): [version: number, update: () => void]
```

**Parameters**:
- `callback` — Optional. Called before incrementing the version.

**Returns**: `[version, update]` tuple. `version` starts at `0`.

```tsx
const [version, refresh] = useVersion();

// Use version as key to force child remount
return <ComplexForm key={version} onSubmit={handleSubmit} />;

// Use version as effect dependency to force refetch
useEffect(() => { fetchData(); }, [version]);

return <button onClick={refresh}>Refresh</button>;
```

---

### useWindowSize

Tracks browser window dimensions, updating on resize.

```typescript
function useWindowSize(): { width: number; height: number }
```

**Returns**: `{ width, height }` — current `window.innerWidth` and `window.innerHeight` in pixels. Returns `{ width: 0, height: 0 }` during SSR.

```tsx
const { width, height } = useWindowSize();

const isMobile = width < 768;
const isTablet = width >= 768 && width < 1024;

return (
  <div style={{ minHeight: height }}>
    {isMobile ? <MobileNav /> : <DesktopNav />}
  </div>
);
```

**Performance**: Resize events fire frequently. Combine with `useDebounce` for expensive computations.

---

## Portal System

Renders content at a different DOM location while preserving React component hierarchy (context, event bubbling).

### Setup

Wrap your component with `Portal.with` to provide the portal context:

```tsx
import { Portal } from '@winglet/react-utils/portal';

const App = Portal.with(() => {
  const [showModal, setShowModal] = useState(false);

  return (
    <div>
      <button onClick={() => setShowModal(true)}>Open Modal</button>

      {showModal && (
        <Portal>
          <div className="modal-backdrop">
            <div className="modal">
              <button onClick={() => setShowModal(false)}>Close</button>
            </div>
          </div>
        </Portal>
      )}

      {/* Modal content renders here, outside the parent div's layout */}
      <Portal.Anchor className="modal-root" />
    </div>
  );
});
```

### Components

#### `Portal`

Renders its children at the `Portal.Anchor` location. Renders `null` at its own position.

```tsx
<Portal>
  <div className="overlay">This appears at the anchor</div>
</Portal>
```

| Prop | Type | Description |
|------|------|-------------|
| `children` | `ReactNode` | Content to render at the anchor location |

#### `Portal.Anchor`

Defines the DOM location where portal content will appear. Accepts all standard HTML `<div>` attributes.

```tsx
<Portal.Anchor
  className="overlay-container"
  style={{ position: 'fixed', inset: 0, zIndex: 9999 }}
/>
```

#### `Portal.with(Component)`

HOC that wraps a component with `PortalContextProvider`. Creates an isolated portal scope.

```tsx
const Page = Portal.with(MyPageComponent);
// or inline:
const App = Portal.with(() => <div>...</div>);
```

### Multiple Portals

All `<Portal>` instances under the same provider render at the single `<Portal.Anchor>`:

```tsx
const Page = Portal.with(() => (
  <div>
    <Portal><ModalA /></Portal>
    <Portal><TooltipB /></Portal>
    <main>Content</main>
    <Portal.Anchor /> {/* Both ModalA and TooltipB render here */}
  </div>
));
```

### Nested Portal Contexts

Each `Portal.with` creates an independent scope:

```tsx
const Outer = Portal.with(() => (
  <div>
    <Portal><div>Outer content</div></Portal>
    <Inner />
    <Portal.Anchor id="outer" />
  </div>
));

const Inner = Portal.with(() => (
  <div>
    <Portal><div>Inner content</div></Portal>
    <Portal.Anchor id="inner" /> {/* Inner content only appears here */}
  </div>
));
```

---

## Higher-Order Components

### withErrorBoundary

Wraps a component with an error boundary to prevent application crashes.

```typescript
function withErrorBoundary<Props extends Dictionary>(
  Component: ComponentType<Props>,
  fallback?: ReactNode,
): ComponentType<Props>
```

**Parameters**:
- `Component` — The component to protect.
- `fallback` — Optional custom UI to show on error. Default: a `FallbackMessage` component.

```tsx
import { withErrorBoundary } from '@winglet/react-utils/hoc';

const SafeChart = withErrorBoundary(
  ChartComponent,
  <div className="error">Chart unavailable. Please refresh.</div>,
);

// Usage
<SafeChart data={chartData} width={800} height={400} />
```

---

### withErrorBoundaryForwardRef

Same as `withErrorBoundary` but for components created with `React.forwardRef`. Preserves ref forwarding.

```typescript
function withErrorBoundaryForwardRef<Props extends Dictionary, Ref>(
  Component: ForwardRefExoticComponent<Props & RefAttributes<Ref>>,
  fallback?: ReactNode,
): ForwardRefExoticComponent<PropsWithoutRef<Props> & RefAttributes<Ref>>
```

```tsx
import { withErrorBoundaryForwardRef } from '@winglet/react-utils/hoc';

const CustomInput = forwardRef<HTMLInputElement, InputProps>((props, ref) => (
  <input {...props} ref={ref} />
));

const SafeInput = withErrorBoundaryForwardRef(CustomInput);

// Ref still works after wrapping
const inputRef = useRef<HTMLInputElement>(null);
<SafeInput ref={inputRef} placeholder="Enter value" />
```

---

### withUploader

Transforms any clickable component into a file upload trigger.

```typescript
function withUploader<Props extends { onClick?: Fn<[e?: MouseEvent]> }>(
  Component: ComponentType<Props>,
): MemoExoticComponent<...>
```

**Added props** (on the returned component):

| Prop | Type | Description |
|------|------|-------------|
| `onChange` | `(file: File) => void` | Called with the selected `File` |
| `acceptFormat` | `string[]` | File extensions to allow (e.g. `['.jpg', '.png']`) |

All original component props are preserved and forwarded.

```tsx
import { withUploader } from '@winglet/react-utils/hoc';

const UploadButton = withUploader(Button);

<UploadButton
  acceptFormat={['.jpg', '.jpeg', '.png', '.webp']}
  onChange={(file: File) => {
    console.log('Selected:', file.name);
    uploadToServer(file);
  }}
>
  Upload Photo
</UploadButton>
```

**Behavior**:
- Opens native file dialog on click
- Calls original `onClick` handler before opening dialog
- Clears input after selection (allows re-selecting the same file)
- Single file only (uses `files[0]`)

---

## Utility Functions

### Filter

#### `isReactComponent(value)`

```typescript
function isReactComponent<Props = any>(value: unknown): value is ComponentType<Props>
```

Returns `true` for function components, class components, and `React.memo` wrapped components.

**Does not detect**: `React.forwardRef` components.

```tsx
isReactComponent(() => <div />);              // true
isReactComponent(React.memo(() => <div />));  // true
isReactComponent(class extends React.Component { render() { return <div />; } }); // true
isReactComponent(React.forwardRef((_, ref) => <div ref={ref} />)); // false
isReactComponent(<div />);    // false (element, not component)
isReactComponent('string');   // false
```

#### `isReactElement(value)`

```typescript
function isReactElement(value: unknown): value is React.ReactElement
```

Returns `true` for rendered JSX or `React.createElement` results.

```tsx
isReactElement(<div>Hello</div>);         // true
isReactElement(React.createElement('p')); // true
isReactElement(() => <div />);            // false (component, not element)
```

#### `isFunctionComponent(value)`

Returns `true` for plain function components (not class, not memo).

#### `isClassComponent(value)`

Returns `true` for class components extending `React.Component` or `React.PureComponent`.

#### `isMemoComponent(value)`

Returns `true` for components wrapped with `React.memo()`.

---

### Object

#### `remainOnlyReactComponent(dictionary)`

```typescript
function remainOnlyReactComponent<
  Input extends Record<string, unknown>,
  Output extends Record<string, ComponentType>
>(dictionary: Input): Output
```

Filters an object to retain only values that pass `isReactComponent`.

```tsx
const components = remainOnlyReactComponent({
  Button: ButtonComponent,   // kept
  Icon: IconComponent,       // kept
  config: { size: 'lg' },    // removed (not a component)
  label: 'Submit',           // removed (string)
});
// Result: { Button: ButtonComponent, Icon: IconComponent }
```

---

### Render

#### `renderComponent(Component, props?)`

```typescript
function renderComponent<P extends object>(
  Component: ReactNode | ComponentType<P>,
  props?: P,
): ReactNode
```

Renders a value that may be a component type, a pre-rendered element, or `null`/`undefined`.

| Input | Result |
|-------|--------|
| `null`, `undefined`, falsy | `null` |
| React element | Returns element as-is |
| React component | `React.createElement(Component, props)` |
| Other | `null` |

```tsx
import { renderComponent } from '@winglet/react-utils/render';

// Accept flexible icon prop
interface CardProps {
  icon?: ComponentType | ReactNode;
  title: string;
}

const Card = ({ icon, title }: CardProps) => (
  <div className="card">
    {renderComponent(icon)}  {/* handles component, element, or absent */}
    <h2>{title}</h2>
  </div>
);

<Card title="Settings" icon={GearIcon} />           // renders <GearIcon />
<Card title="Settings" icon={<img src={gear} />} /> // renders <img>
<Card title="Settings" />                           // renders null
```

---

## Type Definitions

Key types used across the library:

```typescript
// From @aileron/declare
type Fn<P extends any[] = any[], R = any> = (...args: P) => R;
type Dictionary<V = any> = Record<string, V>;

// DependencyList
type DependencyList = ReadonlyArray<unknown>; // from React

// EffectCallback
type EffectCallback = () => void | (() => void); // from React

// Portal type
type Portal = {
  (props: PropsWithChildren): null;
  with: typeof withPortal;
  Anchor: typeof Anchor;
};

// UseTimeout return
type UseTimeoutReturn = {
  isIdle: () => boolean;
  schedule: () => void;
  cancel: () => void;
};
```

---

## Compatibility

| Environment | Requirement |
|-------------|-------------|
| React | 16, 17, 18, 19 |
| React DOM | 16, 17, 18, 19 |
| Node.js | 14.0.0 or higher |
| Browsers | Modern browsers with ES2020 support |
| Module formats | ESM (`.mjs`) and CJS (`.cjs`) |
| TypeScript | Full declaration files included |

For legacy browser support, transpile with Babel targeting your required environments.

---

## Development

```bash
# Clone and install
git clone https://github.com/vincent-kk/albatrion.git
cd albatrion
nvm use && yarn install && yarn run:all build

# Build this package
yarn reactUtils build

# Run tests
yarn reactUtils test
yarn reactUtils test --coverage
```
