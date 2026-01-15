import { isPlainObject } from '@winglet/common-utils/filter';
import { stableSerialize } from '@winglet/common-utils/object';

import type { SchemaFormPlugin } from '@/schema-form';
import { UnhandledError } from '@/schema-form/errors';
import { formatRegisterPluginError } from '@/schema-form/helpers/error';

import { PluginManager } from './PluginManager';

const RegisteredPlugin = new Set<string>();

/**
 * Registers a schema form plugin to extend or customize form functionality globally.
 *
 * Provides a centralized way to register custom components, validators, and formatters
 * that will be used throughout the application. Plugins are deduplicated by content hash
 * to prevent duplicate registrations.
 *
 * @param plugin - Plugin configuration object or null to reset all plugins to defaults
 * @throws {UnhandledError} When plugin registration fails
 *
 * @example
 * Basic plugin registration with custom components:
 * ```typescript
 * import { registerPlugin } from '@canard/schema-form';
 *
 * registerPlugin({
 *   FormGroup: CustomFormGroup,
 *   FormLabel: CustomFormLabel,
 *   FormInput: CustomFormInput,
 *   FormError: CustomFormError,
 * });
 * ```
 *
 * @example
 * Register custom form type definitions:
 * ```typescript
 * const datePickerDefinition = {
 *   test: { type: 'string', format: 'date' },
 *   Component: DatePickerInput,
 * };
 *
 * const colorPickerDefinition = {
 *   test: { type: 'string', format: 'color' },
 *   Component: ColorPickerInput,
 * };
 *
 * registerPlugin({
 *   formTypeInputDefinitions: [
 *     datePickerDefinition,
 *     colorPickerDefinition,
 *   ],
 * });
 * ```
 *
 * @example
 * Register custom validator with Ajv:
 * ```typescript
 * import Ajv from 'ajv';
 * import addFormats from 'ajv-formats';
 *
 * const ajv = new Ajv({ allErrors: true });
 * addFormats(ajv);
 *
 * registerPlugin({
 *   validator: {
 *     bind: (instance) => {
 *       // Access validator instance if needed
 *       console.log('Validator bound:', instance);
 *     },
 *     compile: (jsonSchema) => {
 *       const validate = ajv.compile(jsonSchema);
 *       return (value) => {
 *         validate(value);
 *         return validate.errors?.map(err => ({
 *           dataPath: err.instancePath,
 *           keyword: err.keyword,
 *           message: err.message,
 *           details: err.params,
 *           source: err,
 *         })) || [];
 *       };
 *     },
 *   },
 * });
 * ```
 *
 * @example
 * Register custom error formatter:
 * ```typescript
 * registerPlugin({
 *   formatError: (error, node, context) => {
 *     // Custom error formatting logic
 *     if (error.keyword === 'required') {
 *       return `${node.name} is required`;
 *     }
 *     if (error.keyword === 'minLength') {
 *       return `${node.name} must be at least ${error.details?.limit} characters`;
 *     }
 *     return error.message || 'Invalid value';
 *   },
 * });
 * ```
 *
 * @example
 * Complete plugin example with all options:
 * ```typescript
 * const myFormPlugin: SchemaFormPlugin = {
 *   // Custom renderer components
 *   FormGroup: MyFormGroup,
 *   FormLabel: MyFormLabel,
 *   FormInput: MyFormInput,
 *   FormError: MyFormError,
 *
 *   // Custom input types
 *   formTypeInputDefinitions: [
 *     {
 *       test: { type: 'string', format: 'phone' },
 *       Component: PhoneNumberInput,
 *     },
 *     {
 *       test: (hint) => hint.jsonSchema.customType === 'address',
 *       Component: AddressInput,
 *     },
 *   ],
 *
 *   // Custom validator
 *   validator: {
 *     bind: (instance) => console.log('Validator ready'),
 *     compile: (jsonSchema) => {
 *       const validate = customValidate(jsonSchema);
 *       return async (value) => {
 *         const errors = await validate(value);
 *         return errors;
 *       };
 *     },
 *   },
 *
 *   // Custom error formatter
 *   formatError: (error, node) => {
 *     const fieldName = node.jsonSchema.title || node.name;
 *     return `${fieldName}: ${error.message}`;
 *   },
 * };
 *
 * registerPlugin(myFormPlugin);
 * ```
 *
 * @example
 * Multiple plugins with merge behavior:
 * ```typescript
 * // First plugin
 * registerPlugin({
 *   FormLabel: CustomLabel1,
 *   formTypeInputDefinitions: [
 *     { test: { format: 'date' }, Component: DatePicker1 }
 *   ],
 * });
 *
 * // Second plugin - behavior differs by property:
 * registerPlugin({
 *   FormLabel: CustomLabel2, // REPLACES CustomLabel1
 *   FormInput: CustomInput,  // ADDS to render kit
 *   formTypeInputDefinitions: [
 *     { test: { format: 'date' }, Component: DatePicker2 }, // PREPENDED (takes precedence)
 *     { test: { format: 'time' }, Component: TimePicker }   // ADDED
 *   ],
 *   validator: myValidator,    // REPLACES any previous validator
 *   formatError: myFormatter,  // REPLACES any previous formatter
 * });
 * ```
 *
 * @example
 * Reset all plugins to defaults:
 * ```typescript
 * // Remove ALL custom plugins and restore defaults
 * registerPlugin(null);
 * ```
 *
 * @remarks
 * ### Plugin Merge Behavior
 * When multiple plugins are registered:
 * - **Render components** (FormGroup, FormLabel, FormInput, FormError): Last one wins (replacement)
 * - **formTypeInputDefinitions**: Prepended to list (first match wins), allowing overrides
 * - **validator**: Last one wins (complete replacement)
 * - **formatError**: Last one wins (complete replacement)
 *
 * ### Important Notes
 * - Plugins are applied globally and affect all forms in the application
 * - Plugins are deduplicated by content hash to prevent duplicate registrations
 * - Use `null` parameter to reset ALL plugins to system defaults
 * - After reset, previously registered plugins need to be re-registered
 */
export const registerPlugin = (plugin: SchemaFormPlugin | null) => {
  if (plugin === null) PluginManager.reset();
  if (!isPlainObject(plugin)) return;
  const hash = stableSerialize(plugin);
  if (RegisteredPlugin.has(hash)) return;
  try {
    const { formTypeInputDefinitions, validator, formatError, ...renderKit } =
      plugin;
    PluginManager.appendRenderKit(renderKit);
    PluginManager.appendFormTypeInputDefinitions(formTypeInputDefinitions);
    PluginManager.appendValidator(validator);
    PluginManager.appendFormatError(formatError);
  } catch (error) {
    throw new UnhandledError(
      'REGISTER_PLUGIN',
      formatRegisterPluginError(plugin, error),
      {
        plugin,
        error,
      },
    );
  }
  RegisteredPlugin.add(hash);
};
