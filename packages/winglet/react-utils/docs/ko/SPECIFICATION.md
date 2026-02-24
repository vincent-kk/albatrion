# @winglet/react-utils — 명세서

**버전**: 0.10.0
**설명**: React 유틸리티 라이브러리 — 커스텀 훅, HOC, 유틸리티 함수
**라이선스**: MIT

---

## 목차

1. [설치](#설치)
2. [빠른 시작](#빠른-시작)
3. [서브패스 임포트](#서브패스-임포트)
4. [훅 API](#훅-api)
   - [useConstant](#useconstant)
   - [useTruthyConstant](#usetruthyconstant)
   - [useMemorize](#usememorize)
   - [useReference](#usereference)
   - [useHandle](#usehandle)
   - [useSnapshot](#usesnapshot)
   - [useSnapshotReference](#usesnapshotreference)
   - [useRestProperties](#userestproperties)
   - [useOnMount](#useonmount)
   - [useOnMountLayout](#useonmountlayout)
   - [useOnUnmount](#useonunmount)
   - [useOnUnmountLayout](#useonunmountlayout)
   - [useEffectUntil](#useeffectuntil)
   - [useLayoutEffectUntil](#uselayouteffectuntil)
   - [useDebounce](#usedebounce)
   - [useTimeout](#usetimeout)
   - [useVersion](#useversion)
   - [useWindowSize](#usewindowsize)
5. [Portal 시스템](#portal-시스템)
6. [고차 컴포넌트 (HOC)](#고차-컴포넌트-hoc)
   - [withErrorBoundary](#witherrorboundary)
   - [withErrorBoundaryForwardRef](#witherrorboundaryforwardref)
   - [withUploader](#withuploader)
7. [유틸리티 함수](#유틸리티-함수)
   - [Filter](#filter)
   - [Object](#object)
   - [Render](#render)
8. [타입 정의](#타입-정의)
9. [호환성](#호환성)

---

## 설치

```bash
npm install @winglet/react-utils
# 또는
yarn add @winglet/react-utils
```

**피어 의존성** (별도 설치 필요):

```bash
npm install react react-dom
# React 16, 17, 18, 19 모두 지원
```

---

## 빠른 시작

```tsx
import {
  useConstant,
  useHandle,
  useOnMount,
  useWindowSize,
  Portal,
  withErrorBoundary,
} from '@winglet/react-utils';

// 안정적인 설정 객체 (재생성되지 않음)
const config = useConstant({ apiUrl: '/api', timeout: 5000 });

// 항상 최신 state를 사용하는 안정적인 이벤트 핸들러
const handleSubmit = useHandle(() => submitForm(formData));

// 마운트 시 한 번 실행
useOnMount(() => {
  analytics.track('page_view');
});

// 반응형 레이아웃
const { width } = useWindowSize();
const isMobile = width < 768;

// 모달을 위한 Portal
const App = Portal.with(() => (
  <div>
    <Portal><Modal /></Portal>
    <Portal.Anchor />
  </div>
));

// 에러 경계 (크래시 방지)
const SafeWidget = withErrorBoundary(Widget, <p>로드에 실패했습니다.</p>);
```

---

## 서브패스 임포트

번들 크기 최적화를 위해 서브패스 임포트를 사용하세요:

| 서브패스 | 내용 |
|----------|------|
| `@winglet/react-utils` | 모든 내보내기 |
| `@winglet/react-utils/hook` | 18개 훅 전체 |
| `@winglet/react-utils/hoc` | `withErrorBoundary`, `withErrorBoundaryForwardRef`, `withUploader` |
| `@winglet/react-utils/portal` | `Portal` 복합 객체 |
| `@winglet/react-utils/filter` | `isReactComponent`, `isReactElement`, `isClassComponent`, `isFunctionComponent`, `isMemoComponent` |
| `@winglet/react-utils/object` | `remainOnlyReactComponent` |
| `@winglet/react-utils/render` | `renderComponent` |

---

## 훅 API

### useConstant

컴포넌트 전체 라이프사이클 동안 변하지 않는 상수 값을 생성합니다.

```typescript
function useConstant<T>(input: T): T
```

첫 번째 렌더링에서 값을 저장하고 이후 재계산하지 않습니다. 함수를 전달하면 함수 자체가 저장됩니다(호출되지 않음). 팩토리 함수로 지연 초기화가 필요하다면 `useTruthyConstant`를 사용하세요.

**매개변수**:
- `input` — 영구적으로 저장할 값. 모든 타입 허용.

**반환값**: 매 렌더링마다 동일한 상수 값.

```tsx
const MyComponent = () => {
  // 안정적인 객체 — React.memo 자식 컴포넌트를 불필요하게 리렌더링하지 않음
  const defaultConfig = useConstant({ showIcon: true, pageSize: 20 });

  // 비용이 큰 초기화 연산 (함수가 저장되며 호출되지 않음)
  // 호출을 원하면 useTruthyConstant를 사용하세요
  const callback = useConstant(() => (value: string) => console.log(value));

  return <ExpensiveChild config={defaultConfig} onLog={callback} />;
};
```

---

### useTruthyConstant

지연 초기화를 지원하는 상수를 생성합니다. 함수를 전달하면 값이 처음 필요할 때(값이 falsy일 때) 호출됩니다.

```typescript
function useTruthyConstant<T>(input: T | (() => T)): T
```

**매개변수**:
- `input` — 값 또는 팩토리 함수. 함수는 지연 실행됩니다.

**반환값**: 상수 값.

**주의**: 저장된 값이 falsy(`null`, `undefined`, `0`, `''`, `false`)가 되면 재초기화됩니다. 정당하게 falsy가 될 수 있는 값에는 사용하지 마세요.

```tsx
// 처음 접근할 때만 서비스 인스턴스가 생성됨
const analyticsService = useTruthyConstant(() => new AnalyticsService(config));

// 조건부 초기화
const processor = useTruthyConstant(() => {
  if (!videoUrl) return null;
  return new VideoProcessor({ codec: 'h264' });
});
```

---

### useMemorize

의존성이 변경될 때 값 또는 팩토리 함수 결과를 재계산하여 메모이제이션합니다.

```typescript
// 함수 오버로드
function useMemorize<R>(input: () => R, dependencies?: DependencyList): R;
// 값 오버로드
function useMemorize<T>(input: T, dependencies?: DependencyList): T;
```

**매개변수**:
- `input` — 메모이제이션할 값 또는 값을 반환하는 팩토리 함수.
- `dependencies` — 의존성 배열 (기본값: `[]`).

**반환값**: 의존성이 변경될 때까지 안정적인 메모이제이션된 값.

```tsx
// 인라인 객체 메모이제이션 (매 렌더링마다 새 참조 생성 방지)
const config = useMemorize({ theme, locale }, [theme, locale]);

// 비용이 큰 연산 메모이제이션
const processed = useMemorize(
  () => rawData.map(item => expensiveTransform(item)),
  [rawData],
);
```

---

### useReference

매 렌더링마다 `current` 프로퍼티가 최신 값으로 업데이트되는 ref를 생성합니다.

```typescript
function useReference<T>(value: T): RefObject<T>
```

**매개변수**:
- `value` — 추적할 값. 매 렌더링마다 업데이트됩니다.

**반환값**: 안정적인 `RefObject<T>`. ref 객체 자체는 변하지 않고, `ref.current`만 업데이트됩니다.

**주요 사용 사례**: 오래된 클로저(stale closure) 없이 비동기 콜백, 타이머, 클린업 함수 내에서 현재 state/props에 접근.

```tsx
const [count, setCount] = useState(0);
const countRef = useReference(count);

// 이 인터벌 콜백은 절대 오래되지 않음
const logCount = useCallback(() => {
  console.log(countRef.current); // 항상 현재 값
}, [countRef]);

useEffect(() => {
  const id = setInterval(logCount, 1000);
  return () => clearInterval(id);
}, [logCount]);
```

---

### useHandle

제공된 핸들러의 최신 버전을 항상 호출하는 안정적인 콜백 함수를 생성합니다.

```typescript
function useHandle<P extends any[], R>(
  handler?: (...args: P) => R
): (...args: P) => R
```

**매개변수**:
- `handler` — 선택적. 래핑할 함수. `undefined`이면 반환된 함수는 `null`을 반환합니다.

**반환값**: 참조(identity)가 절대 변하지 않는 안정적인 함수.

**사용 사례**: `React.memo` 자식 컴포넌트에 이벤트 핸들러를 전달할 때 불필요한 리렌더링 방지.

```tsx
const [data, setData] = useState(initialData);

// handleClick의 참조가 변하지 않아 ExpensiveChild가 리렌더링되지 않음
const handleClick = useHandle(() => process(data));

return <ExpensiveChild onClick={handleClick} />;
```

**vs useCallback**: `useCallback`은 의존성이 변경될 때 함수를 재생성하지만, `useHandle`은 절대 재생성하지 않습니다.

---

### useSnapshot

객체의 내용이 변경될 때만 업데이트되는 안정적인 객체 참조를 반환합니다 (깊은 비교).

```typescript
function useSnapshot<T extends object | undefined>(
  input: T,
  omit?: Set<keyof T> | Array<keyof T>
): T
```

**매개변수**:
- `input` — 추적할 객체.
- `omit` — 선택적. 깊은 비교에서 제외할 프로퍼티.

**반환값**: 내용이 깊이 동일하면 동일한 객체 참조를 반환.

```tsx
// 설정 내용이 실제로 변경될 때만 effect 재실행
const stableConfig = useSnapshot({ theme: user.theme, locale: user.locale });
useEffect(() => { initWidget(stableConfig); }, [stableConfig]);

// 타임스탬프 등 휘발성 필드를 비교에서 제외
const stableResponse = useSnapshot(apiResponse, ['timestamp', 'requestId']);
```

**vs useRestProperties**: `useSnapshot`은 깊은 비교, `useRestProperties`는 얕은 비교를 수행합니다.

---

### useSnapshotReference

`useSnapshot`과 동일한 깊은 비교 로직이지만 ref 객체를 반환합니다.

```typescript
function useSnapshotReference<T extends object | undefined>(
  input: T,
  omit?: Set<keyof T> | Array<keyof T>
): RefObject<T>
```

**매개변수**:
- `input` — 추적할 객체.
- `omit` — 선택적. 깊은 비교에서 제외할 프로퍼티.

**반환값**: 내용이 변경될 때만 `current`가 업데이트되는 `RefObject<T>`.

```tsx
const dataRef = useSnapshotReference(complexData);

// 안정적인 콜백 — 데이터 구조가 변경될 때만 재생성
const processData = useCallback(() => {
  const result = expensiveComputation(dataRef.current);
  onProcess(result);
}, [dataRef]);
```

---

### useRestProperties

얕은 동등성 비교를 통해 객체 props의 참조 안정성을 유지합니다.

```typescript
function useRestProperties<T extends Dictionary>(props: T): T
```

**매개변수**:
- `props` — 안정화할 props 객체.

**반환값**: 내용이 얕게 동일하면 이전 객체 참조 반환; 아니면 새 객체 반환.

```tsx
const Button = ({ variant, size, ...restProps }) => {
  const stableRest = useRestProperties(restProps);
  // restProps 내용이 실제로 변경될 때만 MemoizedButton이 리렌더링됨
  return (
    <MemoizedButton variant={variant} size={size} {...stableRest} />
  );
};
```

---

### useOnMount

컴포넌트가 마운트될 때 한 번 사이드 이펙트를 실행합니다.

```typescript
function useOnMount(handler: EffectCallback): void
```

**매개변수**:
- `handler` — 이펙트 함수. 클린업 함수를 반환할 수 있습니다.

```tsx
useOnMount(() => {
  const ws = new WebSocket('wss://api.example.com');
  ws.onmessage = (e) => handleMessage(JSON.parse(e.data));
  return () => ws.close(); // 언마운트 시 정리
});
```

---

### useOnMountLayout

`useOnMount`의 동기 버전. `useLayoutEffect`를 사용하여 브라우저 페인트 전에 실행됩니다.

```typescript
function useOnMountLayout(handler: EffectCallback): void
```

**매개변수**:
- `handler` — 동기 이펙트. 클린업 함수를 반환할 수 있습니다.

**사용 시기**: FOUC 방지, 초기 DOM 측정, 스크롤 위치 복원.

```tsx
useOnMountLayout(() => {
  const saved = localStorage.getItem('theme');
  if (saved === 'dark') document.documentElement.classList.add('dark');
});
```

**성능 주의**: 브라우저 페인트를 차단합니다. 동기 동작이 꼭 필요할 때만 사용하세요.

---

### useOnUnmount

컴포넌트가 언마운트될 때 클린업 함수를 실행합니다.

```typescript
function useOnUnmount(handler: Fn): void
```

**매개변수**:
- `handler` — 클린업 함수. 마운트 시점의 값을 캡처합니다 (오래된 클로저).

**중요**: 클린업 함수 내에서 현재 state 값에 접근하려면 `useReference`를 사용하세요.

```tsx
// 언마운트 시 현재 state 접근
const formDataRef = useReference(formData);
const isDirtyRef = useReference(isDirty);

useOnUnmount(() => {
  if (isDirtyRef.current) {
    localStorage.setItem('draft', JSON.stringify(formDataRef.current));
  }
});
```

---

### useOnUnmountLayout

`useLayoutEffect`를 통한 동기 언마운트 클린업.

```typescript
function useOnUnmountLayout(handler: Fn): void
```

**사용 시기**: 리플로우 전 DOM 요소 제거, 애니메이션 중단, 전역 스타일 동기적 복원.

```tsx
useOnMountLayout(() => {
  document.body.style.overflow = 'hidden';
});
useOnUnmountLayout(() => {
  document.body.style.overflow = ''; // 다음 페인트 전에 복원
});
```

---

### useEffectUntil

이펙트가 `true`를 반환할 때까지 반복 실행하고, 이후 영구적으로 중단합니다.

```typescript
function useEffectUntil<D extends DependencyList>(
  effect: () => boolean,
  dependencies?: D
): void
```

**매개변수**:
- `effect` — `boolean`을 반환하는 함수. `true`를 반환하면 영구적으로 중단.
- `dependencies` — 선택적 의존성 배열.

```tsx
// 연결 성공까지 계속 시도
useEffectUntil(() => {
  const socket = connectToWebSocket(url);
  if (socket.readyState === WebSocket.OPEN) {
    setConnection(socket);
    return true; // 중단
  }
  return false; // 재시도
}, [url]);
```

---

### useLayoutEffectUntil

`useLayoutEffect`를 사용하는 `useEffectUntil`의 동기 버전.

```typescript
function useLayoutEffectUntil<D extends DependencyList>(
  effect: () => boolean,
  dependencies?: D
): void
```

```tsx
// 시각적 깜박임 없이 텍스트가 컨테이너에 맞을 때까지 폰트 크기 조정
useLayoutEffectUntil(() => {
  const el = containerRef.current;
  if (!el) return false;
  if (el.scrollWidth > el.clientWidth) {
    setFontSize(prev => prev - 1);
    return false;
  }
  return true;
}, [fontSize]);
```

---

### useDebounce

의존성 변경에 의해 트리거되는 콜백 함수를 디바운스합니다.

```typescript
function useDebounce(
  callback: Fn,
  dependencyList?: DependencyList,
  ms?: number,
  options?: { immediate?: boolean }
): { isIdle: () => boolean; cancel: () => void }
```

**매개변수**:
- `callback` — 디바운스할 함수.
- `dependencyList` — 디바운스를 트리거하는 의존성.
- `ms` — 지연 시간(밀리초, 기본값: `0`).
- `options.immediate` — 유휴 상태일 때 즉시 실행 후 디바운스 (기본값: `true`).

**반환값**: `{ isIdle, cancel }` — `isIdle()`은 실행 대기 중인지 반환; `cancel()`은 취소.

```tsx
const [query, setQuery] = useState('');

const { cancel } = useDebounce(
  () => searchAPI(query),
  [query],
  300,
);

// 언마운트 시 대기 중인 디바운스 정리
useEffect(() => cancel, [cancel]);
```

---

### useTimeout

React 라이프사이클과 통합된 `setTimeout`의 수동 제어를 제공합니다.

```typescript
function useTimeout(
  callback: Fn,
  timeout?: number
): { isIdle: () => boolean; schedule: () => void; cancel: () => void }
```

**매개변수**:
- `callback` — 타임아웃 후 실행할 함수.
- `timeout` — 지연 시간(밀리초, 기본값: `0`).

**반환값**:
- `isIdle()` — 대기 중인 타임아웃이 없으면 `true`.
- `schedule()` — 타임아웃을 시작하거나 재설정.
- `cancel()` — 대기 중인 타임아웃 취소.

```tsx
const { schedule, cancel } = useTimeout(() => setVisible(false), 3000);

return (
  <Notification
    onMouseEnter={cancel}   // 닫기 타이머 일시정지
    onMouseLeave={schedule} // 닫기 타이머 재시작
  >
    {message}
  </Notification>
);
```

---

### useVersion

버전 카운터와 업데이트 함수를 반환합니다. `update()`를 호출하면 카운터가 증가하고 리렌더링이 트리거됩니다.

```typescript
function useVersion(callback?: Fn): [version: number, update: () => void]
```

**매개변수**:
- `callback` — 선택적. 버전 증가 전에 호출됩니다.

**반환값**: `[version, update]` 튜플. `version`은 `0`에서 시작.

```tsx
const [version, refresh] = useVersion();

// version을 key로 사용하여 자식 컴포넌트 강제 재마운트
return <ComplexForm key={version} onSubmit={handleSubmit} />;

// version을 effect 의존성으로 사용하여 데이터 재요청 강제
useEffect(() => { fetchData(); }, [version]);

return <button onClick={refresh}>새로고침</button>;
```

---

### useWindowSize

브라우저 창 크기를 추적하며 리사이즈 시 업데이트됩니다.

```typescript
function useWindowSize(): { width: number; height: number }
```

**반환값**: `{ width, height }` — 현재 `window.innerWidth`와 `window.innerHeight` (픽셀). SSR에서는 `{ width: 0, height: 0 }` 반환.

```tsx
const { width, height } = useWindowSize();

const isMobile = width < 768;
const isTablet = width >= 768 && width < 1024;

return (
  <div style={{ minHeight: height }}>
    {isMobile ? <MobileNav /> : <DesktopNav />}
  </div>
);
```

**성능**: 리사이즈 이벤트는 빈번하게 발생합니다. 비용이 큰 연산에는 `useDebounce`와 조합하여 사용하세요.

---

## Portal 시스템

React 컴포넌트 계층구조(컨텍스트, 이벤트 버블링)를 유지하면서 다른 DOM 위치에 콘텐츠를 렌더링합니다.

### 설정

`Portal.with`로 컴포넌트를 래핑하여 포탈 컨텍스트를 제공하세요:

```tsx
import { Portal } from '@winglet/react-utils/portal';

const App = Portal.with(() => {
  const [showModal, setShowModal] = useState(false);

  return (
    <div>
      <button onClick={() => setShowModal(true)}>모달 열기</button>

      {showModal && (
        <Portal>
          <div className="modal-backdrop">
            <div className="modal">
              <button onClick={() => setShowModal(false)}>닫기</button>
            </div>
          </div>
        </Portal>
      )}

      {/* 모달 콘텐츠가 여기 렌더링됨 — 부모 div 레이아웃 외부 */}
      <Portal.Anchor className="modal-root" />
    </div>
  );
});
```

### 컴포넌트

#### `Portal`

자식 요소를 `Portal.Anchor` 위치에 렌더링합니다. 자신의 위치에서는 `null`을 반환합니다.

```tsx
<Portal>
  <div className="overlay">이 콘텐츠는 앵커 위치에 나타납니다</div>
</Portal>
```

| Prop | 타입 | 설명 |
|------|------|------|
| `children` | `ReactNode` | 앵커 위치에 렌더링할 콘텐츠 |

#### `Portal.Anchor`

포탈 콘텐츠가 표시될 DOM 위치를 정의합니다. 표준 HTML `<div>` 속성을 모두 지원합니다.

```tsx
<Portal.Anchor
  className="overlay-container"
  style={{ position: 'fixed', inset: 0, zIndex: 9999 }}
/>
```

#### `Portal.with(Component)`

컴포넌트를 `PortalContextProvider`로 래핑하는 HOC. 독립적인 포탈 스코프를 생성합니다.

```tsx
const Page = Portal.with(MyPageComponent);
// 또는 인라인:
const App = Portal.with(() => <div>...</div>);
```

### 여러 Portal 사용

동일한 프로바이더 아래의 모든 `<Portal>` 인스턴스는 단일 `<Portal.Anchor>`에 렌더링됩니다:

```tsx
const Page = Portal.with(() => (
  <div>
    <Portal><ModalA /></Portal>
    <Portal><TooltipB /></Portal>
    <main>콘텐츠</main>
    <Portal.Anchor /> {/* ModalA와 TooltipB 모두 여기에 렌더링됨 */}
  </div>
));
```

### 중첩 Portal 컨텍스트

각 `Portal.with`는 독립적인 스코프를 생성합니다:

```tsx
const Outer = Portal.with(() => (
  <div>
    <Portal><div>외부 콘텐츠</div></Portal>
    <Inner />
    <Portal.Anchor id="outer" />
  </div>
));

const Inner = Portal.with(() => (
  <div>
    <Portal><div>내부 콘텐츠</div></Portal>
    <Portal.Anchor id="inner" /> {/* 내부 콘텐츠만 여기에 렌더링됨 */}
  </div>
));
```

### 고정 헤더 사용 사례

README에 문서화된 사용 사례 — 다른 위치에 헤더 콘텐츠 렌더링:

```tsx
const PageLayout = Portal.with(() => (
  <div>
    <Portal.Anchor className={styles.header} />  {/* 헤더가 여기에 렌더링됨 */}

    <Portal>
      <h1>페이지 제목</h1>
      <nav>...</nav>
    </Portal>

    <main>
      페이지 본문 콘텐츠
    </main>
  </div>
));
```

---

## 고차 컴포넌트 (HOC)

### withErrorBoundary

애플리케이션 크래시를 방지하기 위해 컴포넌트를 에러 경계로 래핑합니다.

```typescript
function withErrorBoundary<Props extends Dictionary>(
  Component: ComponentType<Props>,
  fallback?: ReactNode,
): ComponentType<Props>
```

**매개변수**:
- `Component` — 보호할 컴포넌트.
- `fallback` — 선택적. 에러 발생 시 표시할 커스텀 UI. 기본값: `FallbackMessage` 컴포넌트.

```tsx
import { withErrorBoundary } from '@winglet/react-utils/hoc';

const SafeChart = withErrorBoundary(
  ChartComponent,
  <div className="error">차트를 불러올 수 없습니다. 새로고침 해주세요.</div>,
);

// 사용
<SafeChart data={chartData} width={800} height={400} />
```

**주의**:
- 이벤트 핸들러 내부의 에러는 잡지 않습니다 (try/catch 사용)
- 비동기 에러는 잡지 않습니다 (에러 state 패턴 사용)

---

### withErrorBoundaryForwardRef

`React.forwardRef`로 생성된 컴포넌트를 위한 `withErrorBoundary`. ref 포워딩을 유지합니다.

```typescript
function withErrorBoundaryForwardRef<Props extends Dictionary, Ref>(
  Component: ForwardRefExoticComponent<Props & RefAttributes<Ref>>,
  fallback?: ReactNode,
): ForwardRefExoticComponent<PropsWithoutRef<Props> & RefAttributes<Ref>>
```

```tsx
import { withErrorBoundaryForwardRef } from '@winglet/react-utils/hoc';

const CustomInput = forwardRef<HTMLInputElement, InputProps>((props, ref) => (
  <input {...props} ref={ref} />
));

const SafeInput = withErrorBoundaryForwardRef(CustomInput);

// 래핑 후에도 ref가 작동함
const inputRef = useRef<HTMLInputElement>(null);
<SafeInput ref={inputRef} placeholder="값 입력" />
```

---

### withUploader

모든 클릭 가능한 컴포넌트를 파일 업로드 트리거로 변환합니다.

```typescript
function withUploader<Props extends { onClick?: Fn<[e?: MouseEvent]> }>(
  Component: ComponentType<Props>,
): MemoExoticComponent<...>
```

**추가되는 props** (반환된 컴포넌트에):

| Prop | 타입 | 설명 |
|------|------|------|
| `onChange` | `(file: File) => void` | 선택된 `File` 객체로 호출 |
| `acceptFormat` | `string[]` | 허용할 파일 확장자 (예: `['.jpg', '.png']`) |

원래 컴포넌트의 모든 props는 보존되어 전달됩니다.

```tsx
import { withUploader } from '@winglet/react-utils/hoc';

const UploadButton = withUploader(Button);

<UploadButton
  acceptFormat={['.jpg', '.jpeg', '.png', '.webp']}
  onChange={(file: File) => {
    console.log('선택됨:', file.name);
    uploadToServer(file);
  }}
>
  사진 업로드
</UploadButton>
```

**동작 방식**:
- 클릭 시 네이티브 파일 선택 다이얼로그를 엽니다
- 다이얼로그 열기 전에 원래 `onClick` 핸들러를 호출합니다
- 선택 후 input을 초기화하여 동일한 파일을 다시 선택할 수 있게 합니다
- 단일 파일만 처리합니다 (`files[0]` 사용)

---

## 유틸리티 함수

### Filter

#### `isReactComponent(value)`

```typescript
function isReactComponent<Props = any>(value: unknown): value is ComponentType<Props>
```

함수 컴포넌트, 클래스 컴포넌트, `React.memo` 래핑 컴포넌트에 대해 `true`를 반환합니다.

**감지하지 않음**: `React.forwardRef` 컴포넌트.

```tsx
isReactComponent(() => <div />);              // true
isReactComponent(React.memo(() => <div />));  // true
isReactComponent(class extends React.Component { render() { return <div />; } }); // true
isReactComponent(React.forwardRef((_, ref) => <div ref={ref} />)); // false
isReactComponent(<div />);    // false (엘리먼트, 컴포넌트 아님)
```

#### `isReactElement(value)`

```typescript
function isReactElement(value: unknown): value is React.ReactElement
```

렌더링된 JSX 또는 `React.createElement` 결과에 대해 `true`를 반환합니다.

```tsx
isReactElement(<div>안녕</div>);          // true
isReactElement(React.createElement('p')); // true
isReactElement(() => <div />);            // false (컴포넌트, 엘리먼트 아님)
```

#### `isFunctionComponent(value)`

순수 함수 컴포넌트에 대해 `true`를 반환합니다 (클래스, memo 제외).

#### `isClassComponent(value)`

`React.Component` 또는 `React.PureComponent`를 상속하는 클래스 컴포넌트에 대해 `true`를 반환합니다.

#### `isMemoComponent(value)`

`React.memo()`로 래핑된 컴포넌트에 대해 `true`를 반환합니다.

---

### Object

#### `remainOnlyReactComponent(dictionary)`

```typescript
function remainOnlyReactComponent<
  Input extends Record<string, unknown>,
  Output extends Record<string, ComponentType>
>(dictionary: Input): Output
```

`isReactComponent`를 통과하는 값만 유지하도록 객체를 필터링합니다.

```tsx
const components = remainOnlyReactComponent({
  Button: ButtonComponent,   // 유지됨
  Icon: IconComponent,       // 유지됨
  config: { size: 'lg' },    // 제거됨 (컴포넌트 아님)
  label: '제출',             // 제거됨 (문자열)
});
// 결과: { Button: ButtonComponent, Icon: IconComponent }
```

---

### Render

#### `renderComponent(Component, props?)`

```typescript
function renderComponent<P extends object>(
  Component: ReactNode | ComponentType<P>,
  props?: P,
): ReactNode
```

컴포넌트 타입, 이미 렌더링된 엘리먼트, 또는 `null`/`undefined`일 수 있는 값을 통합 API로 렌더링합니다.

| 입력값 | 결과 |
|--------|------|
| `null`, `undefined`, falsy | `null` |
| React 엘리먼트 | 엘리먼트를 그대로 반환 |
| React 컴포넌트 | `React.createElement(Component, props)` |
| 그 외 | `null` |

```tsx
import { renderComponent } from '@winglet/react-utils/render';

// 유연한 icon prop 지원
interface CardProps {
  icon?: ComponentType | ReactNode;
  title: string;
}

const Card = ({ icon, title }: CardProps) => (
  <div className="card">
    {renderComponent(icon)}  {/* 컴포넌트, 엘리먼트, 없음 모두 처리 */}
    <h2>{title}</h2>
  </div>
);

<Card title="설정" icon={GearIcon} />           // <GearIcon /> 렌더링
<Card title="설정" icon={<img src={gear} />} /> // <img> 렌더링
<Card title="설정" />                           // null 렌더링
```

---

## 타입 정의

라이브러리 전반에서 사용되는 주요 타입:

```typescript
// @aileron/declare 에서
type Fn<P extends any[] = any[], R = any> = (...args: P) => R;
type Dictionary<V = any> = Record<string, V>;

// React에서
type DependencyList = ReadonlyArray<unknown>;
type EffectCallback = () => void | (() => void);

// Portal 타입
type Portal = {
  (props: PropsWithChildren): null;
  with: typeof withPortal;
  Anchor: typeof Anchor;
};

// UseTimeout 반환 타입
type UseTimeoutReturn = {
  isIdle: () => boolean;
  schedule: () => void;
  cancel: () => void;
};
```

---

## 호환성

| 환경 | 요구사항 |
|------|----------|
| React | 16, 17, 18, 19 |
| React DOM | 16, 17, 18, 19 |
| Node.js | 14.0.0 이상 |
| 브라우저 | ES2020을 지원하는 모던 브라우저 |
| 모듈 형식 | ESM (`.mjs`) 및 CJS (`.cjs`) |
| TypeScript | 전체 선언 파일 포함 |

레거시 브라우저 지원이 필요한 경우, Babel로 트랜스파일하세요.

---

## 개발 환경

```bash
# 클론 및 설치
git clone https://github.com/vincent-kk/albatrion.git
cd albatrion
nvm use && yarn install && yarn run:all build

# 이 패키지 빌드
yarn reactUtils build

# 테스트 실행
yarn reactUtils test
yarn reactUtils test --coverage
```
