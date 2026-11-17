---
"@canard/schema-form": patch
---

Text inside a string literal in a `controls` expression is no longer read as a field path. `'../unit === "km /h"'` now compiles instead of throwing `CREATE_DYNAMIC_FUNCTION`, and `'../tag === "a @ b"'` compares with the text `a @ b` instead of the context. Inside a template literal, paths in `${…}` placeholders are still references. Comments (`// …`, `/* … */`) and regular expression literals are skipped the same way, so `/km\/h/.test(../speed)` reads only `../speed`, and a quote inside a comment or a regular expression no longer hides a later path. A slash after a value is still division, and a regular expression literal that also reads as a whole absolute path, such as `/a/g`, is still read as that path; write `new RegExp('a', 'g')` for the regular expression.
