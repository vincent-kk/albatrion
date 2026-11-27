import type { ReturnInfo } from '../types';

/** Parse @returns tag from JSDoc. */
export function parseReturns(jsdoc: string): ReturnInfo | undefined {
  const returnsRegex = /@returns?\s+(?:\{([^}]*)\}\s+)?-?\s*([\s\S]*?)(?=\n\s*\*\s*@|\n\s*\*\/|\n\s*\*\s*\n)/;
  const match = jsdoc.match(returnsRegex);
  if (!match) return undefined;

  const type = match[1]?.trim() || '';
  const description = match[2].trim()
    .split('\n')
    .map(l => l.replace(/^\s*\*\s?/, '').trim())
    .join(' ')
    .trim();

  return { type, description };
}
