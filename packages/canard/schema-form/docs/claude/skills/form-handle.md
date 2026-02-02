---
name: schema-form-form-handle
description: "@canard/schema-form의 FormHandle API 전문가. useRef를 통한 프로그래매틱 폼 제어 (getValue, setValue, validate, reset, submit)를 안내합니다."
user-invocable: false
---

# Form Handle Skill

@canard/schema-form의 FormHandle API에 대한 전문 스킬입니다.

## 스킬 정보 (Skill Info)

- **이름**: form-handle
- **용도**: FormHandle을 통한 프로그래매틱 폼 제어 가이드
- **트리거**: FormHandle, useRef, formRef, getValue, setValue, validate, reset, submit 관련 질문

---

## 개요 (Overview)

FormHandle은 Form 컴포넌트의 ref를 통해 폼을 프로그래매틱하게 제어할 수 있는 API를 제공합니다.

---

## FormHandle 인터페이스

```typescript
interface FormHandle<
  Schema extends JsonSchema,
  Value extends AllowedValue = InferValueType<Schema>,
> {
  // 노드 접근
  node?: InferSchemaNode<Schema>;

  // 노드 탐색
  findNode: Fn<[path: SchemaNode['path']], SchemaNode | null>;
  findNodes: Fn<[path: SchemaNode['path']], SchemaNode[]>;

  // 포커스/선택
  focus: Fn<[dataPath: SchemaNode['path']]>;
  select: Fn<[dataPath: SchemaNode['path']]>;

  // 값 관리
  getValue: Fn<[], Value>;
  setValue: SetStateFnWithOptions<Value>;
  reset: Fn;

  // 상태 관리
  getState: Fn<[], NodeStateFlags>;
  setState: Fn<[state: NodeStateFlags]>;
  clearState: Fn;

  // 검증
  getErrors: Fn<[], JsonSchemaError[]>;
  validate: Fn<[], Promise<JsonSchemaError[]>>;
  showError: Fn<[visible: boolean]>;

  // 파일 첨부
  getAttachedFilesMap: Fn<[], AttachedFilesMap>;

  // 제출
  submit: TrackableHandlerFunction<[], void, { loading: boolean }>;
}
```

---

## 기본 사용법

```typescript
import { useRef } from 'react';
import { Form, type FormHandle } from '@canard/schema-form';

const MyForm = () => {
  const formRef = useRef<FormHandle<typeof schema>>(null);

  const schema = {
    type: 'object',
    properties: {
      name: { type: 'string' },
      email: { type: 'string', format: 'email' },
    },
  } as const;

  return (
    <Form
      ref={formRef}
      jsonSchema={schema}
    />
  );
};
```

---

## 값 관리

### getValue()

현재 폼 값을 가져옵니다.

```typescript
const handleGetValue = () => {
  const value = formRef.current?.getValue();
  console.log('Current value:', value);
  // { name: '홍길동', email: 'hong@example.com' }
};
```

### setValue()

폼 값을 설정합니다.

```typescript
// 전체 값 설정
formRef.current?.setValue({
  name: '홍길동',
  email: 'hong@example.com',
});

// 함수형 업데이트
formRef.current?.setValue((prev) => ({
  ...prev,
  name: '새 이름',
}));

// 옵션과 함께 설정
import { SetValueOption } from '@canard/schema-form';

formRef.current?.setValue(
  { name: '홍길동' },
  SetValueOption.Merge  // 기존 값과 병합
);
```

### reset()

폼을 초기 상태로 리셋합니다.

```typescript
const handleReset = () => {
  formRef.current?.reset();
  // defaultValue로 복원
  // 상태(dirty, touched) 초기화
};
```

---

## 노드 탐색

### findNode()

특정 경로의 노드를 찾습니다.

```typescript
// 절대 경로로 찾기
const nameNode = formRef.current?.findNode('/name');
const emailNode = formRef.current?.findNode('/user/email');

// 노드 속성 접근
if (nameNode) {
  console.log('Value:', nameNode.value);
  console.log('Errors:', nameNode.errors);
  console.log('Is dirty:', nameNode.dirty);
}
```

### findNodes()

와일드카드 경로로 여러 노드를 찾습니다.

```typescript
// 배열 아이템 전체 찾기
const itemNodes = formRef.current?.findNodes('/items/*');

itemNodes?.forEach((node, index) => {
  console.log(`Item ${index}:`, node.value);
});
```

---

## 포커스 제어

### focus()

특정 필드에 포커스를 설정합니다.

```typescript
const handleFocus = () => {
  formRef.current?.focus('/email');
};
```

### select()

특정 필드를 선택합니다.

```typescript
const handleSelect = () => {
  formRef.current?.select('/name');
};
```

