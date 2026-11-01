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
