import {
  PointerOperator,
  type PointerSegment,
} from '../constants/PointerOperator';
import { joinPointer } from './joinPointer';
import { parsePointer } from './parsePointer';

/** Resolve authored form steps, saturating parent climbs at the root. */
export const resolvePointer = (basePath: string, pointer: string): string => {
  if (pointer === '@') return '@';
  if (pointer === '#' || pointer === '/' || pointer === '#/') return '';
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
    : [...parsePointer(basePath === '/' ? '' : basePath).segments];
  for (let index = 0; index < parsed.segments.length; index++) {
    const segment = parsed.segments[index];
    if (segment === PointerOperator.Parent) resolved.pop();
    else if (segment !== PointerOperator.Current) {
      if (segment === '' && index === parsed.segments.length - 1) continue;
      resolved.push(segment);
    }
  }
  return joinPointer(resolved);
};
