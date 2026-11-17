/**
 * Every code a JSONSchemaScanError carries.
 * Keys are the names callers compare against; values are the stable strings on `error.code`.
 */
export const JSONSchemaScanErrorCode = {
  /** Distinct locations in the registered resources declare one identifier. */
  DuplicateIdentifier: 'duplicate-identifier',
  /** A mutation changes the identifier keywords of the node being visited. */
  IdentifierMutation: 'identifier-mutation',
  /** The scan inlined more schema nodes than `limits.inlinedNodes` allows. */
  InlinedNodeLimit: 'inlined-node-limit',
  /** A resolver returned an invalid tag, URI or target, or a sync resolver returned a thenable. */
  InvalidResolverResult: 'invalid-resolver-result',
  /** One position followed more replacements than `limits.referenceChain` allows. */
  ReferenceChainLimit: 'reference-chain-limit',
  /** `scan` or `getValue` was called on an instance whose scan is still running. */
  ScanInProgress: 'scan-in-progress',
  /** Traversal or plain-container copying found an object that contains itself. */
  SchemaCycle: 'schema-cycle',
  /** A reference has no target while `unresolvedReference` is `'throw'`. */
  UnresolvedReference: 'unresolved-reference',
} as const;

/** Union of the code strings a JSONSchemaScanError can carry. */
export type JSONSchemaScanErrorCode =
  (typeof JSONSchemaScanErrorCode)[keyof typeof JSONSchemaScanErrorCode];
