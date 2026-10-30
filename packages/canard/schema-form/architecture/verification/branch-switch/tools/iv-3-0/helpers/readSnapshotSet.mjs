import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

/**
 * Read a manifest-pinned immutable byte snapshot from the committed raw directory.
 * @param {string} root Published IV-3-0 observation root with a snapshots directory.
 * @param {string} name One of measurement-tools.json or original-observations.json.
 * @returns Parsed snapshot set whose container hash and provenance match its manifest.
 * @throws For an unsupported set, unreadable files, hash mismatch or mismatched provenance.
 */
export function readSnapshotSet(root, name) {
  assert.ok(
    ['measurement-tools.json', 'original-observations.json'].includes(name),
  );
  const manifest = JSON.parse(
    fs.readFileSync(path.join(root, 'snapshots/manifest.json'), 'utf8'),
  );
  const bytes = fs.readFileSync(path.join(root, 'snapshots', name));
  assert.equal(
    createHash('sha256').update(bytes).digest('hex'),
    manifest.files[name].sha256,
  );
  const snapshot = JSON.parse(bytes.toString());
  assert.equal(snapshot.sourceCommit, manifest.files[name].sourceCommit);
  assert.equal(
    Object.keys(snapshot.files).length,
    manifest.files[name].fileCount,
  );
  return snapshot;
}
