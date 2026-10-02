/**
 * Describe retained old positions, optionally excluding one removed position.
 * @param count - Number of existing positions to consider
 * @param removedIndex - Existing position to omit, or -1 to retain all
 * @returns Ordered references to surviving old positions
 */
export const copyArraySlots = (
  count: number, removedIndex: number = -1,
): { from: number }[] => {
  const slots: { from: number }[] = [];
  for (let index = 0; index < count; index++)
    if (index !== removedIndex) slots.push({ from: index });
  return slots;
};
