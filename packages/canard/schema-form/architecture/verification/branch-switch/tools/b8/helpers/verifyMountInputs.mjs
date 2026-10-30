import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

/** Recheck immutable manifests and bundles before executing any prepared input. */
export function verifyMountInputs(root) {
  const bytes = fs.readFileSync(path.join(root, 'mount-inputs.json'));
  const inputs = JSON.parse(bytes);
  assert.deepEqual(inputs.config, { runs: 10, warmups: 20, samples: 100 });
  assert.equal(inputs.fixture, 'mount-oneOf-80');
  assert.equal(
    inputs.node,
    process.version,
    'Preparation and execution use identical Node',
  );
  for (const [lane, details] of Object.entries(inputs.lanes)) {
    assert.match(lane, /^[A-Za-z0-9_-]+$/);
    const manifestBytes = fs.readFileSync(
      path.join(root, lane, 'instrumentation.json'),
    );
    assert.equal(
      createHash('sha256').update(manifestBytes).digest('hex'),
      details.manifestSha256,
    );
    const manifest = JSON.parse(manifestBytes);
    assert.equal(manifest.revision, details.revision);
    assert.deepEqual(manifest.bundles, details.bundles);
    for (const [name, digest] of Object.entries(details.bundles)) {
      assert.ok(
        ['unwrapped.mjs', 'wrapped.mjs', 'detailed.mjs'].includes(name),
      );
      const bundle = fs.readFileSync(path.join(root, lane, name));
      assert.equal(bundle.length, digest.bytes);
      assert.equal(
        createHash('sha256').update(bundle).digest('hex'),
        digest.sha256,
      );
    }
  }
  return { inputs, sha256: createHash('sha256').update(bytes).digest('hex') };
}
