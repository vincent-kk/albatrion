---
"@canard/schema-form-antd-mobile-plugin": patch
---

Read-only sliders show the same value when switched in place as when mounted read-only. Fields use authored titles and custom labels as control names. Empty React labels fall back to the field title.

Fields retain an accessible name when a visible label has not mounted or is removed. The current visible label takes precedence over the schema’s spoken fallback.
