# Promise Modal 가이드 명령어

## 목적

이 명령어는 `@lerx/promise-modal` 라이브러리 사용자를 위한 대화형 Q&A 가이드를 제공합니다. 호출되면 사용자의 구체적인 질문과 사용 사례에 따라 라이브러리를 이해하고 효과적으로 사용할 수 있도록 도와주세요.

## 활성화

이 명령어는 사용자가 다음과 같은 경우에 사용해야 합니다:
- `@lerx/promise-modal`에 대해 질문할 때
- 모달 구현에 도움이 필요할 때
- 특정 API 사용법을 이해하고 싶을 때
- 라이브러리 관련 문제가 발생했을 때
- 특정 시나리오에 대한 코드 예제가 필요할 때

## 응답 전략

### 1단계: 질문 카테고리 식별

사용자의 질문을 다음 중 하나로 분류합니다:

1. **시작하기** - 설치, 설정, 기본 사용법
2. **API 사용법** - 특정 함수/훅 사용법
3. **커스터마이징** - 커스텀 컴포넌트, 스타일링, 테마
4. **고급 패턴** - 토스트, 중첩 모달, 애니메이션, AbortSignal
5. **문제 해결** - 오류 해결, 디버깅

### 2단계: 구조화된 응답 제공

각 카테고리에 대해 다음 응답 패턴을 따릅니다:

---

## 카테고리: 시작하기

### 관련 질문:
- "promise-modal을 어떻게 설치하나요?"
- "Provider는 어떻게 설정하나요?"
- "기본 사용법은 무엇인가요?"

### 응답 템플릿:

```markdown
## 설치

```bash
yarn add @lerx/promise-modal
# 또는
npm install @lerx/promise-modal
```

## 기본 설정

1. 앱을 ModalProvider로 래핑합니다:

```tsx
import { ModalProvider } from '@lerx/promise-modal';
import { useLocation } from 'react-router-dom'; // 선택적 라우터 통합

function App() {
  return (
    <ModalProvider
      usePathname={useLocation}  // 라우터 통합 (경로 변경 시 모달 자동 닫힘)
      options={{
        duration: '200ms',
        backdrop: 'rgba(0, 0, 0, 0.35)',
        manualDestroy: true,
      }}
    >
      <YourApp />
    </ModalProvider>
  );
}
```

2. 어디서든 모달 함수를 사용합니다:

```tsx
import { alert, confirm, prompt } from '@lerx/promise-modal';

// 간단한 알림
await alert({ title: '알림', content: '안녕하세요!' });

// 확인
const result = await confirm({ title: '확인', content: '계속하시겠습니까?' });

// 사용자 입력
const value = await prompt<string>({
  title: '입력',
  defaultValue: '',
  Input: ({ value, onChange }) => (
    <input value={value} onChange={(e) => onChange(e.target.value)} />
  ),
});
```
```

---

## 카테고리: API 사용법

### `alert` 질문:

```markdown
## alert() API

간단한 알림 모달을 엽니다.

**시그니처:**
```typescript
alert(options: AlertProps): Promise<void>
```

**주요 옵션:**
- `title`: 모달 제목 (ReactNode)
- `content`: 모달 내용 (ReactNode 또는 Component)
- `subtype`: 'info' | 'success' | 'warning' | 'error'
- `dimmed`: 배경 어둡게 처리 (boolean)
- `closeOnBackdropClick`: 배경 클릭 시 닫기 (boolean)
- `signal`: 모달 취소용 AbortSignal

**예제:**
```tsx
await alert({
  title: '성공',
  content: '작업이 완료되었습니다!',
  subtype: 'success',
  dimmed: true,
});
```
```

### `confirm` 질문:

