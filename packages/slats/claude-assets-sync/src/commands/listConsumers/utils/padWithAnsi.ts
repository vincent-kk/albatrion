import { stripAnsi } from './stripAnsi.js';

export function padWithAnsi(s: string, width: number): string {
  const visibleLength = stripAnsi(s).length;
  return s + ' '.repeat(Math.max(0, width - visibleLength));
}
