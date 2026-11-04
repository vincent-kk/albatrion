import type { ValidatorPlugin } from '@canard/schema-form';
import type {
  ValidatorScenarioEntry,
  ValidatorScenarioProfile,
} from '@aileron/schema-form-scenarios/validator';
import Ajv from 'ajv';
import Ajv2019 from 'ajv/dist/2019.js';
import type AjvCore from 'ajv/dist/core.js';
import { vi } from 'vitest';

/** A freshly loaded validator and, for the custom profile, the consumer instance bound to it. */
export interface ParityValidator {
  readonly validator: ValidatorPlugin;
  /** The consumer instance bound once before first use, or null for the default entry profile. */
  readonly instance: AjvCore | null;
}

/**
 * Load a fresh ajv7 plugin with its own registry, so no row shares plugin state.
 * The `2019` entry is the Ajv2019 binding, the only ajv7 instance with dynamic references;
 * its default profile binds the plugin's default options, as the plugin's own tests prepare it.
 * @param entry - `default` (draft-07) or `2019` (Ajv2019 binding)
 * @param profile - `default` keeps the entry's options; `custom` binds a new consumer instance first
 * @param directGuardCompile - Guard compile path selected for later compiles
 * @returns The process-wide validator and the bound consumer instance
 */
export const loadParityValidator = async (
  entry: ValidatorScenarioEntry,
  profile: ValidatorScenarioProfile,
  directGuardCompile: boolean,
): Promise<ParityValidator> => {
  vi.resetModules();
  const { plugin } = await import('../../index');
  const instance = profile === 'custom'
    ? entry === '2019' ? new Ajv2019({ strict: false }) : new Ajv({ strict: false })
    : null;
  if (instance) plugin.validator.bind?.(instance);
  else if (entry === '2019') plugin.validator.bind?.(new Ajv2019({ allErrors: true, strict: false, validateFormats: false }));
  plugin.validator.configure({ directGuardCompile });
  return { validator: plugin.validator, instance };
};
