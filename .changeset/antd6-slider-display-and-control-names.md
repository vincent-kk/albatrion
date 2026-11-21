---
"@canard/schema-form-antd6-plugin": patch
---

Read-only sliders show the same value when switched in place as when mounted read-only. Slider tooltips use schema values for exponent steps. Field titles and custom labels supply control names. Empty React labels fall back to the field title. A key release from an interrupted slider interaction preserves the externally supplied value.

Fields retain an accessible name when a meaningful label has not mounted or is removed. Decorative-only labels and labels hidden with HTML or ARIA attributes use the schema’s spoken fallback. Labels hidden only with CSS retain their text as the name. Consumer-owned ARIA values are preserved.
