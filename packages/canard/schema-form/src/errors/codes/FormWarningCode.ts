/**
 * Every warning code the package reports, in ledger order (ERROR-164 and its supplements).
 * Keys are the bare code in PascalCase; values are the group-qualified strings errors and records carry.
 */
export const FormWarningCode = {
  /** Class: warning record; when: schema analysis ignores an allOf keyword for rendering. */
  AllOfKeywordIgnoredForForm:
    'SCHEMA_FORM_WARNING.ALL_OF_KEYWORD_IGNORED_FOR_FORM',
  /** Class: warning record; when: schema analysis ignores a null branch for rendering. */
  NullBranchIgnoredForForm: 'SCHEMA_FORM_WARNING.NULL_BRANCH_IGNORED_FOR_FORM',
  /** Class: warning record; when: render virtualization lacks IntersectionObserver. */
  VirtualizationDisabledForForm:
    'SCHEMA_FORM_WARNING.VIRTUALIZATION_DISABLED_FOR_FORM',
  /** Class: warning record; when: a conditional branch has if without else false. */
  IfWithoutElseFalse: 'SCHEMA_FORM_WARNING.IF_WITHOUT_ELSE_FALSE',
  /** Class: warning record; when: a nonterminal object declares a lock. */
  LockOnNonTerminalObject: 'SCHEMA_FORM_WARNING.LOCK_ON_NON_TERMINAL_OBJECT',
  /** Class: warning record; when: an if gate exists without a validator. */
  ConditionalSchemaWithoutValidator:
    'SCHEMA_FORM_WARNING.CONDITIONAL_SCHEMA_WITHOUT_VALIDATOR',
  /** Class: warning record; when: a tree requests validation but no validator is selected. */
  ValidatorMissing: 'SCHEMA_FORM_WARNING.VALIDATOR_MISSING',
  /** Class: warning record; when: multiple gated oneOf branches become active. */
  MultipleGatedBranchesActive:
    'SCHEMA_FORM_WARNING.MULTIPLE_GATED_BRANCHES_ACTIVE',
  /** Class: warning record; when: a reset rebuilds a tree because the schema reference changes. */
  ResetRebuiltByReference: 'SCHEMA_FORM_WARNING.RESET_REBUILT_BY_REFERENCE',
  /** Class: warning record; when: dependentSchemas is unsupported for form shape. */
  DependentSchemasIgnoredForForm:
    'SCHEMA_FORM_WARNING.DEPENDENT_SCHEMAS_IGNORED_FOR_FORM',
  /** Class: warning record; when: a terminal input reads empty child-node components. */
  ChildNodeComponentsOnTerminal:
    'SCHEMA_FORM_WARNING.CHILD_NODE_COMPONENTS_ON_TERMINAL',
  /** Class: warning record; when: a terminal subtree declares a reserved key ignored by the form. */
  TerminalSubtreeKeyIgnoredForForm:
    'SCHEMA_FORM_WARNING.TERMINAL_SUBTREE_KEY_IGNORED_FOR_FORM',
  /** Class: warning record; when: a branch discriminator literal is outside the allowed list. */
  DiscriminatorBranchUnreachable:
    'SCHEMA_FORM_WARNING.DISCRIMINATOR_BRANCH_UNREACHABLE',
  /** Class: warning record; when: a development-mode whole value is not JSON-compatible. */
  NonJsonWholeValue: 'SCHEMA_FORM_WARNING.NON_JSON_WHOLE_VALUE',
  /** Class: warning record; when: an input definition test object has an unknown key. */
  FormTypeTestInvalid: 'SCHEMA_FORM_WARNING.FORM_TYPE_TEST_INVALID',
  /** Class: warning record; when: a value cannot be converted to the active type unambiguously. */
  Misfit: 'SCHEMA_FORM_WARNING.MISFIT',
  /** Class: warning record; when: a schema dialect differs from the selected validator dialect. */
  DialectMismatch: 'SCHEMA_FORM_WARNING.DIALECT_MISMATCH',
} as const;

/** Closed union of the warning code values. */
export type FormWarningCode =
  (typeof FormWarningCode)[keyof typeof FormWarningCode];
