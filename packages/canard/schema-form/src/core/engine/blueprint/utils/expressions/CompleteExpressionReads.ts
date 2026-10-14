import type { BlueprintExpression } from '../../types/blueprint';

/** Compiler-only complete-read evidence, without widening expression descriptors. */
export const CompleteExpressionReads = new WeakSet<BlueprintExpression>();
