// CLI-only preparation; run before the quiet window, with committed source snapshots.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { buildMountLedger } from './buildMountLedger.mjs';

assert.equal(
  Number(process.versions.node.split('.')[0]),
  26,
  'Use the final-window Node 26 runtime',
);
const options = { sources: {}, commits: {} };
for (const arg of process.argv.slice(2)) {
  const match = /^--(source|commit)=([A-Za-z0-9_-]+)=(.+)$/.exec(arg);
  if (match) {
    const table = match[1] === 'source' ? options.sources : options.commits;
    assert.equal(table[match[2]], undefined, 'No duplicate lane');
    table[match[2]] = match[3];
  } else {
    assert.ok(arg.startsWith('--root='), 'Unknown argument');
    assert.equal(options.root, undefined);
    options.root = path.resolve(arg.slice(7));
  }
}
assert.ok(options.root && Object.keys(options.sources).length > 0);
assert.deepEqual(
  Object.keys(options.sources).sort(),
  Object.keys(options.commits).sort(),
);
const repository = fileURLToPath(
  new URL('../../../../../../../../', import.meta.url),
);
const relative = path.relative(repository, options.root);
assert.ok(
  relative === '..' ||
    relative.startsWith('..' + path.sep) ||
    path.isAbsolute(relative),
  'Keep execution artifacts outside repository',
);
fs.mkdirSync(options.root, { recursive: false });
const manifests = {};
for (const [lane, source] of Object.entries(options.sources)) {
  const revision = execFileSync(
    'git',
    ['rev-parse', options.commits[lane] + '^{commit}'],
    { cwd: repository, encoding: 'utf8' },
  ).trim();
  const manifest = await buildMountLedger(
    path.resolve(source),
    path.join(options.root, lane),
    path.join(repository, 'node_modules'),
    repository,
    revision,
  );
  const bytes = fs.readFileSync(
    path.join(options.root, lane, 'instrumentation.json'),
  );
  manifests[lane] = {
    revision,
    manifestSha256: createHash('sha256').update(bytes).digest('hex'),
    bundles: manifest.bundles,
  };
}
fs.writeFileSync(
  path.join(options.root, 'mount-inputs.json'),
  JSON.stringify(
    {
      lanes: manifests,
      config: { runs: 10, warmups: 20, samples: 100 },
      fixture: 'mount-oneOf-80',
      node: process.version,
      cpu: os.cpus()[0].model,
      arch: os.arch(),
      preparedAt: new Date().toISOString(),
    },
    null,
    2,
  ) + '\n',
);
console.log('B8_MOUNT_PREPARED');
