# @lerx/promise-modal

React 컴포넌트 안팎에서 사용하는 Promise 기반 모달입니다. 수명주기와 통합 계약은 [사양서](./docs/ko/SPECIFICATION.md)를 확인하십시오.

## 설치와 호환성

```sh
yarn add @lerx/promise-modal
```

React와 React DOM은 같은 버전의 18 또는 19를 사용합니다. 브라우저 상호작용에는 DOM이 필요하며 페이지 격리는 브라우저의 `inert` 지원을 사용합니다. ESM·CommonJS 번들은 모두 `'use client'`를 선언합니다. DOM 없는 가져오기와 서버 렌더는 React 18 layout effect 경고 없이 지원합니다. 모달 열기 함수는 브라우저에서만 호출하며 서버 렌더에는 포털이 없고 활성 개수는 0입니다.

## 설정

```tsx
import { ModalProvider, alert } from '@lerx/promise-modal';

export function App() {
  return (
    <ModalProvider options={{ duration: '250ms' }}>
      <button onClick={() => void alert({ title: 'Hello' })}>Open alert</button>
    </ModalProvider>
  );
}
```

## 결과와 입력

`alert`는 값 없이 완료되고 `confirm`은 확인 시 `true`, 취소 시 `false`입니다. `prompt<T>`는 `Promise<T | undefined | null>`을 반환합니다. 확인은 `undefined`를 포함한 현재 입력값을 보존하고 일반 취소는 `null`입니다. `returnOnCancel: true`의 취소는 현재 값이며 렌더 전에는 `defaultValue`입니다. 미입력 확인을 빈 문자열로 받으려면 `defaultValue: ''`를 지정합니다. 결과의 필드를 읽기 전에 `null`과 `undefined`를 확인하십시오.

```tsx
import { alert, confirm, prompt } from '@lerx/promise-modal';

export async function editName() {
  if (!(await confirm({ title: 'Edit name?' }))) return;
  const name = await prompt<string>({
    title: 'Name',
    defaultValue: '',
    Input: ({ value, onChange }) => (
      <input
        aria-label="Name"
        value={value ?? ''}
        onChange={(event) => onChange(event.target.value)}
      />
    ),
    disabled: (value) => !value?.trim(),
  });
  if (name === null || name === undefined) return;
  await alert({ title: 'Saved', content: name, subtype: 'success' });
}
```

함수형 `onChange`는 이벤트 순서대로 누적되고 같은 이벤트의 확인은 최신 값을 읽습니다. `disabled`는 확인 버튼을 제어하며 사용자 컨트롤의 `onConfirm` 직접 호출을 막지는 않습니다.

## 사용자 정의 컴포넌트

props 구조를 복사하는 대신 공개 타입을 사용합니다. 전경은 `children`을 받고 배경은 프레임 메타데이터와 선택적인 `background.data`를 받으며 children이나 `onClick` prop은 받지 않습니다. Provider 푸터는 레이블·숨김 플래그·선택적인 `onCancel`·인자 없는 `onConfirm`을 받고 `type`이나 `onClose`는 받지 않습니다. `onCancel`이 있을 때만 취소 버튼을 표시합니다. 프레임의 `onClose`는 취소이며 내용과 푸터에서는 `onCancel`을 사용합니다.

