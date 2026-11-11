---
"@canard/schema-form": minor
---

Breaking change: keys without a leading `^` no longer have a regular-expression fallback. Except for the existing one-segment `*` wildcard, they compare as text. There is no development warning, including for a plain key that relied on capturing descendants; that dependency cannot be detected automatically.

| Intent or 0.16 key | Write now | Matches | Does not match |
| --- | --- | --- | --- |
| `'/contact'` meant one node | `'/contact'` | `/contact` | `/contact/first`, `/contacts`, `/a/contact/b` |
| Direct children only | `'/contact/*'` | `/contact/first` | `/contact`, `/contact/a/b` |
| Every descendant, excluding the node | `'^/contact/'` | `/contact/first`, `/contact/a/b` | `/contact`, `/contacts` |
| The node and every descendant | Two keys with the same input: `'/contact'`, `'^/contact/'` | `/contact`, `/contact/a/b` | `/contacts` |
| Bounded pattern alternative | `'^/contact(?:/\|$)'` | `/contact`, `/contact/first` | `/contacts` |
| Mistake: `'^/contact'` as a subtree boundary | Use the bounded forms above | `^/contact` also matches `/contacts` | It does not match `/a/contact` |
| `'/user/(name\|email)'` as a pattern | `'^/user/(name\|email)$'` deliberately narrows the old substring match | `/user/name`, `/user/email` | `/a/user/name`, `/user/email/child` |
| `'#/users/\\d+/profile'` as a pattern | `'^/users/\\d+/profile$'` (drop `#`) | `/users/12/profile` | `/users/a/profile`, `/users/12/profile/more` |
| `'/name'` matched in the middle | `'/*/name'` for one depth, or `'^.*/name$'` for any depth | `/user/name` | `/user/name/child` |
| `'contact.email'`, `'items.0.name'` relied on `.` matching `/` | `'/contact/email'`, `'/items/*/name'` | `/contact/email`, `/items/0/name` | `/contact/email/child`, `/items/0/deep/name` |
| `'email'` relied on substring matching | `'^.*/email$'`, or a definition with a `test` function | `/email`, `/contact/email` | `/emailBackup`, `/email/child` |
| `'/name$'` relied on a suffix pattern | `'^.*/name$'` | `/name`, `/user/name` | `/username`, `/name/child` |
| `'/items/**/name'`, `'/price['` produced compile errors | Keep them only for those literal names; they no longer throw | `/items/**/name`, `/price[` | `/items/0/name`, `/price` |
| `{ '/contact': A, '/contact/first': B }` gave A to both | Keep the map to give B to the child | A at `/contact`, B at `/contact/first` | A no longer captures `/contact/first` |
| Existing `^` patterns and recognized `*` wildcards | Keep them | `'^/contact$'` → `/contact`; `'/items/*/name'` → `/items/0/name` | Those keys exclude `/contact/child` and `/items/0/deep/name` respectively |

For example, migrate `'/user/(name|email)': Input` to `'^/user/(name|email)$': Input` when only those two paths are intended. Adding `^` alone preserves an open end but removes middle-of-path matches. Preserving the entire old substring behavior would require a prefix such as `^[\s\S]*` (double the backslashes in a JavaScript string); prefer the bounded recipes above instead. Patterns match escaped data paths, not fragment-prefixed paths. See the schema-form path-matching documentation for order, branch inputs and silent nonmatches.
