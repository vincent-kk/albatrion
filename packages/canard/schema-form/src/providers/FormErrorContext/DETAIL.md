# Form error reporting

## Requirements

렌더 실패를 가두는 일과 실패를 관찰할 수 있게 하는 일을 함께 지킵니다. 보고 수명은 fallback이 교체하는 서브트리와 독립적이어야 하며, 렌더 예외를 사용자가 고칠 필드 검증 오류 목록에 넣지 않습니다.

## API Contracts

- 로드 안의 경고 identity는 `(code, path, schemaPath)`입니다. 데이터 경로가 없어도 작성 위치가 다르면 별개로 보내고 정확히 같은 경고만 생략합니다. schemaPath가 없는 실행 경고는 데이터 경로를 유지하며 origin은 범위를 바꾸지 않습니다. 버퍼 기록은 새 로드에서도 원래 scope를 유지합니다(ERROR-024·204). 키 계산에 schemaPath 직렬화 한 번과 그 길이만큼의 저장 공간을 더하며 별도 캐시나 수명은 만들지 않습니다.

- R-g: 현재 form-level load마다 별도 private warning scope를 소유한다. 이전 load에서 옮겨 온 기록은 원래 scope에서 dedup하며 현재 load와 합치지 않는다. scope는 buffered records가 보유하는 동안만 유지하고 경고 scope는 공개 origin과 독립적이며 호스트 싱크·오류 identity dedup은 유지한다(ERROR-204).

onError는 insertion effect로 갱신되어 숨김 commit에서도 최신입니다. 루트 선택·prepared/retired·대기 로드의 배달은 [RootNodeContext](../RootNodeContext/DETAIL.md)가 소유합니다. 보고기를 유지한다는 이유로 로드를 채택하거나 폐기하지 않습니다.

이 Context는 최신 소비자, 오류 객체 동일성 기준 capture 중복 제거, 로드별 경고 중복 제거, 전달 가드, componentStack만 담은 경계 콜백을 제공합니다. 보고기에 묶인 root가 있으면 onError를 코어 관찰자 범위에서 실행하고 예외에도 직전 상태를 복원합니다. 새 로드는 별도 경고 scope와 로드 번호를 만들지만 StrictMode 정리는 이를 초기화하지 않습니다. 코어 기록은 원래 details 참조를 유지합니다.

경계를 배치하는 책임은 [FormCore](../../components/Form/components/FormCore/DETAIL.md)에 둡니다. 보고기의 영속성을 바꾸는 배치 변경은 그 계약과 함께 판단합니다.

- 주인 없는 실패는 core의 failure-leaf 순회를 이용해 기존 호스트 채널에 잎마다 한 번 전달한다. 비어 있지 않고 모든 index가 own인 SchemaFormError MultipleErrors만 깊이 우선·원소 순서로 펼친다. 형식이 어긋난 값·다시 만난 묶음은 원래 identity로 한 번 보낸다. caller의 submit·validate 거부와 onError 발생 기록은 바꾸지 않는다. 렌더 경계의 React·ErrorBoundary 로그는 잡은 bundle 자체를 유지한다.

### onError origin

onError는 발생 기록의 사건 채널입니다. 현재 오류 목록을 보유하거나 해결 알림을 보내지 않습니다.

`capture(error, origin, componentStack?, path?)`는 origin을 필수로 받습니다. 렌더 경계는 render, 네이티브 제출은 submit, 생성·flush·reset 실패는 load를 넘깁니다. 이미 보고한 오류와 onError가 던진 객체는 다시 기록하지 않습니다. MultipleErrors의 오류 배열이 비어 있지 않고 모든 own index에 이미 보고한 객체, 핸들러 예외 객체, 또는 같은 규칙을 만족하는 SchemaFormError 인스턴스 MultipleErrors 묶음이 있으면 capture 기록을 생략합니다. 빈 배열·상속된 index를 포함한 hole·미지 객체·primitive·SchemaFormError가 아닌 중첩 묶음·순환하거나 다시 만난 중첩 묶음이 어느 깊이에든 있으면 보고합니다. 판정은 재귀 없이 순회하며 details가 없는 인스턴스도 보고합니다. capture는 최상위 code·details·message·String(error) 읽기까지 보호합니다. 실패 메타데이터를 읽을 수 없으면 원래 error·origin·path·componentStack을 유지하고 RenderFailed 및 고정 메시지 Unable to inspect captured failure의 기록 하나를 전달하며 부분 details는 버립니다. 중첩 predicate의 읽기 실패는 false/unknown만 뜻하므로 읽을 수 있는 바깥 실패의 code·message·details는 기존대로 보존하고 고정 fallback으로 바꾸지 않습니다. onError handler의 예외 처리와 host sink 예외 의미는 유지합니다. 렌더 capture에서 생략한 bundle 또는 핸들러 예외의 RENDER_FAILED 기록·componentStack은 onError에 도달하지 않는 ERROR-023 항목 2 우선 제한입니다. 경고 scope는 origin과 독립적이며 recordScopes는 버퍼 기록의 원래 root·scope만 보존합니다.

