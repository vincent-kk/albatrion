/**
 * Recognizes a shadow root without requiring its constructor as a global.
 * @param node - tree root obtained from the attached anchor
 * @returns whether this node owns a shadow host
 */
export function isShadowRoot(node: Node | undefined): node is ShadowRoot {
  return node?.nodeType === 11 && 'host' in node;
}
