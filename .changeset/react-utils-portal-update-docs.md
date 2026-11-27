---
"@winglet/react-utils": patch
---

Correct the Portal documentation: updating children preserves subtree state when their component type and key remain stable. Attaching or replacing `Portal.Anchor` triggers a render at the new destination.
