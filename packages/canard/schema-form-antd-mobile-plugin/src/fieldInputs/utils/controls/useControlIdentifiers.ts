import { useCallback, useLayoutEffect, useRef } from 'react';

import type { FieldInputProps } from '@canard/schema-form';

/**
 * Bind identifiers where the library exposes no native-control attribute props.
 * @param inputId - Form-scoped input address supplied by the core.
 * @param name - Scoped radio or unchanged leaf name, when the control has one.
 * @param selector - Selector for the library's real focusable controls inside the boundary.
 * @param getInputId - Core resolver for indexed option addresses; absent for a single control.
 * @param revision - Rebind after an actual option-list change.
 * @returns A mount ref; native name removals and replaced controls are repaired at the DOM boundary.
 */
export const useControlIdentifiers = (
  inputId: string,
  name: string | undefined,
  selector: string,
  getInputId?: FieldInputProps['getInputId'],
  revision?: unknown,
) => {
  const currentRoot = useRef<HTMLElement | null>(null);
  const bind = useCallback(
    (root: HTMLElement | null) => {
      currentRoot.current = root;
      for (const [index, control] of Array.from(
        root?.querySelectorAll<HTMLElement>(selector) ?? [],
      ).entries()) {
        control.id = getInputId ? getInputId(index) : inputId;
        if (name !== undefined && control.getAttribute('name') !== name)
          control.setAttribute('name', name);
      }
    },
    [inputId, name, selector, getInputId],
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
