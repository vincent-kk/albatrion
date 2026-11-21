import { useEffect, useLayoutEffect, useState } from 'react';

import { observeLabelAddress } from './observeLabelAddress';
import { readMeaningfulLabel } from './readMeaningfulLabel';

/** Browser title connections are reconciled immediately after React commits. */
const useClientLayoutEffect =
  typeof document === 'undefined' ? useEffect : useLayoutEffect;

/**
 * Keep a title address ready for the browser while excluding empty or hidden titles.
 * @param id - Core title address supplied by the binding.
 * @param mountedOnly - Require a connected title for markup that omits a dormant reference.
 * @returns Title address when the rendered source can supply a name.
 */
export const useMeaningfulLabelId = (
  id: string | undefined,
  mountedOnly = false,
): string | undefined => {
  const [reference, setReference] = useState(mountedOnly ? undefined : id);
  useClientLayoutEffect(() => {
    if (!id) return;
    const update = () => {
      const label = document.getElementById(id);
      setReference(
        (label ? readMeaningfulLabel(label) : !mountedOnly) ? id : undefined,
      );
    };
    const unsubscribe = observeLabelAddress(document, id, update);
    update();
    return unsubscribe;
  }, [id, mountedOnly]);
  return reference;
};
