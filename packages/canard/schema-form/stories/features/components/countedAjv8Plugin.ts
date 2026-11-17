import { plugin as ajv8Plugin } from '@canard/schema-form-ajv8-plugin';

import type { SchemaFormPlugin } from '../../../src';

/** Module-wide count of validate calls made through the registered ajv8 plugin; adapters read per-step deltas. */
export const ajv8ValidationRequests = { count: 0 };

/** The ajv8 plugin with its compiled validators wrapped to count validation requests; verdicts are unchanged. */
export const countedAjv8Plugin: SchemaFormPlugin = {
  validator: {
    ...ajv8Plugin.validator,
    compile: (jsonSchema) => {
      const validate = ajv8Plugin.validator.compile(jsonSchema);
      return (value) => {
        ajv8ValidationRequests.count++;
        return validate(value);
      };
    },
  },
};
