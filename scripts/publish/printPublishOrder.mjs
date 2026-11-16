// Run by scripts/publish-packages.sh: reads the rows of
// `yarn workspaces list --json --verbose --no-private` on stdin and prints one
// `name|location` line per workspace to publish, dependencies first.
import { readFileSync } from 'node:fs';

import { orderPublishEntries } from './orderPublishEntries.mjs';

const workspaces = readFileSync(0, 'utf8')
  .split('\n')
  .filter((line) => line.trim() !== '')
  .map((line) => JSON.parse(line));

for (const workspace of orderPublishEntries(workspaces)) {
  console.log(`${workspace.name}|${workspace.location}`);
}
