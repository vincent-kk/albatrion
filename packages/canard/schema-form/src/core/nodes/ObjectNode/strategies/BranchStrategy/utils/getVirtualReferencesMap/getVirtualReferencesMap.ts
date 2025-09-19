import { isArray } from '@winglet/common-utils/filter';

import type { Dictionary } from '@aileron/declare';

import { SchemaNodeError } from '@/schema-form/errors';

import type {
  VirtualReference,
  VirtualReferenceFieldsMap,
  VirtualReferencesMap,
} from './type';

/**
 * Creates a virtual references map.
 * @param nodeName - Name of the current node
 * @param propertyKeys - List of property keys
 * @param virtualReferences - Virtual reference definitions
 * @returns Virtual references map and virtual reference fields map
 */
export const getVirtualReferencesMap = (
  nodeName: string | undefined,
  propertyKeys: string[],
  virtualReferences: Dictionary<VirtualReference> | undefined,
): {
  virtualReferencesMap?: VirtualReferencesMap;
  virtualReferenceFieldsMap?: VirtualReferenceFieldsMap;
} => {
  if (!virtualReferences) return {} as const;

  const virtualReferenceFieldsMap = new Map<
    string,
    VirtualReference['fields']
  >();
  const virtualReferencesMap = new Map<string, VirtualReference>();

  for (const [key, value] of Object.entries(virtualReferences)) {
    if (!isArray(value.fields))
      throw new SchemaNodeError(
        'VIRTUAL_FIELDS_NOT_VALID',
        `'virtual.fields' is must be an array.`,
        {
          nodeKey: key,
          nodeValue: value,
          name: nodeName || 'root',
        },
      );
    // Virtual fields must be defined in properties
    const notFoundFields = value.fields.filter(
      (field) => !propertyKeys.includes(field),
    );
    if (notFoundFields.length)
      throw new SchemaNodeError(
        'VIRTUAL_FIELDS_NOT_IN_PROPERTIES',
        `virtual fields are not found on properties`,
        {
          nodeKey: key,
          nodeValue: value,
          notFoundFields,
        },
      );
    for (const field of value.fields) {
      const virtualReferenceFields = virtualReferenceFieldsMap.get(field) || [];
      virtualReferenceFields.push(key);
      virtualReferenceFieldsMap.set(field, virtualReferenceFields);
    }
    virtualReferencesMap.set(key, value);
  }
  return {
    virtualReferencesMap,
    virtualReferenceFieldsMap,
  } as const;
};
