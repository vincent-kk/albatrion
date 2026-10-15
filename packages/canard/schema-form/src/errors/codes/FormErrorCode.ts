import { FormErrorGroup } from './FormErrorGroup';
import { filterCodeGroup } from './filterCodeGroup';

/**
 * Every error code the package raises, in ledger order (ERROR-164 and its supplements).
 * Keys are the bare code in PascalCase; values are the group-qualified strings errors and records carry.
 */
export const FormErrorCode = {
  /** Class: JSONSchemaError; when: schema analysis cannot determine a supported shape. */
  UnknownJsonSchema: `${FormErrorGroup.JsonSchema}.UNKNOWN_JSON_SCHEMA`,
  /** Class: JSONSchemaError; when: schema analysis finds an invalid array declaration. */
  UnexpectedArraySchema: `${FormErrorGroup.JsonSchema}.UNEXPECTED_ARRAY_SCHEMA`,
  /** Class: JSONSchemaError; when: static allOf types have an empty intersection. */
  AllOfTypeRedefinition: `${FormErrorGroup.JsonSchema}.ALL_OF_TYPE_REDEFINITION`,
  /** Class: JSONSchemaError; when: static allOf constants conflict. */
  ConflictingConstValues: `${FormErrorGroup.JsonSchema}.CONFLICTING_CONST_VALUES`,
  /** Class: JSONSchemaError; when: static allOf range intersection is empty. */
  InvalidRange: `${FormErrorGroup.JsonSchema}.INVALID_RANGE`,
  /** Class: JSONSchemaError; when: static allOf enum intersection is empty. */
  EmptyEnumIntersection: `${FormErrorGroup.JsonSchema}.EMPTY_ENUM_INTERSECTION`,
  /** Class: JSONSchemaError; when: virtual field references are invalid. */
  VirtualFieldsNotValid: `${FormErrorGroup.JsonSchema}.VIRTUAL_FIELDS_NOT_VALID`,
  /** Class: JSONSchemaError; when: virtual fields are absent from declared properties. */
  VirtualFieldsNotInProperties: `${FormErrorGroup.JsonSchema}.VIRTUAL_FIELDS_NOT_IN_PROPERTIES`,
  /** Class: JSONSchemaError; when: a controls expression cannot be compiled. */
  CreateDynamicFunction: `${FormErrorGroup.JsonSchema}.CREATE_DYNAMIC_FUNCTION`,
  /** Class: JSONSchemaError; when: observed-value expression analysis fails. */
  ObservedValues: `${FormErrorGroup.JsonSchema}.OBSERVED_VALUES`,
  /** Class: JSONSchemaError; when: a controls, options, or child controls key is outside its closed list. */
  UnknownGroupKey: `${FormErrorGroup.JsonSchema}.UNKNOWN_GROUP_KEY`,
  /** Class: JSONSchemaError; when: a discriminator key or branch value is inconsistent. */
  DiscriminatorMismatch: `${FormErrorGroup.JsonSchema}.DISCRIMINATOR_MISMATCH`,
  /** Class: JSONSchemaError; when: static and ungated branch node kinds conflict. */
  SharedNodeKindConflict: `${FormErrorGroup.JsonSchema}.SHARED_NODE_KIND_CONFLICT`,
  /** Class: JSONSchemaError; when: declarations disagree on a node's terminal strategy. */
  TerminalStrategyMismatch: `${FormErrorGroup.JsonSchema}.TERMINAL_STRATEGY_MISMATCH`,
  /** Class: SchemaFormError; when: active declarations cannot share one node kind. */
  SharedNodeConflict: `${FormErrorGroup.SchemaForm}.SHARED_NODE_CONFLICT`,
  /** Class: SchemaFormError; when: settlement exceeds its host, derive, or transition budget. */
  BudgetExceeded: `${FormErrorGroup.SchemaForm}.BUDGET_EXCEEDED`,
  /** Class: SchemaFormError; when: an active controls expression throws during settlement. */
  ExpressionThrew: `${FormErrorGroup.SchemaForm}.EXPRESSION_THREW`,
  /** Class: SchemaFormError; when: guard compilation or synchronous evaluation fails. */
  GuardFailed: `${FormErrorGroup.SchemaForm}.GUARD_FAILED`,
  /** Class: SchemaFormError; when: a dynamic injection has no target. */
  InjectTargetMissing: `${FormErrorGroup.SchemaForm}.INJECT_TARGET_MISSING`,
  /** Class: SchemaFormError; when: listener feedback or onChange nesting exceeds its budget. */
  FeedbackLimitExceeded: `${FormErrorGroup.SchemaForm}.FEEDBACK_LIMIT_EXCEEDED`,
  /** Class: SchemaFormError; when: a subscriber or form callback throws. */
  ListenerThrew: `${FormErrorGroup.SchemaForm}.LISTENER_THREW`,
  /** Class: SchemaFormError; when: a dispatch chain or observer produces multiple errors. */
  MultipleErrors: `${FormErrorGroup.SchemaForm}.MULTIPLE_ERRORS`,
  /** Class: SchemaFormError; when: render input-map normalization fails. */
  FormTypeInputMap: `${FormErrorGroup.SchemaForm}.FORM_TYPE_INPUT_MAP`,
  /** Class: UnhandledError; when: global plugin registration fails outside a form instance. */
  RegisterPlugin: `${FormErrorGroup.Unhandled}.REGISTER_PLUGIN`,
  /** Class: SchemaFormError; when: a public write combines incompatible options. */
  InvalidWriteOption: `${FormErrorGroup.SchemaForm}.INVALID_WRITE_OPTION`,
  /** Class: SchemaFormError; when: a caller writes through a disposed node reference. */
  DisposedNodeWrite: `${FormErrorGroup.SchemaForm}.DISPOSED_NODE_WRITE`,
  /** Class: SchemaFormError; when: onError tries to write to its own form. */
  WriteInObserver: `${FormErrorGroup.SchemaForm}.WRITE_IN_OBSERVER`,
  /** Class: SchemaFormError; when: submission is attempted while diagnostics are degraded. */
  SubmitWhileDegraded: `${FormErrorGroup.SchemaForm}.SUBMIT_WHILE_DEGRADED`,
  /** Class: SchemaFormError; when: whole-schema compilation fails on the first validation request. */
  ValidatorCompileFailed: `${FormErrorGroup.SchemaForm}.VALIDATOR_COMPILE_FAILED`,
  /** Class: SchemaFormError; when: a compiled validator throws during validation. */
  ValidatorThrew: `${FormErrorGroup.SchemaForm}.VALIDATOR_THREW`,
  /** Class: SchemaFormError; when: an injected renderer or root render throws. */
  RenderFailed: `${FormErrorGroup.SchemaForm}.RENDER_FAILED`,
  /** Class: SchemaFormError; when: a virtual node receives values with the wrong shape. */
  InvalidVirtualNodeValues: `${FormErrorGroup.SchemaForm}.INVALID_VIRTUAL_NODE_VALUES`,
  /** Class: SchemaFormError; when: an array-only command is called on another node kind. */
  ArrayMethodOnNonArray: `${FormErrorGroup.SchemaForm}.ARRAY_METHOD_ON_NON_ARRAY`,
  /** Class: JSONSchemaError; when: schema analysis finds an unbounded recursive shape. */
  RecursiveShapeUnbounded: `${FormErrorGroup.JsonSchema}.RECURSIVE_SHAPE_UNBOUNDED`,
  /** Class: SchemaFormError; when: recursive shape expansion exceeds the settlement budget. */
  RecursiveShapeDiverged: `${FormErrorGroup.SchemaForm}.RECURSIVE_SHAPE_DIVERGED`,
  /** Class: JSONSchemaError; when: declarations disagree on virtual fields. */
  VirtualFieldsMismatch: `${FormErrorGroup.JsonSchema}.VIRTUAL_FIELDS_MISMATCH`,
  /** Class: JSONSchemaError; when: a declared child name is absent from the schema. */
  ChildrenTargetNotFound: `${FormErrorGroup.JsonSchema}.CHILDREN_TARGET_NOT_FOUND`,
  /** Class: JSONSchemaError; when: a single-row kind declares a different terminal option. */
  TerminalOptionUnsupported: `${FormErrorGroup.JsonSchema}.TERMINAL_OPTION_UNSUPPORTED`,
  /** Class: UnhandledError; when: a plugin refuses a bound validator instance outside a form. */
  ValidatorBindRefused: `${FormErrorGroup.Unhandled}.VALIDATOR_BIND_REFUSED`,
  /** Class: JSONSchemaError; when: a known controls, options, or child controls key has the wrong shape. */
  InvalidControlShape: `${FormErrorGroup.JsonSchema}.INVALID_CONTROL_SHAPE`,
  /** Class: ValidationError; when: schema validation rejects a submission. */
  SchemaValidationFailed: `${FormErrorGroup.Validation}.SCHEMA_VALIDATION_FAILED`,
} as const;

/** Closed union of the error code values. */
export type FormErrorCode = (typeof FormErrorCode)[keyof typeof FormErrorCode];

/** Internal JsonSchema codes derived from the canonical ledger table. */
export const JSONSchemaErrorCodes = filterCodeGroup(
  FormErrorCode,
  FormErrorGroup.JsonSchema,
);

/** Internal SchemaForm codes derived from the canonical ledger table. */
export const SchemaFormErrorCodes = filterCodeGroup(
  FormErrorCode,
  FormErrorGroup.SchemaForm,
);

/** Internal Unhandled codes derived from the canonical ledger table. */
export const UnhandledErrorCodes = filterCodeGroup(
  FormErrorCode,
  FormErrorGroup.Unhandled,
);

/** Internal Validation codes derived from the canonical ledger table. */
export const ValidationErrorCodes = filterCodeGroup(
  FormErrorCode,
  FormErrorGroup.Validation,
);
