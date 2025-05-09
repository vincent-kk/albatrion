import type { JsonSchemaWithVirtual } from '@/schema-form/types';

/**
 * 스키마의 타입에서 노드 타입을 추출합니다.
 * 'integer'를 'number'로 변환하여 통일합니다.
 * @param schema - JSON 스키마
 * @returns 노드 타입
 */
export const getNodeType = <Schema extends JsonSchemaWithVirtual>({
  type,
}: Schema) => {
  if (type === 'number' || type === 'integer')
    return 'number' as Exclude<Schema['type'], 'integer'>;
  else return type as Exclude<Schema['type'], 'integer'>;
};
