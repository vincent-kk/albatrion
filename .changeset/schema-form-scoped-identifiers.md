---
"@canard/schema-form": major
---

Breaking change: input ids and label associations now include a stable per-Form scope, so sibling Forms and repeated radio fields no longer share DOM identifiers. Custom inputs must use the new `id` prop for their element id instead of `path`; `path` keeps its JSON Pointer meaning.

Before:
```tsx
const Input = ({ path, defaultValue }: FieldInputProps) => <input id={path} defaultValue={defaultValue} />;
```
After:
```tsx
const Input = ({ id, defaultValue }: FieldInputProps) => <input id={id} defaultValue={defaultValue} />;
```

`Label` and `Form.Label` use the scoped id for `htmlFor`; title ids and radio/checkbox group `aria-labelledby` use `label:` followed by that id. A FieldRenderer receives `labelId` for its title or legend. For `presentation.inputType: 'radio'` and `'radiogroup'`, `name` also changes from the leaf name (for example `method`) to the scoped full path. Native submission and `FormData` therefore use distinct scoped keys for billing and shipping radios; `FormHandle.getValue()` retains the schema-shaped value. Other input names remain unchanged. Custom radio inputs use `id` for their native group name.

React 18 and 19 server rendering and hydration preserve the same scope. Applications with independent server-rendered React roots supply distinct, matching `identifierPrefix` values on the server and client.
