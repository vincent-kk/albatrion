# Array Operations Skill

@canard/schema-form의 배열 조작 기능에 대한 전문 스킬입니다.

## 스킬 정보 (Skill Info)

- **이름**: array-operations
- **용도**: ArrayNode 조작, 배열 아이템 관리 가이드
- **트리거**: array, push, remove, clear, minItems, maxItems, prefixItems 관련 질문

---

## 개요 (Overview)

ArrayNode는 JSON Schema의 array 타입을 처리하며, 아이템 추가/삭제/초기화 등의 조작 메서드를 제공합니다.

---

## 배열 스키마 정의

### 기본 배열

```typescript
const schema = {
  type: 'object',
  properties: {
    items: {
      type: 'array',
      items: {
        type: 'string',
      },
    },
  },
};
```

### 제약조건이 있는 배열

```typescript
const schema = {
  type: 'object',
  properties: {
    items: {
      type: 'array',
      items: {
        type: 'string',
      },
      minItems: 1,      // 최소 1개 아이템 필수
      maxItems: 10,     // 최대 10개까지 허용
      default: ['초기값'],  // 기본값
    },
  },
};
```

### 객체 배열

```typescript
const schema = {
  type: 'object',
  properties: {
    users: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          email: { type: 'string', format: 'email' },
        },
        required: ['name'],
      },
      minItems: 1,
    },
  },
};
```

---

## 배열 조작 메서드

### ArrayNode 접근

```typescript
import type { ArrayNode } from '@canard/schema-form';

// FormHandle에서 접근
const arrayNode = formRef.current?.findNode('/items') as ArrayNode;

// FormTypeInput에서 접근
const MyArrayInput: FC<FormTypeInputProps<string[]>> = ({ node }) => {
  const arrayNode = node as ArrayNode;
  // ...
};
```

### push() - 아이템 추가

```typescript
// 기본값으로 추가
const newIndex = await arrayNode.push();

// 특정 값으로 추가
const newIndex = await arrayNode.push('새 아이템');

// 객체 아이템 추가
const newIndex = await arrayNode.push({ name: '홍길동', email: 'hong@example.com' });
```

### remove() - 아이템 삭제

```typescript
// 인덱스로 삭제
await arrayNode.remove(0);  // 첫 번째 아이템 삭제
await arrayNode.remove(2);  // 세 번째 아이템 삭제
```

### clear() - 전체 삭제

```typescript
// 모든 아이템 삭제
await arrayNode.clear();

// 주의: minItems가 설정된 경우 해당 개수만큼 유지됨
// minItems: 2인 경우 clear() 후에도 2개 아이템 존재
```

---

## 실제 예제

### 동적 리스트 관리

```typescript
// stories/27.OptimizeArrayUsecase.stories.tsx 기반
const schema = {
  type: 'object',
  properties: {
    arr: {
      type: 'array',
      FormTypeInput: ({ node, value }: FormTypeInputProps<number[]>) => {
        const handlePush = async () => {
          const newIndex = await node.push(Math.random() * 100);
          console.log('추가된 인덱스:', newIndex);
        };

        const handleRemove = async (index: number) => {
          await node.remove(index);
        };

        const handleClear = () => {
          node.clear();
        };

        return (
          <div>
            <button onClick={handlePush}>아이템 추가</button>
            <button onClick={handleClear}>전체 삭제</button>

            {value?.map((item, index) => (
              <div key={index}>
                <span>{item}</span>
                <button onClick={() => handleRemove(index)}>삭제</button>
              </div>
            ))}
          </div>
        );
      },
      items: {
        type: 'number',
      },
    },
  },
};
```

### 배열 속성 접근

```typescript
const arrayNode = formRef.current?.findNode('/items') as ArrayNode;

// 현재 아이템 수
console.log('Length:', arrayNode.length);

// 자식 노드 접근
arrayNode.children.forEach((child, index) => {
  console.log(`Item ${index}:`, child.node.value);
});

// 특정 아이템 노드 접근
const firstItem = arrayNode.children[0]?.node;
if (firstItem) {
  console.log('First item value:', firstItem.value);
}
```

---

## Terminal vs Branch Strategy

배열은 아이템 타입에 따라 다른 전략을 사용합니다.

### Terminal Strategy (단순 타입)

```typescript
// 아이템이 primitive 타입일 때 자동 적용
const schema = {
  type: 'array',
  items: {
    type: 'string',  // primitive → Terminal Strategy
  },
};

// 성능이 좋고 메모리 효율적
```

