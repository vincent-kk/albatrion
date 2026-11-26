---
"@canard/schema-form": major
---

Breaking change: Form and FormProvider context now compare URL, URLSearchParams and opaque class instances by reference. A new instance recomputes dependent controls and validation state even when its enumerable properties look equal; equal-content class replacements may therefore update more often. Plain objects, arrays and supported built-ins retain content comparison. An object whose prototype is not `Object.prototype` and that claims a built-in `Symbol.toStringTag`, such as `Map` or `Date`, without that built-in's internal state is compared by reference, so it no longer throws during render or matches a different instance; on runtimes that provide `Error.isError`, this includes objects tagged `Error`. Object literals keep content comparison of their enumerable string keys whatever tag they claim.

Before, a replacement query object could leave controls stale:

```tsx
<Form
  context={{ query: new URLSearchParams("mode=advanced") }}
  jsonSchema={schema}
/>
```

After, replace the instance whenever its content changes. Reusing and mutating the same instance is not detected:

```tsx
const query = new URLSearchParams(nextSearch);
<Form context={{ query }} jsonSchema={schema} />;
```
