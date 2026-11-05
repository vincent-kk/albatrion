# loadFieldNodeAtMount 계약

## Requirements

최초 마운트의 입력·로드 스냅숏과 자격 판정, 한 커밋의 관측 경계를 소유합니다. 일반 쓰기·reset·생김과 에지의 공통 의미는 [settle](../DETAIL.md)의 WRITE-090·SETTLE-005를 따릅니다. 최초 로드 최적화는 값·형상·유효 스키마·선택 ID·상태·오류·진단·리비전·배달 순서를 바꾸지 않습니다.

## API Contracts

빠른 경로는 노드 변경과 커밋 번호 예약 전에 자격을 판정합니다. 자격을 거절한 경로가 커밋 번호를 소비하거나 중간 발생을 등록하면 일반 로드와 다른 번호·순서·상태를 만들게 됩니다. 공통 입력 스냅숏·진단 준비와 finally 정리는 모든 경로에서 유지합니다.

## Acceptance Criteria

### SETTLE-046 — 최초 로드는 새 수명의 규칙을 적용합니다

최종 형상의 노드는 모두 생긴 것으로 취급하고 없음인 값만 채우며, injectTo·derived의 로드 에지와 로드된 값을 읽는 unsetValue를 일반 정착과 같이 적용합니다. 자동 쓰기 억제도 같은 범위에 적용합니다. 부모의 WRITE-021에 따라 첫 편집 전까지 별도의 방출 의미를 사용하지 않습니다.

### mount-publication — 완성된 트리만 외부에 보입니다

첫 리스너 전에 전체 리비전과 payload·전역 상태·커밋 번호를 확정합니다. 자식 우선 계산과 문서 순서 배달은 다른 순서이므로 배달 자리를 진입 때 예약하고 확정 뒤 기존 디스패처가 전달하게 합니다. 정착 도중 리스너·보고기를 동기로 부르지 않습니다. 자격 확정 뒤 커밋 하나만 예약하고, 실행이 시작된 뒤 실패해도 다른 마운트 경로로 다시 시도하지 않습니다.

입력 loadSnapshot과 출력 loadBaseline은 다릅니다. 최종 root.emit 기준은 커밋·전역 상태 확정 뒤 보관하며, 자세한 기준 수명은 부모의 VALUE-044를 따릅니다. 정상·예외 종료 모두 호출 소유 준비물을 해제하고 revision 전이 메모를 진입 전 상태로 복원하여 재진입이 이전 마운트의 증인을 사용하지 않게 합니다.

### static-first-admission — 무게이트 로더의 좁은 증명

입력이 undefined이고, 붙어 있는 fresh root에 이전 커밋·배달·pending·자식·source·extras·전역 상태가 없으며 청사진의 StaticFirstLoadCapability가 증명된 경우에만 무게이트 로더를 사용합니다. 명시 입력은 같은 값처럼 보여도 일반 경로로 보냅니다. 게이트·식·파생·watch·virtual·union·통째 host·재귀·controls.default 등 증명 밖 기능을 정적 로더에서 부분 해석하지 않습니다.

이 경로는 부모 default의 명시 분배를 자손 default보다 먼저 적용하고 각 노드를 자식 완료 뒤 한 번 조립합니다. 일반 선택의 occurrence별 임시 선언·dirty·빈 자동/나감 집합과 initialOutputs 목록을 만들지 않습니다. 이미 필요한 O(N) 노드·배달 순서 셀과 O(D) DFS 스택은 남고, O(N) 마운트를 상수 비용이라고 약속하지 않습니다. 입력 없는 무게이트 청사진은 게이트 선택 계획·표를 준비할 이유가 없습니다.

### fixed-first-admission — 조건부 경로는 일반 정착을 유지합니다

별도의 불변 fixedFirstLoadPlan과 같은 fresh-root·undefined 입력 증명이 있을 때 조건부 경로를 사용합니다. verify 표·shadow 바퀴·deriveShadow 조합은 지원 증명이 없으므로 변경 전에 일반 경로로 보냅니다. 이 경로를 무게이트 로더의 단일 조립·scratch 부재 보장으로 확장하지 않습니다.

