import type { FieldNodeRuntime } from '../../record';

/** Explicit runtime store views retain the value types owned by record. */
export interface RuntimePathStores<Self> {
  /** Indexed committedDeclarationIds runtime field. */
  declarations: NonNullable<FieldNodeRuntime<Self>['committedDeclarationIds']>;
  /** Indexed committedRuleValues runtime field. */
  rules: NonNullable<FieldNodeRuntime<Self>['committedRuleValues']>;
  /** Indexed misfitPaths runtime field. */
  misfits: NonNullable<FieldNodeRuntime<Self>['misfitPaths']>;
  /** Indexed misfitsMemo runtime field. */
  misfitsMemo: NonNullable<FieldNodeRuntime<Self>['misfitsMemo']>;
}
