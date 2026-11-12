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

| 패턴                 | 용도                          |
| -------------------- | ----------------------------- |
| **Promise 기반 API** | 모달 함수가 Promise 반환      |
| **Provider 패턴**    | 설정을 위한 Context providers |
| **Factory 패턴**     | 모달 타입을 위한 Node factory |
| **Observer 패턴**    | 상태를 위한 구독 시스템       |
| **Singleton 패턴**   | 전역 상태를 위한 ModalManager |

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

### 접근성

Escape는 클릭으로 순서가 바뀐 경우를 포함하여 살아 있고 보이며 미확정인 모달 중 쌓임 순서가 가장 높은 것에 적용합니다. 그 노드의 유효 `closeOnEscape`가 true일 때만 취소하며 닫을 수 없는 최상위 모달을 건너뛰어 아래 모달을 닫지 않습니다. 순서는 호출별 `closeOnEscape`, 호출별 `closeOnBackdropClick`, Provider `closeOnEscape`, Provider `closeOnBackdropClick`(기본 true)입니다. `useModal` 기본값도 호출 데이터입니다. 명시적 undefined는 상속합니다. 기본 방지 이벤트, `isComposing`, 키 코드 229를 무시하고 root 분리 중에는 키보드 처리를 보류합니다. Escape는 일반 취소 값을 반환하며 prompt는 `returnOnCancel`을 켜지 않으면 `null`입니다.

`alive && visible && dimmed && !settled`인 모달만 포커스·inert 격리·스크롤 잠금에 참여합니다. 표시 시 첫 탭 가능 요소 또는 바깥 래퍼(`tabIndex={-1}`)로 포커스를 옮기되 `autoFocus`를 포함한 기존 내부 포커스는 유지합니다. 최상위 dimmed 모달은 `trapFocus`가 true일 때 Tab과 Shift+Tab을 순환시킵니다. Provider와 호출별 `trapFocus`·`lockScroll`은 기본 true이며 일반 undefined 상속 병합을 따릅니다. `trapFocus: false`는 순환만 끄며 최초 포커스 이동과 페이지 격리는 유지합니다.

확정 시 페이지 효과를 재평가한 뒤 연결된 열기 전 요소로 포커스를 돌립니다. 다른 미확정 모달 안에 포커스가 있으면 유지합니다. 다른 dimmed 모달 때문에 열기 전 요소가 여전히 inert이면 남은 최상위 dimmed 모달로 이동합니다. 연결이 끊긴 대상은 무시합니다. 경로 숨김·닫힘·파괴는 수동 종료 애니메이션 중에도 즉시 참여에서 빠집니다. 다시 표시하거나 초기화하면 대기 노드를 재평가합니다. 분리된(`root={null}`) 앵커는 페이지 격리나 스크롤 잠금을 수행하지 않습니다.

격리는 앵커의 조상 경로를 따라 `document.body`까지 각 단계의 형제 요소에 `inert` 속성을 겁니다. 기존 inert 속성은 유지하고 라이브러리가 추가한 속성만 제거합니다. 첫 참여 모달이 생기거나 root가 이동할 때 스냅샷을 만들며 이후 추가된 DOM은 건드리지 않아 body에 붙는 드롭다운 포털이 동작할 수 있습니다. 외부 포털은 래퍼의 Tab 순환 밖에 있으므로 사용자 프레임이 포털의 키보드 통합을 맡습니다.

참여 모달 중 `lockScroll: true`가 하나라도 있으면 body overflow를 숨깁니다. 스크롤바 너비가 0보다 크고 100px보다 작을 때만 계산된 오른쪽 패딩에 더하여 페이지 밀림을 보정합니다. 마지막 스크롤 잠금 대상이 빠지면 원래 인라인 overflow와 오른쪽 패딩(우선순위 포함)을 복원합니다. Provider 해제와 reset은 페이지 효과와 document keydown 리스너 하나를 정리합니다.

