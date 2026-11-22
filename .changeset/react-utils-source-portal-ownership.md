---
"@winglet/react-utils": major
---

Breaking: `Portal` now follows its source React ancestors for context and event bubbling, matching native React portals and preserving subtree state across Activity hide/show.

`Portal` now declares its call result as `ReactPortal | null`, rather than `null` alone, matching content rendered after the anchor attaches. Consumers assigning the result to `null` must accept the portal result as well.

Before, a provider wrapping only the Portal source was ignored inside its content:

```tsx
const Page = Portal.with(() => (
  <Theme.Provider value="local">
    <Portal><ReadTheme /></Portal>
    <Portal.Anchor />
  </Theme.Provider>
));
// Before: ReadTheme reads the value above Portal.with.
// After: ReadTheme reads "local".
```

Before, clicks inside Portal content skipped React ancestors between the source and `Portal.with`. After, they bubble through those ancestors, through `Portal.with`, and beyond:

```tsx
const Page = Portal.with(() => (
  <section onClick={handleSourceClick}>
    <Portal><button>Action</button></Portal>
    <Portal.Anchor />
  </section>
));
// Before: handleSourceClick is skipped.
// After: clicking Action calls handleSourceClick.
```

Consumers relying on click isolation can call `event.stopPropagation()` in the portal content. Place a provider above `Portal.with` to share that value with the complete portal scope. `Portal.Anchor` continues to choose only the DOM destination.
