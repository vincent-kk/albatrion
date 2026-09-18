import type { Token } from '../../utils/encodeGraph';

/** Resolves a validated token against already allocated node identities. */
export function restoreToken(token: Token, objects: any[]): any {
  switch (token[0]) {
    case 'null':
      return null;
    case 'undefined':
      return undefined;
    case 'ref':
      return objects[token[1]];
    case 'bigint':
      return BigInt(token[1]);
    case 'number':
      return token[1] === '-0' ? -0 : Number(token[1]);
    default:
      return token[1];
  }
}
