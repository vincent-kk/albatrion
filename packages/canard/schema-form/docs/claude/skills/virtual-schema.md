# Virtual Schema Skill

@canard/schema-form의 Virtual Schema 기능에 대한 전문 스킬입니다.

## 스킬 정보 (Skill Info)

- **이름**: virtual-schema
- **용도**: virtual 속성을 사용한 가상 필드 그룹화 가이드
- **트리거**: virtual, VirtualNode, 필드 그룹화, 기간 선택, 다중 필드 조합 관련 질문

---

## 개요 (Overview)

Virtual Schema는 여러 필드를 하나의 가상 필드로 그룹화하여 단일 FormTypeInput으로 제어할 수 있게 합니다. 기간 선택(startDate, endDate), 주소 입력(city, zipCode) 등 여러 필드를 함께 다루는 UI에 유용합니다.

---

## 기본 문법

```typescript
{
  type: 'object',
  properties: {
    field1: { type: 'string' },
    field2: { type: 'string' },
  },
  virtual: {
    virtualFieldName: {
      fields: ['field1', 'field2'],
      FormTypeInput?: ComponentType,  // 선택
      computed?: ComputedProps,        // 선택
    },
  },
}
```

---

## 기본 사용 예제

### 기간 선택 (Date Range)

```typescript
// stories/08.VirtualSchema.stories.tsx 기반
const schema = {
  type: 'object',
  properties: {
    startDate: {
      type: 'string',
      format: 'date',
    },
    endDate: {
      type: 'string',
      format: 'date',
    },
  },
  virtual: {
    period: {
      fields: ['startDate', 'endDate'],
    },
  },
};

// 값 형태:
// { startDate: '2025-01-01', endDate: '2025-01-31' }
// virtual.period의 값: ['2025-01-01', '2025-01-31']
```

### 커스텀 FormTypeInput

```typescript
const schema = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    age: { type: 'number' },
  },
  virtual: {
    user: {
      fields: ['name', 'age'],
      FormTypeInput: ({ value, onChange }) => {
        // value는 [name값, age값] 형태의 배열
        return (
          <div>
            <input
              type="text"
              value={value?.[0] ?? ''}
              onChange={(e) => onChange([e.target.value, value?.[1]])}
              placeholder="Name"
            />
            <input
              type="number"
              value={value?.[1] ?? ''}
              onChange={(e) => onChange([value?.[0], e.target.value])}
              placeholder="Age"
            />
          </div>
        );
      },
    },
  },
};
```

---

## Virtual 필드 값 구조

Virtual 필드의 값은 `fields` 배열 순서대로 튜플 형태입니다.

```typescript
virtual: {
  period: {
    fields: ['startDate', 'endDate'],
  },
}

// FormTypeInput에서 받는 value:
// [startDateValue, endDateValue]

// onChange 호출:
onChange(['2025-01-01', '2025-01-31']);
// → startDate: '2025-01-01', endDate: '2025-01-31'로 각각 설정됨
```

---

## Computed Properties 적용

Virtual 필드에도 computed 속성을 적용할 수 있습니다.

```typescript
const schema = {
  type: 'object',
  properties: {
    control: {
      type: 'string',
      enum: ['A', 'B', 'C'],
      default: 'A',
    },
    virtualFiled_A1: {
      type: 'string',
      format: 'date',
      default: '2025-01-01',
    },
    virtualFiled_A2: {
      type: 'string',
      format: 'date',
    },
    virtualField_B1: {
      type: 'string',
      format: 'week',
      default: '2025-W28',
    },
    virtualField_B2: {
      type: 'string',
      format: 'week',
    },
  },
  virtual: {
    virtualField_A: {
      fields: ['virtualFiled_A1', 'virtualFiled_A2'],
      computed: {
        active: '../control === "A"',
      },
    },
    virtualField_B: {
      fields: ['virtualField_B1', 'virtualField_B2'],
      '&active': '../control === "B"',  // 단축 문법
    },
  },
};

// control이 'A'이면: virtualField_A만 활성화 (visible)
// control이 'B'이면: virtualField_B만 활성화
// control이 'C'이면: 둘 다 비활성화
```

---

## Required와 Virtual

Virtual 필드를 required에 포함하면 포함된 모든 필드가 required됩니다.

```typescript
const schema = {
  type: 'object',
  properties: {
    control: { type: 'string' },
    virtualFiled_A1: { type: 'string' },
    virtualFiled_A2: { type: 'string' },
  },
  virtual: {
    virtualField_A: {
      fields: ['virtualFiled_A1', 'virtualFiled_A2'],
    },
  },
  // virtualField_A를 required로 지정하면
  // virtualFiled_A1, virtualFiled_A2 모두 required됨
  required: ['control', 'virtualField_A'],
};
```

---

## 여러 Virtual 필드

하나의 스키마에 여러 virtual 필드를 정의할 수 있습니다.

