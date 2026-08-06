# HOCs and component utilities

Three HOCs and the runtime type-inspection helpers they share. Signatures live in `dist/hoc/*.d.ts` and `dist/utils/**/*.d.ts`; what follows is the behavior around them.

## Choosing an error-boundary HOC

`forwardRef` decides, not preference. `withErrorBoundary` returns a plain component, so wrapping a `forwardRef` component with it drops the ref contract — `ref.current` stays `null` and imperative handles vanish, without any error. `withErrorBoundaryForwardRef` re-wraps in `forwardRef` and threads the ref through the boundary, preserving `useImperativeHandle` APIs.

Both HOCs return a **new component type on every call**. Call them at module scope; calling one inside a render body produces a fresh type each render, remounting the whole subtree and discarding its state.

```tsx
const SafeChart = withErrorBoundary(Chart, <p>Chart unavailable</p>);
const SafeInput = withErrorBoundaryForwardRef(
  CustomInput,
  <p>Input unavailable</p>,
);
```

### What the boundary does not catch

It is an ordinary React class boundary — `getDerivedStateFromError` plus `componentDidCatch` — so the standard exclusions apply, plus two specific to this implementation:

- **Event handlers and async code.** Errors thrown in `onClick`, `setTimeout`, promise rejections, or anything outside the render/lifecycle path never reach it. Handle those with `try`/`catch` and an error state.
- **The fallback itself.** A throwing fallback is rendered by the already-failed boundary, so it escapes to the _parent_ boundary — or crashes the app when there is none. Keep fallbacks trivial.
- **The error never reaches the fallback.** `fallback` is a `ReactNode`, not a render function; the caught error is held in state but only ever surfaces through `console.error` in `componentDidCatch`. To display error details, catch them yourself.
- **There is no reset.** Once caught, the instance shows the fallback for the rest of its life. Recovery means remounting it — typically by changing its `key`.

## `withUploader`

Turns any clickable component into a file picker: it renders a hidden `<input type="file">` beside the component and hands the component its own `onClick`.

```tsx
const UploadButton = withUploader(Button);

<UploadButton
  acceptFormat={['.jpg', '.png']} // joined into accept=".jpg,.png"
  onChange={(file) => upload(file)} // a single File, never a list
  onClick={() => track('upload_started')}
>
  Change avatar
</UploadButton>;
```

Behavior worth knowing before debugging it:

- **The original `onClick` runs first, then the dialog opens.** Analytics and guards in that handler fire before the user sees the picker — and they cannot prevent it, since the click is not cancellable from there.
- **`input.value` is cleared after every selection**, which is what makes re-selecting the _same_ file fire `onChange` again. Without it the second pick would be a no-op.
- **Single file only** — the handler reads `files[0]` and the input carries no `multiple` attribute. Multi-file upload needs a native input.
- **Falsy selections are dropped**: `onChange` only fires when a file is present, so cancelling the dialog is silent.
- The result is `memo`-wrapped, and `onClick`, `onChange`, and `acceptFormat` are consumed by the HOC. Everything else, `children` included, forwards to the wrapped component, which must accept an `onClick` prop.

## Type-guard gaps

The `filter` guards are narrow structural checks, and two of them are wrong in ways that matter:

| Guard                 | True for                                              | Blind spot                                                                      |
| --------------------- | ----------------------------------------------------- | ------------------------------------------------------------------------------- |
| `isFunctionComponent` | **any function** without `prototype.isReactComponent` | utilities, event handlers, class factories — all pass                           |
| `isClassComponent`    | classes extending `Component` / `PureComponent`       | —                                                                               |
| `isMemoComponent`     | `$$typeof === Symbol.for('react.memo')`               | —                                                                               |
| `isReactComponent`    | the union of the three above                          | **`forwardRef` components fail** — they are objects with a different `$$typeof` |
| `isReactElement`      | React's own `isValidElement`                          | — (an element, not a component)                                                 |

Detect `forwardRef` yourself when it matters:

```typescript
const isForwardRef = (x: unknown): boolean =>
  typeof x === 'object' &&
  x !== null &&
  (x as any).$$typeof === Symbol.for('react.forward_ref');
```

`memo(forwardRef(...))` does pass `isReactComponent`, because the outer `memo` wrapper is what gets inspected — so the gap only bites on bare `forwardRef`.

**`remainOnlyReactComponent` inherits both defects.** It keeps dictionary entries passing `isReactComponent`, which means a registry loses its `forwardRef` components silently and keeps unrelated helper functions:

```typescript
remainOnlyReactComponent({
  Button, // function component → kept
  Input, // forwardRef        → DROPPED
  formatDate, // plain function    → kept
  config: { a: 1 }, // object            → removed
});
```

Validate the survivors downstream if the registry mixes functions with components.

## `renderComponent`

One call site accepting a component type, a pre-rendered element, or nothing:

| Input                                           | Result                              |
| ----------------------------------------------- | ----------------------------------- |
| falsy — `null`, `undefined`, `0`, `''`, `false` | `null`                              |
| React element                                   | **returned as-is, `props` ignored** |
| function / class / memo component               | `createElement(Component, props)`   |
| string, number, or anything else                | `null`                              |

Two consequences. Passing an element and props is a silent no-op — there is no `cloneElement`, so the props are discarded rather than merged. And strings and numbers render as `null`, not as text: `renderComponent('Submit')` produces nothing. A prop that may be a label _or_ a component needs its own string branch before this call.

```tsx
const Card = ({
  icon,
  title,
}: {
  icon?: ComponentType | ReactNode;
  title: string;
}) => (
  <div>
    {renderComponent(icon)}
    <h2>{title}</h2>
  </div>
);
```
