/** Assign full blocks to reached/watch/unknown rows, and reduced blocks only to explicitly zero-count rows. */
export function scopeRows131(rows, counts, fullBlocks, reducedBlocks) {
  const watch = ['computed-visible-derived/off/update-first', 'sample-1/off/update-later-nogc',
    'array-500/off/mount-wall-nogc', 'array-replace-200/off/profiler-mount', 'flat-50/off/profiler-update-nogc',
    'oneOf-20/off/profiler-mount-nogc', 'oneOf-20/off/profiler-update-nogc'];
  const scoped = rows.map(row => {
    const entry = counts?.[row.key], calls = typeof entry === 'number' ? entry : entry?.calls;
    const known = Number.isInteger(calls) && calls >= 0;
    const watched = row.key.includes('/axis-') || row.key.startsWith('if-then/') || watch.includes(row.key);
    const reason = watched ? 'watch' : !known ? 'count-missing' : calls > 0 ? 'touched' : 'zero-count';
    const reduced = reason === 'zero-count' && reducedBlocks < fullBlocks;
    return { ...row, calls: known ? calls : null, scope: reduced ? 'reduced' : 'full', reason,
      blocks: reduced ? reducedBlocks : fullBlocks };
  });
  return scoped.map(row => {
    if (!row.key.endsWith('-nogc') || row.scope === 'full') return row;
    const officialKey = row.key.slice(0, -5);
    const official = scoped.find(item => item.key === officialKey)
      ?? scopeRows131([{ ...row, key: officialKey, mode: row.mode?.slice(0, -5) }], counts, fullBlocks, reducedBlocks)[0];
    return official?.scope === 'full' ? { ...row, scope: 'full', reason: 'official-full', blocks: fullBlocks } : row;
  });
}
