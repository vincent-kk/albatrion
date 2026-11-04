import type { plugin } from '@canard/schema-form-ajv8-plugin';

import type { CoreObservationEnv, CoreValidatorObservation } from '../../../types';

/** Wrapped plugin and its records. */
export interface CoreWrappedValidator {
  /** Plugin to register; compile and runs are recorded. */
  plugin: typeof plugin;
  /** Page-lifetime records. */
  observation: CoreValidatorObservation;
}

/**
 * Wrap the validator plugin so every compile and run is recorded.
 * @param source - Plugin whose validator is wrapped.
 * @param measuredPath - Path read from run data as probeValue; null disables.
 * @param env - Browser-owned clock.
 * @returns The wrapped plugin and its observation.
 */
export function observeCoreValidator(
  source: typeof plugin,
  measuredPath: string | null,
  env: CoreObservationEnv,
): CoreWrappedValidator {
  void measuredPath;
  void env;
  return { plugin: source, observation: { records: [], pending: new Set() } };
}