```markdown
## confirm() API

예/아니오 옵션이 있는 확인 모달을 엽니다.

**시그니처:**
```typescript
confirm(options: ConfirmProps): Promise<boolean>
```

**반환값:**
- `true` - 사용자가 확인 클릭
- `false` - 사용자가 취소 또는 배경 클릭

**예제:**
```tsx
const shouldDelete = await confirm({
  title: '항목 삭제',
  content: '정말 삭제하시겠습니까?',
  footer: {
    confirm: '삭제',
    cancel: '취소',
  },
});

if (shouldDelete) {
  // 삭제 수행
}
```
```

### `prompt` 질문:

```markdown
## prompt<T>() API

사용자 입력을 수집하는 모달을 엽니다.

**시그니처:**
```typescript
prompt<T>(options: PromptProps<T>): Promise<T>
```

**주요 옵션:**
- `Input`: 커스텀 입력 컴포넌트 (필수)
- `defaultValue`: 초기값
- `disabled`: 확인 버튼 비활성화 함수

**간단한 예제:**
```tsx
const name = await prompt<string>({
  title: '이름 입력',
  defaultValue: '',
  Input: ({ value, onChange }) => (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  ),
  disabled: (value) => value.trim() === '',
});
```

**복잡한 데이터 예제:**
```tsx
interface UserData {
  name: string;
  email: string;
}

const userData = await prompt<UserData>({
  title: '사용자 정보',
  defaultValue: { name: '', email: '' },
  Input: ({ value, onChange }) => (
    <form>
      <input
        value={value.name}
        onChange={(e) => onChange({ ...value, name: e.target.value })}
        placeholder="이름"
      />
      <input
        value={value.email}
        onChange={(e) => onChange({ ...value, email: e.target.value })}
        placeholder="이메일"
      />
    </form>
  ),
});
```
```

### `useModal` 질문:

```markdown
## useModal() 훅

컴포넌트 생명주기에 연결된 모달 핸들러를 반환합니다.

**핵심 기능:** 컴포넌트 언마운트 시 자동 정리.

**예제:**
```tsx
import { useModal } from '@lerx/promise-modal';

function MyComponent() {
  const modal = useModal();

  const handleAction = async () => {
    // 컴포넌트가 언마운트되면 이 모달들이 자동으로 닫힙니다
    if (await modal.confirm({ content: '진행하시겠습니까?' })) {
      await modal.alert({ content: '완료!' });
    }
  };

  return <button onClick={handleAction}>실행</button>;
}
```

**설정과 함께 사용:**
```tsx
const modal = useModal({
  ForegroundComponent: CustomForeground,
  dimmed: true,
  duration: 300,
});
```
```

---

## 카테고리: 설정 우선순위

```markdown
## 설정 우선순위

설정은 계층적으로 적용됩니다:

```
Provider 설정 (최하위) < Hook 설정 < Handler 설정 (최상위)
```

**예제:**
```tsx
// Provider 레벨: 전역 기본값
<ModalProvider options={{ duration: '500ms', closeOnBackdropClick: true }}>
  <App />
</ModalProvider>

// Hook 레벨: 컴포넌트 기본값 (Provider 설정을 덮어씀)
const modal = useModal({
  ForegroundComponent: CustomForeground,
});

// Handler 레벨: 개별 모달 (Hook 설정을 덮어씀)
modal.alert({
  title: '알림',
  duration: 200, // 500ms → 200ms로 오버라이드
  ForegroundComponent: SpecialForeground, // CustomForeground 오버라이드
});
```
```

---

## 카테고리: 커스터마이징

### 컴포넌트 커스터마이징 질문:

```markdown
## 커스텀 컴포넌트

### 커스텀 Foreground

```tsx
const CustomForeground = ({ children, visible, id }) => {
  const ref = useRef(null);
  const { duration } = useModalDuration();

  useModalAnimation(visible, {
    onVisible: () => ref.current?.classList.add('active'),
    onHidden: () => ref.current?.classList.remove('active'),
  });

  useDestroyAfter(id, duration);

  return (
    <div
      ref={ref}
      style={{
        background: 'white',
        borderRadius: 12,
        padding: 24,
        maxWidth: 500,
      }}
    >
      {children}
    </div>
  );
};

