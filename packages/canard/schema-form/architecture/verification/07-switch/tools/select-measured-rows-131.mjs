/** Partition one complete setting record by requested columns while retaining every measured block and one empty-pool owner. */
export function selectMeasuredRows131(record, rows) {
  const owner = rows.find(row => row.blocks === Math.max(...rows.map(item => item.blocks)));
  return rows.map(row => ({ ...record,
    verdictColumns: record.verdictColumns.includes(row.mode) ? [row.mode] : [],
    recordColumns: record.recordColumns.includes(row.mode) ? [row.mode] : [],
    blocks: record.blocks, scope131: row, coreEmptyPool131: row === owner,
    confirm: record.confirm ? { ...record.confirm, modes: [row.mode] } : null }));
}
