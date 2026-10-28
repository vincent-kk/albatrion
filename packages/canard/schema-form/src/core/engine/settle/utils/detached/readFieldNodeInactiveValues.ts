import type { FieldNodeRecord } from '../../../record';
import { materializeInactiveSlotValues } from '../slots/materializeInactiveSlotValues';

/** Read the current or final committed inactive values for one reference. */
export const readFieldNodeInactiveValues = <Self extends FieldNodeRecord<Self>>(
  node: Self,
): readonly { path: string; value: unknown }[] =>
  materializeInactiveSlotValues(node);
