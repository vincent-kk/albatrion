/** Select deterministic profile indices; the pre-release runner requests every seed. */
export const selectOwnershipProfileIndices = (batch: number, extended: boolean): number[] => {
  void batch;
  void extended;
  return Array.from({ length: 128 }, (_, index) => index);
};
