import type { FormatError } from '../../../../src';

/**
 * Build a formatError from a keyword-to-template catalog.
 * @param catalog - Message templates by validator keyword; `{name}` reads the issue detail of that name.
 * @returns A formatter that returns null for a keyword missing from the catalog, so the next issue is tried.
 */
export function createCatalogFormatError(catalog: Readonly<Record<string, string>>): FormatError {
  return (issue) => {
    const template = issue.keyword === undefined ? undefined : catalog[issue.keyword];
    if (template === undefined) return null;
    return template.replace(/\{(\w+)\}/g, (_, name: string) => String(issue.details?.[name] ?? ''));
  };
}
