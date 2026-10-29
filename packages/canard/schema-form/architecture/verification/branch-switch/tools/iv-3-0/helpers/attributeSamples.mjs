import assert from 'node:assert/strict';

import { summarizePeriods } from './summarizePeriods.mjs';
import { summarizeWall } from './summarizeWall.mjs';

/**
 * Attribute measured leaf samples with next-sample timeDeltas; never normalize to wall time.
 * @param {any} profile Parsed CpuProfile with aligned samples, timeDeltas and monotonic startTime.
 * @param {any} wall Measured blocks and operation counts from the same process.
 * @param {any} mapping Hand-reviewed exact-name, source and frame-location branch rules.
 * @param {string} bundle Exact prepared engine bytes whose region markers identify source modules.
 * @param {any} [plainWall] Separate collector-free worker with identical operation counts and fixture.
 * @returns Weighted bottom-up self tables, decisions, period diagnostics and mean-wall reconciliation.
 * @throws For invalid sample lengths/counts, unaligned clocks, missing nodes or absent product frames.
 */
export function attributeSamples(profile, wall, mapping, bundle, plainWall) {
  assert.equal(profile.samples.length, profile.timeDeltas.length);
  assert.equal(
    wall.blocks.reduce((sum, block) => sum + block.switches, 0),
    wall.switches,
  );
  const nodes = new Map(profile.nodes.map((node) => [node.id, node]));
  const lines = bundle.split('\n');
  const sourceAtLine = [];
  let source = '';
  for (const line of lines) {
    if (line.startsWith('//#region ')) source = line.slice(10);
    sourceAtLine.push(source);
  }
  const functions = new Map();
  let timestamp = profile.startTime,
    blockIndex = 0,
    selected = 0,
    excluded = 0,
    activeWeightUs = 0,
    excludedWeightUs = 0;
  const periods = [];
  for (let index = 0; index < profile.samples.length; index++) {
    timestamp += profile.timeDeltas[index];
    while (
      blockIndex < wall.blocks.length &&
      timestamp > wall.blocks[blockIndex].endUs
    )
      blockIndex++;
    const block = wall.blocks[blockIndex];
    if (!block || timestamp < block.startUs) continue;
    const weightUs = profile.timeDeltas[index + 1] ?? profile.timeDeltas[index];
    periods.push(weightUs);
    selected++;
    const node = nodes.get(profile.samples[index]);
    assert.ok(node);
    const frame = node.callFrame;
    if (['(program)', '(idle)'].includes(frame.functionName)) {
      excluded++;
      excludedWeightUs += weightUs;
      continue;
    }
    const key = JSON.stringify([
      frame.functionName,
      frame.url,
      frame.lineNumber,
    ]);
    const entry = functions.get(key) ?? {
      name: frame.functionName || '(anonymous)',
      url: frame.url,
      line: frame.lineNumber + 1,
      source:
        frame.url === 'prepared/engine.mjs'
          ? (sourceAtLine[frame.lineNumber] ?? '')
          : '',
      samples: 0,
      weightUs: 0,
    };
    entry.samples++;
    entry.weightUs += weightUs;
    activeWeightUs += weightUs;
    functions.set(key, entry);
  }
  assert.ok(selected > 0, 'No samples align with measured monotonic spans');
  const active = selected - excluded;
  const table = [...functions.values()]
    .map((entry) => {
      const scoped = mapping.scoped.find(
        (rule) =>
          entry.source === rule.source && rule.names.includes(entry.name),
      );
      const location = mapping.frameLocations.find(
        (rule) =>
          rule.url === entry.url &&
          rule.line === entry.line &&
          rule.source === entry.source,
      );
      const group =
        location?.group ??
        scoped?.group ??
        Object.entries(mapping.groups).find(([, names]) =>
          names.includes(entry.name),
        )?.[0] ??
        'OTHER';
      return {
        ...entry,
        group,
        selfUsPerSwitch: entry.weightUs / wall.switches,
        nominalSelfUsPerSwitch:
          (entry.samples * wall.intervalUs) / wall.switches,
        percent: activeWeightUs ? (entry.weightUs / activeWeightUs) * 100 : 0,
      };
    })
    .sort((a, b) => b.weightUs - a.weightUs || a.name.localeCompare(b.name));
  assert.ok(
    table.some((entry) => entry.url === 'prepared/engine.mjs'),
    'No product frames attributed',
  );
  const groups = ['A', 'B', 'C', 'GC', 'OTHER'].map((group) => ({
    group,
    selfUsPerSwitch: table
      .filter((entry) => entry.group === group)
      .reduce((sum, entry) => sum + entry.selfUsPerSwitch, 0),
    percent: table
      .filter((entry) => entry.group === group)
      .reduce((sum, entry) => sum + entry.percent, 0),
  }));
  const { wallMeanUs, wallMedianUs: medianUs } = summarizeWall(wall);
  const selfUs = activeWeightUs / wall.switches;
  const plain = plainWall ? summarizeWall(plainWall) : null;
  if (plainWall) {
    for (const key of ['row', 'switches', 'warmups', 'writesPerSwitch', 'node'])
      assert.equal(wall[key], plainWall[key], 'Matching plain setting: ' + key);
    assert.notEqual(
      wall.pid,
      plainWall.pid,
      'Plain and profiler require independent processes',
    );
  }
  const decisions = Object.fromEntries(
    Object.entries(mapping.decisions).map(([group, names]) => [
      group,
      table
        .filter((entry) => names.includes(entry.name))
        .reduce((sum, entry) => sum + entry.selfUsPerSwitch, 0),
    ]),
  );
  return {
    row: wall.row,
    switches: wall.switches,
    writesPerSwitch: wall.writesPerSwitch,
    intervalUs: wall.intervalUs,
    wallMedianUs: medianUs,
    wallMeanUs,
    plain,
    collectorOverheadRatioMean: plain ? wallMeanUs / plain.wallMeanUs : null,
    collectorOverheadRatioMedian: plain ? medianUs / plain.wallMedianUs : null,
    selfUsPerSwitch: selfUs,
    reconciliationRatio: selfUs / wallMeanUs,
    medianRatio: selfUs / medianUs,
    reconciled: Math.abs(selfUs / wallMeanUs - 1) <= 0.15,
    selectedSamples: selected,
    activeSamples: active,
    excludedSamples: excluded,
    activeWeightUs,
    excludedWeightUs,
    excludedPercent:
      (excludedWeightUs / (activeWeightUs + excludedWeightUs)) * 100,
    nominalSelfUsPerSwitch: (active * wall.intervalUs) / wall.switches,
    measuredPeriodUs: (activeWeightUs + excludedWeightUs) / selected,
    periods: summarizePeriods(periods),
    table,
    top40: table.slice(0, 40),
    groups,
    decisions,
    nonReplaceableGateEvaluationUs: table
      .filter((entry) =>
        mapping.nonReplaceableGateEvaluation.names.includes(entry.name),
      )
      .reduce((sum, entry) => sum + entry.selfUsPerSwitch, 0),
    decisionAExtendedUs: table
      .filter((entry) => mapping.decisionAExtended.includes(entry.name))
      .reduce((sum, entry) => sum + entry.selfUsPerSwitch, 0),
  };
}
