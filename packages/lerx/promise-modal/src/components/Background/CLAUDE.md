# Background

## Purpose

모달 배경(오버레이/백드롭) 프레임을 렌더링하는 컴포넌트. 배경 클릭 시 모달 닫기 등의 인터랙션 처리.

## Structure

- `Background.tsx` — BackgroundFrame 컴포넌트 구현
- `index.ts` — Background 재export

## Conventions

- `BackgroundFrame`으로 내부 구현, `Background`로 export
- ConfigurationContext의 backdrop 설정 참조
- 모달 옵션에 따라 커스텀 배경 컴포넌트 사용 가능

## Boundaries

### Always do

- backdrop 설정에 따른 클릭 핸들링 (닫기 여부)
- 스코프된 CSS 클래스명 사용 (ModalManager.getHashedClassNames)

### Ask first

- 배경 애니메이션 방식 변경
- 기본 배경 스타일 변경

### Never do

- 배경 컴포넌트에서 모달 콘텐츠 렌더링
- ConfigurationContext를 우회한 설정 접근