기본 전경은 `role="dialog"`와 `aria-modal="true"`를 제공합니다. 사용자 전경 프레임은 역할·접근 가능한 이름·설명을 직접 제공하고 래퍼가 포커스 기본선을 제공합니다. 모든 dialog에 이름을 지정합니다. 예를 들어 제목과 설명에 `aria-labelledby`·`aria-describedby`를 연결합니다. 보이는 배경은 `dimmed || closeOnBackdropClick`일 때 포인터를 받지만 클릭 취소는 `closeOnBackdropClick`이 켜진 경우만 수행합니다. 뒤 페이지를 클릭할 수 있는 토스트는 `dimmed: false, closeOnBackdropClick: false`로 설정하며 포커스 이동·복원·페이지 격리·스크롤 잠금에 참여하지 않습니다.

### 설정 우선순위

Provider의 컴포넌트 props(`ForegroundComponent`, `BackgroundComponent`, `TitleComponent`, `SubtitleComponent`, `ContentComponent`, `FooterComponent`)는 부모 리렌더가 열린 prompt를 재마운트하지 않도록 마운트 시점에 고정합니다. 변경은 무시하며 개발 환경에서 변경된 prop마다 한 번 경고하고 운영 환경에서는 경고하지 않습니다. 바뀌는 데이터는 `context`로 전달하며 options는 반응형으로 갱신합니다.

설정 우선순위는 기본값, Provider 옵션, `useModal(config)`, 호출 인자 순입니다. `undefined`는 상속하고 `0`과 `false`는 덮어씁니다. `useModal(config)`는 마운트 시점 기본값을 보관합니다. Provider와 모달별 `duration`은 음수가 아닌 밀리초 숫자(`300`, `0.5`), 밀리초 문자열(`'300ms'`, `'0.5ms'`), 초 문자열(`'0.3s'`)을 받습니다. 잘못된 값은 기본값으로 대체하고 개발 경고를 냅니다. 모달별 잘못된 값은 Provider 지속시간으로 대체합니다. `useModalOptions().duration`과 `useModalDuration(id?).duration`은 정규화된 밀리초 문자열을 반환하므로 CSS에 `ms`를 덧붙이지 않습니다.

`useModalOptions`, `useModalBackdrop`, `useModalDuration`, `useDestroyAfter`는 모달 프레임·내용·푸터 안에서 사용합니다. Provider의 일반 자식이나 모달 트리 밖에서 호출하면 필요한 위치를 설명하는 오류를 던집니다. `useModalBackdrop`은 CSS 속성 객체를 반환합니다. 프레임은 `group`, `subtype`, `settled`를 받고 alert 내용도 `context`를 받습니다. 애플리케이션 래퍼 타입에는 공개 `AlertProps`, `ConfirmProps`, `PromptProps`, `OverridableHandleProps`를 사용합니다. 프레임의 `onClose`와 내용·푸터의 `onCancel`은 모두 요청을 취소하며 AbortSignal도 거부가 아닌 취소 값으로 완료됩니다.

설정은 계층적으로 적용되며, 하위 레벨이 상위 레벨을 덮어씁니다:

```
Provider 설정 (최하위) < Hook 설정 < Handler 설정 (최상위)
```

| 레벨         | 위치                            | 설명               |
| ------------ | ------------------------------- | ------------------ |
| **Provider** | `ModalProvider` props           | 앱 전역 기본 설정  |
| **Hook**     | `useModal(config)`              | 컴포넌트 레벨 설정 |
| **Handler**  | `alert/confirm/prompt(options)` | 개별 모달 설정     |

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

| 옵션                   | 타입                                            | 기본값   | 설명                                           |
| ---------------------- | ----------------------------------------------- | -------- | ---------------------------------------------- |
| `title`                | `ReactNode`                                     | -        | 모달 제목                                      |
| `subtitle`             | `ReactNode`                                     | -        | 제목 아래 부제목                               |
| `content`              | `ReactNode \| ComponentType<AlertContentProps>` | -        | 모달 내용                                      |
| `subtype`              | `'info' \| 'success' \| 'warning' \| 'error'`   | `'info'` | 모달 타입                                      |
| `dimmed`               | `boolean`                                       | `true`   | 배경 어둡게                                    |
| `closeOnBackdropClick` | `boolean`                                       | `true`   | 배경 클릭 시 닫기                              |
| `closeOnEscape` | `boolean` | 상속 | Esc 취소; 접근성 절 참고 |
| `trapFocus` | `boolean` | `true` | 최상위 dimmed 모달 Tab 순환 |
| `lockScroll` | `boolean` | `true` | dimmed 모달 body 스크롤 잠금 |
| `manualDestroy`        | `boolean`                                       | `false`  | 수동 제거 모드                                 |
| `duration`             | `number \| string`                              | -        | 애니메이션 지속 시간 (Handler 레벨 오버라이드) |
| `background`           | `ModalBackground<B>`                            | -        | 배경 설정                                      |
| `footer`               | `AlertFooterRender \| FooterOptions \| false`   | -        | 푸터 설정                                      |
| `ForegroundComponent`  | `ComponentType<ModalFrameProps>`                | -        | 커스텀 전경                                    |
| `BackgroundComponent`  | `ComponentType<ModalFrameProps>`                | -        | 커스텀 배경                                    |
| `signal`               | `AbortSignal`                                   | -        | 모달 취소를 위한 AbortSignal                   |

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

