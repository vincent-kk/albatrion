---
"@slats/agents-assets-sync": patch
---

Make agents-build-hashes do nothing and succeed when agents.assetPath is not declared. A declared path that does not exist remains an error.
