---
"@lerx/promise-modal": major
---

Breaking change: compatible copies of the package loaded in one JavaScript realm, such as the ESM and CommonJS builds or two bundles, share one modal system. A second `ModalProvider` mounted from another copy waits for the active one instead of creating an independent stack. Mount one provider at the application shell and call the modal functions from any bundle.

```tsx
// Before: each bundle mounted its own provider and had its own stack.
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

- Both module formats begin with `'use client'`. Importing without a DOM and server rendering stay supported.
- The default pathname fallback no longer schedules animation frames while no modal is alive. A custom `usePathname` hook keeps its contract.
- Server rendering `ModalProvider` on React 18 no longer logs layout-effect warnings.
- Queued requests use the receiving `ModalProvider`'s route and options when portal ownership transfers, preventing requests from opening hidden under the previous provider's route.
- Keyboard focus reaches explicitly visible controls inside a `visibility: hidden` container, matching the browser's Tab order.
- Requests aborted before mounting stay unmounted, including cancellation triggered while another modal opens.
