---
"@canard/schema-form": patch
---

The Korean README and the packaged agent knowledge files now describe current behavior: context compares URL and other class instances by reference, the `errors` prop is reapplied when its content changes, `find('@')` returns null, array methods inside `batch` settle immediately, and a custom validator's guard pointer is an RFC 6901 pointer without a `#` prefix. The Korean README gains the TypeScript module resolution section.

The `batch` declaration comment no longer says the batch settles as one whole write with item keys carried over by position: it now states that `batch` merges event deliveries and `onChange`, while each array method still settles its arrangement at the call and keeps surviving item nodes, so a batch merges notifications but does not make many array calls cheaper, and one `setValue` of the final array is the cheaper path.

The expressions knowledge file no longer says `(@).a?.b` is required for optional chaining after `@`: `@.a?.b` is the same expression, and a plain `.` through a missing context object throws, which is reported as `EXPRESSION_THREW` to `onError` and leaves the form mounted but degraded until a form-level reset or load after the expression is corrected.
