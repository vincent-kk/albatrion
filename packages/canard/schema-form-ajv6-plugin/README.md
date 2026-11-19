# @canard/schema-form-ajv6-plugin

[![Typescript](https://img.shields.io/badge/typescript-✔-blue.svg)]()
[![Javascript](https://img.shields.io/badge/javascript-✔-yellow.svg)]()
[![React](https://img.shields.io/badge/react-✔-61DAFB.svg)]()
[![AJV](https://img.shields.io/badge/AJV-6.x-orange.svg)]()
[![JSON Schema Form Plugin](https://img.shields.io/badge/JSONSchemaForm-validator-green.svg)]()

---

## Overview

`@canard/schema-form-ajv6-plugin` is a validator plugin for `@canard/schema-form` that provides JSON Schema validation using AJV 6.x.

---

## Notice

⚠️ This plugin uses AJV 6.x. The default instance validates Draft-07; older declared drafts require additional configuration as shown below.

📌 If you need support for newer JSON Schema features (Draft 2019-09, Draft 2020-12), consider using `@canard/schema-form-ajv8-plugin` instead.

💡 This plugin provides a complete JSON Schema validation solution with detailed error reporting and custom validation support.

---

## How to use

```bash
yarn add @canard/schema-form @canard/schema-form-ajv6-plugin
```

```tsx
import { registerPlugin } from '@canard/schema-form';
import { plugin } from '@canard/schema-form-ajv6-plugin';
// Or register with custom AJV instance
import Ajv from 'ajv';

// Option 1: register the validator plugin globally
registerPlugin(plugin);

// Option 2: when using a custom AJV instance (use instead of Option 1)
const customAjv = new Ajv({
  allErrors: true,
  nullable: true,
  verbose: true,
});
plugin.validator.bind(customAjv);
registerPlugin(plugin);
```

---

## Features

### **Plugin Interface**

The plugin implements the `ValidatorPlugin` interface with validation, synchronous guards, and root release:

#### **`bind(instance: Ajv.Ajv)`**

- **Purpose**: Allows you to provide a custom AJV instance with your preferred configuration
- **Usage**: Optional - if not called, a default AJV instance will be created automatically
- **Benefits**: Full control over AJV settings, custom keywords, formats, and validation rules
- **Restriction**: Instances with `coerceTypes`, `useDefaults`, or `removeAdditional` enabled are rejected immediately, before replacing the current binding. The thrown native `ValidatorBindRefusedError` lists the enabled options in `details.options`. Value-modifying custom keywords remain the consumer's responsibility.
- **Binding order**: Call `bind` once before the first compile; re-binding after a root is registered is not supported, and in this plugin binding starts a new registry and does not carry roots registered before it.

Callers discriminate the refusal by `group` (`'UNHANDLED_ERROR'`) and `code` (`'UNHANDLED_ERROR.VALIDATOR_BIND_REFUSED'`, the value of `FormErrorCode.ValidatorBindRefused`); core's `isUnhandledError` does not recognize it.

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

AJV6 defaults to `$id`; `schemaId: 'id'` or `'auto'` also treats draft-04 `id` as contextual.

#### **`compile(jsonSchema)`**

- **Purpose**: Creates a validator function from the provided JSON Schema
- **Returns**: A validator factory function that can validate data against the schema
- **Features**: Automatic error transformation, detailed validation messages, performance optimization

#### **`compileGuard(root, pointer)`**

- **Purpose**: Compiles a synchronous boolean guard at a schema pointer in the engine-owned copy root, retaining its `$ref` context
- **Call order**: Accepts that copy whether or not `compile` has run. A self-contained guard compiles its subschema without registering the root; only guards that need the root location, such as guards with `$ref` into root definitions, register the root on the guard instance. `compile` compiles a detached copy on a plugin-owned validation compiler. Its per-application compiler pool rotates after 64 new roots; overlapping live form ids use isolated compilers. The application instance is read-only to the plugin. Both kinds of guard work before whole-schema compilation.
- **Identity**: Pass the same copy object to `compile`, every `compileGuard`, and `release`; whole-schema validation can be compiled later.
- **Limits**: Asynchronous formats and keywords are unsupported
- **Refusal**: `compileGuard` throws a native `GuardPointerNotSchemaError` when the pointer does not locate a schema (an object or boolean): a missing location, or a value such as `/type` or `/required`. Callers discriminate it by `group` (`'UNHANDLED_ERROR'`) and `code` (`'GUARD_POINTER_NOT_SCHEMA'`); `details` carries the root's `$id` (or `''`) and the pointer.

Strict options on a bound instance, such as `strictKeywords`, may make some `if` guards fail to compile. The affected gate becomes false and produces a `GUARD_FAILED` `onError` record. The plugin does not override the consumer's options, and strict mode is not the plugin default (VALIDATE-003, VALIDATE-005, VALIDATE-033, ERROR-041).

#### **`release(root)`**

- **Purpose**: Removes that root's Ajv registrations and compiled results when the form cache evicts it
- **Call order**: Accepts the same engine-owned copy whether or not `compile` has run. Releasing an unregistered root is a no-op.

### **Default Configuration**

When no custom AJV instance is provided, the plugin uses these default settings:

```typescript
const defaultSettings: Ajv.Options = {
  allErrors: true, // Collect all validation errors, not just the first one
  multipleOfPrecision: 9,
  nullable: true, // Enable `nullable` keyword (= `type:[{type}, 'null']`)
  verbose: true, // Include schema and data information in errors
  format: false, // Disable format validation (can be enabled if needed)
};
```

### **Validator Factory**

The `createValidatorFactory` function provides:

- **Error Standardization**: Converts AJV errors to a consistent format
- **Performance Optimization**: Reuses the registration for the same root object until `release(root)`
- **Detailed Error Messages**: Rich error information for better user experience
- **Type Safety**: Full TypeScript support with proper type inference

`createValidator(ajv)` returns a per-instance `{ compile, compileGuard }` object for a Form's `validatorFactory`: create it once outside render (`const validator = createValidator(customAjv);` then `<Form validatorFactory={validator} />`), because a new object makes the Form rebuild its tree; several validators may share one AJV instance, which must not modify values (`coerceTypes`, `useDefaults`, `removeAdditional` off).

---

## Compatibility

`@canard/schema-form-ajv6-plugin` is built with ECMAScript 2020 (ES2020) syntax and supports AJV 6.x.

**Supported environments:**

- Node.js 14.17.0 or later
- Modern browsers (Chrome 91+, Firefox 90+, Safari 14+)
- AJV 6.0.0 or later

**For legacy environment support:**
Please use a transpiler like Babel to transform the code for your target environment.

**Dependency requirements:**

- @canard/schema-form (peer dependency)
- ajv ^6.0.0

**JSON Schema Support:**

- Draft-07 with the default instance.
- Draft-06 after registering its meta-schema on a bound instance.
- Draft-04 is not configured by default; it additionally requires the Draft-04 meta-schema and an appropriate `schemaId` option on the bound AJV 6 instance.

---

## Migration Guide

### From Manual AJV Usage

```typescript
// After (with plugin)
import { registerPlugin } from '@canard/schema-form';
import { plugin } from '@canard/schema-form-ajv6-plugin';

registerPlugin(plugin);
// <Form> now validates through the registered plugin
```

### To AJV 8.x

If you need to upgrade to AJV 8.x for newer JSON Schema features:

```bash
yarn remove @canard/schema-form-ajv6-plugin
yarn add @canard/schema-form-ajv8-plugin
```

```typescript
// Update import
import { plugin } from '@canard/schema-form-ajv8-plugin';
```

---

## License

This repository is licensed under the MIT License. Please refer to the [`LICENSE`](../../../LICENSE) file for details.

---

## Contact

For inquiries or suggestions related to the project, please create an issue on the [GitHub repository](https://github.com/vincent-kk/albatrion).

### Enabling a declared Draft-06 schema

The default instance does not register the Draft-06 meta-schema. Bind a compatible instance before compiling the schema:

```typescript
import Ajv from 'ajv';
import draft06 from 'ajv/lib/refs/json-schema-draft-06.json';
import { createValidator } from '@canard/schema-form-ajv6-plugin';

const ajv = new Ajv({ allErrors: true, nullable: true, format: false });
ajv.addMetaSchema(draft06);
const validator = createValidator(ajv);
const validate = validator.compile({
  $schema: 'http://json-schema.org/draft-06/schema#',
  type: 'number',
  exclusiveMaximum: 5,
});
await validate(5); // Reports exclusiveMaximum.
```

Formats and keywords added to the bound instance are available to later compilations, including guards and isolated sibling instances. Already compiled validators keep their compiled rules; adding a rule does not recompile them.

## Decimal multiples

Instances created by the plugin use `multipleOfPrecision: 9`. This accepts exact decimal multiples such as `19.99` for `multipleOf: 0.01` despite binary division error, with a guaranteed exact-multiple range of `Math.abs(value / multipleOf) <= 1e6` for finite values and finite divisors at least `2.2250738585072014e-308` (the smallest normal IEEE-754 number). AJV treats a quotient within `1e-9` of an integer as a multiple: extremely close nonmultiples can also pass, and exact multiples outside that range are not guaranteed. Values such as `19.995` for `0.01`, `0.35` for `0.1`, and `0.300001` for `0.3` remain invalid. A zero `multipleOf` is an invalid schema. Pass your own AJV instance to `createValidator` or `plugin.validator.bind` to choose a different precision policy; its options are preserved.

When `WeakRef` or `FinalizationRegistry` is unavailable, including Safari 14.0, import, validation, guards, and explicit release remain supported. Call `release(root)` when a root is no longer used: automatic cleanup after garbage collection is unavailable on these hosts.

Form validation uses an independent JSON Pointer cache for application-provided AJV instances. Compiling a form neither changes the application's `jsonPointers` and `errorDataPath` options nor replaces its cached validator paths, regardless of which caller compiled a shared schema first.

Form roots live only on plugin-owned compilers. Calling `ajv.getSchema(formRoot.$id)` on the application instance does not return a form root unless the application registered that schema itself. Application `removeSchema` calls do not invalidate returned form validators. Compilation reflects the current contents of the supplied root object, including in-place changes; an earlier function keeps its own snapshot. Identical serialized contents may reuse the previous function before `release(root)`. New compilations read the current application options, keywords, formats, meta-schemas and referenced raw schemas; removed or replaced imports retire their private compiler. Already-returned validators and guards remain snapshots. Keyword validator functions may have their native `.errors` scratch state reset by AJV; the plugin does not isolate callback closure effects.

Compilation does not call `loadSchema`: register external schemas on the application instance first. Root arguments must be schema objects; boolean subschemas remain valid guard targets. Mutating AJV options are refused, including when enabled after binding. Custom constructors must accept an options object and honor isolation options. In-place mutation of authored schema objects, keyword definitions or nested option objects is unsupported; replace or re-register them instead.

A reference uses the application registration at compilation time. If a retained registration key and a replaced schema ID refer to different schemas with the same normalized ID, separate form roots compile in isolated environments. A single root that references both is unsupported and throws an error naming the ID and both keys.
