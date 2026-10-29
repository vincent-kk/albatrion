import assert from 'node:assert/strict';

/** Attribute sampled leaves in measured spans only; nominal sample weights are never normalized to wall time. */
export function attributeSamples(profile, wall, mapping, bundle) {
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
    deltaUs = 0;
  for (let index = 0; index < profile.samples.length; index++) {
    timestamp += profile.timeDeltas[index];
    while (
      blockIndex < wall.blocks.length &&
      timestamp > wall.blocks[blockIndex].endUs
    )
      blockIndex++;
    const block = wall.blocks[blockIndex];
    if (!block || timestamp < block.startUs) continue;
    selected++;
    const node = nodes.get(profile.samples[index]);
    assert.ok(node);
    const frame = node.callFrame;
    if (['(program)', '(idle)'].includes(frame.functionName)) {
      excluded++;
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
      deltaUs: 0,
    };
    entry.samples++;
    entry.deltaUs += profile.timeDeltas[index];
    deltaUs += profile.timeDeltas[index];
    functions.set(key, entry);
  }
  assert.ok(selected > 0, 'No samples align with measured monotonic spans');
  const active = selected - excluded;
  const table = [...functions.values()]
    .map((entry) => {
      const scoped = mapping.scoped.find(
        (rule) =>
          entry.source.endsWith(rule.source) && rule.names.includes(entry.name),
      );
      const group =
        scoped?.group ??
        Object.entries(mapping.groups).find(([, names]) =>
          names.includes(entry.name),
        )?.[0] ??
        'OTHER';
      return {
        ...entry,
        group,
        selfUsPerSwitch: (entry.samples * wall.intervalUs) / wall.switches,
        percent: active ? (entry.samples / active) * 100 : 0,
      };
    })
    .sort((a, b) => b.samples - a.samples || a.name.localeCompare(b.name));
  const groups = ['A', 'B', 'C', 'GC', 'OTHER'].map((group) => ({
    group,
    selfUsPerSwitch: table
      .filter((entry) => entry.group === group)
      .reduce((sum, entry) => sum + entry.selfUsPerSwitch, 0),
    percent: table
      .filter((entry) => entry.group === group)
      .reduce((sum, entry) => sum + entry.percent, 0),
  }));
  const blockUs = wall.blocks
    .map((block) => (block.endUs - block.startUs) / block.switches)
    .sort((a, b) => a - b);
  const medianUs =
    (blockUs[(blockUs.length - 1) >> 1] + blockUs[blockUs.length >> 1]) / 2;
  const selfUs = (active * wall.intervalUs) / wall.switches;
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
    wallMeanUs:
      wall.blocks.reduce((sum, block) => sum + block.endUs - block.startUs, 0) /
      wall.switches,
    selfUsPerSwitch: selfUs,
    reconciliationRatio: selfUs / medianUs,
    reconciled: Math.abs(selfUs / medianUs - 1) <= 0.15,
    selectedSamples: selected,
    activeSamples: active,
    excludedSamples: excluded,
    excludedPercent: (excluded / selected) * 100,
    deltaUsPerSwitch: deltaUs / wall.switches,
    table,
    top40: table.slice(0, 40),
    groups,
    decisions,
  };
}
