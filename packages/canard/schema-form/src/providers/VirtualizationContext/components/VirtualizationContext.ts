import { createContext } from 'react';

import type { VirtualizationManager } from '@/schema-form/helpers/virtualization';

export interface VirtualizationContext {
  /** Virtualization coordinator for this form, null when virtualization is disabled or unsupported */
  manager: VirtualizationManager | null;
}

export const VirtualizationContext = createContext<VirtualizationContext>({
  manager: null,
});
