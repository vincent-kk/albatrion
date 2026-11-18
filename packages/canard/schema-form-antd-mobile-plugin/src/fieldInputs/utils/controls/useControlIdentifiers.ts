import { useCallback, useLayoutEffect, useRef } from 'react';

/**
 * Bind identifiers where the library exposes no native-control attribute props.
 * @param id - Form-scoped input address supplied by the core.
 * @param name - Scoped radio name or the unchanged leaf name for other controls.
 * @param selector - Selector for the library's real focusable controls inside the boundary.
 * @param multiple - Give options indexed addresses instead of the single input address.
 * @param revision - Rebind after an actual option-list change.
 * @returns A mount ref; native name removals and replaced controls are repaired at the DOM boundary.
 */
export const useControlIdentifiers = (
  id: string,
  name: string,
  selector: string,
  multiple = false,
  revision?: unknown,
) => {
  const currentRoot = useRef<HTMLElement | null>(null);
  const bind = useCallback(
    (root: HTMLElement | null) => {
      currentRoot.current = root;
      for (const [index, control] of Array.from(
        root?.querySelectorAll<HTMLElement>(selector) ?? [],
      ).entries()) {
        control.id = multiple ? `${id}-${index}` : id;
        if (control.getAttribute('name') !== name)
          control.setAttribute('name', name);
      }
    },
    [id, name, selector, multiple],
  );
  useLayoutEffect(() => {
    bind(currentRoot.current);
  }, [bind, revision]);
  useLayoutEffect(() => {
    const root = currentRoot.current;
    if (!root) return;
    const observer = new MutationObserver(() => bind(root));
    observer.observe(root, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['name'],
    });
    return () => observer.disconnect();
  }, [bind]);
  return bind;
};
