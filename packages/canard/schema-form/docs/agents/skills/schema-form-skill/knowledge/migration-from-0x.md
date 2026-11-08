# Migrate an application from 0.x

Use this prompt when the task is to migrate an existing application to the installed schema-form release. Work in the application repository. The application supplies its package manifest, schemas, inputs, renderers and tests; never assume that installing a new package migrated those call sites.

## Read and establish the target

1. Read the application's repository instructions and verification commands. Read the installed schema-form declarations and the [migration guide](https://vincent-kk.github.io/albatrion/docs/canard/schema-form/migration-from-0x), including its linked current contracts. Use the guide's name mapping as the conversion list; do not invent aliases.
2. Record the installed core, validator, UI-plugin and React versions. Use a compatible release combination supplied by the application owner. Ask if the intended target version is missing; do not publish packages or infer an unpublished version from a branch name.
3. Find schema factories, wrappers, custom inputs/renderers, FormProvider use, validators, imperative handles, node subscriptions and tests. Run the existing checks before changing them so baseline failures remain distinguishable.

## Make the conversion

- Move schema authoring keys into presentation, controls and options using the guide. Search generated schema sources too. Unknown legacy top-level keys do not provide aliases or engine warnings; a successful render alone does not show that the settings applied.
- Rename consumer imports, plugin members, input props, node guards/state and error-display APIs. Convert the error-display settings using the guide’s error-visibility table. Read `schemaType` for integer-specific matching; `type` is the runtime node kind. Treat multiple non-null kinds as a terminal union and provide a deliberate union input when the fallback draft does not fit the UI.
- Replace incomplete validator functions with the full validator object contract. Disable AJV value-changing options before bind and move those transformations into explicit application code. Preserve validation verdict tests independently of warning assertions.
- Audit every mount workaround. Change immutable Form/FormProvider setting references directly where live settings apply; retain reset for new schema/default inputs, a stable validator reference for unchanged validation, and explicit remounts only where the composition contract requires them. Test loss of uncommitted drafts when a parent input changes.
- Separate native invalid submission from imperative rejection. Use node errors for field feedback and validate/getErrors for the whole verdict. Do not turn expected invalid native submissions into application incident reports.
- Update observation hooks for absent nodes without violating React hook ordering. Rebind after root replacement and clean up subscriptions. Exercise hide/write/show with retained handles if the application hides a mounted form.
- Verify inferred tuples and optional object keys against the application's submitted-value type. Use matching explicit Form and FormHandle value generics when needed; do not hide migration failures behind `any`.
- For virtualized forms, test enabling/disabling, one-way reveal, exact focus, cancellation on user focus movement, and the application's Suspense/SSR/custom layout. Read `arrays-and-scale.md` for the current limits.

## Example: register the public plugin exports

This block is copied from an executable package consumer test. Import `plugin as antd5Plugin`, `plugin as ajvValidatorPlugin`, and the public `registerPlugin` in the application; register before its first Form render.

```tsx
registerPlugin(antd5Plugin); // 1. UI
registerPlugin(ajvValidatorPlugin); // 2. validator
```

For provider-based wiring and other examples, read `plugin-system.md`, `field-input.md`, `validation-ux.md`, and `imperative-and-layout.md` rather than copying a plugin into an unsupported provider prop.

## Completion evidence

Run the application's lint, strict typecheck, unit and UI tests. Add focused cases for each changed behavior: submitted values, conditional fields, empty/null values, external issues, invalid native and imperative submissions, dynamic settings, reset/rebuild, and custom input selection. Test the React version(s) the application supports. Report changed call sites, exact commands and results, unresolved compatibility decisions, and any remaining old spellings with their reason. Completion requires working application behavior, not only a search with no matches.
