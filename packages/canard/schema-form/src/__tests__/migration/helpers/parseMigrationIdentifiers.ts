/**
 * Expands table shorthand without searching declaration text or comments.
 * @param cell - Code spans from one conversion cell, joined with slashes.
 * @returns Qualified identifiers, preserving hook calls as return-type access.
 * @throws If a cell uses syntax outside the explicit migration notation.
 */
export function parseMigrationIdentifiers(cell: string): string[] {
  // The visibility table permits a return-key cell abbreviated without its hook name.
  let owner = cell.startsWith('.') ? 'useChildFieldErrors()' : '';
  return (
    cell
      // This explicit descriptive annotation disambiguates the exported issue type.
      .replace(' (issue type)', '')
      .split(/\s*[/|]\s*/)
      .flatMap((part) => {
        const assignment = part.match(/^(\w+)=\{([^}]+)\}$/);
        if (assignment) {
          // Boolean literals are JSX values, not API identifiers.
          return /^(true|false)$/.test(assignment[2])
            ? [assignment[1]]
            : [assignment[1], assignment[2]];
        }
        const identifier = part.replace(/\((?:true|false)?\)$/, '');
        if (!/^\.?\w+(?:\(\))?(?:\.\w+)*$/.test(identifier))
          throw new Error(`Unrecognized migration notation: ${part}`);
        if (identifier.startsWith('.')) return [owner + identifier];
        if (!identifier.includes('.'))
          return [owner ? `${owner}.${identifier}` : identifier];
        owner = identifier.slice(0, identifier.lastIndexOf('.'));
        return [identifier];
      })
  );
}
