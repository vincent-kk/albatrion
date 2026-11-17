/**
 * Serialize current DOM contents without confusing defaults with live properties.
 * @param node - Current node in the form region.
 * @param ids - React-generated IDs normalized within this container.
 * @returns Ordered contents and live input state.
 */
export function readDomNode(node: Node, ids: readonly string[]): unknown {
  if (node.nodeType === Node.TEXT_NODE) return ['text', node.textContent];
  if (!(node instanceof Element)) return [node.nodeType];
  const attributes = Array.from(node.attributes)
    .filter(
      ({ name }) =>
        name !== 'data-mount' &&
        !(
          node.matches('input,textarea,select,option') &&
          ['value', 'checked', 'selected'].includes(name)
        ),
    )
    .map(({ name, value }) => [
      name,
      value
        .split(' ')
        .map((token) =>
          ids.includes(token) ? `react-id-${ids.indexOf(token)}` : token,
        )
        .join(' '),
    ])
    .sort(([a], [b]) => a.localeCompare(b));
  const live =
    node instanceof HTMLInputElement
      ? {
          value: node.value,
          checked: node.checked,
          disabled: node.disabled,
          readOnly: node.readOnly,
        }
      : node instanceof HTMLSelectElement
        ? { value: node.value, disabled: node.disabled }
        : node instanceof HTMLOptionElement
          ? { selected: node.selected }
          : node instanceof HTMLTextAreaElement
            ? {
                value: node.value,
                disabled: node.disabled,
                readOnly: node.readOnly,
              }
            : null;
  return [
    node.tagName,
    attributes,
    live,
    node instanceof HTMLTextAreaElement
      ? []
      : Array.from(node.childNodes).map((child) => readDomNode(child, ids)),
  ];
}
