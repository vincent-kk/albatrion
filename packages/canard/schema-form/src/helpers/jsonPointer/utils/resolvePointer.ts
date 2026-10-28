import {
  PointerOperator,
  type PointerSegment,
} from '../constants/PointerOperator';
import { joinPointer } from './joinPointer';
import { parsePointer } from './parsePointer';
import { parsePointerSegments } from './parsePointerSegments';

/**
 * Resolve an authored dependency or reference address against its host node.
 * @param basePath - Canonical address of the host node; the empty string is the root.
 * @param pointer - `@` (context), `#` (root), a `/`- or `#/`-prefixed absolute address, or relative steps made of `.`, `..` and names.
 * @returns A canonical address, with `@` returned unchanged. A parent step above the root stays at the root, and a trailing empty name is dropped only directly after an operator (`./`, `../`).
 */
export const resolvePointer = (basePath: string, pointer: string): string => {
  if (pointer === '@') return '@';
  if (pointer === '#') return '';
  if (pointer === '..') {
    const end = basePath.lastIndexOf('/');
    return end > 0 ? basePath.slice(0, end) : '';
  }
  if (pointer === '.') return basePath;
  if (pointer[0] === '/') return pointer;
  if (pointer.startsWith('#/')) return pointer.slice(1);
  const parsed = parsePointer(pointer);
  const resolved: PointerSegment[] = parsed.absolute
    ? []
    : [...parsePointerSegments(basePath)];
  for (let index = 0; index < parsed.segments.length; index++) {
    const segment = parsed.segments[index];
    if (segment === PointerOperator.Parent) resolved.pop();
    else if (segment !== PointerOperator.Current) {
      if (
        segment === '' &&
        index === parsed.segments.length - 1 &&
        index > 0 &&
        typeof parsed.segments[index - 1] !== 'string'
      )
        continue;
      resolved.push(segment);
    }
  }
  return joinPointer(resolved);
};
