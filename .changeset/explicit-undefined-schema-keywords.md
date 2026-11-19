---
"@winglet/json-schema": patch
---

Accept explicitly undefined optional schema keywords under exactOptionalPropertyTypes. UnknownSchema now accepts RefSchema and optional keyword declarations behave consistently with and without that compiler option; required type discriminators remain unchanged.
