# @lerx/promise-modal 사양서

설치·결과·컴포넌트·root·설정·애니메이션은 [README](../../README-ko_kr.md)에서 시작하십시오. 이 참조는 통합 판단을 설명하며 정확한 props 구조는 배포 선언을 사용합니다. 아래 TypeScript 블록은 각각 독립된 예제입니다.

## 공개 API와 결과

`alert`·`confirm`·`prompt`는 브라우저 이벤트 핸들러나 브라우저 유틸리티에서 호출합니다. 반환 타입은 각각 `Promise<void>`·`Promise<boolean>`·`Promise<T | undefined | null>`입니다. prompt 확인은 현재 값을 변환 없이 반환하고 일반 취소는 null입니다. `returnOnCancel: true`이면 undefined를 포함한 현재 값, 렌더 전에는 defaultValue를 반환합니다. 이미 중단된 signal은 모달을 만들지 않습니다. 렌더나 열기 오류는 취소가 아닌 거부입니다.

### 애플리케이션 래퍼

공개 Props 타입으로 래퍼가 호출 계약을 유지할 수 있습니다. `AlertProps`와 `ConfirmProps`에는 배경 타입 인자가 필요하며 `PromptProps<T>`는 기본 배경 타입을 사용할 수 있습니다. 노드와 변경 메서드는 내부용입니다.

```tsx
import {
  type AlertProps,
  type ConfirmProps,
  type PromptProps,
  alert,
  confirm,
  prompt,
} from '@lerx/promise-modal';

export const notify = (props: AlertProps<unknown>) => alert(props);
export const ask = (props: ConfirmProps<unknown>) => confirm(props);
export const read = <T,>(props: PromptProps<T>) => prompt<T>(props);
```

### prompt 컨트롤과 푸터

defaultValue를 지정해도 입력값과 검증 인자는 타입상 undefined일 수 있습니다. Provider 이전이나 재마운트에서도 현재 노드값을 표시하도록 `value`로 초기화하는 제어 입력을 사용합니다. `defaultValue`는 최초 값으로 남습니다. 함수형 변경은 누적되고 같은 이벤트의 확인은 최신 값을 읽습니다. 사용자 푸터는 `disabled`를 직접 적용하며 프로그래밍 방식 확인은 검증을 실행하지 않습니다. `PromptContentProps`는 확인·취소·context만 제공하고 입력값과 변경 핸들러는 Input과 호출별 prompt 푸터에 속합니다.

```tsx
import { prompt } from '@lerx/promise-modal';

export function editQuantity() {
  return prompt<number>({
    title: 'Quantity',
    defaultValue: 0,
    Input: ({ value, onChange }) => (
      <input
        aria-label="Quantity"
        type="number"
        value={value ?? 0}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    ),
    footer: ({ value, onChange, onConfirm, onCancel, disabled }) => (
      <>
        <span>{value}</span>
        <button
          onClick={() => {
            onChange((current) => (current ?? 0) + 1);
            onConfirm();
          }}
        >
          Add and confirm
        </button>
        <button disabled={disabled} onClick={onConfirm}>
          Confirm
        </button>
        <button onClick={onCancel}>Cancel</button>
      </>
    ),
  });
}
```

## Hooks

훅은 React의 조건 없는 최상위 호출 규칙을 따릅니다. 모달 트리는 포털을 통해 렌더되는 프레임·내용·입력·푸터·래퍼 컴포넌트이며 Provider 일반 자식은 해당 설정 Context 밖입니다.

