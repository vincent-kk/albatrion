---
"@winglet/react-utils": major
---

Breaking: raise the `react` and `react-dom` peer dependency floor to 16.14, the earliest release providing the JSX runtime imported by the package.

Before:

```json
{ "react": ">=16 <20", "react-dom": ">=16 <20" }
```

After:

```json
{ "react": ">=16.14 <20", "react-dom": ">=16.14 <20" }
```
