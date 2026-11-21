import { useEffect, useLayoutEffect, useRef } from 'react';

import { observeLabelAddress } from './observeLabelAddress';
import { createNameWriter } from './useOwnedControlName/createNameWriter';

/** The mobile component's native children are available after hydration. */
const useClientLayoutEffect =
  typeof document === 'undefined' ? useEffect : useLayoutEffect;

/**
 * Apply names to current library-owned controls whose native slots lack ARIA props.
 * @param id - Core address assigned by the identifier binding or native markup.
 * @param naming - Generated title reference and fallback.
 * @param initial - Stable plugin-authored ARIA fallback for server markup, when forwarded.
 */
export const useOwnedControlName = (
  id: string,
  naming: { 'aria-label'?: string; 'aria-labelledby'?: string },
  initial?: string,
): void => {
  const initialized = useRef(new WeakSet<HTMLElement>());
  const label = naming['aria-label'];
  const reference = naming['aria-labelledby'];
  useClientLayoutEffect(() => {
    const writeLabel = createNameWriter(
      'aria-label',
      label,
      initialized.current,
      initial,
    );
    const writeReference = createNameWriter('aria-labelledby', reference);
    const update = () => {
      const target = document.getElementById(id);
      writeLabel(target);
      writeReference(target);
    };
    const unsubscribe = observeLabelAddress(document, id, update);
    update();
    return () => {
      unsubscribe();
      writeLabel(null);
      writeReference(null);
    };
  }, [id, label, reference, initial]);
};
