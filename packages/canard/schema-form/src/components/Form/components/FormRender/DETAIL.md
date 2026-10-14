# FormRender 계약

## Requirements

- 부모 Form의 보조 렌더링 계약(`Form.Render`)을 구현합니다.

## API Contracts

- `FormRender.tsx`는 `memo` 컴포넌트입니다. `children`·`FieldInput`·`Wrapper`는 `useConstant`로 첫 렌더 값에 고정하고, 나머지 속성은 `useReference`로 `overridePropsRef`에 담아 `FieldProxy`에 넘깁니다.
- `type.ts`는 기반 형 `BaseFormRenderProps<Value>`와 그 `Roll` 표현인 공개 형 `FormRenderProps<Value>`를 정의합니다. 기반 형은 `ChildFieldProps`의 덧붙임 속성을 받고 구현이 씁니다. 관문은 공개 형만 내보냅니다.

## Acceptance Criteria

### render-function — 렌더 함수 위임

- 렌더 함수는 필드의 렌더러 속성을 받고, 마운트 뒤 바뀐 `children`·`FieldInput`·`Wrapper`는 반영하지 않습니다.

## Last Updated

2026-10-14 — 소유자 구조 변경(Form의 조각을 fractal로 분리).
