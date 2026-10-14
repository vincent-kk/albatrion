/**
 * Every error code the package raises, in ledger order (ERROR-164 and its supplements).
 * Keys are the bare code in PascalCase; values are the group-qualified strings errors and records carry.
 */
export const FormErrorCode = {
  /** Class: JSONSchemaError; when: schema analysis cannot determine a supported shape. */
  UnknownJsonSchema: 'JSON_SCHEMA_ERROR.UNKNOWN_JSON_SCHEMA',
  /** Class: JSONSchemaError; when: schema analysis finds an invalid array declaration. */
  UnexpectedArraySchema: 'JSON_SCHEMA_ERROR.UNEXPECTED_ARRAY_SCHEMA',
  /** Class: JSONSchemaError; when: static allOf types have an empty intersection. */
  AllOfTypeRedefinition: 'JSON_SCHEMA_ERROR.ALL_OF_TYPE_REDEFINITION',
  /** Class: JSONSchemaError; when: static allOf constants conflict. */
  ConflictingConstValues: 'JSON_SCHEMA_ERROR.CONFLICTING_CONST_VALUES',
  /** Class: JSONSchemaError; when: static allOf range intersection is empty. */
  InvalidRange: 'JSON_SCHEMA_ERROR.INVALID_RANGE',
  /** Class: JSONSchemaError; when: static allOf enum intersection is empty. */
  EmptyEnumIntersection: 'JSON_SCHEMA_ERROR.EMPTY_ENUM_INTERSECTION',
  /** Class: JSONSchemaError; when: virtual field references are invalid. */
  VirtualFieldsNotValid: 'JSON_SCHEMA_ERROR.VIRTUAL_FIELDS_NOT_VALID',
  /** Class: JSONSchemaError; when: virtual fields are absent from declared properties. */
  VirtualFieldsNotInProperties:
    'JSON_SCHEMA_ERROR.VIRTUAL_FIELDS_NOT_IN_PROPERTIES',
  /** Class: JSONSchemaError; when: a controls expression cannot be compiled. */
  CreateDynamicFunction: 'JSON_SCHEMA_ERROR.CREATE_DYNAMIC_FUNCTION',
  /** Class: JSONSchemaError; when: observed-value expression analysis fails. */
  ObservedValues: 'JSON_SCHEMA_ERROR.OBSERVED_VALUES',
  /** Class: JSONSchemaError; when: a controls, options, or child controls key is outside its closed list. */
  UnknownGroupKey: 'JSON_SCHEMA_ERROR.UNKNOWN_GROUP_KEY',
  /** Class: JSONSchemaError; when: a discriminator key or branch value is inconsistent. */
  DiscriminatorMismatch: 'JSON_SCHEMA_ERROR.DISCRIMINATOR_MISMATCH',
  /** Class: JSONSchemaError; when: static and ungated branch node kinds conflict. */
  SharedNodeKindConflict: 'JSON_SCHEMA_ERROR.SHARED_NODE_KIND_CONFLICT',
  /** Class: JSONSchemaError; when: declarations disagree on a node's terminal strategy. */
  TerminalStrategyMismatch: 'JSON_SCHEMA_ERROR.TERMINAL_STRATEGY_MISMATCH',
  /** Class: SchemaFormError; when: active declarations cannot share one node kind. */
  SharedNodeConflict: 'SCHEMA_FORM_ERROR.SHARED_NODE_CONFLICT',
  /** Class: SchemaFormError; when: settlement exceeds its host, derive, or transition budget. */
  BudgetExceeded: 'SCHEMA_FORM_ERROR.BUDGET_EXCEEDED',
  /** Class: SchemaFormError; when: an active controls expression throws during settlement. */
  ExpressionThrew: 'SCHEMA_FORM_ERROR.EXPRESSION_THREW',
  /** Class: SchemaFormError; when: guard compilation or synchronous evaluation fails. */
  GuardFailed: 'SCHEMA_FORM_ERROR.GUARD_FAILED',
  /** Class: SchemaFormError; when: a dynamic injection has no target. */
  InjectTargetMissing: 'SCHEMA_FORM_ERROR.INJECT_TARGET_MISSING',
  /** Class: SchemaFormError; when: listener feedback or onChange nesting exceeds its budget. */
  FeedbackLimitExceeded: 'SCHEMA_FORM_ERROR.FEEDBACK_LIMIT_EXCEEDED',
  /** Class: SchemaFormError; when: a subscriber or form callback throws. */
  ListenerThrew: 'SCHEMA_FORM_ERROR.LISTENER_THREW',
  /** Class: SchemaFormError; when: a dispatch chain or observer produces multiple errors. */
  MultipleErrors: 'SCHEMA_FORM_ERROR.MULTIPLE_ERRORS',
  /** Class: SchemaFormError; when: render input-map normalization fails. */
  FormTypeInputMap: 'SCHEMA_FORM_ERROR.FORM_TYPE_INPUT_MAP',
  /** Class: UnhandledError; when: global plugin registration fails outside a form instance. */
  RegisterPlugin: 'UNHANDLED_ERROR.REGISTER_PLUGIN',
  /** Class: SchemaFormError; when: a public write combines incompatible options. */
  InvalidWriteOption: 'SCHEMA_FORM_ERROR.INVALID_WRITE_OPTION',
  /** Class: SchemaFormError; when: a caller writes through a disposed node reference. */
  DisposedNodeWrite: 'SCHEMA_FORM_ERROR.DISPOSED_NODE_WRITE',
  /** Class: SchemaFormError; when: onError tries to write to its own form. */
  WriteInObserver: 'SCHEMA_FORM_ERROR.WRITE_IN_OBSERVER',
  /** Class: SchemaFormError; when: submission is attempted while diagnostics are degraded. */
  SubmitWhileDegraded: 'SCHEMA_FORM_ERROR.SUBMIT_WHILE_DEGRADED',
  /** Class: SchemaFormError; when: whole-schema compilation fails on the first validation request. */
  ValidatorCompileFailed: 'SCHEMA_FORM_ERROR.VALIDATOR_COMPILE_FAILED',
  /** Class: SchemaFormError; when: a compiled validator throws during validation. */
  ValidatorThrew: 'SCHEMA_FORM_ERROR.VALIDATOR_THREW',
  /** Class: SchemaFormError; when: an injected renderer or root render throws. */
  RenderFailed: 'SCHEMA_FORM_ERROR.RENDER_FAILED',
  /** Class: SchemaFormError; when: a virtual node receives values with the wrong shape. */
  InvalidVirtualNodeValues: 'SCHEMA_FORM_ERROR.INVALID_VIRTUAL_NODE_VALUES',
  /** Class: SchemaFormError; when: an array-only command is called on another node kind. */
  ArrayMethodOnNonArray: 'SCHEMA_FORM_ERROR.ARRAY_METHOD_ON_NON_ARRAY',
  /** Class: JSONSchemaError; when: schema analysis finds an unbounded recursive shape. */
  RecursiveShapeUnbounded: 'JSON_SCHEMA_ERROR.RECURSIVE_SHAPE_UNBOUNDED',
  /** Class: SchemaFormError; when: recursive shape expansion exceeds the settlement budget. */
  RecursiveShapeDiverged: 'SCHEMA_FORM_ERROR.RECURSIVE_SHAPE_DIVERGED',
  /** Class: JSONSchemaError; when: declarations disagree on virtual fields. */
  VirtualFieldsMismatch: 'JSON_SCHEMA_ERROR.VIRTUAL_FIELDS_MISMATCH',
  /** Class: JSONSchemaError; when: a declared child name is absent from the schema. */
  ChildrenTargetNotFound: 'JSON_SCHEMA_ERROR.CHILDREN_TARGET_NOT_FOUND',
  /** Class: JSONSchemaError; when: a single-row kind declares a different terminal option. */
  TerminalOptionUnsupported: 'JSON_SCHEMA_ERROR.TERMINAL_OPTION_UNSUPPORTED',
  /** Class: UnhandledError; when: a plugin refuses a bound validator instance outside a form. */
  ValidatorBindRefused: 'UNHANDLED_ERROR.VALIDATOR_BIND_REFUSED',
  /** Class: JSONSchemaError; when: a known controls, options, or child controls key has the wrong shape. */
  InvalidControlShape: 'JSON_SCHEMA_ERROR.INVALID_CONTROL_SHAPE',
  /** Class: ValidationError; when: schema validation rejects a submission. */
  SchemaValidationFailed: 'VALIDATION_ERROR.SCHEMA_VALIDATION_FAILED',
} as const;

/** Closed union of the error code values. */
export type FormErrorCode = (typeof FormErrorCode)[keyof typeof FormErrorCode];
