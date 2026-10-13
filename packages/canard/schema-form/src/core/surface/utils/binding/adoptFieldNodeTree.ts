import { adoptFieldNodeChain } from '../../../engine';
import type { FieldNode } from '../../type';
import { requireRuntimeFieldNode } from '../requireRuntimeFieldNode';

/**
 * Binding-only; not exported from src/index.ts.
 * Delegate the binding operation through the core entry boundary.
 * @param previousRoot - Root whose committed tree is retired
 * @param nextRoot - Replacement receiving the open chain and path-keyed errors
 * @returns Nothing; the dispatcher completes the operation synchronously
 */
export const adoptFieldNodeTree = (
  previousRoot: FieldNode,
  nextRoot: FieldNode,
): void =>
  adoptFieldNodeChain(
    requireRuntimeFieldNode(previousRoot, true),
    requireRuntimeFieldNode(nextRoot, true),
  );