```typescript
const schema = {
  type: 'object',
  properties: {
    firstName: { type: 'string' },
    lastName: { type: 'string' },
    city: { type: 'string' },
    zipCode: { type: 'string' },
    startDate: { type: 'string', format: 'date' },
    endDate: { type: 'string', format: 'date' },
  },
  virtual: {
    fullName: {
      fields: ['firstName', 'lastName'],
      FormTypeInput: FullNameInput,
    },
    address: {
      fields: ['city', 'zipCode'],
      FormTypeInput: AddressInput,
    },
    period: {
      fields: ['startDate', 'endDate'],
      FormTypeInput: DateRangePicker,
    },
  },
};
```

---

## FormTypeInputProps for Virtual

Virtual 필드의 FormTypeInput이 받는 props:

```typescript
interface VirtualFormTypeInputProps {
  // 값: fields 순서대로 배열
  value: [T1, T2, ...] | undefined;

  // 변경 핸들러
  onChange: (value: [T1, T2, ...]) => void;

  // 노드 정보
  node: VirtualNode;

  // 개별 필드 노드 접근 (node.children을 통해)
  // node.children[0]?.node → firstName 노드
  // node.children[1]?.node → lastName 노드

  // 기타 FormTypeInputProps
  readOnly: boolean;
  disabled: boolean;
  errors: JsonSchemaError[];
  // ...
}
```

---

## 실제 사용 예제

### 주소 입력

```typescript
const AddressInput: FC<FormTypeInputProps<[string, string]>> = ({
  value,
  onChange,
  disabled,
  readOnly,
}) => {
  const [city, zipCode] = value ?? ['', ''];

  return (
    <div className="address-input">
      <input
        type="text"
        value={city}
        onChange={(e) => onChange([e.target.value, zipCode])}
        placeholder="City"
        disabled={disabled}
        readOnly={readOnly}
      />
      <input
        type="text"
        value={zipCode}
        onChange={(e) => onChange([city, e.target.value])}
        placeholder="Zip Code"
        disabled={disabled}
        readOnly={readOnly}
        pattern="\d{5}"
      />
    </div>
  );
};

const schema = {
  type: 'object',
  properties: {
    city: { type: 'string' },
    zipCode: { type: 'string', pattern: '^\\d{5}$' },
  },
  virtual: {
    address: {
      fields: ['city', 'zipCode'],
      FormTypeInput: AddressInput,
    },
  },
};
```

### 기간 선택 with 검증

```typescript
const DateRangePicker: FC<FormTypeInputProps<[string, string]>> = ({
  value,
  onChange,
  errors,
  errorVisible,
}) => {
  const [start, end] = value ?? ['', ''];

  const handleStartChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newStart = e.target.value;
    // 시작일이 종료일보다 늦으면 종료일도 업데이트
    const newEnd = newStart > end ? newStart : end;
    onChange([newStart, newEnd]);
  };

  return (
    <div className="date-range">
      <input
        type="date"
        value={start}
        onChange={handleStartChange}
      />
      <span>~</span>
      <input
        type="date"
        value={end}
        min={start}
        onChange={(e) => onChange([start, e.target.value])}
      />
      {errorVisible && errors.length > 0 && (
        <span className="error">{errors[0].message}</span>
      )}
    </div>
  );
};
```

---

## VirtualNode 특성

### VirtualNode vs 일반 노드

| 특성 | VirtualNode | 일반 노드 |
|------|-------------|-----------|
| 값 저장 | 하위 필드에 분산 | 직접 저장 |
| value 형태 | 튜플 배열 | 단일 값 |
| 스키마 위치 | virtual 객체 | properties 객체 |
| 렌더링 | 커스텀 FormTypeInput | 기본 또는 커스텀 |

### VirtualNode 접근

```typescript
import { isVirtualNode } from '@canard/schema-form';

// FormHandle에서 접근
const virtualNode = formRef.current?.findNode('/period');

if (isVirtualNode(virtualNode)) {
  // VirtualNode 타입으로 사용
  console.log('Fields:', virtualNode.children.map(c => c.node.name));
  console.log('Value:', virtualNode.value);  // [startDate, endDate]
}
```

---

## 주의사항

### 1. 필드 순서

`fields` 배열의 순서가 value 튜플의 순서를 결정합니다.

```typescript
virtual: {
  period: {
    fields: ['startDate', 'endDate'],  // value[0]=startDate, value[1]=endDate
  },
}
```

### 2. 중첩 virtual 미지원

Virtual 필드 안에 다른 virtual 필드를 중첩할 수 없습니다.

```typescript
// ❌ 지원되지 않음
virtual: {
  outer: {
    fields: ['inner'],  // inner가 또 다른 virtual 필드라면 동작하지 않음
  },
}
```

### 3. 동일 필드 중복

한 필드가 여러 virtual 필드에 포함될 수 있지만, 값 동기화에 주의해야 합니다.

### 4. 기본값

Virtual 필드 자체에는 default를 설정할 수 없습니다. 개별 필드에 default를 설정하세요.

```typescript
properties: {
  startDate: {
    type: 'string',
    format: 'date',
    default: '2025-01-01',  // 여기에 설정
  },
},
virtual: {
  period: {
    fields: ['startDate', 'endDate'],
    // default: ... ← 여기는 불가
  },
}
```

---

## 참고

- 전체 스펙: `docs/ko/SPECIFICATION.md`
- 관련 스토리: `stories/08.VirtualSchema.stories.tsx`
