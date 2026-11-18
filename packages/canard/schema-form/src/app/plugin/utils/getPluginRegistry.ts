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
interface RenderKit {
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

/** Optional symbol ownership adds no claim about an uninitialized realm. */
const registryGlobal: typeof globalThis & {
  [REGISTRY_KEY]?: PluginRegistry;
} = globalThis;

/**
 * Initialize the registry through module loading, shared only by this compatible realm.
 * @returns Existing state, or defaults normalized once for this registry version.
 */
export const getPluginRegistry = (): PluginRegistry => {
  if (registryGlobal[REGISTRY_KEY]) return registryGlobal[REGISTRY_KEY];
  const defaultRenderKit = {
    FieldRenderer,
    LabelRenderer,
    ErrorMessageRenderer,
  };
  const defaultFieldInputDefinitions = normalizeFieldInputDefinitions(
    builtinFieldInputDefinitions,
  );
  return (registryGlobal[REGISTRY_KEY] = {
    renderKit: defaultRenderKit,
    fieldInputDefinitions: defaultFieldInputDefinitions,
    formatError: formatValidationError,
    defaultRenderKit,
    defaultFieldInputDefinitions,
    registeredPlugins: new Set(),
    getPluginKey: createFingerprintFactory(),
  });
};
