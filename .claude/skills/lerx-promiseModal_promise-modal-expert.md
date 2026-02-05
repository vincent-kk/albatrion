---
name: promise-modal-expert
description: "@lerx/promise-modal 라이브러리 전문가. React 기반 Promise 모달 유틸리티 (alert, confirm, prompt), 아키텍처, 커스터마이징을 안내합니다."
user-invocable: false
---

# Promise Modal 전문가 스킬

## 역할

당신은 `@lerx/promise-modal` 라이브러리 전문가입니다. React 기반 Promise 모달 유틸리티를 사용하여 모달 대화상자를 효과적으로 구현할 수 있도록 사용자를 도와주세요.

## 핵심 지식

### 라이브러리 개요

`@lerx/promise-modal`은 다음 기능을 제공하는 React용 범용 모달 유틸리티입니다:
- Promise 기반 모달 상호작용 (alert, confirm, prompt)
- React 컴포넌트 외부에서도 사용 가능
- 높은 수준의 컴포넌트 커스터마이징
- 자동 생명주기 관리
- AbortSignal을 통한 프로그래밍 방식의 모달 취소

### 아키텍처

라이브러리는 계층화된 아키텍처를 사용합니다:

1. **Core 계층** - 메인 API 함수 (alert, confirm, prompt)
2. **Application 계층** - 생명주기 및 DOM 관리를 위한 ModalManager 싱글톤
3. **Bootstrap 계층** - 초기화를 위한 ModalProvider 컴포넌트
4. **Provider 계층** - 설정 및 상태를 위한 Context providers
5. **Component 계층** - 커스터마이징 가능한 UI 컴포넌트

### 설정 우선순위

설정은 계층적으로 적용되며, 하위 레벨이 상위 레벨을 덮어씁니다:

```
Provider 설정 (최하위) < Hook 설정 < Handler 설정 (최상위)
```

| 레벨 | 위치 | 설명 |
|------|------|------|
| **Provider** | `ModalProvider` props | 앱 전역 기본 설정 |
| **Hook** | `useModal(config)` | 컴포넌트 레벨 설정 |
| **Handler** | `alert/confirm/prompt(options)` | 개별 모달 설정 |

---

## API 레퍼런스

### 정적 함수

#### `alert(options)`

간단한 알림 모달을 엽니다.

```typescript
import { alert } from '@lerx/promise-modal';

await alert({
  title: '알림',
  content: '작업이 완료되었습니다.',
  subtype: 'success', // 'info' | 'success' | 'warning' | 'error'
  dimmed: true,
  closeOnBackdropClick: true,
  manualDestroy: false,
  signal: abortController.signal, // 선택적 AbortSignal
});
```

**옵션**:
| 옵션 | 타입 | 설명 |
|------|------|------|
| `title` | `ReactNode` | 모달 제목 |
| `subtitle` | `ReactNode` | 제목 아래 부제목 |
| `content` | `ReactNode \| ComponentType` | 모달 내용 |
| `subtype` | `'info' \| 'success' \| 'warning' \| 'error'` | 모달 스타일링 타입 |
| `dimmed` | `boolean` | 배경 어둡게 처리 여부 |
| `closeOnBackdropClick` | `boolean` | 배경 클릭 시 닫기 |
| `manualDestroy` | `boolean` | 수동 제거 모드 |
| `duration` | `number \| string` | 애니메이션 지속 시간 |
| `background` | `ModalBackground` | 배경 설정 |
| `footer` | `Function \| Object \| false` | 푸터 설정 |
| `ForegroundComponent` | `ComponentType` | 커스텀 전경 컴포넌트 |
| `BackgroundComponent` | `ComponentType` | 커스텀 배경 컴포넌트 |
| `signal` | `AbortSignal` | 모달 취소를 위한 AbortSignal |

**반환값**: `Promise<void>`

---

#### `confirm(options)`

사용자 결정을 위한 확인 모달을 엽니다.

```typescript
import { confirm } from '@lerx/promise-modal';

const result = await confirm({
  title: '확인',
  content: '정말 삭제하시겠습니까?',
  footer: {
    confirm: '삭제',
    cancel: '취소',
  },
});

if (result) {
  console.log('사용자가 확인함');
} else {
  console.log('사용자가 취소함');
}
```

