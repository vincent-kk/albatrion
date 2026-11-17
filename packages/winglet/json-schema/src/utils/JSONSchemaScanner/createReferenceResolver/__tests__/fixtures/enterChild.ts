import type { UnknownSchema } from '@/json-schema/types/jsonSchema';

import type { ReferenceResolver } from '../../../utils/type';

/**
 * Enter an original lexical child the way the scanner does.
 * @param resolver A resolver that tracks lexical contexts, such as the built-in one.
 * @param parent Context of the schema that contains the child.
 * @param keyword Keyword under which the child is written.
 * @param schema The original child schema.
 * @returns The context in which references inside the child resolve.
 * @throws When the resolver keeps one fixed root context, so no child context exists.
 */
export function enterChild<Context>(
  resolver: ReferenceResolver<Context>,
  parent: Context,
  keyword: string,
  schema: UnknownSchema | boolean,
): Context {
  if (!resolver.child)
    throw new Error('The resolver keeps one fixed root context.');
  return resolver.child(parent, keyword, schema);
}
