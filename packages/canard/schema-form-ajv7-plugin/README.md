# @canard/schema-form-ajv7-plugin

[![Typescript](https://img.shields.io/badge/typescript-✔-blue.svg)]()
[![Javascript](https://img.shields.io/badge/javascript-✔-yellow.svg)]()
[![React](https://img.shields.io/badge/react-✔-61DAFB.svg)]()
[![AJV](https://img.shields.io/badge/AJV-7.x-orange.svg)]()
[![JSON Schema Form Plugin](https://img.shields.io/badge/JSONSchemaForm-validator-green.svg)]()

---

## Overview

`@canard/schema-form-ajv7-plugin` is a validator plugin for `@canard/schema-form` that provides JSON Schema validation using AJV 7.x.

---

## Notice

⚠️ This plugin uses AJV 7.x which is compatible with older JSON Schema specifications (Draft-07 and earlier).

📌 If you need support for newer JSON Schema features (Draft 2019-09, Draft 2020-12), consider using `@canard/schema-form-ajv8-plugin` instead.

💡 This plugin provides a complete JSON Schema validation solution with detailed error reporting and custom validation support.

---

## How to use

```bash
yarn add @canard/schema-form @canard/schema-form-ajv7-plugin
```

```tsx
import { SchemaForm, registerPlugin } from '@canard/schema-form';
import { ajvValidatorPlugin } from '@canard/schema-form-ajv7-plugin';
// Or register with custom AJV instance
import Ajv from 'ajv';

// Register the validator plugin globally
registerPlugin(ajvValidatorPlugin);

// When using a custom AJV instance
const customAjv = new Ajv({
  allErrors: true,
  strict: false,
});
ajvValidatorPlugin.bind(customAjv);
registerPlugin(ajvValidatorPlugin);
```

---

## Features

### **Plugin Interface**

The plugin implements `ValidatorPlugin` with validation, synchronous guards, and root release:

#### **`bind(instance: Ajv.Ajv)`**

- **Purpose**: Allows you to provide a custom AJV instance with your preferred configuration
- **Usage**: Optional - if not called, a default AJV instance will be created automatically
- **Benefits**: Full control over AJV settings, custom keywords, formats, and validation rules
- **Refusal**: An instance with `coerceTypes`, `useDefaults`, or `removeAdditional` enabled is rejected immediately. The previous binding stays active. Callers discriminate the refusal by `group` (`'UNHANDLED_ERROR'`) and `code` (`'UNHANDLED_ERROR.VALIDATOR_BIND_REFUSED'`, the value of `FormErrorCode.ValidatorBindRefused`); core's `isUnhandledError` does not recognize it.

#### **`configure(options: { directGuardCompile?: boolean }): void`**

Self-contained guards compile their original copy subschema directly by default.
Set `directGuardCompile: false` to use the registered root-pointer path for later
compiles; existing predicates are unchanged and omitted options keep their value.
Reference and identifier keys anywhere inside a guard always require the root path;
a root declaring its own `$schema` or a guard containing `$schema` also uses the root pointer.
A compile error that only appears when another part of the root is compiled, such as an
unresolved `$ref`, makes full validation report `VALIDATOR_COMPILE_FAILED`. It also fails
every guard compiled at a root pointer, which is a limitation of that path; a self-contained
guard compiled directly still evaluates, because a guard compile failure belongs to its own
gate only.
Guards compile without AJV's root meta-schema validation (`validateSchema: false`); AJV's root
meta-schema check runs only in the whole-schema compile. Custom keyword meta-schema checks, strict
options and code-generation checks still apply when a guard compiles. A root meta-schema violation
outside the condition, such as `multipleOf: 0` in an unrelated field, fails no guard on either
path; with the default schema validation, full validation reports `VALIDATOR_COMPILE_FAILED`,
while an instance bound with `validateSchema: false` or `'log'` compiles as that option says.
A meta-only violation inside the condition schema itself, such as `minLength: 1.5`, does not fail
the guard; the guard evaluates as the code AJV generates for it.
The guard instance retains the bound dialect, formats and keywords with
`allErrors: false` and `validateSchema: false`. `release(root)` also removes its directly compiled guards.

#### **`compile(jsonSchema)`**

- **Purpose**: Creates a validator function from the provided JSON Schema
- **Returns**: A validator factory function that can validate data against the schema
- **Features**: Automatic error transformation, detailed validation messages, performance optimization

#### **`compileGuard(root, pointer)` and `release(root)`**

- `compileGuard` returns a synchronous boolean guard for a pointer in the engine-owned copy root. It accepts that copy whether or not `compile` has run. A self-contained guard compiles its subschema without registering the root; only guards that need the root location, such as guards with `$ref` into root definitions, register the root on the guard instance. `compile` registers a copy of a root with `$id` on the selected validation instance (a separate sibling when its `$id` conflicts) and compiles a root without `$id` as a transient copy without registering it. Both kinds of guard work before whole-schema compilation.
- `compileGuard` throws a native `GuardPointerNotSchemaError` when the pointer does not locate a schema (an object or boolean): a missing location, or a value such as `/type` or `/required`. Callers discriminate it by `group` (`'UNHANDLED_ERROR'`) and `code` (`'GUARD_POINTER_NOT_SCHEMA'`); `details` carries the root's `$id` (or `''`) and the pointer.
- Pass the same engine-owned copy object to `compile`, every `compileGuard`, and `release`; they share one registration, and whole-schema validation can be compiled later.
- `release` accepts that copy whether or not `compile` has run and removes its registration and compiled functions. Releasing an unregistered root is a no-op. A second live root with the same `$id` remains independent.

**Guard dynamic scope.** A guard that needs its root location prefills AJV's dynamic-anchor table and only then compiles `{ $ref: <root>#<pointer> }` on the guard instance, because AJV decides at compile time whether a dynamic reference reads the table. The chain resources are the root and every ancestor on the pointer path that opens a resource with its own `$id`, outermost first. Each anchor name binds to its declaration in the outermost chain resource that declares it, wherever it sits in that resource: a string `$dynamicAnchor` anywhere, and `$recursiveAnchor: true` only at a resource root (name `''`). The scan descends only through subschema keywords (`properties`, `items`, `allOf`, `$defs` and the like), never into data keywords such as `const`, `enum`, `default` or `examples`, never into a nested resource, and never into the guard's own subtree. Other assertions of the root never affect the guard. The table and the checks below run only on an instance with AJV's dynamic vocabulary (`opts.dynamicRef`, set by Ajv2019 and Ajv2020) and only for a root that has a `$dynamicAnchor`, `$dynamicRef`, `$recursiveAnchor` or `$recursiveRef` key anywhere, decided once when the root is registered; on a draft-07 instance these keywords are unknown and ignored, by whole validation and the guard alike.

Inside the `if`, a `$dynamicRef: '#name'` or `$recursiveRef: '#'` that is used inline, not behind `$ref` or under `$defs`, must be bound either by a chain resource or by a schema object that is an ancestor of the reference inside the `if` (for example the root of the `allOf` element that contains it), because AJV runs an object's dynamic keywords before its subschemas. Otherwise `compileGuard` throws, and so does a selected declaration with `$async: true`; the gate then fails at compile time.

The guard's verdict matches the `if` verdict that AJV's whole validation reaches on the same host value when every dynamic anchor the guard uses directly or indirectly has the same first binding on every relevant entry, the function obtained from the chain reproduces that binding in the same validation context, and the selected function is synchronous. Conditions that use only static `$ref`, `if`/`then`/`else` under `properties`, and `$defs` reuse are unaffected by this condition.

Outside that condition the guard returns the verdict computed from the chain, or fails at compile time. These cases are unsupported:

- VALIDATE-047 case (iv): one schema location reached from several dynamic scopes through `$dynamicRef` or `$recursiveRef`. There is one guard per location; it answers for the lexical entry, or fails at compile time when the scopes are resources outside the chain.
- The first binding comes from outside the chain: whole validation passes through a resource with its own `$id` outside the chain that registers the anchor first, or enters a nested resource by its URI and skips a resource with `$id` on the pointer path.
- An inline reference whose name neither a chain resource nor an ancestor of the reference declares, including a declaration on a sibling or a descendant of the reference or under `$defs` inside the `if`.
- L12: `$recursiveAnchor: true` is honoured only at a resource root (the root schema or an on-path `$id` resource); a `$recursiveRef: '#'` whose only anchor is elsewhere is rejected at compile time with a message naming the fix, although AJV's whole validation would bind the subschema. An ancestor of the reference inside the `if` still binds it under the rule above. L16: on 2019-09, when a non-root `$recursiveAnchor: true` outside the `if` coexists with such an ancestor declaration inside the `if`, whole validation and the guard can differ; this is an observation, not a supported case.
- A `$dynamicRef` or `$recursiveRef` whose fragment is a JSON Pointer (`#/…`): AJV reads the pointer as an anchor name that no declaration can bind, so `compileGuard` rejects it with a message that says so.
- The current resource declares the name with a static `$anchor` while an outer chain resource declares it with `$dynamicAnchor`. The specification treats the reference as static; AJV and the guard use the dynamic table.
- Subschemas of user-defined keywords, and declarations inside the `if` that run only through `$ref` into its `$defs`, are not recognised.

Where AJV's whole validation departs from the specification, the guard follows the specification in these cases:

- An inline anchor inside a nested resource holds a relative reference that resolves differently against the root base URI and against the resource base URI. Whole validation resolves it against the root base URI; the guard resolves it against the resource base URI.
- An anchor registered at run time by a resource outside the chain (entered through `$ref`, `allOf`, or a property checked earlier; L8′) leaks into the `if` in whole validation; the guard does not see it. Declarations of siblings inside a chain resource but outside the guard are collected.
- A declaration elsewhere in a chain resource that whole validation has not run yet: AJV falls back to the enclosing function, while the guard uses the declaration.
- A resource without `$id` that whole validation skips.

The guard follows AJV, not the specification, in these cases:

- Bookending: AJV does not check that the initial target of `$dynamicRef` is a `$dynamicAnchor` fragment; it branches on the root's anchor flags and the passed table.
- When the root's flag for an anchor name is not set at compile time, AJV compiles `$dynamicRef` or `$recursiveRef` as a call to the enclosing compiled function (`it.validateName`) without consulting the anchor table (`dynamicRef.js:32-38`); the guard keeps that behaviour.
- A `$dynamicRef` that is not a `#` fragment fails to compile in both.
- Anchor names that collide with `Object.prototype` members, such as `constructor`, `toString` or `__proto__`, never bind, because AJV checks the anchor table by truthiness on a plain object; whole validation and the guard share this deviation.
- `$data` references and custom keywords that read root or parent data see only the host value in a guard. This is a separate limit of the host-value guard interface and is unrelated to dynamic scope.

Strict options on a bound instance, such as `strictTypes` and `strictRequired`, may make some `if` guards fail to compile. The affected gate becomes false and produces a `GUARD_FAILED` `onError` record. The plugin does not override the consumer's options, and strict mode is not the plugin default (VALIDATE-003, VALIDATE-005, VALIDATE-033, ERROR-041).

### **Default Configuration**

When no custom AJV instance is provided, the plugin uses these default settings:

```typescript
const defaultSettings: Ajv.Options = {
  allErrors: true, // Collect all validation errors, not just the first one
  strict: false, // Disable strict mode for better compatibility with existing schemas
  validateFormats: false, // Disable format validation for better performance
};
```

### **Validator Factory**

The `createValidatorFactory` function provides:

- **Error Standardization**: Converts AJV errors to a consistent format
- **Performance Optimization**: Caches compiled validators for reuse
- **Detailed Error Messages**: Rich error information for better user experience
- **Type Safety**: Full TypeScript support with proper type inference

`createValidator(ajv)` returns a per-instance `{ compile, compileGuard }` object for a Form's `validatorFactory`: create it once outside render (`const validator = createValidator(customAjv);` then `<Form validatorFactory={validator} />`), because a new object makes the Form rebuild its tree; several validators may share one AJV instance, which must not modify values (`coerceTypes`, `useDefaults`, `removeAdditional` off).

---

## Compatibility

`@canard/schema-form-ajv7-plugin` is built with ECMAScript 2020 (ES2020) syntax and supports AJV 7.x.

**Supported environments:**

- Node.js 14.17.0 or later
- Modern browsers (Chrome 91+, Firefox 90+, Safari 14+)
- AJV 7.0.0 or later

**For legacy environment support:**
Please use a transpiler like Babel to transform the code for your target environment.

**Dependency requirements:**

- @canard/schema-form (peer dependency)
- ajv ^7.0.0

**JSON Schema Support:**

- Draft-06
- Draft-07
- Draft 2019-09 (partial support)

---

## Migration Guide

### From Manual AJV Usage

```typescript
// Before (manual AJV)
// After (with plugin)
import { SchemaForm, registerPlugin } from '@canard/schema-form';
import { ajvValidatorPlugin } from '@canard/schema-form-ajv7-plugin';
import Ajv from 'ajv';

const ajv = new Ajv();
const validate = ajv.compile(schema);
const isValid = validate(data);

registerPlugin(ajvValidatorPlugin);
// Validation is now handled automatically by SchemaForm
```

### To AJV 8.x

If you need to upgrade to AJV 8.x for newer JSON Schema features:

```bash
yarn remove @canard/schema-form-ajv7-plugin
yarn add @canard/schema-form-ajv8-plugin
```

```typescript
// Update import
import { ajvValidatorPlugin } from '@canard/schema-form-ajv8-plugin';
```

---

## License

This repository is licensed under the MIT License. Please refer to the [`LICENSE`](../../../LICENSE) file for details.

---

## Contact

For inquiries or suggestions related to the project, please create an issue on the [GitHub repository](https://github.com/vincent-kk/albatrion).
