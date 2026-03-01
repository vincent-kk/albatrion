# primitives

## Purpose

ink 라이브러리를 래핑하는 기본 UI 빌딩 블록. 모든 상위 컴포넌트의 기반.

## Structure

- `index.ts` — barrel export
- `Box.tsx` — 레이아웃 컨테이너 (border, padding 지원)
- `Text.tsx` — 텍스트 렌더링 (color, style 지원)
- `Spinner.tsx` — 비동기 작업용 로딩 스피너

## Conventions

- ink 컴포넌트의 thin wrapper로 유지
- Props 타입은 ink 원본 타입을 확장

## Boundaries

### Always do

- ink API 변경 시 이 모듈에서만 수정
- 다른 컴포넌트는 ink 직접 import 대신 이 모듈 사용

### Ask first

- 새 primitive 컴포넌트 추가

### Never do

- 비즈니스 로직 포함
- ink 외의 외부 UI 라이브러리 의존성 추가
