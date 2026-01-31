# @canard/schema-form Quick Reference

> 빠른 참조를 위한 치트시트

---

## 목차

1. [설치 및 설정](#설치-및-설정)
2. [경로 문법 (JSONPointer)](#경로-문법-jsonpointer)
3. [Computed Properties](#computed-properties)
4. [조건부 스키마](#조건부-스키마)
5. [FormHandle API](#formhandle-api)
6. [FormTypeInput](#formtypeinput)
7. [ValidationMode](#validationmode)
8. [노드 타입](#노드-타입)
9. [이벤트 타입](#이벤트-타입)

---

## 설치 및 설정

```bash
# 패키지 설치
yarn add @canard/schema-form

# Validator 플러그인 (필수)
yarn add @canard/schema-form-ajv8-plugin

# UI 플러그인 (선택)
yarn add @canard/schema-form-antd5-plugin
```

```tsx
// 앱 시작 시 플러그인 등록 (1회)
import { registerPlugin } from '@canard/schema-form';
import { ajvValidatorPlugin } from '@canard/schema-form-ajv8-plugin';

registerPlugin(ajvValidatorPlugin);
```

---

## 경로 문법 (JSONPointer)

### 기본 경로

| 문법 | 의미 | 예시 |
|------|------|------|
| `/field` | 절대 경로 (루트) | `/user/name` |
| `./field` | 현재 노드 자식 | `./nested/child` |
| `../field` | 형제 필드 | `../siblingField` |
| `../../field` | 부모의 형제 | `../../anotherField` |

### 특수 문법

| 문법 | 의미 | 사용 가능 컨텍스트 |
|------|------|-------------------|
| `*` | 와일드카드 | `formTypeInputMap`만 |
| `@.prop` | context 속성 참조 | `computed` 표현식만 |
| `.` | 현재 노드 | `&if` 조건문 |

### 이스케이프 규칙

| 문자 | 이스케이프 | 예시 |
|------|-----------|------|
| `/` | `~1` | `field/with/slash` → `field~1with~1slash` |
| `~` | `~0` | `field~name` → `field~0name` |

### 예시

```typescript
// formTypeInputMap에서 와일드카드 사용
formTypeInputMap: {
  '/users/*/name': UserNameInput,     // /users/0/name, /users/1/name 매칭
  '/config/*/value': ConfigValueInput, // /config/theme/value 매칭
}

// computed에서 context 참조
'&visible': "@.userRole === 'admin'"

// 조건부 스키마에서 현재 노드 참조
'&if': "./type === 'A'"
```

---

## Computed Properties

### 속성 종류

| 속성 | 타입 | 동작 | 값 제거 |
|------|------|------|---------|
| `active` | `boolean \| string` | 조건부 활성화 | ✅ Yes |
| `visible` | `boolean \| string` | 조건부 표시 | ❌ No |
| `readOnly` | `boolean \| string` | 읽기 전용 | - |
| `disabled` | `boolean \| string` | 비활성화 | - |
| `derived` | `string` | 파생 값 계산 | - |
| `watch` | `string \| string[]` | 값 구독 | - |
| `pristine` | `boolean \| string` | 상태 초기화 | - |

### active vs visible 선택

```
숨길 때 값도 제거? → YES → active
                 → NO  → visible
```

| 시나리오 | 선택 |
|----------|------|
| 할인 옵션 체크 해제 시 할인율 필드 제거 | `active` |
| 단계별 폼 (이전 단계 데이터 유지) | `visible` |
| 권한 없는 사용자에게 필드 숨김 | `active` |
| 접기/펼치기 UI | `visible` |

### 문법

```typescript
// 전체 문법
{
  type: 'string',
  computed: {
    active: '../toggle === true',
    visible: "@.userRole === 'admin'",
    derived: '(../price ?? 0) * (../quantity ?? 1)',
    watch: ['../category', '../price'],
  },
}

// 단축 문법 (별칭)
{
  type: 'string',
  '&active': '../toggle === true',
  '&visible': "@.userRole === 'admin'",
  '&derived': '../price * ../quantity',
  '&watch': '../category',
}
```

---

## 조건부 스키마

### 키워드 비교

| 키워드 | 동작 | 다중 활성화 | 값 처리 |
|--------|------|------------|---------|
| `oneOf` | 배타적 선택 | ❌ 하나만 | 비활성 브랜치 값 제거 |
| `anyOf` | 비배타적 선택 | ✅ 여러 개 | 비활성 브랜치 값 제거 |
| `allOf` | 스키마 병합 | ✅ 모두 | 항상 모든 값 포함 |
| `if-then-else` | 조건부 분기 | - | 조건에 따라 |

### oneOf 예시

```typescript
{
  type: 'object',
  properties: {
    type: { type: 'string', enum: ['A', 'B'] },
  },
  oneOf: [
    { '&if': "./type === 'A'", properties: { fieldA: { type: 'string' } } },
    { '&if': "./type === 'B'", properties: { fieldB: { type: 'number' } } },
  ],
}
```

### anyOf 예시

```typescript
{
  type: 'object',
  properties: {
    hasFeature1: { type: 'boolean' },
    hasFeature2: { type: 'boolean' },
  },
  anyOf: [
    { '&if': './hasFeature1', properties: { config1: { type: 'string' } } },
    { '&if': './hasFeature2', properties: { config2: { type: 'string' } } },
  ],
}
```

---

## FormHandle API

### 기본 사용

```tsx
const formRef = useRef<FormHandle<typeof schema>>(null);
<Form ref={formRef} jsonSchema={schema} />
```

### 메서드 요약

| 메서드 | 반환 타입 | 설명 |
|--------|----------|------|
| `getValue()` | `Value` | 현재 폼 값 |
| `setValue(v)` | `void` | 폼 값 설정 |
| `reset()` | `void` | 초기값으로 리셋 |
| `validate()` | `Promise<Error[]>` | 검증 실행 |
| `getErrors()` | `Error[]` | 현재 에러 목록 |
| `showError(bool)` | `void` | 에러 표시 제어 |
| `findNode(path)` | `SchemaNode \| null` | 노드 탐색 |
| `findNodes(path)` | `SchemaNode[]` | 와일드카드 탐색 |
| `focus(path)` | `void` | 필드 포커스 |
| `getState()` | `NodeStateFlags` | 폼 상태 |
| `setState(s)` | `void` | 상태 설정 |
| `clearState()` | `void` | 상태 초기화 |
| `submit()` | `void` | 폼 제출 |
| `getAttachedFilesMap()` | `Map` | 첨부 파일 |

### 일반적인 패턴

```typescript
// 값 가져오기
const value = formRef.current?.getValue();

// 값 설정
formRef.current?.setValue({ name: 'Alice' });

// 함수형 업데이트
formRef.current?.setValue(prev => ({ ...prev, name: 'Bob' }));

// 검증 후 제출
const errors = await formRef.current?.validate();
if (errors?.length === 0) {
  // 제출 로직
}

// 특정 필드 접근
const nameNode = formRef.current?.findNode('/name');
nameNode?.setValue('Charlie');
```

---

## FormTypeInput

### 우선순위 (높은 순)

1. JSON Schema의 `FormTypeInput` 속성
2. `formTypeInputMap` (경로 기반)
3. Form의 `formTypeInputDefinitions`
4. FormProvider의 `formTypeInputDefinitions`
5. 플러그인의 `formTypeInputDefinitions`

### 정의 방법

```typescript
// 1. 스키마에 직접 지정
{ type: 'string', FormTypeInput: CustomInput }

// 2. 경로 기반 매핑
<Form formTypeInputMap={{ '/email': EmailInput }} />

// 3. 정의 배열
const definitions: FormTypeInputDefinition[] = [
  { test: { type: 'string', format: 'email' }, Component: EmailInput },
  { test: (hint) => hint.type === 'number', Component: NumberInput },
];
```

### FormTypeInputProps 주요 속성

| 속성 | 타입 | 설명 |
|------|------|------|
| `value` | `Value` | 현재 값 |
| `defaultValue` | `Value` | 기본값 |
| `onChange` | `(v) => void` | 값 변경 핸들러 |
| `node` | `SchemaNode` | 스키마 노드 |
| `errors` | `Error[]` | 검증 에러 |
| `errorVisible` | `boolean` | 에러 표시 여부 |
| `readOnly` | `boolean` | 읽기 전용 |
| `disabled` | `boolean` | 비활성화 |
| `required` | `boolean` | 필수 여부 |
| `nullable` | `boolean` | null 허용 |
| `watchValues` | `any[]` | 구독 값 |
| `context` | `object` | 사용자 컨텍스트 |
| `ChildNodeComponents` | `FC[]` | 자식 컴포넌트 |

---

## ValidationMode

### 모드 종류

| 모드 | 값 | 동작 |
|------|---|------|
| `None` | `0` | 검증 비활성화 |
| `OnChange` | `1` | 값 변경 시 검증 |
| `OnRequest` | `2` | `validate()` 호출 시만 |

### 사용 예시

```typescript
import { ValidationMode } from '@canard/schema-form';

// 값 변경 시 즉시 검증
<Form validationMode={ValidationMode.OnChange} />

// 명시적 호출 시만 검증
<Form validationMode={ValidationMode.OnRequest} />

// 둘 다 활성화
<Form validationMode={ValidationMode.OnChange | ValidationMode.OnRequest} />
```

---

## 노드 타입

### Terminal Nodes (원시값)

| 노드 | 설명 |
|------|------|
| `StringNode` | 문자열, format 검증 |
| `NumberNode` | 숫자, min/max 제약 |
| `BooleanNode` | 불리언 |
| `NullNode` | 명시적 null |

### Branch Nodes (컨테이너)

| 노드 | 설명 |
|------|------|
| `ObjectNode` | 객체, properties 관리 |
| `ArrayNode` | 배열, push/remove/clear |

### Special Nodes

| 노드 | 설명 |
|------|------|
| `VirtualNode` | 가상 필드, 그룹화 |

### 타입 가드

```typescript
import { isArrayNode, isObjectNode, isVirtualNode } from '@canard/schema-form';

if (isArrayNode(node)) {
  node.push();  // ArrayNode 메서드 사용 가능
}
```

---

## 이벤트 타입

| 이벤트 | 설명 |
|--------|------|
| `Initialized` | 노드 초기화 완료 |
| `UpdateValue` | 값 변경 |
| `UpdateState` | 상태 변경 (dirty, touched) |
| `UpdateError` | 검증 에러 변경 |
| `UpdateComputedProperties` | computed 재계산 |
| `UpdateChildren` | 자식 노드 변경 |
| `UpdatePath` | 경로 변경 (배열 재정렬) |
| `RequestRefresh` | UI 동기화 요청 |
| `RequestRemount` | 컴포넌트 리마운트 요청 |

### 구독 패턴

```typescript
const unsubscribe = node.subscribe((event) => {
  console.log('Event:', event);
});

// 클린업
unsubscribe();
```

---

## 에러 메시지 커스터마이징

```typescript
{
  type: 'string',
  minLength: 3,
  errorMessages: {
    minLength: '최소 {limit}자 이상이어야 합니다. 현재: {value}',
    required: '필수 입력 항목입니다',
  },
}

// 다국어 지원
{
  errorMessages: {
    minLength: {
      ko_KR: '최소 {limit}자 이상',
      en_US: 'At least {limit} characters',
    },
  },
}

// locale 설정
<Form context={{ locale: 'ko_KR' }} />
```

---

## 배열 조작

```typescript
const arrayNode = formRef.current?.findNode('/items') as ArrayNode;

arrayNode.push();           // 기본값으로 아이템 추가
arrayNode.push('custom');   // 특정 값으로 추가
arrayNode.remove(0);        // 인덱스 0 삭제
arrayNode.clear();          // 전체 삭제 (minItems 유지)
arrayNode.length;           // 현재 아이템 수
arrayNode.children;         // 자식 노드 배열
```

---

## Form.Render / Form.Input

```tsx
<Form jsonSchema={schema}>
  {/* 특정 필드만 렌더링 */}
  <Form.Input path="/name" />
  <Form.Input path="/email" />

  {/* 커스텀 렌더링 */}
  <Form.Render path="/password">
    {({ Input, value, errorMessage }) => (
      <div>
        <Input />
        {errorMessage && <span className="error">{errorMessage}</span>}
      </div>
    )}
  </Form.Render>
</Form>
```

---

## 사용 가능한 플러그인

### Validator

| 패키지 | 설명 |
|--------|------|
| `@canard/schema-form-ajv8-plugin` | AJV 8.x (권장) |
| `@canard/schema-form-ajv7-plugin` | AJV 7.x |
| `@canard/schema-form-ajv6-plugin` | AJV 6.x |

### UI

| 패키지 | 설명 |
|--------|------|
| `@canard/schema-form-antd5-plugin` | Ant Design 5 |
| `@canard/schema-form-antd6-plugin` | Ant Design 6 |
| `@canard/schema-form-antd-mobile-plugin` | Ant Design Mobile |
| `@canard/schema-form-mui-plugin` | Material UI |

---

## 참고 문서

- [한국어 스펙](./ko/SPECIFICATION.md)
- [영어 스펙](./en/SPECIFICATION.md)
- [Claude 스킬](./claude/skills/)
