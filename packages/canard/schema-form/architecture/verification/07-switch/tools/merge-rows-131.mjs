import assert from 'node:assert/strict';

/** Merge exactly identical update histories only when authored interactionCount is one, preserving empty-pool ownership. */
export function mergeRows131(inputs) {
  const mergedRows = [];
  const records = inputs.map(item => {
    const record = item.record;
    if (record.lane !== 'core' || record.interactionCount !== 1) return item;
    const rename = mode => mode === 'update-first' ? 'update' : mode === 'update-first-nogc' ? 'update-nogc' : mode;
    const columns = [...record.verdictColumns, ...record.recordColumns], dropped = [];
    for (const mode of columns.filter(mode => /^(update|update-first)(-nogc)?$/.test(mode))) {
      const canonical = rename(mode), key = `${record.fixture}/${record.validation}/${canonical}`;
      const firstMode = canonical.replace(/^update/, 'update-first');
      if (!mergedRows.some(row => row.key === key)) mergedRows.push({ key,
        mergedKeys: [key, `${record.fixture}/${record.validation}/${firstMode}`], interactionCount: 1 });
      for (const block of record.blocks) for (const role of ['base', 'candidate']) {
        if (block[role].samples[canonical] && block[role].samples[firstMode])
          assert.deepEqual(block[role].samples[canonical], block[role].samples[firstMode], `${key}: one-interaction samples differ; cannot merge`);
      }
      if (mode !== canonical && inputs.some(other => other.record.fixture === record.fixture && other.record.validation === record.validation
        && [...other.record.verdictColumns, ...other.record.recordColumns].includes(canonical))) dropped.push(mode);
    }
    const convert = list => list.filter(mode => !dropped.includes(mode)).map(rename);
    const renamed = columns.some(mode => rename(mode) !== mode && !dropped.includes(mode));
    return { ...item, record: { ...record, verdictColumns: convert(record.verdictColumns), recordColumns: convert(record.recordColumns),
      confirm: record.confirm ? { ...record.confirm, modes: convert(record.confirm.modes) } : null,
      blocks: renamed ? record.blocks.map(block => ({ ...block, ...Object.fromEntries(['base', 'candidate'].map(role => [role,
        { ...block[role], samples: { ...block[role].samples,
          ...(columns.includes('update-first') ? { update: block[role].samples['update-first'] } : {}),
          ...(columns.includes('update-first-nogc') ? { 'update-nogc': block[role].samples['update-first-nogc'] } : {}) } }])) })) : record.blocks } };
  });
  return { records, mergedRows };
}
