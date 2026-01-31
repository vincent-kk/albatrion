# InjectTo Skill

@canard/schema-form의 injectTo 기능에 대한 전문 스킬입니다.

## 스킬 정보 (Skill Info)

- **이름**: inject-to
- **용도**: injectTo를 사용한 필드 간 값 주입 가이드
- **트리거**: injectTo, 필드 간 값 전파, 자동 값 설정 관련 질문

---

## 개요 (Overview)

`injectTo`는 한 필드의 값이 변경될 때 다른 필드로 값을 자동으로 주입하는 기능입니다. 순환 참조 방지 메커니즘이 내장되어 있습니다.

---

## injectTo vs derived 선택 가이드

### 비교 표

| 특성 | injectTo | derived |
|------|----------|---------|
| **방향** | 소스 → 타겟 | 의존성 → 현재 필드 |
| **트리거** | 소스 값 변경 시 | 의존성 값 변경 시 |
| **사용자 수정** | 타겟 필드 수정 **가능** | 자동 계산으로 **덮어씀** |
| **값 동기화** | 일회성 (주입 후 독립) | 지속적 (항상 계산) |
| **용도** | 초기값 복사, 기본값 설정 | 파생 값 자동 계산 |

### 결정 트리

```
다른 필드 값을 기반으로 값을 설정하고 싶다
    │
    ├─ 설정 후 사용자가 수정할 수 있어야 하나요?
    │      │
    │      ├─ YES → injectTo 사용
    │      │   예: 이름 입력 → 닉네임에 자동 복사 (이후 닉네임 수정 가능)
    │      │
    │      └─ NO → derived 사용
    │          예: 가격 × 수량 = 총액 (총액은 항상 계산됨)
    │
```

### 예시 비교

```typescript
// injectTo: 한 번 복사, 이후 독립적
name: {
  type: 'string',
  injectTo: (value) => ({ '../nickname': value }),  // 이름 입력 시 닉네임에 복사
}
// nickname은 이후 사용자가 자유롭게 수정 가능

// derived: 항상 계산
totalPrice: {
  type: 'number',
  '&derived': '(../price ?? 0) * (../quantity ?? 1)',  // 가격×수량
}
// totalPrice는 사용자가 수정해도 다시 계산됨
```

---

## 기본 문법

```typescript
{
  type: 'string',
  injectTo: (value: string) => ({
    '../targetField': `injected: ${value}`,
  }),
}
```

### 반환 객체

```typescript
{
  [JSONPointer 경로]: 주입할 값,
}
```

---

## 경로 유형

### 상대 경로 (형제 필드)

```typescript
// stories/39.InjectTo.stories.tsx 기반
const schema = {
  type: 'object',
  properties: {
    source: {
      type: 'string',
      injectTo: (value: string) => ({
        '../target': `injected: ${value}`,  // 형제 필드로 주입
      }),
    },
    target: {
      type: 'string',
    },
  },
};
```

### 절대 경로 (루트 기준)

```typescript
const schema = {
  type: 'object',
  properties: {
    rootTarget: {
      type: 'string',
    },
    nested: {
      type: 'object',
      properties: {
        deep: {
          type: 'object',
          properties: {
            source: {
              type: 'string',
              injectTo: (value: string) => ({
                '/rootTarget': `from-deep: ${value}`,  // 절대 경로로 루트 필드에 주입
              }),
            },
          },
        },
      },
    },
  },
};
```

---

## 다중 타겟 주입

하나의 소스에서 여러 타겟으로 동시에 값을 주입할 수 있습니다.

```typescript
const schema = {
  type: 'object',
  properties: {
    source: {
      type: 'string',
      injectTo: (value: string) => ({
        '../target1': `${value}-1`,
        '../target2': `${value}-2`,
        '../target3': `${value}-3`,
      }),
    },
    target1: { type: 'string' },
    target2: { type: 'string' },
    target3: { type: 'string' },
  },
};
```

---

## 순환 참조 방지

Schema Form은 순환 참조를 자동으로 감지하고 차단합니다.

### 직접 순환 (A ↔ B)

```typescript
const schema = {
  type: 'object',
  properties: {
    fieldA: {
      type: 'string',
      injectTo: (value: string) => ({
        '../fieldB': `fromA: ${value}`,
      }),
    },
    fieldB: {
      type: 'string',
      injectTo: (value: string) => ({
        '../fieldA': `fromB: ${value}`,  // 순환 참조 자동 차단
      }),
    },
  },
};

// Field A 입력 시:
// 1. A → B로 값 주입
// 2. B가 A로 주입 시도 → 순환 참조로 차단됨
```

