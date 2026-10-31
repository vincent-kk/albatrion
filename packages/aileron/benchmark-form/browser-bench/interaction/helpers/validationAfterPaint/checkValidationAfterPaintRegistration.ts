import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';

import { REGISTERED_ROUND6_RULES } from './registeredRound6Rules';

/** Round-6 starts strictly after this registered cutoff require F source proof. */
const SOURCE_PROOF_CUTOFF = Date.parse('2026-10-31T15:19:10Z');

/** Validate window registration without rewriting historical measurement metadata.
 * @param inputs - Frozen rule metadata and the F product source identity.
 * @param window - Formal start, quiet observation start, and measured tool commit.
 * @param repositoryRoot - Git top level used for repository-relative path filters.
 * @returns Supported rule version, or undefined for the original window.
 * @throws {Error} If metadata, registration timing or required source proof is invalid, or a Git command fails. */
export function checkValidationAfterPaintRegistration(
  inputs: {
    preregisteredCommit: string;
    ruleVersion?: string;
    rulesSha256?: string;
    sourceProof?: { F?: string };
    bundles: { F: { commit: string } };
  },
  window: { at: string; quietStartedAt: string; toolCommit: string },
  repositoryRoot: string,
) {
  const round6 = inputs.preregisteredCommit === REGISTERED_ROUND6_RULES.commit;
  if (
    (inputs.ruleVersion &&
      inputs.ruleVersion !== REGISTERED_ROUND6_RULES.version) ||
    (round6 && Date.parse(window.at) > SOURCE_PROOF_CUTOFF)
  ) {
    assert.ok(
      typeof inputs.sourceProof?.F === 'string' &&
        inputs.sourceProof.F.trim().length > 0,
      'F source proof must be non-empty for this window',
    );
    const sourceTree = execFileSync(
      'git',
      [
        'ls-tree',
        '-r',
        inputs.bundles.F.commit,
        '--',
        'packages/canard/schema-form/src',
      ],
      { cwd: repositoryRoot, encoding: 'utf8' },
    ).trim();
    assert.equal(
      inputs.sourceProof.F,
      sourceTree,
      'F source proof must match the committed product tree',
    );
  }
  const registeredAt = execFileSync(
    'git',
    ['show', '-s', '--format=%cI', REGISTERED_ROUND6_RULES.commit],
    { cwd: repositoryRoot, encoding: 'utf8' },
  ).trim();
  if (round6) {
    assert.equal(
      inputs.ruleVersion,
      REGISTERED_ROUND6_RULES.version,
      'Unsupported validation-after-paint rule version',
    );
    const committed = execFileSync(
      'git',
      [
        'show',
        inputs.preregisteredCommit +
          ':' +
          REGISTERED_ROUND6_RULES.verificationPath,
      ],
      { cwd: repositoryRoot },
    );
    assert.equal(
      createHash('sha256').update(committed).digest('hex'),
      inputs.rulesSha256,
    );
    execFileSync(
      'git',
      [
        'merge-base',
        '--is-ancestor',
        inputs.preregisteredCommit,
        window.toolCommit,
      ],
      { cwd: repositoryRoot },
    );
    assert.ok(Date.parse(window.at) >= Date.parse(registeredAt));
    assert.ok(
      Date.parse(window.quietStartedAt) >= Date.parse(registeredAt),
      'Quiet observation must start at or after rule registration',
    );
  } else {
    assert.equal(inputs.preregisteredCommit, 'cfd4a9e2a');
    assert.equal(inputs.ruleVersion, undefined);
    assert.ok(
      Date.parse(window.at) < Date.parse(registeredAt),
      'Original-rule window must start before round-6 registration',
    );
  }
  return round6 ? REGISTERED_ROUND6_RULES.version : undefined;
}
