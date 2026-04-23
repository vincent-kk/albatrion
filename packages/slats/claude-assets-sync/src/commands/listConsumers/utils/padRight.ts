export function padRight(s: string, width: number): string {
  return s + ' '.repeat(Math.max(0, width - s.length));
}