| 훅                                     | 계약과 사용 위치                                                                                                                                                                                       |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `useModal(config?)`                    | 모든 컴포넌트. 안정적인 함수와 마운트 시점 설정을 사용하고 호출자 언마운트 시 미확정 요청을 취소하며 확정 핸들을 해제합니다.                                                                           |
| `useActiveModalCount(validate?)`       | 모든 컴포넌트. 기본은 visible 노드입니다. 사용자 판별은 기본 판별을 대체하므로 표시된 것만 세려면 `node.visible`을 포함합니다. 숨겨지거나 확정됐지만 alive인 노드도 판별할 수 있습니다. SSR은 0입니다. |
| `useSubscribeModal(id)`                | 모든 컴포넌트. 상태가 아닌 발행 버전을 반환합니다. 없거나 파괴된 id는 -1이고 SSR은 0이며 상태는 프레임 props로 읽습니다. 노드를 공개하지 않습니다.                                                     |
| `useModalOptions()`                    | 모달 트리 안. 모달별 유효 옵션이 아닌 정규화된 Provider 옵션입니다.                                                                                                                                    |
| `useModalBackdrop()`                   | 모달 트리 안. Provider backdrop을 CSS 속성으로 반환합니다.                                                                                                                                             |
| `useModalDuration(id?)`                | 모달 트리 안. 정규화된 ms 문자열과 밀리초 숫자입니다. id를 생략하면 Provider 지속시간, 살아 있는 id를 주면 모달별 지속시간이며 없는 id는 Provider로 대체합니다.                                        |
| `useDestroyAfter(id, delay)`           | 모달 트리 안. 확정된 alive 노드를 숫자 또는 ms/s 지연 뒤 파괴합니다. 경로 숨김으로 시작하지 않으며 지연 변경은 다시 예약합니다. 사용자 수동 파괴에 사용합니다.                                         |
| `useModalAnimation(visible, handlers)` | 모든 컴포넌트. 커밋된 콜백을 다음 애니메이션 프레임에 실행하며 이전 예약은 취소합니다. 파괴하지 않습니다.                                                                                              |
| `useInitializeModal(props?)`           | 모든 컴포넌트. 시스템을 초기화하고 portal과 initialize(element)를 반환합니다. portal을 렌더하며 추가 ModalProvider 대신 사용합니다.                                                                    |

설정 훅과 `useDestroyAfter`는 Provider 일반 자식을 포함한 모달 트리 밖에서 사용 위치를 설명하는 Error를 던집니다.

```tsx
import {
  type ModalNodeView,
  useActiveModalCount,
  useSubscribeModal,
} from '@lerx/promise-modal';

const visibleEditors = (node: ModalNodeView) =>
  node.visible && node.group === 'editor';

export function ModalStatus({ id }: { id: number }) {
  const total = useActiveModalCount();
  const editors = useActiveModalCount(visibleEditors);
  const version = useSubscribeModal(id);
  return (
    <output>
      {total} visible, {editors} editors, subscription version {version}
    </output>
  );
}
```

```tsx
import {
  type ModalFrameProps,
  useModalBackdrop,
  useModalDuration,
  useModalOptions,
} from '@lerx/promise-modal';

export function FrameDetails({ id }: ModalFrameProps) {
  const options = useModalOptions();
  const backdrop = useModalBackdrop();
  const { duration, milliseconds } = useModalDuration(id);
  return (
    <aside style={backdrop}>
      Provider duration: {options.duration}; this modal: {duration} (
      {milliseconds}ms)
    </aside>
  );
}
```

## 설정과 컴포넌트

우선순위·지속시간 정규화·마운트 시점 컴포넌트 정체·프레임과 푸터 타입 예제는 README에 있습니다. `backdrop`은 공용 배경 CSS이며 `background: { data }`는 선택적인 사용자 배경에 애플리케이션 데이터를 전달합니다. 임의 CSS 객체는 아닙니다. `footer: false`는 푸터를 숨기고 레이블 옵션은 React 노드를 받습니다. Provider FooterComponent는 레이블과 콜백을 받으며 호출별 푸터 함수는 레이블 props 대신 종류별 콜백을 받습니다. 푸터에는 onClose가 없고 onConfirm은 인자를 받지 않습니다.

## 접근성

Escape는 클릭으로 순서가 바뀐 경우를 포함하여 살아 있고 보이며 미확정인 모달 중 쌓임 순서가 가장 높은 것에 적용합니다. 그 노드의 유효 `closeOnEscape`가 true일 때만 취소하며 닫을 수 없는 최상위 모달을 건너뛰어 아래 모달을 닫지 않습니다. 순서는 호출별 `closeOnEscape`, 호출별 `closeOnBackdropClick`, Provider `closeOnEscape`, Provider `closeOnBackdropClick`(기본 true)입니다. `useModal` 기본값도 호출 데이터입니다. 명시적 undefined는 상속합니다. 기본 방지 이벤트, `isComposing`, 키 코드 229를 무시하고 root 분리 중에는 키보드 처리를 보류합니다. Escape는 일반 취소 값을 반환하며 prompt는 `returnOnCancel`을 켜지 않으면 `null`입니다.

