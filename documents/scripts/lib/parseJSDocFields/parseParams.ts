import type { ParamInfo } from '../types';

/** Parse @param tags from JSDoc. */
export function parseParams(jsdoc: string): ParamInfo[] {
  const params: ParamInfo[] = [];
  const paramRegex = /@param\s+(?:\{([^}]*)\}\s+)?(\w+(?:\.\w+)*)\s*-?\s*([\s\S]*?)(?=\n\s*\*\s*@|\n\s*\*\/|\n\s*\*\s*\n)/g;

  let match;
  while ((match = paramRegex.exec(jsdoc)) !== null) {
    const type = match[1]?.trim() || '';
    const name = match[2].trim();
    const description = match[3].trim()
      .split('\n')
      .map(l => l.replace(/^\s*\*\s?/, '').trim())
      .join(' ')
      .trim();

    // Skip sub-property params like options.signal
    if (name.includes('.')) continue;

    params.push({ name, type, description });
  }

  return params;
}
