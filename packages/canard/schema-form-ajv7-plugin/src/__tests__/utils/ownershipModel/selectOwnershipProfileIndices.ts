/** Select every distinct constructor/host profile in PR; extended mode preserves all seeds. */
export const selectOwnershipProfileIndices = (
  batch: number,
  extended: boolean,
): number[] => {
  const complete = Array.from({ length: 128 }, (_, index) => index);
  if (extended) return complete;
  const signatures = new Set<string>();
  return complete.filter((index) => {
    const signature = JSON.stringify([
      index % 4,
      index % 3,
      index % 7 === 0,
      index % 5 === 0,
      index % 11 === 0,
      index % 13 === 0,
    ]);
    if (signatures.has(signature)) return false;
    signatures.add(signature);
    return index % 16 === batch;
  });
};
