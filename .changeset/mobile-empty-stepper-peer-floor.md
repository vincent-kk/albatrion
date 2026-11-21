---
"@canard/schema-form-antd-mobile-plugin": major
---

Breaking change: the minimum supported `antd-mobile` version is now 5.2.0, whose `Stepper` accepts the empty numeric value used by the form. Upgrade applications using 5.0 or 5.1 before updating this plugin.

Before:
```json
{ "antd-mobile": "^5.0.0" }
```

After:
```json
{ "antd-mobile": "^5.2.0" }
```
