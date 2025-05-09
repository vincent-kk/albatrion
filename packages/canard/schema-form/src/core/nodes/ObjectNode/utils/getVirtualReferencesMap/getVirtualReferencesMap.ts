import { isArray } from '@winglet/common-utils';

import type { Dictionary } from '@aileron/declare';

import { SchemaNodeError } from '@/schema-form/errors';

import type { VirtualReference } from '../../type';

/**
 * 가상 참조 맵을 생성합니다.
 * @param nodeName - 현재 노드의 이름
 * @param propertyKeys - 프로퍼티 키 목록
 * @param virtualReferences - 가상 참조 정의
 * @returns 가상 참조 맵과 가상 참조 필드 맵
 */
export const getVirtualReferencesMap = (
  nodeName: string | undefined,
  propertyKeys: string[],
  virtualReferences: Dictionary<VirtualReference> | undefined,
) => {
  if (!virtualReferences) return {};

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
    // NOTE: virtual field는 모두 properties에 정의되어 있어야 함
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
  };
};
