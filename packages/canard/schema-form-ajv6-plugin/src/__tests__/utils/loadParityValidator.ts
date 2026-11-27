import type { ValidatorPlugin } from '@canard/schema-form';
import type {
  ValidatorScenarioEntry,
  ValidatorScenarioProfile,
} from '@aileron/schema-form-scenarios/validator';
import Ajv from 'ajv';
import { vi } from 'vitest';

/** A freshly loaded validator and, for the custom profile, the consumer instance bound to it. */
export interface ParityValidator {
  readonly validator: ValidatorPlugin;
  /** The consumer instance bound once before first use, or null for the default profile. */
  readonly instance: Ajv.Ajv | null;
}

/**
 * Load a fresh ajv6 plugin with its own registry, so no row shares plugin state.
 * @param entry - Only `default` (draft-07); ajv6 has no other entry and the row expansion never passes one
 * @param profile - `default` keeps the plugin's instance; `custom` binds a new consumer instance first
 * @param directGuardCompile - Guard compile path selected for later compiles
 * @returns The process-wide validator and the bound consumer instance
 * @throws Error for an entry other than `default`
 */
export const loadParityValidator = async (
  entry: ValidatorScenarioEntry,
  profile: ValidatorScenarioProfile,
  directGuardCompile: boolean,
): Promise<ParityValidator> => {
  if (entry !== 'default') throw new Error(`ajv6 has no ${entry} entry`);
  vi.resetModules();
  const { plugin } = await import('../../index');
  const instance = profile === 'custom' ? new Ajv() : null;
  if (instance) plugin.validator.bind?.(instance);
  plugin.validator.configure({ directGuardCompile });
  return { validator: plugin.validator, instance };
};
