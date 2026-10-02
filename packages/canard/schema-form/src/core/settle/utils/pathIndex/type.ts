import type { SchemaNodeRuntime } from '../../../record';

/** Explicit runtime store views retain the value types owned by record. */
export interface RuntimePathStores<Self> {
  /** Indexed latentRaw runtime field. */
  latent: NonNullable<SchemaNodeRuntime<Self>['latentRaw']>;
  /** Indexed latentRawMetadata runtime field. */
  metadata: NonNullable<SchemaNodeRuntime<Self>['latentRawMetadata']>;
  /** Indexed committedDeclarationIds runtime field. */
  declarations: NonNullable<SchemaNodeRuntime<Self>['committedDeclarationIds']>;
  /** Indexed committedRuleValues runtime field. */
  rules: NonNullable<SchemaNodeRuntime<Self>['committedRuleValues']>;
  /** Indexed typeMismatchPaths runtime field. */
  mismatches: NonNullable<SchemaNodeRuntime<Self>['typeMismatchPaths']>;
  /** Indexed typeMismatchesMemo runtime field. */
  mismatchMemo: NonNullable<SchemaNodeRuntime<Self>['typeMismatchesMemo']>;
  /** Indexed inactiveValuesMemo runtime field. */
  inactiveMemo: NonNullable<SchemaNodeRuntime<Self>['inactiveValuesMemo']>;
  /** Indexed inactiveValueEntries runtime field. */
  inactiveEntries: NonNullable<SchemaNodeRuntime<Self>['inactiveValueEntries']>;
}
