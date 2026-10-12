import type { SchemaNodeRecord } from '../../../record';

/** Visit each reachable current-shape instance once, before its children. */
export const walkSchemaNodes = <Self extends SchemaNodeRecord<Self>>(
  origin: Self,
  visit: (node: Self) => void,
): void => {
  const pending: Self[] = [origin];
  const seen = new Set<Self>();
  while (pending.length > 0) {
    const node = pending.pop();
    if (node === undefined || seen.has(node)) continue;
    seen.add(node);
    visit(node);
    if (node.structure === null) continue;
    const children = Object.values(node.structure);
    for (let index = children.length - 1; index >= 0; index--)
      pending.push(children[index]);
  }
};
