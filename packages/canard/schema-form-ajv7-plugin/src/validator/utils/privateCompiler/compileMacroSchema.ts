import { equals } from '@winglet/common-utils/object';

import { collectApplicationGraph } from './collectApplicationGraph';
import { importApplicationGraph } from './importApplicationGraph';
import { readApplicationResource } from './readApplicationResource';
import type { PrivateCompiler } from './types';

/**
 * Let AJV expand macros in their native context and fulfill resulting application references.
 * @param compiler - Isolated compiler whose references may be extended by the macro.
 * @param compile - Native compile or lookup for the same detached root on each attempt.
 * @returns The native result, or throws the native error when no new import can fulfill it.
 */
export const compileMacroSchema = <T>(
  compiler: PrivateCompiler,
  compile: () => T,
): T => {
  const { source } = compiler;
  const MissingRefError = Reflect.get(source.constructor, 'MissingRefError');
  const requested = new Set<string>();
  for (;;) {
    try {
      return compile();
    } catch (error) {
      if (
        !error ||
        typeof error !== 'object' ||
        typeof MissingRefError !== 'function' ||
        !(error instanceof MissingRefError) ||
        !('missingRef' in error) ||
        typeof error.missingRef !== 'string' ||
        requested.has(error.missingRef) ||
        !readApplicationResource(source, error.missingRef)
      )
        throw error;
      requested.add(error.missingRef);
      const graph = collectApplicationGraph(source, { $ref: error.missingRef });
      for (const [address, claim] of graph.claims) {
        const previous = compiler.claims.get(address);
        if (
          compiler.formOwners?.has(address) ||
          (previous && !equals(previous.schema, claim.schema))
        )
          throw new Error(`Conflicting application schema id "${address}"`);
      }
      importApplicationGraph(compiler, graph);
    }
  }
};
