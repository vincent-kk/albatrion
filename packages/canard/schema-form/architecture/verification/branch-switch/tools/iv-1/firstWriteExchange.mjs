// Postprocess only: existing frozen summary inputs and product bundles stay unchanged.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

/**
 * Charge deferred blueprint scope construction once per mounted session.
 * @param {object} judgment - Validated immutable window judgment
 * @param {object} scopeCost - Separately measured warm construction records
 * @returns {object} Original and adjusted exchanges, mount verdicts and adoption
 */
export function firstWriteExchange(judgment, scopeCost) {
  const ids = ['mount-oneOf-80', 'mount-flat-1000', 'mount-nested-d6-f4'];
  const additions = ids.map((id) => {
    const record = scopeCost.records.find((row) => row.row === id);
    const measured = judgment.weightedExchange.rows.find(
      (row) => row.row === id,
    );
    assert.ok(record && measured && measured.mount);
    assert.equal(measured.weight, 1);
    assert.equal(measured.eventsPerSample, 1);
    assert.ok(Number.isFinite(record.medianUs) && record.medianUs >= 0);
    return {
      row: id,
      entries: record.entries,
      medianUs: record.medianUs,
      weight: 1,
      contributionUs: record.medianUs,
      BWithFirstWriteUs: measured.BUs + record.medianUs,
      basis:
        'One first write per blueprint at the same session frequency as one mount; A has no scope table.',
    };
  });
  const originalTotalUs = judgment.weightedExchange.totalUs;
  assert.ok(Number.isFinite(originalTotalUs));
  const addedTotalUs = additions.reduce(
    (sum, row) => sum + row.contributionUs,
    0,
  );
  const adjustedTotalUs = originalTotalUs + addedTotalUs;
  const mountRows = judgment.weightedExchange.rows
    .filter((row) => ids.includes(row.row))
    .map((row) => {
      const verdict =
        row.decision === 'regressed'
          ? adjustedTotalUs < 0
            ? 'exchange-allowed'
            : 'regressed'
          : row.verdict;
      return {
        row: row.row,
        decision: row.decision,
        verdict,
        passed: verdict !== 'regressed',
      };
    });
  const zeroRejected = adjustedTotalUs === 0;
  return {
    originalTotalUs,
    additions,
    addedTotalUs,
    adjustedTotalUs,
    weightedAUs: judgment.weightedExchange.weightedAUs,
    adjustedRelativePercent:
      (100 * adjustedTotalUs) / judgment.weightedExchange.weightedAUs,
    mountRows,
    originalAdoptable: judgment.adoptable,
    zeroRejected,
    adjustedAdoptable:
      judgment.adoptable &&
      adjustedTotalUs <= 0 &&
      !zeroRejected &&
      mountRows.every((row) => row.passed),
    method:
      'verification.md bacb708e7 auxiliary rules: add warm construction medians only to B once per mounted session; rejudge regressed mounts with the adjusted exchange and reject an exact zero.',
    caveat:
      'Warm repeated construction medians may underestimate cold first-write construction latency.',
  };
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href
) {
  const root = path.resolve(process.argv[2]);
  const judgment = JSON.parse(
    fs.readFileSync(path.join(root, 'judgment.json'), 'utf8'),
  );
  const scopeCost = JSON.parse(
    fs.readFileSync(path.join(root, 'scope-build-cost.json'), 'utf8'),
  );
  const adjusted = firstWriteExchange(judgment, scopeCost);
  fs.writeFileSync(
    path.join(root, 'first-write-exchange.json'),
    JSON.stringify(adjusted, null, 2) + '\n',
  );
  console.log('IV_1_FIRST_WRITE_EXCHANGE ' + JSON.stringify(adjusted));
}
