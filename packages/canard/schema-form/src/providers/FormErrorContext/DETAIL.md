# Form error reporting

## Requirements

ERROR-026과 ERROR-110–117은 루트 경계 바깥에 인스턴스 단위 보고기를 둘 것을 요구한다.

## API Contracts

- R-g: 현재 form-level load마다 별도 private warning scope를 소유한다. 이전 load에서 옮겨 온 기록은 원래 scope에서 dedup하며 현재 load와 합치지 않는다. scope는 buffered records가 보유하는 동안만 유지하고 공개 FormErrorRecord 모양·sink·오류 identity dedup은 바꾸지 않는다(ERROR-204).

onError는 insertion effect로 갱신되어 숨김 commit에서도 최신이며 루트의 prepared/retired 판단은 RootNodeContext가 소유합니다.

이 Context는 최신 소비자, 객체 동일성 기준 중복 제거, 로드별 경고 중복 제거, 전달 가드, componentStack만 담은 경계 콜백을 제공한다. Provider는 자식 경계가 커밋되기 전에, StrictMode의 첫 렌더에서도, 자신이 선택한 로드 루트를 묶는다. 추측성 생성은 관찰자 루트를 선택하지 않는다. 버퍼에 쌓인 onError 콜백과 경계의 onError 콜백은 코어 관찰자 범위에 들어가며, 던져진 경우에도 직전 상태를 복원한다. 새 로드는 경고 키를 비우고 필드 읽기 감지기가 비교하는 로드 번호를 올리지만, StrictMode 정리는 둘 다 하지 않는다. 코어 기록은 원래의 detail 참조를 그대로 유지한다.

필드 보고 훅은 path를 인자로 받고 렌더 때 현재 보고기를 읽는다. undefined는 루트 경계이며 pendingLoad 처리도 유지한다. 경로 문맥은 DeferredFieldProxy의 Placeholder만 사용하고 전용 훅이 이를 명시적 path 보고 훅에 연결한다(ERROR-044·114, 121C-01). 필드마다 문맥 구독과 Provider를 보유하지 않으며 콜백은 보고기와 path가 같으면 같은 참조이다.

- Context 객체(`FormErrorContext`·`FormErrorPathContext`)와 Provider는 `components/`, 훅(`useFormErrorContext`·`useBoundaryReporter`·`usePlaceholderBoundaryReporter`)은 `hooks/`, 호스트 보고 보조 `reportErrorToHost`는 `utils/`에 있다. 뿌리에는 문서·진입점·형 동반 파일(`type.ts`)만 둔다(filid zero-peer-file).

## Acceptance Criteria

### reporting — Single isolated error report

- 루트나 필드의 렌더 실패는 한 번만 보고되고, 해당 경계 안에 격리된 채로 남는다.
- 다시 실행된 effect는 이미 커밋된 로드 경고를 다시 보내지 않는다.
- 렌더러·formatError·입력·Placeholder의 오류는 현재 path와 원래 오류 identity를 유지한다.

## Last Updated

2026-10-08 — ERROR-026·044·090·110–117, 68C-08, 121C-01.
