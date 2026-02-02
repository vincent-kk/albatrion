---
name: schema-form-performance-optimization
description: "@canard/schema-form의 성능 최적화 전문가. Strategy 패턴, 대규모 폼/배열 처리, 메모리 관리, ValidationMode 최적화를 안내합니다."
user-invocable: false
---

# Performance Optimization Skill

@canard/schema-form의 성능 최적화에 대한 전문 스킬입니다.

## 스킬 정보 (Skill Info)

- **이름**: performance-optimization
- **용도**: 대규모 폼, 배열 처리, 메모리 관리 최적화 가이드
- **트리거**: 성능, 최적화, 느림, 메모리, 대량 데이터, Strategy 관련 질문

---

## 개요 (Overview)

Schema Form은 복잡한 폼을 효율적으로 처리하도록 설계되었지만, 대규모 데이터나 복잡한 스키마에서는 최적화가 필요할 수 있습니다.

---

## Strategy 패턴

### Terminal Strategy vs Branch Strategy

배열과 객체 노드는 아이템 복잡도에 따라 다른 전략을 사용합니다.

| Strategy | 적용 조건 | 특징 |
|----------|----------|------|
| **Terminal** | 원시 타입 (string, number, boolean) | 가볍고 빠름 |
| **Branch** | 복합 타입 (object, array) | 각 아이템에 노드 트리 생성 |

### Terminal Strategy (권장)

```typescript
// 단순 타입 배열 - 자동으로 Terminal Strategy 적용
const schema = {
  type: 'array',
  items: {
    type: 'string',  // primitive → Terminal
  },
};

// 특징:
// - 노드 트리 없이 값만 관리
// - 메모리 효율적
// - 빠른 추가/삭제
```

### Branch Strategy

```typescript
// 복합 타입 배열 - 자동으로 Branch Strategy 적용
const schema = {
  type: 'array',
  items: {
    type: 'object',  // complex → Branch
    properties: {
      name: { type: 'string' },
      age: { type: 'number' },
    },
  },
};

// 특징:
// - 각 아이템에 대한 노드 트리 생성
// - 아이템별 검증, computed 지원
// - 더 많은 메모리 사용
```

### 명시적 Strategy 설정

```typescript
// 원시 타입이지만 Branch Strategy 강제
const schema = {
  type: 'array',
  terminal: false,  // 강제로 Branch Strategy
  items: {
    type: 'string',
  },
};

// 사용 사례:
// - 아이템별 개별 상태 추적 필요
// - 아이템별 computed 속성 필요
```

---

## ValidationMode 최적화

### 실시간 검증 vs 요청 시 검증

```typescript
import { ValidationMode } from '@canard/schema-form';

// ❌ 성능 이슈: 모든 입력마다 검증
<Form validationMode={ValidationMode.OnChange} />

// ✅ 최적화: 제출 시에만 검증
<Form validationMode={ValidationMode.OnRequest} />

// 균형: 필요할 때만 검증
<Form validationMode={ValidationMode.OnRequest}>
  {/* 제출 버튼에서 validate() 호출 */}
</Form>
```

### 검증 비용 절감

```typescript
// 복잡한 패턴 검증 최소화
{
  type: 'string',
  // ❌ 비용이 높은 정규식
  pattern: '^(?=.*[A-Za-z])(?=.*\\d)(?=.*[@$!%*#?&])[A-Za-z\\d@$!%*#?&]{8,}$',
}

// ✅ 간단한 검증 + 커스텀 로직
{
  type: 'string',
  minLength: 8,
  // 복잡한 검증은 제출 시에만
}
```

---

## 배열 처리 최적화

### 대량 아이템 추가

```typescript
// ❌ 느림: 개별 push (각각 이벤트 발생)
for (let i = 0; i < 100; i++) {
  await arrayNode.push(createItem(i));
}

// ✅ 빠름: 값 직접 설정 (단일 이벤트)
formRef.current?.setValue(prev => ({
  ...prev,
  items: Array.from({ length: 100 }, (_, i) => createItem(i)),
}));
```

### 배치 작업

```typescript
// ✅ Promise.all로 병렬 처리
const addItems = async (count: number) => {
  const promises = Array.from({ length: count }, () =>
    arrayNode.push(Math.random())
  );
  await Promise.all(promises);
};
```

### 가상화 (Virtualization)

대량 아이템 렌더링 시 가상화 라이브러리 사용:

```typescript
import { FixedSizeList as List } from 'react-window';

const VirtualizedArrayInput: FC<FormTypeInputProps<any[]>> = ({
  value,
  ChildNodeComponents,
}) => (
  <List
    height={400}
    itemCount={ChildNodeComponents.length}
    itemSize={50}
    width="100%"
  >
    {({ index, style }) => (
      <div style={style}>
        {ChildNodeComponents[index]?.()}
      </div>
    )}
  </List>
);
```

---

## 메모리 관리

### 구독 해제

```typescript
// ✅ 반드시 클린업
useEffect(() => {
  const unsubscribe = node.subscribe((event) => {
    // ...
  });
  return () => unsubscribe();
}, [node]);
```

### 불필요한 참조 제거

```typescript
// ❌ 메모리 누수: 컴포넌트 외부에 노드 저장
let globalNode: SchemaNode;

const MyComponent = ({ node }) => {
  globalNode = node;  // 누수!
  return <div />;
};

// ✅ 올바른 패턴: 필요한 값만 추출
const MyComponent = ({ node }) => {
  const value = node.value;  // 값만 사용
  return <div>{value}</div>;
};
```

### 대규모 스키마 분리

