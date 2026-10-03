/** Level: error; class: JSONSchemaError; when: schema analysis cannot determine a supported shape. */
export const UNKNOWN_JSON_SCHEMA = 'UNKNOWN_JSON_SCHEMA';

/** Level: error; class: JSONSchemaError; when: schema analysis finds an invalid array declaration. */
export const UNEXPECTED_ARRAY_SCHEMA = 'UNEXPECTED_ARRAY_SCHEMA';

/** Level: error; class: JSONSchemaError; when: static allOf types have an empty intersection. */
export const ALL_OF_TYPE_REDEFINITION = 'ALL_OF_TYPE_REDEFINITION';

/** Level: error; class: JSONSchemaError; when: static allOf constants conflict. */
export const CONFLICTING_CONST_VALUES = 'CONFLICTING_CONST_VALUES';

/** Level: error; class: JSONSchemaError; when: static allOf range intersection is empty. */
export const INVALID_RANGE = 'INVALID_RANGE';

/** Level: error; class: JSONSchemaError; when: static allOf enum intersection is empty. */
export const EMPTY_ENUM_INTERSECTION = 'EMPTY_ENUM_INTERSECTION';

/** Level: error; class: JSONSchemaError; when: virtual field references are invalid. */
export const VIRTUAL_FIELDS_NOT_VALID = 'VIRTUAL_FIELDS_NOT_VALID';

/** Level: error; class: JSONSchemaError; when: virtual fields are absent from declared properties. */
export const VIRTUAL_FIELDS_NOT_IN_PROPERTIES = 'VIRTUAL_FIELDS_NOT_IN_PROPERTIES';

/** Level: error; class: JSONSchemaError; when: a controls expression cannot be compiled. */
export const CREATE_DYNAMIC_FUNCTION = 'CREATE_DYNAMIC_FUNCTION';

/** Level: error; class: JSONSchemaError; when: observed-value expression analysis fails. */
export const OBSERVED_VALUES = 'OBSERVED_VALUES';

/** Level: error; class: JSONSchemaError; when: a condition index cannot be compiled. */
export const CONDITION_INDEX = 'CONDITION_INDEX';

/** Level: error; class: JSONSchemaError; when: condition indices cannot be compiled. */
export const CONDITION_INDICES = 'CONDITION_INDICES';

/** Level: error; class: JSONSchemaError; when: a controls, options, or child controls key is outside its closed list. */
export const UNKNOWN_GROUP_KEY = 'UNKNOWN_GROUP_KEY';

/** Level: error; class: JSONSchemaError; when: a discriminator key or branch value is inconsistent. */
export const DISCRIMINATOR_MISMATCH = 'DISCRIMINATOR_MISMATCH';

/** Level: error; class: JSONSchemaError; when: static and ungated branch node kinds conflict. */
export const SHARED_NODE_KIND_CONFLICT = 'SHARED_NODE_KIND_CONFLICT';

/** Level: error; class: JSONSchemaError; when: declarations disagree on a node's terminal strategy. */
export const TERMINAL_STRATEGY_MISMATCH = 'TERMINAL_STRATEGY_MISMATCH';

/** Level: error; class: SchemaFormError; when: active declarations cannot share one node kind. */
export const SHARED_NODE_CONFLICT = 'SHARED_NODE_CONFLICT';

/** Level: error; class: SchemaFormError; when: settlement exceeds its host, derive, or transition budget. */
export const BUDGET_EXCEEDED = 'BUDGET_EXCEEDED';

/** Level: error; class: SchemaFormError; when: an active controls expression throws during settlement. */
export const EXPRESSION_THREW = 'EXPRESSION_THREW';

/** Level: error; class: SchemaFormError; when: guard compilation or synchronous evaluation fails. */
export const GUARD_FAILED = 'GUARD_FAILED';

/** Level: error; class: SchemaFormError; when: a dynamic injection has no target. */
export const INJECT_TARGET_MISSING = 'INJECT_TARGET_MISSING';

/** Level: error; class: SchemaFormError; when: listener feedback or onChange nesting exceeds its budget. */
export const FEEDBACK_LIMIT_EXCEEDED = 'FEEDBACK_LIMIT_EXCEEDED';

/** Level: error; class: SchemaFormError; when: a subscriber or form callback throws. */
export const LISTENER_THREW = 'LISTENER_THREW';

/** Level: error; class: SchemaFormError; when: a dispatch chain or observer produces multiple errors. */
export const MULTIPLE_ERRORS = 'MULTIPLE_ERRORS';

/** Level: error; class: SchemaFormError; when: render input-map normalization fails. */
export const FORM_TYPE_INPUT_MAP = 'FORM_TYPE_INPUT_MAP';

