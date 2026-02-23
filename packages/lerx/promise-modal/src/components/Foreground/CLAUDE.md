# Foreground

## Purpose

모달의 전경(콘텐츠 영역) 프레임을 렌더링하는 컴포넌트. 모달 타입별 콘텐츠, 제목, 푸터 등을 조합.

## Structure

- `Foreground.tsx` — ForegroundFrame 컴포넌트 구현
- `components/` — 내부 하위 컴포넌트 (organ)
- `index.ts` — Foreground 재export

## Conventions

- `ForegroundFrame`으로 내부 구현, `Foreground`로 export
- 모달 타입(alert/confirm/prompt)에 따라 다른 콘텐츠 렌더링
- FallbackComponents를 기본값으로, 사용자 정의 컴포넌트로 오버라이드 가능

## Boundaries

### Always do

- 모달 타입별 적절한 콘텐츠 구성
- 사용자 정의 컴포넌트 우선 적용, 없으면 Fallback 사용
- 접근성(a11y) 속성 포함

### Ask first

- 전경 레이아웃 구조 변경
- 새 모달 타입의 콘텐츠 영역 추가

### Never do

- 전경 컴포넌트에서 모달 상태 직접 변경
- Fallback 대신 하드코딩된 UI 제공
