import type { ReferenceResolver } from '../JSONSchemaScanner/type';
import { ResolverStore } from './utils/ResolverStore';
import type {
  ReferenceResolverOptions,
  ResolverContext,
  SchemaValue,
} from './utils/type';

/**
 * Construct an indexed synchronous resolver with host-specific immutable templates.
 * @param root Original document; identifiers and address ambiguity are checked eagerly.
 * @param options Explicit retrieval base, dialect aliases, documents and vocabulary.
 * @returns A context protocol that performs no implicit I/O.
 * @throws Duplicate-identifier and physical-cycle errors during indexing.
 */
export function createReferenceResolver(
  root: SchemaValue,
  options: ReferenceResolverOptions = {},
): ReferenceResolver {
  const store = new ResolverStore(root, options);
  return {
    root: () => store.initial,
    child: (parent, _keyword, schema) => store.child(parent, schema),
    dialect: (context) => context.resource.dialect,
    resolve: (reference, keyword, context) =>
      store.resolve(reference, keyword, context),
  } satisfies ReferenceResolver<ResolverContext>;
}
