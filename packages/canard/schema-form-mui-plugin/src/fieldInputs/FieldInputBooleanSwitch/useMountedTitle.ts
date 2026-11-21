import { useEffect, useLayoutEffect, useState } from 'react';

import { observeLabelAddress } from '../hooks/useFieldLabelAssociation/observeFieldLabels/observeLabelAddress';

/** Read the root switch's optional external title after layout. */
const useClientLayoutEffect =
  typeof document === 'undefined' ? useEffect : useLayoutEffect;

/**
 * Resolve a connected title for the root switch that normally has no title attribute.
 * @param id - Core title address, supplied only for the root switch.
 * @returns A browser reference while a title is present at that address.
 */
export const useMountedTitle = (id: string | undefined): string | undefined => {
  const [title, setTitle] = useState<string>();
  useClientLayoutEffect(() => {
    if (id === undefined) return;
    const update = () => {
      const label = document.getElementById(id);
      setTitle(label?.textContent?.trim() ? id : undefined);
    };
    const disconnect = observeLabelAddress(document, id, update);
    update();
    return disconnect;
  }, [id]);
  return title;
};
