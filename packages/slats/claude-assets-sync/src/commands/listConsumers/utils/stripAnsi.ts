export function stripAnsi(s: string): string {
  // eslint-disable-next-line no-control-regex -- ANSI SGR reset requires the ESC (\x1b) control byte
  return s.replace(/\x1b\[[0-9;]*m/g, '');
}
