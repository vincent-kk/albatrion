import type { Optional } from '@aileron/declare';

import { BIT_MASK_NONE } from '@/schema-form/constants/bitmask';
import { EXTERNAL_VALUE_REVISION } from '@/schema-form/constants/externalValueRevision';
import { type FieldNode, FieldNodeEventType } from '@/schema-form/core';

/**
 * Read the Refresh generation that keys an input, by its combined `controlled` declaration.
 * Render, composition end and callback admission read through here; the undeferred snapshot in
 * `useFieldInputControl` reads the matching revision mask and must change with it.
 * @param node - Field whose input is keyed
 * @param controlled - `true` when the input draws from `value` alone; anything else remounts on Refresh
 * @param childValueRevision - External revision pinned when this input first renders a child proxy.
 * @returns A constant for a controlled input, otherwise the node's Refresh revision
 */
export const readFieldInputGeneration = (
  node: FieldNode,
  controlled: Optional<boolean>,
  childValueRevision?: number,
): number =>
  controlled === true
    ? BIT_MASK_NONE
    : (childValueRevision ?? 0) +
      node.revision(
        FieldNodeEventType.RequestRefresh |
          (node.strategy === 'branch' && childValueRevision === undefined
            ? EXTERNAL_VALUE_REVISION
            : BIT_MASK_NONE),
      );
