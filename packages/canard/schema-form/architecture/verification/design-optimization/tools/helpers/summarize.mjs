/** Reduce independent process minima to their median and range and render both versions without dropping precision in JSON. */
export function summarize(rows, results) {
  const summary = rows.map((row) => {
    const minima = {
      legacy: results
        .filter((r) => r.row === row.id)
        .map((r) => r.minima.legacy),
      current: results
        .filter((r) => r.row === row.id)
        .map((r) => r.minima.current),
    };
    const statistics = Object.fromEntries(
      Object.entries(minima).map(([engine, values]) => {
        if (values.every((v) => v === null))
          return [engine, { ms: null, widthMs: null, minimaMs: values }];
        const sorted = [...values].sort((a, b) => a - b);
        const middle = Math.floor(sorted.length / 2);
        return [
          engine,
          {
            ms:
              sorted.length % 2
                ? sorted[middle]
                : (sorted[middle - 1] + sorted[middle]) / 2,
            widthMs: sorted.at(-1) - sorted[0],
            minimaMs: values,
          },
        ];
      }),
    );
    return {
      ...row,
      ...statistics,
      deltaMs: row.currentOnly
        ? null
        : statistics.current.ms - statistics.legacy.ms,
      deltaPercent: row.currentOnly
        ? null
        : (statistics.current.ms / statistics.legacy.ms - 1) * 100,
    };
  });
  const markdown = [
    '| 행 | N | 0.16.1 ms | 폭 ms | current ms | 폭 ms | Δ ms | Δ % |',
    '| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |',
    ...summary.map(
      (r) =>
        `| ${r.id} | ${r.n} | ${r.legacy.ms?.toFixed(4) ?? '해당 없음'} | ${r.legacy.widthMs?.toFixed(4) ?? '—'} | ${r.current.ms.toFixed(4)} | ${r.current.widthMs.toFixed(4)} | ${r.deltaMs?.toFixed(4) ?? '—'} | ${r.deltaPercent?.toFixed(2) ?? '—'} |`,
    ),
  ];
  return { rows: summary, markdown: `${markdown.join('\n')}\n` };
}
