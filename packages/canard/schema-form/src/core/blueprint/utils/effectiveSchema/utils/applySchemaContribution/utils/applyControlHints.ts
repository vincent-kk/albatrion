import { OwnedSchemaValues } from '../../OwnedSchemaValues';
import type { EffectiveSchemaFields } from '../../type';

/**
 * Keep single-value hints while behavioral rules remain in raw declarations.
 * @param target - Fresh effective schema whose controls hint may be replaced.
 * @param source - Authored controls object; other values contribute no hint.
 * @returns Nothing; updates and registers only a newly allocated controls envelope.
 */
export function applyControlHints(
  target: EffectiveSchemaFields,
  source: unknown,
): void {
  if (!source || typeof source !== 'object') return;
  const previous = target.controls;
  const controls = { ...previous };
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- Authored controls may be any object; indexed reads need a runtime shape guard.
  const hints = source as Record<string, unknown>;
  if (hints.watch !== undefined) controls.watch = hints.watch;
  if (hints.default !== undefined) controls.default = hints.default;
  if (Object.keys(controls).length) {
    target.controls = controls;
    OwnedSchemaValues.add(controls);
  }
}
