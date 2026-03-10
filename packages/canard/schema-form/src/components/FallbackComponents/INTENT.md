# FallbackComponents

## Purpose
JSON Schema 기반 폼 렌더링 시스템의 기본(fallback) 렌더러 컴포넌트 모음. 플러그인이나 사용자 정의 렌더러가 제공되지 않을 때 최소한의 HTML 구조로 폼을 표시한다.

## Structure
```
FallbackComponents/
  FormErrorRenderer.tsx   — 에러 메시지를 <em>으로 표시
  FormGroupRenderer.tsx   — fieldset/div 기반 그룹 레이아웃
  FormInputRenderer.tsx   — Input 컴포넌트를 그대로 렌더링
  FormLabelRenderer.tsx   — 노드 이름을 텍스트로 반환
  index.ts                — 4개 컴포넌트 re-export
```

## Conventions
- TypeScript + React (TSX), 함수형 컴포넌트
- 모든 컴포넌트는 `FormTypeRendererProps`를 props 타입으로 사용
- 스타일은 인라인 style 객체로 최소한만 적용 (depth 기반 들여쓰기)
- `FormGroupRenderer`는 `node.group === 'branch'`에 따라 fieldset/div를 분기
- 배열 항목의 경우 label을 숨김 (`isArraySchema(node.parentNode)` 체크)

## Boundaries

### Always do
- `FormTypeRendererProps` 타입을 props 인터페이스로 준수
- `Input` prop을 `<Input />`으로 렌더링하여 실제 입력 위임
- depth 0(루트)인 경우 `<Input />`만 렌더링 (FormGroupRenderer)

### Ask first
- 기본 HTML 구조(fieldset, div, em, label) 변경 시
- 인라인 스타일 로직 수정 또는 CSS 클래스 도입 시

### Never do
- 플러그인 시스템이나 PluginManager에 직접 의존
- `FormTypeRendererProps` 외의 props 추가
- 이 컴포넌트에 비즈니스 로직 또는 상태(state) 도입

## Dependencies
- `@/schema-form/types` — `FormTypeRendererProps`
- `@winglet/json-schema/filter` — `isArraySchema` (FormGroupRenderer만 사용)
