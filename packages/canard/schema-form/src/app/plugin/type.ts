import type { ComponentType } from 'react';

import type { Fn } from '@aileron/declare';

import type {
  FormTypeInputDefinition,
  FormTypeRendererProps,
  FormatError,
  ValidatorFactory,
} from '@/schema-form/types';

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
 *   FormGroup: CustomFormGroup,
 *   FormLabel: CustomFormLabel,
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
 *   FormGroup: ({ Input, errorMessage }) => (
 *     <Form.Item help={errorMessage}>
 *       <Input />
 *     </Form.Item>
 *   ),
 *   FormLabel: ({ jsonSchema }) => (
 *     <span>{jsonSchema.title || jsonSchema.name}</span>
 *   ),
 *
 *   // Custom input types for Ant Design
 *   formTypeInputDefinitions: [
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
 *   FormGroup: CustomFormGroup,
 *   FormLabel: CustomFormLabel,
 *   FormInput: CustomFormInput,
 *   FormError: CustomFormError,
 *
 *   // Input type definitions
 *   formTypeInputDefinitions: [
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
  /** Form.Group Component */
  FormGroup?: ComponentType<FormTypeRendererProps>;
  /** Form.Label Component */
  FormLabel?: ComponentType<FormTypeRendererProps>;
  /** Form.Input Component */
  FormInput?: ComponentType<FormTypeRendererProps>;
  /** Form.Error Component */
  FormError?: ComponentType<FormTypeRendererProps>;
  /** FormTypeInputDefinition */
  formTypeInputDefinitions?: FormTypeInputDefinition[];
  /** Validator Plugin */
  validator?: ValidatorPlugin;
  /** Formatting Error Function */
  formatError?: FormatError;
}

/**
 * Validator plugin interface for integrating validation libraries.
 *
 * Provides a standardized way to integrate different validation libraries
 * (AJV, Joi, Yup, Zod, etc.) with schema-form. The plugin handles both
 * initialization and compilation of validators.
 *
 * @example
 * Basic AJV8 validator plugin:
 * ```typescript
 * import Ajv from 'ajv';
 *
 * const ajvPlugin: ValidatorPlugin = {
 *   bind: (instance) => {
 *     // Store or configure the validator instance
 *     console.log('AJV instance bound:', instance);
 *   },
 *   compile: (jsonSchema) => {
 *     const ajv = new Ajv({ allErrors: true });
 *     const validate = ajv.compile(jsonSchema);
 *
 *     return (value) => {
 *       validate(value);
 *       return validate.errors?.map(err => ({
 *         dataPath: err.instancePath,
 *         keyword: err.keyword,
 *         message: err.message,
 *         details: err.params,
 *         source: err,
 *       })) || null;
 *     };
 *   },
 * };
 * ```
 *
 * @example
 * AJV8 plugin with shared instance (from schema-form-ajv8-plugin):
 * ```typescript
 * let ajvInstance: Ajv | null = null;
 *
 * const ajvValidatorPlugin: ValidatorPlugin = {
 *   bind: (instance: Ajv) => {
 *     ajvInstance = instance;
 *   },
 *
 *   compile: (jsonSchema) => {
 *     if (!ajvInstance) {
 *       ajvInstance = new Ajv({
 *         allErrors: true,
 *         strictSchema: false,
 *         validateFormats: false,
 *       });
 *     }
 *
 *     const validate = ajvInstance.compile({
 *       ...jsonSchema,
 *       $async: true,
 *     });
 *
 *     return async (data) => {
 *       try {
 *         await validate(data);
 *         return null;
 *       } catch (thrown) {
 *         if (Array.isArray(thrown?.errors)) {
 *           return transformErrors(thrown.errors);
 *         }
 *         throw thrown;
 *       }
 *     };
 *   },
 * };
 * ```
 *
 * @example
 * Custom validator with caching:
 * ```typescript
 * const cachedValidatorPlugin: ValidatorPlugin = {
 *   bind: (cache: Map<string, ValidateFunction>) => {
 *     // Use external cache for compiled validators
 *     validatorCache = cache;
 *   },
 *
 *   compile: (jsonSchema) => {
 *     const schemaKey = JSON.stringify(jsonSchema);
 *
 *     // Return cached validator if available
 *     if (validatorCache.has(schemaKey)) {
 *       return validatorCache.get(schemaKey)!;
 *     }
 *
 *     // Create and cache new validator
 *     const validator = createValidator(jsonSchema);
 *     validatorCache.set(schemaKey, validator);
 *     return validator;
 *   },
 * };
 * ```
 *
 * @remarks
 * - The `bind` method is called once when the plugin is registered
 * - The `compile` method is called for each unique schema that needs validation
 * - Validators should return `null` for valid data, or an array of errors
 * - Support both sync and async validation by returning Promise when needed
 */
export interface ValidatorPlugin {
  /** Inject Custom Validator Instance */
  bind: Fn<[instance: any]>;
  /** Validator Factory Function */
  compile: ValidatorFactory;
}