```typescript
// ❌ 하나의 거대한 폼
const giantSchema = {
  type: 'object',
  properties: {
    // ... 수백 개의 필드
  },
};

// ✅ 섹션별 분리
const section1Schema = { /* ... */ };
const section2Schema = { /* ... */ };

// 각 섹션을 별도 Form으로 렌더링
<Form jsonSchema={section1Schema} />
<Form jsonSchema={section2Schema} />
```

---

## Computed Properties 최적화

### 불필요한 재계산 방지

```typescript
// ❌ 복잡한 표현식
{
  '&derived': `
    ../items.filter(i => i.active).reduce((sum, i) => sum + i.price, 0)
  `,
}

// ✅ 단순화 또는 FormTypeInput에서 계산
{
  type: 'number',
  '&watch': '../items',
}

// FormTypeInput에서 복잡한 계산
const TotalInput = ({ watchValues }) => {
  const items = watchValues[0] || [];
  const total = useMemo(() =>
    items
      .filter((i) => i.active)
      .reduce((sum, i) => sum + i.price, 0),
    [items]
  );
  return <span>{total}</span>;
};
```

### watch 경로 최소화

```typescript
// ❌ 불필요한 watch
{
  '&watch': ['../field1', '../field2', '../field3', '../field4'],
  '&derived': '../field1 + ../field2',  // field3, field4는 사용 안 함
}

// ✅ 필요한 것만 watch
{
  '&watch': ['../field1', '../field2'],
  '&derived': '../field1 + ../field2',
}
```

---

## 렌더링 최적화

### React.memo 활용

```typescript
const OptimizedInput = React.memo<FormTypeInputProps<string>>(
  ({ value, onChange }) => (
    <input
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value)}
    />
  )
);
```

### useCallback으로 핸들러 안정화

```typescript
const MyInput: FC<FormTypeInputProps<string>> = ({ value, onChange }) => {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(e.target.value);
    },
    [onChange]
  );

  return <input value={value ?? ''} onChange={handleChange} />;
};
```

### 조건부 렌더링 최적화

```typescript
// ❌ 매번 새 함수 생성
const MyForm = () => (
  <Form jsonSchema={schema}>
    {({ value }) => (
      <div>
        {value.items.map((item, i) => (
          <ItemComponent key={i} item={item} />
        ))}
      </div>
    )}
  </Form>
);

// ✅ 컴포넌트 분리
const ItemList = React.memo(({ items }) => (
  <div>
    {items.map((item, i) => (
      <ItemComponent key={i} item={item} />
    ))}
  </div>
));

const MyForm = () => (
  <Form jsonSchema={schema}>
    {({ value }) => <ItemList items={value.items} />}
  </Form>
);
```

---

## 네트워크 최적화

### 디바운싱

```typescript
import { useMemo } from 'react';
import { debounce } from 'lodash';

const AutoSaveForm = () => {
  const formRef = useRef<FormHandle>(null);

  const debouncedSave = useMemo(
    () => debounce((value) => {
      api.save(value);
    }, 1000),
    []
  );

  return (
    <Form
      ref={formRef}
      jsonSchema={schema}
      onChange={(value) => debouncedSave(value)}
    />
  );
};
```

### 선택적 필드 전송

```typescript
// 변경된 필드만 추출
const getChangedFields = (original, current) => {
  const changed = {};
  for (const key in current) {
    if (original[key] !== current[key]) {
      changed[key] = current[key];
    }
  }
  return changed;
};

// 사용
const handleSubmit = async () => {
  const current = formRef.current?.getValue();
  const changedFields = getChangedFields(initialValue, current);
  await api.patch(changedFields);  // 변경분만 전송
};
```

---

## 성능 측정

### 렌더링 시간 측정

```typescript
const PerformanceWrapper = ({ children }) => {
  const startTime = useRef(performance.now());

  useEffect(() => {
    const endTime = performance.now();
    console.log(`Render time: ${endTime - startTime.current}ms`);
  });

  return children;
};

// 사용
<PerformanceWrapper>
  <Form jsonSchema={schema} />
</PerformanceWrapper>
```

### 이벤트 카운팅

```typescript
const countEvents = (node: SchemaNode) => {
  let count = 0;
  const startTime = Date.now();

  const unsubscribe = node.subscribe(() => {
    count++;
  });

  // 10초 후 결과 출력
  setTimeout(() => {
    console.log(`Events in 10s: ${count}`);
    unsubscribe();
  }, 10000);
};
```

---

## 성능 체크리스트

### 기본 최적화

- [ ] ValidationMode를 OnRequest로 설정 (필요한 경우)
- [ ] 대량 배열에 Terminal Strategy 사용
- [ ] 모든 구독에 클린업 함수 제공
- [ ] 복잡한 computed 표현식 단순화

### 고급 최적화

- [ ] 대량 아이템에 가상화 적용
- [ ] 대규모 스키마 섹션 분리
- [ ] React.memo로 FormTypeInput 최적화
- [ ] 네트워크 요청 디바운싱

### 측정

- [ ] React DevTools Profiler로 렌더링 분석
- [ ] 이벤트 발생 빈도 모니터링
- [ ] 메모리 사용량 추적

---

## 벤치마크 가이드라인

| 시나리오 | 목표 | 측정 방법 |
|----------|------|----------|
| 초기 렌더링 | < 100ms | First Contentful Paint |
| 값 입력 반응 | < 16ms | 프레임 드롭 없음 |
| 대량 추가 (100개) | < 500ms | 완료 시간 |
| 메모리 증가 | < 10MB/100필드 | Chrome DevTools |

---

## 참고

- 전체 스펙: `docs/ko/SPECIFICATION.md`
- Event System: `docs/claude/skills/event-system.md`
- Array Operations: `docs/claude/skills/array-operations.md`
