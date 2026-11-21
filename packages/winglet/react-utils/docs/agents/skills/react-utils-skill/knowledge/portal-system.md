# Portal system

A context-based alternative to bare `ReactDOM.createPortal`: content moves to another DOM location while staying in the React tree, so context and event bubbling follow the JSX nesting rather than the DOM nesting.

## Source ownership

Portal renders a native React portal from its source position into `Portal.Anchor`. Context reads and click bubbling follow the source React ancestors, through `Portal.with` and beyond. A provider wrapping only the source is visible inside its content. To isolate clicks, stop propagation in the portal content; to share provider values throughout the scope, place the provider above `Portal.with`. Activity hide/show preserves subtree state. Before an anchor attaches, including server rendering and the first hydration render, content is absent; attaching or replacing the anchor updates the destination.

The provider owns only the current anchor state. Each Portal returns `createPortal(children, anchor)` from its own React position. Unmounting the source removes its content without registration effects.

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

**One anchor per provider scope, and the last one to mount wins.** Every `Portal.Anchor` reports its node through the same stable callback ref, so each mount overwrites whatever the previous anchor stored — the winner is the last to attach, not the first. Worse, React reports null through that shared callback when _any_ anchor unmounts, and nothing reattaches the survivor: portal content silently disappears while an anchor is still on screen. Mount exactly one anchor per scope.

**A `style` prop replaces `display: contents` outright.** The anchor renders as `<div role="none" style={{ display: 'contents' }} {...props} ref={ref} />` — the spread comes after `style`, so a caller-supplied `style` overwrites the whole declaration rather than merging into it. The div then becomes a real layout box where the default was layout-transparent, shifting everything around it:

```tsx
<Portal.Anchor style={{ position: 'fixed', inset: 0 }} />       // display: contents is gone
<Portal.Anchor style={{ display: 'contents', position: 'fixed', inset: 0 }} /> // restore it explicitly
<Portal.Anchor className="overlay-root" />                       // or style via class and leave `style` alone
```

**Scopes nest without interfering.** Each `Portal.with` installs its own provider and anchor state; an inner scope's `<Portal>` reaches the inner anchor and never the outer one.

**Content updates preserve state.** A fresh children element uses normal React reconciliation, so unrelated parent updates do not remount the subtree. Changing its component type or key still follows normal React reconciliation.

Server rendering produces an empty anchor. Hydration starts with the same output, then callback-ref attachment renders the portal content.

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

Multiple `<Portal>` instances in one scope all render at that single anchor, in their mount order. Reordering already mounted source components does not reorder independent portal DOM nodes.
