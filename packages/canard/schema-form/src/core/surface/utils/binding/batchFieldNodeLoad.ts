import { dispatchBatch } from '../../../engine';
import { requireRuntimeFieldNode } from '../../runtime/requireRuntimeFieldNode';
import type { FieldNode } from '../../type';

/**
 * Run binding-owned load work in one chain without changing public batch semantics.
 * @param root - Current form root, including a root adopted during run
 * @param run - Synchronous reset, mount or first-commit external-error work
 * @returns Nothing; dispatch delivers and rethrows collected failures
 */
export const batchFieldNodeLoad = (root: FieldNode, run: () => void): void =>
  dispatchBatch(requireRuntimeFieldNode(root, true), run, 'load');
