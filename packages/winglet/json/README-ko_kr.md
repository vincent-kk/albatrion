# @winglet/json

[![TypeScript](https://img.shields.io/badge/typescript-✔-blue.svg)]()
[![JSON Schema](https://img.shields.io/badge/JsonSchema-{}-blue.svg)]()
[![RFC 6901](https://img.shields.io/badge/RFC%206901-compliant-green.svg)]()

---

## 개요

`@winglet/json`은 JSON 데이터를 안전하고 효율적으로 조작하기 위한 TypeScript 라이브러리입니다. RFC 6901(JSON Pointer)과 RFC 6902(JSON Patch) 표준을 준수하여 구조화된 JSON 데이터 처리를 제공합니다.

### 주요 특징

- **타입 안정성**: 완전한 TypeScript 지원으로 컴파일 타임 타입 검증
- **표준 준수**: RFC 6901(JSON Pointer) 및 RFC 6902(JSON Patch) 완전 구현
- **보안성**: 프로토타입 오염 공격 방지 기능 내장
- **유연성**: 불변성(immutable) 및 엄격 모드(strict mode) 옵션 제공
- **성능**: 최적화된 알고리즘으로 대용량 JSON 데이터 처리 지원

---

## 설치 방법

```bash
# npm 사용
npm install @winglet/json

# yarn 사용
yarn add @winglet/json

# pnpm 사용
pnpm add @winglet/json
```

---

## Sub-path Imports

이 패키지는 sub-path import를 지원하여 더 세분화된 가져오기를 가능하게 하고 번들 크기를 최적화합니다. 전체 패키지를 가져오지 않고 특정 모듈을 직접 가져올 수 있습니다:

```typescript
// 메인 내보내기 (모든 JSONPointer 및 JSONPath 유틸리티)
import { getValue, setValue } from '@winglet/json';

// JSONPath 유틸리티
import { JSONPath } from '@winglet/json/path';

// JSONPointer 유틸리티
import {
  getValue,
  setValue,
  escapePath,
  unescapePath,
  compare,
  applyPatch,
  difference,
  mergePatch
} from '@winglet/json/pointer';
```

### 사용 가능한 Sub-path

- `@winglet/json` - 메인 내보내기 (모든 JSONPointer 및 JSONPath 유틸리티)
- `@winglet/json/path` - JSONPath 상수 및 유틸리티
- `@winglet/json/pointer` - JSONPointer 조작, 이스케이핑, 패치 작업

---

## 호환성 안내

이 패키지는 ECMAScript 2020 (ES2020) 문법으로 작성되었습니다.

**지원 환경:**

- Node.js 14.0.0 이상
- 모던 브라우저 (ES2020 지원)

**레거시 환경 지원이 필요한 경우:**
Babel 등의 트랜스파일러를 사용하여 타겟 환경에 맞게 변환해주세요.

---

## API 참조

### JSONPath

JSONPath 표현식에서 사용되는 특수 문자 상수를 제공합니다.

#### 지원되는 연산자

- **[`JSONPath.Root`](./src/JSONPath/enum.ts)** (`$`): JSON 문서의 루트 노드
- **[`JSONPath.Parent`](./src/JSONPath/enum.ts)** (`_`): 현재 노드의 부모 노드
- **[`JSONPath.Current`](./src/JSONPath/enum.ts)** (`@`): 현재 처리 중인 노드
- **[`JSONPath.Child`](./src/JSONPath/enum.ts)** (`.`): 자식 노드 접근 연산자
- **[`JSONPath.Filter`](./src/JSONPath/enum.ts)** (`#`): 필터 조건 연산자

### JSONPointer

RFC 6901을 완전히 준수하는 JSON Pointer 구현을 제공합니다.

#### 핵심 기능

##### 데이터 조작

**[`getValue`](./src/JSONPointer/utils/manipulator/getValue.ts)**

```typescript
import { getValue } from '@winglet/json';

const data = {
  user: {
    profile: {
      name: 'Vincent',
      age: 30,
    },
  },
};

const name = getValue(data, '/user/profile/name');
// 결과: "Vincent"
```

**[`setValue`](./src/JSONPointer/utils/manipulator/setValue.ts)**

```typescript
import { setValue } from '@winglet/json';

const data = { user: { profile: {} } };
const result = setValue(data, '/user/profile/email', 'vincent@example.com');
// 결과: { user: { profile: { email: "vincent@example.com" } } }
```

##### 이스케이프 처리

**[`escapePath`](./src/JSONPointer/utils/escape/escapePath.ts)**

```typescript
import { escapePath } from '@winglet/json';

const escaped = escapePath('path/with~special');
// 결과: "path~1with~0special"
```

**[`unescapePath`](./src/JSONPointer/utils/escape/unescapePath.ts)**

```typescript
import { unescapePath } from '@winglet/json';

const unescaped = unescapePath('path~1with~0special');
// 결과: "path/with~special"
```

##### JSON Patch 연산

**[`compare`](./src/JSONPointer/utils/patch/compare/compare.ts)**

```typescript
import { compare } from '@winglet/json';

const source = { name: 'John', age: 30, city: 'NYC' };
const target = { name: 'John', age: 31, country: 'USA' };

const patches = compare(source, target);
// 결과:
// [
//   { op: "replace", path: "/age", value: 31 },
//   { op: "remove", path: "/city" },
//   { op: "add", path: "/country", value: "USA" }
// ]
```

**[`applyPatch`](./src/JSONPointer/utils/patch/applyPatch/applyPatch.ts)**

```typescript
import { applyPatch } from '@winglet/json';

const source = { name: 'John', age: 30 };
const patches = [
  { op: 'replace', path: '/age', value: 31 },
  { op: 'add', path: '/city', value: 'NYC' },
];

const result = applyPatch(source, patches);
// 결과: { name: "John", age: 31, city: "NYC" }
```

**[`difference`](./src/JSONPointer/utils/patch/difference/difference.ts)**

```typescript
import { difference } from '@winglet/json';

const source = { name: 'John', age: 30, city: 'NYC' };
const target = { name: 'John', age: 31, country: 'USA' };

const mergePatch = difference(source, target);
// 결과: { age: 31, city: null, country: "USA" }
```

**[`mergePatch`](./src/JSONPointer/utils/patch/mergePatch/mergePatch.ts)**

```typescript
import { mergePatch } from '@winglet/json';

const source = { name: 'John', age: 30, temp: 'data' };
const patch = { age: 31, temp: null, city: 'NYC' };

const result = mergePatch(source, patch);
// 결과: { name: "John", age: 31, city: "NYC" }
```

#### 옵션 설정

##### CompareOptions

```typescript
interface CompareOptions {
  strict?: boolean; // 엄격한 비교 모드 (기본값: false)
  immutable?: boolean; // 불변성 모드 (기본값: true)
}
```

##### ApplyPatchOptions

```typescript
interface ApplyPatchOptions {
  strict?: boolean; // 엄격한 적용 모드 (기본값: false)
  immutable?: boolean; // 불변성 모드 (기본값: true)
  protectPrototype?: boolean; // 프로토타입 보호 (기본값: true)
}
```

---

## 사용 예제

### 기본 사용법

```typescript
import { applyPatch, compare, getValue, setValue } from '@winglet/json';

// 복잡한 JSON 데이터
const data = {
  users: [
    { id: 1, name: 'Alice', preferences: { theme: 'dark' } },
    { id: 2, name: 'Bob', preferences: { theme: 'light' } },
  ],
  settings: {
    app: { version: '1.0.0' },
  },
};

// 값 조회
const theme = getValue(data, '/users/0/preferences/theme');
console.log(theme); // "dark"

// 값 설정
const updated = setValue(data, '/settings/app/version', '1.1.0');

// 변경사항 비교
const patches = compare(data, updated);
console.log(patches);
// [{ op: "replace", path: "/settings/app/version", value: "1.1.0" }]
```

### 고급 사용법 - 불변성과 보안

```typescript
import { applyPatch } from '@winglet/json';

const data = { user: { role: 'user' } };
const patches = [
  { op: 'add', path: '/user/permissions', value: ['read', 'write'] },
  { op: 'replace', path: '/user/role', value: 'admin' },
];

// 안전한 패치 적용 (프로토타입 오염 방지)
const result = applyPatch(data, patches, {
  immutable: true, // 원본 데이터 보존
  protectPrototype: true, // 프로토타입 오염 방지
  strict: true, // 엄격한 검증
});

console.log(data); // 원본 데이터 유지
console.log(result); // 변경된 새로운 객체
```

### JSON Merge Patch 사용법

```typescript
import { difference, mergePatch } from '@winglet/json';

const source = {
  user: { name: 'Alice', age: 25, role: 'admin', temp: 'data' },
  settings: { theme: 'dark' },
};

const target = {
  user: { name: 'Bob', age: 25, permissions: ['read', 'write'] },
  settings: { theme: 'light', language: 'ko' },
};

// 두 객체 간의 차이점을 JSON Merge Patch 형태로 생성
const patch = difference(source, target);
console.log(patch);
// {
//   user: { name: "Bob", role: null, temp: null, permissions: ["read", "write"] },
//   settings: { theme: "light", language: "ko" }
// }

// JSON Merge Patch 적용
const result = mergePatch(source, patch);
console.log(result);
// {
//   user: { name: "Bob", age: 25, permissions: ["read", "write"] },
//   settings: { theme: "light", language: "ko" }
// }
```

### 배열 조작

```typescript
import { getValue, setValue } from '@winglet/json';

const data = {
  items: ['apple', 'banana', 'cherry'],
};

// 배열 요소 접근
const secondItem = getValue(data, '/items/1');
// 결과: "banana"

// 배열 끝에 요소 추가 (RFC 6901의 "-" 사용)
const withNewItem = setValue(data, '/items/-', 'date');
// 결과: { items: ["apple", "banana", "cherry", "date"] }
```

---

## 오류 처리

```typescript
import { JSONPointerError, getValue } from '@winglet/json';

try {
  const value = getValue({}, '/nonexistent/path');
} catch (error) {
  if (error instanceof JSONPointerError) {
    console.error('JSON Pointer 오류:', error.message);
    console.error('오류 코드:', error.code);
    console.error('추가 정보:', error.details);
  }
}
```

---

## 성능 고려사항

- **대용량 데이터**: 깊이가 깊은 객체나 큰 배열을 다룰 때는 `immutable: false` 옵션을 고려하세요
- **빈번한 변경**: 많은 패치를 순차적으로 적용할 때는 `strict: false`로 성능을 향상시킬 수 있습니다
- **메모리 사용**: 불변성 모드는 메모리를 더 사용하지만 안전성을 보장합니다

---

## 라이선스

이 저장소는 MIT 라이선스로 제공됩니다. 자세한 내용은 [`LICENSE`](./LICENSE) 파일을 참조하세요.

---

## 관련 표준

- [RFC 6901 - JavaScript Object Notation (JSON) Pointer](https://datatracker.ietf.org/doc/html/rfc6901)
- [RFC 6902 - JavaScript Object Notation (JSON) Patch](https://datatracker.ietf.org/doc/html/rfc6902)
- [RFC 7396 - JSON Merge Patch](https://datatracker.ietf.org/doc/html/rfc7396)
- [JSONPath - XPath for JSON](https://goessner.net/articles/JsonPath/)

---

## 연락처

이 프로젝트에 관한 질문이나 제안이 있으시면 GitHub 이슈를 생성해 주세요.
