# 입력 응답성 결함 라운드 — Amendment 2 계약

기준은 779713587이며 코디네이터가 독립 설계 검토의 조건을 반영했습니다. 이 기록은 제품 라운드의 결정이며 측정·기록 경로 정리는 별도입니다.

- **DR-1 (VALIDATE-021)**
  - 【추론】 DR-1: 커밋 소비자 counts와 별도로 inflight 핀을 두고 전체 검증의 컴파일 점검 전부터 promise 정착까지 유지한다. LRU 두 축출점은 recent.length > 8인 동안 가장 오래된 비고정 루트를 축출하며 모두 고정되면 멈춘다. unpin은 0인 키를 지우고 이미 recent에 있는 루트만 맨 뒤로 옮기며 플러그인 호출이나 축출을 하지 않는다. 실행 종료부터 다음 축출점까지 recent가 8개를 넘을 수 있다. 같은 $id 교체와 충돌 검사는 핀을 무시하므로 커밋 소비자가 없는 고정 사본도 실행 중 해제되어 ValidatorThrew로 실패할 수 있다. IR-7 L1의 unmount 뒤 쓰기·검증 전달은 유지하며 LRU 초과 때문에 실행 중 해제되는 부분만 닫는다.
- **DR-2 (ERROR-019 / VALIDATE-052)**
  - 【추론】 DR-2: 호출자가 없는 슬롯 첫 판정의 ValidatorThrew는 engine의 origin validate 기록을 다시 만들지 않고 원래 실패를 host에 한 번 전달한다. MultipleErrors는 bundle 자체 대신 errors[0]부터 소비자 오류 꼬리까지 순서대로 전달한다. ValidatorCompileFailed는 이미 로드 진입점에서 처리하므로 이 helper에서 무시한다. ERROR-019의 IR-8 보충 중 항목 3의 오래된 ValidatorThrew 보고 유지 문장과 VALIDATE-052의 IR-7·IR-8 보충은 슬롯 판정에 한해 이 규칙으로 대체하며 ir-8-results의 L3를 닫는다.
- **DR-3 (ERROR-201 / VALIDATE-046)**
  - 【추론】 DR-3: 캐시된 duplicate 실패는 다른 같은 $id 루트의 counts가 양수인 동안 유지한다. 충돌 해제 뒤 다음 전체 스키마 읽기의 assertValidationRootReady에서 entry마다 한 번 재시도한다. readValidationEntry와 guard 읽기는 재시도하지 않는다. 재시도 전 문자열 $id가 같은 recent 루트들을 복사 목록에서 순회하고 자기 자신을 제외하여 기존 축출을 적용한다. copy와 guards 및 이미 반환한 guard를 유지하고 성공 시 validate를 설정하며 failure·duplicate·rejection과 중복 id 메시지의 guard 실패를 지운다. 실패 시 원래 failure·duplicate·rejection 정체성을 유지하고 retried를 기록한다. IR-8의 컴파일 시점 중복 원인을 상대 해제 뒤에도 캐시에 보존한다는 문장은 충돌 지속 또는 실패한 재시도에만 적용한다. compileGuard 호출 및 실패한 compile 뒤 같은 copy의 compile 재시도가 깨끗이 등록되어야 하는 책임은 플러그인에 있다. reset과 commit 사이 validate 또는 commit보다 먼저 실행된 슬롯에서 실패하면 해당 로드의 검증은 계속 unavailable이다.
- **D9 (ERROR-023 우선 제한)**
  - 【추론】 D9: 소유자 quote 59와 ERROR-023 항목 2의 render capture skip-and-delete를 유지하며 DR-4는 철회한다. host가 이미 보고된 engine 거부 객체를 render에서 다시 던지면 생략된 render 기록의 componentStack과 path는 onError에 도달하지 않고 boundary console.error에만 남는다. seen 삭제 뒤 native submit이 같은 거부를 onError에 다시 보고할 수 있으며 이는 ERROR-019의 IR-8 round b 중복 보고 방지 보충보다 ERROR-023 항목 2가 우선하는 허용 제한이다.

## Amendment 3·4 — 재현된 D4·D5의 수정

- **DR-8 (ERROR-019)**
  - 【추론】 DR-8: 교체 load는 그 reset이 보고하며 pendingLoad가 다시 전달하지 않는다. prepared 직후 reported를 설정하고 next.error는 caller throw를 위해 유지한다. 기존 prepared 명령형 reset의 load 기록 한 번·caller throw·host 0과 never-prepared flush는 보존한다. 최초 구성 실패 뒤 constructible schema로 재렌더한 reset의 applyFormErrors listener 실패는 자체 batch 사슬로 보고된다. props-driven reset의 primitive throw는 seen으로 중복 제거할 수 없어 load와 render 기록이 각각 한 번 생기는 기존 제한이며 ERROR-023 항목 2를 따른다.
- **DR-9 (REACT-012 / SURFACE-009)**
  - 【추론】 DR-9: 경로 주소 바인딩은 경로 컨테이너들의 UpdateChildren을 따라 다시 해석한다. find는 현재 구조에 대한 조회다. useSyncExternalStore는 root부터 각 경로 prefix의 find 결과를 구독하고 unresolved prefix에서 멈춘다. 리스너는 사건 비트로 필터하며 변경 때 모두 해제·재탐색·재구독한 뒤 snapshot 변경을 통지한다. node 입력과 undefined 및 root로 해석되는 입력은 고정 snapshot과 no-op 구독이다. 기본 root proxy와 node-addressed children의 추가 구독·쓰기 비용은 0이며 root의 기존 네 리스너를 유지한다. 경로 프록시는 container마다 리스너 한 개와 사건마다 필터 호출 비용이 들고 wildcard는 첫 매치만 추적한다. identity 변경으로 Input이 remount되면 focus를 잃는 REACT-023 제한은 유지한다. 구독 직후 snapshot 재확인은 tearing을 막으며 재구독 리스너의 같은 wave 재호출은 허용한다.


