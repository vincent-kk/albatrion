# @lerx/promise-modal

[![Typescript](https://img.shields.io/badge/typescript-✔-blue.svg)]()
[![Javascript](https://img.shields.io/badge/javascript-✔-yellow.svg)]()
[![React](https://img.shields.io/badge/react-✔-61DAFB.svg)]()

---

## 개요

`@lerx/promise-modal`은 React를 기반으로 한 보편적인 모달 유틸리티입니다.

주요 기능은 다음과 같습니다:

- React 컴포넌트에 포함되지 않은 곳에서도 사용할 수 있습니다
- 모달을 열은 후 결과를 프로미스로 반환할 수 있습니다
- 다양한 모달 유형(알림, 확인, 입력) 지원
- 고도로 커스터마이징 가능한 컴포넌트 구조

---

## 설치

```bash
yarn add @lerx/promise-modal
```

또는

```bash
npm install @lerx/promise-modal
```

---

## 호환성 안내

**지원 환경:**

- Node.js 16.11.0 이상
- 최신 브라우저 (Chrome 94+, Firefox 93+, Safari 15+)

**레거시 환경 지원이 필요한 경우:**
Babel 등의 트랜스파일러를 사용하여 타겟 환경에 맞게 변환해주세요.

---

## 사용 방법

### 1. 모달 제공자 설정

응용 프로그램의 루트에 `ModalProvider`를 설치합니다:

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

맞춤형 옵션과 컴포넌트를 적용할 수도 있습니다:

```tsx
import { ModalProvider } from '@lerx/promise-modal';

import {
  CustomBackground,
  CustomContent,
  CustomFooter,
  CustomForeground,
  CustomSubtitle,
  CustomTitle,
} from './components';

function App() {
  return (
    <ModalProvider
      ForegroundComponent={CustomForeground}
      BackgroundComponent={CustomBackground}
      TitleComponent={CustomTitle}
      SubtitleComponent={CustomSubtitle}
      ContentComponent={CustomContent}
      FooterComponent={CustomFooter}
      options={{
        duration: '250ms', // 애니메이션 지속 시간
        backdrop: 'rgba(0, 0, 0, 0.35)', // 배경 오버레이 색상
        manualDestroy: false, // 기본 자동 파괴 동작
        closeOnBackdropClick: true, // 기본 배경 클릭 동작
      }}
      context={{
        // 모든 모달 컴포넌트에서 액세스 가능한 컨텍스트 값
        theme: 'light',
        locale: 'en-US',
      }}
    >
      <YourApp />
    </ModalProvider>
  );
}
```

### 2. 기본 모달 사용

#### 알림 모달

알림 모달은 확인 버튼과 함께 간단한 정보를 표시합니다.

```tsx
import { alert } from '@lerx/promise-modal';

// 기본 사용법
async function showAlert() {
  await alert({
    title: '알림',
    content: '작업이 완료되었습니다.',
  });
  console.log('사용자가 모달을 닫았습니다.');
}

// 다양한 옵션 사용
async function showDetailedAlert() {
  await alert({
    subtype: 'success', // 'info' | 'success' | 'warning' | 'error'
    title: '성공',
    subtitle: '상세 정보',
    content: '작업이 성공적으로 완료되었습니다.',
    dimmed: true, // 배경 흐림
    closeOnBackdropClick: true, // 배경 클릭 시 닫기
    // 닫기 애니메이션을 사용하려면 manualDestroy를 true로 설정해야 합니다
    manualDestroy: false, // 자동 파괴 (false: 자동, true: 수동)
    // 배경에 전달할 데이터
    background: {
      data: 'custom-data',
    },
  });
}
```

#### 확인 모달

확인 모달은 사용자의 확인이 필요한 작업에 사용됩니다.

```tsx
import { confirm } from '@lerx/promise-modal';

async function showConfirm() {
  const result = await confirm({
    title: '확인',
    content: '이 데이터를 삭제하시겠습니까?',
    // 사용자 정의 하단 텍스트
    footer: {
      confirm: '삭제',
      cancel: '취소',
    },
  });

  if (result) {
    console.log('사용자가 확인을 클릭했습니다.');
    // 삭제 로직 실행
  } else {
    console.log('사용자가 취소를 클릭했습니다.');
  }
}
```

#### 프롬프트 모달

프롬프트 모달은 사용자로부터 입력을 받는 데 사용됩니다.

```tsx
import { prompt } from '@lerx/promise-modal';

async function showPrompt() {
  // 텍스트 입력
  const name = await prompt<string>({
    title: '이름 입력',
    content: '이름을 입력해 주세요.',
    defaultValue: '', // 기본값
    Input: ({ value, onChange }) => {
      // 중요: value는 현재 값이며, onChange는 값을 업데이트하는 함수입니다
      return (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="이름을 입력하세요"
        />
      );
    },
    // 입력 값을 검증하여 확인 버튼을 제어합니다
    disabled: (value) => (value?.length ?? 0) < 2,
  });

  console.log('입력된 이름:', name);

  // 복잡한 데이터 입력
  const userInfo = await prompt<{ name: string; age: number }>({
    title: '사용자 정보',
    defaultValue: { name: '', age: 0 },
    Input: ({ value = { name: '', age: 0 }, onChange }) => (
      <div>
        <input
          value={value.name}
          onChange={(e) => onChange({ ...value, name: e.target.value })}
          placeholder="이름"
        />
        <input
          type="number"
          value={value.age}
          onChange={(e) => onChange({ ...value, age: Number(e.target.value) })}
          placeholder="Age"
        />
      </div>
    ),
  });

  console.log('사용자 정보:', userInfo);
}
```

### 3. 사용자 정의 컴포넌트 사용

모달의 외관과 동작을 사용자 정의할 수 있습니다:

```tsx
import { css } from '@emotion/css';
import { ModalProvider, alert, confirm } from '@lerx/promise-modal';

// 사용자 정의 배경 컴포넌트
const CustomForegroundComponent = ({ children, type, ...props }) => {
  return (
    <div
      className={css`
        background-color: #ffffff;
        border-radius: 12px;
        box-shadow: 0 4px 24px rgba(0, 0, 0, 0.1);
        width: 90%;
        max-width: 500px;
        padding: 24px;
        position: relative;
      `}
    >
      {children}
    </div>
  );
};

// 배경 데이터 활용 커스텀 배경 컴포넌트
const CustomBackgroundComponent = ({ children, onClick, background }) => {
  // 배경 데이터에 따라 다른 스타일 적용
  const getBgColor = () => {
    if (background?.data === 'alert') return 'rgba(0, 0, 0, 0.7)';
    if (background?.data === 'confirm') return 'rgba(0, 0, 0, 0.5)';
    if (background?.data === 'prompt') return 'rgba(0, 0, 0, 0.6)';
    return 'rgba(0, 0, 0, 0.4)';
  };

  return (
    <div
      className={css`
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: ${getBgColor()};
        z-index: 1000;
      `}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

// 사용자 정의 제목 컴포넌트
const CustomTitleComponent = ({ children, context }) => {
  return (
    <h2
      className={css`
        font-size: 24px;
        margin-bottom: 8px;
        color: ${context?.theme === 'dark' ? '#ffffff' : '#333333'};
      `}
    >
      {children}
    </h2>
  );
};

// 사용자 정의 부제목 컴포넌트
const CustomSubtitleComponent = ({ children, context }) => {
  return (
    <h3
      className={css`
        font-size: 16px;
        margin-bottom: 16px;
        color: ${context?.theme === 'dark' ? '#cccccc' : '#666666'};
      `}
    >
      {children}
    </h3>
  );
};

// 사용자 정의 콘텐츠 컴포넌트
const CustomContentComponent = ({ children, context }) => {
  return (
    <div
      className={css`
        margin-bottom: 24px;
        color: ${context?.theme === 'dark' ? '#eeeeee' : '#444444'};
      `}
    >
      {children}
    </div>
  );
};

// 사용자 정의 푸터 컴포넌트
const CustomFooterComponent = ({
  onConfirm,
  onClose,
  onCancel,
  type,
  disabled,
}) => {
  return (
    <div
      className={css`
        display: flex;
        justify-content: flex-end;
        gap: 12px;
        margin-top: 24px;
      `}
    >
      {/* 확인 및 프롬프트 모달에 취소 버튼 표시 */}
      {(type === 'confirm' || type === 'prompt') && (
        <button
          className={css`
            padding: 8px 16px;
            border: 1px solid #ccc;
            background: none;
            border-radius: 4px;
            cursor: pointer;
            &:hover {
              background-color: #f3f3f3;
            }
          `}
          onClick={type === 'confirm' ? () => onConfirm(false) : onCancel}
        >
          취소
        </button>
      )}
      <button
        className={css`
          패딩: 8px 16px;
          배경색: #4a90e2;
          색상: 흰색;
          경계선: 없음;
          경계선반경: 4px;
          커서: ${disabled ? 'not-allowed' : 'pointer'};
          투명도: ${disabled ? 0.6 : 1};
          &:hover {
            background-color: ${disabled ? '#4a90e2' : '#357ac7'};
          }
        `}
        onClick={() => onConfirm(type === 'confirm' ? true : undefined)}
        disabled={disabled}
      >
        확인
      </button>
    </div>
  );
};

// 글로벌 설정 제공자
function App() {
  return (
    <ModalProvider
      ForegroundComponent={CustomForegroundComponent}
      BackgroundComponent={CustomBackgroundComponent}
      TitleComponent={CustomTitleComponent}
      SubtitleComponent={CustomSubtitleComponent}
      ContentComponent={CustomContentComponent}
      FooterComponent={CustomFooterComponent}
      options={{
        duration: 300, // 애니메이션 지속 시간 (ms)
      }}
      context={{
        // 모든 모달에서 접근 가능한 컨텍스트
        theme: 'light',
        locale: 'en-US',
      }}
    >
      <YourApp />
    </ModalProvider>
  );
}

// 특정 모달에 커스텀 컴포넌트 적용
async function showCustomAlert() {
  await alert({
    title: '알림',
    content: '콘텐츠',
    // 이 모달에만 적용되는 커스텀 컴포넌트
    ForegroundComponent: ({ children }) => (
      <div
        className={css`
          background-color: #f0f8ff;
          padding: 30px;
          border-radius: 16px;
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
        `}
      >
        {children}
      </div>
    ),
    // 배경 데이터 전달
    background: {
      data: 'custom-alert',
    },
  });
}
```

### 4. 커스텀 앵커 및 초기화 사용

`root`를 생략하면 `document.body`, 요소를 주면 해당 컨테이너, `null`이면 초기화를 기다립니다. ref만 넘겨도 자동 초기화합니다. `initialize(element)`는 명령형으로 root를 정하며 마지막 호출 또는 `root` prop 변경이 우선합니다. 같은 앵커를 컨테이너 사이에서 옮기므로 열린 입력과 Promise를 유지합니다. `null`로 바꾸면 앵커를 떼고 마운트된 모달은 보존하며 새 요청은 대기시킵니다. 요소로 복귀하면 앵커를 붙이고 대기열을 처리합니다. 처음부터 null이면 앵커를 만들지 않습니다. `useInitializeModal`도 같은 `root`를 받으며 `mode: 'manual'`은 `initialize(element)` 또는 이후 root 변경까지 초기 root를 보류합니다. 반환된 `portal`은 항상 렌더합니다.

모달이 렌더링될 DOM 요소를 지정할 수 있습니다:

```tsx
import { useEffect, useRef } from 'react';

import {
  ModalProvider,
  ModalProviderHandle,
  alert,
  useInitializeModal,
} from '@lerx/promise-modal';

// refs 사용
function CustomAnchorExample() {
  // 모달 제공자 핸들 참조
  const modalProviderRef = useRef<ModalProviderHandle>(null);
  // 모달 표시용 컨테이너 참조
  const modalContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 컨테이너가 준비되면 모달 초기화
    if (modalContainerRef.current && modalProviderRef.current) {
      modalProviderRef.current.initialize(modalContainerRef.current);
    }
  }, []);

  return (
    <ModalProvider ref={modalProviderRef}>
      <div>
        {/* 모달이 이 div 내부에 렌더링됩니다 */}
        <div
          ref={modalContainerRef}
          style={{
            backgroundColor: '#f0f0f0',
            width: '100%',
            height: '500px',
            position: 'relative',
            overflow: 'hidden',
          }}
        />

        <button
          onClick={() =>
            alert({ title: '알림', content: '커스텀 앵커에 표시됨.' })
          }
        >
모달 표시
</button>
      </div>
    </ModalProvider>
  );
}

// useInitializeModal 훅 사용
function CustomAnchorWithHookExample() {
  // useInitializeModal 훅 (수동 모드: 수동 초기화)
  const { initialize, portal } = useInitializeModal({ mode: 'manual' });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      // 모달 초기화 (컨테이너 요소로)
      initialize(containerRef.current);
    }
  }, [initialize]);

  return (
    <div>
      {/* 모달 렌더링용 컨테이너 */}
      <div
        ref={containerRef}
        style={{
          backgroundColor: '#f0f0f0',
          width: '100%',
          height: '500px',
        }}
      />

      <button
        onClick={() =>
          alert({ title: '알림', content: '커스텀 앵커에 표시됨.' })
        }
      >
모달 표시
</button>

{/* 다른 위치에 포털 렌더링 (선택 사항) */}
<div id=“another-container”>{portal}</div>
    </div>
  );
}
```

### 5. 토스트 메시지 구현

`promise-modal`을 사용하여 토스트 메시지 기능을 구현할 수 있습니다. 이 예제는 프로젝트의 실제 구현을 기반으로 합니다:

```tsx
import React, { type ReactNode, useEffect, useRef } from 'react';

import { css } from '@emotion/css';
import {
  ModalFrameProps,
  alert,
  useDestroyAfter,
  useModalAnimation,
  useModalDuration,
} from '@lerx/promise-modal';

// 토스트 포그라운드 컴포넌트 정의
const ToastForeground = ({
  id,
  visible,
  children,
  onClose,
  hideAfterMs = 3000,
}) => {
  const modalRef = useRef(null);
  const { duration } = useModalDuration();

// 지정된 시간 후 자동 닫기
useEffect(() => {
    const timer = setTimeout(onClose, hideAfterMs);
    return () => clearTimeout(timer);
}, [onClose, hideAfterMs]);

// 애니메이션 처리
useModalAnimation(visible, {
    onVisible: () => {
      modalRef.current?.classList.add('visible');
    },
    onHidden: () => {
      modalRef.current?.classList.remove('visible');
    },
  });

// 닫힌 후 파괴
useDestroyAfter(id, duration);

return (
    <div
      ref={modalRef}
      className={css`
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%) translateY(100px);
        opacity: 0;
        transition:
          transform ${duration},
          opacity ${duration};
        &.visible {
          transform: translateX(-50%) translateY(0);
          opacity: 1;
        }
      `}
    >
      {children}
    </div>
  );
};

// 토스트 메시지 인터페이스
interface ToastProps {
  message: ReactNode;
  duration?: number;
}

// 이전 토스트 제거 핸들러
onDestroyPrevToast: () => void;

// 토스트 표시 함수
export const toast = ({ message, duration = 1250 }: ToastProps) => {
  // 이전 토스트가 존재하면 제거
  onDestroyPrevToast?.();

  return alert({
    content: message,
    ForegroundComponent: (props: ModalFrameProps) => {
      // 새 토스트의 제거 함수를 저장
onDestroyPrevToast = props.onDestroy;
return <ToastForeground {...props} hideAfterMs={duration} />;
    },
    footer: false, // 하단 바 숨기기
dimmed: false, // 배경 어두워짐 비활성화
closeOnBackdropClick: false, // 배경 클릭 시 닫기 비활성화
  });
};

// 사용 예시
function showToastExample() {
  toast({
    message: (
      <div
        className={css`
          background-color: #333;
          color: white;
          padding: 12px 24px;
          border-radius: 8px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        `}
>
작업 완료!
</div>
    ),
    duration: 2000, // 2초 후 자동 닫기
  });
}
```

### 6. 다양한 모달 구성 옵션

다양한 모달 구성 옵션 활용 예시:

```tsx
import { alert, confirm } from '@lerx/promise-modal';

// 기본 알림 모달
async function showBasicAlert() {
  await alert({
    title: '기본 알림',
    content: '이것은 기본 설정으로 설정된 알림 모달입니다.',
  });
}

// 유형별 모달 설정
async function showModalByType() {
  // 성공 알림
  await alert({
    title: '성공',
    content: '작업이 성공적으로 완료되었습니다.',
    subtype: 'success',
    dimmed: true,
  });

  // 경고 확인
  const result = await confirm({
    title: '경고',
    content: '이 작업은 되돌릴 수 없습니다. 계속하시겠습니까?',
    subtype: 'warning',
    closeOnBackdropClick: false, // 배경 클릭으로 닫히지 않도록 방지
  });

  // 오류 알림
  await alert({
    title: '오류',
    content: '작업이 완료되지 않았습니다.',
    subtype: 'error',
    // 사용자 정의 하단 텍스트
    footer: {
      confirm: '동의합니다',
    },
  });
}

// 수동 파괴 모드 사용
async function showManualDestroyModal() {
  await alert({
    title: '알림',
    content:
      “이 모달은 배경 창 클릭으로 닫히지 않으며 확인 버튼을 눌러야 닫힐 수 있습니다.”,
    manualDestroy: true, // 수동 파괴 모드 활성화
    closeOnBackdropClick: false, // 배경 클릭으로 닫히지 않도록 방지
  });
}

// 배경 데이터 사용
async function showModalWithBackground() {
  await alert({
    title: '배경 데이터 사용',
    content: '이 모달은 데이터를 배경 컴포넌트로 전달합니다.',
    background: {
      data: 'custom-background-data',
      opacity: 0.8,
      blur: '5px',
    },
  });
}
```

---

## API 참조

### 핵심 기능

#### `alert(options)`

사용자에게 정보를 표시하는 간단한 알림 모달을 열습니다.

**매개변수:**

- `options`: 알림 모달 구성 객체
- `title?`: 모달 제목 (ReactNode)
  - `subtitle?`: 부제목 (ReactNode)
- `content?`: 모달 콘텐츠 (ReactNode 또는 컴포넌트)
- `subtype?`: 모달 유형 ('info' | 'success' | 'warning' | 'error')
- `background?`: 배경 설정 (ModalBackground 객체)
- `footer?`: 푸터 설정
  - 함수: `(props: FooterComponentProps) => ReactNode`
- 객체: `{ confirm?: string; hideConfirm?: boolean }`
- `false`: 푸터 숨기기
- `dimmed?`: 배경 흐림 여부 (boolean)
- `manualDestroy?`: 수동 파괴 모드 활성화 (boolean)
  - `closeOnBackdropClick?`: 배경 클릭 시 닫기 여부 (부울)
  - `closeOnEscape?`: Esc 옵션(상속 순서는 접근성 절 참고)
  - `trapFocus?`: 최상위 dimmed 모달의 Tab 가두기(기본 `true`)
  - `lockScroll?`: 미확정 dimmed 모달의 body 스크롤 잠금(기본 `true`)
- `ForegroundComponent?`: 사용자 정의 포그라운드 컴포넌트
- `BackgroundComponent?`: 사용자 정의 배경 컴포넌트

**반환 값:** `Promise<void>` - 모달이 닫힐 때 해결됩니다

```typescript
// 예시
await alert({
  title: '알림',
  content: '내용',
  subtype: 'info',
  closeOnBackdropClick: true,
});
```

#### `confirm(options)`

사용자의 확인을 요청하는 확인 모달을 열습니다.

**매개변수:**

- `options`: 확인 모달 구성
- `alert`와 동일한 옵션에 추가로:
- `footer?`: 하단 설정
  - 함수: `(props: FooterComponentProps) => ReactNode`
- 객체: `{ confirm?: string; cancel?: string; hideConfirm?: boolean; hideCancel?: boolean }`
- `false`: 푸터 숨기기

**반환 값:** `Promise<boolean>` - 확인 시 true, 취소 시 false로 해결됩니다

```typescript
// 예시
const result = await confirm({
  title: '확인',
  content: '계속하시겠습니까?',
  footer: {
    confirm: '확인',
    cancel: '취소',
  },
});
```

#### `prompt<T>(options)`

사용자로부터 입력을 받기 위해 프롬프트 모달을 열습니다.

**매개변수:**

- `options`: 프롬프트 모달 구성 객체
- `alert`와 동일한 옵션에 추가로:
- `Input`: 입력 필드를 렌더링하는 함수
- `(props: PromptInputProps<T>) => ReactNode`
- props: `{ value: T; onChange: (value: T) => void }`
- `defaultValue?`: 기본 값 (T)
  - `disabled?`: 확인 버튼을 비활성화할지 여부를 결정하는 함수
- `(value: T | undefined) => boolean`
- `returnOnCancel?`: 취소 시 null 대신 현재 입력값을 반환할지 여부 (boolean)
- `footer?`: 푸터 설정 (확인 모달과 유사)

**반환 값:** `Promise<T | undefined | null>`

확인은 현재 입력값을 그대로 반환하며 값이 없으면 `undefined`입니다. 일반 취소는 `null`입니다. `returnOnCancel: true`이면 취소도 현재 값(렌더 전에는 `defaultValue`)을 반환하며 `undefined`도 보존합니다. 미입력 확인을 빈 문자열로 받으려면 `defaultValue: ''`를 지정합니다. 일반 취소 판별은 truthiness 대신 `result === null`을 사용합니다.

```typescript
// 예시
const value = await prompt<string>({
  title: '입력',
  defaultValue: '',
  Input: ({ value, onChange }) => (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  ),
  disabled: (value) => (value ?? '').trim() === '',
});
```

### 구성 요소

#### `ModalProvider` (또는 `BootstrapProvider`)

모달 서비스를 초기화하고 제공하는 구성 요소.

**프로퍼티:**

- `ForegroundComponent?`: 사용자 정의 포그라운드 구성 요소
  - `(props: PropsWithChildren<ModalFrameProps>) => ReactNode`
- `BackgroundComponent?`: 사용자 정의 배경 구성 요소
  - `(props: ModalFrameProps) => ReactNode`
- `TitleComponent?`: 사용자 정의 제목 컴포넌트
- `SubtitleComponent?`: 사용자 정의 부제목 컴포넌트
- `ContentComponent?`: 사용자 정의 콘텐츠 컴포넌트
- `FooterComponent?`: 사용자 정의 푸터 컴포넌트
- `(props: FooterComponentProps) => ReactNode`
- `options?`: 글로벌 모달 옵션
  - `duration?`: 밀리초 숫자 또는 소수 ms/s 문자열
- `backdrop?`: 배경 클릭 처리
- 기타 옵션...
- `context?`: 모달 컴포넌트에 전달할 컨텍스트 객체
- `root?`: 포털 컨테이너로 undefined는 body, null은 대기
- `usePathname?`: 사용자 정의 경로 이름 훅 함수

**처리:**

- `initialize(element)`: 포털 root를 정하는 메서드

```typescript
// ref를 사용하여 제어하는 예시
import { useRef } from 'react';
import { ModalProvider, ModalProviderHandle } from '@lerx/promise-modal';

function App() {
  const modalProviderRef = useRef<ModalProviderHandle>(null);

  const handleInitialize = () => {
    modalProviderRef.current?.initialize(document.body);
  };

  return (
    <ModalProvider ref={modalProviderRef}>
      <YourApp />
    </ModalProvider>
  );
}
```

### Hooks

#### `useModal`

컴포넌트의 라이프사이클을 공유하는 모달 핸들러 함수들을 반환합니다.

**핵심 특징:**

정적 핸들러(`alert`, `confirm`, `prompt`)와 달리, `useModal`로 생성된 모달은 컴포넌트가 언마운트될 때 자동으로 정리됩니다. 특정 컴포넌트 내에서 열린 모달들이 해당 컴포넌트가 제거될 때 자동으로 닫히도록 보장하고 싶을 때 유용합니다.

**반환값:**

- `alert`: 알림 모달 핸들러 함수
- `confirm`: 확인 모달 핸들러 함수
- `prompt`: 프롬프트 모달 핸들러 함수

```typescript
import { useModal } from '@lerx/promise-modal';

function MyComponent() {
  const modal = useModal();

  const handleShowAlert = async () => {
    // MyComponent가 언마운트되면 모달도 자동으로 정리됩니다
    await modal.alert({
      title: '알림',
      content: '이 모달은 컴포넌트 라이프사이클과 연동됩니다.',
    });
  };

  const handleShowConfirm = async () => {
    const result = await modal.confirm({
      title: '확인',
      content: '계속하시겠습니까?',
    });
    console.log('결과:', result);
  };

  return (
    <div>
      <button onClick={handleShowAlert}>알림 표시</button>
      <button onClick={handleShowConfirm}>확인 표시</button>
    </div>
  );
}
```

**정적 핸들러와의 비교:**

| 특징         | 정적 핸들러                  | useModal Hook                |
| ------------ | ---------------------------- | ---------------------------- |
| 라이프사이클 | 컴포넌트와 독립적            | 컴포넌트 라이프사이클과 연동 |
| 정리 방식    | 수동 정리 필요               | 언마운트 시 자동 정리        |
| 사용 위치    | 어디서나 (React 외부도 가능) | React 컴포넌트 내부만 가능   |

#### `useModalOptions`

모달의 글로벌 옵션을 읽습니다.

```typescript
import { useModalOptions } from '@lerx/promise-modal';

function Component() {
  // ConfigurationContextProps
  const options = useModalOptions();

  // ...
}
```

#### `useModalDuration`

모달 애니메이션 지속 시간을 읽습니다.

```typescript
import { useModalDuration } from '@lerx/promise-modal';

function Component() {
  // duration은 300ms, 밀리초는 300
  const { duration, milliseconds } = useModalDuration();
  // ...
}
```

#### `useModalBackdrop`

모달 배경 설정 읽기.

```typescript
import { useModalBackdrop } from '@lerx/promise-modal';

function Component() {
  // 배경색은 Color(#000000~#ffffff 또는 rgba(0,0,0,0.5))
  const backdrop = useModalBackdrop();
  // ...
}
```

#### `useInitializeModal`

모달 서비스를 초기화합니다. 일반적으로 `ModalProvider`에 의해 자동으로 호출됩니다.

```typescript
import { useInitializeModal } from '@lerx/promise-modal';

function Component() {
  const { portal } = useInitializeModal();
  return <main>{portal}</main>;
}
```

### 접근성

Escape는 보이는 미확정 모달 중 가장 위의 모달만 취소합니다. `closeOnEscape`는 호출의 Esc 옵션, 호출의 `closeOnBackdropClick`, Provider의 Esc 옵션, Provider의 배경 클릭 옵션(기본 `true`) 순으로 정합니다. `useModal` 설정도 호출 데이터이며 `undefined`는 상속합니다. Esc 취소를 막으려면 `closeOnEscape: false`를 지정합니다. IME 조합 중이거나 `preventDefault()`된 이벤트는 무시합니다.

`alive && visible && dimmed && !settled` 모달은 내부로 포커스를 이동하고(프레임의 `autoFocus`는 유지), 최상위 dimmed 모달 안에서 Tab을 가두며, 확정 시 연결된 열기 전 요소로 포커스를 복원합니다. `trapFocus`와 `lockScroll`은 Provider와 호출 수준에서 기본 `true`이며 해당 책임을 직접 처리하려면 `false`로 지정합니다. 가두기를 꺼도 최초 포커스 이동은 수행합니다. `dimmed: false` 모달은 포커스를 가져가거나 페이지를 비활성화하거나 스크롤을 잠그지 않습니다.

기본 프레임은 `role="dialog"`와 `aria-modal="true"`를 제공합니다. 사용자 전경 프레임은 역할·접근 가능한 이름·설명을 직접 제공하고 라이브러리 래퍼가 포커스 동작을 제공합니다. 모든 dialog에 접근 가능한 이름을 지정합니다. 예를 들어 보이는 제목을 `aria-labelledby`로 연결합니다. 보이는 어두운 배경은 `closeOnBackdropClick: false`여도 페이지 포인터를 막습니다. 뒤 페이지를 클릭할 수 있는 토스트는 `dimmed`와 `closeOnBackdropClick`을 모두 `false`로 지정합니다.

격리·스크롤 복원·중첩 root·포털 제한은 [접근성 계약](./docs/ko/SPECIFICATION.md#접근성)을 확인합니다.

### 설정과 공개 인터페이스

Provider의 컴포넌트 props(`ForegroundComponent`, `BackgroundComponent`, `TitleComponent`, `SubtitleComponent`, `ContentComponent`, `FooterComponent`)는 부모 리렌더가 열린 prompt를 재마운트하지 않도록 마운트 시점에 고정합니다. 변경은 무시하며 개발 환경에서 변경된 prop마다 한 번 경고하고 운영 환경에서는 경고하지 않습니다. 바뀌는 데이터는 `context`로 전달하며 options는 반응형으로 갱신합니다.

설정 우선순위는 기본값, Provider 옵션, `useModal(config)`, 호출 인자 순입니다. `undefined`는 상속하고 `0`과 `false`는 덮어씁니다. `useModal(config)`는 마운트 시점 기본값을 보관합니다. Provider와 모달별 `duration`은 음수가 아닌 밀리초 숫자(`300`, `0.5`), 밀리초 문자열(`'300ms'`, `'0.5ms'`), 초 문자열(`'0.3s'`)을 받습니다. 잘못된 값은 기본값으로 대체하고 개발 경고를 냅니다. 모달별 잘못된 값은 Provider 지속시간으로 대체합니다. `useModalOptions().duration`과 `useModalDuration(id?).duration`은 정규화된 밀리초 문자열을 반환하므로 CSS에 `ms`를 덧붙이지 않습니다.

`useModalOptions`, `useModalBackdrop`, `useModalDuration`, `useDestroyAfter`는 모달 프레임·내용·푸터 안에서 사용합니다. Provider의 일반 자식이나 모달 트리 밖에서 호출하면 필요한 위치를 설명하는 오류를 던집니다. `useModalBackdrop`은 CSS 속성 객체를 반환합니다. 프레임은 `group`, `subtype`, `settled`를 받고 alert 내용도 `context`를 받습니다. 애플리케이션 래퍼 타입에는 공개 `AlertProps`, `ConfirmProps`, `PromptProps`, `OverridableHandleProps`를 사용합니다. 프레임의 `onClose`와 내용·푸터의 `onCancel`은 모두 요청을 취소하며 AbortSignal도 거부가 아닌 취소 값으로 완료됩니다.

### 수명주기와 소유권

모달 결과는 한 번만 확정됩니다. `usePathname`에 따른 경로 이동은 대기 중인 모달을 결과 확정 없이 숨기고, 복귀하면 다시 표시합니다. 숨겨진 모달도 AbortSignal 중단과 `useModal` 소유 컴포넌트 정리로 취소됩니다. 확정된 모달은 `manualDestroy: true`여도 다시 표시되지 않습니다.

`ModalProvider` 또는 `useInitializeModal` 초기화 주체 하나만 포털을 소유합니다. 추가 Provider는 대기하며 개발 환경에서 한 번 경고합니다. 소유자가 언마운트되면 첫 대기자가 열린 모달을 이어받습니다. 대기자가 없으면 열린 모달은 취소 값으로 완료됩니다. `alert`는 완료되고, `confirm`은 `false`, `prompt`는 `null`을 반환합니다(`returnOnCancel: true`이면 현재 입력값). StrictMode 점검을 포함한 같은 커밋의 재마운트는 대기 중인 결과와 prompt 입력값을 유지합니다.

내용·입력·프레임의 렌더 오류는 해당 모달의 Promise를 잡힌 오류로 거부하므로 `try`/`catch`로 처리합니다. 다른 모달과 이후 요청은 계속 동작합니다. 대기 중인 모달의 파괴도 먼저 취소한 뒤 프레임을 제거합니다.

`useModal`은 확정된 요청을 즉시 추적 목록에서 제거하고, 컴포넌트 언마운트 때 미확정 요청만 취소합니다. 정적 호출은 호출 컴포넌트보다 오래 유지되지만 Provider 소유권과 취소 규칙은 따릅니다.

`useActiveModalCount`와 `useSubscribeModal(id)`는 공용 저장소를 읽으므로 Provider의 일반 자식과 Provider 밖에서도 동작합니다. 개수 판별 함수는 읽기 전용 `ModalNodeView`를 받으며 refresh key 없이 노드 변경을 반영합니다. `useDestroyAfter`는 모달 프레임 안에서 사용하고, 이미 확정됐지만 살아 있는 모달을 지연 시간 뒤 파괴합니다. 경로 숨김만으로는 타이머가 시작되지 않습니다. 지연 시간이 바뀌면 최신 값으로 파괴를 다시 예약합니다.

DOM 없이 패키지를 가져오고 서버에서 `ModalProvider`를 렌더할 수 있습니다. `alert`, `confirm`, `prompt`는 브라우저에서만 호출합니다. 서버 렌더에는 모달 포털이 없고 활성 개수는 0입니다.

#### `useSubscribeModal`

모달 상태 변경에 구독합니다.

```typescript
import { useSubscribeModal } from '@lerx/promise-modal';

function Component({ id }) {
  // 모달 상태가 변경되면 컴포넌트가 재렌더링됩니다
  const version = useSubscribeModal(id);

  // ...
}
```

#### `useDestroyAfter`

결과가 확정된 모달을 지정한 지연 시간 뒤 파괴합니다.

```typescript
import { useDestroyAfter } from '@lerx/promise-modal';

function Component({ modalId }) {
  // Destroy 3 seconds after settlement
  useDestroyAfter(modalId, 3000);

  // ...
}
```

#### `useActiveModalCount`

현재 활성화된 모달의 수를 반환합니다.

```typescript
import { useActiveModalCount } from '@lerx/promise-modal';

function Component() {
  const count = useActiveModalCount();

  return (
    <div>
      현재 열려 있는 모달: {count}
    </div>
  );
}
```

#### `useModalAnimation`

모달 애니메이션 상태 및 제어를 제공합니다.

```typescript
import { useModalAnimation } from '@lerx/promise-modal';

export const Foreground = ({
  id,
  visible,
  children,
  onClose,
  hideAfterMs,
}: PropsWithChildren<ForegroundProps>) => {
  const modalRef = useRef<HTMLDivElement>(null);
useModalAnimation(visible, {
    onVisible: () => {
      modalRef.current?.classList.add(styles.visible);
    },
    onHidden: () => {
      modalRef.current?.classList.remove(styles.visible);
    },
  });
  ...
}
```

### 유형 정의

라이브러리는 TypeScript 호환성을 위해 다양한 유형을 제공합니다:

#### `ModalFrameProps`

모달 프레임 컴포넌트에 전달되는 속성.

```typescript
interface ModalFrameProps<Context = any, B = any> {
  id: number;
  type: 'alert' | 'confirm' | 'prompt';
  group?: string;
  subtype?: 'info' | 'success' | 'warning' | 'error';
  settled: boolean;
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
}
```

#### `FooterComponentProps`

푸터 컴포넌트에 전달되는 속성.

```typescript
interface FooterComponentProps {
  onConfirm: () => void;
  onClose: () => void;
  // 기타 속성...
}
```

#### `PromptInputProps<T>`

프로ンプ트 모달의 입력 컴포넌트에 전달되는 속성.

```typescript
interface PromptInputProps<T> {
  value: T;
  onChange: (value: T) => void;
}
```

추가 유형:

- `ModalBackground`: 모달 배경 설정 유형
- `AlertContentProps`: 알림 모달 콘텐츠 컴포넌트 속성
- `ConfirmContentProps`: 확인 모달 콘텐츠 컴포넌트 속성
- `PromptContentProps`: 프롬프트 모달 콘텐츠 컴포넌트 속성
- `WrapperComponentProps`: 모달 래퍼 컴포넌트 속성

---

## 고급 사용 예제

### 1. 중첩 모달 (다른 모달 내부에 모달 열기)

다른 모달 내부에 모달을 열어서 복잡한 사용자 상호작용을 만들 수 있습니다.

```tsx
import { alert, confirm, prompt } from '@lerx/promise-modal';

// 다단계 모달 워크플로우 예시
async function multiStepProcess() {
  // 첫 번째 모달: 진행 여부를 확인
  const shouldProceed = await confirm({
    title: '작업 시작',
    content: '이 작업은 여러 단계로 구성되어 있습니다. 계속하시겠습니까?',
    footer: {
      confirm: '진행',
      cancel: '취소',
    },
  });

  if (!shouldProceed) return;

  // 두 번째 모달: 사용자 입력 받기
  const userName = await prompt<string>({
    title: '사용자 정보',
    content: '이름을 입력해 주세요.',
    defaultValue: '',
    Input: ({ value, onChange }) => (
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="이름"
      />
    ),
  });

  if (!userName) return;

  // 세 번째 모달: 최종 확인
  const confirmed = await confirm({
    title: '최종 확인',
    content: `${userName}, 정말 계속하시겠습니까?`,
    subtype: 'warning',
  });

  if (confirmed) {
    // 마지막 모달: 완료 알림
    await alert({
      title: '완료',
      content: `${userName}, 작업이 성공적으로 완료되었습니다.`,
      subtype: 'success',
    });
  }
}

// 풋터 내에서 모달 열기
async function nestedModalInFooter() {
  const result = await confirm({
    title: '확인 필요',
    content: '이 작업을 계속하시겠습니까?',
    // 다른 모달을 열기 위한 커스텀 풋터
    footer: ({ onConfirm, onClose }) => {
      const handleConfirm = async () => {
        // 확인 버튼이 클릭되면 다른 모달 열기
        const isConfirmed = await confirm({
          title: '최종 확인',
          content: '정말 확인하시겠습니까? 이 작업은 되돌릴 수 없습니다.',
          closeOnBackdropClick: false,
          // 두 번째 모달에 다른 디자인 적용
          ForegroundComponent: CustomForegroundComponent,
        });

        // 두 번째 모달 결과에 따라 첫 번째 모달 처리
        if (isConfirmed) onConfirm();
        else onClose();
      };

      return (
        <div>
          <button onClick={onClose}>취소</button>
          <button onClick={handleConfirm}>다음 단계</button>
        </div>
      );
    },
  });

  if (result) {
    console.log('작업 진행 중입니다.');
  }
}

// 프롬프트 모달 내부에 모달 열기
async function promptWithNestedModal() {
  const value = await prompt<{ title: string; description: string }>({
    title: '콘텐츠 생성',
    defaultValue: { title: '', description: '' },
    Input: ({ value = { title: '', description: '' }, onChange }) => {
      // 도움말 버튼이 클릭되면 도움말 모달 표시
      const showHelp = () => {
        alert({
          title: '도움말',
          content: '제목과 설명을 입력하세요. 제목은 필수입니다.',
        });
      };

      return (
        <div>
          <div>
            <label>제목</label>
            <input
              value={value.title}
              onChange={(e) => onChange({ ...value, title: e.target.value })}
            />
          </div>
          <div>
            <label>설명</label>
            <textarea
              value={value.description}
              onChange={(e) =>
                onChange({ ...value, description: e.target.value })
              }
            />
          </div>
          <button type="button" onClick={showHelp}>
도움말
          </button>
        </div>
      );
    },
    disabled: (value) => !value?.title,
  });

  console.log('입력 값:', value);
}
```

---

## 라이선스

이 저장소는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 [`LICENSE`](./LICENSE) 파일을 참조하세요.

---

## 연락처

프로젝트와 관련된 문의나 제안은 이슈를 생성해 주세요.
