import { type ComponentType, createContext } from 'react';

import { PluginManager } from '@/schema-form/app/plugin';
import type { NormalizedFieldInputDefinition } from '@/schema-form/helpers/fieldInputDefinition';
import type { InputRendererProps } from '@/schema-form/types';

/** Input-only settings supplied by the nearest external provider. */
export interface ExternalInputContext {
  /** Registry selected once at the application provider boundary. */
  pluginManager: typeof PluginManager;
  /** Normalized definitions, stable until the authored definitions change. */
  fromExternalFieldInputDefinitions?: NormalizedFieldInputDefinition[];
  /** Frame from this provider; no default is injected here. */
  InputRenderer?: ComponentType<InputRendererProps>;
}

/** Definition and frame changes are isolated from formatter and other provider updates. */
export const ExternalInputContext =
  createContext<ExternalInputContext>({ pluginManager: PluginManager });
