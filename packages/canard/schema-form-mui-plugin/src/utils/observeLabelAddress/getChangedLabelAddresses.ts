/**
 * Collect registered title addresses touched by a batch of document mutations.
 * @param records - Document mutations delivered by the shared observer.
 * @param listeners - Subscriptions indexed by core label address.
 * @returns Each affected address once, regardless of how many records reach it.
 */
export const getChangedLabelAddresses = (
  records: MutationRecord[],
  listeners: ReadonlyMap<string, unknown>,
): Set<string> => {
  const addresses = new Set<string>();
  const include = (id: string | null) => {
    if (id && listeners.has(id)) addresses.add(id);
  };
  const visitBranch = (node: Node) => {
    if (!(node instanceof Element)) return;
    include(node.id);
    for (const child of node.querySelectorAll('[id]')) include(child.id);
  };
  for (const record of records) {
    const { target } = record;
    let element = target instanceof Element ? target : target.parentElement;
    while (element) {
      include(element.id);
      element = element.parentElement;
    }
    if (record.attributeName === 'id') include(record.oldValue);
    if (record.type === 'attributes' && record.attributeName !== 'id')
      visitBranch(target);
    for (const node of record.addedNodes) visitBranch(node);
    for (const node of record.removedNodes) visitBranch(node);
  }
  return addresses;
};
