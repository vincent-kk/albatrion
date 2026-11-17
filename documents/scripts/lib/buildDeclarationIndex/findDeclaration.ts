import { parseRichJSDoc } from '../parseRichJSDoc';
import type { PackageEntry, ParsedFunction } from '../types';

/** The parsed declaration named `declaredName` in `filePath`, parsing each file once. */
export function findDeclaration(
  parsedFiles: Map<string, ParsedFunction[]>,
  filePath: string,
  declaredName: string,
  pkg: PackageEntry,
): ParsedFunction | null {
  let parsed = parsedFiles.get(filePath);
  if (!parsed) {
    parsed = parseRichJSDoc(filePath, pkg.name, pkg.version, '');
    parsedFiles.set(filePath, parsed);
  }
  return parsed.find(item => item.name === declaredName) ?? null;
}
