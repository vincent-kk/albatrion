---
"@canard/schema-form-antd6-plugin": major
---

Breaking change: restrict UI peer dependencies to the major versions bundled by this plugin so an unsupported host UI version is reported instead of silently using an isolated UI copy that misses the host theme or ConfigProvider.

Before:

```json
{ "peerDependencies": {"antd": ">=6.0.0", "dayjs": ">=1"} }
```

After:

```json
{ "peerDependencies": {"antd": "^6.0.0", "dayjs": "^1.0.0"} }
```

Applications on an excluded Ant Design major must use Ant Design 6 or select a plugin that explicitly supports their UI version. Use dayjs 1.
