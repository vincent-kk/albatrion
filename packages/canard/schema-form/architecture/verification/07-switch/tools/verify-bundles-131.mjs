import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

/** Resolve bundle prefixes against adjacent manifests and check bytes, SHA-256 and consistent base provenance. */
export function verifyBundles131(options) {
  const hash = bytes => createHash('sha256').update(bytes).digest('hex');
  const resolve = prefix => {
    const file = path.resolve(prefix.endsWith('.cjs') ? prefix : `${prefix}.cjs`), directory = path.dirname(file);
    const manifests = fs.readdirSync(directory).filter(name => /(?:manifest|bundles)\.json$/.test(name)).sort();
    const matches = [];
    for (const name of manifests) {
      const manifestPath = path.join(directory, name), bytes = fs.readFileSync(manifestPath);
      const manifest = JSON.parse(bytes), entries = Array.isArray(manifest) ? manifest : manifest.bundles;
      if (!Array.isArray(entries)) continue;
      for (const entry of entries) {
        const entryFile = entry.file ? path.resolve(directory, entry.file) : path.join(directory, `c-${entry.variant}.cjs`);
        if (entryFile !== file) continue;
        const revision = manifest.baseRevision ?? manifest.head ?? manifest.revision ?? entry.revision;
        assert.match(revision ?? '', /^[a-f0-9]{40}$/, `${name}: missing full base revision`);
        assert.equal(entry.revision, revision, `${name}: entry revision differs from manifest base revision`);
        const content = fs.readFileSync(file);
        assert.equal(hash(content), entry.sha256, `${file}: SHA-256 mismatch against ${name}`);
        if (entry.bytes !== undefined) assert.equal(content.length, entry.bytes, `${file}: byte count mismatch`);
        matches.push({ file, sha256: entry.sha256, bytes: content.length, revision, manifestPath, manifestSha256: hash(bytes) });
      }
    }
    assert(matches.length, `${file}: no build manifest entry found`);
    assert(matches.every(entry => entry.sha256 === matches[0].sha256 && entry.revision === matches[0].revision), `${file}: contradictory manifests`);
    return matches[0];
  };
  const base = resolve(options.base), candidate = resolve(options.candidate);
  assert.equal(base.revision, candidate.revision, 'Bundle base revisions differ');
  assert.notEqual(base.file, candidate.file, 'Use two separately manifested bundle files');
  if (options.kind === 'aa') {
    const text = fs.readFileSync(base.file, 'utf8'), copy = fs.readFileSync(candidate.file, 'utf8');
    assert(copy.startsWith(text) && /^\/\/[^\n]*\n$/.test(copy.slice(text.length)), 'A/A candidate must be base plus one trailing comment line');
  }
  return { base, candidate, baseRevision: base.revision };
}
