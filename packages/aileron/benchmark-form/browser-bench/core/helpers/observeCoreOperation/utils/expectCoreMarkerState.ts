/**
 * Marker state the shared `^(?:..)*$` pattern of the measured leaves implies for a value.
 * @param value - Native input value after a write, or the probe default.
 * @returns '1' when the pattern rejects the value (odd length), else '0'.
 */
export function expectCoreMarkerState(value: string): '0' | '1' {
  return value.length % 2 ? '1' : '0';
}