/** Level: error; class: UnhandledError; when: global plugin registration fails outside a form instance. */
export const REGISTER_PLUGIN = 'REGISTER_PLUGIN';

/** Level: error; class: SchemaFormError; when: a public write combines incompatible options. */
export const INVALID_WRITE_OPTION = 'INVALID_WRITE_OPTION';

/** Level: error; class: SchemaFormError; when: a caller writes through a disposed node reference. */
export const DISPOSED_NODE_WRITE = 'DISPOSED_NODE_WRITE';

/** Level: error; class: SchemaFormError; when: onError tries to write to its own form. */
export const WRITE_IN_OBSERVER = 'WRITE_IN_OBSERVER';

/** Level: error; class: SchemaFormError; when: submission is attempted while diagnostics are degraded. */
export const SUBMIT_WHILE_DEGRADED = 'SUBMIT_WHILE_DEGRADED';

/** Level: error; class: SchemaFormError; when: whole-schema compilation fails on the first validation request. */
export const VALIDATOR_COMPILE_FAILED = 'VALIDATOR_COMPILE_FAILED';

/** Level: error; class: SchemaFormError; when: a compiled validator throws during validation. */
export const VALIDATOR_THREW = 'VALIDATOR_THREW';

/** Level: error; class: SchemaFormError; when: an injected renderer or root render throws. */
export const RENDER_FAILED = 'RENDER_FAILED';

/** Level: warning; class: warning record; when: schema analysis ignores an allOf keyword for rendering. */
export const ALL_OF_KEYWORD_IGNORED_FOR_FORM = 'ALL_OF_KEYWORD_IGNORED_FOR_FORM';

/** Level: warning; class: warning record; when: schema analysis ignores a null branch for rendering. */
export const NULL_BRANCH_IGNORED_FOR_FORM = 'NULL_BRANCH_IGNORED_FOR_FORM';

/** Level: warning; class: warning record; when: render virtualization lacks IntersectionObserver. */
export const VIRTUALIZATION_DISABLED_FOR_FORM = 'VIRTUALIZATION_DISABLED_FOR_FORM';

/** Level: warning; class: warning record; when: a conditional branch has if without else false. */
export const IF_WITHOUT_ELSE_FALSE = 'IF_WITHOUT_ELSE_FALSE';

/** Level: warning; class: warning record; when: a nonterminal object declares a lock. */
export const LOCK_ON_NON_TERMINAL_OBJECT = 'LOCK_ON_NON_TERMINAL_OBJECT';

/** Level: warning; class: warning record; when: an if gate exists without a validator. */
export const CONDITIONAL_SCHEMA_WITHOUT_VALIDATOR = 'CONDITIONAL_SCHEMA_WITHOUT_VALIDATOR';

/** Level: warning; class: warning record; when: a tree requests validation but no validator is selected. */
export const VALIDATOR_MISSING = 'VALIDATOR_MISSING';

/** Level: warning; class: warning record; when: multiple gated oneOf branches become active. */
export const MULTIPLE_GATED_BRANCHES_ACTIVE = 'MULTIPLE_GATED_BRANCHES_ACTIVE';

/** Level: warning; class: warning record; when: a presentation key resembles a controls or options key. */
export const PRESENTATION_KEY_SUSPECT = 'PRESENTATION_KEY_SUSPECT';

/** Level: error; class: SchemaFormError; when: a virtual node receives values with the wrong shape. */
export const INVALID_VIRTUAL_NODE_VALUES = 'INVALID_VIRTUAL_NODE_VALUES';

/** Level: warning; class: warning record; when: a reset rebuilds a tree because the schema reference changes. */
export const RESET_REBUILT_BY_REFERENCE = 'RESET_REBUILT_BY_REFERENCE';

/** Level: error; class: SchemaFormError; when: an array-only command is called on another node kind. */
export const ARRAY_METHOD_ON_NON_ARRAY = 'ARRAY_METHOD_ON_NON_ARRAY';

/** Level: error; class: JSONSchemaError; when: schema analysis finds an unbounded recursive shape. */
export const RECURSIVE_SHAPE_UNBOUNDED = 'RECURSIVE_SHAPE_UNBOUNDED';

/** Level: error; class: SchemaFormError; when: recursive shape expansion exceeds the settlement budget. */
export const RECURSIVE_SHAPE_DIVERGED = 'RECURSIVE_SHAPE_DIVERGED';

/** Level: warning; class: warning record; when: dependentSchemas is unsupported for form shape. */
export const DEPENDENT_SCHEMAS_IGNORED_FOR_FORM = 'DEPENDENT_SCHEMAS_IGNORED_FOR_FORM';

/** Level: error; class: JSONSchemaError; when: declarations disagree on virtual fields. */
export const VIRTUAL_FIELDS_MISMATCH = 'VIRTUAL_FIELDS_MISMATCH';

