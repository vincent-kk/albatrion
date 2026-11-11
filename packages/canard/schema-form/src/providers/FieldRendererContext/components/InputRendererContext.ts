import { type ComponentType, createContext } from 'react';

import type { InputRendererProps } from '@/schema-form/types';

/** Form-level frame only; external and plugin fallback is resolved at the consumer. */
export const InputRendererContext =
  createContext<ComponentType<InputRendererProps> | null>(null);
