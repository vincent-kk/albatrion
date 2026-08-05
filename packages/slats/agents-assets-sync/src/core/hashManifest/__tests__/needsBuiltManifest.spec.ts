// filid:contract AC-MANIFEST-GATE
import { describe, expect, it } from 'vitest';

import { needsBuiltManifest } from '../hashManifest.js';

// Three renderers ask this same question before planning, and one of them is
// the Ink path, which no test drives end to end. Holding the answer in one
// predicate is what puts that path under load: a wrong answer here is red,
// whichever renderer would have asked.
describe('needsBuiltManifest', () => {
  it('reports a manifest-sourced target with no manifest as blocked', () => {
    expect(
      needsBuiltManifest({ hashSource: 'manifest', hashesPresent: false }),
    ).toBe(true);
  });

  it('lets a manifest-sourced target through once the manifest is there', () => {
    expect(
      needsBuiltManifest({ hashSource: 'manifest', hashesPresent: true }),
    ).toBe(false);
  });

  // The whole point of `--asset-path`: the build output is not consulted, so
  // its absence cannot block the run.
  it.each([true, false])(
    'never blocks a directory-sourced target (hashesPresent=%s)',
    (hashesPresent) => {
      expect(
        needsBuiltManifest({ hashSource: 'directory', hashesPresent }),
      ).toBe(false);
    },
  );
});
