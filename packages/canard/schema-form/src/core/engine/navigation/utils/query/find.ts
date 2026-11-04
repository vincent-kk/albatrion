import type { Nullable } from '@aileron/declare';

import type { FieldNodeRecord } from '../../../record';
import { findNodes } from './findNodes';

/** Return the first node in the current shape addressed by a pointer. */
export const find = <Self extends FieldNodeRecord<Self>>(
  origin: Self,
  pointer?: Nullable<string | readonly string[]>,
): Nullable<Self> => findNodes(origin, pointer)[0] ?? null;
