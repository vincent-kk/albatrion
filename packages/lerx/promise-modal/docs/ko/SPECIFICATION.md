# @lerx/promise-modal 스펙 문서

> Promise 기반 API를 제공하는 범용 React 모달 유틸리티

## 개요

`@lerx/promise-modal`은 다음 기능을 제공하는 React 기반 범용 모달 유틸리티입니다:

- **Promise 기반 상호작용**: Alert, confirm, prompt 모달이 Promise를 반환
- **범용 사용**: React 컴포넌트 내부와 외부 모두에서 사용 가능
- **높은 커스터마이징성**: 모든 컴포넌트를 커스터마이즈 가능
- **자동 생명주기 관리**: 마운트/언마운트 및 애니메이션 자동 처리

---

## 목차

1. [설치](#설치)
2. [빠른 시작](#빠른-시작)
3. [아키텍처](#아키텍처)
4. [핵심 API](#핵심-api)
   - [alert](#alert)
   - [confirm](#confirm)
   - [prompt](#prompt)
5. [Hooks](#hooks)
   - [useModal](#usemodal)
   - [useActiveModalCount](#useactivemodalcount)
   - [useModalAnimation](#usemodalanimation)
   - [useModalDuration](#usemodalduration)
   - [useDestroyAfter](#usedestroyafter)
   - [useSubscribeModal](#usesubscribemodal)
   - [useInitializeModal](#useinitializemodal)
   - [useModalOptions](#usemodaloptions)
   - [useModalBackdrop](#usemodalbackdrop)
6. [컴포넌트](#컴포넌트)
   - [ModalProvider](#modalprovider)
   - [커스텀 컴포넌트](#커스텀-컴포넌트)
7. [타입 정의](#타입-정의)
8. [사용 패턴](#사용-패턴)
9. [고급 예제](#고급-예제)
10. [AbortSignal 지원](#abortsignal-지원)

---

## 설치

```bash
# yarn 사용
yarn add @lerx/promise-modal

# npm 사용
npm install @lerx/promise-modal
```

### 피어 의존성

- React 18-19
- React DOM 18-19

### 호환성

- Node.js 16.11.0 이상
- 최신 브라우저 (Chrome 94+, Firefox 93+, Safari 15+)

---

## 빠른 시작

### 1. Provider 설정

```tsx
import { ModalProvider } from '@lerx/promise-modal';

function App() {
  return (
    <ModalProvider>
      <YourApp />
    </ModalProvider>
  );
}
```

### 2. 모달 함수 사용

```tsx
import { alert, confirm, prompt } from '@lerx/promise-modal';

// 알림
await alert({
  title: '알림',
  content: '작업이 완료되었습니다.',
});

// 확인
const result = await confirm({
  title: '확인',
  content: '계속하시겠습니까?',
});

// 입력
const name = await prompt<string>({
  title: '이름 입력',
  defaultValue: '',
  Input: ({ value, onChange }) => (
    <input value={value} onChange={(e) => onChange(e.target.value)} />
  ),
});
```

---

## 아키텍처

### 계층 구조

```
┌─────────────────────────────────────────────────────────────┐
│                     애플리케이션                             │
├─────────────────────────────────────────────────────────────┤
│  Core API 계층                                              │
│  ├── alert()                                                │
│  ├── confirm()                                              │
│  └── prompt()                                               │
├─────────────────────────────────────────────────────────────┤
│  Application 계층                                           │
│  └── ModalManager (싱글톤)                                   │
│      ├── DOM 앵커링                                          │
│      ├── 스타일 주입                                         │
│      └── 모달 생명주기                                       │
├─────────────────────────────────────────────────────────────┤
│  Bootstrap 계층                                             │
│  └── ModalProvider                                          │
│      ├── 초기화                                             │
│      └── 컴포넌트 설정                                       │
├─────────────────────────────────────────────────────────────┤
│  Provider 계층                                              │
│  ├── ModalManagerContext                                    │
│  ├── ConfigurationContext                                   │
│  └── UserDefinedContext                                     │
├─────────────────────────────────────────────────────────────┤
│  Component 계층                                             │
│  ├── Anchor                                                 │
│  ├── Background                                             │
│  ├── Foreground                                             │
│  └── Fallback Components                                    │
└─────────────────────────────────────────────────────────────┘
```

### 디자인 패턴

| 패턴 | 용도 |
|------|------|
| **Promise 기반 API** | 모달 함수가 Promise 반환 |
| **Provider 패턴** | 설정을 위한 Context providers |
| **Factory 패턴** | 모달 타입을 위한 Node factory |
| **Observer 패턴** | 상태를 위한 구독 시스템 |
| **Singleton 패턴** | 전역 상태를 위한 ModalManager |

### 모달 노드 시스템

```
AbstractNode (기본 클래스)
├── AlertNode    → 간단한 알림
├── ConfirmNode  → 예/아니오 확인
└── PromptNode   → 입력 수집
```

각 노드가 제공하는 기능:
- 구독 기반 상태 관리
- Promise 해결 처리
- 생명주기 관리

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

#### 예제

```typescript
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

---

## 핵심 API

### alert

간단한 알림 모달을 엽니다.

#### 시그니처

```typescript
function alert<B = any>(options: AlertProps<B>): Promise<void>;
```

#### 매개변수

| 옵션 | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `title` | `ReactNode` | - | 모달 제목 |
| `subtitle` | `ReactNode` | - | 제목 아래 부제목 |
| `content` | `ReactNode \| ComponentType<AlertContentProps>` | - | 모달 내용 |
| `subtype` | `'info' \| 'success' \| 'warning' \| 'error'` | `'info'` | 모달 타입 |
| `dimmed` | `boolean` | `true` | 배경 어둡게 |
| `closeOnBackdropClick` | `boolean` | `true` | 배경 클릭 시 닫기 |
| `manualDestroy` | `boolean` | `false` | 수동 제거 모드 |
| `duration` | `number \| string` | - | 애니메이션 지속 시간 (Handler 레벨 오버라이드) |
| `background` | `ModalBackground<B>` | - | 배경 설정 |
| `footer` | `AlertFooterRender \| FooterOptions \| false` | - | 푸터 설정 |
| `ForegroundComponent` | `ComponentType<ModalFrameProps>` | - | 커스텀 전경 |
| `BackgroundComponent` | `ComponentType<ModalFrameProps>` | - | 커스텀 배경 |
| `signal` | `AbortSignal` | - | 모달 취소를 위한 AbortSignal |

#### 예제

```typescript
await alert({
  title: '성공',
  content: '변경사항이 저장되었습니다.',
  subtype: 'success',
  footer: { confirm: '확인' },
});
```

---

### confirm

사용자 결정을 위한 확인 모달을 엽니다.

#### 시그니처

```typescript
function confirm<B = any>(options: ConfirmProps<B>): Promise<boolean>;
```

#### 매개변수

`alert`의 모든 옵션 포함, 추가:

| 옵션 | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `footer` | `ConfirmFooterRender \| FooterOptions \| false` | - | 푸터 설정 |

#### confirm용 FooterOptions

```typescript
interface FooterOptions {
  confirm?: string;     // 확인 버튼 텍스트
  cancel?: string;      // 취소 버튼 텍스트
  hideConfirm?: boolean; // 확인 버튼 숨김
  hideCancel?: boolean;  // 취소 버튼 숨김
}
```

#### 반환값

- `true` - 사용자가 확인 버튼 클릭
- `false` - 사용자가 취소 또는 배경 클릭

#### 예제

```typescript
const shouldDelete = await confirm({
  title: '항목 삭제',
  content: '이 작업은 되돌릴 수 없습니다.',
  subtype: 'warning',
  footer: {
    confirm: '삭제',
    cancel: '취소',
  },
});

if (shouldDelete) {
  await deleteItem();
}
```

---

### prompt

사용자 입력을 수집하는 프롬프트 모달을 엽니다.

#### 시그니처

```typescript
function prompt<T, B = any>(options: PromptProps<T, B>): Promise<T>;
```

#### 매개변수

`alert`의 모든 옵션 포함, 추가:

| 옵션 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `Input` | `(props: PromptInputProps<T>) => ReactNode` | 예 | 입력 컴포넌트 |
| `defaultValue` | `T` | 아니오 | 기본값 |
| `disabled` | `(value: T) => boolean` | 아니오 | 확인 버튼 비활성화 |
| `returnOnCancel` | `boolean` | 아니오 | 취소 시 기본값 반환 |

#### PromptInputProps

```typescript
interface PromptInputProps<T> {
  value?: T;                              // 현재 값
  defaultValue?: T;                       // 기본값
  onChange: (value: T | undefined) => void; // 값 변경 핸들러
  onConfirm: () => void;                  // 확인 핸들러
  onCancel: () => void;                   // 취소 핸들러
  context: any;                           // 사용자 정의 context
}
```

#### 예제

```typescript
// 간단한 입력
const email = await prompt<string>({
  title: '이메일 입력',
  defaultValue: '',
  Input: ({ value, onChange }) => (
    <input
      type="email"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  ),
  disabled: (value) => !value?.includes('@'),
});

// 복잡한 객체
interface UserData {
  name: string;
  age: number;
}

const userData = await prompt<UserData>({
  title: '사용자 정보',
  defaultValue: { name: '', age: 0 },
  Input: ({ value, onChange }) => (
    <form>
      <input
        value={value.name}
        onChange={(e) => onChange({ ...value, name: e.target.value })}
        placeholder="이름"
      />
      <input
        type="number"
        value={value.age}
        onChange={(e) => onChange({ ...value, age: Number(e.target.value) })}
        placeholder="나이"
      />
    </form>
  ),
});
```

---

## Hooks

### useModal

컴포넌트 생명주기에 연결된 모달 핸들러를 반환합니다.

```typescript
function useModal(config?: Partial<ModalOptions>): {
  alert: typeof alert;
  confirm: typeof confirm;
  prompt: typeof prompt;
};
```

#### 핵심 기능

컴포넌트가 언마운트될 때 모달이 자동으로 정리됩니다.

#### 비교

| 기능 | 정적 함수 | useModal 훅 |
|------|----------|------------|
| 생명주기 | 독립적 | 컴포넌트에 연결 |
| 정리 | 수동 | 자동 |
| 사용 위치 | 어디서나 | 컴포넌트 내부 |

#### 예제

```typescript
function DeleteButton({ id }) {
  const modal = useModal();

  const handleDelete = async () => {
    if (await modal.confirm({ content: '삭제하시겠습니까?' })) {
      await deleteItem(id);
    }
  };

  return <button onClick={handleDelete}>삭제</button>;
}
```

---

### useActiveModalCount

활성 모달의 개수를 반환합니다.

```typescript
function useActiveModalCount(
  validate?: (modal?: ModalNode) => boolean,
  refreshKey?: string | number
): number;
```

#### 매개변수

| 매개변수 | 타입 | 설명 |
|----------|------|------|
| `validate` | `(modal) => boolean` | 필터 함수 |
| `refreshKey` | `string \| number` | 강제 새로고침 키 |

#### 예제

```typescript
function ModalCounter() {
  const total = useActiveModalCount();
  const alerts = useActiveModalCount((m) => m?.type === 'alert');

  return <div>전체: {total}, 알림: {alerts}</div>;
}
```

---

### useModalAnimation

애니메이션 상태 콜백을 제공합니다.

```typescript
function useModalAnimation(
  visible: boolean,
  options: {
    onVisible?: () => void;
    onHidden?: () => void;
  }
): void;
```

#### 특징

- 최적의 타이밍을 위해 `requestAnimationFrame` 사용
- 진입/퇴장 애니메이션 분리
- CSS 트랜지션과 함께 작동

#### 예제

```typescript
function AnimatedModal({ visible, children }) {
  const ref = useRef<HTMLDivElement>(null);

  useModalAnimation(visible, {
    onVisible: () => {
      ref.current?.classList.add('fade-in');
    },
    onHidden: () => {
      ref.current?.classList.remove('fade-in');
    },
  });

  return <div ref={ref}>{children}</div>;
}
```

---

### useModalDuration

모달 애니메이션 지속 시간을 반환합니다.

```typescript
function useModalDuration(modalId?: number): {
  duration: string;      // 예: '300ms'
  milliseconds: number;  // 예: 300
};
```

---

### useDestroyAfter

지정된 시간 후 모달을 자동으로 제거합니다.

```typescript
function useDestroyAfter(
  modalId: number,
  duration: string | number
): void;
```

#### 동작

- 모달이 숨겨지면 타이머 시작
- 모달이 다시 보이면 타이머 취소
- 지속 시간 후 DOM에서 모달 제거

#### 예제

```typescript
function ToastMessage({ id }) {
  useDestroyAfter(id, 300); // 숨겨진 후 300ms 후 제거
  return <div>토스트</div>;
}
```

---

### useSubscribeModal

모달 상태 변경을 구독합니다.

```typescript
function useSubscribeModal(modal?: ModalNode): number;
```

#### 반환값

각 상태 변경 시 증가하는 버전 번호.

#### 예제

```typescript
function ModalDebugger({ modal }) {
  const version = useSubscribeModal(modal);

  useEffect(() => {
    console.log('상태 변경:', modal?.visible);
  }, [version]);
}
```

---

### useInitializeModal

모달 서비스를 수동으로 초기화합니다.

```typescript
function useInitializeModal(options?: {
  mode?: 'auto' | 'manual';
}): {
  initialize: (anchor?: HTMLElement) => void;
  portal: ReactPortal | null;
};
```

#### 모드

| 모드 | 설명 |
|------|------|
| `auto` | 자동 초기화 |
| `manual` | `initialize()` 호출 필요 |

---

### useModalOptions

모달 옵션 설정을 반환합니다.

```typescript
function useModalOptions(): ModalOptions;
```

#### 반환값

```typescript
interface ModalOptions {
  duration?: number | string;     // 애니메이션 지속 시간
  backdrop?: string;              // 배경 오버레이 색상
  manualDestroy?: boolean;        // 수동 제거 모드
  closeOnBackdropClick?: boolean; // 배경 클릭 시 닫기
  zIndex?: number;                // CSS z-index
}
```

#### 예제

```typescript
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

### useModalBackdrop

모달 배경 설정만 반환합니다.

```typescript
function useModalBackdrop(): string | CSSProperties;
```

#### 예제

```typescript
function BackdropInfo() {
  const backdrop = useModalBackdrop();

  return <p>현재 배경: {backdrop}</p>;
}
```

---

## 컴포넌트

### ModalProvider

초기화를 위한 메인 Provider 컴포넌트입니다.

```typescript
interface ModalProviderProps {
  children: ReactNode;
  ForegroundComponent?: ComponentType<ModalFrameProps>;
  BackgroundComponent?: ComponentType<ModalFrameProps>;
  TitleComponent?: ComponentType<WrapperComponentProps>;
  SubtitleComponent?: ComponentType<WrapperComponentProps>;
  ContentComponent?: ComponentType<WrapperComponentProps>;
  FooterComponent?: ComponentType<FooterComponentProps>;
  options?: ModalOptions;
  context?: Record<string, any>;
  usePathname?: () => { pathname: string };  // 라우터 통합
  root?: HTMLElement;                        // 커스텀 루트 엘리먼트
}
```

#### ModalOptions

```typescript
interface ModalOptions {
  duration?: number | string;     // 애니메이션 지속 시간
  backdrop?: string;              // 배경 오버레이 색상
  manualDestroy?: boolean;        // 수동 제거 모드
  closeOnBackdropClick?: boolean; // 배경 클릭 시 닫기
}
```

#### usePathname (라우터 통합)

`usePathname` prop을 사용하면 라우터와 통합할 수 있습니다. 경로가 변경되면 모달이 자동으로 닫힙니다.

```typescript
import { useLocation } from 'react-router-dom';

<ModalProvider
  usePathname={useLocation}  // react-router-dom 통합
  // ...
>
  <App />
</ModalProvider>
```

#### 예제

```typescript
import { useLocation } from 'react-router-dom';

<ModalProvider
  usePathname={useLocation}
  ForegroundComponent={CustomForeground}
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
    theme: 'dark',
    locale: 'ko-KR',
  }}
>
  <App />
</ModalProvider>
```

---

### 커스텀 컴포넌트

#### ModalFrameProps

Foreground/Background 컴포넌트에 전달되는 Props입니다.

```typescript
interface ModalFrameProps<Context = any, B = any> {
  id: number;                        // 모달 ID
  type: 'alert' | 'confirm' | 'prompt'; // 모달 타입
  alive: boolean;                    // 활성 상태
  visible: boolean;                  // 표시 상태
  initiator: string;                 // 초기화 출처
  manualDestroy: boolean;            // 수동 제거 모드
  closeOnBackdropClick: boolean;     // 배경 클릭 닫기
  background?: ModalBackground<B>;   // 배경 데이터
  onConfirm: () => void;             // 확인 핸들러
  onClose: () => void;               // 닫기 핸들러
  onChange: (value: any) => void;    // 값 변경 핸들러
  onDestroy: () => void;             // 제거 핸들러
  onChangeOrder: Function;           // 순서 변경 핸들러
  context: Context;                  // 사용자 정의 context
  children: ReactNode;               // 자식 요소
}
```

#### FooterComponentProps

푸터 컴포넌트용 Props입니다.

```typescript
interface FooterComponentProps {
  type: 'alert' | 'confirm' | 'prompt'; // 모달 타입
  onConfirm: (value?: any) => void;     // 확인 핸들러
  onClose: () => void;                  // 닫기 핸들러
  onCancel?: () => void;                // 취소 핸들러
  disabled?: boolean;                   // 비활성화 상태
  footer?: FooterOptions;               // 푸터 옵션
  context: any;                         // 사용자 정의 context
}
```

#### WrapperComponentProps

title/subtitle/content 컴포넌트용 Props입니다.

```typescript
interface WrapperComponentProps {
  children: ReactNode;  // 자식 요소
  context: any;         // 사용자 정의 context
}
```

#### 커스텀 컴포넌트 예제

```typescript
const CustomForeground: FC<ModalFrameProps> = ({
  id,
  visible,
  children,
  onClose,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const { duration } = useModalDuration();

  useModalAnimation(visible, {
    onVisible: () => ref.current?.classList.add('visible'),
    onHidden: () => ref.current?.classList.remove('visible'),
  });

  useDestroyAfter(id, duration);

  return (
    <div
      ref={ref}
      style={{
        background: 'white',
        borderRadius: 12,
        padding: 24,
        opacity: 0,
        transition: `opacity ${duration}ms`,
      }}
    >
      {children}
    </div>
  );
};
```

---

## 타입 정의

### 모달 타입

```typescript
type ModalType = 'alert' | 'confirm' | 'prompt';
type ModalSubtype = 'info' | 'success' | 'warning' | 'error';
```

### ModalBackground

```typescript
interface ModalBackground<T = any> {
  data?: T;
  [key: string]: any;
}
```

### Content Props

```typescript
// Alert 컨텐츠 Props
interface AlertContentProps {
  onConfirm: () => void;
  context: any;
}

// Confirm 컨텐츠 Props
interface ConfirmContentProps {
  onConfirm: () => void;
  onCancel: () => void;
  context: any;
}

// Prompt 컨텐츠 Props
interface PromptContentProps<T> {
  value?: T;
  onChange: (value: T) => void;
  onConfirm: () => void;
  onCancel: () => void;
  context: any;
}
```

---

## 사용 패턴

### 패턴 1: 정적 API (가장 간단)

```typescript
import { alert, confirm, prompt } from '@lerx/promise-modal';

// React 외부에서도 사용 가능
async function handleSubmit() {
  if (await confirm({ content: '변경사항을 저장하시겠습니까?' })) {
    await saveData();
    await alert({ content: '저장되었습니다!' });
  }
}
```

### 패턴 2: useModal 훅 (컴포넌트에 권장)

```typescript
function EditForm() {
  const modal = useModal();

  const handleSave = async () => {
    if (await modal.confirm({ content: '저장하시겠습니까?' })) {
      // 컴포넌트 언마운트 시 모달 자동 정리
    }
  };
}
```

### 패턴 3: 전체 커스터마이징

```typescript
<ModalProvider
  ForegroundComponent={CustomForeground}
  FooterComponent={CustomFooter}
  options={{ duration: 400 }}
  context={{ theme: 'dark' }}
>
  <App />
</ModalProvider>
```

### 패턴 4: 개별 모달 오버라이드

```typescript
await alert({
  content: '특별한 모달',
  ForegroundComponent: SpecialForeground,
  background: { variant: 'special' },
});
```

---

## 고급 예제

### 토스트 알림

```typescript
const ToastForeground: FC<ModalFrameProps> = ({
  id,
  visible,
  children,
  onClose,
}) => {
  const ref = useRef<HTMLDivElement>(null);
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
        transform: 'translateX(-50%) translateY(100px)',
        opacity: 0,
        transition: `all ${duration}ms`,
      }}
    >
      {children}
    </div>
  );
};

export const toast = (message: ReactNode) => {
  return alert({
    content: message,
    ForegroundComponent: ToastForeground,
    footer: false,
    dimmed: false,
    closeOnBackdropClick: false,
  });
};

// 사용
toast('작업이 완료되었습니다!');
```

### 다단계 마법사

```typescript
async function registrationWizard() {
  // 1단계: 약관 동의
  const accepted = await confirm({
    title: '이용약관',
    content: <TermsContent />,
    footer: { confirm: '동의합니다', cancel: '거부' },
  });

  if (!accepted) return null;

  // 2단계: 사용자 정보
  const userInfo = await prompt<{
    name: string;
    email: string;
  }>({
    title: '사용자 정보',
    defaultValue: { name: '', email: '' },
    Input: RegistrationForm,
    disabled: (v) => !v.name || !v.email?.includes('@'),
  });

  if (!userInfo) return null;

  // 3단계: 완료
  await alert({
    title: '환영합니다!',
    content: `${userInfo.name}님의 계정이 생성되었습니다`,
    subtype: 'success',
  });

  return userInfo;
}
```

### 커스텀 앵커 (Iframe/Portal)

```typescript
function IframedModals() {
  const { initialize } = useInitializeModal({ mode: 'manual' });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      initialize(containerRef.current);
    }
  }, [initialize]);

  return (
    <div style={{ position: 'relative', height: 600 }}>
      <div ref={containerRef} style={{ height: '100%' }} />
      <ModalTriggerButtons />
    </div>
  );
}
```

---

## 생명주기

```
생성 → 표시 → 숨김 → 제거
  ↓      ↓      ↓      ↓
open()  visible onHide  onDestroy
  ↓     true     ↓       ↓
nodeFactory ↓  visible   alive
  ↓         ↓   false    false
Promise  animation ↓        ↓
  ↓      starts  duration  DOM에서
 ...        ↓    passes    제거됨
            ↓       ↓
        interaction destroy
            ↓
          resolve
```

---

## 모범 사례

1. **앱 루트에 ModalProvider 배치** - 최상위 레벨에 Provider 래핑
2. **컴포넌트 내에서는 useModal 사용** - 자동 정리를 위해
3. **유틸리티에는 정적 API 사용** - React 외부 코드에서
4. **Provider 레벨에서 커스터마이징** - 일관된 스타일링을 위해
5. **의미론적으로 subtype 사용** - info, success, warning, error
6. **항상 await 또는 처리** - Promise 거부 처리
7. **모달 내용은 간단하게** - 복잡한 상태 피하기
8. **접근성 테스트** - 키보드 네비게이션 확인

---

## AbortSignal 지원

모달을 프로그래밍 방식으로 취소할 수 있는 `AbortSignal` 지원을 제공합니다.

### 기본 사용법

```typescript
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

### 수동 취소 제어

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
      <button onClick={handleOpen} disabled={!!controller}>
        모달 열기
      </button>
      <button onClick={handleAbort} disabled={!controller}>
        모달 취소
      </button>
    </div>
  );
}
```

### 여러 모달 일괄 취소

```typescript
function MultipleModalsAbort() {
  const [controllers, setControllers] = useState<AbortController[]>([]);

  const handleOpenMultiple = () => {
    const newControllers: AbortController[] = [];

    for (let i = 0; i < 3; i++) {
      const controller = new AbortController();
      newControllers.push(controller);

      alert({
        title: `모달 ${i + 1}`,
        content: `이것은 ${i + 1}번째 모달입니다.`,
        signal: controller.signal,
        closeOnBackdropClick: false,
      });
    }

    setControllers(newControllers);
  };

  const handleAbortAll = () => {
    controllers.forEach((controller) => controller.abort());
    setControllers([]);
  };

  return (
    <div>
      <button onClick={handleOpenMultiple}>3개 모달 열기</button>
      <button onClick={handleAbortAll}>모든 모달 취소</button>
    </div>
  );
}
```

### 이미 취소된 Signal 처리

```typescript
// Signal이 이미 취소된 상태로 전달되면 모달이 즉시 닫힙니다
const controller = new AbortController();
controller.abort(); // 먼저 취소

alert({
  title: '즉시 닫힘',
  content: 'Signal이 이미 취소되어 즉시 닫힙니다.',
  signal: controller.signal,
}).then(() => {
  console.log('모달이 즉시 닫혔습니다.');
});
```

---

## 라이선스

MIT License

---

## 버전

현재: package.json 참조