`alive && visible && dimmed && !settled`인 모달만 포커스·inert 격리·스크롤 잠금에 참여합니다. 표시하거나 경로에 복귀하면 최상위 참여 모달의 첫 탭 가능 요소 또는 바깥 래퍼(`tabIndex={-1}`)로 포커스를 한 번 옮기되 `autoFocus`를 포함한 기존 내부 포커스는 유지합니다. 보이는 미확정 최상위 모달이 dimmed이고 `trapFocus`가 true일 때만 Tab과 Shift+Tab을 순환시킵니다. 최상위가 dimmed false 모달이면 기본 Tab 순서를 유지하며 기존 inert 격리는 페이지를 계속 보호합니다. Provider와 호출별 `trapFocus`·`lockScroll`은 기본 true이며 일반 undefined 상속 병합을 따릅니다. `trapFocus: false`는 순환만 끄며 최초 포커스 이동과 페이지 격리는 유지합니다.

확정 시 페이지 효과를 재평가한 뒤 연결된 열기 전 요소로 포커스를 돌립니다. 다른 미확정 모달 안에 포커스가 있으면 유지합니다. 다른 dimmed 모달 때문에 열기 전 요소가 여전히 inert이면 남은 최상위 dimmed 모달로 이동합니다. 연결이 끊긴 대상은 무시합니다. 경로 숨김·닫힘·파괴는 수동 종료 애니메이션 중에도 즉시 참여에서 빠집니다. 다시 표시하거나 초기화하면 대기 노드를 재평가합니다. 분리된(`root={null}`) 앵커는 페이지 격리나 스크롤 잠금을 수행하지 않습니다.

격리는 앵커의 조상 경로를 따라 `document.body`까지 각 단계의 형제 요소에 `inert` 속성을 겁니다. 기존 inert 속성은 유지하고 라이브러리가 추가한 속성만 제거합니다. 첫 참여 모달이 생기거나 root가 이동할 때 스냅샷을 만들며 이후 추가된 DOM은 건드리지 않아 body에 붙는 드롭다운 포털이 동작할 수 있습니다. 외부 포털은 래퍼의 Tab 순환 밖에 있으므로 사용자 프레임이 포털의 키보드 통합을 맡습니다.

참여 모달 중 `lockScroll: true`가 하나라도 있으면 body overflow를 숨깁니다. 스크롤바 너비가 0보다 크고 100px보다 작을 때만 계산된 오른쪽 패딩에 더하여 페이지 밀림을 보정합니다. 마지막 스크롤 잠금 대상이 빠지면 원래 인라인 overflow와 오른쪽 패딩(우선순위 포함)을 복원합니다. Provider 해제는 페이지 효과와 document keydown 리스너 하나를 정리합니다.

기본 전경은 `role="dialog"`와 `aria-modal="true"`를 제공합니다. 사용자 전경 프레임은 역할·접근 가능한 이름·설명을 직접 제공하고 래퍼가 포커스 기본선을 제공합니다. 모든 dialog에 이름을 지정합니다. 예를 들어 제목과 설명에 `aria-labelledby`·`aria-describedby`를 연결합니다. 보이는 배경은 `dimmed || closeOnBackdropClick`일 때 포인터를 받지만 클릭 취소는 `closeOnBackdropClick`이 켜진 경우만 수행합니다. 뒤 페이지를 클릭할 수 있는 토스트는 `dimmed: false, closeOnBackdropClick: false`로 설정하며 포커스 이동·복원·페이지 격리·스크롤 잠금에 참여하지 않습니다.

## 소유권과 경로 표시

ModalProvider 또는 useInitializeModal 초기화 주체 하나만 포털을 소유합니다. 추가 주체는 개발 환경에서 한 번 경고하고 대기하며 정리는 자신의 소유권 또는 대기 등록만 제거합니다. 소유자가 떠나면 첫 대기자가 이어받습니다. 대기자가 없으면 마이크로태스크가 alive 노드를 취소하되 같은 커밋에서 재초기화하면 보존합니다. 마운트 전 대기 요청은 대기열에 남으므로 브라우저 초기화 주체를 마운트하여 처리하십시오.

`alive`는 저장소 유지, `visible`은 표시, `settled`는 최초 결과나 오류의 확정입니다. 경로 숨김은 미확정 결과를 보존하며 미확정 노드만 다시 표시할 수 있습니다. 중단과 호출자 정리는 숨겨진 요청도 취소합니다. 수동 파괴 모달은 종료 애니메이션을 위해 닫힌 뒤 alive일 수 있지만 다시 표시되지 않습니다. `useDestroyAfter`는 확정 뒤에만 시작합니다.

