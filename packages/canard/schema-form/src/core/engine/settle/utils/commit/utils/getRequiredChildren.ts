import type { FieldNodeRecord } from '../../../../record';

/**
 * Limit unchanged required membership to the final children that entered this settlement.
 * @param host - Object host with its final schema and prior delivered schema witness
 * @param entered - Settlement-owned entering occurrences, including discarded candidates
 * @returns Existing children when required may differ or an explicit prior-schema witness
 * points at the current schema, otherwise only final entering children.
 * The returned temporary subset costs O(entered); existing child arrays remain unchanged.
 */
export const getRequiredChildren = <Self extends FieldNodeRecord<Self>>(
  host: Self,
  entered: ReadonlySet<Self>,
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
  return children;
};