| 옵션     | 타입                                            | 기본값 | 설명      |
| -------- | ----------------------------------------------- | ------ | --------- |
| `footer` | `ConfirmFooterRender \| FooterOptions \| false` | -      | 푸터 설정 |

#### confirm용 FooterOptions

```typescript
interface FooterOptions {
  confirm?: string; // 확인 버튼 텍스트
  cancel?: string; // 취소 버튼 텍스트
  hideConfirm?: boolean; // 확인 버튼 숨김
  hideCancel?: boolean; // 취소 버튼 숨김
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

확인은 현재 입력값을 그대로 반환하며 값이 없으면 `undefined`입니다. 일반 취소는 `null`입니다. `returnOnCancel: true`이면 취소도 현재 값(렌더 전에는 `defaultValue`)을 반환하며 `undefined`도 보존합니다. 미입력 확인을 빈 문자열로 받으려면 `defaultValue: ''`를 지정합니다. 일반 취소 판별은 truthiness 대신 `result === null`을 사용합니다.

사용자 입력을 수집하는 프롬프트 모달을 엽니다.

#### 시그니처

```typescript
function prompt<T, B = any>(options: PromptProps<T, B>): Promise<T | undefined | null>;
```

#### 매개변수

`alert`의 모든 옵션 포함, 추가:

| 옵션 | 타입 | 필수 | 설명 | | ---------------- | ------------------------------------------- | ---------------------- | ---------------------------------- | ------------------ | | `Input` | `(props: PromptInputProps<T>) => ReactNode` | 예 | 입력 컴포넌트 | | `defaultValue` | `T` | 아니오 | 기본값 | | `disabled` | `(value: T                                  | undefined) => boolean` | 아니오 | 확인 버튼 비활성화 | | `returnOnCancel` | `boolean` | 아니오 | 취소 시 null 대신 현재 입력값 반환 |

#### PromptInputProps

```typescript
interface PromptInputProps<T> {
  value?: T; // 현재 값
  defaultValue?: T; // 기본값
  onChange: (value: T | undefined) => void; // 값 변경 핸들러
  onConfirm: () => void; // 확인 핸들러
  onCancel: () => void; // 취소 핸들러
  context: any; // 사용자 정의 context
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
  Input: ({ value = { name: '', age: 0 }, onChange }) => (
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

| 기능      | 정적 함수 | useModal 훅     |
| --------- | --------- | --------------- |
| 생명주기  | 독립적    | 컴포넌트에 연결 |
| 정리      | 수동      | 자동            |
| 사용 위치 | 어디서나  | 컴포넌트 내부   |

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

### 수명주기와 소유권

모달 결과는 한 번만 확정됩니다. `usePathname`에 따른 경로 이동은 대기 중인 모달을 결과 확정 없이 숨기고, 복귀하면 다시 표시합니다. 숨겨진 모달도 AbortSignal 중단과 `useModal` 소유 컴포넌트 정리로 취소됩니다. 확정된 모달은 `manualDestroy: true`여도 다시 표시되지 않습니다.

`ModalProvider` 또는 `useInitializeModal` 초기화 주체 하나만 포털을 소유합니다. 추가 Provider는 대기하며 개발 환경에서 한 번 경고합니다. 소유자가 언마운트되면 첫 대기자가 열린 모달을 이어받습니다. 대기자가 없으면 열린 모달은 취소 값으로 완료됩니다. `alert`는 완료되고, `confirm`은 `false`, `prompt`는 `null`을 반환합니다(`returnOnCancel: true`이면 현재 입력값). StrictMode 점검을 포함한 같은 커밋의 재마운트는 대기 중인 결과와 prompt 입력값을 유지합니다.

내용·입력·프레임의 렌더 오류는 해당 모달의 Promise를 잡힌 오류로 거부하므로 `try`/`catch`로 처리합니다. 다른 모달과 이후 요청은 계속 동작합니다. 대기 중인 모달의 파괴도 먼저 취소한 뒤 프레임을 제거합니다.

`useModal`은 확정된 요청을 즉시 추적 목록에서 제거하고, 컴포넌트 언마운트 때 미확정 요청만 취소합니다. 정적 호출은 호출 컴포넌트보다 오래 유지되지만 Provider 소유권과 취소 규칙은 따릅니다.

`useActiveModalCount`와 `useSubscribeModal(id)`는 공용 저장소를 읽으므로 Provider의 일반 자식과 Provider 밖에서도 동작합니다. 개수 판별 함수는 읽기 전용 `ModalNodeView`를 받으며 refresh key 없이 노드 변경을 반영합니다. `useDestroyAfter`는 모달 프레임 안에서 사용하고, 이미 확정됐지만 살아 있는 모달을 지연 시간 뒤 파괴합니다. 경로 숨김만으로는 타이머가 시작되지 않습니다. 지연 시간이 바뀌면 최신 값으로 파괴를 다시 예약합니다.

DOM 없이 패키지를 가져오고 서버에서 `ModalProvider`를 렌더할 수 있습니다. `alert`, `confirm`, `prompt`는 브라우저에서만 호출합니다. 서버 렌더에는 모달 포털이 없고 활성 개수는 0입니다.

### useActiveModalCount

활성 모달의 개수를 반환합니다.

```typescript
function useActiveModalCount(
  validate?: (modal: ModalNodeView) => boolean | undefined,
): number;
```

#### 매개변수

| 매개변수   | 타입                 | 설명      |
| ---------- | -------------------- | --------- |
| `validate` | `(modal) => boolean` | 필터 함수 |

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
  },
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
  duration: `${number}ms`; // 예: '300ms'
  milliseconds: number; // 예: 300
};
```

---

### useDestroyAfter

결과가 확정된 모달을 지정한 지연 시간 뒤 파괴합니다.

```typescript
function useDestroyAfter(modalId: number, duration: number | `${number}ms` | `${number}s`): void;
```

#### 동작

- 결과가 확정되고 살아 있을 때만 타이머 시작
- 경로 숨김은 미확정 모달을 유지
- 최신 지연 시간 뒤 프레임 제거

#### 예제

```typescript
function ToastMessage({ id }) {
  useDestroyAfter(id, 300); // Destroy 300ms after settlement
  return <div>토스트</div>;
}
```

---

### useSubscribeModal

모달 상태 변경을 구독합니다.

```typescript
function useSubscribeModal(modalId: number): number;
```

#### 반환값

각 상태 변경 시 증가하는 버전 번호.

#### 예제

```typescript
function ModalDebugger({ id, visible }) {
  const version = useSubscribeModal(id);

  useEffect(() => {
    console.log('State changed:', visible);
  }, [version]);
}
```

---

### useInitializeModal

`root`를 생략하면 `document.body`, 요소를 주면 해당 컨테이너, `null`이면 초기화를 기다립니다. ref만 넘겨도 자동 초기화합니다. `initialize(element)`는 명령형으로 root를 정하며 마지막 호출 또는 `root` prop 변경이 우선합니다. 같은 앵커를 컨테이너 사이에서 옮기므로 열린 입력과 Promise를 유지합니다. `null`로 바꾸면 앵커를 떼고 마운트된 모달은 보존하며 새 요청은 대기시킵니다. 요소로 복귀하면 앵커를 붙이고 대기열을 처리합니다. 처음부터 null이면 앵커를 만들지 않습니다. `useInitializeModal`도 같은 `root`를 받으며 `mode: 'manual'`은 `initialize(element)` 또는 이후 root 변경까지 초기 root를 보류합니다. 반환된 `portal`은 항상 렌더합니다.

```typescript
function useInitializeModal(options?: ModalProviderProps & { mode?: 'auto' | 'manual' }): {
  initialize: (element: HTMLElement) => void;
  portal: ReactPortal | null;
};
```

---

### useModalOptions

모달 트리 안에서 정규화된 Provider 옵션을 읽습니다.

```typescript
function useModalOptions(): {
  duration: `${number}ms`;
  backdrop: CSSProperties;
  manualDestroy: boolean;
  closeOnBackdropClick: boolean;
  closeOnEscape?: boolean;
  trapFocus: boolean;
  lockScroll: boolean;
  zIndex: number;
};
```

---

### useModalBackdrop

모달 트리 안에서 배경 CSS 속성을 읽습니다.

```tsx
function BackdropInfo() {
  const backdrop = useModalBackdrop();
  return <div style={backdrop} />;
}
```

---

## 컴포넌트

### ModalProvider

초기화를 위한 메인 Provider 컴포넌트입니다.

```typescript
interface ModalProviderProps {
  children: ReactNode;
  ForegroundComponent?: ComponentType<PropsWithChildren<ModalFrameProps>>;
  BackgroundComponent?: ComponentType<ModalFrameProps>;
  TitleComponent?: ComponentType<WrapperComponentProps>;
  SubtitleComponent?: ComponentType<WrapperComponentProps>;
  ContentComponent?: ComponentType<WrapperComponentProps>;
  FooterComponent?: ComponentType<FooterComponentProps>;
  options?: ModalOptions;
  context?: Record<string, any>;
  usePathname?: () => { pathname: string }; // 라우터 통합
  root?: HTMLElement | null; // 커스텀 루트 엘리먼트
}
```

#### ModalOptions

```typescript
interface ModalOptions {
  duration?: number | `${number}ms` | `${number}s`; // 애니메이션 지속 시간
  backdrop?: string | CSSProperties; // 배경 오버레이 색상
  manualDestroy?: boolean; // 수동 제거 모드
  closeOnBackdropClick?: boolean; // 배경 클릭 시 닫기
  closeOnEscape?: boolean;
  trapFocus?: boolean;
  lockScroll?: boolean;
}
```

#### usePathname (라우터 통합)

`usePathname` prop을 사용하면 라우터와 통합할 수 있습니다. 경로가 변경되면 미확정 모달을 숨기고 복귀하면 다시 표시하며, 결과는 확정하지 않습니다.

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
  id: number; // 모달 ID
  type: 'alert' | 'confirm' | 'prompt'; // 모달 타입
  alive: boolean; // 활성 상태
  visible: boolean; // 표시 상태
  initiator: string; // 초기화 출처
  manualDestroy: boolean; // 수동 제거 모드
  closeOnBackdropClick: boolean; // 배경 클릭 닫기
  background?: ModalBackground<B>; // 배경 데이터
  onConfirm: () => void; // 확인 핸들러
  onClose: () => void; // 닫기 핸들러
  onChange: (value: any) => void; // 값 변경 핸들러
  onDestroy: () => void; // 제거 핸들러
  onChangeOrder: Function; // 순서 변경 핸들러
  context: Context; // 사용자 정의 context
  children: ReactNode; // 자식 요소
}
```

#### FooterComponentProps

푸터 컴포넌트용 Props입니다.

```typescript
interface FooterComponentProps {
  type: 'alert' | 'confirm' | 'prompt'; // 모달 타입
  onConfirm: (value?: any) => void; // 확인 핸들러
  onClose: () => void; // 닫기 핸들러
  onCancel?: () => void; // 취소 핸들러
  disabled?: boolean; // 비활성화 상태
  footer?: FooterOptions; // 푸터 옵션
  context: any; // 사용자 정의 context
}
```

#### WrapperComponentProps

title/subtitle/content 컴포넌트용 Props입니다.

```typescript
interface WrapperComponentProps {
  children: ReactNode; // 자식 요소
  context: any; // 사용자 정의 context
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
        transition: `opacity ${duration}`,
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
        transition: `all ${duration}`,
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
    disabled: (v) => !v?.name || !v?.email.includes('@'),
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
  const { initialize, portal } = useInitializeModal({ mode: 'manual' });
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
      {portal}
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
