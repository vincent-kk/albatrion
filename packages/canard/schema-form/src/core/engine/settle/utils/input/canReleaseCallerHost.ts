import { isPlain } from './isPlain';

/**
 * Test the source boundary before promoting a caller-touched object host.
 * @param source - Host's source before the caller's child effect
 * @param hasChildOutput - Actual or statically interpreted child emission
 * @returns True when a new child emission can displace the wrong-kind source
 */
export const canReleaseCallerHost = (
  source: unknown,
  hasChildOutput: boolean,
): boolean => source !== undefined && !isPlain(source) && hasChildOutput;
