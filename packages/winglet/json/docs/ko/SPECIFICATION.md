# @winglet/json — 명세서

**버전**: 0.10.0
**표준**: RFC 6901 (JSON Pointer), RFC 6902 (JSON Patch), RFC 7396 (JSON Merge Patch)

---

## 목차

1. [설치](#설치)
2. [빠른 시작](#빠른-시작)
3. [서브패스 임포트](#서브패스-임포트)
4. [JSON Pointer](#json-pointer)
   - [getValue](#getvalue)
   - [setValue](#setvalue)
   - [escapePath / unescapePath](#escapepath--unescapepath)
   - [escapeSegment](#escapesegment)
   - [convertJsonPointerToPath](#convertjsonpointertopath)
5. [JSON Patch](#json-patch)
   - [compare](#compare)
   - [applyPatch](#applypatch)
   - [difference](#difference)
   - [mergePatch](#mergepatch)
6. [JSON Path](#json-path)
   - [getJSONPath](#getjsonpath)
   - [convertJsonPathToPointer](#convertjsonpathtopointer)
7. [타입 정의](#타입-정의)
8. [보안](#보안)
9. [에러 처리](#에러-처리)
10. [성능](#성능)

---

## 설치

```bash
npm install @winglet/json
yarn add @winglet/json
pnpm add @winglet/json
```

**요구사항**: Node.js 14.0.0 이상 또는 ES2020을 지원하는 최신 브라우저.

---

## 빠른 시작

```typescript
import { getValue, setValue, compare, applyPatch } from '@winglet/json';

const document = {
  users: [
    { id: 1, name: 'Alice', role: 'admin' },
    { id: 2, name: 'Bob',   role: 'user' },
  ],
  settings: { theme: 'dark', language: 'ko' },
};

// JSON Pointer로 값 읽기
const theme = getValue(document, '/settings/theme');
// 'dark'

// 값 쓰기 (원본 객체를 직접 변경)
setValue(document, '/settings/theme', 'light');

// 두 객체의 차이를 패치 배열로 생성
const patches = compare(
  { name: 'Alice', age: 25 },
  { name: 'Alice', age: 26, city: 'Seoul' },
);
// [
//   { op: 'replace', path: '/age', value: 26 },
//   { op: 'add', path: '/city', value: 'Seoul' }
// ]

// 패치 적용 (기본값: 원본 불변)
const updated = applyPatch(document, patches);
```

---

## 서브패스 임포트

번들 사이즈 최적화를 위해 서브패스 임포트를 권장합니다.

| 서브패스 | 내보내는 항목 |
|----------|-------------|
| `@winglet/json` | 모든 항목 |
| `@winglet/json/pointer` | 모든 JSONPointer 유틸리티 |
| `@winglet/json/pointer-manipulator` | `getValue`, `setValue` |
| `@winglet/json/pointer-patch` | `compare`, `applyPatch`, `difference`, `mergePatch` |
| `@winglet/json/pointer-escape` | `escapePath`, `unescapePath`, `escapeSegment` |
| `@winglet/json/pointer-common` | `JSONPointer` 상수, `convertJsonPointerToPath` |
| `@winglet/json/path` | `JSONPath` 상수 |
| `@winglet/json/path-common` | `getJSONPath`, `convertJsonPathToPointer` |

```typescript
import { getValue, setValue }           from '@winglet/json/pointer-manipulator';
import { compare, applyPatch }          from '@winglet/json/pointer-patch';
import { escapePath, escapeSegment }    from '@winglet/json/pointer-escape';
```

---

## JSON Pointer

JSON Pointer(RFC 6901)는 JSON 문서 내의 특정 값을 식별하는 문자열입니다. 각 참조 토큰은 `/`로 시작합니다.

### 포인터 문법

| 포인터 | 가리키는 위치 |
|--------|-------------|
| `""` | 전체 문서 (루트) |
| `"/foo"` | 루트의 `foo` 속성 |
| `"/foo/bar"` | `foo` 아래의 `bar` 속성 |
| `"/arr/0"` | `arr` 배열의 첫 번째 원소 |
| `"/a~1b"` | 키 `a/b` (슬래시를 `~1`로 이스케이프) |
| `"/a~0b"` | 키 `a~b` (틸드를 `~0`으로 이스케이프) |

### getValue

JSON Pointer로 지정된 위치의 값을 읽습니다.

```typescript
function getValue<Output>(
  value: object | any[],
  pointer: string | string[],
): Output
```

**매개변수**

| 매개변수 | 타입 | 설명 |
|---------|------|------|
| `value` | `object \| any[]` | 원본 JSON 문서 (일반 객체 또는 배열) |
| `pointer` | `string \| string[]` | JSON Pointer 문자열 또는 참조 토큰 배열 |

**반환값**: 지정된 위치의 값.

**예외**: `INVALID_INPUT`, `INVALID_POINTER`, `PROPERTY_NOT_FOUND` 코드의 `JSONPointerError`.

```typescript
import { getValue } from '@winglet/json/pointer-manipulator';

const doc = {
  store: {
    books: [
      { title: 'RFC 6901', author: 'IETF', price: 0 },
      { title: '클린코드', author: 'Martin', price: 35 },
    ],
  },
};

getValue(doc, '/store/books/0/title');   // 'RFC 6901'
getValue(doc, '/store/books/1/price');   // 35
getValue(doc, '');                        // 전체 문서
getValue(doc, ['store', 'books', '0']); // { title: 'RFC 6901', ... }

// 이스케이프된 키
const data = { 'a/b': 'slash', 'a~b': 'tilde' };
getValue(data, '/a~1b'); // 'slash'
getValue(data, '/a~0b'); // 'tilde'
```

### setValue

JSON Pointer로 지정된 위치에 값을 씁니다. **입력 객체를 직접 변경하고 동일한 참조를 반환합니다.**

```typescript
function setValue<Output>(
  value: object | any[],
  pointer: string | string[],
  input: any,
  options?: {
    overwrite?: boolean;    // 기본값: true
    preserveNull?: boolean; // 기본값: true
  },
): Output
```

**옵션**

| 옵션 | 기본값 | 설명 |
|------|--------|------|
| `overwrite` | `true` | `false`이면 이미 값이 있는 위치는 변경하지 않음 |
| `preserveNull` | `true` | `false`이면 중간 경로의 `null`을 객체/배열로 대체하여 경로 생성 |

```typescript
import { setValue } from '@winglet/json/pointer-manipulator';

const obj = { user: {} };

// 기본 쓰기
setValue(obj, '/user/name', 'Alice');
// obj.user.name === 'Alice'

// 중간 경로 자동 생성
setValue(obj, '/config/db/host', 'localhost');
// obj.config.db.host === 'localhost'

// 배열 끝에 추가 (RFC 6901 '-' 문법)
const arr = { items: [1, 2, 3] };
setValue(arr, '/items/-', 4);
// arr.items === [1, 2, 3, 4]

// 덮어쓰기 방지
setValue(obj, '/user/name', 'Bob', { overwrite: false });
// obj.user.name 여전히 'Alice'

// null 경로 통과
const nulled = { profile: null };
setValue(nulled, '/profile/name', 'Alice', { preserveNull: false });
// nulled.profile === { name: 'Alice' }
```

### escapePath / unescapePath

완전한 JSON Pointer 경로를 이스케이프/언이스케이프합니다. 경로 구분자(`/`)는 유지되고 각 세그먼트 내의 `~`와 `/`만 이스케이프됩니다.

```typescript
function escapePath(path: string): string
function unescapePath(path: string): string
```

```typescript
import { escapePath, unescapePath } from '@winglet/json/pointer-escape';

escapePath('/users/john~doe/settings');
// '/users/john~0doe/settings'

unescapePath('/users/john~0doe/settings');
// '/users/john~doe/settings'

// 왕복 변환 보장
const original = '/data/key~with~tildes/value';
unescapePath(escapePath(original)) === original; // true
```

### escapeSegment

단일 참조 토큰(하나의 경로 세그먼트)을 이스케이프합니다. `~`와 `/` 모두 이스케이프 시퀀스로 변환됩니다.

```typescript
function escapeSegment(segment: string): string
```

```typescript
import { escapeSegment } from '@winglet/json/pointer-escape';

escapeSegment('api/v1');       // 'api~1v1'
escapeSegment('config~prod');  // 'config~0prod'
escapeSegment('normal');       // 'normal' (이스케이프 불필요)

// 동적 키로 포인터 만들기
const key     = 'api/v1';
const pointer = `/${escapeSegment(key)}/status`;
// '/api~1v1/status'
```

### convertJsonPointerToPath

JSON Pointer 문자열을 언이스케이프된 참조 토큰 배열로 변환합니다.

```typescript
function convertJsonPointerToPath(pointer: string): string[]
```

```typescript
import { convertJsonPointerToPath } from '@winglet/json/pointer-common';

convertJsonPointerToPath('/foo/bar');     // ['foo', 'bar']
convertJsonPointerToPath('/a~1b/c~0d');  // ['a/b', 'c~d']
convertJsonPointerToPath('');            // []
```

---

## JSON Patch

JSON Patch(RFC 6902)는 JSON 문서를 변환하는 연산의 시퀀스를 기술하는 형식입니다.

### 패치 연산

| 연산 | 필드 | 설명 |
|------|------|------|
| `add` | `op`, `path`, `value` | 지정 경로에 값 추가 |
| `remove` | `op`, `path` | 지정 경로의 값 제거 |
| `replace` | `op`, `path`, `value` | 지정 경로의 값 교체 |
| `move` | `op`, `path`, `from` | 값을 다른 경로로 이동 |
| `copy` | `op`, `path`, `from` | 값을 다른 경로로 복사 |
| `test` | `op`, `path`, `value` | 지정 경로의 값이 주어진 값과 같은지 단언 |

### compare

`source`를 `target`으로 변환하는 JSON Patch 연산 배열을 생성합니다.

```typescript
function compare<Source, Target>(
  source: Source,
  target: Target,
  options?: {
    strict?: boolean;    // 기본값: false
    immutable?: boolean; // 기본값: true
  },
): Patch[]
```

```typescript
import { compare } from '@winglet/json/pointer-patch';

const source = { name: 'Alice', age: 25, role: 'user' };
const target = { name: 'Alice', age: 26, permissions: ['read'] };

compare(source, target);
// [
//   { op: 'replace', path: '/age', value: 26 },
//   { op: 'remove',  path: '/role' },
//   { op: 'add',     path: '/permissions', value: ['read'] }
// ]

// 동일한 객체 → 빈 배열
compare({ x: 1 }, { x: 1 }); // []

// 중첩 객체 비교
compare(
  { settings: { theme: 'dark', lang: 'ko' } },
  { settings: { theme: 'light', lang: 'ko' } }
);
// [{ op: 'replace', path: '/settings/theme', value: 'light' }]
```

### applyPatch

JSON Patch 연산 배열을 소스 문서에 순서대로 적용합니다.

```typescript
function applyPatch<Result>(
  source: object | any[],
  patches: Patch[],
  options?: {
    strict?: boolean;           // 기본값: false
    immutable?: boolean;        // 기본값: true
    protectPrototype?: boolean; // 기본값: true
  },
): Result
```

```typescript
import { applyPatch } from '@winglet/json/pointer-patch';

const source = { name: 'Alice', tags: ['admin'] };

const result = applyPatch(source, [
  { op: 'add',     path: '/email', value: 'alice@example.com' },
  { op: 'replace', path: '/name',  value: 'Alicia' },
  { op: 'add',     path: '/tags/-', value: 'editor' },
  { op: 'remove',  path: '/tags/0' },
]);
// { name: 'Alicia', email: 'alice@example.com', tags: ['editor'] }
// source는 변경되지 않음

// 이동 연산
applyPatch({ a: { b: 1 } }, [
  { op: 'move', from: '/a/b', path: '/c' },
]);
// { a: {}, c: 1 }

// test 연산 후 조건부 변경
applyPatch({ status: 'draft' }, [
  { op: 'test',    path: '/status', value: 'draft' },
  { op: 'replace', path: '/status', value: 'published' },
]);
// { status: 'published' }
```

### difference

두 값의 차이를 나타내는 JSON Merge Patch(RFC 7396)를 생성합니다.

```typescript
function difference(
  source: JsonValue,
  target: JsonValue,
): JsonValue | undefined
```

source와 target이 동일하면 `undefined`를 반환합니다. 객체 비교에서 `null`은 "이 키를 제거"를 의미합니다. 배열은 병합이 아닌 전체 교체로 처리됩니다.

```typescript
import { difference } from '@winglet/json/pointer-patch';

difference({ a: 1, b: 2 }, { a: 1, b: 3, c: 4 });
// { b: 3, c: 4 }

difference({ a: 1, b: 2 }, { a: 1 });
// { b: null }  ← null은 'b를 제거'를 의미

difference({ x: 1 }, { x: 1 });
// undefined  ← 변경 없음

difference([1, 2, 3], [1, 2, 4]);
// [1, 2, 4]  ← 배열은 통째로 교체

// 중첩 객체
difference(
  { user: { name: 'Alice', role: 'admin', temp: true } },
  { user: { name: 'Bob',   role: 'admin' } }
);
// { user: { name: 'Bob', temp: null } }
```

### mergePatch

JSON Merge Patch 문서를 소스 값에 적용합니다(RFC 7396).

```typescript
function mergePatch<Type>(
  source: JsonValue,
  mergePatchBody: JsonValue | undefined,
  immutable?: boolean, // 기본값: true
): Type
```

- 패치의 `null` 값은 해당 속성을 제거합니다.
- 패치가 일반 객체가 아닌 경우(배열 포함) 소스 전체를 교체합니다.
- 패치가 `undefined`이면 소스를 그대로 반환합니다.

```typescript
import { mergePatch } from '@winglet/json/pointer-patch';

// 속성 추가 및 변경
mergePatch({ name: 'Alice', age: 25 }, { age: 26, city: 'Seoul' });
// { name: 'Alice', age: 26, city: 'Seoul' }

// null로 속성 제거
mergePatch({ name: 'Alice', temp: 'data' }, { temp: null });
// { name: 'Alice' }

// 중첩 병합
mergePatch(
  { user: { name: 'Alice', role: 'admin' } },
  { user: { role: null, email: 'alice@example.com' } }
);
// { user: { name: 'Alice', email: 'alice@example.com' } }

// 비객체 패치 = 전체 교체
mergePatch({ complex: true }, 'simple');
// 'simple'

// 뮤터블 모드 (성능 우선)
const src = { a: 1 };
const res = mergePatch(src, { b: 2 }, false);
src === res; // true — 동일 참조
```

---

## JSON Path

### JSONPath 상수

```typescript
import { JSONPath } from '@winglet/json/path';

JSONPath.Root;    // '$'  — 문서 루트
JSONPath.Current; // '@'  — 현재 처리 중인 노드
JSONPath.Child;   // '.'  — 자식 속성 접근자
JSONPath.Filter;  // '#'  — 필터 연산자
```

### getJSONPath

`root`에서 `target`까지의 JSONPath 표현식을 깊이 우선 탐색(참조 동등성)으로 찾습니다.

```typescript
function getJSONPath<Root extends object, Target>(
  root: Root,
  target: Target,
): string | null
```

`target`이 `root` 내에서 찾을 수 없거나 리프 노드의 원시값이면 `null`을 반환합니다.

```typescript
import { getJSONPath } from '@winglet/json/path-common';

const doc = { a: { b: [{ c: 'value' }] } };

getJSONPath(doc, doc);          // '$'
getJSONPath(doc, doc.a);        // '$.a'
getJSONPath(doc, doc.a.b);      // '$.a.b'
getJSONPath(doc, doc.a.b[0]);   // '$.a.b[0]'
getJSONPath(doc, {});           // null — 다른 참조

// 점을 포함한 키는 대괄호 표기법 사용
const special = { 'key.with.dots': { nested: true } };
getJSONPath(special, special['key.with.dots']);
// "$['key.with.dots']"
```

### convertJsonPathToPointer

JSONPath 문자열을 동등한 JSON Pointer 문자열로 변환합니다.

```typescript
function convertJsonPathToPointer(jsonPath: string): string
```

```typescript
import { convertJsonPathToPointer } from '@winglet/json/path-common';

convertJsonPathToPointer('$.foo.bar');       // '/foo/bar'
convertJsonPathToPointer('$.users[0].name'); // '/users/0/name'
convertJsonPathToPointer('$');               // ''
convertJsonPathToPointer("$['a/b'].c");      // '/a~1b/c'
```

---

## 타입 정의

```typescript
// JSON 기본 타입
type JsonPrimitive = string | number | boolean | null;
type JsonArray     = Array<any>;
type JsonObject    = Record<string, any>;
type JsonValue     = JsonPrimitive | JsonArray | JsonObject;
type JsonRoot      = JsonArray | JsonObject;

// 패치 연산 타입
type Operation = 'add' | 'replace' | 'remove' | 'move' | 'copy' | 'test';

interface AddPatch<V>     { op: 'add';     path: string; value: V }
interface ReplacePatch<V> { op: 'replace'; path: string; value: V }
interface RemovePatch     { op: 'remove';  path: string }
interface MovePatch       { op: 'move';    path: string; from: string }
interface CopyPatch       { op: 'copy';    path: string; from: string }
interface TestPatch<V>    { op: 'test';    path: string; value: V }

type Patch = AddPatch<any> | ReplacePatch<any> | RemovePatch
           | MovePatch | CopyPatch | TestPatch<any>;

// 옵션 타입
type CompareOptions    = { strict?: boolean; immutable?: boolean };
type ApplyPatchOptions = { strict?: boolean; immutable?: boolean; protectPrototype?: boolean };
```

---

## 보안

### 프로토타입 오염 방지

`applyPatch`는 `protectPrototype: true`(기본값)일 때 `__proto__`, `constructor`, `prototype` 경로를 대상으로 하는 패치를 거부합니다.

```typescript
// 예외 발생 — 프로토타입 오염 시도 차단
applyPatch({}, [{ op: 'add', path: '/__proto__/isAdmin', value: true }]);

// 신뢰할 수 있는 소스에서만 비활성화
applyPatch(trustedSource, trustedPatches, { protectPrototype: false });
```

### 입력 유효성 검사

`getValue`와 `setValue`는 일반 객체가 아닌 입력을 거부합니다:

```typescript
getValue('string', '/path');   // INVALID_INPUT 예외
getValue(null, '/path');       // INVALID_INPUT 예외
getValue(new Map(), '/path');  // INVALID_INPUT 예외
```

---

## 에러 처리

```typescript
import { JSONPointerError, isJSONPointerError } from '@winglet/json';

class JSONPointerError extends Error {
  code: 'INVALID_INPUT' | 'INVALID_POINTER' | 'PROPERTY_NOT_FOUND';
  details: Record<string, unknown>;
}
```

| 코드 | 발생 조건 |
|------|----------|
| `INVALID_INPUT` | 입력이 일반 객체 또는 배열이 아닌 경우 |
| `INVALID_POINTER` | 포인터 문법이 잘못된 경우 |
| `PROPERTY_NOT_FOUND` | 경로가 문서에 존재하지 않는 경우 |

```typescript
import { getValue, JSONPointerError } from '@winglet/json';

try {
  getValue({}, '/missing');
} catch (e) {
  if (e instanceof JSONPointerError) {
    console.log(e.code);    // 'PROPERTY_NOT_FOUND'
    console.log(e.details); // { pointer: '/missing', ... }
  }
}

// 타입 가드 활용
function safeGet<T>(obj: object, ptr: string, fallback: T): T {
  try {
    return getValue(obj, ptr) as T;
  } catch (e) {
    if (isJSONPointerError(e) && e.code === 'PROPERTY_NOT_FOUND') {
      return fallback;
    }
    throw e;
  }
}
```

---

## 성능

| 상황 | 권장 설정 |
|------|----------|
| 깊은 중첩 구조의 대용량 문서 | `immutable: false` — 딥 클론 오버헤드 제거 |
| 순차적 패치 다량 적용 | `strict: false`(기본값) — 연산별 추가 검증 생략 |
| 신뢰할 수 있는 패치 소스 | `protectPrototype: false` — 프로토타입 검사 제거 |
| 메모리 제약 환경 | `mergePatch`의 `immutable: false` |

```typescript
// 최고 성능 (신뢰할 수 있는 환경에서만 사용)
applyPatch(source, patches, {
  immutable: false,
  strict: false,
  protectPrototype: false,
});
```

---

## 관련 표준

- [RFC 6901 — JSON Pointer](https://datatracker.ietf.org/doc/html/rfc6901)
- [RFC 6902 — JSON Patch](https://datatracker.ietf.org/doc/html/rfc6902)
- [RFC 7396 — JSON Merge Patch](https://datatracker.ietf.org/doc/html/rfc7396)
- [JSONPath — JSON을 위한 XPath](https://goessner.net/articles/JsonPath/)
