---
"@canard/schema-form-antd6-plugin": patch
---

Read-only sliders show the same value when switched in place as when mounted read-only. Slider tooltips use schema values for exponent steps. Field titles and custom labels supply control names. Empty React labels fall back to the field title. A key release from an interrupted slider interaction preserves the externally supplied value.

Fields retain an accessible name when a visible label has not mounted or is removed. The current visible label takes precedence over the schema’s spoken fallback.
