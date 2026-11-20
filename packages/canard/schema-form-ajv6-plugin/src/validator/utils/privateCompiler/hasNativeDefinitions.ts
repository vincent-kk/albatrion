import { observeIdentity } from './observeIdentity';
import { readKeyword } from './readKeyword';
import type {
  ApplicationGraph,
  PrivateCompiler,
  SchemaDependencies,
} from './types';

/**
 * Check that a compiler's keyword snapshot can compile every requested raw document.
 * @param compiler - Existing private compiler with a detached keyword namespace.
 * @param root - Facts about the current form root.
 * @param graph - On-demand imported documents, absent for reference-free roots.
 * @returns Whether all requested definitions exist unchanged in the private namespace.
 */
export const hasNativeDefinitions = (
  compiler: PrivateCompiler,
  root: SchemaDependencies,
  graph?: ApplicationGraph,
): boolean => {
  for (const [name, definition] of root.rules)
    if (
      observeIdentity(
        compiler.identities,
        readKeyword(compiler.instance, name),
      ) !== definition
    )
      return false;
  if (graph)
    for (const facts of graph.documents.values()) {
      for (const [name, definition] of facts.rules)
        if (
          observeIdentity(
            compiler.identities,
            readKeyword(compiler.instance, name),
          ) !== definition
        )
          return false;
    }
  return true;
};
