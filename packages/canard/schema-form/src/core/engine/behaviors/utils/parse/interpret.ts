import type { UnionSpec } from '../../../record';
import { convert } from './convert';
import { isMember } from './isMember';

/** Return a unique allowed conversion, or the unmodified caller input. */
export const interpret = (value: unknown, spec: UnionSpec): unknown => {
  if (value === undefined || value === null) return value;
  const kinds = spec.kinds;
  if (typeof kinds === 'string') {
    if (isMember(value, kinds)) return value;
    const converted = convert(value, kinds);
    return isMember(converted, kinds) ? converted : value;
  }
  for (const kind of kinds) if (isMember(value, kind)) return value;

  let candidate: unknown;
  let found = false;
  for (const kind of kinds) {
    const converted = convert(value, kind);
    if (!isMember(converted, kind)) continue;
    if (!found) {
      candidate = converted;
      found = true;
    } else if (candidate !== converted) return value;
  }
  return found ? candidate : value;
};
