// Publish independently reviewable floor and owner tables from the checked summary.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import { read } from '../b9-0/files.mjs';

const output = path.resolve(process.argv[2]);
const summary = read(path.join(output, 'summary.json'));
const sections = {
  floor: summary.timings.map((row) => ({
    row: row.row,
    variant: row.variant,
    ...row.modes.wrapped,
  })),
  owners: summary.timings
    .filter((row) => row.variant === 'switch')
    .map((row) => ({ row: row.row, ...row.modes.details })),
};
for (const [name, value] of Object.entries(sections)) {
  const text = JSON.stringify(value, null, 2) + '\n';
  if (process.argv[3] === '--check')
    assert.equal(
      fs.readFileSync(path.join(output, name + '.json'), 'utf8'),
      text,
    );
  else fs.writeFileSync(path.join(output, name + '.json'), text);
}
console.log('IV_0_TIMING_PUBLICATION_OK floor=6 owners=2');
