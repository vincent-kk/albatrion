// test and bench helper; not part of the product tree; built only from the core index
import {
  type AuthoredSchema,
  type InferFieldNode,
  buildFieldNodeTree,
  mountFieldNode,
} from '../../core';

/**
 * Test and bench helper for tests, bench and aileron benchmarks.
 * <Form> calls the same build channel through binding-only functions.
 * @param props - Authored schema, initial value, services and host predicates;
 * invalid schemas fail during construction, before mounting.
 * @param props.isTerminal - Renderer predicate accepting raw object or boolean schemas;
 * undefined leaves earlier terminal hints intact.
 * @returns The mounted root; mount validation is requested unless explicitly deferred.
 */
export function nodeFromJSONSchema<Schema extends AuthoredSchema>(
  props: Parameters<typeof buildFieldNodeTree<Schema>>[0] & {
    deferMountValidation?: boolean;
  },
): InferFieldNode<Schema> {
  const root = buildFieldNodeTree<Schema>(props);
  mountFieldNode(root, undefined, undefined, {
    deferValidation: props.deferMountValidation ?? false,
  });
  return root;
}
