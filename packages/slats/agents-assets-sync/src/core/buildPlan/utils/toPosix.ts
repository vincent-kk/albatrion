import { sep } from 'node:path';

export function toPosix(p: string): string {
  return sep === '/' ? p : p.split(sep).join('/');
}
