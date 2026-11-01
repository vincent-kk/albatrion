# Form error reporting

## Requirements

ERROR-026과 ERROR-110–117은 루트 경계 바깥에 인스턴스 단위 보고기를 둘 것을 요구한다.

## API Contracts

- R-g: 현재 form-level load마다 별도 private warning scope를 소유한다. 이전 load에서 옮겨 온 기록은 원래 scope에서 dedup하며 현재 load와 합치지 않는다. scope는 buffered records가 보유하는 동안만 유지하고 경고 scope는 공개 origin과 독립적이며 호스트 싱크·오류 identity dedup은 유지한다(ERROR-204).

onError는 insertion effect로 갱신되어 숨김 commit에서도 최신이며 루트의 prepared/retired 판단은 RootNodeContext가 소유합니다.

이 Context는 최신 소비자, 객체 동일성 기준 중복 제거, 로드별 경고 중복 제거, 전달 가드, componentStack만 담은 경계 콜백을 제공한다. Provider는 자식 경계가 커밋되기 전에, StrictMode의 첫 렌더에서도, 자신이 선택한 로드 루트를 묶는다. 추측성 생성은 관찰자 루트를 선택하지 않는다. 버퍼에 쌓인 onError 콜백과 경계의 onError 콜백은 코어 관찰자 범위에 들어가며, 던져진 경우에도 직전 상태를 복원한다. 새 로드는 경고 키를 비우고 필드 읽기 감지기가 비교하는 로드 번호를 올리지만, StrictMode 정리는 둘 다 하지 않는다. 코어 기록은 원래의 detail 참조를 그대로 유지한다.

필드 보고 훅은 path를 인자로 받고 렌더 때 현재 보고기를 읽는다. undefined는 루트 경계이며 pendingLoad 처리도 유지한다. 경로 문맥은 DeferredFieldProxy의 Placeholder만 사용하고 전용 훅이 이를 명시적 path 보고 훅에 연결한다(ERROR-044·114, 121C-01). 필드마다 문맥 구독과 Provider를 보유하지 않으며 콜백은 보고기와 path가 같으면 같은 참조이다.

- 주인 없는 실패는 core의 failure-leaf 순회를 이용해 기존 호스트 채널에 잎마다 한 번 전달한다. 비어 있지 않고 모든 index가 own인 SchemaFormError MultipleErrors만 깊이 우선·원소 순서로 펼친다. 형식이 어긋난 값·다시 만난 묶음은 원래 identity로 한 번 보낸다. caller의 submit·validate 거부와 onError 발생 기록은 바꾸지 않는다. 렌더 경계의 React·ErrorBoundary 로그는 잡은 bundle 자체를 유지한다.

### onError origin

onError is an event channel: it delivers the one record of each occurrence and does not maintain a current error list or report resolution.

`capture(error, origin, componentStack?, path?)`는 origin을 필수로 받습니다. 렌더 경계는 render, 네이티브 제출은 submit, 생성·flush·reset 실패는 load를 넘깁니다. 이미 보고한 오류와 onError가 던진 객체는 다시 기록하지 않습니다. MultipleErrors의 오류 배열이 비어 있지 않고 모든 own index에 이미 보고한 객체, 핸들러 예외 객체, 또는 같은 규칙을 만족하는 SchemaFormError 인스턴스 MultipleErrors 묶음이 있으면 capture 기록을 생략합니다. 빈 배열·상속된 index를 포함한 hole·미지 객체·primitive·SchemaFormError가 아닌 중첩 묶음·순환하거나 다시 만난 중첩 묶음이 어느 깊이에든 있으면 보고합니다. 판정은 재귀 없이 순회하며 details가 없는 인스턴스도 보고합니다. capture는 최상위 code·details·message·String(error) 읽기까지 보호합니다. 실패 메타데이터를 읽을 수 없으면 원래 error·origin·path·componentStack을 유지하고 RenderFailed 및 고정 메시지 Unable to inspect captured failure의 기록 하나를 전달하며 부분 details는 버립니다. 중첩 predicate의 읽기 실패는 false/unknown만 뜻하므로 읽을 수 있는 바깥 실패의 code·message·details는 기존대로 보존하고 고정 fallback으로 바꾸지 않습니다. onError handler의 예외 처리와 host sink 예외 의미는 유지합니다. 렌더 capture에서 생략한 bundle 또는 핸들러 예외의 RENDER_FAILED 기록·componentStack은 onError에 도달하지 않는 ERROR-023 항목 2 우선 제한입니다. 경고 scope는 origin과 독립적이며 recordScopes는 버퍼 기록의 원래 root·scope만 보존합니다.

읽을 수 없는 중첩 묶음(details·errors getter, index·length 읽기 실패)은 capture에서는 unknown으로 처리하고 호스트 순회에서는 같은 identity의 불투명한 잎으로 보냅니다. 호스트 순회는 묶음의 own 원소를 방문 전에 임시 배열에 읽어 두므로 뒤 원소를 읽지 못해도 앞 원소를 부분 전달하지 않습니다. snapshot과 frame·visited는 호출별 O(N) 임시 메모리이며 영구 필드를 추가하지 않습니다. visit·sink callback의 예외는 삼키지 않습니다.

배열마다 처음 읽은 길이를 반복 범위로 고정하고 정수 1..2^32 − 1, 모든 own index, 끝의 동일한 길이를 요구합니다. capture 판정과 host 순회는 각각 호출당 원소 점검 예산 1,000,000개를 공유하며 invalid·변한 길이·예산 초과는 unknown 또는 원래 묶음 identity의 잎입니다. host의 실패한 snapshot 예약도 소비하며 환불하지 않습니다.

## Acceptance Criteria

### reporting — Single isolated error report

- 루트나 필드의 렌더 실패는 한 번만 보고되고, 해당 경계 안에 격리된 채로 남는다.
- 다시 실행된 effect는 이미 커밋된 로드 경고를 다시 보내지 않는다.
- 렌더러·formatError·입력·Placeholder의 오류는 현재 path와 원래 오류 identity를 유지한다.

### nested-capture — 알려진 중첩 실패의 판정

- render·submit·load capture는 이미 보고한 원인과 핸들러 예외로만 이루어진 유효한 중첩 묶음을 다시 기록하지 않는다. 깊이 50,000에서도 스택을 넘치지 않으며 malformed·미지·재방문 묶음은 보고한다.

### host-leaves — 부른 쪽이 없는 실패 전달

- host helper는 같은 identity와 깊이 우선 순서를 유지한다. native submit·slot은 원인 뒤 handler를 보내고 engine wave·OnChange·load flush의 handler-first 순서는 유지한다. render boundary는 던진 값 그대로 기록한다.

## Last Updated

2026-11-02
