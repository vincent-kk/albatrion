import { readFileSync } from 'node:fs';

/**
 * Reads the two API conversion tables, using stable heading anchors in either language.
 * @param path - English or translated migration MDX page.
 * @returns Old/new code cells in document order; headers and separator rows are omitted.
 * @throws If a table disappears or a row has no explicit code on either side.
 */
export function readMigrationRows(path: string): string[][] {
  const document = readFileSync(path, 'utf8');
  return ['consumer-names', 'behavior-checks'].flatMap((anchor) => {
    const section = document
      .split(/^## /m)
      .find((value) => value.includes(`{#${anchor}}`));
    if (!section) throw new Error(`Missing migration section: ${anchor}`);
    const lines = section.split('\n').filter((line) => line.startsWith('|'));
    if (lines.length < 3) throw new Error(`Missing migration table: ${anchor}`);
    return lines.slice(2).map((line) => {
      const cells = line.split(/(?<!\\)\|/).slice(1, -1);
      if (cells.length !== 2) throw new Error(`Invalid migration row: ${line}`);
      return cells.map((cell) => {
        const code = [...cell.matchAll(/`([^`]+)`/g)].map((match) => match[1]);
        if (!code.length)
          throw new Error(`Undeclared descriptive cell: ${cell}`);
        return code.join(' / ').replace(/\\\|/g, '|');
      });
    });
  });
}
