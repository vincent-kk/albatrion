import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';

/**
 * Decode one immutable source/observation record without consulting repository history.
 * @param {any} snapshot Snapshot set with an origin commit and file records.
 * @param {string} relative Repository-relative source key or observation-root-relative key.
 * @returns Exact decoded bytes after validating the record's encoding, origin and SHA-256.
 * @throws For a missing record, mismatched origin, invalid encoding or altered bytes.
 */
export function readSnapshotBytes(snapshot, relative) {
  const record = snapshot.files[relative];
  assert.ok(record, 'Snapshot entry exists: ' + relative);
  assert.equal(record.sourceCommit, snapshot.sourceCommit);
  assert.equal(record.encoding, 'base64');
  const bytes = Buffer.from(record.data, 'base64');
  assert.equal(
    createHash('sha256').update(bytes).digest('hex'),
    record.sha256,
    'Snapshot byte hash: ' + relative,
  );
  return bytes;
}
