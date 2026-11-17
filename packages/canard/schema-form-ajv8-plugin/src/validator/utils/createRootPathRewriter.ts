/**
 * Builds the rewrite from AJV schema paths under a root reference to the authored `#/` fragment.
 * AJV reports the paths of an inlined `$ref` under the reference string; one compiled validator
 * reports the same constant strings on every run, so each rewrite is computed once and reused.
 * @param rootReference - `<reference>/` prefix that stands for the root's `#/`.
 * @returns A function that returns the authored path for a path under the prefix and any other path unchanged.
 */
export const createRootPathRewriter = (rootReference: string) => {
  const rewritten = new Map<string, string>();
  return (schemaPath: string): string => {
    let authored = rewritten.get(schemaPath);
    if (authored === undefined) {
      authored = schemaPath.startsWith(rootReference) ? `#/${schemaPath.slice(rootReference.length)}` : schemaPath;
      rewritten.set(schemaPath, authored);
    }
    return authored;
  };
};
