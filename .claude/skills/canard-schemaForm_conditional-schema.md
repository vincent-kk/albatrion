---
name: schema-form-conditional-schema
description: "@canard/schema-form의 조건부 스키마 기능 전문가. oneOf, anyOf, allOf, if-then-else를 통한 동적 폼 구조 변경을 안내합니다."
user-invocable: false
---

# Conditional Schema Skill

@canard/schema-form의 조건부 스키마 기능에 대한 전문 스킬입니다.

## 스킬 정보 (Skill Info)

- **이름**: conditional-schema
- **용도**: oneOf, anyOf, allOf, if-then-else 관련 Q&A 및 구현 가이드
- **트리거**: oneOf, anyOf, allOf, if-then-else, 조건부 필드, 동적 폼 관련 질문

---

## 개요 (Overview)

조건부 스키마는 특정 조건에 따라 폼 구조를 동적으로 변경하는 기능입니다.

| 키워드 | 동작 | 값 처리 |
|--------|------|---------|
| `oneOf` | 배타적 선택 (하나만 활성화) | 비활성 브랜치 값 제거 |
| `anyOf` | 비배타적 선택 (여러 개 활성화 가능) | 비활성 브랜치 값 제거 |
| `allOf` | 모든 스키마 병합 | 항상 모든 값 포함 |
| `if-then-else` | 조건부 스키마 적용 | 조건에 따라 분기 |

---

## oneOf (배타적 선택)

하나의 조건만 활성화되며, 다른 브랜치의 필드는 폼 값에서 제거됩니다.

### 기본 사용법

```typescript
// stories/17.OneOf.stories.tsx 기반
const schema = {
  type: 'object',
  properties: {
    type: {
      type: 'string',
      enum: ['A', 'B'],
      default: 'A',
    },
  },
  oneOf: [
    {
      '&if': "./type === 'A'",  // computed.if의 별칭
      properties: {
        fieldA: { type: 'string' },
      },
    },
    {
      '&if': "./type === 'B'",
      properties: {
        fieldB: { type: 'number' },
      },
    },
  ],
};

// type = 'A' → { type: 'A', fieldA: '...' }
// type = 'B' → { type: 'B', fieldB: 123 }
```

### computed.if 사용

```typescript
const schema = {
  type: 'object',
  oneOf: [
    {
      computed: {
        if: "./category === 'game'",
      },
      properties: {
        releaseDate: { type: 'string', format: 'date' },
        numOfPlayers: { type: 'number' },
      },
    },
    {
      computed: {
        if: "./category === 'movie'",
      },
      properties: {
        openingDate: { type: 'string', format: 'date' },
        director: { type: 'string' },
      },
    },
  ],
  properties: {
    category: {
      type: 'string',
      enum: ['game', 'movie'],
      default: 'game',
    },
    title: { type: 'string' },
  },
};
```

### const 필드를 사용한 조건

```typescript
const schema = {
  type: 'object',
  properties: {
    country: {
      type: 'string',
      enum: ['KR', 'US', 'JP'],
    },
  },
  oneOf: [
    {
      computed: { if: "./country === 'KR'" },
      properties: {
        phone: {
          type: 'string',
          pattern: '^010-[0-9]{4}-[0-9]{4}$',
        },
      },
    },
    {
      computed: { if: "./country === 'US'" },
      properties: {
        phone: {
          type: 'string',
          pattern: '^\\+1-[0-9]{3}-[0-9]{4}$',
        },
      },
    },
  ],
};
```

### 중첩 oneOf

```typescript
const schema = {
  type: 'object',
  properties: {
    mainType: { type: 'string', enum: ['personal', 'business'] },
  },
  oneOf: [
    {
      '&if': "./mainType === 'personal'",
      properties: {
        subType: { type: 'string', enum: ['student', 'employee'] },
      },
      oneOf: [
        {
          '&if': "./subType === 'student'",
          properties: {
            school: { type: 'string' },
          },
        },
        {
          '&if': "./subType === 'employee'",
          properties: {
            company: { type: 'string' },
          },
        },
      ],
    },
    {
      '&if': "./mainType === 'business'",
      properties: {
        companyName: { type: 'string' },
        registrationNumber: { type: 'string' },
      },
    },
  ],
};
```

---

## anyOf (비배타적 선택)

여러 조건이 동시에 활성화될 수 있습니다. 각 브랜치는 독립적으로 평가됩니다.

### 기본 사용법

