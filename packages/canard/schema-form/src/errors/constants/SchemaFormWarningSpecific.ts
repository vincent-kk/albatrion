/** Internal bare specifics for the SchemaFormWarning group, in public contract order. */
export const SchemaFormWarningSpecific = {
  AllOfKeywordIgnoredForForm: 'ALL_OF_KEYWORD_IGNORED_FOR_FORM',
  NullBranchIgnoredForForm: 'NULL_BRANCH_IGNORED_FOR_FORM',
  VirtualizationDisabledForForm: 'VIRTUALIZATION_DISABLED_FOR_FORM',
  IfWithoutElseFalse: 'IF_WITHOUT_ELSE_FALSE',
  LockOnNonTerminalObject: 'LOCK_ON_NON_TERMINAL_OBJECT',
  ConditionalSchemaWithoutValidator: 'CONDITIONAL_SCHEMA_WITHOUT_VALIDATOR',
  ValidatorMissing: 'VALIDATOR_MISSING',
  MultipleGatedBranchesActive: 'MULTIPLE_GATED_BRANCHES_ACTIVE',
  ResetRebuiltByReference: 'RESET_REBUILT_BY_REFERENCE',
  DependentSchemasIgnoredForForm: 'DEPENDENT_SCHEMAS_IGNORED_FOR_FORM',
  ChildNodeComponentsOnTerminal: 'CHILD_NODE_COMPONENTS_ON_TERMINAL',
  TerminalSubtreeKeyIgnoredForForm: 'TERMINAL_SUBTREE_KEY_IGNORED_FOR_FORM',
  DiscriminatorBranchUnreachable: 'DISCRIMINATOR_BRANCH_UNREACHABLE',
  NonJsonWholeValue: 'NON_JSON_WHOLE_VALUE',
  FieldInputTestInvalid: 'FIELD_INPUT_TEST_INVALID',
  Misfit: 'MISFIT',
  DialectMismatch: 'DIALECT_MISMATCH',
  DetachedNodeWrite: 'DETACHED_NODE_WRITE',
  /** A retained-value declaration conflicts with literal exit clearing. */
  InactiveValueWithUnsetOnInactive: 'INACTIVE_VALUE_WITH_UNSET_ON_INACTIVE',
  /** A synchronous exit resolver attempts to write to its resolving tree. */
  WriteInInactiveResolver: 'WRITE_IN_INACTIVE_RESOLVER',
  /** A valid discriminator cannot select branches on this declaration. */
  DiscriminatorIgnoredForForm: 'DISCRIMINATOR_IGNORED_FOR_FORM',
  /** An `if` on a host whose allowed types do not include object is evaluated against `{}`; its then/else cannot read the host value. */
  IfOnNonObjectHost: 'IF_ON_NON_OBJECT_HOST',
} as const;
