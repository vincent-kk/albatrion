import { convert } from './convert.mjs';
import { isMember } from './isMember.mjs';

/**
 * Interpret one write with order-independent, allocation-free rule A.
 * @param {*} value Caller input; missing, null, and members retain identity.
 * @param {{ kinds: readonly string[], nullable: boolean }} spec Allowed non-null kinds.
 * @returns {*} The unique conversion result, or the unchanged original value.
 */
export function interpret(value, spec) {
  if (value === undefined || value === null) return value;
  for (const kind of spec.kinds) if (isMember(value, kind)) return value;
  let found = false;
  let result;
  for (const kind of spec.kinds) {
    const candidate = convert(value, kind);
    if (candidate === undefined) continue;
    if (found && candidate !== result) return value;
    found = true;
    result = candidate;
  }
  return found ? result : value;
}
