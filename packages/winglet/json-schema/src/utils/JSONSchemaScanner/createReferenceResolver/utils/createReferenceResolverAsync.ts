import type { ReferenceResolverAsync } from '../../utils/type';
import { ResolverStore } from './ResolverStore';
import type {
  ReferenceResolverAsyncOptions,
  ResolverContext,
  SchemaValue,
} from './type';

/**
 * Construct an asynchronous resolver that only loads through the caller's function.
 * @param root Original document, indexed immediately.
 * @param options Explicit sources and optional asynchronous loader.
 * @returns A resolver coalescing both pending and completed requests by absolute document URI.
 */
export function createReferenceResolverAsync(
  root: SchemaValue,
  options: ReferenceResolverAsyncOptions = {},
): ReferenceResolverAsync {
  const store = new ResolverStore(root, options);
  const pending = new Map<string, Promise<void>>();
  return {
    root: () => store.initial,
    child: (parent, _keyword, schema) => store.child(parent, schema),
    dialect: (context) => context.resource.dialect,
    async resolve(reference, keyword, context) {
      const uri = store.documentURI(reference, context);
      if (uri && !store.ensure(uri) && options.load) {
        let request = pending.get(uri);
        if (!request) {
          request = Promise.resolve()
            .then(() => options.load!(uri))
            .then((schema) => {
              if (schema !== undefined) store.add(uri, schema);
            });
          pending.set(uri, request);
        }
        await request;
      }
      return store.resolve(reference, keyword, context);
    },
  } satisfies ReferenceResolverAsync<ResolverContext>;
}