```tsx
import type { PropsWithChildren } from 'react';

import {
  type FooterComponentProps,
  type ModalFrameProps,
  ModalProvider,
  type WrapperComponentProps,
  confirm,
} from '@lerx/promise-modal';

function Frame({ id, children }: PropsWithChildren<ModalFrameProps>) {
  return (
    <section
      role="dialog"
      aria-modal="true"
      aria-labelledby={`title-${id}`}
      style={{ background: 'white', padding: 24 }}
    >
      <h2 id={`title-${id}`}>Review changes</h2>
      {children}
    </section>
  );
}

function Content({ children }: WrapperComponentProps) {
  return <div>{children}</div>;
}

function Footer({
  onConfirm,
  onCancel,
  disabled,
  confirmLabel,
  cancelLabel,
  hideConfirm,
  hideCancel,
}: FooterComponentProps) {
  return (
    <footer>
      {!hideCancel && onCancel && (
        <button onClick={onCancel}>{cancelLabel ?? 'Cancel'}</button>
      )}
      {!hideConfirm && (
        <button onClick={onConfirm} disabled={disabled}>
          {confirmLabel ?? 'Confirm'}
        </button>
      )}
    </footer>
  );
}

function Background({ background }: ModalFrameProps<object, string>) {
  return <span>{background?.data}</span>;
}

export function CustomApp() {
  return (
    <ModalProvider
      ForegroundComponent={Frame}
      BackgroundComponent={Background}
      ContentComponent={Content}
      FooterComponent={Footer}
      context={{ theme: 'light' }}
    >
      <button
        onClick={() =>
          void confirm({ content: 'Save?', background: { data: 'review' } })
        }
      >
        Review
      </button>
    </ModalProvider>
  );
}
```

Provider 컴포넌트 props는 열린 prompt 입력을 유지하도록 마운트 시점에 고정합니다. 정체 변경은 무시하고 개발 환경에서 prop마다 한 번 경고하며 운영에서는 경고하지 않습니다. 바뀌는 데이터는 `context`로 전달합니다. 옵션은 소비 훅과 이후 요청에 반영되며 기존 노드는 생성 시 정한 모달별 옵션을 유지합니다. 프레임은 `group`·`subtype`·`settled`를 받고 alert 내용도 `context`를 받습니다. 문자열 제목·부제목·내용은 대응 Provider 래퍼로 감싸고 React 요소는 직접 렌더합니다.

### 호출별 푸터와 중첩 모달

호출별 푸터에는 해당 모달 종류의 콜백이 있습니다. alert는 확인만, confirm은 확인·취소를 제공하며 prompt는 `value`·함수형 `onChange`·`disabled`도 제공합니다. 콜백 인자로 결과를 정하지 않습니다. confirm은 boolean을 반환하고 prompt는 현재 입력을 읽습니다.

```tsx
import { confirm } from '@lerx/promise-modal';

export function nestedConfirmation() {
  return confirm({
    title: 'Review',
    footer: ({ onConfirm, onCancel }) => (
      <>
        <button onClick={onCancel}>Cancel</button>
        <button
          onClick={async () => {
            if (
              await confirm({
                title: 'Are you sure?',
                closeOnBackdropClick: false,
              })
            ) {
              onConfirm();
            } else {
              onCancel();
            }
          }}
        >
          Continue
        </button>
      </>
    ),
  });
}
```

## root와 초기화

`root`를 생략하면 `document.body`, 요소를 주면 해당 컨테이너, `null`이면 초기화를 기다립니다. ref만으로는 초기화가 미뤄지지 않습니다. `initialize(element)`로도 root를 정하며 마지막 root prop 변경 또는 initialize 호출이 우선합니다. 같은 앵커를 옮겨 입력과 Promise를 유지합니다. null로 바꾸면 앵커를 떼고 마운트된 모달을 보존하며 새 요청은 대기시킵니다. 요소로 복귀하면 재개하고 처음부터 null이면 앵커를 만들지 않습니다.

```tsx
import { useState } from 'react';

import { ModalProvider, prompt } from '@lerx/promise-modal';

export function ContainerApp() {
  const [root, setRoot] = useState<HTMLDivElement | null>(null);
  return (
    <ModalProvider root={root}>
      <div ref={setRoot} />
      <button
        onClick={() =>
          void prompt<string>({
            title: 'Container prompt',
            defaultValue: '',
            Input: ({ value, onChange }) => (
              <input
                aria-label="Value"
                value={value ?? ''}
                onChange={(event) => onChange(event.target.value)}
              />
            ),
          })
        }
      >
        Open in container
      </button>
    </ModalProvider>
  );
}
```