```typescript
// stories/31.AnyOf.stories.tsx 기반
const schema = {
  type: 'object',
  properties: {
    enableFeatureA: { type: 'boolean', default: true },
    enableFeatureB: { type: 'boolean', default: false },
    enableFeatureC: { type: 'boolean', default: false },
  },
  anyOf: [
    {
      computed: { if: './enableFeatureA === true' },
      properties: {
        featureAConfig: {
          type: 'object',
          properties: {
            settingA1: { type: 'string', default: 'default A1' },
            settingA2: { type: 'number', default: 100 },
          },
        },
      },
    },
    {
      computed: { if: './enableFeatureB === true' },
      properties: {
        featureBConfig: {
          type: 'object',
          properties: {
            settingB1: { type: 'string' },
            settingB2: { type: 'number', default: 50 },
          },
        },
      },
    },
    {
      computed: { if: './enableFeatureC === true' },
      properties: {
        featureCConfig: {
          type: 'object',
          properties: {
            settingC1: { type: 'string', default: 'C default' },
          },
        },
      },
    },
  ],
};

// 모두 활성화 시:
// {
//   enableFeatureA: true,
//   enableFeatureB: true,
//   enableFeatureC: true,
//   featureAConfig: { settingA1: '...', settingA2: 100 },
//   featureBConfig: { settingB1: '...', settingB2: 50 },
//   featureCConfig: { settingC1: '...' },
// }
```

### 결제 방법 예제

```typescript
const schema = {
  type: 'object',
  properties: {
    paymentMethod: {
      type: 'string',
      enum: ['creditCard', 'paypal', 'bankTransfer'],
      default: 'creditCard',
    },
    paymentDetails: {
      type: 'object',
      anyOf: [
        {
          computed: { if: "../paymentMethod === 'creditCard'" },
          properties: {
            cardNumber: { type: 'string', pattern: '^[0-9]{16}$' },
          },
          required: ['cardNumber'],
        },
        {
          computed: { if: "../paymentMethod === 'creditCard'" },
          properties: {
            expiryDate: { type: 'string', pattern: '^(0[1-9]|1[0-2])/[0-9]{2}$' },
          },
          required: ['expiryDate'],
        },
        {
          computed: { if: "../paymentMethod === 'creditCard'" },
          properties: {
            cvv: { type: 'string', pattern: '^[0-9]{3,4}$' },
          },
          required: ['cvv'],
        },
        {
          computed: { if: "../paymentMethod === 'paypal'" },
          properties: {
            email: { type: 'string', format: 'email' },
          },
          required: ['email'],
        },
        {
          computed: { if: "../paymentMethod === 'bankTransfer'" },
          properties: {
            accountNumber: { type: 'string', pattern: '^[0-9]{10,}$' },
          },
          required: ['accountNumber'],
        },
      ],
    },
  },
};
```

### 배열 아이템에서 anyOf

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
            default: 'text',
          },
        },
        anyOf: [
          {
            computed: { if: "./type === 'text'" },
            properties: {
              content: { type: 'string', minLength: 1 },
            },
            required: ['content'],
          },
          {
            computed: { if: "./type === 'number'" },
            properties: {
              value: { type: 'number' },
              unit: { type: 'string' },
            },
            required: ['value'],
          },
          {
            computed: { if: "./type === 'date'" },
            properties: {
              date: { type: 'string', format: 'date' },
              label: { type: 'string' },
            },
            required: ['date'],
          },
        ],
      },
    },
  },
};
```

---

## allOf (스키마 병합)

모든 스키마가 병합되어 적용됩니다. 조건 없이 항상 적용됩니다.

### 기본 사용법

```typescript
const schema = {
  type: 'object',
  allOf: [
    {
      properties: {
        id: { type: 'string' },
        createdAt: { type: 'string', format: 'date' },
      },
      required: ['id'],
    },
    {
      properties: {
        firstName: { type: 'string' },
        lastName: { type: 'string' },
      },
      required: ['firstName', 'lastName'],
    },
  ],
};

