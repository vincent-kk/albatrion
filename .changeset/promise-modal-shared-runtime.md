---
"@lerx/promise-modal": major
---

Breaking change: compatible copies of the package loaded in one JavaScript realm, such as the ESM and CommonJS builds or two bundles, share one modal system. A second `ModalProvider` mounted from another copy waits for the active one instead of creating an independent stack, and takes over when the active one unmounts. Mount one provider at the application shell and call the modal functions from any bundle.

```tsx
// Before: a provider mounted from each bundle had its own stack.
<>
  <ModalProvider><App /></ModalProvider>
  <ModalProvider><Feature /></ModalProvider>
</>
// After: one provider serves requests from every compatible copy.
<ModalProvider>
  <App />
  <Feature />
</ModalProvider>
```

Separate windows and realms stay independent.

This release also changes the following:

- Both module formats begin with `'use client'`.
- The default pathname fallback no longer schedules animation frames while no modal is alive. A custom `usePathname` hook keeps its contract.