`useInitializeModal`도 같은 root를 받습니다. manual 모드는 `initialize(element)` 또는 이후 root 변경까지 초기 root만 보류합니다. 반환된 portal은 항상 렌더합니다.

```tsx
import { useEffect, useRef } from 'react';

import { alert, useInitializeModal } from '@lerx/promise-modal';

export function ManualApp() {
  const container = useRef<HTMLDivElement>(null);
  const { initialize, portal } = useInitializeModal({ mode: 'manual' });
  useEffect(() => {
    if (container.current) initialize(container.current);
  }, [initialize]);
  return (
    <>
      <div ref={container} />
      <button onClick={() => void alert({ title: 'Hello' })}>Open</button>
      {portal}
    </>
  );
}
```

## 컴포넌트 소유권과 옵션

호출 컴포넌트 언마운트 시 미확정 요청을 취소하려면 `useModal`을 사용합니다. 확정된 요청은 즉시 추적 목록에서 빠집니다. 정적 호출은 호출자보다 오래 유지될 수 있지만 Provider 소유권을 따릅니다. `useModal(config)`는 마운트 시점 기본값을 보관하므로 바뀌는 값은 호출별로 전달합니다.

```tsx
import { type OverridableHandleProps, useModal } from '@lerx/promise-modal';

const defaults: OverridableHandleProps = { group: 'editor', duration: '0.3s' };

export function SaveButton() {
  const modal = useModal(defaults);
  return (
    <button
      onClick={async () => {
        const accepted = await modal.confirm({ title: 'Save?', duration: 150 });
        console.log(accepted);
      }}
    >
      Save
    </button>
  );
}
```