기본 경로 훅은 가능하면 Navigation API 이벤트를 쓰고 그 외에는 숨겨진 요청과 종료 프레임을 포함한 alive 노드가 있을 때만 폴링합니다. 기본 요청은 여는 순간의 pathname에 속합니다. 라우터를 따르려면 `{ pathname }`을 반환하는 훅을 전달합니다. 다음 예제는 페이지와 모달 내용이 같은 경로를 바꾸도록 Context를 사용합니다.

```tsx
import { createContext, useContext, useState } from 'react';

import { ModalProvider, alert } from '@lerx/promise-modal';

const Route = createContext('/editor');
function useAppPathname() {
  return { pathname: useContext(Route) };
}

export function RoutedApp() {
  const [pathname, setPathname] = useState('/editor');
  return (
    <Route.Provider value={pathname}>
      <ModalProvider usePathname={useAppPathname}>
        <button onClick={() => setPathname('/editor')}>Editor</button>
        <button
          onClick={() =>
            void alert({
              title: 'Editor request',
              content: () => (
                <button onClick={() => setPathname('/other')}>
                  Hide by changing route
                </button>
              ),
            })
          }
        >
          Open
        </button>
      </ModalProvider>
    </Route.Provider>
  );
}
```

## AbortSignal 취소

중단은 일반 취소 값으로 완료됩니다. alert는 완료되고 confirm은 false이며 prompt는 returnOnCancel이 현재 값을 반환하는 경우를 제외하고 null입니다. signal 하나로 여러 요청을 취소할 수 있습니다. 이미 중단된 요청은 생성하지 않으며 대기 요청은 렌더 전에 제거합니다. 확정 시 중단 리스너를 해제하므로 이후 중단은 무효입니다. 페이지의 수동 중단 버튼은 dimmed 모달 뒤에서 inert가 되므로 모달 안에 두거나 외부 이벤트·타이머 또는 의도적으로 비어두운 표시를 사용합니다.

```tsx
import { confirm } from '@lerx/promise-modal';

export async function cancelAfterDelay() {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 3000);
  try {
    return await confirm({ title: 'Continue?', signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}
```

## 토스트

프레임 onClose를 호출하는 타이머가 요청을 닫으며 useDestroyAfter만으로는 닫지 않습니다. 이 토스트는 자동 파괴를 사용하고 페이지를 격리하지 않습니다. 종료 애니메이션을 추가하려면 README의 수동 프레임 패턴을 사용합니다.

```tsx
import { type PropsWithChildren, type ReactNode, useEffect } from 'react';

import { type ModalFrameProps, alert } from '@lerx/promise-modal';

function ToastFrame({ children, onClose }: PropsWithChildren<ModalFrameProps>) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);
  return (
    <aside
      role="status"
      style={{
        position: 'fixed',
        bottom: 20,
        background: '#222',
        color: 'white',
      }}
    >
      {children}
    </aside>
  );
}

export function toast(message: ReactNode) {
  return alert({
    content: message,
    footer: false,
    dimmed: false,
    closeOnBackdropClick: false,
    ForegroundComponent: ToastFrame,
  });
}
```

## 렌더 오류

호출 위치에서 열기·렌더 오류를 처리합니다. 개별 표시 오류는 해당 모달만 거부하고 파괴하며 다른 모달과 이후 요청은 유지합니다. 공용 앵커 오류는 모든 alive 노드를 거부하고 파괴한 뒤 새 모달 등록 때만 다시 시도합니다. 취소와 거부는 다르므로 실패한 확인 렌더를 사용자의 거절로 기록하지 마십시오.

## 플랫폼 통합

React 18과 19는 같은 공개 계약을 제공합니다. 두 런타임 번들은 use client로 시작하며 DOM 없는 가져오기와 서버 렌더를 layout effect 경고 없이 지원합니다. 서버 렌더는 포털을 만들지 않고 모달을 0으로 세며 브라우저 모달 함수를 호출하면 안 됩니다.

호환되는 내부 상태 버전은 JavaScript 영역 하나에서 요청·스타일 식별자·소유권·키보드·페이지 효과를 공유합니다. 호환되지 않는 버전은 격리하고 개발 환경에서 경고합니다. 다른 창·영역은 공유하지 않습니다. root 예제는 iframe 문서가 아닌 현재 문서의 요소를 대상으로 합니다. CommonJS TypeScript 전용 .d.cts 선언은 제공하지 않습니다.
