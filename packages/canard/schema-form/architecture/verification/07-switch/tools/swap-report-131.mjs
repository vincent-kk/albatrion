import assert from 'node:assert/strict';

/** Attach an independently measured swapped report without negating or reusing the original statistics. */
export function swapReport131(original, swapped) {
  assert.equal(original.stage, 'AA'); assert.equal(swapped.stage, 'AA');
  assert.equal(original.rows.length, swapped.rows.length);
  const rows = original.rows.map(row => {
    const reverse = swapped.rows.find(item => item.key === row.key);
    assert(reverse && reverse.blocks === row.blocks, `${row.key}: swapped row/block coverage differs`);
    const sign = Math.sign(row.statistic.median), swappedSign = Math.sign(reverse.statistic.median);
    return { ...row, swapStatistic: reverse.statistic, swapExcludesZero: reverse.excludesZero,
      swapComparison: sign === 0 || swappedSign === 0 ? 'zero-sign' : sign === swappedSign ? 'same-sign' : 'sign-flipped' };
  });
  const passed = original.aaSummary.passed && swapped.aaSummary.passed;
  return { ...original, rows, swapped: { aaSummary: swapped.aaSummary, method: swapped.method, mergedRows: swapped.mergedRows },
    swapPassed: passed, decision: passed ? 'AA_PASS' : 'AA_FAIL',
    swapInterpretation: '같은 부호는 측정기 위치 효과를, 부호 반전은 번들 바이트 효과를 가리킵니다. 0 부호는 구분할 수 없으며 이 해석 자체가 유의성 판정은 아닙니다.' };
}
