import type { AjvInstance as Ajv } from '../../types/AjvInstance';

/**
 * Read a native keyword definition without invoking application methods.
 * @param source - Native profile whose definition containers are read without compilation.
 * @param name - Authored schema keyword, including an unknown keyword to observe absence.
 * @returns The native keyword definition or marker, or undefined when absent.
 */
export const readKeyword = (source: Ajv, name: string): unknown => {
  const rule = source.RULES.all[name];
  return rule && typeof rule === 'object' ? rule.definition : rule;
};