// 결과 스키마:
// {
//   properties: { id, createdAt, firstName, lastName },
//   required: ['id', 'firstName', 'lastName']
// }
```

### anyOf와 allOf 조합

```typescript
const schema = {
  type: 'object',
  properties: {
    entityType: {
      type: 'string',
      enum: ['person', 'organization'],
      default: 'person',
    },
    data: {
      type: 'object',
      // allOf: 공통 필드 (항상 적용)
      allOf: [
        {
          properties: {
            id: { type: 'string' },
            createdAt: { type: 'string', format: 'date' },
          },
          required: ['id'],
        },
      ],
      // anyOf: 조건부 필드
      anyOf: [
        {
          computed: { if: "/entityType === 'person'" },
          properties: {
            firstName: { type: 'string' },
            lastName: { type: 'string' },
          },
          required: ['firstName', 'lastName'],
        },
        {
          computed: { if: "/entityType === 'organization'" },
          properties: {
            organizationName: { type: 'string' },
            taxId: { type: 'string' },
          },
          required: ['organizationName'],
        },
      ],
    },
  },
};
```

---

## if-then-else

표준 JSON Schema의 조건부 스키마입니다.

### 기본 사용법

```typescript
// stories/06.IfThenElse.stories.tsx 기반
const schema = {
  type: 'object',
  properties: {
    category: {
      type: 'string',
      enum: ['game', 'movie'],
      default: 'game',
    },
    title: { type: 'string' },
    openingDate: { type: 'string', format: 'date' },
    releaseDate: { type: 'string', format: 'date' },
    numOfPlayers: { type: 'number' },
    price: { type: 'number', minimum: 50 },
  },
  if: {
    properties: {
      category: { enum: ['movie'] },
    },
  },
  then: {
    required: ['title', 'openingDate', 'price'],
  },
  else: {
    required: ['title', 'releaseDate', 'numOfPlayers'],
  },
};
```

### 중첩 if-then-else

```typescript
const schema = {
  type: 'object',
  properties: {
    participantType: {
      type: 'string',
      enum: ['adult', 'minor'],
      default: 'adult',
    },
    participantRegion: {
      type: 'string',
      enum: ['domestic', 'international'],
      default: 'domestic',
    },
    name: { type: 'string' },
    passportNumber: { type: 'string' },
    visaInformation: { type: 'string' },
    nationalIdNumber: { type: 'string' },
    guardianConsent: { type: 'string' },
    guardianContact: { type: 'string' },
  },
  if: {
    properties: {
      participantType: { const: 'adult' },
      participantRegion: { const: 'international' },
    },
  },
  then: {
    required: ['name', 'passportNumber', 'visaInformation'],
  },
  else: {
    if: {
      properties: {
        participantType: { const: 'adult' },
        participantRegion: { const: 'domestic' },
      },
    },
    then: {
      required: ['name', 'nationalIdNumber'],
    },
    else: {
      if: {
        properties: {
          participantType: { const: 'minor' },
        },
      },
      then: {
        required: ['name', 'guardianConsent', 'guardianContact'],
      },
      else: {
        required: ['name'],
      },
    },
  },
};
```

---

## oneOf + anyOf 조합

```typescript
const schema = {
  type: 'object',
  properties: {
    category: {
      type: 'string',
      enum: ['electronics', 'clothing', 'food'],
      default: 'electronics',
    },
    enableDiscount: { type: 'boolean', default: false },
    enableWarranty: { type: 'boolean', default: false },
  },
  // oneOf: 카테고리별 필드 (배타적)
  oneOf: [
    {
      computed: { if: "./category === 'electronics'" },
      properties: {
        model: { type: 'string' },
        voltage: { type: 'number' },
      },
    },
    {
      computed: { if: "./category === 'clothing'" },
      properties: {
        size: { type: 'string', enum: ['S', 'M', 'L', 'XL'] },
        color: { type: 'string' },
      },
    },
    {
      computed: { if: "./category === 'food'" },
      properties: {
        expiryDate: { type: 'string', format: 'date' },
        weight: { type: 'number' },
      },
    },
  ],
  // anyOf: 선택적 기능 (비배타적)
  anyOf: [
    {
      computed: { if: './enableDiscount === true' },
      properties: {
        discountPercent: { type: 'number', minimum: 0, maximum: 100 },
      },
    },
    {
      computed: { if: './enableWarranty === true' },
      properties: {
        warrantyMonths: { type: 'number', minimum: 1 },
      },
    },
  ],
};
```

---

## 값 처리 동작

### setValue 동작

```typescript
// 부모 노드에서 setValue 호출 시 조건부 필터링 적용
objectNode.setValue({
  category: 'movie',
  price: 200,  // movie 조건에 맞지 않으면 제거됨
});

// 자식 노드에서 setValue 호출 시 필터링 우회
const priceNode = objectNode.find('./price');
priceNode.setValue(999);  // 조건과 관계없이 값 설정됨
```

### 값 보존 규칙

| 시나리오 | oneOf | anyOf |
|----------|-------|-------|
| 브랜치 활성화 | 기본값 적용 | 기본값 적용 |
| 브랜치 비활성화 | 값 제거 | 값 제거 |
| 브랜치 재활성화 | 기본값으로 재설정 | 기본값으로 재설정 |

---

## 참고

- 전체 스펙: `docs/ko/SPECIFICATION.md`
- 관련 스토리: `stories/17.OneOf.stories.tsx`, `stories/31.AnyOf.stories.tsx`, `stories/06.IfThenElse.stories.tsx`
- 테스트 코드: `src/core/__tests__/ObjectNode.oneOf.test.ts`, `src/core/__tests__/ObjectNode.anyOf.test.ts`
