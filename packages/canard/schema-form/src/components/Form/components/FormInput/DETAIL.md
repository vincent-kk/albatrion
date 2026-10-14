# FormInput 계약

## Requirements

- 부모 Form의 보조 렌더링 계약(`Form.Input`)과 렌더러 속성 계약(LANDING-035·067)을 구현합니다.

## API Contracts

- `FormInput.tsx`는 `memo` 컴포넌트입니다. 렌더러 문맥의 `FormInputRenderer`를 읽고, 없으면 `PluginManager.FormInputRenderer`를 씁니다. `FieldInput`은 `useConstant`로 첫 렌더 값에 고정하고, 나머지 속성은 `useReference`로 `overridePropsRef`에 담아 `FieldProxy`에 넘깁니다.
- `type.ts`는 `FormInputProps<Value>`를 정의합니다. `ChildFieldProps`의 덧붙임 속성을 받습니다.

## Acceptance Criteria

### input-renderer — 렌더러 선택

- Form 속성으로 넘긴 렌더러가 플러그인 렌더러보다 우선하고, 덧붙인 속성은 입력까지 전달됩니다.

## Last Updated

2026-10-14 — 소유자 구조 변경(Form의 조각을 fractal로 분리).
