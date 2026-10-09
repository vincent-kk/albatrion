import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import fs from 'node:fs';

let loaded;
let bundlesLoaded = 0;
/** Load one verified bundle once per worker process; subsequent forms must reuse that exact file and digest. */
export function loadBundle131(bundle, require) {
  const hash = bytes => createHash('sha256').update(bytes).digest('hex');
  const text = fs.readFileSync(bundle.file, 'utf8');
  assert.equal(hash(text), bundle.sha256, `${bundle.file}: worker SHA-256 mismatch`);
  const bytes = fs.readFileSync(bundle.manifestPath), manifest = JSON.parse(bytes);
  assert.equal(hash(bytes), bundle.manifestSha256, 'Worker manifest changed');
  const entries = Array.isArray(manifest) ? manifest : manifest.bundles;
  const entry = entries.find(item => item.sha256 === bundle.sha256);
  assert(entry && entry.revision === bundle.revision, 'Worker base revision mismatch');
  assert.equal(manifest.baseRevision ?? manifest.head ?? manifest.revision ?? entry.revision, bundle.revision, 'Worker manifest base revision mismatch');
  if (loaded) assert.equal(loaded.file, bundle.file, 'Never mix bundles in one process');
  else {
    const module = { exports: {} };
    new Function('require', 'module', 'exports', text)(require, module, module.exports);
    bundlesLoaded++;
    loaded = { file: bundle.file, api: module.exports };
  }
  return { api: loaded.api, text, manifestText: bytes.toString(), entry, bundlesLoaded };
}
