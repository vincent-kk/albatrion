import assert from 'node:assert/strict';

/**
 * Derive regime comparisons and bounded decision readings from independently preserved observations.
 * @param {any[]} tables Updated leaf self tables and plain control summaries.
 * @param {any} stackTimes Inclusive brackets keyed by canonical row ID.
 * @param {any} windowRaw Parsed micro-hygiene short-window raw samples (same product, B lane).
 * @param {any} iv2Raw Parsed IV-2 candidate-1 raw samples (A first half, reference only).
 * @returns Raw-derived scale ratios, threshold shares, B floor estimate and next-design evidence.
 * @throws If raw process minima disagree with their archived window summary.
 */
export function deriveInterpretation(tables, stackTimes, windowRaw, iv2Raw) {
  const scales = [];
  for (const row of [
    'switch-oneOf-80',
    'switch-siblings-0',
    'single-flat-1000',
  ]) {
    const unit = row === 'single-flat-1000' ? 10 : 1;
    const table = tables.find((entry) => entry.row === row);
    const minima = windowRaw.results
      .filter((entry) => entry.row === row && entry.lane === 'B')
      .map((entry) => Math.min(...entry.samples.current))
      .sort((a, b) => a - b);
    const windowUs =
      (((minima[(minima.length - 1) >> 1] + minima[minima.length >> 1]) / 2) *
        1000) /
      unit;
    const iv2Minima = iv2Raw.results
      .filter(
        (entry) =>
          entry.row === row &&
          entry.lane === 'A' &&
          entry.repeat < iv2Raw.config.runs / 2,
      )
      .map((entry) => Math.min(...entry.samples.current))
      .sort((a, b) => a - b);
    const iv2Us =
      (((iv2Minima[(iv2Minima.length - 1) >> 1] +
        iv2Minima[iv2Minima.length >> 1]) /
        2) *
        1000) /
      unit;
    assert.ok(
      Math.abs(
        windowUs -
          (windowRaw.rows.find((entry) => entry.id === row).B.ms * 1000) / unit,
      ) < 1e-8,
    );
    assert.ok(
      Math.abs(
        iv2Us -
          (iv2Raw.rows.find((entry) => entry.id === row).A.ms * 1000) / unit,
      ) < 1e-8,
    );
    scales.push({
      row,
      windowUs,
      iv2Us,
      plainMedianUs: table.plain.wallMedianUs,
      plainMeanUs: table.plain.wallMeanUs,
      windowOverPlainMedian: windowUs / table.plain.wallMedianUs,
      iv2OverPlainMedian: iv2Us / table.plain.wallMedianUs,
      thresholdSharePercent: (15 / windowUs) * 100,
    });
  }
  const oneOf = tables.find((entry) => entry.row === 'switch-oneOf-80');
  const siblings = tables.find((entry) => entry.row === 'switch-siblings-0');
  const flat = tables.find((entry) => entry.row === 'single-flat-1000');
  const siblingWindow = scales.find(
    (entry) => entry.row === siblings.row,
  ).windowUs;
  const oneOfWindow = scales.find((entry) => entry.row === oneOf.row).windowUs;
  const bodyUs = siblings.table
    .filter((entry) => entry.name === 'computeNodeBody')
    .reduce((sum, entry) => sum + entry.selfUsPerSwitch, 0);
  const floorEstimateUs =
    flat.decisions.B -
    flat.table
      .filter((entry) => entry.name === 'computeNodeBody')
      .reduce((sum, entry) => sum + entry.selfUsPerSwitch, 0);
  const sameBasisProfileUs = Math.max(
    0,
    siblings.decisions.B - flat.decisions.B,
  );
  const bReadings = [
    { label: '수정 전 self 합', profileUs: siblings.decisions.B - bodyUs },
    { label: 'computeNodeBody 포함 self 합', profileUs: siblings.decisions.B },
    {
      label: '포함 시간(쓰기 바닥 포함·게이트/수명 제외)',
      profileUs: stackTimes[siblings.row].bInclusiveUs,
    },
    {
      label: '귀속 가능한 추정(self에서 잎 쓰기 바닥 제외)',
      profileUs: Math.max(0, siblings.decisions.B - floorEstimateUs),
    },
  ].map((reading) => ({
    ...reading,
    sharePercent: (reading.profileUs / siblings.selfUsPerSwitch) * 100,
    windowScaleUs:
      (reading.profileUs / siblings.selfUsPerSwitch) * siblingWindow,
  }));
  const dependencyNames = [
    'affectedByPresence',
    'collect',
    'pathSegments',
    'emit',
    'affectedForRegistration',
  ];
  const dependencyFrames = [
    { name: 'affectedByPresence', line: 5674 },
    { name: 'collect', line: 5561 },
    { name: 'pathSegments', line: 5395 },
    { name: 'emit', line: 5610 },
    { name: 'affectedForRegistration', line: 5557 },
  ];
  const dependencies = tables.map((table) => ({
    row: table.row,
    selfUs: table.table
      .filter(
        (entry) =>
          entry.source ===
            'src/core/engine/settle/utils/dependencies/getDependencyIndex.ts' &&
          dependencyFrames.some(
            (frame) => frame.name === entry.name && frame.line === entry.line,
          ),
      )
      .reduce((sum, entry) => sum + entry.selfUsPerSwitch, 0),
    allNamedFramesUs: table.table
      .filter(
        (entry) =>
          entry.source ===
            'src/core/engine/settle/utils/dependencies/getDependencyIndex.ts' &&
          dependencyNames.includes(entry.name),
      )
      .reduce((sum, entry) => sum + entry.selfUsPerSwitch, 0),
  }));
  return {
    method:
      'Post-hoc remapping of unchanged committed profiles; no new sampling',
    scales,
    bReadings,
    floorEstimateUs,
    sameBasisFloor: {
      floorUs: flat.decisions.B,
      profileUs: sameBasisProfileUs,
      sharePercent: (sameBasisProfileUs / siblings.selfUsPerSwitch) * 100,
      windowScaleUs:
        (sameBasisProfileUs / siblings.selfUsPerSwitch) * siblingWindow,
    },
    floorEstimateSource:
      'Original single-flat B self before computeNodeBody remap; different fixture, not a causal subtraction or measured siblings no-op',
    a: {
      profileUs: oneOf.decisions.A,
      sharePercent: (oneOf.decisions.A / oneOf.selfUsPerSwitch) * 100,
      windowScaleUs: (oneOf.decisions.A / oneOf.selfUsPerSwitch) * oneOfWindow,
    },
    dependencies,
    dependencyNames,
    dependencyFrames,
    dependencyFrameEvidence:
      'Five source-qualified frames used by the independent results review; two other local callbacks are also named emit (bundle lines 5571 and 5601) and are reported separately in allNamedFramesUs',
    stackTimes,
  };
}
