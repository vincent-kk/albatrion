import type { ComponentType } from 'react';

import type { Fn } from '@aileron/declare';

import type {
  FieldInputDefinition,
  FieldRendererProps,
  FormatError,
  ValidateFunction,
} from '@/schema-form/types';
import type { JSONSchema } from '@/schema-form/types';

/**
 * Plugin configuration for extending schema-form functionality.
 *
 * Allows customization of form rendering components, input type definitions,
 * validation behavior, and error formatting. All properties are optional,
 * enabling partial customization of specific aspects.
 *
 * @example
 * Minimal plugin with custom components:
 * ```typescript
 * const myPlugin: SchemaFormPlugin = {
 *   FieldRenderer: CustomFormField,
 *   FormLabelRenderer: CustomFormLabel,
 * };
 * ```
 *
 * @example
 * UI library integration (e.g., Ant Design):
 * ```typescript
 * import { Form, Input, DatePicker, Select } from 'antd';
 *
 * const antdPlugin: SchemaFormPlugin = {
 *   // Custom render components
 *   FieldRenderer: ({ Input, errorMessage }) => (
 *     <Form.Item help={errorMessage}>
 *       <Input />
 *     </Form.Item>
 *   ),
 *   FormLabelRenderer: ({ jsonSchema }) => (
 *     <span>{jsonSchema.title || jsonSchema.name}</span>
 *   ),
 *
 *   // Custom input types for Ant Design
 *   fieldInputDefinitions: [
 *     {
 *       test: { type: 'string', format: 'date' },
 *       Component: ({ value, onChange }) => (
 *         <DatePicker
 *           value={value ? moment(value) : null}
 *           onChange={(date) => onChange(date?.format('YYYY-MM-DD'))}
 *         />
 *       ),
 *     },
 *     {
 *       test: { type: 'string', enum: true },
 *       Component: ({ jsonSchema, value, onChange }) => (
 *         <Select
 *           value={value}
 *           onChange={onChange}
 *           options={jsonSchema.enum?.map(v => ({ label: v, value: v }))}
 *         />
 *       ),
 *     },
 *   ],
 * };
 * ```
 *
 * @example
 * Complete plugin with all features:
 * ```typescript
 * const fullPlugin: SchemaFormPlugin = {
 *   // Render components
 *   FieldRenderer: CustomFormField,
 *   FormLabelRenderer: CustomFormLabel,
 *   FormInputRenderer: CustomFormInput,
 *   FormErrorRenderer: CustomFormError,
 *
 *   // Input type definitions
 *   fieldInputDefinitions: [
 *     {
 *       test: { format: 'color' },
 *       Component: ColorPickerInput,
 *     },
 *     {
 *       test: (hint) => hint.jsonSchema.widget === 'richtext',
 *       Component: RichTextEditor,
 *     },
 *   ],
 *
 *   // Validation with AJV
 *   validator: ajvValidatorPlugin,
 *
 *   // Custom error formatting
 *   formatError: (error, node, context) => {
 *     const messages = context.locale === 'ko'
 *       ? koreanErrorMessages
 *       : englishErrorMessages;
 *     return messages[error.keyword] || error.message;
 *   },
 * };
 * ```
 *
 * @remarks
 * - All properties are optional - customize only what you need
 * - Plugins can be registered globally via `registerPlugin()`
 * - Plugins can be applied locally via `ExternalFormContextProvider`
 * - When multiple plugins define the same property, the last one wins
 */
export interface SchemaFormPlugin {
  /** Form.Field Component */
  FieldRenderer?: ComponentType<FieldRendererProps>;
  /** Form.Label Component */
  FormLabelRenderer?: ComponentType<FieldRendererProps>;
  /** Form.Input Component */
  FormInputRenderer?: ComponentType<FieldRendererProps>;
  /** Form.Error Component */
  FormErrorRenderer?: ComponentType<FieldRendererProps>;
  /** FieldInputDefinition */
  fieldInputDefinitions?: FieldInputDefinition[];
  /** Validator Plugin */
  validator?: ValidatorPlugin;
  /** Formatting Error Function */
  formatError?: FormatError;
}

