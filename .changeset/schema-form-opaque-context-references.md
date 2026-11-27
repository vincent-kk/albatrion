---
"@canard/schema-form": major
---

Breaking change: Form and FormProvider `context` now compare `URL`, `URLSearchParams` and other class instances by reference. In 0.16.1 such instances were compared by their enumerable properties, so a new `URL` or `URLSearchParams` with different content compared equal and left dependent controls and validation stale, and a new class instance with equal-looking properties was ignored. Now a new instance recomputes dependent controls and validation state, so a context that creates such an instance on every render recomputes on every render; create it only when its content changes. Plain objects, arrays and supported built-ins retain content comparison. An object whose prototype is not `Object.prototype` and that claims a built-in `Symbol.toStringTag`, such as `Map` or `Date`, without that built-in's internal state is compared by reference, so it no longer throws during render or matches a different instance; on runtimes that provide `Error.isError`, this includes objects tagged `Error`. Object literals keep content comparison of their enumerable string keys whatever tag they claim.

Before, a new query object with different content could leave controls stale, and a new instance on every render was ignored:

```tsx
<Form
  context={{ query: new URLSearchParams(search) }}
  jsonSchema={schema}
/>
```

After, create the instance when its content changes. Reusing and mutating the same instance is not detected:

```tsx
const query = useMemo(() => new URLSearchParams(search), [search]);
<Form context={{ query }} jsonSchema={schema} />;
```
