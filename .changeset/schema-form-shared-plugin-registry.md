---
"@canard/schema-form": patch
---

Share `registerPlugin` configuration between compatible ESM and CommonJS copies loaded in the same JavaScript realm. Registration, deduplication and reset now affect both entry points; incompatible registry versions and separate realms remain isolated.
