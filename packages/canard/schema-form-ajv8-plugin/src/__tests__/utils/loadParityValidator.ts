import type { ValidatorPlugin } from '@canard/schema-form';
import type {
  ValidatorScenarioEntry,
  ValidatorScenarioProfile,
} from '@aileron/schema-form-scenarios/validator';
import Ajv from 'ajv';
import Ajv2019 from 'ajv/dist/2019.js';
import Ajv2020 from 'ajv/dist/2020.js';
import type AjvCore from 'ajv/dist/core.js';
import { vi } from 'vitest';

/** A freshly loaded entry validator and, for the custom profile, the consumer instance bound to it. */
export interface ParityValidator {
  readonly validator: ValidatorPlugin;
  /** The consumer instance bound once before first use, or null for the default profile. */
  readonly instance: AjvCore | null;
}

/**
 * Load a fresh ajv8 entry point with its own registry, so no row shares plugin state.
 * @param entry - `default` (draft-07), `2019` or `2020` entry point
 * @param profile - `default` keeps the entry's instance; `custom` binds a new consumer instance first
 * @param directGuardCompile - Guard compile path selected for later compiles
 * @returns The entry's process-wide validator and the bound consumer instance
 */
export const loadParityValidator = async (
  entry: ValidatorScenarioEntry,
  profile: ValidatorScenarioProfile,
  directGuardCompile: boolean,
): Promise<ParityValidator> => {
  vi.resetModules();
  if (entry === '2020') {
    const { plugin } = await import('../../2020');
    const instance = profile === 'custom' ? new Ajv2020({ strict: false }) : null;
    if (instance) plugin.validator.bind(instance);
    plugin.validator.configure({ directGuardCompile });
    return { validator: plugin.validator, instance };
  }
  if (entry === '2019') {
    const { plugin } = await import('../../2019');
    const instance = profile === 'custom' ? new Ajv2019({ strict: false }) : null;
    if (instance) plugin.validator.bind(instance);
    plugin.validator.configure({ directGuardCompile });
    return { validator: plugin.validator, instance };
  }
  const { plugin } = await import('../../default');
  const instance = profile === 'custom' ? new Ajv({ strict: false }) : null;
  if (instance) plugin.validator.bind(instance);
  plugin.validator.configure({ directGuardCompile });
  return { validator: plugin.validator, instance };
};
