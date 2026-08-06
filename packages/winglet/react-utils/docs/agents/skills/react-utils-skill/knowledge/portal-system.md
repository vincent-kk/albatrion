# Portal system

A context-based alternative to bare `ReactDOM.createPortal`: content moves to another DOM location while staying in the React tree, so context and event bubbling follow the JSX nesting rather than the DOM nesting.

## Architecture

```
Portal.with(Component)
  └── PortalContextProvider           owns the registry and the anchor ref
        ├── Component                 your tree
        │     ├── <Portal>            renders null; registers children into the registry
        │     └── <Portal.Anchor />   a div whose ref is the provider's anchor ref
        └── createPortal(registry, anchorRef.current)
```

Ownership is inverted relative to `createPortal`: `<Portal>` renders `null` at its own position and registers its children under a generated id; the **provider** is what renders them, into whatever DOM node the shared anchor ref currently points at. Where content lands is a property of the provider scope, never of the `<Portal>` call site. Unmounting a `<Portal>` unregisters its entry, so no manual cleanup exists or is needed.

The provider only renders portal content while `anchorRef.current` is non-null, and a ref assignment does not itself trigger a render. The first registration's state update is what re-renders the provider after the anchor has attached — which is why content appears one commit after mount rather than immediately.

## Only `Portal` is exported

`@winglet/react-utils/portal` exports exactly one value. `PortalContextProvider` is internal, and `withPortal` / `Anchor` are re-exported as **types only** — none of them can be imported as values:

```typescript
import { Portal } from '@winglet/react-utils/portal';

// Portal            — wraps content to be relocated
// Portal.with       — the HOC that installs the provider
// Portal.Anchor     — marks the destination
```

`Portal.with(Component)` is therefore the only supported setup. Any answer that imports `PortalContextProvider` directly does not compile.

## Anchor constraints

**One anchor per provider scope, and the last one to mount wins.** Every `Portal.Anchor` writes to the same ref object taken from context, so each mount overwrites whatever the previous anchor stored — the winner is the last to attach, not the first. Worse, React nulls that shared ref when _any_ anchor unmounts, and nothing reattaches the survivor: portal content silently disappears while an anchor is still on screen. Mount exactly one anchor per scope.

**A `style` prop replaces `display: contents` outright.** The anchor renders as `<div role="none" style={{ display: 'contents' }} {...props} ref={ref} />` — the spread comes after `style`, so a caller-supplied `style` overwrites the whole declaration rather than merging into it. The div then becomes a real layout box where the default was layout-transparent, shifting everything around it:

```tsx
<Portal.Anchor style={{ position: 'fixed', inset: 0 }} />       // display: contents is gone
<Portal.Anchor style={{ display: 'contents', position: 'fixed', inset: 0 }} /> // restore it explicitly
<Portal.Anchor className="overlay-root" />                       // or style via class and leave `style` alone
```

**Scopes nest without interfering.** Each `Portal.with` installs its own provider, registry, and anchor ref; an inner scope's `<Portal>` reaches the inner anchor and never the outer one.

**Content remounts on re-registration.** The registration effect depends on `children`, so a parent re-render producing a fresh element re-registers under a new id — and the new id becomes a new React key, remounting the portalled subtree and discarding its internal state. Memoize the children, or lift state that must survive above the `<Portal>`.

Server-side rendering: `createPortal` is client-only, so guard accordingly.

## Setup pattern

Setup and anchor placement are one unit — neither works alone.

```tsx
import { useState } from 'react';

import { Portal } from '@winglet/react-utils/portal';

const Page = Portal.with(() => {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button onClick={() => setOpen(true)}>Open</button>
      {open && (
        <Portal>
          <Modal onClose={() => setOpen(false)} />
        </Portal>
      )}
      <Portal.Anchor className="modal-root" />
    </div>
  );
});
```

Multiple `<Portal>` instances in one scope all render at that single anchor, in registration order.
