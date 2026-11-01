/** Select BF/FB by paired page index, including negative warmup indices. */
export function stateVocabularyOrder(index: number): string[] {
  return Math.abs(index % 2) === 0 ? ['B', 'F'] : ['F', 'B'];
}
