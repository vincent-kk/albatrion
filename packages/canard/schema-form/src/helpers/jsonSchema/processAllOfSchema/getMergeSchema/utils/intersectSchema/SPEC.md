# allOf 병합 구현 명세서

## 1. 개요

### 목적

- Form Builder에서 JSON Schema의 allOf를 병합하여 단일 스키마로 변환
- 조건부 로직(anyOf, oneOf, if/then/else 등)은 처리하지 않음

### 제약 조건

- `type`: 단일 값만 존재, allOf에 추가 type 있으면 root type과 동일해야 함 (다르면 ERROR)
- `$ref`: 사전에 resolve되어 전달되지 않음
- **조건부 로직 제외**: allOf 내부에 anyOf, oneOf, allOf, not, if/then/else 처리 안함

## 2. 처리 대상 필드

### 2.1 타입 검증 (최우선)

```
'type' - root의 type과 동일해야 함, 다르면 ERROR
```

### 2.2 덮어쓰기 (Overwrite / First-Win)

```
'title'              // 첫 번째 값 사용 (Root 우선)
'description'        // 첫 번째 값 사용 (Root 우선)
'$comment'           // 첫 번째 값 사용 (Root 우선)
'examples'           // 첫 번째 값 사용 (Root 우선)
'default'            // 첫 번째 값 사용 (Root 우선)
'readOnly'           // 첫 번째 값 사용 (Root 우선)
'writeOnly'          // 첫 번째 값 사용 (Root 우선)
'format'             // 첫 번째 값 사용 (Root 우선)
'additionalProperties' // 첫 번째 값 사용 (Root 우선)
'patternProperties'    // 첫 번째 값 사용 (Root 우선)
```

### 2.3 교집합 (Intersection)

```
'enum'               // 공통 값만 남김, 빈 교집합이면 ERROR
'const'              // 값이 다르면 ERROR
```

### 2.4 가장 제한적인 값 (Most Restrictive)

#### 최소값 (더 큰 값 선택)

```
'minimum'            // Math.max(...values)
'exclusiveMinimum'   // Math.max(...values)
'minLength'          // Math.max(...values)
'minItems'           // Math.max(...values)
'minProperties'      // Math.max(...values)
'minContains'        // Math.max(...values)
```

#### 최대값 (더 작은 값 선택)

```
'maximum'            // Math.min(...values)
'exclusiveMaximum'   // Math.min(...values)
'maxLength'          // Math.min(...values)
'maxItems'           // Math.min(...values)
'maxProperties'      // Math.min(...values)
'maxContains'        // Math.min(...values)
```

#### 불린 OR (하나라도 true면 true)

```
'uniqueItems'        // 하나라도 true면 true
```

### 2.5 합집합 (Union)

```
'required'           // 모든 배열 합치고 중복 제거
```

### 2.6 특별 처리

```
'pattern'            // 정규식 AND 결합: (?=pattern1)(?=pattern2)...
'multipleOf'         // 최소공배수 계산
```

### 2.7 프로퍼티 병합

```
'propertyNames'      // 스키마 재귀 호출 준비
```

## 3. 처리하지 않는 필드 (제외 항목)

### 3.1 조건부 로직 - 복잡성으로 인한 제외

```
'allOf'              // ❌ 중첩 allOf 처리 안함
'anyOf'              // ❌ 처리 안함
'oneOf'              // ❌ 처리 안함
'not'                // ❌ 처리 안함
'if'                 // ❌ 처리 안함
'then'               // ❌ 처리 안함
'else'               // ❌ 처리 안함
```

### 3.2 의존성 - 복잡성으로 인한 제외

```
'dependencies'       // ❌ 처리 안함
'dependentRequired'  // ❌ 처리 안함
'dependentSchemas'   // ❌ 처리 안함
```

### 3.3 고급 기능 - Form Builder에서 불필요

```
'unevaluatedProperties' // ❌ 처리 안함
'unevaluatedItems'   // ❌ 처리 안함
'contains'           // ❌ 처리 안함 (복잡함)
'additionalItems'    // ❌ 처리 안함 (구버전)
```