// Provider에서 사용
<ModalProvider ForegroundComponent={CustomForeground}>
  <App />
</ModalProvider>

// 또는 개별 모달에서 사용
alert({
  content: '안녕하세요',
  ForegroundComponent: CustomForeground,
});
```

### 커스텀 Footer

```tsx
const CustomFooter = ({ onConfirm, onClose, type, disabled }) => (
  <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
    {type !== 'alert' && (
      <button onClick={onClose}>취소</button>
    )}
    <button onClick={() => onConfirm()} disabled={disabled}>
      확인
    </button>
  </div>
);
```
```

### 스타일링/테마 질문:

```markdown
## Context를 사용한 테마

```tsx
<ModalProvider
  context={{
    theme: 'dark',
    primaryColor: '#007bff',
  }}
>
  <App />
</ModalProvider>

// 커스텀 컴포넌트에서 접근
const CustomTitle = ({ children, context }) => (
  <h2 style={{ color: context.theme === 'dark' ? '#fff' : '#333' }}>
    {children}
  </h2>
);
```
```

---

## 카테고리: 고급 패턴

### AbortSignal 질문:

```markdown
## AbortSignal을 사용한 모달 취소

프로그래밍 방식으로 모달을 취소할 수 있습니다.

**기본 사용법:**
```tsx
const controller = new AbortController();

alert({
  title: '취소 가능한 모달',
  content: '3초 후 자동으로 닫힙니다.',
  signal: controller.signal,
});

