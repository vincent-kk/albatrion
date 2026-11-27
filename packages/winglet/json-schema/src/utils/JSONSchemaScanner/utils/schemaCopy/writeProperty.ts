import { setDataProperty } from '@winglet/common-utils/object';

/**
 * Write to an output-owned container, keeping __proto__ an own data property.
 * @param target Fresh or output-owned dictionary receiving the value.
 * @param key Own enumerable string key to preserve.
 * @param value Copied value or a placeholder reserving insertion order.
 * @returns Nothing; only target is mutated.
 */
export function writeProperty(
  target: Record<string, unknown>,
  key: string,
  value: unknown,
): void {
  if (key === '__proto__') setDataProperty(target, key, value);
  else target[key] = value;
}