### 삼각 순환 (A → B → C → A)

```typescript
const schema = {
  type: 'object',
  properties: {
    fieldA: {
      type: 'string',
      injectTo: (value: string) => ({
        '../fieldB': `A→B: ${value}`,
      }),
    },
    fieldB: {
      type: 'string',
      injectTo: (value: string) => ({
        '../fieldC': `B→C: ${value}`,
      }),
    },
    fieldC: {
      type: 'string',
      injectTo: (value: string) => ({
        '../fieldA': `C→A: ${value}`,  // 순환 참조 자동 차단
      }),
    },
  },
};

// Field A 입력 시:
// 1. A → B 주입 성공
// 2. B → C 주입 성공
// 3. C → A 주입 시도 → 순환 참조로 차단됨
```

---

## 체인 주입 (비순환)

순환이 아닌 경우 체인 주입이 정상적으로 동작합니다.

```typescript
const schema = {
  type: 'object',
  properties: {
    fieldA: {
      type: 'string',
      injectTo: (value: string) => ({
        '../fieldB': `A→B: ${value}`,
      }),
    },
    fieldB: {
      type: 'string',
      injectTo: (value: string) => ({
        '../fieldC': `B→C: ${value}`,
      }),
    },
    fieldC: {
      type: 'string',
      // 더 이상 주입 없음 - 체인 종료
    },
  },
};

// Field A에 "hello" 입력 시:
// fieldA: "hello"
// fieldB: "A→B: hello"
// fieldC: "B→C: A→B: hello"
```

---

## 조건부 주입

주입 함수 내에서 조건부 로직을 사용할 수 있습니다.

```typescript
const schema = {
  type: 'object',
  properties: {
    source: {
      type: 'string',
      injectTo: (value: string) => {
        // 조건부 주입
        if (value.length > 5) {
          return {
            '../longTarget': value,
          };
        }
        return {
          '../shortTarget': value,
        };
      },
    },
    shortTarget: { type: 'string' },
    longTarget: { type: 'string' },
  },
};
```

---

## 값 변환 주입

주입 시 값을 변환할 수 있습니다.

```typescript
const schema = {
  type: 'object',
  properties: {
    price: {
      type: 'number',
      injectTo: (value: number) => ({
        '../priceWithTax': Math.round(value * 1.1),
        '../formattedPrice': `₩${value.toLocaleString()}`,
      }),
    },
    priceWithTax: { type: 'number' },
    formattedPrice: { type: 'string' },
  },
};
```

---

## 객체/배열 주입

복잡한 데이터 타입도 주입할 수 있습니다.

```typescript
const schema = {
  type: 'object',
  properties: {
    template: {
      type: 'string',
      enum: ['basic', 'advanced'],
      injectTo: (value: string) => ({
        '../config': value === 'basic'
          ? { level: 1, features: [] }
          : { level: 2, features: ['a', 'b', 'c'] },
      }),
    },
    config: {
      type: 'object',
      properties: {
        level: { type: 'number' },
        features: {
          type: 'array',
          items: { type: 'string' },
        },
      },
    },
  },
};
```

---

## 주의사항

### 1. 순환 참조 동작

- 동일 매크로 태스크 내에서 순환 참조가 감지되면 차단됩니다
- `injectedNodeFlags`를 통해 이미 주입된 노드를 추적합니다

### 2. 비동기 처리

- injectTo는 값 변경 후 비동기로 처리됩니다
- 주입된 값은 다음 렌더링 사이클에 반영됩니다

### 3. 타겟 필드 존재 확인

- 주입 대상 경로의 필드가 존재하지 않으면 주입이 무시됩니다
- 조건부 스키마에서 비활성 필드로의 주입은 효과가 없을 수 있습니다

### 4. derived와의 차이점

상단의 [injectTo vs derived 선택 가이드](#injectto-vs-derived-선택-가이드) 섹션을 참조하세요.

---

## 참고

- 전체 스펙: `docs/ko/SPECIFICATION.md`
- 관련 스토리: `stories/39.InjectTo.stories.tsx`
- 테스트 코드: `src/core/__tests__/AbstractNode.injectTo.test.ts`
