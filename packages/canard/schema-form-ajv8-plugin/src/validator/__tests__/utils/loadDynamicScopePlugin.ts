import Ajv2019 from 'ajv/dist/2019.js';
import Ajv2020 from 'ajv/dist/2020.js';
import { vi } from 'vitest';

/**
 * Load a fresh 2019-09 or 2020-12 plugin entry point with its own registry.
 * @param dialect - The entry point whose dynamic-reference vocabulary the case uses.
 * @param mode - `default` keeps the entry point's instance; `bind` binds a new one first.
 * @param directGuardCompile - The guard compile path selected for later compiles.
 * @returns The configured process-wide plugin of that entry point.
 */
export const loadDynamicScopePlugin = async (
  dialect: '2019' | '2020',
  mode: 'default' | 'bind',
  directGuardCompile: boolean,
) => {
  vi.resetModules();
  const { ajvValidatorPlugin } =
    dialect === '2020'
      ? await import('../../../2020/validatorPlugin')
      : await import('../../../2019/validatorPlugin');
  if (mode === 'bind')
    ajvValidatorPlugin.bind(
      dialect === '2020'
        ? new Ajv2020({ strictSchema: false })
        : new Ajv2019({ strictSchema: false }),
    );
  ajvValidatorPlugin.configure({ directGuardCompile });
  return ajvValidatorPlugin;
};
