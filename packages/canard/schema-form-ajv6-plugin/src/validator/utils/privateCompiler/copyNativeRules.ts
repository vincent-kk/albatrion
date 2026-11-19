import type { Ajv } from 'ajv';

/**
 * Snapshot keyword containers while retaining registered definitions and meta validators.
 * @param source - Application rules whose definitions must remain read-only.
 * @returns Independent containers retained by AJV6 dollar-data generated functions.
 */
export const copyNativeRules = (source: Ajv['RULES']): Ajv['RULES'] => {
  const groups = source.map((group) => ({ ...group, rules: [...group.rules] }));
  const types = { ...source.types };
  for (const group of groups) if (group.type) types[group.type] = group;
  return Object.assign(groups, {
    custom: { ...source.custom },
    keywords: { ...source.keywords },
    all: { ...source.all },
    types,
  });
};