/** Level: error; class: JSONSchemaError; when: a declared child name is absent from the schema. */
export const CHILDREN_TARGET_NOT_FOUND = 'CHILDREN_TARGET_NOT_FOUND';

/** Level: error; class: JSONSchemaError; when: a single-row kind declares a different terminal option. */
export const TERMINAL_OPTION_UNSUPPORTED = 'TERMINAL_OPTION_UNSUPPORTED';

/** Level: warning; class: warning record; when: a terminal input reads empty child-node components. */
export const CHILD_NODE_COMPONENTS_ON_TERMINAL = 'CHILD_NODE_COMPONENTS_ON_TERMINAL';

/** Level: warning; class: warning record; when: a terminal subtree declares a reserved key ignored by the form. */
export const TERMINAL_SUBTREE_KEY_IGNORED_FOR_FORM = 'TERMINAL_SUBTREE_KEY_IGNORED_FOR_FORM';

/** Level: warning; class: warning record; when: a branch discriminator literal is outside the allowed list. */
export const DISCRIMINATOR_BRANCH_UNREACHABLE = 'DISCRIMINATOR_BRANCH_UNREACHABLE';

/** Level: warning; class: warning record; when: a development-mode whole value is not JSON-compatible. */
export const NON_JSON_WHOLE_VALUE = 'NON_JSON_WHOLE_VALUE';

/** Level: warning; class: warning record; when: an input definition test object has an unknown key. */
export const FORM_TYPE_TEST_INVALID = 'FORM_TYPE_TEST_INVALID';

/** Level: error; class: UnhandledError; when: a plugin refuses a bound validator instance outside a form. */
export const VALIDATOR_BIND_REFUSED = 'VALIDATOR_BIND_REFUSED';

/** Level: warning; class: warning record; when: a value cannot be converted to the active type unambiguously. */
export const TYPE_MISMATCH = 'TYPE_MISMATCH';

/** Level: error; class: JSONSchemaError; when: a known controls, options, or child controls key has the wrong shape. */
export const INVALID_CONTROL_SHAPE = 'INVALID_CONTROL_SHAPE';

/** Level: warning; class: warning record; when: a schema dialect differs from the selected validator dialect. */
export const DIALECT_MISMATCH = 'DIALECT_MISMATCH';

