# 106라운드 작은 마운트 손질 실행 계획

Planning method: 사용자 지정 네 항목 순차 실험 및 105C-01 최소 크기 판정.

작업 트리는 stage-07, 시작 HEAD는 `552a975abd8afa6ef914e218832bd8bfddf03d5b`입니다. git 쓰기·설치·병렬 프로세스는 실행하지 않습니다. 모든 명령은 자연 종료하며 480초 미만으로 분할합니다. 새 실험 산출물은 이 디렉터리에 5 MB 이하로 저장하고, 번들·소스맵은 사용자가 지정한 `/private/tmp` 번들 경로에만 둡니다. 사용자 지정 산출물 위치가 seiri 기본 `.seiri/tasks` 위치보다 우선하므로 계획과 수동 게이트 기록도 여기에 둡니다.

1. HEAD/HEAD를 같은 프로토콜로 아홉 회씩 재어 A/A 행 통계를 고정합니다. 대상은 nested-d5-f4·flat-500·oneOf-20·sample-0 마운트, sample-0·nested-d5-f4·oneOf-40 첫/후속 갱신입니다. worker는 fresh process, H/W 표본별 교대, clock 밖 강제 GC, 예열 20, 표본 101이며 기존 64 microtask 및 setImmediate 종단을 유지합니다.
2. `settle/utils/gates/evaluateGate.ts`: dependencies.map을 동일 읽기 순서의 고정 길이 classic loop로 바꿉니다. 속도 비용은 O(의존 수), callback 호출 제거이며 메모리 비용은 기존 입력 배열 하나와 동일합니다. 오류 처리·매회 평가·gateThrowVersion은 유지합니다. 제거 작업 계수 시험의 수정 전 실패, gate differential/shadow 및 실패·순서 시험을 확인합니다.
3. `settle/utils/compute/selectChildren.ts`: 단일 declaration edge가 성공한 경우 기존 entry별 불변 ID 목록을 재사용합니다. 기존 gate/flush/throw 순서와 다중 선언 경로는 유지합니다. 속도 비용은 O(1) 자격 검사·기존 gate 순회와 첫 사용 ID 구성, 이후 임시 active/ID 배열과 push 제거입니다. 메모리 비용은 기존 STATIC_IDS 약한 색인에 entry당 ID 목록 하나를 보유하며 새로운 색인·노드 칸은 없습니다. 동일 계수·settle differential/shadow 검증을 수행합니다.
4. `blueprint/utils/analyze/collectDeclarations.ts`: 기존 검사·capability·ID·fragment·discriminator 기록 뒤 `$ref/allOf/if/oneOf/anyOf`가 없는 경우 stack와 keyword loop를 생략합니다. 속도 비용은 O(1) 자격 검사로 5개 keyword 반복 제거이며 메모리 비용은 적격 호출의 visiting 복사 배열을 제거합니다. 두 환경의 59-schema×collect off/on differential과 제거 작업 계수 시험을 확인합니다.
5. `record/utils/SchemaNodeRevisionLedger.ts`: EMPTY 이전 값과 UpdateValue|RequestRefresh의 정확한 첫 mask에서 전용 counter literal을 만듭니다. 속도 비용은 O(1) mask 검사로 두 번 bit 탐색·증가 제거이며 메모리 비용은 동일 private counter 배열 하나, 14개 명시 슬롯으로 hole을 대체합니다. 다른 mask·previous·unknown bit 및 기존 undefined 읽기·새 원장 참조를 유지합니다. 계수 시험과 revision/delivery differential을 확인합니다.

후보마다 현재 누적 코드의 기준 번들을 먼저 고정합니다. 수정 전 작업 계수 시험의 예상 실패 뒤 DETAIL에 비용·불변식을 기록하고 코드를 수정합니다. 후보별 10행×아홉 회의 909 paired differences를 pooled하여 중앙값의 deterministic 99% percentile bootstrap 구간을 계산합니다. 채택은 어떤 행의 구간 전체가 양수이고 중앙값이 같은 행 A/A 통계를 초과하며, 회귀 행이 없을 때입니다. 회귀는 구간 전체 음수와 |중앙값| > max(|A/A|, 기준 pooled 중앙값×0.005)를 모두 만족해야 합니다. 기각은 해당 코드·문서·시험 전체 복원, 채택은 해당 기준 대비 독립 patch 저장입니다.

정착 설계나 새 계약이 필요한 항목은 STOP으로 보고합니다. 마지막에 package cwd에서 사용자 지정 unit/render/react18, production, tsc, eslint, legacy isolation을 순차 실행합니다. EVENT-070의 두 사례만 각 React project에서 허용합니다. 보고서는 `remeasure-86c02.md`에 지정 heading과 모든 판정 수치를 기록합니다.

계획 검토: grounded-only. 명세의 네 위치와 기존 판정열 harness, 59-schema differential 및 settle shadow 시험을 직접 확인했습니다. 경계·설계 결정은 없으며 별도 ADR·위임이 필요하지 않습니다.

실행 범위 보정: 두 번째 후보는 요청한 단일 ID 목록만 재사용하도록 활성 declaration 배열을 기존대로 유지했습니다. 별도 빈 declaration 상수나 단일 선언용 gate 분기를 추가하지 않았습니다. 이 좁은 구현을 한 번 측정해 회귀로 기각하고 완전히 복원했습니다. 감사 환경 비교는 집계기 자신의 Node 버전 대신 실제 450 worker의 기록된 Node/V8/실행 파일 동일성을 검사합니다.
