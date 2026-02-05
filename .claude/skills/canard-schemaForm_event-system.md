---
name: schema-form-event-system
description: "@canard/schema-form의 이벤트 시스템 전문가. 노드 이벤트, 구독, EventCascade 배칭 메커니즘을 안내합니다."
user-invocable: false
---

# Event System Skill

@canard/schema-form의 이벤트 시스템에 대한 전문 스킬입니다.

## 스킬 정보 (Skill Info)

- **이름**: event-system
- **용도**: 노드 이벤트, 구독, 이벤트 배칭 메커니즘 가이드
- **트리거**: event, subscribe, 이벤트 배칭, UpdateValue, 구독/해제 관련 질문

---

## 개요 (Overview)

Schema Form은 노드 기반의 이벤트 시스템을 사용합니다. 각 노드는 자체 `EventCascade` 인스턴스를 가지며, 이벤트는 마이크로태스크 큐를 통해 배칭됩니다.

---

## 이벤트 타입

```typescript
enum NodeEventType {
  // 라이프사이클
  Initialized,              // 노드 생성 및 초기화 완료

  // 값 및 상태
  UpdateValue,              // 값 변경
  UpdateState,              // 노드 상태 변경 (touched, dirty 등)
  UpdateError,              // 검증 에러 변경
  UpdateComputedProperties, // computed 속성 재계산 필요
  UpdateChildren,           // 배열/객체 자식 변경
  UpdatePath,               // 노드 경로 변경 (배열 재정렬 시)

  // UI 동기화
  RequestRefresh,           // 비제어 컴포넌트 defaultValue 동기화 (내부)
  RequestRemount,           // 컴포넌트 전체 리마운트 (외부 API)

  // 시스템
  RequestEmitChange,        // onChange 콜백 요청
  RequestInjection,         // injectTo 전파 요청
}
```

### 이벤트 분류

| 카테고리 | 이벤트 | 설명 |
|----------|--------|------|
| **라이프사이클** | `Initialized` | 노드 초기화 완료 |
| **값** | `UpdateValue` | 값이 변경됨 |
| **상태** | `UpdateState` | dirty, touched 등 상태 변경 |
| **검증** | `UpdateError` | 검증 에러 갱신 |
| **Computed** | `UpdateComputedProperties` | 의존성 값 변경으로 재계산 필요 |
| **구조** | `UpdateChildren`, `UpdatePath` | 자식 노드 또는 경로 변경 |
| **UI** | `RequestRefresh`, `RequestRemount` | UI 갱신 요청 |

---

## 이벤트 타이밍

### 동기 이벤트

초기화 완료 후, 일부 이벤트는 **즉시** 발생합니다:

```typescript
node.setValue('value');
// ↓ 동기적으로 발생
// UpdateValue (immediate 플래그)
```

### 비동기 이벤트 (마이크로태스크)

대부분의 이벤트는 마이크로태스크 큐에서 배칭됩니다:

```typescript
node.setValue('value');
// ↓ 다음 마이크로태스크에서 발생
// RequestRefresh
// UpdateComputedProperties (의존 노드가 있는 경우)
```

### 이벤트 시퀀스 예시

```typescript
// 사용자가 name 필드에 입력
nameNode.setValue('Alice');

// 마이크로태스크 0 (동기):
//   - nameNode: UpdateValue (immediate)
//   - objectNode: 자식 변경 알림 수신

// 마이크로태스크 1 (비동기):
//   - objectNode: UpdateValue (배칭)
//   - objectNode: RequestRefresh (병합)
//   - 의존 노드들: UpdateComputedProperties (배칭, 병합)
```

---

## EventCascade 배칭 메커니즘

### 핵심 동작

각 `AbstractNode`는 자체 `EventCascade` 인스턴스를 가집니다. 이벤트는 마이크로태스크 큐를 통해 병합됩니다.

```typescript
// 동일한 동기 스택에서 여러 이벤트 스케줄
schedule(UpdateValue);
schedule(RequestRefresh);
// → 두 이벤트가 같은 배치로 병합됨

// 마이크로태스크 실행 시:
scheduleMicrotask(() => {
  nextBatch.resolved = true;  // 배치 시작 시 설정
  this.__batchHandler__(mergeEvents(nextBatch.eventEntities));
  // 리스너 실행 중 새 이벤트 스케줄 시:
  //   resolved = true이므로 → 새 배치 생성
});
```

### 배치 라이프사이클

