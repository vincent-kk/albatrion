import type { FieldNodeRuntime } from '../../../record';

/** Explicit runtime store views retain the value types owned by record. */
export interface RuntimePathStores<Self> {
  /** Indexed latentRaw runtime field. */
  latent: NonNullable<FieldNodeRuntime<Self>['latentRaw']>;
  /** Indexed latentRawMetadata runtime field. */
  metadata: NonNullable<FieldNodeRuntime<Self>['latentRawMetadata']>;
  /** Indexed committedDeclarationIds runtime field. */
  declarations: NonNullable<FieldNodeRuntime<Self>['committedDeclarationIds']>;
  /** Indexed committedRuleValues runtime field. */
  rules: NonNullable<FieldNodeRuntime<Self>['committedRuleValues']>;
  /** Indexed typeMismatchPaths runtime field. */
  mismatches: NonNullable<FieldNodeRuntime<Self>['typeMismatchPaths']>;
  /** Indexed typeMismatchesMemo runtime field. */
  mismatchMemo: NonNullable<FieldNodeRuntime<Self>['typeMismatchesMemo']>;
  /** Indexed inactiveValuesMemo runtime field. */
  inactiveMemo: NonNullable<FieldNodeRuntime<Self>['inactiveValuesMemo']>;
  /** Indexed inactiveValueEntries runtime field. */
  inactiveEntries: NonNullable<FieldNodeRuntime<Self>['inactiveValueEntries']>;
}