## Amendment 5 — 현행 root의 errors와 문서

- **DR-10·DR-12 (ERROR-019 / SURFACE-053 / WRITE-045)**
  - 【추론】 DR-10·DR-12: validator 교체 또는 pending reset 재대조 뒤 errors effect는 렌더가 보유한 옛 root가 아니라 store.load.root의 현행 root에 적용한다. 같은 errors 배열 재적용은 기존 조기 반환을 따른다. replacement reset의 applyFormErrors는 이전 root 유무와 무관하게 load origin으로 호출하며 자체 batch 사슬의 listener 실패도 load로 보고한다. 오류 배열 내용·경로별 배정과 caller throw·호스트 전달 규칙은 바꾸지 않는다.

F1은 공개 SPECIFICATION의 ValidatorCompileFailed 셀을 IR-9의 origin validate 및 자동 host·명시적 rejection으로 정정합니다. F2는 OnChange만 오류 표시를 hold하고 다른 mode는 live 조건을 따른다는 공개 주석 세 곳의 정정이며 형·행동 변경이 아닙니다. 존재하지 않는 onReady는 현행 Provider 문서에서 제거합니다. DR-11은 재현과 ERROR-019 항목 3·4의 대조 결과를 코디네이터에게 보고하고 결정을 기다립니다.


## Amendment 6 — DR-11

- **DR-11 (ERROR-019 항목 3·4)**
  - 【추론】 DR-11: degraded 폼의 명시적 submit은 ERROR-019 항목 3과 4에 따라 거부 직전에 origin submit의 onError 기록을 한 번 전달하고 caller에게 SUBMIT_WHILE_DEGRADED로 거부하며 host에는 보내지 않는다. native submit은 같은 원인 기록 한 번과 host 한 번을 유지하고 이미 보고한 거부 객체의 capture는 seen으로 중복 제거한다. 검증 오류가 아닌 submitForm 거부는 두 통로 모두 같은 보고 콜백을 사용한다. degraded 폼의 명시적 validate에서 검증기 실행 실패는 이미 origin validate로 한 번 보고한 뒤 caller에게 거부하므로 그대로 유지한다.


## Amendment 7·8 — 전체 판정과 보고 수명

- **DR-13 (VALIDATE-052)**
  - 【추론】 DR-13: 로드가 빚진 전체 판정은 루트 전체에 배정하는 요청만 충족한다. 로드 판정이 남아 있으면 자동 하위 요청을 루트로 넓혀 슬롯을 대체하고 검증기는 한 번 실행한다. None·OnRequest-only는 자동 요청하지 않으며 명시적 하위 validate는 stamp를 올리지 않는다. 비동기 슬롯 또는 cadence 루트 판정이 새 stamp에 대체되면 기존 targets를 pending에 되돌려 다음 cadence 판정에 함께 배정한다. 변경 setValue의 root 요청은 기준에서도 정상인 보호 시험이다. IR-8의 쓰기 요청이 항상 root라는 가정을 이 범위에서 정정한다.
- **DR-14 (ERROR-028)**
  - 【추론】 DR-14: onError가 던진 객체를 handlerFailures에 보존한다. capture는 이미 보고한 객체·핸들러 예외 객체를 다시 보고하지 않으며 MultipleErrors의 모든 원소가 이 두 집합의 객체일 때도 기록을 생략한다. 미지 객체·primitive 원소는 보고한다. native submit의 컴파일 실패는 원인 onError 한 번과 bundle host 한 번이다. render capture가 이 bundle 또는 핸들러 예외를 생략하면 RENDER_FAILED 기록과 componentStack도 onError에 없으며 D9와 같이 ERROR-023 항목 2가 우선한다. degraded 명시적 submit은 report 통로로 원인을 보고하고 핸들러 예외가 있으면 [SubmitWhileDegraded, 핸들러 예외]로 caller에게 거부하며 host에는 보내지 않는다.
- **DR-15 (ERROR-202)**
  - 【추론】 DR-15: 지연한 터미널 자식 읽기 경고는 읽을 때의 warning scope가 소유한다. microtask에서 reporter.root가 입력 자신의 root와 다르면 폐기한 load의 경고를 버린다. 같은 root reset은 원래 scope로 전달하여 새 load의 첫 읽기를 막지 않는다. rebuild 뒤 옛 입력 읽기도 버린다. 실패한 rebuild는 root를 유지하되 이미 새 scope를 시작하므로 다음 읽기가 다시 보고된다. unmount 뒤 개발용 경고는 기존처럼 마지막 onError에 도달한다.

F4는 공개 batch 또는 walk 안의 중간 상태가 별도 이력이 아니며 쓰기 시퀀스의 첫 상태만 기록한다는 예외를 현행 설명에 정정합니다. 한 React batch 안의 서로 다른 공개 호출은 중간 상태를 기록합니다. 기존 기록은 보존합니다.
