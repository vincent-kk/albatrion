---
"@canard/schema-form": patch
---

Removing array rows no longer makes the form's child cache keep otherwise unreachable rows alive for the rest of the form's lifetime. Surviving rows retain their component identity and keys, preserving focus and in-progress input. Garbage collection timing remains engine-dependent.
