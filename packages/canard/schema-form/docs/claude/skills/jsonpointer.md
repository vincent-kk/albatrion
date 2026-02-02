---
name: schema-form-jsonpointer
description: "@canard/schema-form의 JSONPointer 확장 문법 전문가. RFC 6901 표준, 상대 경로(..), 와일드카드(*) 문법을 안내합니다."
user-invocable: false
---

# JSONPointer Skill

@canard/schema-form의 JSONPointer 확장 문법에 대한 전문 스킬입니다.

## 스킬 정보 (Skill Info)

- **이름**: jsonpointer
- **용도**: JSONPointer 경로 문법 및 확장 기능 가이드
- **트리거**: JSONPointer, 경로 참조, path, find, 와일드카드, 상대 경로 관련 질문

---

## 개요 (Overview)

Schema Form은 표준 JSONPointer (RFC 6901)를 확장하여 폼 구조 내 노드 참조를 지원합니다.

---

## 표준 JSONPointer (RFC 6901)

### 기본 문법

```typescript
'/property'           // 루트의 property 접근
'/nested/property'    // 중첩 객체 접근
'/array/0'            // 배열 인덱스 접근
'/array/0/property'   // 배열 아이템의 속성 접근
```

### 특수 문자 이스케이프

JSONPointer에서 `~`와 `/`는 특수 문자입니다.

| 문자 | 이스케이프 |
|------|------------|
| `~` | `~0` |
| `/` | `~1` |

```typescript
// 키에 슬래시 포함: { 'path/to/key': 'value' }
'/path~1to~1key'  // 'path/to/key' 접근

// 키에 틸다 포함: { '~tilde': 'value' }
'/~0tilde'        // '~tilde' 접근

// 복합: { 'a/b~c': 'value' }
'/a~1b~0c'        // 'a/b~c' 접근
```

---

## 확장 문법

### 상대 경로 (`..`, `.`)

computed 속성과 node.find()에서만 사용 가능합니다.

```typescript
// 형제 필드 참조
'../siblingField'

// 부모의 형제 참조
'../../parentSibling'

// 현재 노드 (주로 조건부 스키마에서)
'./type'
'./'
```

### 와일드카드 (`*`)

formTypeInputMap에서만 사용 가능합니다.

```typescript
const formTypeInputMap = {
  // 배열의 모든 아이템
  '/items/*': ItemInput,

  // 모든 아이템의 name 필드
  '/items/*/name': NameInput,

  // 중첩 와일드카드
  '/users/*/addresses/*/city': CityInput,

  // 동적 객체 키
  '/config/*': ConfigInput,
};
```

### 컨텍스트 참조 (`@`)

computed 속성에서만 사용 가능합니다.

```typescript
const schema = {
  type: 'string',
  computed: {
    visible: "@.userRole === 'admin'",
    readOnly: '@.isLocked',
  },
};

<Form
  jsonSchema={schema}
  context={{
    userRole: 'admin',
    isLocked: false,
  }}
/>
```

---

## 사용 컨텍스트별 지원 문법

| 문법 | computed | node.find() | formTypeInputMap |
|------|----------|-------------|------------------|
| 절대 경로 (`/`) | ✓ | ✓ | ✓ |
| 상대 경로 (`..`, `.`) | ✓ | ✓ | ✗ |
| 와일드카드 (`*`) | ✗ | ✗ | ✓ |
| 컨텍스트 (`@`) | ✓ | ✗ | ✗ |

---

## computed에서 사용

### 형제 필드 참조

```typescript
const schema = {
  type: 'object',
  properties: {
    category: {
      type: 'string',
      enum: ['A', 'B'],
    },
    details: {
      type: 'string',
      computed: {
        // ../category = 부모로 이동 후 category 참조
        active: "../category === 'A'",
        watch: '../category',
      },
    },
  },
};
```

### 절대 경로 참조

```typescript
const schema = {
  type: 'object',
  properties: {
    settings: {
      type: 'object',
      properties: {
        theme: { type: 'string' },
      },
    },
    content: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          computed: {
            // 절대 경로로 루트에서 참조
            readOnly: "/settings/theme === 'readonly'",
          },
        },
      },
    },
  },
};
```

### 중첩 경로 탐색

```typescript
const schema = {
  type: 'object',
  properties: {
    level1: {
      type: 'object',
      properties: {
        level2: {
          type: 'object',
          properties: {
            level3: {
              type: 'string',
              computed: {
                // 3단계 위로 이동
                visible: '../../../globalFlag === true',
              },
            },
          },
        },
      },
    },
    globalFlag: { type: 'boolean' },
  },
};
```

