import { createContext } from 'react';

import type { Nullable } from '@aileron/declare';

import type { FieldLifecycleRegistry } from '@/schema-form/helpers/fieldLifecycle';

/** FormRoot supplies this Context element directly to preserve the fixed component-call count. */
export const FieldLifecycleContext =
  createContext<Nullable<FieldLifecycleRegistry>>(null);