/** Live ERROR-164 codes and subsequent ledger additions in ledger order. */
export const FORM_ERROR_CODE_TABLE = [
  [`JSON_SCHEMA_ERROR.${UNKNOWN_JSON_SCHEMA}`, 'error'],
  [`JSON_SCHEMA_ERROR.${UNEXPECTED_ARRAY_SCHEMA}`, 'error'],
  [`JSON_SCHEMA_ERROR.${ALL_OF_TYPE_REDEFINITION}`, 'error'],
  [`JSON_SCHEMA_ERROR.${CONFLICTING_CONST_VALUES}`, 'error'],
  [`JSON_SCHEMA_ERROR.${INVALID_RANGE}`, 'error'],
  [`JSON_SCHEMA_ERROR.${EMPTY_ENUM_INTERSECTION}`, 'error'],
  [`JSON_SCHEMA_ERROR.${VIRTUAL_FIELDS_NOT_VALID}`, 'error'],
  [`JSON_SCHEMA_ERROR.${VIRTUAL_FIELDS_NOT_IN_PROPERTIES}`, 'error'],
  [`JSON_SCHEMA_ERROR.${CREATE_DYNAMIC_FUNCTION}`, 'error'],
  [`JSON_SCHEMA_ERROR.${OBSERVED_VALUES}`, 'error'],
  [`JSON_SCHEMA_ERROR.${CONDITION_INDEX}`, 'error'],
  [`JSON_SCHEMA_ERROR.${CONDITION_INDICES}`, 'error'],
  [`JSON_SCHEMA_ERROR.${UNKNOWN_GROUP_KEY}`, 'error'],
  [`JSON_SCHEMA_ERROR.${DISCRIMINATOR_MISMATCH}`, 'error'],
  [`JSON_SCHEMA_ERROR.${SHARED_NODE_KIND_CONFLICT}`, 'error'],
  [`JSON_SCHEMA_ERROR.${TERMINAL_STRATEGY_MISMATCH}`, 'error'],
  [`SCHEMA_FORM_ERROR.${SHARED_NODE_CONFLICT}`, 'error'],
  [`SCHEMA_FORM_ERROR.${BUDGET_EXCEEDED}`, 'error'],
  [`SCHEMA_FORM_ERROR.${EXPRESSION_THREW}`, 'error'],
  [`SCHEMA_FORM_ERROR.${GUARD_FAILED}`, 'error'],
  [`SCHEMA_FORM_ERROR.${INJECT_TARGET_MISSING}`, 'error'],
  [`SCHEMA_FORM_ERROR.${FEEDBACK_LIMIT_EXCEEDED}`, 'error'],
  [`SCHEMA_FORM_ERROR.${LISTENER_THREW}`, 'error'],
  [`SCHEMA_FORM_ERROR.${MULTIPLE_ERRORS}`, 'error'],
  [`SCHEMA_FORM_ERROR.${FORM_TYPE_INPUT_MAP}`, 'error'],
  [`UNHANDLED_ERROR.${REGISTER_PLUGIN}`, 'error'],
  [`SCHEMA_FORM_ERROR.${INVALID_WRITE_OPTION}`, 'error'],
  [`SCHEMA_FORM_ERROR.${DISPOSED_NODE_WRITE}`, 'error'],
  [`SCHEMA_FORM_ERROR.${WRITE_IN_OBSERVER}`, 'error'],
  [`SCHEMA_FORM_ERROR.${SUBMIT_WHILE_DEGRADED}`, 'error'],
  [`SCHEMA_FORM_ERROR.${VALIDATOR_COMPILE_FAILED}`, 'error'],
  [`SCHEMA_FORM_ERROR.${VALIDATOR_THREW}`, 'error'],
  [`SCHEMA_FORM_ERROR.${RENDER_FAILED}`, 'error'],
  [`SCHEMA_FORM_WARNING.${ALL_OF_KEYWORD_IGNORED_FOR_FORM}`, 'warning'],
  [`SCHEMA_FORM_WARNING.${NULL_BRANCH_IGNORED_FOR_FORM}`, 'warning'],
  [`SCHEMA_FORM_WARNING.${VIRTUALIZATION_DISABLED_FOR_FORM}`, 'warning'],
  [`SCHEMA_FORM_WARNING.${IF_WITHOUT_ELSE_FALSE}`, 'warning'],
  [`SCHEMA_FORM_WARNING.${LOCK_ON_NON_TERMINAL_OBJECT}`, 'warning'],
  [`SCHEMA_FORM_WARNING.${CONDITIONAL_SCHEMA_WITHOUT_VALIDATOR}`, 'warning'],
  [`SCHEMA_FORM_WARNING.${VALIDATOR_MISSING}`, 'warning'],
  [`SCHEMA_FORM_WARNING.${MULTIPLE_GATED_BRANCHES_ACTIVE}`, 'warning'],
  [`SCHEMA_FORM_WARNING.${PRESENTATION_KEY_SUSPECT}`, 'warning'],
  [`SCHEMA_FORM_ERROR.${INVALID_VIRTUAL_NODE_VALUES}`, 'error'],
  [`SCHEMA_FORM_WARNING.${RESET_REBUILT_BY_REFERENCE}`, 'warning'],
  [`SCHEMA_FORM_ERROR.${ARRAY_METHOD_ON_NON_ARRAY}`, 'error'],
  [`JSON_SCHEMA_ERROR.${RECURSIVE_SHAPE_UNBOUNDED}`, 'error'],
  [`SCHEMA_FORM_ERROR.${RECURSIVE_SHAPE_DIVERGED}`, 'error'],
  [`SCHEMA_FORM_WARNING.${DEPENDENT_SCHEMAS_IGNORED_FOR_FORM}`, 'warning'],
  [`JSON_SCHEMA_ERROR.${VIRTUAL_FIELDS_MISMATCH}`, 'error'],
  [`JSON_SCHEMA_ERROR.${CHILDREN_TARGET_NOT_FOUND}`, 'error'],
  [`JSON_SCHEMA_ERROR.${TERMINAL_OPTION_UNSUPPORTED}`, 'error'],
  [`SCHEMA_FORM_WARNING.${CHILD_NODE_COMPONENTS_ON_TERMINAL}`, 'warning'],
  [`SCHEMA_FORM_WARNING.${TERMINAL_SUBTREE_KEY_IGNORED_FOR_FORM}`, 'warning'],
  [`SCHEMA_FORM_WARNING.${DISCRIMINATOR_BRANCH_UNREACHABLE}`, 'warning'],
  [`SCHEMA_FORM_WARNING.${NON_JSON_WHOLE_VALUE}`, 'warning'],
  [`SCHEMA_FORM_WARNING.${FORM_TYPE_TEST_INVALID}`, 'warning'],
  [`UNHANDLED_ERROR.${VALIDATOR_BIND_REFUSED}`, 'error'],
  [`SCHEMA_FORM_WARNING.${TYPE_MISMATCH}`, 'warning'],
  [`JSON_SCHEMA_ERROR.${INVALID_CONTROL_SHAPE}`, 'error'],
  [`SCHEMA_FORM_WARNING.${DIALECT_MISMATCH}`, 'warning'],
] as const;
