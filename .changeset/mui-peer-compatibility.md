---
"@canard/schema-form-mui-plugin": major
---

Breaking change: restrict UI peer dependencies to the major versions bundled by this plugin so an unsupported host UI version is reported instead of silently using an isolated UI copy that misses the host theme or ConfigProvider.

Before:

```json
{ "peerDependencies": {"@emotion/react": ">=11.0.0", "@emotion/styled": ">=11.0.0", "@mui/icons-material": ">=7.0.0", "@mui/material": ">=7.0.0", "@mui/x-date-pickers": ">=8.0.0", "dayjs": ">=1"} }
```

After:

```json
{ "peerDependencies": {"@emotion/react": "^11.0.0", "@emotion/styled": "^11.0.0", "@mui/icons-material": "^7.0.0", "@mui/material": "^7.0.0", "@mui/x-date-pickers": "^8.0.0", "dayjs": "^1.0.0"} }
```

Applications on an excluded major must use Emotion 11, MUI Material and Icons 7, MUI X Date Pickers 8 and dayjs 1, or select a plugin that explicitly supports their UI versions.
