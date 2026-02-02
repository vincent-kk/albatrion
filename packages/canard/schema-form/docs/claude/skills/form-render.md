---
name: schema-form-form-render
description: "@canard/schema-form의 커스텀 레이아웃 기능 전문가. Form.Render, Form.Input, Form.Label을 사용한 경로 기반 렌더링을 안내합니다."
user-invocable: false
---

# Form.Render Skill

@canard/schema-form의 커스텀 레이아웃 기능에 대한 전문 스킬입니다.

## 스킬 정보 (Skill Info)

- **이름**: form-render
- **용도**: Form.Render, Form.Input, Form.Label을 사용한 커스텀 레이아웃 가이드
- **트리거**: Form.Render, Form.Input, Form.Label, 커스텀 레이아웃, 경로 기반 렌더링 관련 질문

---

## 개요 (Overview)

Form 컴포넌트는 `Form.Render`, `Form.Input`, `Form.Label` 서브컴포넌트를 통해 커스텀 레이아웃을 지원합니다. JSONPointer 경로를 사용하여 특정 필드를 원하는 위치에 렌더링할 수 있습니다.

---

## 기본 사용법

### Form.Input

특정 경로의 입력 컴포넌트만 렌더링합니다.

```typescript
import { Form } from '@canard/schema-form';

const schema = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    email: { type: 'string', format: 'email' },
    age: { type: 'number' },
  },
};

<Form jsonSchema={schema}>
  <div className="row">
    <Form.Input path="/name" />
    <Form.Input path="/email" />
  </div>
  <div className="row">
    <Form.Input path="/age" />
  </div>
</Form>
```

### Form.Label

특정 경로의 라벨만 렌더링합니다.

```typescript
<Form jsonSchema={schema}>
  <div className="field">
    <Form.Label path="/name" />
    <Form.Input path="/name" />
  </div>
  <div className="field">
    <Form.Label path="/email" />
    <Form.Input path="/email" />
  </div>
</Form>
```

### Form.Render

특정 경로의 필드를 커스텀 렌더링합니다. render props 패턴을 사용합니다.

```typescript
// stories/12.RenderTest.stories.tsx 기반
<Form jsonSchema={schema}>
  <Form.Render path="/password">
    {({ path, Input, value, errorMessage }: FormTypeRendererProps) => (
      <div
        style={{
          border: `1px solid ${value ? 'red' : 'blue'}`,
        }}
      >
        {path}
        <Input /> {value as string}
        <div>{errorMessage}</div>
      </div>
    )}
  </Form.Render>
</Form>
```

---

## Form.Input Props

```typescript
interface FormInputProps {
  // 필수: JSONPointer 경로
  path: string;

  // 선택: 커스텀 FormTypeInput
  FormTypeInput?: ComponentType<FormTypeInputProps>;

  // 선택: 스타일 관련
  style?: CSSProperties;
  className?: string;

  // 선택: 상태 오버라이드
  readOnly?: boolean;
  disabled?: boolean;

  // 선택: 추가 context
  context?: Dictionary;

  // 기타 props는 FormTypeInput에 전달
  [key: string]: any;
}
```

### 사용 예제

```typescript
// 기본 사용
<Form.Input path="/name" />

// 스타일 적용
<Form.Input path="/name" style={{ color: 'red' }} />

// 추가 context 전달
<Form.Input path="/allowed" context={{ a: 1 }} />

// 상태 오버라이드
<Form.Input
  path="/phone"
  readOnly={!!value?.age}
  disabled={value?.phone === '12345'}
/>

// 인라인 커스텀 FormTypeInput
<Form.Input
  path="/age"
  FormTypeInput={({ path, onChange, value }) => (
    <button onClick={() => onChange((prev: number) => (prev || 0) + 1)}>
      custom input {JSON.stringify(value)}
    </button>
  )}
/>
```

---

## Form.Render Props

```typescript
interface FormRenderProps {
  // 필수: JSONPointer 경로
  path: string;

  // 필수: render function
  children: (props: FormTypeRendererProps) => ReactNode;
}
```

### FormTypeRendererProps (render function 인자)

```typescript
interface FormTypeRendererProps {
  // 노드 정보
  node: SchemaNode;
  name: string;
  path: string;
  depth: number;

  // 스키마
  jsonSchema: JsonSchema;

  // 값
  value: any;
  defaultValue: any;

  // 상태
  readOnly: boolean;
  disabled: boolean;
  required: boolean;

  // 에러
  errors: JsonSchemaError[];
  errorMessage: string;
  errorVisible: boolean;

  // 컴포넌트
  Input: ComponentType;
  FormTypeInput: ComponentType<FormTypeInputProps>;
  ChildNodeComponents: ChildNodeComponent[];

  // 유틸리티
  formatError?: FormatErrorFunction;
}
```

### 사용 예제

