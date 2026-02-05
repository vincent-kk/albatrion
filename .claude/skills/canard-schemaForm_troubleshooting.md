---
name: schema-form-troubleshooting
description: "@canard/schema-form 트러블슈팅 전문가. 일반적인 에러, 설정 문제, 디버깅 방법을 안내합니다."
user-invocable: false
---

# Troubleshooting Skill

@canard/schema-form 사용 시 발생할 수 있는 일반적인 문제와 해결방법입니다.

## 스킬 정보 (Skill Info)

- **이름**: troubleshooting
- **용도**: 에러 해결, 디버깅, 문제 진단 가이드
- **트리거**: 에러, 문제, 동작 안함, 버그, 디버깅 관련 질문

---

## 설치 및 설정 문제

### 문제: "Validator plugin not registered"

**증상**: 폼 렌더링 시 에러 발생

**원인**: AJV 검증 플러그인이 등록되지 않음

**해결**:
```tsx
import { registerPlugin } from '@canard/schema-form';
import { ajvValidatorPlugin } from '@canard/schema-form-ajv8-plugin';

// 앱 시작 시 (index.tsx 또는 App.tsx 상단에서) 한 번만 호출
registerPlugin(ajvValidatorPlugin);
```

**주의사항**:
- `registerPlugin`은 앱 전체에서 한 번만 호출
- 컴포넌트 내부에서 호출하면 안 됨
- 플러그인 패키지가 설치되었는지 확인: `yarn add @canard/schema-form-ajv8-plugin`

---

### 문제: 플러그인 순서 문제

**증상**: UI가 예상과 다르게 렌더링됨

**원인**: 여러 플러그인 등록 시 순서가 중요함

**해결**:
```tsx
// 올바른 순서: UI 플러그인 → Validator 플러그인
import { registerPlugin } from '@canard/schema-form';
import { antd5Plugin } from '@canard/schema-form-antd5-plugin';
import { ajvValidatorPlugin } from '@canard/schema-form-ajv8-plugin';

registerPlugin(antd5Plugin);       // 1. UI 플러그인 먼저
registerPlugin(ajvValidatorPlugin); // 2. Validator 플러그인 나중에
```

---

## FormTypeInput 관련 문제

### 문제: 커스텀 FormTypeInput이 렌더링되지 않음

**증상**: 정의한 커스텀 컴포넌트 대신 기본 컴포넌트가 표시됨

**원인**: test 조건이 매칭되지 않음

**진단**:
```tsx
const formTypeInputDefinitions = [
  {
    test: (hint) => {
      console.log('Hint:', hint); // 디버깅: hint 객체 확인
      return hint.type === 'string' && hint.format === 'email';
    },
    Component: EmailInput,
  },
];
```

**해결**:
1. hint 객체의 실제 값 확인
2. test 조건 수정

**일반적인 실수**:
```tsx
// ❌ 잘못된 예: format이 없는 경우 undefined
test: { type: 'string', format: 'email' }

// ✅ 올바른 예: 명시적으로 format 확인
test: (hint) => hint.type === 'string' && hint.format === 'email'
```

---

### 문제: formTypeInputMap의 와일드카드가 동작하지 않음

**증상**: `/items/*/name` 경로가 매칭되지 않음

**원인**: 와일드카드 문법 오류

**해결**:
```tsx
// ✅ 올바른 사용
formTypeInputMap: {
  '/items/*/name': ItemNameInput,     // 배열 아이템
  '/config/*/value': ConfigValueInput, // 동적 객체 키
}

// ❌ 잘못된 사용 - 와일드카드는 단일 세그먼트만 매칭
formTypeInputMap: {
  '/items/**/name': ItemNameInput,  // ** 지원 안함
}
```

---

### 문제: FormTypeInputProps의 value가 undefined

**증상**: value 속성이 항상 undefined

**원인**: 초기값이 설정되지 않음

**해결**:
```tsx
// 스키마에 default 설정
{
  type: 'string',
  default: '',  // 또는 적절한 기본값
}

// 또는 Form에 defaultValue 전달
<Form
  jsonSchema={schema}
  defaultValue={{ name: '', email: '' }}
/>
```

---

## Computed Properties 관련 문제

### 문제: computed 표현식이 동작하지 않음

**증상**: `&active`, `&visible` 등이 반응하지 않음

**원인 1**: 경로 문법 오류

