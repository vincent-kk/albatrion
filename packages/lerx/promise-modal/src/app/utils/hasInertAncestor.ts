import { isShadowRoot } from './isShadowRoot';

/**
 * Checks interaction isolation across open shadow hosts.
 * @param element - Connected focus candidate whose composed ancestors are checked.
 * @returns Whether the candidate or any composed ancestor has the inert attribute.
 */
export function hasInertAncestor(element: Element): boolean {
  let current: Element | null = element;
  while (current) {
    if (current.closest('[inert]')) return true;
    const tree = current.getRootNode();
    current = isShadowRoot(tree) ? tree.host : null;
  }
  return false;
}
