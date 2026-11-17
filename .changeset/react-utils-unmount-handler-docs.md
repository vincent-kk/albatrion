---
"@winglet/react-utils": patch
---

The shipped specification and agent skill now state that `useOnUnmount` and `useOnUnmountLayout` run the handler from the most recent render, which is what they have always done. The documents previously said the handler was captured at mount and told readers to wrap state in `useReference`; that wrapping is unnecessary, and existing code that uses it keeps working.
