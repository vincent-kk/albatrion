/**
 * Select mixed-radix frames in type, step, lower, upper, start, interaction order.
 * @param dimensions - Positive axis sizes in the property test's loop order.
 * @param extended - Keep the complete local/pre-release Cartesian product when true.
 * @returns A bounded set covering every schema and pair, or no filter for complete runs.
 */
export const selectSliderCaseIndices = (
  dimensions: readonly number[],
  extended: boolean,
): Set<number> | undefined => {
  if (extended) return undefined;
  const count = dimensions.reduce((total, size) => total * size, 1);
  const pairs: string[][] = [];
  for (let index = 0; index < count; index++) {
    let remainder = index;
    const values = Array<number>(dimensions.length);
    for (let axis = dimensions.length - 1; axis >= 0; axis--) {
      values[axis] = remainder % dimensions[axis];
      remainder = Math.floor(remainder / dimensions[axis]);
    }
    const keys: string[] = [];
    for (let left = 0; left < dimensions.length; left++)
      for (let right = left + 1; right < dimensions.length; right++)
        keys.push(`${left}:${values[left]}/${right}:${values[right]}`);
    pairs.push(keys);
  }
  const missing = new Set(pairs.flat());
  const selected = new Set<number>();
  const starts = dimensions[4],
    interactions = dimensions[5];
  const schemaCount = count / starts / interactions;
  for (let schema = 0; schema < schemaCount; schema++) {
    const index =
      schema * starts * interactions +
      (schema % starts) * interactions +
      (schema % interactions);
    selected.add(index);
    for (const pair of pairs[index]) missing.delete(pair);
  }
  while (missing.size) {
    let best = 0,
      gain = -1;
    for (let index = 0; index < pairs.length; index++) {
      const score = pairs[index].reduce(
        (sum, pair) => sum + Number(missing.has(pair)),
        0,
      );
      if (score > gain) {
        gain = score;
        best = index;
      }
    }
    selected.add(best);
    for (const pair of pairs[best]) missing.delete(pair);
  }
  return selected;
};
