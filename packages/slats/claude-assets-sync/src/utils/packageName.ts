/**
 * Parse scoped package name into scope and name
 * @param packageName - Package name (e.g., "@canard/schema-form")
 * @returns [scope, name] tuple (e.g., ["@canard", "schema-form"])
 *
 * @example
 * parsePackageName('@canard/schema-form') // ['@canard', 'schema-form']
 * parsePackageName('lodash') // ['', 'lodash']
 */
export function parsePackageName(packageName: string): [string, string] {
  if (packageName.startsWith('@')) {
    const [scope, name] = packageName.split('/');
    return [scope, name];
  }
  return ['', packageName];
}

/**
 * Converts kebab-case string to camelCase
 * @param str - Input string in kebab-case format
 * @returns String in camelCase format
 */
function kebabToCamel(str: string): string {
  return str.replace(/-./g, (match) => match[1].toUpperCase());
}

/**
 * Converts camelCase string to kebab-case
 * @param str - Input string in camelCase format
 * @returns String in kebab-case format
 */
function camelToKebab(str: string): string {
  return str.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`);
}

/**
 * Converts a scoped package name to a flat prefix
 * @param packageName - Scoped package name (e.g., '@canard/schema-form')
 * @returns Flat prefix (e.g., 'canard-schemaForm')
 *
 * @example
 * packageNameToPrefix('@canard/schema-form') // 'canard-schemaForm'
 * packageNameToPrefix('@winglet/react-utils') // 'winglet-reactUtils'
 * packageNameToPrefix('lodash') // 'lodash'
 */
export function packageNameToPrefix(packageName: string): string {
  // Use parsePackageName for consistent parsing
  const [scope, name] = parsePackageName(packageName);

  if (!scope) {
    // Non-scoped package
    return kebabToCamel(name);
  }

  // Scoped package: scope-camelPackageName
  const scopeWithoutAt = scope.replace('@', '');
  const camelName = kebabToCamel(name);
  return `${scopeWithoutAt}-${camelName}`;
}

/**
 * Converts a flat prefix back to package name
 * @param prefix - Flat prefix (e.g., 'canard-schemaForm')
 * @returns Package name (e.g., '@canard/schema-form')
 *
 * @example
 * prefixToPackageName('canard-schemaForm') // '@canard/schema-form'
 * prefixToPackageName('winglet-reactUtils') // '@winglet/react-utils'
 * prefixToPackageName('lodash') // 'lodash'
 */
export function prefixToPackageName(prefix: string): string {
  // Check if prefix contains hyphen (indicates scoped package)
  const firstHyphen = prefix.indexOf('-');

  if (firstHyphen === -1) {
    // No hyphen means non-scoped package (just camelCase to kebab-case)
    return camelToKebab(prefix);
  }

  // Split scope and camelCase name
  const scope = prefix.slice(0, firstHyphen);
  const camelName = prefix.slice(firstHyphen + 1);

  // Convert camelCase back to kebab-case
  const kebabName = camelToKebab(camelName);

  return `@${scope}/${kebabName}`;
}