**반환값**: `Promise<boolean>` - 확인하면 `true`, 취소하면 `false`

---

#### `prompt<T>(options)`

사용자 입력을 받는 프롬프트 모달을 엽니다.

```typescript
import { prompt } from '@lerx/promise-modal';

// 간단한 텍스트 입력
const name = await prompt<string>({
  title: '이름 입력',
  defaultValue: '',
  Input: ({ value, onChange }) => (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="이름을 입력하세요"
    />
  ),
  disabled: (value) => value.length < 2,
});

// 복잡한 객체 입력
const userInfo = await prompt<{ name: string; age: number }>({
  title: '사용자 정보',
  defaultValue: { name: '', age: 0 },
  Input: ({ value, onChange }) => (
    <div>
      <input
        value={value.name}
        onChange={(e) => onChange({ ...value, name: e.target.value })}
      />
      <input
        type="number"
        value={value.age}
        onChange={(e) => onChange({ ...value, age: Number(e.target.value) })}
      />
    </div>
  ),
});
```

**추가 옵션**:
| 옵션 | 타입 | 설명 |
|------|------|------|
| `Input` | `(props: PromptInputProps<T>) => ReactNode` | 입력 컴포넌트 (필수) |
| `defaultValue` | `T` | 기본 입력값 |
| `disabled` | `(value: T) => boolean` | 확인 버튼 비활성화 조건 |
| `returnOnCancel` | `boolean` | 취소 시 기본값 반환 여부 |

**반환값**: `Promise<T>`

---

### Hooks

#### `useModal`

컴포넌트 생명주기에 연결된 모달 핸들러를 반환합니다.

```typescript
import { useModal } from '@lerx/promise-modal';

function MyComponent() {
  const modal = useModal({
    ForegroundComponent: CustomForeground, // Hook 레벨 설정
  });

  const handleShow = async () => {
    await modal.alert({ title: '알림', content: '안녕하세요!' });
  };

  return <button onClick={handleShow}>모달 열기</button>;
}
```

**핵심 기능**: 컴포넌트가 언마운트되면 모달이 자동으로 정리됩니다.

| 기능 | 정적 핸들러 | useModal 훅 |
|------|------------|-------------|
| 생명주기 | 독립적 | 컴포넌트에 연결 |
| 정리 | 수동 | 언마운트 시 자동 |
| 사용 위치 | 어디서나 | React 컴포넌트 내부 |

---

#### `useActiveModalCount`

현재 활성화된 모달의 개수를 반환합니다.

```typescript
import { useActiveModalCount } from '@lerx/promise-modal';

function App() {
  const count = useActiveModalCount();
  // 선택적: 조건으로 필터링
  const alertCount = useActiveModalCount(
    (modal) => modal?.type === 'alert' && modal.visible
  );

  return <div>열린 모달: {count}</div>;
}
```

---

#### `useModalAnimation`

애니메이션 상태 콜백을 제공합니다.

```typescript
import { useModalAnimation } from '@lerx/promise-modal';

function CustomForeground({ visible, children }) {
  const ref = useRef(null);

  useModalAnimation(visible, {
    onVisible: () => ref.current?.classList.add('visible'),
    onHidden: () => ref.current?.classList.remove('visible'),
  });

  return <div ref={ref}>{children}</div>;
}
```

---

#### `useModalDuration`

모달 애니메이션 지속 시간을 반환합니다.

```typescript
import { useModalDuration } from '@lerx/promise-modal';

function Component() {
  const { duration, milliseconds } = useModalDuration();
  // duration: '300ms', milliseconds: 300
}
```

---

#### `useDestroyAfter`

지정된 시간 후 모달을 자동으로 제거합니다.

```typescript
import { useDestroyAfter } from '@lerx/promise-modal';

function ToastComponent({ id, duration }) {
  useDestroyAfter(id, duration);
  return <div>토스트 메시지</div>;
}
```

---

#### `useSubscribeModal`

모달 상태 변경을 구독합니다.

