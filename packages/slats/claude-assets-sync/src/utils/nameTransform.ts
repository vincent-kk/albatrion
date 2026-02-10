/**
 * Converts kebab-case string to camelCase
 * All hyphens are removed and the following character is capitalized
 *
 * @param str - Input string in kebab-case format
 * @returns String in camelCase format
 *
 * @example
 * ```ts
 * kebabToCamel('schema-form') // 'schemaForm'
 * kebabToCamel('schema-form-plugin') // 'schemaFormPlugin'
 * kebabToCamel('my-long-name') // 'myLongName'
 * ```
 */
export function kebabToCamel(str: string): string {
  return str.replace(/-./g, (match) => match[1].toUpperCase());
}

/**
 * Creates a flat file name by combining prefix and original file name.
 * For single files (no path separator), creates prefix_filename.
 * For directory-based entries (with path separator), applies prefix only
 * to the top-level directory name, preserving internal path structure.
 *
 * @param prefix - Package prefix (e.g., 'canard-schemaForm')
 * @param fileName - Original file name (e.g., 'guide.md' or 'expert/SKILL.md')
 * @returns Flat file name with prefix
 *
 * @example
 * ```ts
 * toFlatFileName('canard-schemaForm', 'guide.md')
 * // 'canard-schemaForm_guide.md'
 *
 * toFlatFileName('canard-schemaForm', 'expert/SKILL.md')
 * // 'canard-schemaForm_expert/SKILL.md'
 *
 * toFlatFileName('canard-schemaForm', 'expert/knowledge/api.md')
 * // 'canard-schemaForm_expert/knowledge/api.md'
 * ```
 */
export function toFlatFileName(prefix: string, fileName: string): string {
  const slashIndex = fileName.indexOf('/');
  if (slashIndex === -1) {
    // Single file: prefix_filename
    return `${prefix}_${fileName}`;
  }
  // Directory-based skill: prefix_dirName/rest/of/path
  const dirName = fileName.substring(0, slashIndex);
  const rest = fileName.substring(slashIndex); // includes leading /
  return `${prefix}_${dirName}${rest}`;
}

/**
 * Parses a flat file name back into prefix and original file name.
 * Reverses the transformation done by toFlatFileName.
 * Returns null if the file name doesn't match the expected pattern.
 *
 * @param flatName - Flat file name (e.g., 'canard-schemaForm_guide.md' or 'canard-schemaForm_expert/SKILL.md')
 * @returns Object with prefix and original name, or null if invalid
 *
 * @example
 * ```ts
 * parseFlatFileName('canard-schemaForm_guide.md')
 * // { prefix: 'canard-schemaForm', original: 'guide.md' }
 *
 * parseFlatFileName('canard-schemaForm_expert/SKILL.md')
 * // { prefix: 'canard-schemaForm', original: 'expert/SKILL.md' }
 *
 * parseFlatFileName('canard-schemaForm_expert/knowledge/api.md')
 * // { prefix: 'canard-schemaForm', original: 'expert/knowledge/api.md' }
 *
 * parseFlatFileName('invalid-name.md')
 * // null (no underscore separator)
 * ```
 */
export function parseFlatFileName(
  flatName: string,
): { prefix: string; original: string } | null {
  // Expected pattern: prefix_fileName or prefix_dirName/rest/of/path
  const firstUnderscore = flatName.indexOf('_');

  if (firstUnderscore === -1) {
    return null; // No underscore found
  }

  const prefix = flatName.slice(0, firstUnderscore);
  const original = flatName.slice(firstUnderscore + 1);

  return { prefix, original };
}
