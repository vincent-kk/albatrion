# FormCore 계약

## Requirements

- 값 채널, 제출, 오류 경계, `FormHandle`의 계약은 부모 Form의 DETAIL에 있고, 이 fractal은 그 구현을 소유합니다.

## API Contracts

- H: handle.showError와 onReset은 facd72a71의 setShowError와 useImperativeHandle dependency 모양을 유지한다. 정책 기록은 FormRoot가 하지 않으며 RootNodeContext의 root별 layout commit이 소유한다. validate 반환과 submit 값은 호출 시점 snapshot 계약이다.

- SURFACE-063: FormHandle.rebuild(option?) delegates to the current root binding, invalidates its schema cache entry and forces tree replacement through reset semantics. Other forms retain their existing roots until their own rebuild; ordinary reset stays unchanged. The package export names do not change.

- `FormCore`(`FormCore.tsx`)는 오류 경계를 입힌 바깥쪽 컴포넌트입니다. `memo(forwardRef)`로 `FormErrorContextProvider`에 `onError`를 넘기고, 그 안에서 `withErrorBoundaryForwardRef(forwardRef(FormRoot), undefined, useBoundaryReporter)`를 렌더합니다. 경계가 보고기 안쪽에 있으므로 루트 fallback이 표시된 뒤에도 보고는 계속 동작합니다. 공개 형은 `Schema`·`Value` 제네릭 시그니처로 단언합니다(ERROR-026·110–117).
- `FormRoot`(`components/FormRoot.tsx`)는 경계가 없는 안쪽 컴포넌트입니다. Provider 여섯 개를 정해진 순서로 중첩하고, 바인딩 ref, 첨부 파일 맵, `showError` 상태, 추적 제출 핸들을 소유합니다. `useImperativeHandle`로 현재 루트에 위임하는 핸들을 노출합니다.
- `components/`: `FormRoot`는 위에서 설명한 대로이고, `FormRootProxy`는 `<form onSubmit>`을 그리며 자식이 없으면 루트 `FieldProxy`를 렌더합니다. `FormChildrenRenderer`는 함수 자식이 루트 노드의 값, 전역 오류, refresh, remount 사건을 구독해서 다시 실행되게 합니다.
- `utils/`: `createChildren`은 요소 자식은 그대로 두고 함수 자식은 `FormChildrenRenderer`로 바꿉니다. `submitForm`은 degraded 거부, 투영 값 확정, 검증, `onSubmit` 호출 순서로 진행하며, 검증 실패가 아닌 거부만 `onFailure`로 보고합니다. FormRoot는 degraded 거부를 service.report로 origin submit에 한 번 보고하며, 핸들러 예외는 원인과 함께 MultipleErrors로 caller에게 거부합니다. 명시적 제출은 host에 보내지 않으며 native 제출만 거부를 capture하고 host에 전달합니다. 이미 보고한 원인·핸들러 예외로만 구성한 bundle은 capture 기록을 생략합니다.
- `types/props.ts`는 FormChildrenProps·FormProps를, `types/handle.ts`는 FormHandle을 선언하고 진입점이 세 형을 이름으로 내보냅니다.
- 뿌리에는 문서, 진입점과 `FormCore.tsx`만 두며 형은 관심사별 칸에 둡니다(filid zero-peer-file).

## Acceptance Criteria

### root-boundary — 경계와 보고기의 순서

- 루트 렌더 오류는 fallback 안에 가두고, `onError`에 `RENDER_FAILED` 기록으로 한 번 전달합니다. 부모의 시험은 진입점의 `FormCore`를 직접 렌더해서 이를 확인합니다.

## Boundary Exemptions

### `types/` — 형 칸 유지

- **Consumers**: `entry-point`
- **Direct import**: `not allowed`
- **Reason**: `FormProps`·`FormHandle`·`FormChildrenProps`는 이름으로 진입점에 올라 `components/Form/index.ts`를 거쳐 `src/index.ts`가 공개하고, `FormProps`·`FormHandle`은 `providers/*`와 `hooks/form/useFormSubmit.ts`도 쓴다. 형은 구현이 아니므로 칸에 두고 진입점이 이름으로 내보낸다.

## Last Updated

2026-10-14 — 소유자 구조 변경(Form의 조각을 fractal로 분리).
