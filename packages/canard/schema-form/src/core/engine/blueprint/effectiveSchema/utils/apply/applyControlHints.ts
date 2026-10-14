import type { EffectiveSchemaFields } from '../../types/state';
import { OwnedSchemaValues } from '../finalize/OwnedSchemaValues';
import { isObjectRecord } from '../finalize/isObjectRecord';

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
  if (!isObjectRecord(source)) return;
  const previous = target.controls;
  const controls = { ...previous };
  const hints = source;
  if (hints.watch !== undefined) controls.watch = hints.watch;
  if (hints.default !== undefined) controls.default = hints.default;
  if (Object.keys(controls).length) {
    target.controls = controls;
    OwnedSchemaValues.add(controls);
  }
}
