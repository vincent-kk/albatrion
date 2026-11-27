---
"@canard/schema-form-mui-plugin": patch
---

Editing a URI whose scheme is not in `presentation.FieldInputProps.protocols` (for example `wss://`) now keeps that scheme. Before, the first keystroke replaced it with the first listed protocol, so `wss://example.com/socket` became `http://example.com/socket2`. The kept scheme appears as an extra option in the protocol dropdown.
