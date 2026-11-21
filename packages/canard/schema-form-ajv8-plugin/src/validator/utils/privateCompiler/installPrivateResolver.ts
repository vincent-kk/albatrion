import { collectApplicationGraph } from './collectApplicationGraph';
import { importApplicationGraph } from './importApplicationGraph';
import type { PrivateCompiler } from './types';

/**
 * Resolve a native lazy meta-schema lookup from raw application entries only.
 * @param compiler - Private environment on which lazy meta lookup may import current raw schemas.
 * @returns No value; replaces lookup only on the private compiler.
 */
export const installPrivateResolver = (compiler: PrivateCompiler): void => {
  const original = compiler.instance.getSchema.bind(compiler.instance);
  compiler.instance.getSchema = <T = unknown>(key: string) => {
    let found = original<T>(key);
    if (found) return found;
    try {
      importApplicationGraph(
        compiler,
        collectApplicationGraph(compiler.source, { $ref: key }),
      );
    } catch (error) {
      if (error && typeof error === 'object' && 'missingRef' in error)
        return undefined;
      throw error;
    }
    found = original<T>(key);
    return found;
  };
};
