# @lerx/promise-modal Specification

## Requirements

- React 컴포넌트 내외부에서 사용 가능한 promise 기반 모달 API 제공
- alert (알림), confirm (확인), prompt (입력) 세 가지 모달 타입 지원
- ModalProvider를 통한 React 트리 초기화
- 커스텀 컴포넌트 주입을 통한 UI 교체 가능
- 구독 기반 상태 관리로 모달 생명주기 제어

## API Contracts

### Modal Functions

- `alert<BackgroundValue>(props: AlertProps<BackgroundValue>): Promise<void>` — 알림 모달 표시, 닫힘 시 resolve
- `confirm<BackgroundValue>(props: ConfirmProps<BackgroundValue>): Promise<boolean>` — 확인 모달 표시, 확인=true/취소=false resolve
- `prompt<InputValue, BackgroundValue>(props: PromptProps<InputValue, BackgroundValue>): Promise<InputValue>` — 입력 모달 표시, 확인=입력값 resolve, 취소=reject

### Provider Component

- `ModalProvider (BootstrapProvider)` — 모달 시스템 초기화 Provider
  - Props: `BootstrapProviderProps` (설정, 배경, 래퍼 컴포넌트 등)
  - Handle: `BootstrapProviderHandle` (ref로 접근)

### Hooks

- `useModal()` — 모달 열기/닫기 인터페이스
- `useInitializeModal()` — 모달 시스템 초기화 훅
- `useModalOptions()` — 모달 옵션 접근
- `useModalBackdrop()` — 배경 설정 접근
- `useActiveModalCount()` — 활성 모달 수 조회
- `useDestroyAfter()` — 지연 파괴 제어
- `useModalAnimation()` — 애니메이션 상태 접근
- `useModalDuration()` — 애니메이션 지속시간 접근
- `useSubscribeModal()` — 모달 노드 구독

## Last Updated

2026-02-24