읽을 수 없는 중첩 묶음(details·errors getter, index·length 읽기 실패)은 capture에서는 unknown으로 처리하고 호스트 순회에서는 같은 identity의 불투명한 잎으로 보냅니다. 호스트 순회는 묶음의 own 원소를 방문 전에 임시 배열에 읽어 두므로 뒤 원소를 읽지 못해도 앞 원소를 부분 전달하지 않습니다. snapshot과 frame·visited는 호출별 O(N) 임시 메모리이며 영구 필드를 추가하지 않습니다. visit·sink callback의 예외는 삼키지 않습니다.

배열마다 처음 읽은 길이를 반복 범위로 고정하고 정수 1..2^32 − 1, 모든 own index, 끝의 동일한 길이를 요구합니다. capture 판정과 host 순회는 각각 호출당 원소 점검 예산 1,000,000개를 공유하며 invalid·변한 길이·예산 초과는 unknown 또는 원래 묶음 identity의 잎입니다. host의 실패한 snapshot 예약도 소비하며 환불하지 않습니다.

## Acceptance Criteria

### reporting — Single isolated error report

- 다시 실행된 effect는 이미 커밋된 로드 경고를 다시 보내지 않는다.

### ERROR-088 — 격리한 오류를 다시 던지거나 검증 오류로 숨기지 않습니다

경계가 잡은 렌더 오류는 fallback에 가두고 componentDidCatch에서 보고합니다. 현재 폼 보고기를 통해 원래 오류 identity·현재 path·componentStack과 render origin을 연결하되, 이미 보고한 오류·핸들러 예외의 capture 생략 규칙을 따릅니다. ErrorBoundary의 원래 오류 로그는 유지하며 렌더 원인 자체를 host의 reportError로 다시 던지지 않습니다. onError가 던진 별개 실패는 기존 host 통로로 전달하여 재귀 보고를 막습니다.

### ERROR-112 — fallback 이후에도 폼의 보고기가 살아 있습니다

보고기의 객체 identity와 중복 제거 상태는 같은 폼 인스턴스 동안 유지합니다. 이를 경계 안에서 다시 만들면 fallback으로 전환하는 순간 최신 소비자·기보고 상태·전달 가드가 사라져 오류가 누락되거나 중복됩니다. StrictMode effect 정리도 보고기를 새 로드로 취급하지 않습니다.

### ERROR-114 — 공유한 경계는 렌더 때 현재 보고기를 읽습니다

경계 컴포넌트가 모듈·정의·폼 단위로 재사용되어도 보고기를 생성 시점 closure에 붙잡지 않습니다. 필드 훅은 명시적 path를 받고 보고기와 path가 같으면 콜백 참조를 유지합니다. undefined path는 루트의 pendingLoad 처리를 먼저 연결합니다. Placeholder만 전용 경로 문맥 훅으로 연결하여 일반 필드마다 Provider를 만들지 않으면서 다른 폼·옛 경로로 보고하는 실패를 막습니다.

### nested-capture — 알려진 중첩 실패의 판정

- render·submit·load capture는 이미 보고한 원인과 핸들러 예외로만 이루어진 유효한 중첩 묶음을 다시 기록하지 않는다. 깊이 50,000에서도 스택을 넘치지 않으며 malformed·미지·재방문 묶음은 보고한다.

### host-leaves — 부른 쪽이 없는 실패 전달

- host helper는 같은 identity와 깊이 우선 순서를 유지한다. native submit·slot은 원인 뒤 handler를 보내고 engine wave·OnChange·load flush의 handler-first 순서는 유지한다. render boundary는 던진 값 그대로 기록한다.

## Last Updated

보고 수명, 경계의 path 연결, origin·경고 scope, capture 중복 판정 또는 host 전달의 예외 의미가 바뀌면 갱신합니다.
