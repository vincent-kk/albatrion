# FallbackComponents

## Purpose

JSON Schema 기반 폼 렌더링 시스템의 기본(fallback) 렌더러 컴포넌트 모음. 플러그인이나 사용자 정의 렌더러가 없을 때 최소한의 HTML 구조로 폼을 표시한다.

## Structure

```
FallbackComponents/
  FormErrorRenderer.tsx   — 에러 메시지를 <em>으로 표시
  FormFieldRenderer.tsx   — fieldset/div 기반 그룹 레이아웃
  FormInputRenderer.tsx   — Input 컴포넌트를 그대로 렌더링
  FormLabelRenderer.tsx   — 노드 이름을 텍스트로 반환
  index.ts                — 4개 컴포넌트 re-export
```

## Conventions

- TypeScript와 React(TSX)로 작성한 함수형 컴포넌트
- 모든 컴포넌트는 props 타입으로 `FieldRendererProps`를 쓴다.
- 스타일은 인라인 style 객체로 꼭 필요한 만큼만 적용한다(depth에 따른 들여쓰기).
- `FormFieldRenderer`는 `node.group === 'branch'`인지에 따라 fieldset과 div 중 하나를 고른다.
- 배열 항목에서는 label을 숨긴다(`isArraySchema(node.parentNode)`로 확인).

## Boundaries

### Always do

- props 인터페이스는 `FieldRendererProps` 타입을 따른다.
- `Input` prop을 `<Input />`으로 렌더링해서 실제 입력을 맡긴다.
- depth 0(루트)이면 `<Input />`만 렌더링한다(FormFieldRenderer).

### Ask first

- 기본 HTML 구조(fieldset, div, em, label)를 바꿀 때
- 인라인 스타일 로직을 수정하거나 CSS 클래스를 도입할 때

### Never do

- 플러그인 시스템이나 PluginManager에 직접 의존
- `FieldRendererProps` 밖의 props 추가
- 이 컴포넌트에 비즈니스 로직이나 상태(state) 도입
