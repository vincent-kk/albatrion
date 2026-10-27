import type { FieldNodeRuntime } from '../../record';

/** Explicit runtime store views retain the value types owned by record. */
export interface RuntimePathStores<Self> {
  /** Indexed literalStarRaw runtime field. */
  latent?: NonNullable<FieldNodeRuntime<Self>['literalStarRaw']>;
  /** Indexed literalStarRawMetadata runtime field. */
  metadata?: NonNullable<FieldNodeRuntime<Self>['literalStarRawMetadata']>;
  /** Indexed committedDeclarationIds runtime field. */
  declarations: NonNullable<FieldNodeRuntime<Self>['committedDeclarationIds']>;
  /** Indexed committedRuleValues runtime field. */
  rules: NonNullable<FieldNodeRuntime<Self>['committedRuleValues']>;
  /** Indexed misfitPaths runtime field. */
  misfits: NonNullable<FieldNodeRuntime<Self>['misfitPaths']>;
  /** Indexed misfitsMemo runtime field. */
  misfitsMemo: NonNullable<FieldNodeRuntime<Self>['misfitsMemo']>;
  /** Indexed literalStarValuesMemo runtime field. */
  inactiveMemo?: NonNullable<FieldNodeRuntime<Self>['literalStarValuesMemo']>;
  /** Indexed literalStarValueEntries runtime field. */
  inactiveEntries?: NonNullable<
    FieldNodeRuntime<Self>['literalStarValueEntries']
  >;
}