### Branch Strategy (복합 타입)

```typescript
// 아이템이 object/array 타입일 때 자동 적용
const schema = {
  type: 'array',
  items: {
    type: 'object',  // complex → Branch Strategy
    properties: {
      name: { type: 'string' },
    },
  },
};

// 각 아이템에 대한 노드 트리 생성
```

### 명시적 전략 설정

```typescript
const schema = {
  type: 'array',
  terminal: false,  // 강제로 Branch Strategy 사용
  items: {
    type: 'string',
  },
};
```

---

## prefixItems (튜플)

고정 위치에 다른 스키마를 적용합니다.

```typescript
const schema = {
  type: 'object',
  properties: {
    coordinate: {
      type: 'array',
      prefixItems: [
        { type: 'number', title: 'X 좌표' },
        { type: 'number', title: 'Y 좌표' },
        { type: 'number', title: 'Z 좌표' },
      ],
      items: false,  // 추가 아이템 불허
    },
  },
};

// 결과: [x, y, z] 형태의 튜플
```

### prefixItems + items 조합

```typescript
const schema = {
  type: 'array',
  prefixItems: [
    { type: 'string', title: '이름' },
    { type: 'number', title: '나이' },
  ],
  items: {
    type: 'string',  // 나머지 아이템은 string
  },
};

// 결과: [string, number, ...string[]]
```

---

## Nullable 배열

```typescript
const schema = {
  type: 'object',
  properties: {
    nullableArray: {
      type: ['array', 'null'],  // 배열 또는 null
      items: {
        type: 'string',
      },
    },
  },
};

// 유효한 값:
// - null
// - []
// - ['a', 'b', 'c']
```

---

## 배열 내 조건부 스키마

```typescript
const schema = {
  type: 'object',
  properties: {
    items: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          type: {
            type: 'string',
            enum: ['text', 'number', 'date'],
          },
        },
        oneOf: [
          {
            '&if': "./type === 'text'",
            properties: {
              content: { type: 'string' },
            },
          },
          {
            '&if': "./type === 'number'",
            properties: {
              value: { type: 'number' },
            },
          },
          {
            '&if': "./type === 'date'",
            properties: {
              date: { type: 'string', format: 'date' },
            },
          },
        ],
      },
    },
  },
};
```

---

## FormTypeInput에서 배열 렌더링

### ChildNodeComponents 활용

```typescript
const ArrayRenderer: FC<FormTypeInputProps<any[]>> = ({
  node,
  value,
  ChildNodeComponents,
}) => {
  const arrayNode = node as ArrayNode;

  return (
    <div>
      <button onClick={() => arrayNode.push()}>추가</button>

      {ChildNodeComponents.map((ChildNode, index) => (
        <div key={index} style={{ display: 'flex', gap: 8 }}>
          <ChildNode />
          <button onClick={() => arrayNode.remove(index)}>삭제</button>
        </div>
      ))}
    </div>
  );
};
```

### Controlled 방식

```typescript
const ControlledArrayInput: FC<FormTypeInputProps<string[]>> = ({
  value,
  onChange,
}) => (
  <input
    type="text"
    value={value?.join(', ') ?? ''}
    onChange={(e) => onChange(e.target.value.split(', ').filter(Boolean))}
  />
);
```

---

## 성능 최적화

### 대량 아이템 처리

```typescript
const BenchmarkArray: FC<FormTypeInputProps<number[]>> = ({ node }) => {
  const handleBenchmark = async () => {
    node.clear();

    // 100개 아이템 일괄 추가
    const promises = [];
    for (let i = 0; i < 100; i++) {
      promises.push(node.push(i * 10));
    }
    await Promise.all(promises);
  };

  return <button onClick={handleBenchmark}>100개 추가</button>;
};
```

### Terminal Strategy 권장

```typescript
// 단순 타입 배열은 terminal 유지 (기본값)
const schema = {
  type: 'array',
  items: { type: 'string' },
  // terminal: true (기본값, 명시 불필요)
};
```

---

## 참고

- 전체 스펙: `docs/ko/SPECIFICATION.md`
- 관련 스토리: `stories/27.OptimizeArrayUsecase.stories.tsx`, `stories/35.PrefixItems.stories.tsx`
- 테스트 코드: `src/core/__tests__/ArrayNode.*.test.ts`
