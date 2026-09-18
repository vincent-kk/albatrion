export {
  hasNullInType,
  isArraySchema,
  isBooleanSchema,
  isCompatibleSchemaType,
  isIdenticalSchemaType,
  isNonNullableArraySchema,
  isNonNullableBooleanSchema,
  isNonNullableNumberSchema,
  isNonNullableObjectSchema,
  isNonNullableStringSchema,
  isNullableArraySchema,
  isNullableBooleanSchema,
  isNullableNumberSchema,
  isNullableObjectSchema,
  isNullableStringSchema,
  isNullSchema,
  isNumberSchema,
  isObjectSchema,
  isStringSchema,
} from './filters';
export {
  JSONSchemaScannerAsync,
  /** @deprecated Use `JSONSchemaScannerAsync`. Removed in 0.16.0. */
  JsonSchemaScannerAsync,
  type JSONScannerOptionsAsync,
  /** @deprecated Use `JSONScannerOptionsAsync`. Removed in 0.16.0. */
  type JsonScannerOptionsAsync,
} from './utils/JSONSchemaScanner/async';
export {
  DEFAULT_KEYWORDS,
  EXTENDED_KEYWORDS,
  JSONSchemaScanner,
  /** @deprecated Use `JSONSchemaScanner`. Removed in 0.16.0. */
  JsonSchemaScanner,
  type JSONScannerOptions,
  /** @deprecated Use `JSONScannerOptions`. Removed in 0.16.0. */
  type JsonScannerOptions,
  type KeywordDescriptor,
  type KeywordKind,
  type SchemaEntry,
  type SchemaVisitor,
} from './utils/JSONSchemaScanner/sync';
export type {
  ArraySchema,
  BasicSchema,
  BooleanSchema,
  InferJSONSchema,
  /** @deprecated Use `InferJSONSchema`. Removed in 0.16.0. */
  InferJsonSchema,
  JSONSchema,
  /** @deprecated Use `JSONSchema`. Removed in 0.16.0. */
  JsonSchema,
  NonNullableArraySchema,
  NonNullableBooleanSchema,
  NonNullableNumberSchema,
  NonNullableObjectSchema,
  NonNullableStringSchema,
  NullableArraySchema,
  NullableBooleanSchema,
  NullableNumberSchema,
  NullableObjectSchema,
  NullableStringSchema,
  NullSchema,
  NumberSchema,
  ObjectSchema,
  RefSchema,
  StringSchema,
  UnknownSchema,
} from './types/jsonSchema';
export type {
  AllowedValue,
  AnyValue,
  ArrayValue,
  BooleanValue,
  InferValueType,
  NullValue,
  NumberValue,
  ObjectValue,
  StringValue,
  UndefinedValue,
} from './types/value';

export { resolveReference } from './utils/resolveReference';
