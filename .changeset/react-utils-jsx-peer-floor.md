---
"@winglet/react-utils": major
---

Breaking change: the `react` and `react-dom` peer dependency ranges now start at 16.14 instead of 16, the first release that provides the `react/jsx-runtime` module this package imports.

A project on React 16.0 to 16.13 now gets an unmet peer dependency warning or, with npm 7 and later, an installation conflict. Upgrade `react` and `react-dom` to 16.14 or later before upgrading this package.

Before:

```json
{ "dependencies": { "react": "16.13.1", "react-dom": "16.13.1" } }
```

After:

```json
{ "dependencies": { "react": "^16.14.0", "react-dom": "^16.14.0" } }
```
