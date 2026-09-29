import type { SchemaNodeRecord } from '../../../record';
import { findNodes } from './findNodes';

/** Return the first node in the current shape addressed by a pointer. */
export const find = <Self extends SchemaNodeRecord<Self>>(
  origin: Self,
  pointer: string | readonly string[] | null,
): Self | null => findNodes(origin, pointer)[0] ?? null;