```typescript
import { useSubscribeModal } from '@lerx/promise-modal';

function ModalTracker({ modal }) {
  const version = useSubscribeModal(modal);

  useEffect(() => {
    console.log('모달 상태가 변경됨');
  }, [version]);
}
```

---

#### `useModalOptions`

모달 옵션 설정을 반환합니다.

```typescript
import { useModalOptions } from '@lerx/promise-modal';

function ModalDebugInfo() {
  const options = useModalOptions();

  return (
    <div>
      <p>Duration: {options.duration}</p>
      <p>Backdrop: {options.backdrop}</p>
    </div>
  );
}
```

---

#### `useModalBackdrop`

모달 배경 설정만 반환합니다.

```typescript
import { useModalBackdrop } from '@lerx/promise-modal';

function BackdropInfo() {
  const backdrop = useModalBackdrop();

  return <p>현재 배경: {backdrop}</p>;
}
```

---

### ModalProvider

초기화를 위한 메인 Provider 컴포넌트입니다.

```typescript
import { ModalProvider } from '@lerx/promise-modal';
import { useLocation } from 'react-router-dom';

function App() {
  return (
    <ModalProvider
      usePathname={useLocation}  // 라우터 통합 (경로 변경 시 모달 자동 닫힘)
      ForegroundComponent={CustomForeground}
      BackgroundComponent={CustomBackground}
      TitleComponent={CustomTitle}
      SubtitleComponent={CustomSubtitle}
      ContentComponent={CustomContent}
      FooterComponent={CustomFooter}
      options={{
        duration: '200ms',
        backdrop: 'rgba(0, 0, 0, 0.35)',
        manualDestroy: true,
        closeOnBackdropClick: true,
      }}
      context={{
        theme: 'light',
        locale: 'ko-KR',
      }}
    >
      <YourApp />
    </ModalProvider>
  );
}
```

---

## 타입 정의

### ModalFrameProps

Foreground/Background 컴포넌트에 전달되는 Props입니다.

```typescript
interface ModalFrameProps<Context = any, B = any> {
  id: number;
  type: 'alert' | 'confirm' | 'prompt';
  alive: boolean;
  visible: boolean;
  initiator: string;
  manualDestroy: boolean;
  closeOnBackdropClick: boolean;
  background?: ModalBackground<B>;
  onConfirm: () => void;
  onClose: () => void;
  onChange: (value: any) => void;
  onDestroy: () => void;
  onChangeOrder: Function;
  context: Context;
  children: ReactNode;
}
```

### FooterComponentProps

커스텀 푸터 컴포넌트용 Props입니다.

```typescript
interface FooterComponentProps {
  type: 'alert' | 'confirm' | 'prompt';
  onConfirm: (value?: any) => void;
  onClose: () => void;
  onCancel?: () => void;
  disabled?: boolean;
  footer?: FooterOptions;
  context: any;
}
```

### PromptInputProps<T>

프롬프트 입력 컴포넌트용 Props입니다.

```typescript
interface PromptInputProps<T> {
  value?: T;
  defaultValue?: T;
  onChange: (value: T | undefined) => void;
  onConfirm: () => void;
  onCancel: () => void;
  context: any;
}
```

---

## 사용 패턴

### 패턴 1: 기본 정적 API

```typescript
import { alert, confirm, prompt } from '@lerx/promise-modal';

// React 외부에서도 사용 가능
async function handleAction() {
  await alert({ title: '알림', content: '안녕하세요!' });

  if (await confirm({ title: '확인', content: '계속하시겠습니까?' })) {
    const name = await prompt({ title: '이름', defaultValue: '' });
  }
}
```

### 패턴 2: useModal을 사용한 컴포넌트 범위

```typescript
function MyComponent() {
  const { alert, confirm } = useModal();

  // 컴포넌트 언마운트 시 모달 자동 정리
  const handleDelete = async () => {
    if (await confirm({ content: '삭제하시겠습니까?' })) {
      // 삭제 로직
    }
  };
}
```

### 패턴 3: AbortSignal을 사용한 모달 취소

