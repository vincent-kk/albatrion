import type { SchemaFormPlugin } from '@/schema-form/app/plugin';

import { createDivider } from './utils/createDivider';
import { formatBulletList } from './utils/formatBulletList';
import { getErrorMessage } from './utils/getErrorMessage';

/**
 * Formats a structured error message for plugin registration failures.
 * @param plugin - The plugin that failed to register
 * @param error - The original error object
 */
export const formatRegisterPluginError = (
  plugin: SchemaFormPlugin,
  error: unknown,
): string => {
  const divider = createDivider();
  const errorMessage = getErrorMessage(error);

  const pluginFeatures: string[] = [];
  if (plugin.FormErrorRenderer) pluginFeatures.push('FormError');
  if (plugin.FieldRenderer) pluginFeatures.push('FormField');
  if (plugin.FormInputRenderer) pluginFeatures.push('FormInput');
  if (plugin.FormLabelRenderer) pluginFeatures.push('FormLabel');
  if (plugin.fieldInputDefinitions?.length)
    pluginFeatures.push('fieldInputDefinitions');
  if (plugin.validator) pluginFeatures.push('validator');
  if (plugin.formatError) pluginFeatures.push('formatError');

  const featuresSection =
    pluginFeatures.length > 0
      ? formatBulletList(pluginFeatures)
      : '  │    (none detected)';

  return `
Failed to register schema form plugin.

  ╭${divider}
  │  Plugin Features:
${featuresSection}
  ├${divider}
  │  Error:  ${errorMessage}
  ╰${divider}

The plugin could not be registered with the form system.
This may indicate a problem with the plugin's configuration
or a conflict with existing registered plugins.

How to fix:
  1. Check that the plugin exports are correctly structured:
     {
       renderKit?: { ... },
       fieldInputDefinitions?: [...],
       validator?: ValidatorFactory,
       formatError?: ErrorFormatter
     }

  2. Ensure the plugin is not already registered

  3. Verify there are no conflicts with existing plugins

  4. Check the error message above for specific details
`.trim();
};
