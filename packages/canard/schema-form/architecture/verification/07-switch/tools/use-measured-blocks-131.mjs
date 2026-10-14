import assert from 'node:assert/strict';

/** Recover every measured block from a setting's longest raw record; assert existing selected samples are unchanged. */
export function useMeasuredBlocks131(inputs) {
  return inputs.map(item => {
    const { record } = item;
    const siblings = inputs.filter(other => other.record.fixture === record.fixture && other.record.validation === record.validation && other.record.lane === record.lane);
    const longest = siblings.reduce((best, other) => other.record.blocks.length > best.record.blocks.length ? other : best, item).record;
    for (const block of record.blocks) {
      const measured = longest.blocks.find(other => other.block === block.block);
      assert(measured, `${record.fixture}: measured block disappeared`);
      for (const role of ['base', 'candidate']) for (const mode of [...record.verdictColumns, ...record.recordColumns])
        assert.deepEqual(block[role].samples[mode], measured[role].samples[mode], `${record.fixture}/${mode}: raw samples differ`);
    }
    return { ...item, record: { ...record, blocks: longest.blocks } };
  });
}
