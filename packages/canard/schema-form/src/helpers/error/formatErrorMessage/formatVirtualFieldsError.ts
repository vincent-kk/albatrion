import type { ObjectSchema } from '@/schema-form/types';

import { createDivider } from './utils/createDivider';
import { formatBulletList } from './utils/formatBulletList';
import { getValueType } from './utils/getValueType';

type VirtualReference = NonNullable<ObjectSchema['virtual']>[string];

/**
 * Formats a structured error message when virtual.fields is not an array.
 * @param nodeKey - The virtual node key
 * @param nodeValue - The virtual node value
 * @param nodeName - Name of the parent node
 */
export const formatVirtualFieldsNotValidError = (
  nodeKey: string,
  nodeValue: VirtualReference,
  nodeName: string,
): string => {
  const divider = createDivider();
  const receivedType = getValueType(nodeValue.fields);

  return `
Invalid virtual.fields configuration.

  ╭${divider}
  │  Node:      ${nodeName}
  │  Virtual:   '${nodeKey}'
  │  Expected:  array of field names
  │  Received:  ${receivedType}
  ╰${divider}

The 'virtual.fields' property must be an array containing the names
of properties that this virtual node references.

How to fix:
  1. Provide an array of field names:
     {
       "virtual": {
         "${nodeKey}": {
           "fields": ["field1", "field2"]
         }
       }
     }

  2. If only one field, still use an array:
     {
       "virtual": {
         "${nodeKey}": {
           "fields": ["singleField"]
         }
       }
     }
`.trim();
};

/**
 * Formats a structured error message when virtual fields reference non-existent properties.
 * @param nodeKey - The virtual node key
 * @param nodeValue - The virtual node value
 * @param notFoundFields - Array of field names not found in properties
 */
export const formatVirtualFieldsNotInPropertiesError = (
  nodeKey: string,
  nodeValue: VirtualReference,
  notFoundFields: string[],
): string => {
  const divider = createDivider();
  const declaredFields = nodeValue.fields.join(', ');
  const missingFieldsList = formatBulletList(
    notFoundFields.map((f) => `'${f}'`),
  );

  return `
Virtual fields reference non-existent properties.

  ╭${divider}
  │  Virtual:          '${nodeKey}'
  │  Declared Fields:  [${declaredFields}]
  ├${divider}
  │  Missing Properties:
${missingFieldsList}
  ╰${divider}

Virtual nodes can only reference fields that are defined in the
schema's 'properties'. The listed fields were not found.

How to fix:
  1. Add the missing properties to the schema:
     {
       "properties": {
${notFoundFields.map((f) => `         "${f}": { "type": "string" }`).join(',\n')}
       },
       "virtual": {
         "${nodeKey}": {
           "fields": [${notFoundFields.map((f) => `"${f}"`).join(', ')}]
         }
       }
     }

  2. Or correct the field names in virtual.fields:
     {
       "virtual": {
         "${nodeKey}": {
           "fields": ["existingField1", "existingField2"]
         }
       }
     }

  3. Check for typos in field names
`.trim();
};
