# W4·W1 구현 계획

Planning method: repository implementation brief (round-468 request/design/verification conventions).

## 범위와 순서

기준55055f65b에서 W4 병합 대상의 한 번 라우팅과 W1 자식 오류 구독 저장소만 구현합니다. 원문65·79와469라운드 결정이 근거이며 버전·릴리스·push·게시·병합은 포함하지 않습니다. W5·W2·W3·C2 및 A의 C1은 기록으로 닫습니다.

1. validation/DETAIL의 routing과 hooks/DETAIL의 snapshot 현재 계약을 먼저 고치고 VALIDATE-043·052에 sup-insert로469 보충을 추가하여 별도 계약 커밋을 만듭니다.
2. validation 내부 시험은 오늘의 순차 routing 사본을 시험 전용 oracle로 두고 병합 자동 요청의 결과를 비교합니다. 겹침·루트·중첩·범위 밖·꺼진 union·rejectedKey·떼어진 같은 경로 키·살아 있지 않은 target과 배열 참조·changed 집합·combined 캐시·global 목록을 검증합니다. hook 렌더 시험은 기존 구현과 동일한 스크립트의 관측을 고정하고 render/react18에서 구독 경합·StrictMode·children·disabled·부모 UpdateChildren을 검증합니다. 계수 시험은 기준에서 실제 중복 작업 때문에 실패해야 하며 나머지 특성화는 통과해야 합니다.
3. W4는 routeValidationIssues가 iterable targets를 받아 동일성 Set과 target 경로 Set으로 엄격한 조상 범위를 계산합니다. 첫 target의 root가 runtime을 고르며 빈 입력은 빈 changed 집합입니다. 단일 호출에서 active 선언 집합과 각 issue 경로를 한 번 처리합니다. requestFieldNodeValidation은 전체 targets로 한 번 호출하고 dispatchValidate 및 form 오류 초기화는 단일 원소 배열을 넘깁니다. 호환 adapter는 두지 않습니다.
4. W1은 hooks/fieldNode 아래의 사설 utils/createChildErrorStore에 저장소를 둡니다. hook은 node·children·disabled로 useMemo하고 동일한 부모+children mask를 구독합니다. 비구독 snapshot은 기존 joined string이며 구독 시 base 한 번과 version 증가로 snapshot을 바꿉니다. 해제는 모든 리스너와 구독 상태를 복원합니다.
5. focused green 뒤 M1 Set 재구축·M2 같은 경로 stale 키 포함·M3 부모 구독 누락·M4 통지 뒤 base 고정을 각각 red로 확인하고 바이트를 복원합니다.
6. lint 경고0·typecheck·정식 build와 unit/render/react18/storybook/production/verify-unit/verify-render, importModel을 순차 실행합니다. 원장 및 FCA 기준 비교, 기계 경로·버전 감사를 보존하고 소스와 재생성 runtime 산출물은 별도 커밋으로 둡니다.
7. 최종 후보로 W4 merged/single-target와 W1 all-child/200-single-wave/unsubscribed의5셀 수용 측정 스크래치를 준비해 파일럿만 수행합니다. 전체 측정·후보별 수용/철회는 코디네이터가 수행합니다.

## 관측과 비용

W4 범위는 target 동일성 또는 / 경계의 더 짧은 조상 경로만 허용하며 같은 문자열 주소를 가진 다른 stale 키는 target이 아닙니다. 단일 대상 반환은 기존 changed이며 복수 대상은 변경 집합의 합집합입니다. 기존 오류 항목과 재사용 가능한 배열 참조, global 목록·combined 무효화·최신 stamp 규칙을 유지합니다. 비용은 대상 수+경로 깊이·이슈 순회이며 실행 한 번의 임시 집합만 보유합니다.

W1은 오류 표시 정책을 저장소에 옮기지 않고 기존 event mask의 revision invalidation만 보유합니다. 구독 전 O(C), 최초 구독 O(C), 구독 중 snapshot O(1), 구독 수명 보유 O(C)이며 부모도 포함합니다. 원래 hook의 반환 형과 표시·formatting은 같습니다.

## 검증 기록

사용자가 scratch를 저장소 밖으로 제한했으므로 자동 .seiri ledger 대신 /private/tmp/claude-501/perf-runs/lazy-b/impl/gates.md의 명시적 CHECK 기록을 사용합니다. 별도 성능 실행은 하지 않으며 파일럿 수치로 수용하지 않습니다. 현행 설계는 lazy-b-design Amendment 1이며 그 독립 설계 검토를 재사용하고 실제 경로·호출·표현을 추가로 grounding합니다.

## 계획 검토

grounded-only. 승인된 Amendment 1의 독립 설계 검토를 재사용합니다. 현재 route 함수·request caller·form clear 반환 소비자, strict isDescendantPath와 hook의 부모+children 구독 및 render/react18 구성이 실코드에서 확인되었습니다. 같은 경로 stale 키의 동일성 구분과 부모 UpdateChildren, 복수 대상 changed 합집합을 요구사항별 검증에 포함했습니다. scratch 위치 제한에 따라 외부 gates.md를 쓰는 것 외에 설계 변경은 없습니다. 구현에 진입합니다.
