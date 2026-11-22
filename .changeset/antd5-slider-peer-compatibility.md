---
"@canard/schema-form-antd5-plugin": patch
---

With the default `lazy` setting, Ant Design 5.10.x and 5.11.x commit on key press through `onAfterChange`. Ant Design 5.12 and later in the 5.x line commit on key release through `onChangeComplete`. Both commit pointer choices on release. Set `lazy: false` for updates during movement. The peer range starts at `^5.10.0`.