---

## node.find()에서 사용

### 기본 탐색

```typescript
// 절대 경로
const nameNode = rootNode.find('/user/name');

// 상대 경로 (현재 노드 기준)
const siblingNode = currentNode.find('../sibling');
const parentNode = currentNode.find('..');
```

### FormHandle에서 사용

```typescript
const formRef = useRef<FormHandle>(null);

// 노드 찾기
const emailNode = formRef.current?.findNode('/user/email');

// 와일드카드로 여러 노드 찾기
const allItems = formRef.current?.findNodes('/items/*');
```

---

## formTypeInputMap에서 사용

### 배열 아이템 매칭

```typescript
const formTypeInputMap = {
  // 첫 번째 아이템만
  '/items/0': FirstItemInput,

  // 모든 아이템
  '/items/*': ItemInput,

  // 특정 하위 필드
  '/items/*/name': NameInput,
  '/items/*/email': EmailInput,
};
```

### 동적 객체 키 매칭

```typescript
const formTypeInputMap = {
  // metadata 아래 모든 키
  '/metadata/*': MetadataValueInput,

  // 특정 패턴
  '/settings/*/enabled': ToggleInput,
  '/settings/*/value': ValueInput,
};
```

### 복합 패턴

```typescript
const formTypeInputMap = {
  // 여러 레벨 와일드카드
  '/orders/*/items/*': OrderItemInput,

  // 중첩 객체 내 배열
  '/users/*/addresses/*/city': CityInput,
};
```

---

## 이스케이프 처리

### formTypeInputMap에서 이스케이프

```typescript
// 키에 슬래시 포함: { 'object/Node': { ... } }
const formTypeInputMap = {
  '/object~1Node': SpecialInput,  // 'object/Node' 키 매칭
};
```

### 테스트 코드 참조

```typescript
// src/core/__tests__/AbstractNode.jsonPointerEscape.test.ts 기반
const schema = {
  type: 'object',
  properties: {
    'path/with/slash': { type: 'string' },
    'tilde~here': { type: 'number' },
  },
};

// 이스케이프된 경로로 접근
const node1 = rootNode.find('/path~1with~1slash');
const node2 = rootNode.find('/tilde~0here');
```

---

## 배열 인덱스 처리

### 정수 인덱스

```typescript
'/items/0'    // 첫 번째 아이템
'/items/1'    // 두 번째 아이템
'/items/99'   // 100번째 아이템
```

### 문자열 키 vs 인덱스

```typescript
// 배열의 경우
const arrayNode = node.find('/items');
arrayNode.children[0];  // 인덱스로 접근

// 객체의 경우
const objNode = node.find('/config');
objNode.children.find(c => c.name === 'key');  // 이름으로 접근
```

---

## 경로 빌드 유틸리티

### JSONPointer 생성

```typescript
import { toJsonPointer, escapeJsonPointer } from '@winglet/json';

// 배열을 JSONPointer로 변환
const path = toJsonPointer(['users', 0, 'name']);
// '/users/0/name'

// 특수 문자 이스케이프
const escaped = escapeJsonPointer('path/with/slash');
// 'path~1with~1slash'
```

### 경로 분해

```typescript
import { fromJsonPointer, unescapeJsonPointer } from '@winglet/json';

// JSONPointer를 배열로 변환
const segments = fromJsonPointer('/users/0/name');
// ['users', '0', 'name']

// 이스케이프 해제
const original = unescapeJsonPointer('path~1with~1slash');
// 'path/with/slash'
```

---

## 주의사항

### 1. 컨텍스트별 문법 제한

```typescript
// ❌ computed에서 와일드카드 사용 불가
computed: {
  visible: '/items/*/active',  // 에러
}

// ❌ formTypeInputMap에서 상대 경로 사용 불가
formTypeInputMap: {
  '../sibling': Input,  // 에러
}
```

### 2. 존재하지 않는 경로

```typescript
const node = rootNode.find('/nonexistent/path');
// null 반환 (에러 아님)
```

### 3. 배열 범위 초과

```typescript
// 배열에 3개 아이템만 있을 때
const node = rootNode.find('/items/10');
// null 반환
```

---

## 참고

- 전체 스펙: `docs/ko/SPECIFICATION.md`
- 테스트 코드: `src/core/__tests__/AbstractNode.jsonPointerEscape.test.ts`, `src/core/__tests__/AbstractNode.find.test.ts`
- RFC 6901: https://datatracker.ietf.org/doc/html/rfc6901
