---
"@winglet/react-utils": patch
---

Portal retains its destination and child state while Activity or Suspense temporarily hides the anchor, including a whole Portal.with scope. Actual anchor removal clears the matching destination after the commit without clearing a replacement anchor.
