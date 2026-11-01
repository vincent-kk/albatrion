import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

/** Require clean successful B/S builds next to inputs, bound to both commit and frozen product hash. */
export function checkStageClosingBuildRecord(
  root: string,
  bundles: Record<string, { commit: string; product: { sha256: string } }>,
) {
  const record = JSON.parse(
    fs.readFileSync(path.join(root, 'clean-build-record.json'), 'utf8'),
  );
  for (const lane of ['B', 'S']) {
    const build = record.lanes?.[lane];
    assert.ok(build, 'Clean build record for ' + lane);
    assert.equal(
      build.cleanProductScope,
      true,
      'Clean product scope for ' + lane,
    );
    assert.equal(build.exitCode, 0, 'Successful build for ' + lane);
    assert.equal(
      build.commit,
      bundles[lane].commit,
      'Build commit for ' + lane,
    );
    assert.equal(
      build.product?.sha256,
      bundles[lane].product.sha256,
      'Build product hash for ' + lane,
    );
  }
}