```tsx
// ❌ 잘못된 예: 형제 필드 참조 시 .. 누락
computed: { active: '/toggle === true' }

// ✅ 올바른 예
computed: { active: '../toggle === true' }
```

**원인 2**: watch 배열 누락 (복잡한 의존성의 경우)

```tsx
// 복잡한 의존성은 watch 명시
computed: {
  active: '../items.length > 0',
  watch: '../items',  // length 변화 감지를 위해 명시
}
```

---

### 문제: 순환 참조 경고

**증상**: 콘솔에 순환 참조 경고 또는 무한 루프

**원인**: computed 또는 injectTo에서 순환 의존성 발생

**진단**:
```
A의 active가 B를 참조
   ↓
B의 derived가 A를 참조
   ↓
순환 참조!
```

**해결**:
1. 의존성 그래프 그려보기
2. 단방향 의존성으로 재설계

```tsx
// ❌ 순환 참조
{
  fieldA: { computed: { derived: '../fieldB' } },
  fieldB: { computed: { derived: '../fieldA' } },
}

// ✅ 단방향 의존성
{
  fieldA: { type: 'number' },
  fieldB: { computed: { derived: '../fieldA * 2' } },
}
```

---

### 문제: derived 값이 업데이트되지 않음

**증상**: 의존 필드 변경 시 파생 값이 그대로

**원인**: 표현식에 참조된 필드가 존재하지 않거나 경로가 잘못됨

**해결**:
```tsx
// 디버깅: 경로 확인
const schema = {
  properties: {
    price: { type: 'number' },
    quantity: { type: 'number' },
    total: {
      type: 'number',
      // 경로가 정확한지 확인
      '&derived': '../price * ../quantity',
    },
  },
};

// null 병합 연산자로 안전하게 처리
'&derived': '(../price ?? 0) * (../quantity ?? 1)'
```

---

## 조건부 스키마 관련 문제

### 문제: oneOf 필드가 전환되지 않음

**증상**: 조건 변경 시 필드가 나타나지 않거나 사라지지 않음

**원인**: `&if` 조건문 오류

**해결**:
```tsx
// ✅ 올바른 문법
oneOf: [
  {
    '&if': "./type === 'A'",  // 따옴표 주의
    properties: { fieldA: { type: 'string' } },
  },
]

// ❌ 잘못된 문법
oneOf: [
  {
    '&if': './type === A',  // 문자열 값은 따옴표 필요
    properties: { fieldA: { type: 'string' } },
  },
]
```

---

### 문제: setValue 후 조건부 필드가 사라짐

**증상**: 부모에서 setValue 호출 시 조건에 맞지 않는 필드가 제거됨

**원인**: 이것은 정상 동작임 (조건부 필터링)

**이해**:
```tsx
// 부모 setValue: 조건부 필터링 적용
objectNode.setValue({ category: 'movie', price: 200 });
// price는 movie 조건에 맞지 않으면 제거됨

// 자식 setValue: 필터링 우회
const priceNode = objectNode.find('./price');
priceNode.setValue(999);  // 조건과 관계없이 값 설정됨
```

**필터링을 원하지 않는 경우**:
- 자식 노드에서 직접 setValue 호출
- 또는 스키마 구조 재설계

---

## 검증 관련 문제

### 문제: 검증이 실행되지 않음

**증상**: validate() 호출해도 에러가 반환되지 않음

**원인**: ValidationMode 설정 문제

**해결**:
```tsx
import { ValidationMode } from '@canard/schema-form';

<Form
  jsonSchema={schema}
  // OnRequest 모드에서 validate() 호출 가능
  validationMode={ValidationMode.OnRequest}
  // 또는 둘 다 활성화
  validationMode={ValidationMode.OnChange | ValidationMode.OnRequest}
/>
```

---

### 문제: 에러 메시지가 표시되지 않음

**증상**: 검증 에러가 있지만 UI에 표시되지 않음

**원인 1**: showError 설정

```tsx
// showError 강제 활성화
formRef.current?.showError(true);

// 또는 Form prop으로 설정
<Form showError={true} />
```

**원인 2**: errorVisible 조건

```tsx
// FormTypeInput에서 errorVisible 확인
const MyInput = ({ errors, errorVisible }) => (
  <div>
    <input />
    {errorVisible && errors.length > 0 && (
      <span>{errors[0].message}</span>
    )}
  </div>
);
```

---

### 문제: 커스텀 에러 메시지가 적용되지 않음

