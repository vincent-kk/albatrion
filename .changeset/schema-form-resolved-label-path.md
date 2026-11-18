---
"@canard/schema-form": patch
---

Associate `Form.Label` with the actual input when its path query resolves to a single field, including wildcard and parent segments. Ambiguous queries retain their supplied attributes and missing queries continue to render nothing.