```typescript
<Form.Render path="/name">
  {({ Input, node }) => (
    <div>
      {node.name}
      <Input />
    </div>
  )}
</Form.Render>

// 에러 메시지 커스텀 표시
<Form.Render path="/email">
  {({ Input, errors, errorVisible }) => (
    <div>
      <Input />
      {errorVisible && errors.length > 0 && (
        <span className="error">{errors[0].message}</span>
      )}
    </div>
  )}
</Form.Render>

// 조건부 스타일링
<Form.Render path="/password">
  {({ Input, value, errorMessage }) => (
    <div style={{ border: `1px solid ${value ? 'green' : 'gray'}` }}>
      <Input />
      {errorMessage && <div className="error">{errorMessage}</div>}
    </div>
  )}
</Form.Render>
```

---

## 상대 경로 지원

Form.Input과 Form.Render는 상대 경로를 지원합니다.

```typescript
<Form jsonSchema={schema}>
  {/* 상대 경로 (현재 루트 기준) */}
  <Form.Input path="./name" />

  {/* 절대 경로 */}
  <Form.Input path="/user/email" />
</Form>
```

---

## 중첩 레이아웃

복잡한 중첩 구조에서의 레이아웃 커스터마이징:

```typescript
const schema = {
  type: 'object',
  properties: {
    user: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        contacts: {
          type: 'object',
          properties: {
            email: { type: 'string' },
            phone: { type: 'string' },
          },
        },
      },
    },
  },
};

<Form jsonSchema={schema}>
  <div className="card">
    <h3>User Info</h3>
    <Form.Input path="/user/name" />
  </div>
  <div className="card">
    <h3>Contact Info</h3>
    <div className="row">
      <Form.Input path="/user/contacts/email" />
      <Form.Input path="/user/contacts/phone" />
    </div>
  </div>
</Form>
```

---

## children 함수 사용

Form 컴포넌트는 children을 함수로 받을 수 있습니다.

```typescript
<Form jsonSchema={schema} onChange={setValue}>
  {({ value, errors, node }) => (
    <div>
      <Form.Input path="/name" />
      <Form.Input path="/email" />

      <pre>Current value: {JSON.stringify(value)}</pre>
      <pre>Errors: {JSON.stringify(errors)}</pre>
    </div>
  )}
</Form>
```

---

## 배열 아이템 렌더링

배열 내 아이템의 커스텀 렌더링:

```typescript
const schema = {
  type: 'object',
  properties: {
    items: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          quantity: { type: 'number' },
        },
      },
    },
  },
};

// 첫 번째 아이템 직접 접근
<Form.Input path="/items/0/name" />
<Form.Input path="/items/0/quantity" />

// Form.Render로 배열 아이템 커스텀 렌더링
<Form.Render path="/items/0">
  {({ Input, ChildNodeComponents }) => (
    <div className="item-row">
      {ChildNodeComponents.map((Child, i) => (
        <Child key={i} />
      ))}
    </div>
  )}
</Form.Render>
```

---

## CustomFormTypeRenderer와의 차이

| 특성 | Form.Render | CustomFormTypeRenderer |
|------|-------------|------------------------|
| 적용 범위 | 특정 경로 | 전체 폼 |
| 사용 방식 | 컴포넌트 | prop |
| 유연성 | 경로별 커스텀 | 통일된 렌더링 |
| 용도 | 부분 커스터마이징 | 전체 스타일링 |

```typescript
// Form.Render: 특정 경로만 커스텀
<Form jsonSchema={schema}>
  <Form.Render path="/special">
    {({ Input }) => <SpecialWrapper><Input /></SpecialWrapper>}
  </Form.Render>
  <Form.Input path="/normal" /> {/* 기본 렌더링 */}
</Form>

// CustomFormTypeRenderer: 전체 폼에 적용
<Form
  jsonSchema={schema}
  CustomFormTypeRenderer={({ Input, name }) => (
    <div className="custom-field">
      <label>{name}</label>
      <Input />
    </div>
  )}
/>
```

---

## 주의사항

### 1. 경로 정확성

```typescript
// ✅ 올바른 경로
<Form.Input path="/user/name" />

// ❌ 존재하지 않는 경로 (에러 또는 무시)
<Form.Input path="/nonexistent" />
```

### 2. 중복 렌더링

```typescript
// ⚠️ 같은 경로를 여러 번 렌더링하면 UI가 중복됨
<Form.Input path="/name" />
<Form.Input path="/name" /> {/* 두 번 렌더링됨 */}
```

### 3. 자동 렌더링과 혼합

Form.Input/Form.Render 사용 시 해당 필드는 자동 렌더링에서 제외되지 않습니다. 완전한 커스텀 레이아웃을 원하면 모든 필드를 명시적으로 렌더링해야 합니다.

---

## 참고

- 전체 스펙: `docs/ko/SPECIFICATION.md`
- 관련 스토리: `stories/12.RenderTest.stories.tsx`
