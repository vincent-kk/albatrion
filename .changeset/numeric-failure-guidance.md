---
"@winglet/common-utils": patch
---

Correct the agent guidance on invalid inputs: numeric helpers and other validating APIs can throw, while only the listed sentinel-returning calls return degenerate values. Consumers should follow each API's input and failure contract.
