import { useMemo } from 'react';

import { isPlainObject } from '@winglet/common-utils/filter';

import type { FieldRendererProps } from '@canard/schema-form';

import { readLabel } from './resolveFieldLabel/readLabel';

/**
 * Name a field while its rendered titles are absent.
 * @param schema - Schema that may supply an authored spoken name or title.
 * @param name - Core field name, empty for an unnamed root.
 * @returns The first nonempty fallback, or no name for an unnamed root container.
 */
export const useFieldNameFallback = (
  schema: FieldRendererProps['jsonSchema'],
  name: string,
): string | undefined =>
  useMemo(() => {
    if (typeof schema === 'object' && schema !== null) {
      const spoken = isPlainObject(schema.options)
        ? schema.options['aria-label']
        : undefined;
      const label = typeof spoken === 'string' ? readLabel(spoken) : undefined;
      if (typeof label === 'string') return label;
      const title =
        typeof schema.title === 'string' ? readLabel(schema.title) : undefined;
      if (typeof title === 'string') return title;
      if (
        !name &&
        'type' in schema &&
        (schema.type === 'object' || schema.type === 'array')
      )
        return undefined;
    }
    const fieldName = readLabel(name);
    return typeof fieldName === 'string' ? fieldName : 'Field';
  }, [schema, name]);
