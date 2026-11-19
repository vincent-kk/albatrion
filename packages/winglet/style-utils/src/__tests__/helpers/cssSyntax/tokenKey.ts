import type { CSSToken } from '@csstools/css-tokenizer';

/** Decode token data independently of its source offsets and original spelling. */
export const tokenKey = (token: CSSToken): string => {
  if (token[0] === 'dimension-token') return `dim:${token[4].value}${token[4].unit}`;
  if (token[0] === 'number-token' || token[0] === 'percentage-token') return `${token[0]}:${token[4].value}`;
  const data = token[4];
  return data && 'value' in data ? `${token[0]}:${data.value}` : token[0];
};
