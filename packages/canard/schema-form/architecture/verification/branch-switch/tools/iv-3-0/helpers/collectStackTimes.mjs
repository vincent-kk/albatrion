/**
 * Read inclusive diagnostic brackets from sampled stacks without changing leaf attribution.
 * @param {any} profile Immutable parsed CpuProfile with parent/child node IDs.
 * @param {any} wall Measured monotonic blocks and operation count from that process.
 * @param {any} mapping Reviewed branch rules and non-replaceable gate names.
 * @param {string} bundle Exact prepared engine text for source-qualified registry frames.
 * @returns Inclusive B (excluding gate/lifetime subtrees), exit, clone and registry microseconds per operation.
 */
export function collectStackTimes(profile, wall, mapping, bundle) {
  const parents = new Map(),
    nodes = new Map(profile.nodes.map((node) => [node.id, node]));
  for (const node of profile.nodes)
    for (const child of node.children ?? []) parents.set(child, node.id);
  const sourceAtLine = [];
  let source = '';
  for (const line of bundle.split('\n')) {
    if (line.startsWith('//#region ')) source = line.slice(10);
    sourceAtLine.push(source);
  }
  const totals = {
    bInclusiveUs: 0,
    finalizeExitsInclusiveUs: 0,
    cloneFromSlotInclusiveUs: 0,
    registryRegisterInclusiveUs: 0,
  };
  let timestamp = profile.startTime,
    blockIndex = 0;
  for (let index = 0; index < profile.samples.length; index++) {
    timestamp += profile.timeDeltas[index];
    while (
      blockIndex < wall.blocks.length &&
      timestamp > wall.blocks[blockIndex].endUs
    )
      blockIndex++;
    if (!wall.blocks[blockIndex] || timestamp < wall.blocks[blockIndex].startUs)
      continue;
    const frames = [];
    for (
      let id = profile.samples[index];
      id !== undefined;
      id = parents.get(id)
    ) {
      const frame = nodes.get(id).callFrame;
      frames.push({
        name: frame.functionName || '(anonymous)',
        source:
          frame.url === 'prepared/engine.mjs'
            ? sourceAtLine[frame.lineNumber]
            : '',
      });
    }
    const weight =
      (profile.timeDeltas[index + 1] ?? profile.timeDeltas[index]) /
      wall.switches;
    const lifetime = frames.some(
      (frame) =>
        (mapping.groups.A.includes(frame.name) &&
          frame.name !== 'FieldNodeRevisionLedger') ||
        mapping.scoped.some(
          (rule) =>
            rule.group === 'A' &&
            rule.source === frame.source &&
            rule.names.includes(frame.name),
        ),
    );
    const gate = frames.some((frame) =>
      mapping.nonReplaceableGateEvaluation.names.includes(frame.name),
    );
    if (
      !lifetime &&
      !gate &&
      frames.some((frame) => mapping.decisions.B.includes(frame.name))
    )
      totals.bInclusiveUs += weight;
    if (frames.some((frame) => frame.name === 'finalizeExits'))
      totals.finalizeExitsInclusiveUs += weight;
    if (frames.some((frame) => frame.name === 'cloneFromSlot'))
      totals.cloneFromSlotInclusiveUs += weight;
    if (
      frames.some(
        (frame) =>
          frame.name === 'register' &&
          frame.source ===
            'src/core/engine/settle/utils/gates/getGateRegistry.ts',
      )
    )
      totals.registryRegisterInclusiveUs += weight;
  }
  return totals;
}
