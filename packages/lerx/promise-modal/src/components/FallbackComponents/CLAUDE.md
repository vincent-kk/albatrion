# FallbackComponents

## Purpose

사용자가 커스텀 컴포넌트를 제공하지 않았을 때 사용되는 기본 UI 컴포넌트 모음.

## Structure

- `FallbackTitle.tsx` — 기본 제목 컴포넌트
- `FallbackSubtitle.tsx` — 기본 부제목 컴포넌트
- `FallbackContent.tsx` — 기본 콘텐츠 컴포넌트
- `FallbackFooter.tsx` — 기본 푸터 컴포넌트 (확인/취소 버튼)
- `FallbackForegroundFrame.tsx` — 기본 전경 프레임 컴포넌트
- `index.ts` — 모든 Fallback 컴포넌트 재export

## Conventions

- `Fallback` 접두사로 명명하여 기본 구현임을 명시
- 최소한의 스타일만 포함, 사용자 커스터마이징 용이하게 설계
- ModalManager.getHashedClassNames으로 스코프된 CSS 적용

## Boundaries

### Always do

- 각 Fallback 컴포넌트는 독립적으로 교체 가능하게 유지
- Props 인터페이스를 types/에 정의된 타입과 일치

### Ask first

- 기본 스타일 변경
- 새 Fallback 컴포넌트 추가

### Never do

- Fallback에 복잡한 비즈니스 로직 포함
- 외부 UI 라이브러리 의존성 추가