**증상**: errorMessages가 무시됨

**원인**: 키워드 이름 불일치

**해결**:
```tsx
{
  type: 'string',
  minLength: 3,
  errorMessages: {
    // 키워드 이름이 정확히 일치해야 함
    minLength: '최소 {limit}자 이상 입력하세요',  // ✅
    minlength: '...',  // ❌ 대소문자 다름
  },
}
```

**일반적인 키워드**:
- `required`, `type`, `minLength`, `maxLength`
- `minimum`, `maximum`, `pattern`, `format`
- `enum`, `const`, `minItems`, `maxItems`

---

## 배열 관련 문제

### 문제: push()가 동작하지 않음

**증상**: 배열에 아이템이 추가되지 않음

**원인**: maxItems 제한

**확인**:
```tsx
const arrayNode = formRef.current?.findNode('/items') as ArrayNode;

console.log('Current length:', arrayNode.length);
console.log('Schema:', arrayNode.jsonSchema);
// maxItems 확인
```

**해결**:
```tsx
// maxItems가 설정된 경우 초과 시 push() 무시됨
{
  type: 'array',
  items: { type: 'string' },
  maxItems: 5,  // 5개 초과 시 push() 동작 안 함
}
```

---

### 문제: clear() 후에도 아이템이 남아있음

**증상**: 배열을 비워도 일부 아이템 존재

**원인**: minItems 제약

```tsx
{
  type: 'array',
  items: { type: 'string' },
  minItems: 2,  // 최소 2개 유지
}

// clear() 호출 후에도 2개 아이템 존재
arrayNode.clear();
console.log(arrayNode.length); // 2
```

---

## 성능 관련 문제

### 문제: 대량 데이터에서 느림

**증상**: 100개 이상 아이템에서 렌더링 지연

**해결 1**: Terminal Strategy 사용

```tsx
{
  type: 'array',
  terminal: true,  // 단순 타입 배열에 권장
  items: { type: 'string' },
}
```

**해결 2**: ValidationMode 최적화

```tsx
// 입력 시마다 검증하지 않음
<Form validationMode={ValidationMode.OnRequest} />
```

**해결 3**: 배치 작업

```tsx
// ❌ 느림: 개별 push
for (let i = 0; i < 100; i++) {
  await arrayNode.push(i);
}

// ✅ 빠름: 값 직접 설정
const newItems = Array.from({ length: 100 }, (_, i) => i);
formRef.current?.setValue(prev => ({
  ...prev,
  items: [...(prev.items || []), ...newItems],
}));
```

---

### 문제: 메모리 누수

**증상**: 장시간 사용 시 메모리 증가

**원인**: 구독 해제 누락

**해결**:
```tsx
useEffect(() => {
  const unsubscribe = node.subscribe((event) => {
    // ...
  });

  // 반드시 클린업
  return () => unsubscribe();
}, [node]);
```

---

## 타입 관련 문제

### 문제: TypeScript 타입 추론 실패

**증상**: getValue() 반환 타입이 any

**해결**: `as const` 사용

```tsx
// ❌ 타입 추론 실패
const schema = {
  type: 'object',
  properties: {
    name: { type: 'string' },
  },
};

// ✅ 타입 추론 성공
const schema = {
  type: 'object',
  properties: {
    name: { type: 'string' },
  },
} as const;

// FormHandle 타입 지정
const formRef = useRef<FormHandle<typeof schema>>(null);
```

---

## 디버깅 팁

### 노드 상태 확인

```tsx
const node = formRef.current?.findNode('/fieldPath');
if (node) {
  console.log({
    value: node.value,
    errors: node.errors,
    dirty: node.dirty,
    touched: node.touched,
    visible: node.visible,
    active: node.active,
    initialized: node.initialized,
  });
}
```

### 이벤트 모니터링

```tsx
const rootNode = formRef.current?.node;
rootNode?.subscribe((event) => {
  console.log('Event:', {
    type: event.type,
    path: event.target?.path,
  });
});
```

### 스키마 검증

```tsx
// 스키마가 유효한지 확인
import Ajv from 'ajv';
const ajv = new Ajv();
const validate = ajv.compile(schema);
console.log('Schema valid:', validate.errors);
```

---

## 참고

- 전체 스펙: `docs/ko/SPECIFICATION.md`
- Quick Reference: `docs/QUICK_REFERENCE.md`
- Event System: `docs/claude/skills/event-system.md`
