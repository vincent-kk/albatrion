# ConfigurationContext

## Purpose

모달의 전역 설정(옵션, 애니메이션 지속시간, 배경)을 React Context로 제공.

## Structure

- `ConfigurationContextProvider.tsx` — Context Provider 컴포넌트
- `useConfigurationContext.ts` — 설정 접근 훅 모음
- `index.ts` — Provider, 훅, Props 타입 재export

## Conventions

- 세분화된 훅: useConfigurationOptions, useConfigurationDuration, useConfigurationBackdrop
- useConfigurationContext: 전체 설정 값 접근
- Props를 통해 기본값 오버라이드 가능

## Boundaries

### Always do

- 새 설정 항목 추가 시 대응하는 훅 함께 제공
- 기본값 정의는 Provider 내부에서 처리

### Ask first

- 설정 구조 변경 (기존 소비자에 영향)
- 새 설정 카테고리 추가

### Never do

- 설정값을 컴포넌트에서 직접 하드코딩
- 런타임 중 Context 외부에서 설정 변경
