import { useCallback } from 'react';

/**
 * Bind identifiers where the library exposes no native-control attribute props.
 * @param id - Form-scoped input address supplied by the core.
 * @param name - Scoped radio name or the unchanged leaf name for other controls.
 * @param selector - Selector for the library's real focusable controls inside the boundary.
 * @param multiple - Give options indexed addresses instead of the single input address.
 * @returns A stable mount ref; identity changes rebind the controls without per-render scans.
 */
export const useControlIdentifiers = (
  id: string,
  name: string,
  selector: string,
  multiple = false,
) =>
  useCallback(
    (root: HTMLElement | null) => {
      for (const [index, control] of Array.from(
        root?.querySelectorAll<HTMLElement>(selector) ?? [],
      ).entries()) {
        control.id = multiple ? `${id}-${index}` : id;
        control.setAttribute('name', name);
      }
    },
    [id, name, selector, multiple],
  );
