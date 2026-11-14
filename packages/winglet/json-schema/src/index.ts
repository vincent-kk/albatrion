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
export { JSONSchemaScanError } from './utils/error/JSONSchemaScanError';
export { JSONSchemaScanErrorCode } from './utils/error/JSONSchemaScanErrorCode';
export { Dialect } from './utils/dialect/Dialect';
export { ReferenceSkipReason } from './utils/referenceOutcome/ReferenceSkipReason';
export {
  JSONSchemaScannerAsync,
  type JSONScannerOptionsAsync,
} from './utils/JSONSchemaScanner/async';
export {
  DEFAULT_KEYWORDS,
  JSONSchemaScanner,
  type JSONScannerOptions,
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
  JSONSchema,
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

export {
  createReferenceResolver,
  createReferenceResolverAsync,
  type ReferenceResolverOptions,
  type ReferenceResolverAsyncOptions,
  type ReferenceResolver,
  type ReferenceResolverAsync,
  type ReferenceStep,
  type ReferenceOutcome,
  type ReferenceKeyword,
} from './utils/createReferenceResolver';
