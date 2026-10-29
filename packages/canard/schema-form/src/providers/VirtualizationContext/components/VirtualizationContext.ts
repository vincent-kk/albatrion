import { createContext } from 'react';

import type { Nullable } from '@aileron/declare';

import type { VirtualizationManager } from '@/schema-form/helpers/virtualization';

export interface VirtualizationContext {
  /** Virtualization coordinator for this form, null when virtualization is disabled or unsupported */
  manager: Nullable<VirtualizationManager>;
}

export const VirtualizationContext = createContext<VirtualizationContext>({
  manager: null,
});
