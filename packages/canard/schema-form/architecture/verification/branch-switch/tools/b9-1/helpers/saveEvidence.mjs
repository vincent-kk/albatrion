import fs from 'node:fs';
import path from 'node:path';
import { gzipSync } from 'node:zlib';

import { json } from '../../b9-0/files.mjs';
import { portableEvidence } from './portableEvidence.mjs';

/** Save portable summaries and complete compressed samples after the only measurement window. */
export function saveEvidence(root, output, reports, samples) {
  fs.mkdirSync(output, { recursive: true });
  for (const [name, value] of Object.entries(reports))
    json(path.join(output, name + '.json'), portableEvidence(value));
  for (const [name, value] of Object.entries(samples))
    fs.writeFileSync(
      path.join(output, name + '.json.gz'),
      gzipSync(JSON.stringify(portableEvidence(value)) + '\n'),
    );
  const checks = path.join(root, 'cpu-prechecks');
  const prechecks = fs
    .readdirSync(checks)
    .filter((name) => name.endsWith('.json'))
    .map((name) => ({
      name,
      ...JSON.parse(fs.readFileSync(path.join(checks, name), 'utf8')),
    }));
  fs.writeFileSync(
    path.join(output, 'cpu-prechecks.json.gz'),
    gzipSync(JSON.stringify(portableEvidence(prechecks)) + '\n'),
  );
}
