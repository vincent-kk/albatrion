import type { ComponentType } from 'react';

import { createFingerprintFactory } from '@winglet/common-utils/object';

import {
  ErrorMessageRenderer,
  FieldRenderer,
  LabelRenderer,
} from '@/schema-form/components/FallbackComponents';
import { builtinFieldInputDefinitions } from '@/schema-form/fieldInputs';
import { formatValidationError } from '@/schema-form/helpers/error';
import {
  type NormalizedFieldInputDefinition,
  normalizeFieldInputDefinitions,
} from '@/schema-form/helpers/fieldInputDefinition';
import type {
  ErrorMessageRendererProps,
  FieldRendererProps,
  FormatError,
  InputRendererProps,
  LabelRendererProps,
} from '@/schema-form/types';

import type { ValidatorPlugin } from '../type';

/** Renderer implementations shared by compatible package copies in one realm. */
export interface RenderKit {
  FieldRenderer: ComponentType<FieldRendererProps>;
  LabelRenderer: ComponentType<LabelRendererProps>;
  InputRenderer?: ComponentType<InputRendererProps>;
  ErrorMessageRenderer: ComponentType<ErrorMessageRendererProps>;
}

/** State and deduplication identities form one versioned registry contract. */
interface PluginRegistry {
  renderKit: RenderKit;
  fieldInputDefinitions: NormalizedFieldInputDefinition[];
  validator?: ValidatorPlugin;
  formatError: FormatError;
  defaultRenderKit: RenderKit;
  defaultFieldInputDefinitions: NormalizedFieldInputDefinition[];
  registeredPlugins: Set<string>;
  getPluginKey: ReturnType<typeof createFingerprintFactory>;
}

/** Pre-1.0 minor releases may change the registry ABI and therefore use distinct keys. */
const REGISTRY_KEY = Symbol.for('@canard/schema-form/plugin-registry/0.16');
/** Scopes use the same ABI version as the default registry. */
const SCOPES_KEY = Symbol.for('@canard/schema-form/plugin-scopes/0.16');

/** Optional symbol ownership adds no claim about an uninitialized realm. */
const registryGlobal: typeof globalThis & {
  [REGISTRY_KEY]?: PluginRegistry;
  [SCOPES_KEY]?: Map<string | symbol, PluginRegistry>;
} = globalThis;

/**
 * Initialize the registry through module loading, shared only by this compatible realm.
 * @returns Existing state, or defaults normalized once for this registry version.
 */
export const getPluginRegistry = (scope?: string | symbol): PluginRegistry => {
  if (scope === undefined) {
    if (registryGlobal[REGISTRY_KEY]) return registryGlobal[REGISTRY_KEY];
  } else {
    const existing = registryGlobal[SCOPES_KEY]?.get(scope);
    if (existing) return existing;
  }
  const defaultRenderKit = {
    FieldRenderer,
    LabelRenderer,
    ErrorMessageRenderer,
  };
  const defaultFieldInputDefinitions = normalizeFieldInputDefinitions(
    builtinFieldInputDefinitions,
  );
  const registry: PluginRegistry = {
    renderKit: defaultRenderKit,
    fieldInputDefinitions: defaultFieldInputDefinitions,
    formatError: formatValidationError,
    defaultRenderKit,
    defaultFieldInputDefinitions,
    registeredPlugins: new Set(),
    getPluginKey: createFingerprintFactory(),
  };
  if (scope === undefined) registryGlobal[REGISTRY_KEY] = registry;
  else (registryGlobal[SCOPES_KEY] ??= new Map()).set(scope, registry);
  return registry;
};
