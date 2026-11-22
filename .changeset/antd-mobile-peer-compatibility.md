---
"@canard/schema-form-antd-mobile-plugin": major
---

Breaking change: restrict UI peer dependencies to the major versions bundled by this plugin so an unsupported host UI version is reported instead of silently using an isolated UI copy that misses the host theme or ConfigProvider.

Before:

```json
{ "peerDependencies": {"dayjs": ">=1"} }
```

After:

```json
{ "peerDependencies": {"antd-mobile": "^5.0.0", "dayjs": "^1.0.0"} }
```

Applications must provide Ant Design Mobile 5 and dayjs 1. Hosts using an excluded major must select a plugin that explicitly supports their UI version or use these supported majors.
