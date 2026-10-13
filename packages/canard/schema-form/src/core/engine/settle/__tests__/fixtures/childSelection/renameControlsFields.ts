/**
 * Make source from a revision that still reads `controls.children` read `controls.fields` instead.
 * Only the authored key and its schema paths changed, so a pinned revision renamed this way accepts the current corpus
 * and reports the same paths and detail keys as the working tree.
 * @param text - TypeScript source from the pinned revision
 * @param path - Repository-relative path of that source; the closed key list is renamed only in its validator
 * @returns The same source reading `controls.fields`
 */
export const renameControlsFields = (text: string, path: string): string => {
  const renamed = text
    .replace(/controls(\??)\.children\b/g, 'controls$1.fields')
    .replace(
      /Reflect\.get\(controls, 'children'\)/g,
      "Reflect.get(controls, 'fields')",
    )
    .replace(/\/controls\/children\b/g, '/controls/fields')
    .replace(/key: 'children'/g, "key: 'fields'");
  return path.endsWith('/validateControlGroups.ts')
    ? renamed.replace(/^ {2}'children',$/m, "  'fields',")
    : renamed;
};