---

## 상태 관리

### getState()

전체 폼 상태를 가져옵니다.

```typescript
const state = formRef.current?.getState();
// { [NodeState.Dirty]: true, [NodeState.Touched]: true, ... }
```

### setState()

폼 상태를 설정합니다.

```typescript
import { NodeState } from '@canard/schema-form';

formRef.current?.setState({
  [NodeState.Touched]: true,
});
```

### clearState()

폼 상태를 초기화합니다.

```typescript
formRef.current?.clearState();
// 모든 dirty, touched, showError 등 초기화
```

---

## 검증

### validate()

폼을 검증하고 에러 배열을 반환합니다.

```typescript
const handleValidate = async () => {
  const errors = await formRef.current?.validate();

  if (errors && errors.length === 0) {
    console.log('검증 통과!');
  } else {
    console.log('검증 실패:', errors);
  }
};
```

### getErrors()

현재 에러 목록을 가져옵니다 (검증 없이).

```typescript
const errors = formRef.current?.getErrors();
console.log('Current errors:', errors);
```

### showError()

에러 표시 여부를 제어합니다.

```typescript
// 에러 표시
formRef.current?.showError(true);

// 에러 숨김
formRef.current?.showError(false);
```

---

## 제출

### submit()

폼 제출을 트리거합니다. onSubmit 콜백이 호출됩니다.

```typescript
const formRef = useRef<FormHandle<typeof schema>>(null);

// submit.loading으로 로딩 상태 추적 가능
const handleSubmit = () => {
  formRef.current?.submit();
};

// 로딩 상태 확인
const isLoading = formRef.current?.submit.loading;

<Form
  ref={formRef}
  jsonSchema={schema}
  onSubmit={async (value) => {
    await api.save(value);
  }}
/>
```

---

## 파일 첨부

### getAttachedFilesMap()

첨부된 파일 맵을 가져옵니다.

```typescript
const filesMap = formRef.current?.getAttachedFilesMap();
// { '/document': File, '/images': [File, File] }
```

---

## 실제 사용 예제

### 폼 제출 플로우

```typescript
const FormWithSubmit = () => {
  const formRef = useRef<FormHandle<typeof schema>>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    // 1. 검증
    const errors = await formRef.current?.validate();
    if (errors && errors.length > 0) {
      formRef.current?.showError(true);
      return;
    }

    // 2. 값 가져오기
    const value = formRef.current?.getValue();

    // 3. 제출
    setIsSubmitting(true);
    try {
      await api.submit(value);
      formRef.current?.reset();  // 성공 시 리셋
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Form ref={formRef} jsonSchema={schema} />
      <button onClick={handleSubmit} disabled={isSubmitting}>
        {isSubmitting ? '제출 중...' : '제출'}
      </button>
    </>
  );
};
```

### 외부 데이터 로딩

```typescript
const FormWithData = () => {
  const formRef = useRef<FormHandle<typeof schema>>(null);

  useEffect(() => {
    const loadData = async () => {
      const data = await api.fetchData();
      formRef.current?.setValue(data);
    };
    loadData();
  }, []);

  return <Form ref={formRef} jsonSchema={schema} />;
};
```

### 조건부 필드 제어

```typescript
const ConditionalForm = () => {
  const formRef = useRef<FormHandle<typeof schema>>(null);

  const handleToggleAdvanced = () => {
    const current = formRef.current?.getValue();
    formRef.current?.setValue({
      ...current,
      showAdvanced: !current?.showAdvanced,
    });
  };

  return (
    <>
      <Form ref={formRef} jsonSchema={schema} />
      <button onClick={handleToggleAdvanced}>
        고급 옵션 토글
      </button>
    </>
  );
};
```

### 특정 필드 값 변경

```typescript
const handleFieldChange = (path: string, value: any) => {
  const node = formRef.current?.findNode(path);
  if (node) {
    node.setValue(value);
  }
};

// 사용
handleFieldChange('/email', 'new@example.com');
```

---

## 타입 안전성

```typescript
// 스키마 타입 추론 활용
const schema = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    age: { type: 'number' },
  },
} as const;

const formRef = useRef<FormHandle<typeof schema>>(null);

// getValue() 반환 타입이 추론됨
const value = formRef.current?.getValue();
// value: { name?: string; age?: number }

// setValue() 타입 검사
formRef.current?.setValue({
  name: '홍길동',
  age: 25,
});
```

---

## 참고

- 전체 스펙: `docs/ko/SPECIFICATION.md`
- 관련 스토리: `stories/07.FormRefHandle.stories.tsx`, `stories/19.SubmitUsecase.stories.tsx`, `stories/20.Reset.stories.tsx`