조건부 경로는 무조건 발생 baseline을 한 번 구성하고 매 compute epoch에 영향 자식을 무게이트 유효 스키마로 복원합니다. 비루트 if 호스트의 부모 incoming edge와 영향 child contribution을 원래 자리에서 선택하고, 루트 자체 선언 선택은 루트에만 남깁니다. 각 호스트를 별도 선평가하거나 최종값을 미리 계산하지 않습니다. default 뒤의 guard 입력·호출 순서와 횟수·확인 라운드·출력 조립·required/control·오류 의미를 일반 정착이 계속 소유하게 하려는 경계입니다.

container default·배열·union·disjunction 등 계획이 증명하지 못한 그래프는 전체 일반 경로로 보냅니다. 선택 준비는 호출 소유 문맥에만 두고 이후 쓰기·reset의 판정 결과나 live 플래그로 남기지 않습니다. 할당·필수 커밋/배달은 O(N), 반복 선택은 G개 게이트와 K개 영향 기여에 비례하며 실제 guard·조립 비용은 별도입니다.

### fixed-first-load-modes — 검증을 우회하는 자격은 없습니다

지원하는 off·table·predicate 모드는 일반 경로와 같은 공개 관측을 유지합니다. 미지원 검증 조합은 fixed-first-admission의 일반 경로 복귀를 적용하여 활성 verifier를 조용히 생략하지 않습니다.

### fixed-first-load-review-guards — 불투명 가드와 중첩 입력

[fixed-first-admission](#fixed-first-admission--조건부-경로는-일반-정착을-유지합니다)의 계약을 적용합니다.

### fixed-first-load-work — 고정 형상과 영향 선택 비용

[fixed-first-admission](#fixed-first-admission--조건부-경로는-일반-정착을-유지합니다)의 계약을 적용합니다.

### fixed-first-load-observables — 마운트와 후속 쓰기의 동등성

[mount-publication](#mount-publication--완성된-트리만-외부에-보입니다)의 계약을 적용합니다.

### fixed-first-load-defaults — 기본값과 입력 epoch

[SETTLE-046](#settle-046--최초-로드는-새-수명의-규칙을-적용합니다)의 계약을 적용합니다.

### fixed-first-load-errors — 실패 공표

[mount-publication](#mount-publication--완성된-트리만-외부에-보입니다)의 계약을 적용합니다.

### fixed-first-load-hosts — 발생의 지역 소유

[fixed-first-admission](#fixed-first-admission--조건부-경로는-일반-정착을-유지합니다)의 계약을 적용합니다.

### fixed-first-load-lifetime — 호출 소유 준비물

[mount-publication](#mount-publication--완성된-트리만-외부에-보입니다)의 계약을 적용합니다.

### settle-static-gate-selection-preparation — 정적 첫 로드의 준비 생략

[static-first-admission](#static-first-admission--무게이트-로더의-좁은-증명)의 계약을 적용합니다.

### settle-static-first-load — 정적 첫 로드의 일반 경로 동등성

[static-first-admission](#static-first-admission--무게이트-로더의-좁은-증명)의 계약을 적용합니다.

### settle-static-first-load-residual-scaling — 기본값 부재와 영향 범위

[static-first-admission](#static-first-admission--무게이트-로더의-좁은-증명)의 계약을 적용합니다.

### settle-static-first-load-assembly — 한 번 조립과 사전 판정

[static-first-admission](#static-first-admission--무게이트-로더의-좁은-증명)의 계약을 적용합니다.

## Boundary Exemptions

### `__tests__/fixtures/observeFixedFirstLoad.ts` — 최초 로드의 차등 관측

- **Consumers**: `__tests__/*.test.ts`
- **Direct import**: `allowed`
- **Reason**: 마운트 소유 observer는 런타임 청사진의 자격 사실만 교체하고 부모 정착의 진입·출력·커밋 내부를 관측하여 실제 경로 사용과 의미 동등성을 구별합니다. 공개 경계로 작업 계수를 내보내면 제품 계약이 넓어지므로 이 시험 전용 접근을 허용하며 제품 import는 허용하지 않습니다.

## Last Updated

최초 로드의 자격·기본값 우선순위·준비물 수명·관측 경계 또는 비용 한계가 바뀔 때 갱신합니다.
