import { describe, expect, test } from 'vitest';

import {
  $DEFS,
  DEFINITIONS,
  isDefinitionSchema,
} from '../utils/isDefinitionSchema';

describe('isDefinitionSchema', () => {
  // 유효한 케이스 - $defs 경로
  test('should return true for a valid $defs path', () => {
    expect(isDefinitionSchema('#/$defs/User')).toBe(true);
    expect(isDefinitionSchema('#/$defs/Product/name')).toBe(true);
    expect(isDefinitionSchema('#/$defs/Order/items/product')).toBe(true);
    expect(isDefinitionSchema('/$defs/User')).toBe(true);
    expect(isDefinitionSchema('/$defs/Product/name')).toBe(true);
    expect(isDefinitionSchema('/$defs/Order/items/product')).toBe(true);
  });

  // 유효한 케이스 - definitions 경로
  test('should return true for a valid definitions path', () => {
    expect(isDefinitionSchema('#/definitions/User')).toBe(true);
    expect(isDefinitionSchema('#/definitions/Product/name')).toBe(true);
    expect(isDefinitionSchema('#/definitions/Order/items/product')).toBe(true);
    expect(isDefinitionSchema('/definitions/User')).toBe(true);
    expect(isDefinitionSchema('/definitions/Product/name')).toBe(true);
    expect(isDefinitionSchema('/definitions/Order/items/product')).toBe(true);
  });

  // 동일한 세그먼트가 여러 위치에 있는 케이스
  test('should return true when definition segment appears at deeper levels', () => {
    expect(isDefinitionSchema('#/schema/$defs/User')).toBe(true);
    expect(isDefinitionSchema('#/root/definitions/Product')).toBe(true);
    expect(isDefinitionSchema('/schema/$defs/User')).toBe(true);
    expect(isDefinitionSchema('/root/definitions/Product')).toBe(true);
  });

  // 유효하지 않은 케이스
  test('should return false for non-definition paths', () => {
    expect(isDefinitionSchema('#/properties/user')).toBe(false);
    expect(isDefinitionSchema('#/items/0')).toBe(false);
    expect(isDefinitionSchema('/absolute/path')).toBe(false);
    expect(isDefinitionSchema('relative/path')).toBe(false);
    expect(isDefinitionSchema('')).toBe(false);
    expect(isDefinitionSchema('#/')).toBe(false);
  });

  // properties 다음에 $defs나 definitions가 오는 경우 (무효)
  test('should return false when definitions come after properties', () => {
    expect(isDefinitionSchema('#/properties/$defs/User')).toBe(false);
    expect(isDefinitionSchema('#/properties/definitions/User')).toBe(false);
    expect(isDefinitionSchema('/properties/$defs/User')).toBe(false);
    expect(isDefinitionSchema('/properties/definitions/User')).toBe(false);
  });

  // 마지막 세그먼트가 $defs나 definitions인 경우
  test('should return false if definition segment is the last segment', () => {
    expect(isDefinitionSchema('#/$defs')).toBe(false);
    expect(isDefinitionSchema('#/schema/$defs')).toBe(false);
    expect(isDefinitionSchema('#/definitions')).toBe(false);
    expect(isDefinitionSchema('#/schema/definitions')).toBe(false);
    expect(isDefinitionSchema('/$defs')).toBe(false);
    expect(isDefinitionSchema('/schema/$defs')).toBe(false);
    expect(isDefinitionSchema('/definitions')).toBe(false);
    expect(isDefinitionSchema('/schema/definitions')).toBe(false);
  });

  // 특수한 경계 케이스들
  test('should handle edge cases properly', () => {
    expect(isDefinitionSchema('#//$defs/User')).toBe(true); // 중복 슬래시
    expect(isDefinitionSchema('#/$defs//User')).toBe(true); // 중복 슬래시
    expect(isDefinitionSchema('#/$defs//')).toBe(false); // 빈 마지막 세그먼트
  });

  // 상수 테스트
  test('should have correct constant values', () => {
    expect($DEFS).toBe('$defs');
    expect(DEFINITIONS).toBe('definitions');
  });
});
