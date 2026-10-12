import type { BlueprintNodeKind } from '../../../blueprint';
import { find } from '../../../navigation';
import type { PlainNode } from './createPlainNode';

/**
 * Read the source owned by a live occurrence or its kind-specific latent entry.
 * @param root - Tree whose shape and latent map are under test
 * @param path - Absolute path of the occurrence
 * @param kind - Kind of an occurrence currently outside the shape
 * @returns The occurrence's raw source, or its latent value when absent
 */
export const sourceAt = (
  root: PlainNode, path: string, kind?: BlueprintNodeKind,
): unknown => {
  const live = find(root, path);
  return live ? live.raw : root.runtime.latentRaw.get(JSON.stringify([path, kind]));
};
