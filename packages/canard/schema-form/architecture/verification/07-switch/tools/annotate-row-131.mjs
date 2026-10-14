/** Attach first-pass scope and explicit confirmation coverage without changing the 129 statistic or decision. */
export function annotateRow131(row, scope, confirmation) {
  const confirmStatus = confirmation?.status ?? (row.verdict?.regression ? '확인 측정 없음' : null);
  const observation131 = row.column === 'record' ? '기록' : row.verdict?.regression ? confirmStatus
    : scope?.scope === 'reduced' ? '줄인 검출력에서 관측되지 않음' : '관측되지 않음';
  return { ...row, scope: scope?.scope ?? 'first-pass', scopeReason: scope?.reason ?? null,
    confirmBlocks: confirmation?.second?.blocks ?? null, confirmStatus, observation131 };
}
