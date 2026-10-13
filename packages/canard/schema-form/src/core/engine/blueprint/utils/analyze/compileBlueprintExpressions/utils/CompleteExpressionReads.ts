import type { BlueprintExpression } from '../../../../type';

/** Compiler-only complete-read evidence, without widening expression descriptors. */
export const CompleteExpressionReads = new WeakSet<BlueprintExpression>();