```
1. 이벤트 스케줄
   └─ batch.resolved = undefined (축적 중)

2. 동일 스택에서 추가 이벤트
   └─ 같은 배치에 병합

3. 마이크로태스크 실행
   └─ batch.resolved = true (실행 중)
   └─ 리스너 호출

4. 리스너 내에서 새 이벤트
   └─ 새 배치 생성
```

### 배치 재사용 조건

```typescript
// EventCascade 내부 로직
if (batch && !batch.resolved) {
  // 기존 배치에 이벤트 추가
  return batch;
}
// 새 배치 생성
```

---

## 구독과 구독 해제

### 기본 구독

```typescript
const node = formRef.current?.findNode('/name');

const unsubscribe = node.subscribe((event) => {
  console.log('Event type:', event.type);
  console.log('Event target:', event.target);
});

// 나중에 구독 해제
unsubscribe();
```

### React 컴포넌트에서 사용

```typescript
import { useEffect } from 'react';

const MyComponent = ({ node }) => {
  useEffect(() => {
    const unsubscribe = node.subscribe((event) => {
      if (event.type === NodeEventType.UpdateValue) {
        console.log('Value changed:', node.value);
      }
    });

    // 클린업 함수에서 반드시 해제
    return () => unsubscribe();
  }, [node]);

  return <div>{node.value}</div>;
};
```

### 특정 이벤트만 처리

```typescript
import { NodeEventType } from '@canard/schema-form';

node.subscribe((event) => {
  switch (event.type) {
    case NodeEventType.UpdateValue:
      console.log('Value:', node.value);
      break;
    case NodeEventType.UpdateError:
      console.log('Errors:', node.errors);
      break;
    case NodeEventType.UpdateState:
      console.log('Dirty:', node.dirty, 'Touched:', node.touched);
      break;
  }
});
```

---

## SetValueOption의 영향

### SetValueOption.Overwrite (기본값)

`setValue()` 기본 동작은 `Overwrite` 옵션을 포함하며, 이는 `Isolate` 옵션을 내포합니다.

```typescript
node.setValue({ name: 'Alice' });
// Overwrite 옵션 사용 (기본값)
// → Isolate 효과: updateComputedProperties()가 동기적으로 호출됨
// → UpdateValue | RequestRefresh | UpdateComputedProperties가 같은 배치로 병합
```

### 이벤트 옵션: settled

```typescript
// 부모에서 직접 setValue (Isolate 모드)
objectNode.setValue({ name: 'Alice' });
// event.option = { settled: false }
// → 동기적 computed properties 업데이트

// 자식에서 setValue (일반 모드)
nameNode.setValue('Alice');
// event.option = { settled: true }
// → 비동기적 computed properties 업데이트
```

---

## 이벤트 전파 패턴

### 자식 → 부모 전파

```typescript
// 자식 노드 값 변경
nameNode.setValue('Alice');

// 전파 순서:
// 1. nameNode: UpdateValue (동기)
// 2. objectNode: 자식 변경 감지
// 3. objectNode: UpdateValue (비동기, 배칭)
// 4. rootNode: UpdateValue (비동기, 배칭)
```

### Computed Properties 업데이트

```typescript
const schema = {
  type: 'object',
  properties: {
    toggle: { type: 'boolean' },
    dependent: {
      type: 'string',
      '&active': '../toggle === true',
    },
  },
};

// toggle 변경 시:
toggleNode.setValue(true);

// 이벤트 순서:
// 1. toggleNode: UpdateValue (동기)
// 2. dependentNode: UpdateComputedProperties (비동기)
// 3. dependentNode: active 속성 업데이트
```

---

## 성능 특성

### 마이크로태스크 최적화

```
Master 브랜치 (이전):
title.setValue('wow')
  ↓ 마이크로태스크 1: title UpdateValue
  ↓ 마이크로태스크 2: computed properties UpdateComputedProperties
총: 2 마이크로태스크

최적화 후:
title.setValue('wow')
  ↓ 마이크로태스크 0 (동기): title UpdateValue (immediate)
  ↓ 마이크로태스크 1: computed properties UpdateComputedProperties
총: 1 마이크로태스크 (50% 개선)
```

### 배칭의 이점

```typescript
// 여러 값 동시 변경
node.setValue({ name: 'Alice', age: 25, email: 'alice@example.com' });

// 배칭 없이: 3개의 개별 UpdateValue 이벤트
// 배칭 적용: 1개의 병합된 이벤트
// → 리렌더링 최소화
```

---

## 고급 패턴

### 이벤트 디바운싱

