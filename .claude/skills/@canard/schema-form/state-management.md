# State Management Skill

@canard/schema-form의 노드 상태 관리에 대한 전문 스킬입니다.

## 스킬 정보 (Skill Info)

- **이름**: state-management
- **용도**: NodeState, dirty, touched, globalState 관리 가이드
- **트리거**: NodeState, dirty, touched, state, globalState, onStateChange, clearState 관련 질문

---

## 개요 (Overview)

Schema Form은 각 노드의 상태(dirty, touched, validated 등)를 추적하고 관리합니다. 이를 통해 사용자 상호작용 추적, 조건부 UI 표시, 폼 상태 기반 검증 등을 구현할 수 있습니다.

---

## NodeState 타입

```typescript
enum NodeState {
  Dirty = 'dirty',       // 값이 변경됨
  Touched = 'touched',   // 사용자가 필드와 상호작용함
  Validated = 'validated', // 검증이 수행됨
  ShowError = 'showError', // 에러 표시 활성화
}

type NodeStateFlags = {
  [NodeState.Dirty]?: boolean;
  [NodeState.Touched]?: boolean;
  [NodeState.Validated]?: boolean;
  [NodeState.ShowError]?: boolean;
};
```

---

## 개별 노드 상태

### 상태 속성 접근

```typescript
// 노드에서 직접 접근
const node = formRef.current?.findNode('/email');

console.log(node.dirty);      // 값 변경 여부
console.log(node.touched);    // 상호작용 여부
console.log(node.validated);  // 검증 수행 여부
console.log(node.state);      // 전체 상태 객체
```

### FormTypeInput에서 상태 사용

```typescript
import { NodeState, useSchemaNodeTracker, NodeEventType } from '@canard/schema-form';

const MyInput: FC<FormTypeInputProps> = ({ node, value, onChange }) => {
  // 상태 변경 시 리렌더링
  useSchemaNodeTracker(node, NodeEventType.UpdateState);

  const { [NodeState.Dirty]: dirty, [NodeState.Touched]: touched } = node.state || {};

  return (
    <div>
      <input
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        onBlur={() => node.setState({ [NodeState.Touched]: true })}
        style={{
          borderColor: dirty ? 'orange' : 'gray',
          backgroundColor: touched ? '#f0f0f0' : 'white',
        }}
      />
      {dirty && <span>Modified</span>}
      {touched && <span>Visited</span>}
    </div>
  );
};
```

---

## Global State

전체 폼의 집계된 상태입니다. 하위 노드 중 하나라도 해당 상태가 true이면 globalState도 true입니다.

### onStateChange 콜백

```typescript
// stories/38.StateManagement.stories.tsx 기반
const [globalState, setGlobalState] = useState<NodeStateFlags>({});

<Form
  jsonSchema={schema}
  onStateChange={(state) => {
    setGlobalState(state);
    console.log('Form dirty:', state[NodeState.Dirty]);
    console.log('Form touched:', state[NodeState.Touched]);
  }}
/>

// globalState 활용
{globalState[NodeState.Dirty] && (
  <button onClick={handleSave}>Save Changes</button>
)}
```

### FormHandle에서 상태 관리

```typescript
const formRef = useRef<FormHandle<typeof schema>>(null);

// 상태 조회
const state = formRef.current?.getState();
console.log('Is form dirty:', state?.[NodeState.Dirty]);

// 상태 설정
formRef.current?.setState({
  [NodeState.Touched]: true,
});

// 상태 초기화
formRef.current?.clearState();
```

---

## Dirty State

값이 초기값에서 변경되었는지 추적합니다.

### 자동 추적

```typescript
// 초기 상태
node.dirty === false;

// setValue 호출 후
node.setValue('new value');
node.dirty === true;

// 초기값으로 되돌리면
node.setValue(initialValue);
node.dirty === false;  // 초기값과 같으면 dirty 해제
```

### 부모-자식 전파

```typescript
// 자식 노드가 dirty가 되면 부모도 dirty
childNode.setValue('changed');
parentNode.dirty === true;  // 부모도 dirty

// 모든 자식이 초기값으로 돌아가면 부모도 clean
childNode.setValue(initialValue);
parentNode.dirty === false;  // 모든 자식이 clean이면 부모도 clean
```

---

## Touched State

사용자가 필드와 상호작용했는지 추적합니다.

### 수동 설정

```typescript
// 일반적으로 blur 이벤트에서 설정
<input
  onBlur={() => node.setState({ [NodeState.Touched]: true })}
/>
```

### 에러 표시 조건

```typescript
// touched 상태를 에러 표시 조건으로 활용
const showFieldError = node.touched && node.errors.length > 0;

// 또는 showError prop 활용
<Form showError="touched">
  {/* touched된 필드만 에러 표시 */}
</Form>
```

---

## clearState 메서드

모든 노드의 상태를 초기화합니다.

