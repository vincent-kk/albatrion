---
name: schema-form-computed-properties
description: "@canard/schema-form의 Computed Properties 기능 전문가. watch, active, visible, readOnly, disabled, derived 속성을 통한 동적 필드 제어를 안내합니다."
user-invocable: false
---

# Computed Properties Skill

@canard/schema-form의 Computed Properties 기능에 대한 전문 스킬입니다.

## 스킬 정보 (Skill Info)

- **이름**: computed-properties
- **용도**: Computed Properties 관련 Q&A 및 구현 가이드
- **트리거**: computed, watch, active, visible, readOnly, disabled, pristine, derived 관련 질문

---

## 개요 (Overview)

Computed Properties는 다른 필드의 값에 따라 필드의 동작을 동적으로 제어하는 기능입니다.

### 지원 속성

| 속성 | 타입 | 설명 |
|------|------|------|
| `watch` | `string \| string[]` | 값 구독 (FormTypeInput에서 watchValues로 전달) |
| `active` | `boolean \| string` | 활성화 여부 (false면 값 제거) |
| `visible` | `boolean \| string` | 표시 여부 (false면 값 유지) |
| `readOnly` | `boolean \| string` | 읽기 전용 상태 |
| `disabled` | `boolean \| string` | 비활성화 상태 |
| `pristine` | `boolean \| string` | 상태 초기화 (dirty, touched 등) |
| `derived` | `string` | 파생 값 자동 계산 |

---

## 기본 문법

### computed 객체 사용

```typescript
const schema = {
  type: 'object',
  properties: {
    toggle: { type: 'boolean' },
    conditionalField: {
      type: 'string',
      computed: {
        visible: '../toggle === true',
        watch: '../toggle',
      },
    },
  },
};
```

### 단축 문법 (Alias Syntax)

```typescript
const schema = {
  type: 'object',
  properties: {
    toggle: { type: 'boolean' },
    conditionalField: {
      type: 'string',
      '&visible': '../toggle === true',  // computed.visible과 동일
    },
  },
};
```

지원하는 별칭: `&active`, `&visible`, `&readOnly`, `&disabled`, `&pristine`, `&derived`

---

## 경로 참조 규칙

### 상대 경로

```typescript
'../field'      // 형제 필드 참조
'../../field'   // 부모의 형제 필드 참조
'./field'       // 현재 객체의 자식 (배열 아이템에서 사용)
```

### 절대 경로

```typescript
'/field'        // 루트에서 시작하는 절대 경로
'/user/name'    // 중첩된 절대 경로
```

### 컨텍스트 참조

```typescript
'@.userRole'    // Form context 객체의 속성 참조
'@.locale'      // context prop으로 전달된 값 접근
```

---

## active vs visible

### active

`false`일 때 **값이 폼 데이터에서 제거됩니다**.

```typescript
const schema = {
  type: 'object',
  properties: {
    hasDiscount: { type: 'boolean', default: false },
    discountRate: {
      type: 'number',
      computed: {
        active: '../hasDiscount === true',
      },
    },
  },
};

// hasDiscount = false → { hasDiscount: false }
// hasDiscount = true  → { hasDiscount: true, discountRate: 10 }
```

### visible

`false`일 때 **UI에서만 숨겨지고 값은 유지됩니다**.

```typescript
const schema = {
  type: 'object',
  properties: {
    showDetails: { type: 'boolean', default: false },
    secretField: {
      type: 'string',
      default: 'hidden-value',
      computed: {
        visible: '../showDetails === true',
      },
    },
  },
};

// showDetails = false → { showDetails: false, secretField: 'hidden-value' }
// showDetails = true  → { showDetails: true, secretField: 'hidden-value' }
```

### 선택 가이드: active vs visible

**결정 흐름:**

```
필드를 조건부로 숨기고 싶다
    │
    ├─ 숨겨졌을 때 값도 제거해야 하나요?
    │      │
    │      ├─ YES → active 사용
    │      │   예: 할인 옵션 체크 해제 시 할인율 필드 및 값 제거
    │      │
    │      └─ NO → visible 사용
    │          예: 고급 설정 토글, 숨겨도 기존 설정값 유지
    │
```

| 상황 | 선택 | 이유 |
|------|------|------|
| 조건부 필드 (할인율, 추가옵션) | `active` | 조건 미충족 시 해당 데이터 불필요 |
| 단계별 폼 (Step 1 → Step 2) | `visible` | 이전 단계 데이터 유지 필요 |
| 권한 기반 필드 숨김 | `active` | 권한 없으면 데이터도 없어야 함 |
| 접기/펼치기 UI | `visible` | 접어도 데이터는 유지 |
| 결제 방법별 필드 | `active` | 다른 결제 방법 선택 시 이전 입력값 제거 |
| 미리보기 모드 | `visible` | 읽기 전용 표시, 데이터 유지 |

---

## 실제 예제

### 1. readOnly / disabled 조건부 설정

