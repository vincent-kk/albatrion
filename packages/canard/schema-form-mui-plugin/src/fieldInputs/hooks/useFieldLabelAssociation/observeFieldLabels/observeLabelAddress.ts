import { getChangedLabelAddresses } from './observeLabelAddress/getChangedLabelAddresses';

/** One address subscription table per document, shared by the field bindings. */
const documents = new WeakMap<
  Document,
  { observer: MutationObserver; listeners: Map<string, Set<() => void>> }
>();

/**
 * Observe a stable external title address even when no element owns it yet.
 * @param document - The document containing the bound control.
 * @param id - The core label address, which may be absent between commits.
 * @param update - A binding refresh for changes at the label address.
 * @returns Cleanup of this binding's subscription.
 */
export const observeLabelAddress = (
  document: Document,
  id: string,
  update: () => void,
): (() => void) => {
  let subscriptions = documents.get(document);
  if (!subscriptions) {
    const listeners = new Map<string, Set<() => void>>();
    const observer = new MutationObserver((records) => {
      for (const address of getChangedLabelAddresses(records, listeners))
        listeners.get(address)?.forEach((listener) => listener());
    });
    observer.observe(document, {
      childList: true,
      characterData: true,
      subtree: true,
      attributes: true,
      attributeOldValue: true,
      attributeFilter: ['id', 'hidden', 'aria-hidden'],
    });
    subscriptions = { observer, listeners };
    documents.set(document, subscriptions);
  }

  const { observer, listeners } = subscriptions;
  const entry = listeners.get(id) ?? new Set<() => void>();
  entry.add(update);
  listeners.set(id, entry);
  return () => {
    entry.delete(update);
    if (entry.size === 0) listeners.delete(id);
    if (listeners.size === 0) {
      observer.disconnect();
      documents.delete(document);
    }
  };
};
