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


## Amendment 9·10 — 결과 관문 뒤 정정

- **DR-13-R2 (VALIDATE-052)**
  - 【추론】 DR-13-R2: Amendment 7·8의 완료 시 기존 targets를 pending에 되돌린다는 규칙은 철회한다. 최신 cadence 또는 명시적 root 실행은 stamp와 ReadonlySet 대상을 validationRunning 객체에 보유한다. 새 자동 요청이 stamp를 올리기 전에 같은 stamp의 대상을 pending에 인계하여 후속 한 실행이 배정하며 선후 완료 순서와 이전 실행의 거부에 좌우되지 않는다. 각 실행은 정착·null·stale·commit 변경·거부에서 자신이 설정한 객체일 때만 지운다. 명시적 하위 검증은 설정하거나 지우지 않는다. commit-only 불일치는 stamp가 같아 기존 대상 재요청을 유지한다. 대체된 cadence 거부는 기준처럼 보고하지 않고 후속 실행이 판정을 소유한다. 슬롯이 사용하는 explicit root 거부는 superseded여도 onError와 host에 한 번씩 보고한다. 명시적 하위 validate가 쓰기에 대체되면 caller에게 판정을 반환하되 배정하지 않는 기존 제한은 기준과 현행에 모두 남는다.
- **DR-1-R2 (VALIDATE-021)**
  - 【추론】 DR-1-R2: 모든 기존 recent가 고정된 동안 구성의 readFieldNodeGuard가 아직 고정되지 않은 새 루트의 readValidationEntry를 부를 수 있다. 설치 중인 루트는 entry가 생기기 전 축출 후보에서 제외하여 counts와 recent에 유지하고 overflow를 허용한다. 핀 해제 뒤 후속 축출은 해당 copy를 정확히 한 번 해제한다. inflight 수는 실행 중 보이며 성공·거부 뒤 키가 제거되고 committed counts는 바뀌지 않는다. 같은 id 교체가 핀을 무시하는 제한과 unpin 뒤 다음 축출점까지 overflow가 남는 제한은 유지한다.
- **DR-2-R2 (ERROR-019 / VALIDATE-052)**
  - 【추론】 DR-2-R2: 슬롯 판정의 늦은 실패는 예약 시 붙잡은 load.retired가 참이면 host에 전달하지 않는다. schema 변경 reset·rebuild·validator 교체의 옛 load는 은퇴하며 소비자 기록도 버린다. slot token·stamp·root.disposed를 은퇴 신호로 쓰지 않는다. 같은 스키마 reset과 unmount는 load를 은퇴시키지 않으므로 늦은 ValidatorThrew를 onError 한 번과 host 한 번에 전달한다. 현행 load의 원본 및 bundle 원소 순서 전달은 유지한다.
- **DR-14-R2 (ERROR-028)**
  - 【추론】 DR-14-R2: capture 생략 대상 bundle은 비어 있지 않은 배열이며 모든 index가 seen 또는 handlerFailures의 객체여야 한다. 빈 배열·희소 배열의 hole·미지 객체·primitive를 포함하면 생략하지 않아 renderer의 RENDER_FAILED와 componentStack을 전달한다. 배열 판별은 common-utils의 isArray를 쓰고 index 순회로 확인한다. 알려진 dense bundle·bare handler 객체의 생략과 ERROR-023 항목 2 우선 제한은 유지한다.
- **DR-11-R2 (ERROR-019 / ERROR-028)**
  - 【추론】 DR-11-R2: native degraded submit에서 onError가 던지면 onError 한 번과 host 한 번이며 host는 [SubmitWhileDegraded, handler error] bundle을 받는다. caller가 있는 명시적 제출은 같은 bundle로 거부하고 host에는 보내지 않는다. 슬롯은 handler 오류를 IR-8부터, 첫 원인과 non-bundle 실패를 DR-2부터 원소별 순서로 host에 보낸다. native submit은 거부를 그대로 보낸다. validator 실패 bundle은 라운드 전부터 bundle 하나였고 degraded native handler 실패는 이전 handler·원인 두 호출에서 DR-11의 bundle 한 호출로 바뀌어 ERROR-028을 충족한다. 두 no-caller 통로의 host 형태 통일은 소유자 결정을 기다리며 코디네이터가 단계 마감 때 올린다.
- **DR-9-R2 (REACT-012)**
  - 【추론】 DR-9-R2: 이전 추가 비용 0 표현은 경로 탐색과 리스너 배달에 한정한다. node와 root 입력에는 추가 경로 탐색·리스너 배달이 없으며 렌더마다 상수 시간 snapshot hook 하나가 있다. 경로 프록시의 container 리스너·사건 필터·재탐색 비용과 기본 root 네 리스너는 유지한다. tracker나 강제 rerender가 없는 probe도 구조 변경만으로 현행 노드를 읽는다.

