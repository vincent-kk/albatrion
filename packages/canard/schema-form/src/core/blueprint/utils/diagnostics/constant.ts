/** Canonical blueprint failures; provisional ledger names remain unchanged. */
export const BlueprintErrorCode = {
  UnknownJsonSchema: 'UNKNOWN_JSON_SCHEMA',
  UnexpectedArraySchema: 'UNEXPECTED_ARRAY_SCHEMA',
  AllOfTypeRedefinition: 'ALL_OF_TYPE_REDEFINITION',
  ConflictingConstValues: 'CONFLICTING_CONST_VALUES',
  InvalidRange: 'INVALID_RANGE',
  EmptyEnumIntersection: 'EMPTY_ENUM_INTERSECTION',
  VirtualFieldsNotValid: 'VIRTUAL_FIELDS_NOT_VALID',
  VirtualFieldsNotInProperties: 'VIRTUAL_FIELDS_NOT_IN_PROPERTIES',
  CreateDynamicFunction: 'CREATE_DYNAMIC_FUNCTION',
  ObservedValues: 'OBSERVED_VALUES',
  ConditionIndex: 'CONDITION_INDEX',
  ConditionIndices: 'CONDITION_INDICES',
  UnknownGroupKey: 'UNKNOWN_GROUP_KEY',
  DiscriminatorMismatch: 'DISCRIMINATOR_MISMATCH',
  SharedNodeKindConflict: 'SHARED_NODE_KIND_CONFLICT',
  TerminalStrategyMismatch: 'TERMINAL_STRATEGY_MISMATCH',
  RecursiveShapeUnbounded: 'RECURSIVE_SHAPE_UNBOUNDED',
  VirtualFieldsMismatch: 'VIRTUAL_FIELDS_MISMATCH',
  ChildrenTargetNotFound: 'CHILDREN_TARGET_NOT_FOUND',
  TerminalOptionUnsupported: 'TERMINAL_OPTION_UNSUPPORTED',
} as const;

/** Union of supported blueprint failure values. */
export type BlueprintErrorCode =
  (typeof BlueprintErrorCode)[keyof typeof BlueprintErrorCode];

/** Canonical analysis warnings collected only for an interested consumer. */
export const BlueprintWarningCode = {
  AllOfKeywordIgnoredForForm: 'ALL_OF_KEYWORD_IGNORED_FOR_FORM',
  NullBranchIgnoredForForm: 'NULL_BRANCH_IGNORED_FOR_FORM',
  IfWithoutElseFalse: 'IF_WITHOUT_ELSE_FALSE',
  LockOnNonTerminalObject: 'LOCK_ON_NON_TERMINAL_OBJECT',
  DependentSchemasIgnoredForForm: 'DEPENDENT_SCHEMAS_IGNORED_FOR_FORM',
  TerminalSubtreeKeyIgnoredForForm: 'TERMINAL_SUBTREE_KEY_IGNORED_FOR_FORM',
  DiscriminatorBranchUnreachable: 'DISCRIMINATOR_BRANCH_UNREACHABLE',
} as const;

/** Union of supported blueprint warning values. */
export type BlueprintWarningCode =
  (typeof BlueprintWarningCode)[keyof typeof BlueprintWarningCode];
