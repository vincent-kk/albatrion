import { assembleCodeGroup } from '../utils/assembleCodeGroup';
import { FormWarningGroup } from './FormWarningGroup';
import { SchemaFormWarningSpecific } from './SchemaFormWarningSpecific';

/**
 * Every warning code the package reports, in ledger order (ERROR-164 and its supplements).
 * Keys are the bare code in PascalCase; values are the group-qualified strings errors and records carry.
 */
export const FormWarningCode = {
  /** Class: warning record; when: schema analysis ignores an allOf keyword for rendering. */
  AllOfKeywordIgnoredForForm: `${FormWarningGroup.SchemaForm}.${SchemaFormWarningSpecific.AllOfKeywordIgnoredForForm}`,
  /** Class: warning record; when: schema analysis ignores a null branch for rendering. */
  NullBranchIgnoredForForm: `${FormWarningGroup.SchemaForm}.${SchemaFormWarningSpecific.NullBranchIgnoredForForm}`,
  /** Class: warning record; when: render virtualization lacks IntersectionObserver. */
  VirtualizationDisabledForForm: `${FormWarningGroup.SchemaForm}.${SchemaFormWarningSpecific.VirtualizationDisabledForForm}`,
  /** Class: warning record; when: a conditional branch has if without else false. */
  IfWithoutElseFalse: `${FormWarningGroup.SchemaForm}.${SchemaFormWarningSpecific.IfWithoutElseFalse}`,
  /** Class: warning record; when: a nonterminal object declares a lock. */
  LockOnNonTerminalObject: `${FormWarningGroup.SchemaForm}.${SchemaFormWarningSpecific.LockOnNonTerminalObject}`,
  /** Class: warning record; when: an if gate exists without a validator. */
  ConditionalSchemaWithoutValidator: `${FormWarningGroup.SchemaForm}.${SchemaFormWarningSpecific.ConditionalSchemaWithoutValidator}`,
  /** Class: warning record; when: a tree requests validation but no validator is selected. */
  ValidatorMissing: `${FormWarningGroup.SchemaForm}.${SchemaFormWarningSpecific.ValidatorMissing}`,
  /** Class: warning record; when: multiple gated oneOf branches become active. */
  MultipleGatedBranchesActive: `${FormWarningGroup.SchemaForm}.${SchemaFormWarningSpecific.MultipleGatedBranchesActive}`,
  /** Class: warning record; when: a reset rebuilds a tree because the schema reference changes. */
  ResetRebuiltByReference: `${FormWarningGroup.SchemaForm}.${SchemaFormWarningSpecific.ResetRebuiltByReference}`,
  /** Class: warning record; when: dependentSchemas is unsupported for form shape. */
  DependentSchemasIgnoredForForm: `${FormWarningGroup.SchemaForm}.${SchemaFormWarningSpecific.DependentSchemasIgnoredForForm}`,
  /** Class: warning record; when: a terminal input reads empty child-node components. */
  ChildNodeComponentsOnTerminal: `${FormWarningGroup.SchemaForm}.${SchemaFormWarningSpecific.ChildNodeComponentsOnTerminal}`,
  /** Class: warning record; when: a terminal subtree declares a reserved key ignored by the form. */
  TerminalSubtreeKeyIgnoredForForm: `${FormWarningGroup.SchemaForm}.${SchemaFormWarningSpecific.TerminalSubtreeKeyIgnoredForForm}`,
  /** Class: warning record; when: a branch discriminator literal is outside the allowed list. */
  DiscriminatorBranchUnreachable: `${FormWarningGroup.SchemaForm}.${SchemaFormWarningSpecific.DiscriminatorBranchUnreachable}`,
  /** Class: warning record; when: a development-mode whole value is not JSON-compatible. */
  NonJsonWholeValue: `${FormWarningGroup.SchemaForm}.${SchemaFormWarningSpecific.NonJsonWholeValue}`,
  /** Class: warning record; when: an input definition test object has an unknown key. */
  FormTypeTestInvalid: `${FormWarningGroup.SchemaForm}.${SchemaFormWarningSpecific.FormTypeTestInvalid}`,
  /** Class: warning record; when: a value cannot be converted to the active type unambiguously. */
  Misfit: `${FormWarningGroup.SchemaForm}.${SchemaFormWarningSpecific.Misfit}`,
  /** Class: warning record; when: a schema dialect differs from the selected validator dialect. */
  DialectMismatch: `${FormWarningGroup.SchemaForm}.${SchemaFormWarningSpecific.DialectMismatch}`,
  /** Raised when a write is attempted through a detached node reference; the write has no effect. */
  DetachedNodeWrite: `${FormWarningGroup.SchemaForm}.${SchemaFormWarningSpecific.DetachedNodeWrite}`,
} as const;

/** Closed union of the warning code values. */
export type FormWarningCode =
  (typeof FormWarningCode)[keyof typeof FormWarningCode];

/** Internal SchemaForm codes assembled from its specific table. */
export const SchemaFormWarningCodes = assembleCodeGroup(
  FormWarningGroup.SchemaForm,
  SchemaFormWarningSpecific,
);
