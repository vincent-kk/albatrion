/** Declaration shared by the Node-output plugin's consumers in rolldown.config.mjs. */
export const DEVELOPMENT_FLAG_LINE =
  'const __SCHEMA_FORM_DEV__ = process.env.NODE_ENV !== "production";';

/** The two source comparison forms allowed by the call-site environment lint rule. */
const comparison = /process\.env\.NODE_ENV\s*(!==|===)\s*(['"])production\2/g;

/** Replace supported comparisons without changing output ordering. */
const replaceComparisons = (code) =>
  code.replace(comparison, (_, operator) =>
    operator === '!==' ? '__SCHEMA_FORM_DEV__' : '!__SCHEMA_FORM_DEV__',
  );

/**
 * Creates the transform used only by Node-selected outputs; rejects other NODE_ENV reads.
 * Rolldown supplies source code, module IDs, and the error context to transform.
 * Returning map: null presumes sourcemap: false in both consuming output configurations.
 * @param {boolean} outputOnly - Apply to a shared ESM output and prepend its flag.
 * @returns {import('rolldown').Plugin} A plugin replacing comparisons with the output flag.
 */
export function developmentFlag(outputOnly = false) {
  if (outputOnly)
    return {
      name: 'schema-form-development-flag-output',
      renderChunk(code) {
        return {
          code: DEVELOPMENT_FLAG_LINE + '\n' + replaceComparisons(code),
          map: null,
        };
      },
    };
  return {
    name: 'schema-form-development-flag',
    transform(code, id) {
      if (!/\.tsx?$/.test(id) || !code.includes('process.env.NODE_ENV')) return;
      const transformed = replaceComparisons(code);
      if (transformed.includes('process.env.NODE_ENV')) {
        this.error(`Unrecognized NODE_ENV read in ${id}`);
      }
      return { code: transformed, map: null };
    },
  };
}
