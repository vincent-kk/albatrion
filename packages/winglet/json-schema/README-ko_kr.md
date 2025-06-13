# @winglet/json-schema

[![Typescript](https://img.shields.io/badge/typescript-✔-blue.svg)]()
[![Json Schema](https://img.shields.io/badge/JsonSchema-{}-blue.svg)]()

---

## 개요

`@winglet/json-schema`는 JSON Schema 및 JSON 데이터를 다루기 위한 강력한 유틸리티 라이브러리입니다. 주요 기능으로는 JSON Schema 구조 탐색, 유효성 검증, 참조 해결(reference resolution), 필터링 등을 제공합니다. 타입스크립트로 작성되어 있어 타입 안정성이 보장되며, JSON Schema의 구조화된 처리를 위한 다양한 기능을 제공합니다.

---

## 설치 방법

```bash
# npm 사용
npm install @winglet/json-schema

# yarn 사용
yarn add @winglet/json-schema
```

---

## Sub-path Imports

이 패키지는 sub-path import를 지원하여 더 세분화된 가져오기를 가능하게 하고 번들 크기를 최적화합니다. 전체 패키지를 가져오지 않고 특정 모듈을 직접 가져올 수 있습니다:

```typescript
// 메인 내보내기 (모든 유틸리티 및 타입 정의)
import { JsonSchemaScanner, isObjectSchema } from '@winglet/json-schema';

// 동기 스키마 스캐너
import { JsonSchemaScanner } from '@winglet/json-schema/scanner';

// 비동기 스키마 스캐너
import { JsonSchemaScannerAsync } from '@winglet/json-schema/async-scanner';

// 스키마 타입 검사 유틸리티
import {
  isArraySchema,
  isObjectSchema,
  isStringSchema,
  isNumberSchema,
  isBooleanSchema,
  isNullSchema
} from '@winglet/json-schema/filter';
```

### 사용 가능한 Sub-path

package.json의 exports 설정을 기반으로 합니다:

- `@winglet/json-schema` - 메인 내보내기 (모든 유틸리티, 스캐너, 타입 정의)
- `@winglet/json-schema/scanner` - 동기 JSON Schema 스캐너 (JsonSchemaScanner)
- `@winglet/json-schema/async-scanner` - 비동기 JSON Schema 스캐너 (JsonSchemaScannerAsync)
- `@winglet/json-schema/filter` - 스키마 타입 검사 및 필터링 유틸리티 (isArraySchema, isObjectSchema 등)

---

## 호환성 안내

이 패키지는 ECMAScript 2022 (ES2022) 문법으로 작성되었습니다.

ES2022보다 낮은 버전의 JavaScript 환경에서 사용하시는 경우, 별도의 트랜스파일 과정이 필요합니다.

**지원 환경:**

- Node.js 16.11.0 이상
- 최신 브라우저 (Chrome 94+, Firefox 93+, Safari 15+)

**레거시 환경 지원이 필요한 경우:**
Babel 등의 트랜스파일러를 사용하여 타겟 환경에 맞게 변환해주세요.

**대상 패키지**

- `@winglet/json-schema`
- `@winglet/common-utils`

---

## 주요 기능

### 1. 스키마 탐색 및 유효성 검사

- **[`JsonSchemaScanner`](./src/utils/JsonSchemaScanner/JsonSchemaScanner.ts)**: JSON 스키마를 깊이 우선 탐색(DFS) 방식으로 순회하며 방문자(Visitor) 패턴을 적용하고 $ref 참조를 해결하는 클래스
- **[`JsonSchemaScannerAsync`](./src/utils/JsonSchemaScanner/JsonSchemaScannerAsync.ts)**: 비동기 작업을 지원하는 JsonSchemaScanner 확장 클래스

### 2. 타입 검증 및 필터링

- **[`isArraySchema`](./src/filter.ts)**: 스키마가 배열 타입인지 확인
- **[`isNumberSchema`](./src/filter.ts)**: 스키마가 숫자 타입인지 확인
- **[`isObjectSchema`](./src/filter.ts)**: 스키마가 객체 타입인지 확인
- **[`isStringSchema`](./src/filter.ts)**: 스키마가 문자열 타입인지 확인
- **[`isBooleanSchema`](./src/filter.ts)**: 스키마가 불리언 타입인지 확인
- **[`isNullSchema`](./src/filter.ts)**: 스키마가 null 타입인지 확인

### 3. 스키마 기반 데이터 처리

- **[`getValueWithSchema`](./src/utils/getValueWithSchema/getValueWithSchema.ts)**: 주어진 값과 스키마를 기반으로 필요한 데이터를 추출

### 4. JSON Schema 타입 정의

- 다양한 JSON Schema 타입 정의 ([`ObjectSchema`](./src/types/jsonSchema.ts), [`ArraySchema`](./src/types/jsonSchema.ts), [`StringSchema`](./src/types/jsonSchema.ts) 등)
- 스키마에서 값 타입을 추론하는 유틸리티 타입 ([`InferValueType`](./src/types/value.ts))

---

## 사용 예제

### JsonSchemaScanner 사용하기

```typescript
import { JsonSchemaScanner } from '@winglet/json-schema';

// 스키마 정의
const schema = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    age: { type: 'number' },
    address: {
      type: 'object',
      properties: {
        city: { type: 'string' },
        zipCode: { type: 'string' },
      },
    },
  },
};

// Visitor 패턴으로 스키마 탐색
const scanner = new JsonSchemaScanner({
  visitor: {
    enter: (entry, context) => {
      console.log(`Enter: ${entry.path}`);
    },
    exit: (entry, context) => {
      console.log(`Exit: ${entry.path}`);
    },
  },
  options: {
    maxDepth: 5, // 최대 탐색 깊이 설정
    filter: (entry, context) => {
      // 특정 조건에 따라 노드 필터링
      return true;
    },
  },
});

// 스키마 스캔
scanner.scan(schema);

// 처리된 스키마 가져오기
const processedSchema = scanner.getValue();
```

### 스키마 타입 검사하기

```typescript
import {
  isArraySchema,
  isObjectSchema,
  isStringSchema,
} from '@winglet/json-schema';

const schema = {
  type: 'object',
  properties: {
    /* ... */
  },
};

if (isObjectSchema(schema)) {
  // 객체 스키마 처리
  const properties = schema.properties;
  // ...
} else if (isArraySchema(schema)) {
  // 배열 스키마 처리
  const items = schema.items;
  // ...
}
```

### 스키마를 기반으로 데이터 추출하기

```typescript
import { getValueWithSchema } from '@winglet/json-schema';

const schema = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    age: { type: 'number' },
  },
  required: ['name'],
  oneOf: [{}], // oneOf가 있어야 작동합니다
};

const data = {
  name: 'John Doe',
  age: 30,
  extra: 'This will be filtered out',
};

const result = getValueWithSchema(data, schema);
console.log(result); // { name: 'John Doe', age: 30 }
```

---

## 개발 환경 설정

```bash
# 저장소 클론
dir=your-albatrion && git clone https://github.com/vincent-kk/albatrion.git "$dir" && cd "$dir"

# 의존성 설치
nvm use && yarn install && yarn run:all build

# 개발 빌드
yarn jsonSchema build

# 테스트 실행
yarn jsonSchema test
```

---

## API 참조

### 주요 클래스 및 함수

#### JsonSchemaScanner

JSON 스키마를 순회하고 참조를 해결하는 클래스입니다.

```typescript
class JsonSchemaScanner<ContextType = void> {
  constructor(props?: {
    visitor?: SchemaVisitor<ContextType>;
    options?: JsonScannerOptions<ContextType>;
  });
  scan(schema: UnknownSchema): this;
  getValue<Schema extends UnknownSchema>(): Schema | undefined;
}
```

#### JsonSchemaScannerAsync

비동기 작업을 지원하는 JsonSchemaScanner 확장 클래스입니다.

```typescript
class JsonSchemaScannerAsync<
  ContextType = void,
> extends JsonSchemaScanner<ContextType> {
  scanAsync(schema: UnknownSchema): Promise<this>;
  getValueAsync<Schema extends UnknownSchema>(): Promise<Schema | undefined>;
}
```

#### 타입 검증 함수

```typescript
function isArraySchema(schema: UnknownSchema): schema is ArraySchema;
function isNumberSchema(schema: UnknownSchema): schema is NumberSchema;
function isObjectSchema(schema: UnknownSchema): schema is ObjectSchema;
function isStringSchema(schema: UnknownSchema): schema is StringSchema;
function isBooleanSchema(schema: UnknownSchema): schema is BooleanSchema;
function isNullSchema(schema: UnknownSchema): schema is NullSchema;
```

#### 값 추출 함수

```typescript
function getValueWithSchema<Value>(
  value: Value | undefined,
  schema: JsonSchema,
): Value | undefined;
```

### 주요 타입 정의

```typescript
// 기본 JSON 스키마 타입
type JsonSchema<Options extends Dictionary = object> =
  | NumberSchema<Options, JsonSchema>
  | StringSchema<Options, JsonSchema>
  | BooleanSchema<Options, JsonSchema>
  | ArraySchema<Options, JsonSchema>
  | ObjectSchema<Options, JsonSchema>
  | NullSchema<Options, JsonSchema>;

// 값 타입
type BooleanValue = boolean;
type NumberValue = number;
type StringValue = string;
type ArrayValue = any[];
type ObjectValue = Record<string, any>;
type NullValue = null;
```

---

## 라이선스

이 저장소는 MIT 라이선스로 제공됩니다. 자세한 내용은 [`LICENSE`](./LICENSE) 파일을 참조하세요.

---

## 연락처

이 프로젝트에 관한 질문이나 제안이 있으시면 이슈를 생성해 주세요.
