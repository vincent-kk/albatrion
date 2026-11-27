---
"@canard/schema-form-antd-mobile-plugin": major
---

Breaking change: declare `antd-mobile` `^5.2.0` as a peer dependency and narrow the `dayjs` peer to `^1.0.0`, so an unsupported host UI version is reported instead of silently using an isolated UI copy that misses the host theme or ConfigProvider. In 0.x the plugin installed its own `antd-mobile` `^5.0.0` and declared no `antd-mobile` peer.

Before:

```json
{ "peerDependencies": {"dayjs": ">=1"} }
```

After:

```json
{ "peerDependencies": {"antd-mobile": "^5.2.0", "dayjs": "^1.0.0"} }
```

Applications must provide Ant Design Mobile 5.2 or later in the 5.x line and dayjs 1. Upgrade an application on Ant Design Mobile 5.0 or 5.1 before updating this plugin, because the number input relies on the 5.2 `Stepper` accepting an empty value. Hosts using another major must select a plugin that explicitly supports their UI version.
