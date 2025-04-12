import { isArray } from '@winglet/common-utils';

import type { Dictionary } from '@aileron/types';

import { SchemaNodeError } from '@/schema-form/errors';

import type { VirtualReference } from '../type';

export const getVirtualReferencesMap = (
  nodeName: string | undefined,
  allowedPropertyKeys: string[],
  virtualReferences: Dictionary<VirtualReference> | undefined,
) => {
  if (!virtualReferences)
    return {
      virtualReferencesMap: null,
      virtualReferenceFieldsMap: null,
    };

  const virtualReferenceFieldsMap = new Map<
    string,
    VirtualReference['fields']
  >();
  const virtualReferencesMap = new Map<string, VirtualReference>();

  const propertySet = new Set(allowedPropertyKeys);
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
    // NOTE: virtual field는 모두 properties에 정의되어 있어야 함
    const notFoundFields = value.fields.filter(
      (field) => !propertySet.has(field),
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
  };
};
