---
"@winglet/react-utils": patch
---

useHandle, useOnUnmount, useOnUnmountLayout, useTimeout and useVersion read the latest committed handler. Suspended, throwing and abandoned renders no longer replace an active callback or cleanup. React 18 and 19 publish before layout effects; React 16.14 and 17 publish in the parent layout effect, so a child layout effect can still read the prior commit. The public useReference render-time contract stays unchanged.