/**
 * Validator plugin interface for integrating a JSON Schema validator.
 *
 * A plugin compiles the engine's schema copy into a validate function and compiles
 * the synchronous boolean guards behind `if`, `then` and `else`. The package README's
 * "Validator plugin contract" section lists every duty and default; for AJV, use a
 * published plugin (`@canard/schema-form-ajv8-plugin`, `-ajv7-plugin`, `-ajv6-plugin`).
 *
 * @example
 * Direct implementation with one AJV 8 instance per root. It compiles every guard
 * through the root pointer, so a code-generation error elsewhere in the root (for
 * example an unresolved `$ref`) also fails guards whose condition is self-contained;
 * the published plugins compile self-contained conditions directly and keep that
 * shared failure to root-pointer guards (IR-10 R2, R3), so use a published plugin
 * for the full contract:
 * ```typescript
 * import Ajv from 'ajv';
 *
 * const ROOT_KEY = 'urn:schema-form:root';
 * const instances = new WeakMap<object, Ajv>();
 *
 * // One instance per engine copy keeps roots with the same `$id` apart, and dropping
 * // it on release frees every id the root registered; the copy is never modified.
 * const instanceOf = (root: JSONSchema): Ajv => {
 *   let ajv = instances.get(root);
 *   if (ajv === undefined) {
 *     ajv = new Ajv({ allErrors: true, strictSchema: false, validateSchema: false });
 *     ajv.addSchema(root, ROOT_KEY);
 *     instances.set(root, ajv);
 *   }
 *   return ajv;
 * };
 *
 * const directPlugin: ValidatorPlugin = {
 *   compile: (jsonSchema) => {
 *     const ajv = instanceOf(jsonSchema);
 *     // Well-formedness is checked only here; guards compile without it (IR-10).
 *     if (!ajv.validateSchema(jsonSchema)) throw new Error(ajv.errorsText(ajv.errors));
 *     const validate = ajv.getSchema(ROOT_KEY)!;
 *     return (value) => {
 *       validate(value);
 *       return validate.errors?.map((error) => ({
 *         dataPath: error.instancePath,
 *         keyword: error.keyword,
 *         message: error.message,
 *         details: error.params,
 *         source: error,
 *       })) ?? null;
 *     };
 *   },
 *   // Synchronous, evaluated in the root's context, and callable before compile.
 *   // Every guard goes through the root pointer, so a root code-generation error
 *   // fails self-contained conditions too; published plugins compile those directly.
 *   compileGuard: (root, pointer) => {
 *     const guard = instanceOf(root).compile({ $ref: `${ROOT_KEY}#${pointer}` });
 *     return (value) => guard(value) === true;
 *   },
 *   // Idempotent: releasing an unregistered root does nothing.
 *   release: (root) => {
 *     instances.delete(root);
 *   },
 * };
 * ```
 *
 * @example
 * Asynchronous validation with an injected instance:
 * ```typescript
 * let ajvInstance: Ajv | null = null;
 *
 * const asyncPlugin: ValidatorPlugin = {
 *   // The core never calls bind(); call it yourself once, before registering.
 *   bind: (instance: Ajv) => {
 *     ajvInstance = instance;
 *   },
 *   compile: (jsonSchema) => {
 *     ajvInstance ??= new Ajv({ allErrors: true, strictSchema: false });
 *     const validate = ajvInstance.compile({ ...jsonSchema, $async: true });
 *     return async (data) => {
 *       try {
 *         await validate(data);
 *         return null;
 *       } catch (thrown) {
 *         if (Array.isArray(thrown?.errors)) return toValidationIssues(thrown.errors);
 *         throw thrown;
 *       }
 *     };
 *   },
 *   // Guards stay synchronous even when compile is asynchronous. A guard that
 *   // registers roots, follows dynamic scope and releases correctly is what the
 *   // published plugins implement; use one of them instead of writing it here.
 *   compileGuard: (root, pointer) => compileSyncGuard(root, pointer),
 * };
 *
 * asyncPlugin.bind(new Ajv({ allErrors: true }));
 * registerPlugin(asyncPlugin);
 * ```
 *
 * @example
 * Caching compiled validators by schema text:
 * ```typescript
 * const validatorCache = new Map<string, ValidateFunction>();
 *
 * const cachedPlugin: ValidatorPlugin = {
 *   compile: (jsonSchema) => {
 *     const schemaKey = JSON.stringify(jsonSchema);
 *     let validator = validatorCache.get(schemaKey);
 *     if (validator === undefined) {
 *       validator = createValidator(jsonSchema);
 *       validatorCache.set(schemaKey, validator);
 *     }
 *     return validator;
 *   },
 *   // Required as well; use a published plugin's guard compiler for AJV schemas.
 *   compileGuard: (root, pointer) => compileSyncGuard(root, pointer),
 * };
 * ```
 *
 * @remarks
 * - The `bind` method is optional and never invoked by the core; consumers may
 *   call it directly on the plugin object, once, before registration to inject a
 *   custom validator instance (e.g. `ajvValidatorPlugin.bind(customAjv)`)
 * - The `compile` method is called for each unique schema that needs validation
 * - Validators should return `null` for valid data, or an array of errors
 * - Support both sync and async validation by returning Promise when needed
 * - `compileGuard` is required and must return a synchronous boolean predicate;
 *   a guard that fails to compile or evaluate turns off both branches of its own gate
 */
export interface ValidatorPlugin {
  /**
   * Inject Custom Validator Instance
   * @remarks Consumer-facing hook: call it on the plugin object before
   *          `registerPlugin()` to supply a custom instance. The core never calls it.
   */
  bind?: Fn<[instance: any]>;
  /** Validator Factory Function */
  compile: (jsonSchema: JSONSchema) => ValidateFunction;
  /**
   * Compile a synchronous guard for an authored schema pointer in the copy.
   * @param root - Engine-owned copy root, whether or not `compile` has run for it.
   * @param pointer - Authored schema location preserved in the copy.
   * @returns A boolean predicate; registers the root independently without modifying it.
   */
  compileGuard(root: JSONSchema, pointer: string): (value: unknown) => boolean;
  /**
   * Release a root's validator resources when its cache entry is evicted.
   * @param root - Engine-owned copy root, whether or not `compile` has run for it.
   * @returns Nothing; discards root resources or does nothing if it was never registered.
   */
  release?(root: JSONSchema): void;
  /** Declared JSON Schema dialect, when the plugin can identify one. */
  readonly dialect?: string;
}
