import { OwnedSchemaValues } from '../../OwnedSchemaValues';

/**
 * Keep single-value hints while behavioral rules remain in raw declarations.
 * @param target - Fresh effective schema whose controls hint may be replaced.
 * @param source - Authored controls object; other values contribute no hint.
 * @returns Nothing; updates and registers only a newly allocated controls envelope.
 */
export function applyControlHints(
  target: Record<string, unknown>,
  source: unknown,
): void {
  if (!source || typeof source !== 'object') return;
  const previous = target.controls as Record<string, unknown> | undefined;
  const controls = { ...previous };
  const hints = source as Record<string, unknown>;
  if (hints.watch !== undefined) controls.watch = hints.watch;
  if (hints.default !== undefined) controls.default = hints.default;
  if (Object.keys(controls).length) {
    target.controls = controls;
    OwnedSchemaValues.add(controls);
  }
}