```typescript
function ManualAbortControl() {
  const [controller, setController] = useState<AbortController | null>(null);

  const handleOpen = () => {
    const newController = new AbortController();
    setController(newController);

    alert({
      title: '수동 취소 가능',
      content: '"취소" 버튼을 클릭하면 모달이 닫힙니다.',
      signal: newController.signal,
      closeOnBackdropClick: false,
    }).then(() => {
      setController(null);
    });
  };

  const handleAbort = () => {
    if (controller) {
      controller.abort();
    }
  };

  return (
    <div>
      <button onClick={handleOpen} disabled={!!controller}>모달 열기</button>
      <button onClick={handleAbort} disabled={!controller}>모달 취소</button>
    </div>
  );
}
```

### 패턴 4: 토스트 구현

```typescript
const ToastForeground = ({ id, visible, children, onClose, onDestroy }) => {
  const ref = useRef(null);
  const { duration } = useModalDuration();

  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  useModalAnimation(visible, {
    onVisible: () => ref.current?.classList.add('visible'),
    onHidden: () => ref.current?.classList.remove('visible'),
  });

  useDestroyAfter(id, duration);

  return <div ref={ref}>{children}</div>;
};

// 이전 토스트 제거 패턴
let onDestroyPrevToast: () => void;

export const toast = (message: ReactNode, duration = 1250) => {
  onDestroyPrevToast?.(); // 이전 토스트 제거

  return alert({
    content: message,
    ForegroundComponent: (props) => {
      onDestroyPrevToast = props.onDestroy;
      return <ToastForeground {...props} />;
    },
    footer: false,
    dimmed: false,
    closeOnBackdropClick: false,
  });
};
```

### 패턴 5: 중첩 모달

```typescript
async function multiStepProcess() {
  if (!await confirm({ title: '시작?', content: '계속하시겠습니까?' })) return;

  const name = await prompt({
    title: '이름',
    defaultValue: '',
    Input: ({ value, onChange }) => (
      <input value={value} onChange={(e) => onChange(e.target.value)} />
    ),
  });

  if (!name) return;

  await alert({
    title: '완료',
    content: `안녕하세요, ${name}님!`,
    subtype: 'success',
  });
}
```

### 패턴 6: 커스텀 앵커

```typescript
function CustomAnchorExample() {
  const { initialize, portal } = useInitializeModal({ mode: 'manual' });
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      initialize(containerRef.current);
    }
  }, [initialize]);

  return (
    <div>
      <div ref={containerRef} style={{ height: 500 }} />
      {portal}
    </div>
  );
}
```

---

## 문제 해결

### 모달이 나타나지 않음

1. `ModalProvider`가 앱 루트에 있는지 확인
2. (수동 모드의 경우) `initialize()`가 호출되었는지 확인
3. z-index와 CSS 충돌이 없는지 확인

### 모달이 닫히지 않음

1. `manualDestroy` 옵션 확인
2. `closeOnBackdropClick` 설정 확인
3. `onClose` 또는 `onConfirm`이 호출되고 있는지 확인

### 애니메이션이 작동하지 않음

1. `useModalAnimation` 훅이 올바르게 사용되었는지 확인
2. CSS transition 속성 확인
3. Provider의 `duration` 옵션 확인

### prompt 타입 오류

1. 제네릭 타입 지정: `prompt<string>(...)`
2. `defaultValue`가 타입과 일치하는지 확인
3. `onChange` 핸들러 타입 확인

---

## 모범 사례

1. **루트에 ModalProvider 배치**: 전체 앱을 래핑하세요
2. **컴포넌트에서 useModal 사용 권장**: 자동 정리를 위해
3. **유틸리티에는 정적 API 사용**: 비컴포넌트 코드에서
4. **Provider 레벨에서 커스터마이징**: 전역 스타일을 한 번만 설정
5. **의미론적으로 subtype 사용**: info, success, warning, error
6. **Promise 적절히 처리**: 항상 await 하거나 거부 처리
7. **모달 내용은 간단하게**: 모달 내 복잡한 상태 피하기
8. **접근성 테스트**: 키보드 네비게이션 확인
9. **AbortSignal 활용**: 프로그래밍 방식으로 모달을 닫아야 할 때