```typescript
const formRef = useRef<FormHandle<typeof schema>>(null);

const handleClearState = () => {
  formRef.current?.clearState();
  // 모든 노드의 dirty, touched, validated 등이 false로 초기화
};

// 폼 제출 후 상태 초기화
const handleSubmit = async () => {
  const errors = await formRef.current?.validate();
  if (errors?.length === 0) {
    await saveData(formRef.current?.getValue());
    formRef.current?.clearState();  // 제출 후 상태 리셋
  }
};
```

---

## 상태 변경 히스토리 추적

```typescript
// stories/38.StateManagement.stories.tsx 기반
const [stateHistory, setStateHistory] = useState<
  { timestamp: string; state: NodeStateFlags }[]
>([]);

const handleStateChange = (state: NodeStateFlags) => {
  setStateHistory((prev) => [
    ...prev.slice(-9),  // 최근 10개만 유지
    {
      timestamp: new Date().toLocaleTimeString(),
      state: { ...state },
    },
  ]);
};

<Form
  jsonSchema={schema}
  onStateChange={handleStateChange}
/>

// 히스토리 표시
<ul>
  {stateHistory.map((entry, idx) => (
    <li key={idx}>
      {entry.timestamp}: dirty={entry.state[NodeState.Dirty] ? 'Y' : 'N'}
    </li>
  ))}
</ul>
```

---

## CustomFormTypeRenderer에서 상태 표시

```typescript
// stories/38.StateManagement.stories.tsx 기반
const StateAwareRenderer = ({ depth, name, node, Input }: FormTypeRendererProps) => {
  // 상태 변경 구독
  useSchemaNodeTracker(node, NodeEventType.UpdateState);

  const { [NodeState.Dirty]: dirty, [NodeState.Touched]: touched } = node.state || {};

  if (depth === 0) return <Input />;

  return (
    <div style={{ marginBottom: 8, padding: 8, border: '1px solid #ddd' }}>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <label style={{ minWidth: 80 }}>{name}</label>
        <Input style={{ flex: 1 }} />
        <span style={{ color: dirty ? 'red' : '#999' }}>
          {dirty ? '●' : '○'} dirty
        </span>
        <span style={{ color: touched ? 'blue' : '#999' }}>
          {touched ? '●' : '○'} touched
        </span>
      </div>
    </div>
  );
};

<Form
  jsonSchema={schema}
  CustomFormTypeRenderer={StateAwareRenderer}
/>
```

---

## 배열 아이템 상태

배열 아이템도 개별적으로 상태를 가집니다.

```typescript
const arrayNode = formRef.current?.findNode('/items') as ArrayNode;

// 각 아이템의 상태 확인
arrayNode.children.forEach((child, index) => {
  console.log(`Item ${index} dirty:`, child.node.dirty);
  console.log(`Item ${index} touched:`, child.node.touched);
});

// 배열 전체의 dirty 상태
console.log('Array dirty:', arrayNode.dirty);  // 하나라도 변경되면 true
```

---

## 실제 사용 패턴

### 저장 버튼 활성화

```typescript
const [canSave, setCanSave] = useState(false);

<Form
  jsonSchema={schema}
  onStateChange={(state) => {
    // dirty 상태일 때만 저장 버튼 활성화
    setCanSave(state[NodeState.Dirty] === true);
  }}
/>

<button disabled={!canSave} onClick={handleSave}>
  Save Changes
</button>
```

### 이탈 방지

```typescript
const [isDirty, setIsDirty] = useState(false);

// beforeunload 이벤트 핸들러
useEffect(() => {
  const handleBeforeUnload = (e: BeforeUnloadEvent) => {
    if (isDirty) {
      e.preventDefault();
      e.returnValue = '';
    }
  };

  window.addEventListener('beforeunload', handleBeforeUnload);
  return () => window.removeEventListener('beforeunload', handleBeforeUnload);
}, [isDirty]);

<Form
  jsonSchema={schema}
  onStateChange={(state) => setIsDirty(state[NodeState.Dirty] ?? false)}
/>
```

### 부분 검증 표시

```typescript
// touched된 필드만 에러 표시
<Form
  jsonSchema={schema}
  showError={(node) => node.touched && node.errors.length > 0}
/>

// 또는 showError="touched"로 간단히
<Form
  jsonSchema={schema}
  showError="touched"
/>
```

---

## 주의사항

### 1. 상태 추적과 리렌더링

`useSchemaNodeTracker`를 사용하면 해당 이벤트 발생 시 컴포넌트가 리렌더링됩니다. 성능을 위해 필요한 경우에만 사용하세요.

```typescript
// ⚠️ 모든 이벤트 구독 (성능 저하 가능)
useSchemaNodeTracker(node);

// ✅ 필요한 이벤트만 구독
useSchemaNodeTracker(node, NodeEventType.UpdateState);
```

### 2. 초기값과 dirty

`defaultValue`가 변경되면 dirty 계산 기준도 변경됩니다.

### 3. clearState vs reset

- `clearState()`: 상태만 초기화 (값은 유지)
- `reset()`: 값과 상태 모두 초기화 (defaultValue로 복원)

---

## 참고

- 전체 스펙: `docs/ko/SPECIFICATION.md`
- 관련 스토리: `stories/38.StateManagement.stories.tsx`, `stories/15.NodeState.stories.tsx`
