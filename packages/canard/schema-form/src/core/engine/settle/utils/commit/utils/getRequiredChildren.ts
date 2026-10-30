import type { FieldNodeRecord } from '../../../../record';

/**
 * Limit unchanged required membership to the final children that entered this settlement.
 * @param host - Object host with its final schema and prior delivered schema witness
 * @param entered - This host's entering occurrences, grouped once by the commit caller
 * @returns Existing children when required may differ or an explicit prior-schema witness
 * points at the current schema, otherwise only final entering children.
 * Filtering costs O(entered); multiple results sort only when integer names need ordering.
 * existing child arrays remain unchanged.
 */
export const getRequiredChildren = <Self extends FieldNodeRecord<Self>>(
  host: Self,
  entered: readonly Self[],
): readonly Self[] => {
  const schema = host.schema.schema;
  const previousSchema = (host.deliveryPreviousSchema ?? host.schema).schema;
  const required = typeof schema === 'object' ? schema.required : undefined;
  const previousRequired =
    typeof previousSchema === 'object' ? previousSchema.required : undefined;
  if (
    !host.deliveryInitialized ||
    host.deliveryPreviousSchema === host.schema ||
    previousRequired !== required
  )
    return host.children ?? [];
  const children: Self[] = [];
  for (const child of entered)
    if (
      !child.detached &&
      child.parent === host &&
      host.structure?.[child.name] === child
    )
      children.push(child);
  let matches = children.length > 1;
  if (matches) {
    matches = false;
    for (
      let position = 0, count = children.length;
      position < count;
      position++
    ) {
      const child = children[position];

      const first = child.name.charCodeAt(0);

      if (first < 48 || first > 57) {
        continue;
      }

      const index = Number(child.name) >>> 0;

      if (index !== 0xffffffff && String(index) === child.name) {
        matches = true;
        break;
      }
    }
  }
  if (matches) {
    children.sort((left, right) => {
      const leftIndex = Number(left.name) >>> 0;
      const rightIndex = Number(right.name) >>> 0;
      const leftInteger =
        leftIndex !== 0xffffffff && String(leftIndex) === left.name;
      const rightInteger =
        rightIndex !== 0xffffffff && String(rightIndex) === right.name;
      return leftInteger
        ? rightInteger
          ? leftIndex - rightIndex
          : -1
        : rightInteger
          ? 1
          : 0;
    });
  }
  return children;
};