```typescript
// stories/11.ComputedProps.stories.tsx 기반
const schema = {
  type: 'object',
  properties: {
    prepared: { type: 'boolean', default: false },
    name: {
      type: 'string',
      computed: {
        // prepared가 false면 disabled
        disabled: '!(/prepared)',
      },
    },
    confirmButton: {
      type: 'boolean',
      computed: {
        // prepared가 false면 readOnly
        readOnly: '!(/prepared)',
      },
    },
    submitButton: {
      type: 'boolean',
      computed: {
        // name이 5글자 미만이면 disabled
        disabled: '(../name) === undefined || (../name).length < 5',
      },
    },
  },
};
```

### 2. watch를 사용한 값 구독

```typescript
// stories/05.WatchValues.stories.tsx 기반
const schema = {
  type: 'object',
  properties: {
    profile: {
      type: 'object',
      properties: {
        name: { type: 'string', default: 'harry' },
        age: { type: 'number', default: 10 },
      },
    },
    greeting: {
      type: 'string',
      formType: 'greeting',
      computed: {
        watch: ['/profile/name', '/profile/age', '/profile'],
      },
    },
  },
};

// FormTypeInput에서 watchValues 사용
const GreetingComponent = ({ watchValues }: FormTypeInputProps) => {
  // watchValues[0] = name 값
  // watchValues[1] = age 값
  // watchValues[2] = profile 객체 전체
  return (
    <strong>
      hello '{watchValues[0]}', {watchValues[1]} years old
    </strong>
  );
};
```

### 3. derived를 사용한 자동 계산

```typescript
// stories/36.DerivedValue.stories.tsx 기반

// 기본 계산
const schema = {
  type: 'object',
  properties: {
    price: { type: 'number', default: 1000 },
    quantity: { type: 'number', default: 1 },
    totalPrice: {
      type: 'number',
      computed: {
        derived: '../price * ../quantity',
      },
    },
  },
};

// 문자열 연결
const schema2 = {
  type: 'object',
  properties: {
    firstName: { type: 'string', default: '길동' },
    lastName: { type: 'string', default: '홍' },
    fullName: {
      type: 'string',
      computed: {
        derived: '../lastName + ../firstName',
      },
    },
  },
};

// 조건부 값 (삼항 연산자)
const schema3 = {
  type: 'object',
  properties: {
    age: { type: 'number', default: 20 },
    ageGroup: {
      type: 'string',
      computed: {
        derived: '../age >= 18 ? "성인" : "미성년자"',
      },
    },
  },
};

// 복잡한 수식
const schema4 = {
  type: 'object',
  properties: {
    price: { type: 'number', default: 10000 },
    quantity: { type: 'number', default: 2 },
    taxRate: { type: 'number', default: 10 },
    discountRate: { type: 'number', default: 5 },
    finalPrice: {
      type: 'number',
      computed: {
        derived: '../price * ../quantity * (1 + ../taxRate / 100) * (1 - ../discountRate / 100)',
      },
    },
  },
};

// Null 병합 연산자
const schema5 = {
  type: 'object',
  properties: {
    nickname: { type: 'string' },
    name: { type: 'string', default: '익명' },
    displayName: {
      type: 'string',
      computed: {
        derived: '../nickname || ../name || "알 수 없음"',
      },
    },
  },
};
```

### 4. pristine을 사용한 상태 초기화

```typescript
// stories/37.Pristine.stories.tsx 기반
const schema = {
  type: 'object',
  properties: {
    resetTrigger: {
      type: 'number',
      default: 0,
      computed: { visible: 'false' },  // 숨김 필드
    },
    name: {
      type: 'string',
      computed: {
        // 홀수일 때 pristine 발동
        pristine: '../resetTrigger % 2 === 1',
      },
    },
  },
};

// 사용법: resetTrigger 값을 증가시켜 상태 초기화
const handleReset = () => {
  const node = formRef.current?.findNode('/resetTrigger');
  if (node) node.value = (node.value as number) + 1;
};
```

### 5. 조건부 필드 조합

```typescript
// stories/06.IfThenElse.stories.tsx 기반
const schema = {
  type: 'object',
  properties: {
    type: {
      type: 'string',
      enum: ['adult', 'child', 'none'],
      default: 'adult',
    },
    age: {
      type: 'integer',
      default: 18,
    },
    gender: {
      type: 'string',
      enum: ['male', 'female', 'other'],
      default: 'male',
      computed: {
        // age가 18 이상일 때만 활성화
        active: '../age >= 18',
      },
    },
  },
};
```

---

## 주의사항

### 1. 순환 참조 방지

```typescript
// ❌ 잘못된 예 - 순환 참조
const badSchema = {
  properties: {
    a: { computed: { derived: '../b' } },
    b: { computed: { derived: '../a' } },
  },
};
```

### 2. pristine 동작 특성

- `pristine`은 **값을 변경하지 않고** 상태(dirty, touched)만 초기화합니다
- 표현식이 `true`인 동안 계속 상태가 초기화되므로 토글 방식을 권장합니다

### 3. 표현식 평가 시점

- Computed properties는 `UpdateComputedProperties` 이벤트 발생 시 평가됩니다
- 값 변경 후 비동기로 처리됩니다 (microtask)

---

## 참고

- 전체 스펙: `docs/ko/SPECIFICATION.md`
- 관련 스토리: `stories/11.ComputedProps.stories.tsx`, `stories/36.DerivedValue.stories.tsx`, `stories/37.Pristine.stories.tsx`
