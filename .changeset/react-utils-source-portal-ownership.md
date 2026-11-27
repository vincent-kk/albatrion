---
"@winglet/react-utils": major
---

Breaking change: content rendered through `Portal` now reads context from, and bubbles React events through, the React ancestors of the `Portal` element itself, as a native React portal does, instead of only the ancestors above `Portal.with`. Its subtree state is also preserved across Activity hide and show.

`Portal` now declares its call result as `ReactPortal | null`, rather than `null` alone, matching content rendered after the anchor attaches. Code assigning the result to a `null`-typed value must accept the portal result as well.

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

To keep a click from reaching those ancestors, stop it in the portal content:

```tsx
<Portal>
  <button
    onClick={(event) => {
      event.stopPropagation();
      runAction();
    }}
  >
    Action
  </button>
</Portal>
```

To give portal content a value from outside its source, place the provider above `Portal.with`. `Portal.Anchor` continues to choose only the DOM destination.
