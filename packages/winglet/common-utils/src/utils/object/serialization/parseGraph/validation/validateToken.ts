import type { Token } from '../../utils/encodeGraph';

/** Validates exact token arity and canonical scalar payloads or reference bounds. */
export function validateToken(
  token: unknown,
  count: number,
): asserts token is Token {
  if (!Array.isArray(token)) throw new TypeError('Invalid graph token');
  const [tag, value] = token;
  if ((tag === 'null' || tag === 'undefined') && token.length === 1) return;
  if (token.length !== 2) throw new TypeError('Invalid graph token arity');
  if (tag === 'string' && typeof value === 'string') return;
  if (tag === 'boolean' && typeof value === 'boolean') return;
  if (
    tag === 'number' &&
    ((typeof value === 'number' &&
      Number.isFinite(value) &&
      !Object.is(value, -0)) ||
      ['NaN', 'Infinity', '-Infinity', '-0'].includes(value))
  )
    return;
  if (
    tag === 'bigint' &&
    typeof value === 'string' &&
    /^(0|-?[1-9][0-9]*)$/.test(value)
  )
    return;
  if (tag === 'ref' && Number.isInteger(value) && value >= 0 && value < count)
    return;
  throw new TypeError('Invalid graph token payload');
}
