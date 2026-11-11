import type { Optional } from '@aileron/declare';

import { BIT_MASK_NONE } from '@/schema-form/constants/bitmask';
import { type FieldNode, FieldNodeEventType } from '@/schema-form/core';

/**
 * Read the Refresh generation that keys an input, by its combined `controlled` declaration.
 * Render, composition end and callback admission read through here; the undeferred snapshot in
 * `useFieldInputControl` reads the matching revision mask and must change with it.
 * @param node - Field whose input is keyed
 * @param controlled - `true` when the input draws from `value` alone; anything else remounts on Refresh
 * @returns A constant for a controlled input, otherwise the node's Refresh revision
 */
export const readFieldInputGeneration = (
  node: FieldNode,
  controlled: Optional<boolean>,
): number =>
  controlled === true
    ? BIT_MASK_NONE
    : node.revision(FieldNodeEventType.RequestRefresh);
