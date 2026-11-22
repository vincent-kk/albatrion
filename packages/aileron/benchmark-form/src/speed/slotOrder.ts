/** Returns the deterministic permutation for a zero-based round. */
export function slotOrder(round: number): readonly string[] {
  const orders = [
    ['A1', 'A2', 'B'],
    ['A1', 'B', 'A2'],
    ['A2', 'A1', 'B'],
    ['A2', 'B', 'A1'],
    ['B', 'A1', 'A2'],
    ['B', 'A2', 'A1'],
  ];
  return orders[round % orders.length];
}
