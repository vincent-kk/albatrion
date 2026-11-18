---
"@canard/schema-form-antd5-plugin": major
---

Breaking change: restrict UI peer dependencies to the major versions bundled by this plugin so an unsupported host UI version is reported instead of silently using an isolated UI copy that misses the host theme or ConfigProvider.

Before:

```json
{ "peerDependencies": {"antd": ">=5.10.0", "dayjs": ">=1"} }
```

After:

```json
{ "peerDependencies": {"antd": "^5.10.0", "dayjs": "^1.0.0"} }
```

Applications using Ant Design 6 must use `@canard/schema-form-antd6-plugin`; other excluded majors must select a plugin that supports their UI version or use Ant Design 5. Use dayjs 1.
