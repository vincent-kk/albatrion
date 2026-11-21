---
"@canard/schema-form-mui-plugin": patch
---

The enum select, slider, switches, and text input use the field renderer’s visible custom caption in their accessible names. Sliders switched to read-only show the same value as sliders mounted read-only. Empty React labels in the default renderer fall back to the field title. When the default field renderer hides the title, it prefers the accessible name authored in schema options. External and input captions combine while the same control element stays mounted, and the name follows caption changes.
