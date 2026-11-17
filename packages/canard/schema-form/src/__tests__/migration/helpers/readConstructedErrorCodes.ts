import { readFileSync } from 'node:fs';

/** Read literal error constructor calls qualified by their BaseError wrapper's group.
 * @param bundlePath - Published ESM bundle beside the baseline declaration entry.
 * @returns Constructed codes; a missing bundle throws and unsupported shapes contribute none. */
export function readConstructedErrorCodes(bundlePath: string): Set<string> {
  const bundle = readFileSync(bundlePath, 'utf8');
  const groups = new Map<string, string>();
  for (const match of bundle.matchAll(
    /\b(?:var|const|let)\s+(\w+)\s*=\s*class\s+extends\s+BaseError\s*\{\s*constructor\([^)]*\)\s*\{\s*super\((['"])([^'"]+)\2\s*,\s*code\b/g,
  ))
    groups.set(match[1], match[3]);

  const codes = new Set<string>();
  for (const match of bundle.matchAll(
    /\bnew\s+(\w+)\s*\(\s*(['"])([^'"]+)\2/g,
  )) {
    const group = groups.get(match[1]);
    if (group) codes.add(`${group}.${match[3]}`);
  }
  return codes;
}
