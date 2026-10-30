import { FormErrorGroup } from './FormErrorGroup';
import { JSONSchemaErrorSpecific } from './JSONSchemaErrorSpecific';
import { SchemaFormErrorSpecific } from './SchemaFormErrorSpecific';
import { UnhandledErrorSpecific } from './UnhandledErrorSpecific';
import { ValidationErrorSpecific } from './ValidationErrorSpecific';
import { assembleCodeGroup } from '../utils/assembleCodeGroup';

/**
 * Every error code the package raises, in ledger order (ERROR-164 and its supplements).
 * Keys are the bare code in PascalCase; values are the group-qualified strings errors and records carry.
 */
export const FormErrorCode = {
  /** Class: JSONSchemaError; when: schema analysis cannot determine a supported shape. */
  UnknownJsonSchema: `${FormErrorGroup.JsonSchema}.${JSONSchemaErrorSpecific.UnknownJsonSchema}`,
  /** Class: JSONSchemaError; when: schema analysis finds an invalid array declaration. */
  UnexpectedArraySchema: `${FormErrorGroup.JsonSchema}.${JSONSchemaErrorSpecific.UnexpectedArraySchema}`,
  /** Class: JSONSchemaError; when: static allOf types have an empty intersection. */
  AllOfTypeRedefinition: `${FormErrorGroup.JsonSchema}.${JSONSchemaErrorSpecific.AllOfTypeRedefinition}`,
  /** Class: JSONSchemaError; when: static allOf constants conflict. */
  ConflictingConstValues: `${FormErrorGroup.JsonSchema}.${JSONSchemaErrorSpecific.ConflictingConstValues}`,
  /** Class: JSONSchemaError; when: static allOf range intersection is empty. */
  InvalidRange: `${FormErrorGroup.JsonSchema}.${JSONSchemaErrorSpecific.InvalidRange}`,
  /** Class: JSONSchemaError; when: static allOf enum intersection is empty. */
  EmptyEnumIntersection: `${FormErrorGroup.JsonSchema}.${JSONSchemaErrorSpecific.EmptyEnumIntersection}`,
  /** Class: JSONSchemaError; when: virtual field references are invalid. */
  VirtualFieldsNotValid: `${FormErrorGroup.JsonSchema}.${JSONSchemaErrorSpecific.VirtualFieldsNotValid}`,
  /** Class: JSONSchemaError; when: virtual fields are absent from declared properties. */
  VirtualFieldsNotInProperties: `${FormErrorGroup.JsonSchema}.${JSONSchemaErrorSpecific.VirtualFieldsNotInProperties}`,
  /** Class: JSONSchemaError; when: a controls expression cannot be compiled. */
  CreateDynamicFunction: `${FormErrorGroup.JsonSchema}.${JSONSchemaErrorSpecific.CreateDynamicFunction}`,
  /** Class: JSONSchemaError; when: observed-value expression analysis fails. */
  ObservedValues: `${FormErrorGroup.JsonSchema}.${JSONSchemaErrorSpecific.ObservedValues}`,
  /** Class: JSONSchemaError; when: a controls, options, or child controls key is outside its closed list. */
  UnknownGroupKey: `${FormErrorGroup.JsonSchema}.${JSONSchemaErrorSpecific.UnknownGroupKey}`,
  /** Class: JSONSchemaError; when: a discriminator key or branch value is inconsistent. */
  DiscriminatorMismatch: `${FormErrorGroup.JsonSchema}.${JSONSchemaErrorSpecific.DiscriminatorMismatch}`,
  /** Class: JSONSchemaError; when: static and ungated branch node kinds conflict. */
  SharedNodeKindConflict: `${FormErrorGroup.JsonSchema}.${JSONSchemaErrorSpecific.SharedNodeKindConflict}`,
  /** Class: JSONSchemaError; when: declarations disagree on a node's terminal strategy. */
  TerminalStrategyMismatch: `${FormErrorGroup.JsonSchema}.${JSONSchemaErrorSpecific.TerminalStrategyMismatch}`,
  /** Class: SchemaFormError; when: active declarations cannot share one node kind. */
  SharedNodeConflict: `${FormErrorGroup.SchemaForm}.${SchemaFormErrorSpecific.SharedNodeConflict}`,
  /** Class: SchemaFormError; when: settlement exceeds its host, derive, or transition budget. */
  BudgetExceeded: `${FormErrorGroup.SchemaForm}.${SchemaFormErrorSpecific.BudgetExceeded}`,
  /** Class: SchemaFormError; when: an active controls expression throws during settlement. */
  ExpressionThrew: `${FormErrorGroup.SchemaForm}.${SchemaFormErrorSpecific.ExpressionThrew}`,
  /** Class: SchemaFormError; when: guard compilation or synchronous evaluation fails. */
  GuardFailed: `${FormErrorGroup.SchemaForm}.${SchemaFormErrorSpecific.GuardFailed}`,
  /** Class: SchemaFormError; when: a dynamic injection has no target. */
  InjectTargetMissing: `${FormErrorGroup.SchemaForm}.${SchemaFormErrorSpecific.InjectTargetMissing}`,
  /** Class: SchemaFormError; when: listener feedback or onChange nesting exceeds its budget. */
  FeedbackLimitExceeded: `${FormErrorGroup.SchemaForm}.${SchemaFormErrorSpecific.FeedbackLimitExceeded}`,
  /** Class: SchemaFormError; when: a subscriber or form callback throws. */
  ListenerThrew: `${FormErrorGroup.SchemaForm}.${SchemaFormErrorSpecific.ListenerThrew}`,
  /** Class: SchemaFormError; when: a dispatch chain or observer produces multiple errors. */
  MultipleErrors: `${FormErrorGroup.SchemaForm}.${SchemaFormErrorSpecific.MultipleErrors}`,
  /** Class: SchemaFormError; when: render input-map normalization fails. */
  FormTypeInputMap: `${FormErrorGroup.SchemaForm}.${SchemaFormErrorSpecific.FormTypeInputMap}`,
  /** Class: UnhandledError; when: global plugin registration fails outside a form instance. */
  RegisterPlugin: `${FormErrorGroup.Unhandled}.${UnhandledErrorSpecific.RegisterPlugin}`,
  /** Class: SchemaFormError; when: a public write combines incompatible options. */
  InvalidWriteOption: `${FormErrorGroup.SchemaForm}.${SchemaFormErrorSpecific.InvalidWriteOption}`,
  /** Class: SchemaFormError; when: a caller writes through a disposed node reference. */
  DisposedNodeWrite: `${FormErrorGroup.SchemaForm}.${SchemaFormErrorSpecific.DisposedNodeWrite}`,
  /** Class: SchemaFormError; when: onError tries to write to its own form. */
  WriteInObserver: `${FormErrorGroup.SchemaForm}.${SchemaFormErrorSpecific.WriteInObserver}`,
  /** Class: SchemaFormError; when: submission is attempted while diagnostics are degraded. */
  SubmitWhileDegraded: `${FormErrorGroup.SchemaForm}.${SchemaFormErrorSpecific.SubmitWhileDegraded}`,
  /** Class: SchemaFormError; when: whole-schema compilation fails on the first validation request. */
  ValidatorCompileFailed: `${FormErrorGroup.SchemaForm}.${SchemaFormErrorSpecific.ValidatorCompileFailed}`,
  /** Class: SchemaFormError; when: a compiled validator throws during validation. */
  ValidatorThrew: `${FormErrorGroup.SchemaForm}.${SchemaFormErrorSpecific.ValidatorThrew}`,
  /** Class: SchemaFormError; when: an injected renderer or root render throws. */
  RenderFailed: `${FormErrorGroup.SchemaForm}.${SchemaFormErrorSpecific.RenderFailed}`,
  /** Class: SchemaFormError; when: a virtual node receives values with the wrong shape. */
  InvalidVirtualNodeValues: `${FormErrorGroup.SchemaForm}.${SchemaFormErrorSpecific.InvalidVirtualNodeValues}`,
  /** Class: SchemaFormError; when: an array-only command is called on another node kind. */
  ArrayMethodOnNonArray: `${FormErrorGroup.SchemaForm}.${SchemaFormErrorSpecific.ArrayMethodOnNonArray}`,
  /** Class: JSONSchemaError; when: schema analysis finds an unbounded recursive shape. */
  RecursiveShapeUnbounded: `${FormErrorGroup.JsonSchema}.${JSONSchemaErrorSpecific.RecursiveShapeUnbounded}`,
  /** Class: SchemaFormError; when: recursive shape expansion exceeds the settlement budget. */
  RecursiveShapeDiverged: `${FormErrorGroup.SchemaForm}.${SchemaFormErrorSpecific.RecursiveShapeDiverged}`,
  /** Class: JSONSchemaError; when: declarations disagree on virtual fields. */
  VirtualFieldsMismatch: `${FormErrorGroup.JsonSchema}.${JSONSchemaErrorSpecific.VirtualFieldsMismatch}`,
  /** Class: JSONSchemaError; when: a declared child name is absent from the schema. */
  ChildrenTargetNotFound: `${FormErrorGroup.JsonSchema}.${JSONSchemaErrorSpecific.ChildrenTargetNotFound}`,
  /** Class: JSONSchemaError; when: a single-row kind declares a different terminal option. */
  TerminalOptionUnsupported: `${FormErrorGroup.JsonSchema}.${JSONSchemaErrorSpecific.TerminalOptionUnsupported}`,
  /** Class: UnhandledError; when: a plugin refuses a bound validator instance outside a form. */
  ValidatorBindRefused: `${FormErrorGroup.Unhandled}.${UnhandledErrorSpecific.ValidatorBindRefused}`,
  /** Class: JSONSchemaError; when: a known controls, options, or child controls key has the wrong shape. */
  InvalidControlShape: `${FormErrorGroup.JsonSchema}.${JSONSchemaErrorSpecific.InvalidControlShape}`,
  /** Class: ValidationError; when: schema validation rejects a submission. */
  SchemaValidationFailed: `${FormErrorGroup.Validation}.${ValidationErrorSpecific.SchemaValidationFailed}`,
  /** Class: JSONSchemaError; when: a property name is exactly `%2A`, `%2E`, `%2E%2E`, or `%40` and cannot round-trip through a form pointer. */
  ReservedPropertyName: `${FormErrorGroup.JsonSchema}.${JSONSchemaErrorSpecific.ReservedPropertyName}`,
} as const;

/** Closed union of the error code values. */
export type FormErrorCode = (typeof FormErrorCode)[keyof typeof FormErrorCode];

/** Internal JsonSchema codes assembled from its specific table. */
export const JSONSchemaErrorCodes = assembleCodeGroup(
  FormErrorGroup.JsonSchema,
  JSONSchemaErrorSpecific,
);

/** Internal SchemaForm codes assembled from its specific table. */
export const SchemaFormErrorCodes = assembleCodeGroup(
  FormErrorGroup.SchemaForm,
  SchemaFormErrorSpecific,
);

/** Internal Unhandled codes assembled from its specific table. */
export const UnhandledErrorCodes = assembleCodeGroup(
  FormErrorGroup.Unhandled,
  UnhandledErrorSpecific,
);

/** Internal Validation codes assembled from its specific table. */
export const ValidationErrorCodes = assembleCodeGroup(
  FormErrorGroup.Validation,
  ValidationErrorSpecific,
);