```typescript
import { useMemo, useEffect } from 'react';
import { debounce } from 'lodash';

const MyComponent = ({ node }) => {
  const debouncedHandler = useMemo(
    () => debounce((value) => {
      console.log('Debounced value:', value);
    }, 300),
    []
  );

  useEffect(() => {
    const unsubscribe = node.subscribe((event) => {
      if (event.type === NodeEventType.UpdateValue) {
        debouncedHandler(node.value);
      }
    });

    return () => {
      unsubscribe();
      debouncedHandler.cancel();
    };
  }, [node, debouncedHandler]);

  return null;
};
```

### 조건부 구독

```typescript
const subscribeToErrors = (node) => {
  return node.subscribe((event) => {
    // UpdateError 이벤트만 처리
    if (event.type !== NodeEventType.UpdateError) return;

    if (node.errors.length > 0) {
      console.error('Validation errors:', node.errors);
    }
  });
};
```

### 이벤트 로깅

```typescript
const createEventLogger = (node, prefix = '') => {
  return node.subscribe((event) => {
    console.log(`${prefix}[${NodeEventType[event.type]}]`, {
      path: node.path,
      value: node.value,
      timestamp: Date.now(),
    });
  });
};

// 사용
const unsubscribe = createEventLogger(rootNode, '[Form]');
```

---

## RequestRefresh vs RequestRemount

| 이벤트 | 용도 | 트리거 |
|--------|------|--------|
| `RequestRefresh` | 비제어 컴포넌트의 defaultValue를 UI와 동기화 | 내부 시스템 자동 발행 |
| `RequestRemount` | 컴포넌트 전체 리마운트 강제 | 사용자 명시적 호출 |

### RequestRemount 사용

```typescript
// 외부에서 강제 리마운트 요청
node.publish(NodeEventType.RequestRemount);
```

---

## 메모리 관리

### 구독 해제의 중요성

```typescript
// ❌ 잘못된 예: 메모리 누수
useEffect(() => {
  node.subscribe((event) => {
    // ...
  });
  // 클린업 없음!
}, [node]);

// ✅ 올바른 예
useEffect(() => {
  const unsubscribe = node.subscribe((event) => {
    // ...
  });
  return () => unsubscribe();  // 반드시 클린업
}, [node]);
```

### 구독 해제 확인

```typescript
// 구독 해제 후 리스너가 호출되지 않음
const unsubscribe = node.subscribe((event) => {
  console.log('This should not be called after unsubscribe');
});

unsubscribe();

node.setValue('test');
// 리스너가 호출되지 않음
```

---

## 테스트에서의 이벤트 처리

### 비동기 이벤트 대기

```typescript
import { delay } from '@canard/schema-form';

test('value changes propagate correctly', async () => {
  const node = nodeFromJsonSchema({ jsonSchema: schema });

  // 초기화 완료 대기
  await delay();

  node.setValue({ name: 'test' });

  // 비동기 이벤트 완료 대기
  await delay();

  expect(node.value).toEqual({ name: 'test' });
});
```

### 이벤트 순서 테스트

```typescript
test('events fire in correct order', async () => {
  const events: NodeEventType[] = [];

  node.subscribe((event) => {
    events.push(event.type);
  });

  node.setValue('test');
  await delay();

  expect(events).toContain(NodeEventType.UpdateValue);
});
```

---

## 주의사항

### 1. 이벤트 핸들러 내 상태 변경

```typescript
// ⚠️ 주의: 이벤트 핸들러 내에서 setValue 호출
node.subscribe((event) => {
  if (event.type === NodeEventType.UpdateValue) {
    // 새 배치가 생성됨 (현재 배치의 resolved = true)
    anotherNode.setValue('derived');
  }
});
```

### 2. 테스트 동작 vs 실제 사용

- 테스트에서 `objectNode.setValue()`를 직접 호출하면 `Overwrite` 옵션 사용
- 실제 사용자 시나리오에서는 자식 노드가 부모에게 변경 전파
- 이벤트 타이밍이 다를 수 있음

### 3. Isolate 옵션과 동기적 computed 업데이트

`Isolate` 옵션이 설정되면 `updateComputedProperties()`가 **동기적으로** 호출되어 모든 이벤트가 같은 배치로 병합됩니다.

---

## 참고

- 전체 스펙: `docs/ko/SPECIFICATION.md`
- CLAUDE.md: EventCascade 상세 설명
- 테스트 코드: `src/core/__tests__/*.test.ts`
