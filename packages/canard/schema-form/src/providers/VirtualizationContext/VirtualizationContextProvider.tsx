import { type PropsWithChildren, useEffect, useState } from 'react';

import type { FormProps } from '@/schema-form/components/Form';
import { VirtualizationManager } from '@/schema-form/helpers/virtualization';

import { VirtualizationContext } from './VirtualizationContext';

interface VirtualizationContextProviderProps {
  /**
   * Virtualization (deferred mount) option from the Form props
   * @remarks Read once at mount; later changes are intentionally ignored so
   *          already mounted fields never regress to placeholders.
   */
  virtualization: FormProps['virtualization'];
}

export const VirtualizationContextProvider = ({
  virtualization,
  children,
}: PropsWithChildren<VirtualizationContextProviderProps>) => {
  const [contextValue] = useState<VirtualizationContext>(() => ({
    manager: VirtualizationManager.create(virtualization),
  }));
  const { manager } = contextValue;
  useEffect(() => {
    if (manager === null) return;
    return () => manager.disconnect();
  }, [manager]);
  return (
    <VirtualizationContext.Provider value={contextValue}>
      {children}
    </VirtualizationContext.Provider>
  );
};
