import { existsSync, lstatSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

/** Read destination bytes independently of the reported execution plan.
 * @param root Fixture project containing only the scenario's destination trees.
 * @param relatives Destination paths; recursion narrows the default roots.
 * @returns Hexadecimal bytes by project-relative path, omitting directory links.
 */
export function readWrittenFiles(
  root: string,
  relatives: readonly string[] = ['.claude', '.agents', 'AGENTS.md'],
): Record<string, string> {
  const files: Record<string, string> = {};
  for (const relative of relatives) {
    const absolute = join(root, relative);
    if (!existsSync(absolute)) continue;
    const entry = lstatSync(absolute);
    if (entry.isDirectory())
      Object.assign(
        files,
        readWrittenFiles(
          root,
          readdirSync(absolute).map((name) => `${relative}/${name}`),
        ),
      );
    else if (relative === 'AGENTS.md' || entry.isFile())
      files[relative] = readFileSync(absolute).toString('hex');
  }
  return files;
}
