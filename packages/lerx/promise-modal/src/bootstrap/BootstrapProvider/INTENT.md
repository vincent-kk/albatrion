# BootstrapProvider

## Purpose

모달 시스템의 메인 React Provider 컴포넌트. 모든 Context Provider를 래핑하고 ModalManager를 초기화하며 모달 렌더링 앵커를 설정.

## Structure

- `BootstrapProvider.tsx` — 메인 프로바이더 컴포넌트
- `useBootstrap.ts` — 초기화 로직 훅
- `type.ts` — BootstrapProviderHandle, BootstrapProviderProps 정의
- `hooks/` — 내부 전용 훅
- `helpers/` — 내부 유틸리티 함수
- `index.ts` — 컴포넌트, 훅, 타입 재export

## Conventions

- forwardRef + useImperativeHandle로 외부 핸들 제공
- 내부 훅과 헬퍼는 하위 organ 디렉토리에 격리
- Props를 통해 커스텀 설정, 배경, 래퍼 컴포넌트 주입 가능

## Boundaries

### Always do

- Provider 중첩 순서: Configuration → ModalManager → UserDefined
- ModalManager.anchor() 호출로 DOM 앵커 보장
- prerender 리스트 처리 (마운트 전 호출된 모달)

### Ask first

- Provider 중첩 순서 변경
- Handle에 새 메서드 추가

### Never do

- BootstrapProvider 내부에서 비즈니스 로직 처리
- ModalManager를 직접 조작하지 않고 우회하여 DOM 수정