DR-15의 기존 읽기 scope 소유 규칙은 StrictMode와 React18 legacy root에서 원래 scope별 reportInLoad 횟수로 확인합니다. 현재 명세는 검증기 실패 origin validate와 degraded 제출 origin submit, 알려진 bundle·handler capture 예외를 구별합니다. 기존 결과·결정 줄은 보존하며 뒤의 결과 보충이 이전 검증의 범위를 대체합니다.


## Amendment 11 — P3 관문 보충

상속된 배열 index는 own index가 없으므로 hole입니다. DR-14의 dense bundle 검사는 common-utils/lib의 hasOwnProperty로 각 index를 읽기 전에 소유 여부를 확인합니다. DR-13은 기존 객체 정체성 cleanup 계약을 바꾸지 않고 resolve·reject cadence와 명시적 root 소유자의 R1→R2→R1 정착→R3 인계 및 완료·즉시 dispose 제거를 추가 단언합니다. 조건 제거 변이는 세 경로·두 React에서 실패해야 합니다.

Amendment 11의 명시적 예외로 VALIDATE-052와 ERROR-028의 중복 보충 헤더 세 줄을 한 줄로 정리합니다. 각 항목의 두 header 줄만 지우며 결정·인용문은 바꾸지 않습니다. 두 Provider DETAIL은 explicit validate/submit이 슬롯 없이 즉시 시작함과 validate/submit origin을 명시합니다.


## DR-16·DR-17 — 중첩 capture와 호스트 잎 전달

소유자 답변 75: “흠... 그래도 발견을 했으니까 일관되게 바꾸고싶은데... 말한대로 onError 핸들러 자체에 오류가 있을때 발생할 수 있는 예외케이스인건 이해가 되네. 추천하는 방향은 어떤건데? 일치를 시킨다고 했을때?”

“응 그럼 그렇게 바꾸자.”

DR-16은 기존 결함입니다. 5d1348ed1은 flat·nested 묶음 모두 RENDER_FAILED를 만들었고 DR-14는 flat만 닫았습니다. ERROR-023 항목 2의 중복 기록 제한을 유지하며 중첩 판정만 확장합니다. 깊이 50,000의 알려진 중첩은 기준 구현에서도 보고하므로 소유자의 후속 답변에 따라 red 회귀로 분류하며 최종 onError 0회 조건은 유지합니다.

- **DR16C-01 — ERROR-028 / ERROR-023 항목 2**
  - 【추론】 DR-16: capture 생략 대상 bundle의 원소는 seen 또는 handlerFailures의 객체이거나, 같은 규칙(비어 있지 않은 배열·모든 index가 own·모든 원소가 알려진 객체)을 만족하는 SchemaFormError 인스턴스 MultipleErrors 묶음이다. 원래 실패가 둘 이상인 사슬에서 onError가 던질 때의 [[A, B], H] 묶음은 render·submit·load capture에서 다시 기록하지 않는다. SchemaFormError가 아닌 중첩 묶음, 순환하거나 한 판정에서 다시 만난 중첩 묶음, 빈 배열·hole·미지 객체·primitive가 어느 깊이에든 있으면 보고한다. 판정은 재귀 없이 순회하며 capture는 예외를 던지지 않는다. DR-14-R2의 원소 규칙은 이 규칙으로 확장되고 host 전달과 ERROR-023 항목 2 우선 제한은 그대로다.

- **DR17C-01 — ERROR-008·019·028 / EVENT-046**
  - 【추론】 DR-17(quote 75): 부른 쪽이 없는 실패는 host에 오류 하나씩 보낸다. SchemaFormError MultipleErrors 묶음(비어 있지 않은 배열·모든 index가 own)은 원소를 깊이 우선·원소 순서로 펼쳐 잎마다 한 번 보내고 같은 규칙의 중첩 묶음만 펼친다. 형식이 어긋난 묶음·다시 만난 묶음·그 밖의 값은 그대로 한 번 보낸다. 적용 자리는 native submit, load flush·reset의 load 오류와 핸들러 예외, capture의 핸들러 예외, 슬롯 판정, engine의 검증 결과 파동과 OnChange 실행 실패의 주인 없는 싱크이며 핸들러 예외가 묶음이면 그것도 원소별로 보낸다. 핸들러 예외가 원래 실패보다 먼저 host에 가는 자리(검증 결과 파동, OnChange 실행 실패, load flush)의 순서는 바꾸지 않는다. 렌더 경계가 잡은 값의 host 보고는 React와 경계의 기록이므로 던진 값 그대로이다. caller가 있는 validate()·submit()은 묶음 하나로 거부한다. DR-11-R2·DR-14의 bundle host 한 번과 ERROR-008·ERROR-028·EVENT-046의 싱크 한 번은 잎마다 한 번으로 읽는다.

native submit과 슬롯의 원인 우선 순서는 유지합니다. 슬롯이 이전에 버리던 malformed bundle은 이제 그 값 자체로 보고합니다. 원장 보충은 과거 결정을 지우지 않고 이 결정을 우선 적용합니다.
