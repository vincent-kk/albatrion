/**
 * Name transformation utilities for Claude assets synchronization
 * Handles conversion between package names and flat file naming conventions
 */
import { packageNameToPrefix as packageNameToPrefixUtil } from './packageName';

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
 * Converts a scoped package name to a flat prefix
 * @deprecated Import from './packageName' instead
 * @param packageName - Scoped package name (e.g., '@canard/schema-form')
 * @returns Flat prefix (e.g., 'canard-schemaForm')
 *
 * @example
 * ```ts
 * packageNameToPrefix('@canard/schema-form') // 'canard-schemaForm'
 * packageNameToPrefix('@canard/schema-form-plugin') // 'canard-schemaFormPlugin'
 * packageNameToPrefix('@winglet/react-utils') // 'winglet-reactUtils'
 * packageNameToPrefix('@lerx/promise-modal') // 'lerx-promiseModal'
 * ```
 */
export const packageNameToPrefix = packageNameToPrefixUtil;

/**
 * Creates a flat file name by combining prefix and original file name
 *
 * @param prefix - Package prefix (e.g., 'canard-schemaForm')
 * @param fileName - Original file name (e.g., 'guide.md')
 * @returns Flat file name (e.g., 'canard-schemaForm_guide.md')
 *
 * @example
 * ```ts
 * toFlatFileName('canard-schemaForm', 'guide.md') // 'canard-schemaForm_guide.md'
 * toFlatFileName('winglet-reactUtils', 'README.md') // 'winglet-reactUtils_README.md'
 * toFlatFileName('lerx-promiseModal', 'api/types.md') // 'lerx-promiseModal_api_types.md'
 * ```
 */
export function toFlatFileName(prefix: string, fileName: string): string {
  // Replace path separators with underscores for flat structure
  const flatFileName = fileName.replace(/[/\\]/g, '_');
  return `${prefix}_${flatFileName}`;
}

/**
 * Parses a flat file name back into prefix and original file name
 * Returns null if the file name doesn't match the expected pattern
 *
 * @param flatName - Flat file name (e.g., 'canard-schemaForm_guide.md')
 * @returns Object with prefix and original name, or null if invalid
 *
 * @example
 * ```ts
 * parseFlatFileName('canard-schemaForm_guide.md')
 * // { prefix: 'canard-schemaForm', original: 'guide.md' }
 *
 * parseFlatFileName('winglet-reactUtils_README.md')
 * // { prefix: 'winglet-reactUtils', original: 'README.md' }
 *
 * parseFlatFileName('lerx-promiseModal_api_types.md')
 * // { prefix: 'lerx-promiseModal', original: 'api/types.md' }
 *
 * parseFlatFileName('invalid-name.md')
 * // null (no underscore separator)
 * ```
 */
export function parseFlatFileName(
  flatName: string,
): { prefix: string; original: string } | null {
  // Expected pattern: prefix_fileName (at least one underscore)
  const firstUnderscore = flatName.indexOf('_');

  if (firstUnderscore === -1) {
    return null; // No underscore found
  }

  const prefix = flatName.slice(0, firstUnderscore);
  const flatFileName = flatName.slice(firstUnderscore + 1);

  // Convert underscores back to path separators
  // Note: We use forward slash for cross-platform compatibility
  const original = flatFileName.replace(/_/g, '/');

  return { prefix, original };
}
