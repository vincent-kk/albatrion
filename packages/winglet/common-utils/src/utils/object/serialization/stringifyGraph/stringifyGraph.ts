import type { SerializationOptions } from '../type';
import { checkTextLimit } from '../utils/checkTextLimit';
import { encodeGraph } from '../utils/encodeGraph';

/**
 * Stores supported data, cycles and shared references in a versioned JSON string.
 * @param value Supported graph root; accessors and executable values are rejected.
 * @param options Recursive property exclusions, applied before reading values.
 * @returns A string restored by parseGraph; throws TypeError for unsupported data or limits.
 */
export function stringifyGraph(
  value: unknown,
  options?: SerializationOptions,
): string {
  const [root, nodes] = encodeGraph(value, options);
  const text = JSON.stringify(['winglet.graph', 1, root, nodes]);
  checkTextLimit(text);
  return text;
}
