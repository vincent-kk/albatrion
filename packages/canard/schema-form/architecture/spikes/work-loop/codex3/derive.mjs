/** Model A4 on one leaf. A completed read snapshot feeds exactly one proposed write per round. */
export function derive(initial, inject, cap, completion) {
  let raw = initial;
  let emit = initial;
  const reads = [];
  for (let round = 1; round <= cap; round++) {
    emit = raw;
    reads.push(emit);
    const next = inject(emit);
    if (Object.is(next, raw)) return { raw, emit, reads, capped: false };
    raw = next;
  }
  if (completion === 'complete-pending') emit = raw;
  return { raw, emit, reads, capped: true };
}
