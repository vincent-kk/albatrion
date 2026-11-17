import type { Optional } from '@aileron/declare';

/**
 * Combine the definition's and the schema's `controlled` declarations.
 * `false` on either side wins so a schema cannot switch off the remount an uncontrolled input needs.
 * @param definition - Declaration of the selected input definition, if it has one
 * @param authored - `presentation.controlled` of the effective schema
 * @returns `false`, `true`, or `undefined` when neither side declares a boolean; only `true` changes behavior
 */
export const resolveControlled = (
  definition: Optional<boolean>,
  authored: unknown,
): Optional<boolean> => {
  if (definition === false || authored === false) return false;
  return definition === true || authored === true ? true : undefined;
};
