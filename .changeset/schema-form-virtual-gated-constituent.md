---
"@canard/schema-form": patch
---

A condition that narrows a field belonging to an `options.virtual` group now applies to that field. Previously, a `controls.active` fragment or an `if`/`then` that narrowed a grouped field (for example, adding `minLength` or turning `type: 'number'` into `'integer'`) was ignored once the condition turned true after the form opened, so the field kept its broader schema and values written to it, through the group or directly, were read under that broader schema. A form opened with the condition already true rendered the field with its broader schema and threw an uncaught `SCHEMA_FORM_ERROR.BUDGET_EXCEEDED` error. The field now has the same schema and reads values the same way as it would without the group.