우선순위는 라이브러리 기본값, Provider 옵션, `useModal` 설정, 호출 인자 순입니다. `undefined`는 상속하고 `0`과 `false`는 덮어씁니다. `duration`은 음수가 아닌 밀리초 숫자·소수 ms 문자열·소수 s 문자열을 받습니다(`300`, `'300ms'`, `'0.3s'`). 잘못된 값은 호출에서는 Provider 지속시간, Provider에서는 라이브러리 기본값으로 대체하고 개발 경고를 냅니다. 정규화된 문자열은 CSS에 `ms`를 덧붙이지 않고 그대로 사용합니다. Provider와 모달별 지속시간의 차이는 [훅 참조](./docs/ko/SPECIFICATION.md#hooks)를 확인하십시오.

## 애니메이션과 파괴

자동 파괴는 닫힌 비수동 모달을 정해진 지속시간 뒤 제거합니다. 종료 애니메이션에는 `manualDestroy: true`를 지정하고 프레임이 확정 뒤 파괴하도록 구성합니다. `useDestroyAfter`는 요청을 닫지 않으며 경로 숨김만으로 시작하지 않습니다. 지연 시간이 바뀌면 파괴를 다시 예약합니다. `useModalAnimation`은 커밋된 표시 상태의 콜백을 다음 애니메이션 프레임에 실행하고 이전 예약은 취소합니다. 두 훅은 독립적입니다.

```tsx
import { type PropsWithChildren, useRef } from 'react';

import {
  type ModalFrameProps,
  ModalProvider,
  alert,
  useDestroyAfter,
  useModalAnimation,
  useModalDuration,
} from '@lerx/promise-modal';

function AnimatedFrame({
  id,
  visible,
  children,
}: PropsWithChildren<ModalFrameProps>) {
  const ref = useRef<HTMLDivElement>(null);
  const { duration } = useModalDuration(id);
  useModalAnimation(visible, {
    onVisible: () => {
      if (ref.current) ref.current.style.opacity = '1';
    },
    onHidden: () => {
      if (ref.current) ref.current.style.opacity = '0';
    },
  });
  useDestroyAfter(id, duration);
  return (
    <section
      ref={ref}
      role="dialog"
      aria-modal="true"
      aria-label="Notification"
      aria-hidden={!visible}
      style={{
        opacity: 0,
        transition: `opacity ${duration}`,
        background: 'white',
        padding: 24,
      }}
    >
      {children}
    </section>
  );
}

export function AnimatedApp() {
  return (
    <ModalProvider
      ForegroundComponent={AnimatedFrame}
      options={{ manualDestroy: true }}
    >
      <button
        onClick={() => void alert({ title: 'Animated', duration: '0.3s' })}
      >
        Open
      </button>
    </ModalProvider>
  );
}
```

## 접근성

Escape는 유효 `closeOnEscape`가 false인 경우를 제외하고 보이는 미확정 최상위 모달만 취소합니다. 호출 Esc, 호출 배경 클릭, Provider Esc, Provider 배경 클릭(기본 true) 순으로 정하며 `useModal` 기본값도 호출 데이터입니다. 기본 방지 이벤트와 IME 이벤트는 무시합니다. 닫을 수 없는 최상위 모달이 있으면 하위 모달을 닫지 않습니다.

보이는 미확정 dimmed 모달은 내부로 포커스를 옮기고 페이지를 격리하며 기본으로 Tab 가두기와 body 스크롤 잠금을 수행합니다. `trapFocus: false`는 순환만 끄고 최초 포커스 이동과 격리는 유지합니다. `lockScroll: false`는 스크롤 잠금을 끕니다. 둘 다 Provider와 호출별로 지정할 수 있습니다. dimmed false 모달은 포커스 이동·복원·격리·스크롤 잠금에 참여하지 않습니다. 사용자 전경은 역할·접근 가능한 이름·설명을 제공하고 라이브러리 래퍼가 포커스 동작을 제공합니다. 기본 프레임은 dialog 역할과 aria-modal을 제공하지만 접근 가능한 이름은 애플리케이션이 지정해야 합니다. 스택·root·외부 포털 제한은 [접근성 계약](./docs/ko/SPECIFICATION.md#접근성)을 확인하십시오.

보이는 dimmed 배경은 `closeOnBackdropClick: false`여도 포인터를 막습니다. 뒤 페이지를 클릭할 수 있는 토스트는 `dimmed`와 `closeOnBackdropClick`을 모두 false로 설정합니다.

## 오류와 수명주기

결과는 한 번만 확정됩니다. 내용·입력·프레임의 렌더 오류는 해당 요청을 거부하므로 호출 위치에서 오류를 처리합니다. 다른 모달과 이후 요청은 계속 동작합니다. 미확정 모달의 파괴는 먼저 취소한 뒤 프레임을 제거합니다. AbortSignal 중단은 거부가 아닌 취소 값으로 완료됩니다.

```tsx
import { alert } from '@lerx/promise-modal';

export async function showBrokenContent() {
  try {
    await alert({
      content: () => {
        throw new Error('Cannot render');
      },
    });
  } catch (error) {
    console.error('Modal failed', error);
  }
  await alert({ title: 'Other requests still work' });
}
```

경로 이동은 미확정 요청을 확정 없이 숨기며 복귀하면 다시 표시합니다. 숨겨진 모달도 중단과 호출자 정리로 취소됩니다. 확정된 모달은 수동 파괴 모드에서도 다시 나타나지 않습니다. 초기화 주체 하나만 포털을 소유하며 추가 Provider는 대기하고 개발 환경에서 한 번 경고합니다. 소유자가 언마운트되면 첫 대기자가 이어받고 대기자가 없으면 현재 커밋 뒤 열린 요청을 취소합니다. 같은 커밋 재마운트와 StrictMode 점검은 미확정 결과와 prompt 입력을 유지하며 마운트 전 대기 요청은 대기열에 남습니다.

## 추가 참조

모든 훅·취소·경로·토스트·공개 래퍼 타입은 [사양서](./docs/ko/SPECIFICATION.md)를 확인하십시오. props 구조의 기준은 배포 선언이며 노드 클래스는 공개하지 않습니다. [에이전트 스킬](./docs/agents/skills/promise-modal-skill/SKILL.md)은 통합 판단 기준을 설명합니다.

## 라이선스

MIT.
