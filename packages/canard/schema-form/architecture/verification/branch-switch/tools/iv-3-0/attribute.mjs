// Invoked by profile.mjs or directly with a prepared row directory; emits portable parsed tables.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { attributeSamples } from './helpers/attributeSamples.mjs';

const directory = path.resolve(process.argv[2]);
const here = path.dirname(fileURLToPath(import.meta.url));
const mapping = JSON.parse(
  fs.readFileSync(path.join(here, 'branches.json'), 'utf8'),
);
const profileFile = fs
  .readdirSync(directory)
  .find((name) => name.endsWith('.cpuprofile'));
const profile = JSON.parse(
  fs.readFileSync(path.join(directory, profileFile), 'utf8'),
);
const wall = JSON.parse(
  fs.readFileSync(path.join(directory, 'wall.json'), 'utf8'),
);
const bundle = fs.readFileSync(
  path.join(directory, '../../engine.mjs'),
  'utf8',
);
const summary = attributeSamples(profile, wall, mapping, bundle);
fs.writeFileSync(
  path.join(directory, 'tables.json'),
  JSON.stringify(summary, null, 2) + '\n',
);
console.log(
  JSON.stringify({
    row: summary.row,
    wall: summary.wallMedianUs,
    self: summary.selfUsPerSwitch,
    ratio: summary.reconciliationRatio,
    reconciled: summary.reconciled,
  }),
);