### 3.4 기타

```
'$ref'               // ❌ 이미 resolve됨
'$defs'              // ❌ 병합 대상 아님
'definitions'        // ❌ 병합 대상 아님
```

## 4. 처리 절차

### 4.1 메인 처리 절차

```
1. allOf 존재 여부 확인
2. 타입 검증 (root type vs allOf types)
3. 모든 스키마 수집 (root + allOf)
4. 공통 필드 병합
5. 타입별 필드 병합
6. 프로퍼티 병합
7. allOf 제거
```

### 4.2 타입별 처리

#### String 타입

```
- minLength, maxLength 병합
- 범위 검증: minLength <= maxLength
```

#### Number/Integer 타입

```
- minimum, maximum, exclusiveMinimum, exclusiveMaximum 병합
- 범위 검증: 최소값 <= 최대값
```

#### Array 타입

```
- minItems, maxItems, minContains, maxContains, uniqueItems 병합
- 범위 검증: 최소값 <= 최대값
```

#### Object 타입

```
- minProperties, maxProperties 병합
- additionalProperties, patternProperties 덮어쓰기
- 범위 검증: 최소값 <= 최대값
```

#### Boolean 타입

```
- 추가 제약 조건 없음
```

### 4.3 프로퍼티 병합

```
- propertyNames 프로퍼티들을 하나로 병합하여 최종 스키마에 추가
```

## 5. 충돌 감지 및 에러 처리

### 5.1 필수 충돌 체크

```
- 타입 불일치: root type ≠ allOf type
- enum 교집합 빔: 선택 가능한 값이 없음
- const 충돌: 서로 다른 상수값
- 범위 충돌: min > max 관계
```

## 6. 인터페이스

### 6.1 개별 동작 함수.

/Users/Vincent/Workspace/albatrion/packages/canard/schema-form/src/helpers/jsonSchema/resolveAllOfSchema/getMergeSchema/utils/intersectSchema/intersectArraySchema.ts
/Users/Vincent/Workspace/albatrion/packages/canard/schema-form/src/helpers/jsonSchema/resolveAllOfSchema/getMergeSchema/utils/intersectSchema/intersectBooleanSchema.ts
/Users/Vincent/Workspace/albatrion/packages/canard/schema-form/src/helpers/jsonSchema/resolveAllOfSchema/getMergeSchema/utils/intersectSchema/intersectNullSchema.ts
/Users/Vincent/Workspace/albatrion/packages/canard/schema-form/src/helpers/jsonSchema/resolveAllOfSchema/getMergeSchema/utils/intersectSchema/intersectNumberSchema.ts
/Users/Vincent/Workspace/albatrion/packages/canard/schema-form/src/helpers/jsonSchema/resolveAllOfSchema/getMergeSchema/utils/intersectSchema/intersectObjectSchema.ts
/Users/Vincent/Workspace/albatrion/packages/canard/schema-form/src/helpers/jsonSchema/resolveAllOfSchema/getMergeSchema/utils/intersectSchema/intersectStringSchema.ts

### 6.3 JsonSchema 인터페이스

```typescript
interface JsonSchema {
  type?:
    | 'string'
    | 'number'
    | 'integer'
    | 'boolean'
    | 'array'
    | 'object'
    | 'null';
  allOf?: JsonSchema[];
  properties?: Record<string, JsonSchema>;
  items?: JsonSchema;
  // ... 기타 JSON Schema 속성들
}
```

## 7. 특별 처리 로직

### 7.1 Pattern 병합

```
여러 패턴 → (?=pattern1)(?=pattern2)... 형태로 AND 결합
예: ["^[a-z]+$", "^.{5,}$"] → "(?=^[a-z]+$)(?=^.{5,}$)"
```

### 7.2 MultipleOf 병합

```
여러 값 → 최소공배수 계산
예: [2, 3] → 6
```

### 7.3 Properties 병합

별도처리

### 7.4 Items 병합

별도처리

## 8. 예외 상황

### 8.1 처리 불가능한 경우

```
- 타입 불일치
- enum 교집합이 빈 배열
- const 값이 서로 다름
```
