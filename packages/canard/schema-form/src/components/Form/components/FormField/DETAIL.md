# FormField 계약

## Requirements

- 부모 Form의 보조 렌더링 계약(`Form.Field`)을 구현합니다.

## API Contracts

- `FormField.tsx`는 `memo` 컴포넌트입니다. `FieldInput`·`FieldRenderer`·`Wrapper`는 `useConstant`로 첫 렌더 값에 고정하고, 나머지 속성은 `useReference`로 `overridePropsRef`에 담아 `FieldProxy`에 넘깁니다. 렌더러 문맥은 읽지 않습니다.
- `type.ts`는 `FormFieldProps<Value>`를 정의합니다. `ChildFieldProps`의 덧붙임 속성을 받습니다.

## Acceptance Criteria

### field-group — 구성 요소 교체

- 넘겨 준 구성 요소는 그 필드에만 쓰이며, 마운트한 뒤에 바뀐 `FieldInput`·`FieldRenderer`·`Wrapper`는 반영하지 않습니다.

## Last Updated

2026-10-14 — 소유자 구조 변경(Form의 조각을 fractal로 분리).
