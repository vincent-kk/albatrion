import type { BlueprintNodeKind } from '@/schema-form/core/engine/blueprint';
import { find } from '@/schema-form/core/engine/navigation';

import type { PlainNode } from '../../../__tests__/fixtures/createPlainNode';
import { readRetainedSlotSource } from './readRetainedSlotSource';

/**
 * Read the source owned by a live occurrence or its kind-specific latent entry.
 * @param root - Tree whose shape and latent map are under test
 * @param path - Absolute path of the occurrence
 * @param kind - Kind of an occurrence currently outside the shape
 * @returns The occurrence's source, or its latent value when absent
 */
export const sourceAt = (
  root: PlainNode,
  path: string,
  kind?: BlueprintNodeKind,
): unknown => {
  const live = find(root, path);
  return live ? live.source : readRetainedSlotSource(root, path, kind);
};