// 3초 후 모달 취소
setTimeout(() => {
  controller.abort();
}, 3000);
```

**수동 취소 제어:**
```tsx
function ManualAbortControl() {
  const [controller, setController] = useState<AbortController | null>(null);

  const handleOpen = () => {
    const newController = new AbortController();
    setController(newController);

    alert({
      title: '수동 취소',
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

**여러 모달 일괄 취소:**
```tsx
const controllers: AbortController[] = [];

for (let i = 0; i < 3; i++) {
  const controller = new AbortController();
  controllers.push(controller);

  alert({
    title: `모달 ${i + 1}`,
    signal: controller.signal,
  });
}

// 모든 모달 취소
controllers.forEach((c) => c.abort());
```
```

### 토스트 구현 질문:

```markdown
## 토스트 구현

```tsx
import { alert, useModalAnimation, useDestroyAfter, useModalDuration } from '@lerx/promise-modal';

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

  return (
    <div
      ref={ref}
      style={{
        position: 'fixed',
        bottom: 20,
        left: '50%',
        transform: 'translateX(-50%)',
        background: '#333',
        color: 'white',
        padding: '12px 24px',
        borderRadius: 8,
        opacity: 0,
        transition: 'opacity 300ms',
      }}
      className={visible ? 'visible' : ''}
    >
      {children}
    </div>
  );
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

// 사용
toast('작업이 성공적으로 완료되었습니다!');
```
```

### 중첩 모달 질문:

```markdown
## 중첩 모달

```tsx
async function multiStepWizard() {
  // 1단계: 확인
  const proceed = await confirm({
    title: '마법사 시작',
    content: '설정 과정을 안내해 드립니다.',
  });

  if (!proceed) return;

  // 2단계: 사용자 입력
  const username = await prompt<string>({
    title: '1단계: 사용자명',
    defaultValue: '',
    Input: ({ value, onChange }) => (
      <input value={value} onChange={(e) => onChange(e.target.value)} />
    ),
  });

  if (!username) return;

  // 3단계: 확인 및 완료
  const confirmed = await confirm({
    title: '2단계: 확인',
    content: `"${username}" 계정을 생성하시겠습니까?`,
  });

  if (confirmed) {
    await alert({
      title: '완료!',
      content: `환영합니다, ${username}님!`,
      subtype: 'success',
    });
  }
}
```
```

### 커스텀 앵커 질문:

```markdown
## 커스텀 모달 앵커

```tsx
import { ModalProvider, useInitializeModal, alert } from '@lerx/promise-modal';

function CustomAnchorExample() {
  const { initialize } = useInitializeModal({ mode: 'manual' });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      initialize(containerRef.current);
    }
  }, [initialize]);

  return (
    <div>
      {/* 모달이 이 컨테이너 안에 렌더링됩니다 */}
      <div
        ref={containerRef}
        style={{
          position: 'relative',
          width: '100%',
          height: 500,
          overflow: 'hidden',
        }}
      />
      <button onClick={() => alert({ content: '커스텀 컨테이너 안에 있습니다!' })}>
        모달 표시
      </button>
    </div>
  );
}
```
```

---

## 카테고리: 문제 해결

### 일반적인 문제:

```markdown
## 문제 해결 가이드

### 모달이 나타나지 않음

**원인 1:** ModalProvider 누락
```tsx
// ❌ 잘못됨
function App() {
  return <MyApp />;
}

// ✅ 올바름
function App() {
  return (
    <ModalProvider>
      <MyApp />
    </ModalProvider>
  );
}
```

**원인 2:** z-index 충돌
```css
/* 모달이 가장 높은 z-index를 갖도록 확인 */
.modal-container {
  z-index: 9999;
}
```

### 모달이 닫히지 않음

**원인 1:** manualDestroy가 true
```tsx
// 모달이 자동으로 닫히지 않음
alert({ content: '안녕', manualDestroy: true });

// onDestroy를 수동으로 호출해야 함
```

**원인 2:** closeOnBackdropClick이 false
```tsx
// 배경 클릭으로 닫히지 않음
alert({ content: '안녕', closeOnBackdropClick: false });
```

### prompt TypeScript 오류

**원인:** 제네릭 타입 누락
```tsx
// ❌ 잘못됨 - TypeScript가 타입을 추론할 수 없음
const value = await prompt({ ... });

// ✅ 올바름 - 타입 지정
const value = await prompt<string>({ ... });
```

### 애니메이션이 작동하지 않음

**원인:** useModalAnimation을 사용하지 않음
```tsx
// ❌ 잘못됨 - visible을 직접 확인
if (visible) element.classList.add('show');

// ✅ 올바름 - 훅 사용
useModalAnimation(visible, {
  onVisible: () => element.classList.add('show'),
  onHidden: () => element.classList.remove('show'),
});
```
```

---

## 응답 형식

질문에 답변할 때 다음 구조를 따릅니다:

1. **간단한 답변**: 한 줄 요약
2. **코드 예제**: 작동하는 코드 스니펫
3. **설명**: 이해해야 할 핵심 포인트
4. **관련 API**: 관련 기능 링크
5. **일반적인 함정**: 피해야 할 것

---

## 예제 상호작용

**사용자**: "사용자가 필수 필드를 채울 때까지 확인 버튼을 비활성화하려면 어떻게 하나요?"

**응답**:
```markdown
`prompt()`에서 `disabled` 옵션을 사용합니다:

```tsx
const email = await prompt<string>({
  title: '이메일 입력',
  defaultValue: '',
  Input: ({ value, onChange }) => (
    <input
      type="email"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="your@email.com"
    />
  ),
  // 유효한 이메일이 될 때까지 확인 버튼 비활성화
  disabled: (value) => !value.includes('@') || value.length < 5,
});
```

**핵심 포인트:**
- `disabled`는 현재 값을 받습니다
- `true`를 반환하면 확인 버튼이 비활성화됩니다
- 사용자가 입력할 때 반응적으로 업데이트됩니다

**관련:** `PromptInputProps`, `FooterComponentProps.disabled`
```

---

## 지식 소스

이 명령어는 다음의 지식을 사용합니다:
- `/docs/claude/skills/promise-modal-expert.md` - 전체 API 레퍼런스
- `/docs/ko/SPECIFICATION.md` - 상세 스펙 문서
- `/README.md` - 공식 문서
