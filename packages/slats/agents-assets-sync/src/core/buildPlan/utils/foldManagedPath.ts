/**
 * Groups canonical and case-mapped spellings as candidates for filesystem proof.
 * @param path - manifest-relative spelling whose aliases may be managed
 * @returns a stable normalization key; equality alone never proves file identity
 */
export function foldManagedPath(path: string): string {
  let folded = path.normalize('NFD');
  while (true) {
    const next = folded.toUpperCase().toLowerCase().normalize('NFD');
    if (next === folded) return folded;
    folded = next;
  }
}
