/** Exact equal-tail 99% prediction band for a Binomial(n, .01) count; correlation makes its row interpretation nominal. */
export function binomialBand131(n) {
  if (!Number.isSafeInteger(n) || n < 0 || n > 10000) throw new Error('Binomial row count must be 0..10000');
  let mass = .99 ** n, cumulative = 0, low = null, high = n;
  for (let count = 0; count <= n; count++) {
    cumulative += mass;
    if (low === null && cumulative >= .005) low = count;
    if (cumulative >= .995) { high = count; break; }
    mass *= (n - count) / (count + 1) * .01 / .99;
  }
  return { low: low ?? 0, high, probability: .01, confidence: .99, nominal: true };
}

/** Count unique verdict rows by actual block coverage, and require reduced, full and total to pass their own bands. */
export function aaCounts131(rows, fullBlocks) {
  const verdict = rows.filter(row => row.column === 'verdict');
  const groups = Object.fromEntries(['reduced', 'full', 'total'].map(name => {
    const selected = name === 'total' ? verdict : verdict.filter(row => row.scope === name);
    const excludingZero = selected.filter(row => row.excludesZero).map(row => row.key), band = binomialBand131(selected.length);
    return [name, { rows: selected.length, excluded: excludingZero.length, excludingZero, band,
      inside: excludingZero.length >= band.low && excludingZero.length <= band.high }];
  }));
  return { ...groups, fullBlocks, passed: Object.values(groups).every(group => group.inside)
      && verdict.every(row => !row.statistic.unbounded),
    interpretation: '상관된 비동일 행은 별도로 유지하므로 이항 범위는 명목 범위이며 세 범위의 공동 99% 보장을 뜻하지 않습니다.' };
}
