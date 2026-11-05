# FormCore 계약

## Requirements

- 값 채널, 제출, 오류 경계, `FormHandle`의 계약은 부모 Form의 DETAIL에 있고, 이 fractal은 그 구현을 소유합니다.

## API Contracts

- 제출 어댑터 `submitForm`은 `FieldNode | Nullish`를 받고 루트가 null·undefined이면 callback을 호출하지 않고 성공 종료한다. Provider 문맥은 필수 노드를 보장하며 binding·FormHandle.node의 미연결 상태는 undefined를 유지한다. 단일 탐색은 null, 복수 탐색은 빈 배열이다. 구독 훅에는 양쪽 부재를 직접 전달할 수 있지만 ref 할당만으로 다음 렌더나 구독이 생기지 않는다. 연결 수명과 catch-up은 [hooks 계약](../../../../hooks/DETAIL.md)에 따른다.

- H: handle.showError와 onReset은 facd72a71의 setShowError와 useImperativeHandle dependency 모양을 유지한다. 정책 기록은 FormRoot가 하지 않으며 RootNodeContext의 root별 layout commit이 소유한다. validate 반환과 submit 값은 호출 시점 snapshot 계약이다.

- SURFACE-063: FormHandle.rebuild(option?) delegates to the current root binding, invalidates its schema cache entry and forces tree replacement through reset semantics. Other forms retain their existing roots until their own rebuild; ordinary reset stays unchanged. The package export names do not change.

- `FormCore`(`FormCore.tsx`)는 오류 경계를 입힌 바깥쪽 컴포넌트입니다. `memo(forwardRef)`로 `FormErrorContextProvider`에 `onError`를 넘기고, 그 안에서 `withErrorBoundaryForwardRef(forwardRef(FormRoot), undefined, useBoundaryReporter)`를 렌더합니다. 경계가 보고기 안쪽에 있으므로 루트 fallback이 표시된 뒤에도 보고는 계속 동작합니다. 공개 형은 `Schema`·`Value` 제네릭 시그니처로 단언합니다(ERROR-026·110–117).
- `FormRoot`(`components/FormRoot.tsx`)는 경계가 없는 안쪽 컴포넌트입니다. Provider 여섯 개를 정해진 순서로 중첩하고, 바인딩 ref, 첨부 파일 맵, `showError` 상태, 추적 제출 핸들을 소유합니다. `useImperativeHandle`로 현재 루트에 위임하는 핸들을 노출합니다.
- `components/`: `FormRoot`는 위에서 설명한 대로이고, `FormRootProxy`는 `<form onSubmit>`을 그리며 자식이 없으면 루트 `FieldProxy`를 렌더합니다. `FormChildrenRenderer`는 함수 자식이 루트 노드의 값, 전역 오류, refresh, remount 사건을 구독해서 다시 실행되게 합니다.
- `utils/`: `createChildren`은 요소 자식은 그대로 두고 함수 자식은 `FormChildrenRenderer`로 바꿉니다. `submitForm`은 degraded 거부, 투영 값 확정, 검증, `onSubmit` 호출 순서로 진행하며, 검증 실패가 아닌 거부만 `onFailure`로 보고합니다. 검증 판정은 try 안에서 지역 변수에 담고, `onInvalid`가 있으면 그것을 불러 resolve하며 없으면 `ValidationError`로 거부합니다. `onSubmit`은 판정이 없을 때만 불리므로 소비자가 던진 `ValidationError`는 판정으로 취급되지 않습니다(`isValidationError`가 공개이고 판정 객체를 다시 던질 수 있어 클래스·코드로 구별하지 않습니다). FormRoot는 네이티브 제출에만 `onInvalid`를 넘깁니다. 그 처리기는 제출 시작의 load 번호(`onReset`마다 1 증가)와 루트를 잡아 두고, 판정 도착과 공개 뒤 초점 직전에 마운트와 load가 그대로인지 확인합니다. 루트를 바꾸는 길(reset의 재생성, rebuild, validator 변경)은 모두 reset 처리기에서 `onReset`을 부르므로 load 비교가 루트 교체도 잡고, 루트 동일성은 따로 비교하지 않습니다. `native` 인자는 `true`일 때만 네이티브로 취급하므로, `handle.submit`을 onClick에 그대로 넘겨 이벤트 객체가 와도 명시적 제출처럼 거부합니다. 지난 판정은 버리고 host에도 보내지 않습니다. 정책과 잠금(`showError` 상태, `FormProvider`의 `showError`, Form의 `disabled`·`readOnly`)은 layout effect에서 갱신하는 ref로 읽어 커밋된 값만 씁니다(`useHandle`은 버려진 렌더의 값도 남깁니다). React 18 legacy root에서는 공개가 동기로 커밋되어 사용자 layout effect가 그 사이 reset할 수 있으므로 초점 후보는 공개 뒤에 다시 구합니다. `isShowErrorDisabled`는 렌더러와 같은 해석으로 표시 정책이 꺼졌는지 판정하고, `findFirstInvalidNode`는 초점 후보를 노드 상태만으로 고릅니다. FormRoot는 degraded 거부를 service.report로 origin submit에 한 번 보고하며, 핸들러 예외는 원인과 함께 MultipleErrors로 caller에게 거부합니다. 명시적 제출은 host에 보내지 않으며 native 제출만 거부를 capture하고 첫 원인부터 핸들러 예외까지 잎 순서로 host에 전달합니다. 이미 보고한 원인·핸들러 예외와 같은 규칙의 유효한 중첩 묶음만 담은 bundle은 capture 기록을 생략합니다. 렌더 경계는 React·ErrorBoundary가 잡은 원래 값을 기록합니다.
- `types/props.ts`는 FormChildrenProps·FormProps를, `types/handle.ts`는 FormHandle을 선언하고 진입점이 세 형을 이름으로 내보냅니다.
- 뿌리에는 문서, 진입점과 `FormCore.tsx`만 두며 형은 관심사별 칸에 둡니다(filid zero-peer-file).

## Acceptance Criteria

### root-boundary — 경계와 보고기의 순서

- 루트 렌더 오류는 fallback 안에 가두고, `onError`에 `RENDER_FAILED` 기록으로 한 번 전달합니다. 단, 이미 보고한 원인·handler 객체와 같은 규칙의 유효한 중첩 묶음만 담은 비어 있지 않은 dense bundle 또는 bare handler 예외의 capture는 생략하며 componentStack도 전달하지 않습니다. 부모의 시험은 진입점의 `FormCore`를 직접 렌더해서 이를 확인합니다.

## Boundary Exemptions

### `types/` — 형 칸 유지

- **Consumers**: `entry-point`
- **Direct import**: `not allowed`
- **Reason**: `FormProps`·`FormHandle`·`FormChildrenProps`는 이름으로 진입점에 올라 `components/Form/index.ts`를 거쳐 `src/index.ts`가 공개하고, `FormProps`·`FormHandle`은 `providers/*`와 `hooks/form/useFormSubmit.ts`도 쓴다. 형은 구현이 아니므로 칸에 두고 진입점이 이름으로 내보낸다.

## Last Updated

관찰 경계, 구독 수명 또는 부재 표현 계약이 바뀔 때 갱신합니다.
