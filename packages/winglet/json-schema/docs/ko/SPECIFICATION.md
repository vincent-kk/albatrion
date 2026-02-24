# @winglet/json-schema — 명세서

**버전:** 0.10.0
**라이선스:** MIT

---

## 목차

1. [개요](#개요)
2. [설치](#설치)
3. [빠른 시작](#빠른-시작)
4. [아키텍처 — Visitor 패턴](#아키텍처--visitor-패턴)
5. [JsonSchemaScanner API](#jsonschemaScanner-api)
6. [JsonSchemaScannerAsync API](#jsonschemascannerasync-api)
7. [스키마 필터](#스키마-필터)
8. [타입 정의](#타입-정의)
9. [resolveReference 유틸리티](#resolvereference-유틸리티)
10. [사용 패턴](#사용-패턴)
11. [호환성](#호환성)

---

## 개요

`@winglet/json-schema`는 JSON Schema 조작을 위한 TypeScript 라이브러리입니다. 다음 기능을 제공합니다.

- **스키마 순회** — enter/exit 콜백을 통한 JSON Schema 트리의 깊이 우선 탐색
- **$ref 해석** — JSON Schema `$ref` 포인터의 동기 및 비동기 해석
- **스키마 필터링** — nullable 변형을 포함한 모든 JSON Schema 타입에 대한 런타임 타입 가드
- **스키마 변환** — 순회 중 스키마 노드 변형 및 자동 결과 조합
- **순환 참조 감지** — 자기 참조 스키마에 대한 스택 기반 순환 방지

라이브러리는 4개의 서브 경로 내보내기를 통해 트리 쉐이킹이 가능하며, ESM과 CJS 빌드를 모두 제공합니다.

---

## 설치

```bash
# yarn (이 모노레포에서 권장)
yarn add @winglet/json-schema

# npm
npm install @winglet/json-schema
```

### 서브 경로 임포트

```typescript
// 전체 내보내기
import { JsonSchemaScanner, isObjectSchema, resolveReference } from '@winglet/json-schema';

// 동기 스캐너만
import { JsonSchemaScanner } from '@winglet/json-schema/scanner';

// 비동기 스캐너만
import { JsonSchemaScannerAsync } from '@winglet/json-schema/async-scanner';

// 타입 가드 함수만
import { isObjectSchema, isStringSchema, isCompatibleSchemaType } from '@winglet/json-schema/filter';
```

라이브러리의 일부만 필요한 경우 서브 경로 임포트를 사용하면 번들 크기를 줄일 수 있습니다.

---

## 빠른 시작

### 스키마를 순회하며 필드 경로 수집

```typescript
import { JsonSchemaScanner } from '@winglet/json-schema/scanner';

const schema = {
  type: 'object',
  properties: {
    name:    { type: 'string', minLength: 1 },
    age:     { type: 'number', minimum: 0 },
    address: {
      type: 'object',
      properties: {
        city:  { type: 'string' },
        zip:   { type: 'string' },
      },
    },
  },
  required: ['name'],
};

const fieldPaths: string[] = [];

new JsonSchemaScanner({
  visitor: {
    enter: ({ keyword, dataPath }) => {
      if (keyword === 'properties') fieldPaths.push(dataPath);
    },
  },
}).scan(schema);

console.log(fieldPaths);
// ['/name', '/age', '/address', '/address/city', '/address/zip']
```

### 런타임에 스키마 타입 확인

```typescript
import { isObjectSchema, isStringSchema, isArraySchema } from '@winglet/json-schema/filter';

const s = { type: ['string', 'null'], minLength: 1 };

if (isStringSchema(s)) {
  // s는 StringSchema로 타입이 좁혀짐
  console.log(s.minLength); // 1
}
```

---

## 아키텍처 — Visitor 패턴

`JsonSchemaScanner`는 **비재귀 스택 기반 DFS** 순회 엔진을 구현합니다. 재귀 호출 대신 명시적인 `Entry[]` 스택을 유지하고, 각 항목을 4개 단계로 구성된 상태 머신을 통해 진행시킵니다.

```
스키마 트리 노드 생명주기:
  스택에 추가
       │
  ┌────▼─────┐
  │  Enter   │  ← filter() 검사, mutate(), visitor.enter() 호출
  └────┬─────┘
       │
  ┌────▼─────────┐
  │  Reference   │  ← $ref 감지, resolveReference() 호출, 순환 참조 검사
  └────┬─────────┘
       │
  ┌────▼──────────────┐
  │  ChildEntries     │  ← maxDepth 검사, 자식 노드를 스택에 추가
  └────┬──────────────┘
       │
  ┌────▼─────┐
  │   Exit   │  ← visitor.exit() 호출, 순환 참조 추적 정리
  └────┬─────┘
       │
  스택에서 제거
```

**핵심 설계 특성:**

- **스택 안전** — 스택 오버플로우 없이 임의 깊이의 스키마 처리 가능
- **지연 해석** — `$ref` 노드는 실제로 만날 때만 해석됨
- **지연 변형** — `mutate()` 결과는 수집되어 `getValue()` 호출 시 단일 딥 클론으로 적용됨
- **쓰기 시 복사** — 순회 중에는 원본 스키마가 절대 수정되지 않음
- **스캔별 격리** — 각 `scan()` 호출이 모든 내부 상태를 초기화함

### 자식 노드 발견 순서

모든 스키마 노드 내에서 자식 노드는 다음 고정 순서로 발견되고 방문됩니다.

`$defs` → `definitions` → `additionalProperties` → `not/if/then/else` → `allOf/anyOf/oneOf` → `prefixItems` → `items` → `properties`

---

## JsonSchemaScanner API

### 생성자

```typescript
new JsonSchemaScanner<Schema extends UnknownSchema = UnknownSchema, ContextType = void>(
  props?: {
    visitor?: SchemaVisitor<Schema, ContextType>;
    options?: JsonScannerOptions<Schema, ContextType>;
  }
)
```

### SchemaVisitor

```typescript
interface SchemaVisitor<Schema, ContextType> {
  enter?: (entry: SchemaEntry<Schema>, context?: ContextType) => void;
  exit?:  (entry: SchemaEntry<Schema>, context?: ContextType) => void;
}
```

- `enter` — 노드를 처음 방문할 때 호출되며, 자식 노드가 스택에 추가되기 전에 실행됨
- `exit` — 노드의 모든 자손이 처리된 후 호출됨

### JsonScannerOptions

| 옵션 | 타입 | 설명 |
|------|------|------|
| `filter` | `(entry, context?) => boolean` | `false` 반환 시 노드와 모든 자손 건너뜀 |
| `mutate` | `(entry, context?) => Schema \| void` | 새 스키마 반환 시 노드 교체 (getValue()에서 적용됨) |
| `resolveReference` | `(ref, entry, context?) => Schema \| undefined` | `$ref` 포인터를 스키마 객체로 해석 |
| `maxDepth` | `number` | 최대 순회 깊이 (루트 = 깊이 0) |
| `context` | `ContextType` | 모든 콜백에 전달되는 공유 변경 가능 컨텍스트 |

### scan(schema)

```typescript
scan(schema: Schema): this
```

루트 스키마 노드부터 순회를 시작합니다. 순회 전에 모든 내부 상태를 초기화합니다. 메서드 체이닝을 위해 `this`를 반환합니다.

### getValue()

```typescript
getValue<OutputSchema extends UnknownSchema = Schema>(): OutputSchema | undefined
```

순회 후 처리된 스키마를 반환합니다.

- `scan()` 이전에 호출하면 `undefined` 반환
- 변형이나 해석된 참조가 없으면 원본 스키마 참조 반환
- 그렇지 않으면 모든 변형과 인라인 참조가 적용된 딥 클론 스키마 반환
- 결과를 캐싱하며, 이후 호출에서는 동일한 객체 반환

### SchemaEntry

```typescript
type SchemaEntry<Schema> = {
  schema:             Schema;     // 현재 스키마 노드
  path:               string;     // JSON 포인터: "#/properties/name"
  dataPath:           string;     // 데이터 경로: "/name"
  depth:              number;     // 루트에서 0
  hasReference?:      boolean;    // true: $ref 발견됐지만 해석되지 않음
  referencePath?:     string;     // 해석된 경우 원본 $ref 값
  referenceResolved?: boolean;    // true: resolveReference() 성공
  keyword?:           string;     // 이 항목을 생성한 구조적 키워드
  variant?:           string | number; // 프로퍼티 이름 또는 배열 인덱스
}
```

**keyword 값:** `'properties'`, `'$defs'`, `'definitions'`, `'items'`, `'prefixItems'`, `'additionalProperties'`, `'not'`, `'if'`, `'then'`, `'else'`, `'allOf'`, `'anyOf'`, `'oneOf'`

### 순환 참조 감지

스캐너는 `scan()` 호출마다 `Set<string>`에 해석된 `$ref` 경로를 추적합니다.

1. `$ref`가 해석되면 해당 경로가 Set에 추가됨
2. 해석된 스키마의 서브트리 순회 중 동일한 경로를 다시 만나면, 해당 노드는 `hasReference: true`로 표시되고 자식 노드 탐색을 건너뜀
3. 원본 해석된 노드가 exit될 때 해당 경로가 Set에서 제거되어 다른 브랜치에서 동일한 `$ref` 허용

---

## JsonSchemaScannerAsync API

`JsonSchemaScannerAsync`는 완전한 async/await 지원을 갖춘 스캐너의 병렬 구현입니다. 동일한 아키텍처를 공유하지만 모든 콜백이 `Promise<void>`를 반환할 수 있으며 `resolveReference`는 `Promise<Schema | undefined>`를 반환할 수 있습니다.

### 생성자

```typescript
new JsonSchemaScannerAsync<Schema, ContextType>(
  props?: {
    visitor?: SchemaVisitor<Schema, ContextType>;  // 콜백이 async 가능
    options?: JsonScannerOptionsAsync<Schema, ContextType>;
  }
)
```

`JsonScannerOptionsAsync`는 `resolveReference`가 `Promise`를 반환할 수 있다는 점을 제외하면 `JsonScannerOptions`와 동일합니다.

### scan(schema)

```typescript
async scan(schema: Schema): Promise<this>
```

순회가 완료된 후 `this`로 resolve되는 `Promise`를 반환합니다. `getValue()` 호출 전에 반드시 await해야 합니다.

### getValue()

동기 스캐너와 동일합니다. `scan()`을 await한 후 호출하세요.

```typescript
const scanner = new JsonSchemaScannerAsync({ /* ... */ });
const result = await scanner.scan(schema).then(s => s.getValue());
```

### 비동기 사용 사례

- **원격 $ref 해석** — 외부 URL에서 스키마 `fetch()`
- **데이터베이스 기반 스키마** — 데이터베이스에서 스키마 조각 조회
- **비동기 유효성 검사** — 순회 중 외부 API 호출
- **비동기 로깅** — visitor에서 데이터베이스나 메시지 큐에 쓰기
- **서비스 메시 스키마** — 서비스 디스커버리를 통한 마이크로서비스 스키마 해석

---

## 스키마 필터

모든 타입 가드는 `@winglet/json-schema/filter`에서 사용 가능합니다.

### 유니온 가드 (권장)

nullable과 non-nullable 스키마를 모두 처리합니다.

| 함수 | 매칭 대상 |
|------|----------|
| `isObjectSchema(s)` | `{ type: 'object' }` 또는 `{ type: ['object', 'null'] }` |
| `isArraySchema(s)` | `{ type: 'array' }` 또는 `{ type: ['array', 'null'] }` |
| `isStringSchema(s)` | `{ type: 'string' }` 또는 `{ type: ['string', 'null'] }` |
| `isNumberSchema(s)` | `{ type: 'number'\|'integer' }` 또는 nullable 변형 |
| `isBooleanSchema(s)` | `{ type: 'boolean' }` 또는 `{ type: ['boolean', 'null'] }` |
| `isNullSchema(s)` | `{ type: 'null' }` (순수 null, nullable 아님) |

모든 가드는 인수의 TypeScript 타입을 좁혀 타입별 필드(`properties`, `items`, `pattern` 등)에 접근할 수 있게 합니다.

### 특정 변형 가드

nullable과 non-nullable을 구분해야 하는 경우:

```typescript
isNonNullableObjectSchema(s)  // { type: 'object' } 만
isNullableObjectSchema(s)     // { type: ['object', 'null'] } 만

isNonNullableStringSchema(s)  // { type: 'string' } 만
isNullableStringSchema(s)     // { type: ['string', 'null'] } 만

// array, number, boolean도 동일한 패턴
```

### hasNullInType

```typescript
hasNullInType(schema: UnknownSchema): boolean
```

`schema.type`이 `'null'`을 포함하는 배열일 때 `true`를 반환합니다. `{ type: 'null' }`에는 매칭되지 않습니다.

```typescript
hasNullInType({ type: ['string', 'null'] })  // true
hasNullInType({ type: 'null' })              // false
```

### 스키마 비교

#### isIdenticalSchemaType

```typescript
isIdenticalSchemaType(left: UnknownSchema, right: UnknownSchema): boolean
```

nullable을 인식하는 엄격한 동등성 비교입니다. JSON Schema 배열 형식과 OpenAPI 3.0의 `nullable: true`를 모두 지원합니다.

```typescript
isIdenticalSchemaType({ type: 'string' }, { type: 'string' })                           // true
isIdenticalSchemaType({ type: ['string', 'null'] }, { type: 'string', nullable: true }) // true
isIdenticalSchemaType({ type: 'number' }, { type: 'integer' })                           // false
```

#### isCompatibleSchemaType

```typescript
isCompatibleSchemaType(left: UnknownSchema, right: UnknownSchema): boolean
```

느슨한 검사입니다. `number`와 `integer`는 호환 가능한 것으로 처리됩니다. nullable 차이는 무시됩니다.

```typescript
isCompatibleSchemaType({ type: 'number' }, { type: 'integer' })           // true
isCompatibleSchemaType({ type: ['string', 'null'] }, { type: 'string' }) // true
isCompatibleSchemaType({ type: [] }, { type: [] })                        // false (빈 배열)
```

---

## 타입 정의

### 핵심 스키마 타입

```typescript
// 기본 타입 — 모든 스키마 객체
type UnknownSchema = { type?: string | Readonly<string[]>; [key: string]: any }

// 전체 JSON Schema 유니온
type JsonSchema<Options = object> =
  | NonNullableNumberSchema | NullableNumberSchema
  | NonNullableStringSchema | NullableStringSchema
  | NonNullableBooleanSchema | NullableBooleanSchema
  | NonNullableArraySchema | NullableArraySchema
  | NonNullableObjectSchema | NullableObjectSchema
  | NullSchema

// $ref 노드
interface RefSchema {
  type?: undefined;
  $ref: string;
}
```

### 스키마 제네릭 파라미터

모든 스키마 타입은 두 가지 제네릭 파라미터를 허용합니다.

```typescript
ObjectSchema<Options extends Dictionary = object, Schema extends UnknownSchema = JsonSchema>
```

- `Options` — `schema.options` 확장 필드의 형태
- `Schema` — 중첩 스키마를 위한 재귀적 자기 참조

### InferJsonSchema

TypeScript 값 타입을 해당 스키마 인터페이스에 매핑합니다.

```typescript
type InferJsonSchema<Value, Options = object, Schema = JsonSchema>

// 예시
InferJsonSchema<string>          // NonNullableStringSchema
InferJsonSchema<string | null>   // NullableStringSchema
InferJsonSchema<null>            // NullSchema
InferJsonSchema<number[]>        // NonNullableArraySchema
```

### InferValueType

스키마 타입 정의를 런타임 값 타입으로 매핑합니다.

```typescript
type InferValueType<T extends { type?: string | readonly string[] }>

// 예시
InferValueType<{ type: 'string' }>             // string
InferValueType<{ type: ['string', 'null'] }>   // string | null
InferValueType<{ type: 'integer' }>            // number
InferValueType<{ type: 'array' }>              // any[]
InferValueType<{ type: 'object' }>             // Record<string, any>
```

### 공통 BasicSchema 필드

모든 타입 스키마는 `BasicSchema`에서 상속된 다음 공통 필드를 포함합니다.

| 필드 | 타입 | 설명 |
|------|------|------|
| `$defs` | `Dictionary<Schema>` | 재사용 가능한 스키마 정의 |
| `if/then/else` | `Partial<Schema>` | 조건부 스키마 |
| `not` | `Partial<Schema>` | 부정 스키마 |
| `allOf/anyOf/oneOf` | `Partial<Schema>[]` | 합성 스키마 |
| `const` | `Nullable<Type>` | 상수 값 제약 |
| `default` | `Nullable<Type>` | 기본값 |
| `enum` | `Nullable<Type>[]` | 허용 값 목록 |
| `nullable` | `boolean` | OpenAPI 3.0 nullable 플래그 |
| `readOnly` | `boolean` | 읽기 전용 힌트 |
| `disabled` | `boolean` | 비활성화 힌트 |
| `options` | `Options` | 커스텀 확장 옵션 |

### 타입별 추가 필드

#### NumberSchema

```typescript
minimum?: number;           // 포함 최솟값
maximum?: number;           // 포함 최댓값
exclusiveMinimum?: number;  // 제외 최솟값
exclusiveMaximum?: number;  // 제외 최댓값
multipleOf?: number;
format?: string;            // 'float' | 'double' | 커스텀
```

#### StringSchema

```typescript
minLength?: number;
maxLength?: number;
pattern?: string;   // 정규식
format?: string;    // 'email' | 'date' | 'uri' | 'uuid' | 커스텀
```

#### ArraySchema

```typescript
items?:           Schema | false;      // 모든 배열 항목의 스키마
prefixItems?:     Schema[];            // 튜플 항목 스키마 (JSON Schema 2020+)
contains?:        Partial<Schema>;
minItems?:        number;
maxItems?:        number;
uniqueItems?:     boolean;
additionalItems?: Partial<Schema> | boolean;
```

#### ObjectSchema

```typescript
properties?:           Dictionary<Schema>;          // 명명된 프로퍼티 스키마
patternProperties?:    Dictionary<Schema>;          // 정규식 키 프로퍼티 스키마
additionalProperties?: boolean | Partial<Schema>;  // 추가 프로퍼티 스키마
required?:             string[];                   // 필수 프로퍼티 목록
minProperties?:        number;
maxProperties?:        number;
dependentRequired?:    Dictionary<string[]>;
dependentSchemas?:     Dictionary<Partial<Schema>>;
```

---

## resolveReference 유틸리티

```typescript
import { resolveReference } from '@winglet/json-schema';

function resolveReference(jsonSchema: UnknownSchema): UnknownSchema | undefined
```

자기 완결적인 스키마(모든 참조를 `$defs` 또는 `definitions`에 정의하는 스키마)의 모든 내부 `$ref` 포인터를 해석하는 편의 유틸리티입니다.

**작동 방식 (2단계):**

1. 스키마를 스캔하여 해석되지 않은 모든 `$ref` 노드를 찾습니다. `@winglet/json` JSON 포인터의 `getValue`를 사용하여 스키마 내에서 각 ref를 조회합니다. `Map<refPath, resolvedSchema>`를 빌드합니다.
2. 1단계의 맵을 `resolveReference` 옵션으로 사용하여 재스캔하고 모든 ref를 인라인으로 만들어 처리된 스키마를 `getValue()`로 반환합니다.

**사용 시기:**

- 스키마가 자기 완결적인 경우 (모든 `$ref`가 `#/definitions/...` 또는 `#/$defs/...`를 가리킴)
- `$ref`가 없는 완전히 인라인된 스키마가 필요한 경우
- 커스텀 해석 로직이 필요 없는 경우

**커스텀 해석이 필요한 경우** `JsonSchemaScanner`를 직접 사용하세요.

```typescript
const inlined = new JsonSchemaScanner({
  options: {
    resolveReference: (ref, entry, context) => myCustomResolver(ref),
  },
}).scan(schema).getValue();
```

---

## 사용 패턴

### 패턴 1: 스키마 분석

아무것도 수정하지 않고 스키마를 순회하며 보고서를 작성합니다.

```typescript
const paths: string[] = [];
const required: string[] = [];

new JsonSchemaScanner({
  visitor: {
    enter: ({ keyword, dataPath, schema }) => {
      if (keyword !== 'properties') return;
      paths.push(dataPath);
      if (hasNullInType(schema)) return; // nullable은 선택 사항일 가능성이 높음
    },
  },
}).scan(schema);
```

### 패턴 2: 스키마 변환

순회 중 추가 메타데이터로 스키마를 보강합니다.

```typescript
import { isStringSchema, isNumberSchema } from '@winglet/json-schema/filter';

const enriched = new JsonSchemaScanner({
  options: {
    mutate: ({ schema, dataPath }) => {
      if (isStringSchema(schema) && !schema.title)
        return { ...schema, title: dataPath.split('/').pop() };
      if (isNumberSchema(schema) && schema.minimum === undefined)
        return { ...schema, minimum: 0 };
    },
  },
}).scan(schema).getValue();
```

### 패턴 3: 커스텀 리졸버로 $ref 인라인화

외부 레지스트리에서 참조를 해석합니다.

```typescript
const registry: Record<string, UnknownSchema> = {
  '#/definitions/Address': {
    type: 'object',
    properties: { city: { type: 'string' } },
  },
};

const inlined = new JsonSchemaScanner({
  options: {
    resolveReference: (ref) => registry[ref],
  },
}).scan(schema).getValue();
```

### 패턴 4: 비동기 스키마 합성

순회 중 원격 스키마를 가져와 복합 스키마를 빌드합니다.

```typescript
import { JsonSchemaScannerAsync } from '@winglet/json-schema/async-scanner';

const schemaCache = new Map<string, UnknownSchema>();

const scanner = new JsonSchemaScannerAsync({
  options: {
    resolveReference: async (ref) => {
      if (schemaCache.has(ref)) return schemaCache.get(ref)!;
      const schema = await fetch(ref).then(r => r.json());
      schemaCache.set(ref, schema);
      return schema;
    },
  },
});

const composed = await scanner.scan(rootSchema).then(s => s.getValue());
```

### 패턴 5: 조건부 순회

`filter`를 사용하여 스키마 속성에 따라 전체 서브트리를 건너뜁니다.

```typescript
const scanner = new JsonSchemaScanner({
  options: {
    // 읽기 전용 필드와 그 자손 건너뛰기
    filter: ({ schema }) => !schema.readOnly,
  },
  visitor: {
    enter: ({ path }) => console.log('방문 중', path),
  },
});
```

### 패턴 6: 타입 안전 스키마 빌딩

`InferJsonSchema`를 사용하여 컴파일 타임 타입 검사로 스키마를 작성합니다.

```typescript
import type { InferJsonSchema } from '@winglet/json-schema';

interface FormFieldOptions {
  placeholder?: string;
  autocomplete?: string;
}

// 값 타입으로부터 스키마 타입 추론
const nameSchema: InferJsonSchema<string, FormFieldOptions> = {
  type: 'string',
  minLength: 1,
  options: { placeholder: '이름 입력', autocomplete: 'name' },
};

const ageSchema: InferJsonSchema<number | null, FormFieldOptions> = {
  type: ['number', 'null'],
  minimum: 0,
  options: { placeholder: '나이 입력' },
};
```

### 패턴 7: 스캐너 인스턴스 재사용

`scan()`은 각 호출 시 내부 상태를 초기화합니다. 동일한 스캐너 인스턴스를 안전하게 재사용할 수 있습니다.

```typescript
const scanner = new JsonSchemaScanner({ visitor: myVisitor, options: myOptions });

const result1 = scanner.scan(schema1).getValue();
const result2 = scanner.scan(schema2).getValue();
// result1과 result2는 독립적
```

---

## 호환성

| 환경 | 최소 버전 |
|------|----------|
| Node.js | 16.11.0 |
| Chrome | 94 |
| Firefox | 93 |
| Safari | 15 |

ESM(`import`)과 CommonJS(`require`) 빌드가 모두 포함됩니다. 레거시 환경의 경우 Babel 또는 SWC를 사용하여 ES2022 구문을 트랜스파일하세요.

**의존성:**
- `@winglet/common-utils` — 객체 클로닝, 유틸리티 함수
- `@winglet/json` — JSON 포인터 연산 (`getValue`, `setValue`, `escapeSegment`)
