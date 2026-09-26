# 단일 원장 — 통지(이벤트 시스템)

기준 커밋: `ba398c330`(저장소 `packages/canard/schema-form/architecture`). 정본 우선순위는 다음 순서다. (1) 소유자 답은 고정이다. (2) `adr/0008-event-system.md`(ADR 0008, 5차 본문에 17라운드까지 반영)가 이 영역의 정본이다. 다만 오류·경고의 드러남, `onError`, `diagnostics`의 모양과 지속, 제출 거부는 `adr/0014-error-policy.md`(ADR 0014 4판, 채택)가 정하므로 오류 원장이 소유하고, 이 원장은 그 문장을 다시 적지 않고 가리킨다. (3) `03-mental-model.md`(원리 원장)는 `08-design-a-to-z.md`와 다르면 `03`이 이긴다. (4) 뒤 라운드가 앞 라운드를 이긴다. `06-conclusions.md`·`07-conclusions.md`는 그때의 기록이며 고치지 않는다. 상태 값의 뜻: **현행**은 지금 유효한 규칙, **현행(부정 결정)**은 하지 않기로 정한 것, **현행(기록)**은 규칙이 아니라 결정의 평가를 남긴 것, **대체됨**은 한때 유효했으나 뒤 라운드가 바꾼 규칙(옛 문장을 원문 그대로 남긴다), **열림**은 아직 정해지지 않은 것이다. 한 줄 안에서 라운드나 닫은 사람이 다른 문장은 문장 경계에서 나누었다. 한 문장이면 출처를 `path:line#n`으로, 이어진 여러 문장이면 `path:line#a-b`로 적는다.

## 색인

| 번호 | 한 줄 요약 | 상태 | 닫은 사람 |
| --- | --- | --- | --- |
| EVENT-001 | 통지 전용 — 역할 셋, 유지하는 것과 바뀌는 것 | 현행 | 소유자 답(`00-goals.md:151` G7), 소유자 답(`00-goals.md:117` C3 세부 3), 편집자 결정(4라운드, `adr/0008-event-system.md:3`) |
| EVENT-002 | 통지의 시점 — 쓰기 하나는 동기로 정착·통지, 배열 연산은 동기 | 현행 | 편집자 결정(4라운드, 실행 검증을 통과한 제안, `adr/0008-event-system.md:3`·`reviews/round-4.md:77`) |
| EVENT-003 | 포맷터의 캐럿 복구는 입력 컴포넌트의 몫, 수용 기준은 F14 | 현행 | 편집자 결정(4라운드, `reviews/round-4.md:135` F14) |
| EVENT-004 | 루트 단일 디스패처 — 노드에 남는 것과 한 번의 순회 | 현행 | 편집자 결정(1라운드 R17 명세 6항, `reviews/round-1.md:81`), 편집자 결정(4라운드, `reviews/round-4.md:169`) |
| EVENT-005 | 디스패처 규칙 1 — 순서 | 현행 | 편집자 결정(4라운드, `reviews/round-4.md:90` V10) |
| EVENT-006 | 디스패처 규칙 2 — 배달 집합 | 현행 | 편집자 결정(4라운드, `reviews/round-4.md:141` F20), 편집자 결정(10라운드 5차 본문, `07-conclusions.md:96`·`adr/0008-event-system.md:13`) |
| EVENT-007 | 디스패처 규칙 3 — revision 원장은 커밋 시 배달 집합 전체를 한 번에 올림 | 현행 | 편집자 결정(4라운드, `reviews/round-4.md:137` F16·`reviews/round-4.md:85` V5) |
| EVENT-008 | 디스패처 규칙 4 — 파동, 리스너 되먹임의 판별, 되먹임 상한과 그 초기화 | 현행 | 원리(`reviews/round-10-owner-answers.md:10` A-4, 상한을 두고 넘으면 오류로 알린다는 원칙), 편집자 결정(4라운드, `reviews/round-4.md:136` F15, 마지막 파동을 한 번 더 배달하고 되먹임만 거부), 편집자 결정(06 도출 D-17, `06-conclusions.md:158`; 10라운드 5차 본문 `adr/0008-event-system.md:13`·`07-conclusions.md:93`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-14) |
| EVENT-009 | 디스패처 규칙 5 — 분리된 노드 | 현행 | 편집자 결정(4라운드, `reviews/round-4.md:90` V10) |
| EVENT-010 | 디스패처 규칙 6 — 리스너 격리, 모은 예외는 사슬 끝에서, 기록은 onError로 | 현행 | 편집자 결정(4라운드, `reviews/round-4.md:142` F21·`reviews/round-4.md:90` V10), 편집자 결정(14라운드 O-5 위임, `reviews/round-14-owner-answers.md:11`), 17라운드 스웜 수렴(편집자 결정, `adr/0008-event-system.md:201`) |
| EVENT-011 | 리스너 목록은 파동 시작 시점에 고정 | 현행 | 편집자 결정(4라운드, `reviews/round-4.md:138` F17·`reviews/round-4.md:86` V6) |
| EVENT-012 | 상태 칸의 쓰기는 원본 쓰기가 아니다 | 현행 | 편집자 결정(1라운드 R15, `reviews/round-1.md:79`), 편집자 결정(10라운드 5차 본문, `adr/0008-event-system.md:13`) |
| EVENT-013 | batch(fn) — 쓰기를 표시하고 fn 끝에서 정착 한 번·파동 한 번 | 현행 | 편집자 결정(4라운드, 실행 검증을 통과한 제안, `adr/0008-event-system.md:3`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-20) |
| EVENT-014 | 중첩 batch는 가장 바깥이 이긴다 | 현행 | 편집자 결정(4라운드, 실행 검증을 통과한 제안, `adr/0008-event-system.md:3`) |
| EVENT-015 | fn 안의 reset — 곧바로 정착하고 그 커밋은 fn 끝의 파동에 합류 | 현행 | 16라운드 스웜 수렴(편집자 결정, `09-landing-and-test-strategy.md:79,90`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-101) |
| EVENT-016 | 리스너 안의 batch는 자기 배치이며 리스너 되먹임으로 센다 | 현행 | 편집자 결정(4라운드, `reviews/round-4.md:139` F18), 편집자 결정(06 도출 D-17, 10라운드 5차 본문 `adr/0008-event-system.md:13`) |
| EVENT-017 | batch의 fn이 던질 때 — 표시된 쓰기는 정착·통지, 예외는 사슬 머리 끝에서 | 현행 | 편집자 결정(14라운드 O-5 위임, `reviews/round-14-owner-answers.md:11`), 편집자 결정(17라운드, ADR 0014 4판 채택) |
| EVENT-018 | 렌더 중 쓰기는 소비자 오류이며 core는 구별하지 않음 | 현행 | 편집자 결정(4라운드, `reviews/round-4.md:139` F18) |
| EVENT-019 | 배치는 정착 횟수를 바꾸므로 값이 순차 호출과 다를 수 있다 | 현행 | 편집자 결정(06 도출 D-13, `06-conclusions.md:134`; 10라운드 5차 본문 `adr/0008-event-system.md:13`·`07-conclusions.md:91`) |
| EVENT-020 | 예산 다섯과 각 예산이 세는 것 | 현행 | 편집자 결정(06 N4, 10라운드 5차 본문 `adr/0008-event-system.md:13`), 편집자 결정(17라운드, ADR 0014 4판 채택) |
| EVENT-021 | 예산 초과 시의 진행 — 커밋 → 검증 요청 → onChange, 예외는 onChange 중첩 하나 | 현행 | 편집자 결정(06 도출 D-16·D-31, `06-conclusions.md:150`; 10라운드 5차 본문 `adr/0008-event-system.md:13`·`07-conclusions.md:92`) |
| EVENT-022 | 예산 초과의 throw는 그 진입의 onChange와 검증 요청을 건너뛰게 하지 않는다 | 현행 | 편집자 결정(06 도출 D-16, `06-conclusions.md:150-151`; 10라운드 5차 본문 `adr/0008-event-system.md:13`) |
| EVENT-023 | UpdateValue의 payload — 커밋 시점의 {previous, current}, 호스트는 local과 emit을 모두 실음 | 현행 | 편집자 결정(4라운드, `adr/0008-event-system.md:12`) |
| EVENT-024 | previous는 마지막으로 통지한 값, 커밋 번호, payload는 불변 | 현행 | 편집자 결정(4라운드, `reviews/round-4.md:140` F19·`reviews/round-4.md:149` F28) |
| EVENT-025 | UpdateValue payload에 출처 필드를 더하지 않는다 | 대체됨(→ EVENT-060) | 편집자 결정(14라운드, O-3 되물음의 해석, `08-design-a-to-z.md:531`·`reviews/round-14-values-check.md:108`), 편집자 결정(18라운드, 소유자 물음으로 올림, `reviews/round-18-agenda.md:163`), 소유자 답(`reviews/round-18-owner-answers.md:15` 12-5; 대체) |
| EVENT-026 | 루트 onChange — 최외곽 동기 진입당 1회, 마지막 파동 뒤 최종 emit, 디바운스 없음 | 현행 | 소유자 답(`reviews/round-4.md:116` D-10) |
| EVENT-027 | 진입의 정의 — 공개 쓰기 API, 진입이 아닌 것, 진입 깊이 카운터와 검증 요청 먼저 | 현행 | 편집자 결정(5라운드 도출 C-9, `reviews/round-5-derivations.md:24`), 편집자 결정(10라운드 5차 본문, `adr/0008-event-system.md:13`) |
| EVENT-028 | 검증 요청은 진입당 1회, 실행은 마이크로태스크에 모아 최신 커밋 번호 하나만 | 현행 | 소유자 답(`reviews/round-14-owner-answers.md:12` O-6) |
| EVENT-029 | 진입 깊이는 루트별 | 현행 | 편집자 결정(5라운드 도출 C-9, `reviews/round-5-derivations.md:24`), 편집자 결정(10라운드 5차 본문, `adr/0008-event-system.md:13`) |
| EVENT-030 | 열린 진입 안의 재생성 reset — 새 루트가 옛 루트의 진입을 이어받음 | 현행 | 16라운드 스웜 수렴(편집자 결정, `09-landing-and-test-strategy.md:79,90`) |
| EVENT-031 | emit 참조가 바뀌지 않은 쓰기는 onChange도 검증 요청도 내지 않는다 | 현행 | 편집자 결정(10라운드 5차 본문, `adr/0008-event-system.md:13`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-50) |
| EVENT-032 | reset의 검증 요청 예외 — emit 참조가 그대로여도 OnChange 비트면 한 번 | 현행 | 16라운드 스웜 수렴(편집자 결정, `09-landing-and-test-strategy.md:79,89`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-101) |
| EVENT-033 | onChange 안의 쓰기는 새 진입 | 현행 | 편집자 결정(5라운드 도출 C-9, `reviews/round-5-derivations.md:24`), 편집자 결정(10라운드 5차 본문, `adr/0008-event-system.md:13`) |
| EVENT-034 | onChange 중첩 상한 25 — 26번째는 적용·검증 요청하되 onChange를 건너뛰고 사슬 끝에서 throw | 현행 | 소유자 답(`reviews/round-17-owner-answers.md:9` R17-1), 편집자 결정(17라운드, ADR 0014 4판 채택) |
| EVENT-035 | 형제 진입을 합치는 것은 batch(fn)뿐이며 답은 배치 API의 공개와 문서 | 현행 | 편집자 결정(5라운드 도출 C-8, `reviews/round-5-derivations.md:23`) |
| EVENT-036 | React 이펙트의 쓰기는 새 진입이며 core가 아니라 문서화로 답한다 | 현행 | 편집자 결정(5라운드 도출 C-10, `reviews/round-5-derivations.md:25`) |
| EVENT-037 | RequestRemount는 공개 명령으로 남는다 | 현행 | 소유자 답(`reviews/round-4.md:115` D-9) |
| EVENT-038 | 명령 publish를 공개 API로 연다(C-11) — 소유자 확정 대기 | 대체됨(→ EVENT-063) | 편집자 결정(5라운드 도출 C-11, 소유자 확정 대기, `reviews/round-5-derivations.md:22`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-42) |
| EVENT-039 | 명령 표 — RequestRefresh가 하는 일, 버리는 것, 범위 | 현행 | 편집자 결정(5라운드 도출 C-11, `reviews/round-5-derivations.md:22`), 16라운드 스웜 수렴(편집자 결정, `09-landing-and-test-strategy.md:79,85`) |
| EVENT-040 | 명령 표 — RequestRemount가 하는 일, 버리는 것, 범위 | 현행 | 소유자 답(`reviews/round-4.md:115` D-9), 편집자 결정(5라운드 도출 C-11, `reviews/round-5-derivations.md:22`) |
| EVENT-041 | Refresh는 범위가 좁은 리마운트 — 명시 호출이 캐럿을 날리는 것은 귀결로 문서화 | 현행 | 편집자 결정(5라운드 도출 C-11, `reviews/round-5-derivations.md:22`) |
| EVENT-042 | core가 스스로 Refresh를 보내는 규칙 — 쓰기의 출처로 판단, 타이핑에는 보내지 않음 | 현행 | 편집자 결정(4라운드, `reviews/round-4.md:128` F7) |
| EVENT-043 | 진단 표면 — 한 칸·한 이벤트·한 속성, onChange에 싣지 않음, 리터럴 이름 | 현행 | 편집자 결정(06 도출 N4·4.9, `06-conclusions.md:360`; 10라운드 5차 본문 `adr/0008-event-system.md:13`) |
| EVENT-044 | 진단 표면 — onDiagnosticsChange와 onError, 제출 거부는 Form이 한다 | 현행 | 소유자 답(`reviews/round-17-owner-answers.md:9` R17-1), 17라운드 스웜 수렴(편집자 결정, `adr/0008-event-system.md:201`) |
| EVENT-045 | 배달 경로 — 정착을 거치지 않는 사건과 유효 스키마 변경 | 현행 | 소유자 답(`reviews/round-16-owner-answers.md:9` 3) |
| EVENT-046 | 배달 경로 — 검증 결과는 스탬프를 검사한 뒤 자기 파동으로 | 현행 | 소유자 답(`reviews/round-16-owner-answers.md:9` 3), 17라운드 스웜 수렴(편집자 결정, `09-landing-and-test-strategy.md:63`, 이 파동의 리스너 예외의 드러남) |
| EVENT-047 | 되돌림 가능성 — 중간, 소비자에게 보이는 변화 | 현행(기록) | 편집자 결정(10라운드 5차 본문, `adr/0008-event-system.md:13`) |
| EVENT-048 | 유효 스키마 변경 통지의 표면 | 대체됨(→ EVENT-064) | 편집자 결정(17라운드, 18라운드 안건으로 이관), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-52) |
| EVENT-049 | 상태 칸 변경의 배달 — ADR 0008이 적지 않은 것 | 분할됨(→ EVENT-066, EVENT-067) | 편집자 결정(10라운드 5차 본문의 미결, `adr/0008-event-system.md:203`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-82) |
| EVENT-050 | 실제 브라우저의 IME 확인 | 대체됨(→ EVENT-065) | 편집자 결정(17라운드, 18라운드 안건으로 이관), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-63) |
| EVENT-051 | UpdatePath — 배열 재인덱싱 시 경로 변경 통지 | 분할됨(→ EVENT-066, EVENT-068) | 편집자 결정(10라운드 5차 본문의 미결, `adr/0008-event-system.md:207`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-83) |
| EVENT-052 | globalState — OR 누적을 이번 개편에서 고칠지 | 대체됨(→ EVENT-062) | 편집자 결정(17라운드, 18라운드 안건으로 이관), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-41) |
| EVENT-053 | C-10의 문서 자리 — 어느 문서가 소유하는지 | 대체됨(→ EVENT-069) | 편집자 결정(10라운드 5차 본문의 미결, `adr/0008-event-system.md:209`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-84) |
| EVENT-054 | React 이펙트를 거친 진입 간 순환이 React 자체 한도에 막히는지 | 대체됨(→ EVENT-070) | 편집자 결정(06 도출 D-17의 남는 것, `06-conclusions.md:161`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-85; PR-7 게이트 조건부) |
| EVENT-055 | 대체됨: 예산 초과 시 개발 모드의 throw는 최외곽 진입 끝에서 | 대체됨(→ EVENT-021, ERROR-070, ERROR-071) | 소유자 답(`reviews/round-17-owner-answers.md:9` R17-1) |
| EVENT-056 | 대체됨: 루트 onChange는 파동마다 한 번, 디바운스는 Form 옵션(F22) | 대체됨(→ EVENT-026) | 소유자 답(`reviews/round-4.md:116` D-10) |
| EVENT-057 | 대체됨: 파동 상한은 틱당, 상한에서 개발 모드 throw·프로덕션은 무시(F15) | 대체됨(→ EVENT-008, ERROR-071, ERROR-142) | 편집자 결정(06 도출 D-17, `06-conclusions.md:158`; 10라운드 5차 본문 `adr/0008-event-system.md:13`), 소유자 답(`reviews/round-17-owner-answers.md:9` R17-1) |
| EVENT-058 | exceededBudget의 전이 값 이름은 'transition' — transitionDefaults·nodeCreationDefaults 이름 항목은 닫힘 | 현행 | 편집자 결정(17라운드, ADR 0014 4판 채택) |
| EVENT-059 | reset의 문서화 대상 셋 — 렌더 중 reset, 언마운트된 Form의 reset, 재대조 reset의 진입 | 현행 | 16라운드 스웜 수렴(편집자 결정, `09-landing-and-test-strategy.md:79,90`) |
| EVENT-060 | `UpdateValue` 통지에 출처 칸을 둔다 — 이름과 값 목록은 편집자 | 현행 | 소유자 답(`reviews/round-18-owner-answers.md:15` 12-5), 편집자 결정(18라운드, `reviews/round-18-owner-answers.md:15` 반영 칸; 이름과 값 목록), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-100) |
| EVENT-061 | `batch(fn)` 안의 updater는 부른 자리에서 실행되어 앞선 표시를 이어 받고(던지면 `fn`의 예외), 평범한 읽기는 직전 커밋을 돌려준다 | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-20) |
| EVENT-062 | `globalState`는 형상 안 노드에서 유도한다 — 키별 참 노드 수, 값은 `true`, 0이면 키가 빠짐, 0↔1을 넘을 때만 새 객체와 `UpdateGlobalState` | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-41) |
| EVENT-063 | 명령 넷은 공개 노드 메서드 — `FormHandle`은 넷 모두 대칭, 공개 `publish` 없음 | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-42) |
| EVENT-064 | 유효 스키마 변경 통지 `UpdateJsonSchema`(가칭) — 메모 참조가 마지막 통지와 다를 때, 생성 때는 없음, payload `{ previous, current }` 참조, 출처 칸 없음, 계산 상태 비트와 분리 | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-52) |
| EVENT-065 | IME 조합의 동기 통지 확인 — 게이트 PR-7(스토리북 브라우저, 사람 확인 목록) | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-63) |
| EVENT-066 | 배달 집합 규칙 2의 추가 항 — (이번 커밋에서 상호작용 상태가 바뀐 노드), (이번 커밋에서 경로가 바뀐 노드) | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-82·18C-83) |
| EVENT-067 | `setState`의 상태 칸 변경은 정착 밖 사건 — 최외곽 진입 끝에 한 번, 비트 `UpdateState`, 같은 노드는 합쳐 한 번, `onStateChange` 한 번 | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-82) |
| EVENT-068 | `UpdatePath` — payload `{ previous, current }`, 재인덱싱된 아이템의 자손 포함, 공개 이벤트 형 밖, 렌더 계층이 입력을 다시 그림 | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-83) |
| EVENT-069 | C-10의 사용 규칙은 README가 소유 — 이주 안내에는 README를 가리키는 한 줄, 작성은 PR-8 | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-84) |
| EVENT-070 | React 이펙트를 거친 진입 간 순환은 core 예산에 넣지 않는다 — 예방은 C-10 문서, 게이트 PR-7(React 18·19 실행) | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-85) |
| EVENT-071 | 로드가 아닌 쓰기(`setValue(V)` 포함)의 Refresh는 원본이 실제로 바뀐 노드에만(쓴 입력 제외) — "값이 같아도 낸다"는 로드의 새 수명만 | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-94) |
| EVENT-072 | `resetSubtree()`에 걸린 로드 규칙(로드 뒤 검증, `batch` 안의 즉시 정착, 한 로드에 한 번, 로드마다 다시 만듦)은 그 하위 트리에만 | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-101) |

## 항목

### EVENT-001 통지 전용 — 역할 셋, 유지하는 것과 바뀌는 것

- 결정:
  > 이벤트 시스템을 **통지 전용**으로 다시 정의한다. 역할은 셋이다(B1).
  >
  > 1. **상태 통지** — 작업 루프의 커밋 뒤에 1회 방출한다(ADR 0007). 구독자는 언제나 정착된 상태만 본다.
  > 2. **`revision(mask)` 원장** — 리스너 유무와 무관한 단조 카운터. `useSyncExternalStore` 스냅숏으로 쓰는 현재 방식(`hooks/useSchemaNodeTracker.ts:36-49`)은 유지한다.
  > 3. **명령 시그널** — `RequestFocus`/`RequestSelect`/`RequestRefresh`/`RequestRemount`처럼 상태가 아니라 표현 계층에 대한 요청인 것. 렌더러와 무관한 어휘로 core에 남는다(`open-questions.md` Q8 닫힘).
  >
  > 유지: `node.subscribe()`, 이벤트 타입 비트마스크, `revision`, 비제어 입력 계약(입력이 값을 다시 읽게 하는 것은 `RequestRefresh` 하나).
  >
  > 바뀜: 내부 상태 전이가 이벤트를 타지 않는다. 배치의 단위가 "통지"에서 "쓰기 묶음 → 정착 1회 → 통지 1파동"으로 올라간다. 동기 발행과 배치 발행의 혼용이 사라진다.
- 보충:
  > 소유자(맥락): "`EventCascade`를 쓴 이유는 `setValue`나 전체 값 변경을 배치 처리하기 위해서였는데 충분한 효과를 보지 못했다. 이벤트를 편하게 발행하는 정도의 장점이 있었고, 꼭 필요한 경우의 배치 이벤트와 동기성 이벤트를 혼용하고 있다." (`adr/0008-event-system.md:19`)
  > 소유자(맥락): "그러나 노드 간 pub-sub, event signaling, batch update는 node tree의 축이자 대규모 폼 고속 동작의 척추이므로 되도록 유지하고 싶다(G7)." (`adr/0008-event-system.md:20`)
  > "**G5 ↔ G7.** 이벤트가 내부 상태를 움직이지 않게 되는 것은 척추를 없애는 것이 아니다. 구독·시그널링·`revision`은 남고, 바뀌는 것은 "내부 로직은 이벤트를 구독하지 않는다" 하나다." (`00-goals.md:134`)
- 상태: 현행
- 출처: `adr/0008-event-system.md:28-36`(정본), `00-goals.md:117,134,151`
- 닫은 사람: 소유자 답(`00-goals.md:151` G7), 소유자 답(`00-goals.md:117` C3 세부 3), 편집자 결정(4라운드, `adr/0008-event-system.md:3`)
- 라운드: 4
- 까닭: `adr/0008-event-system.md:19-20`, `adr/0008-event-system.md:24`

### EVENT-002 통지의 시점 — 쓰기 하나는 동기로 정착·통지, 배열 연산은 동기

- 결정:
  > **규칙 하나: 쓰기 하나는 동기로 정착하고 동기로 통지한다. 배치는 그 끝에 한 번 그렇게 한다.** 마이크로태스크 배치는 없고 별도의 "즉시" 옵션도 없다. 배열 연산은 동기이며 Promise를 돌려주지 않는다(T-7).
- 보충: 없음
- 상태: 현행
- 출처: `adr/0008-event-system.md:40`(정본), `adr/0008-event-system.md:11`, `03-mental-model.md:170`, `08-design-a-to-z.md:394`
- 닫은 사람: 편집자 결정(4라운드, 실행 검증을 통과한 제안, `adr/0008-event-system.md:3`·`reviews/round-4.md:77`)
- 라운드: 4
- 까닭: `adr/0008-event-system.md:42-51`

### EVENT-003 포맷터의 캐럿 복구는 입력 컴포넌트의 몫, 수용 기준은 F14

- 결정:
  > 포맷터가 값을 다시 쓰는 경우의 캐럿 복구는 두 설계 모두 입력 컴포넌트의 몫이다(T-1의 레이아웃 이펙트 북키핑). 그래서 현재 수용 테스트(`controlled-interaction.render.test.tsx:340-368`)는 두 설계를 구별하지 못하며, 수용 기준을 F14로 바꿨다(중간 삽입, 이벤트 직후 DOM, IME 3단계).
- 보충: 없음
- 상태: 현행
- 출처: `adr/0008-event-system.md:53`(정본), `reviews/round-4.md:135`
- 닫은 사람: 편집자 결정(4라운드, `reviews/round-4.md:135` F14)
- 라운드: 4
- 까닭: `adr/0008-event-system.md:51`

### EVENT-004 루트 단일 디스패처 — 노드에 남는 것과 한 번의 순회

- 결정:
  > 노드에는 "이번 정착에서 켜진 이벤트 타입"의 비트마스크, 타입별 payload, `revision` 원장만 남고 스케줄링은 하지 않는다. 대량 쓰기로 노드 1,000개가 바뀌어도 순회는 하나이고 무한 루프 감지도 한 곳에서 한다.
- 보충:
  > "루트 단일 디스패처는 소유자 발의이며 D-9·D-10은 소유자 결정이다(2026-09-22, `reviews/round-4.md` §4)." (`adr/0008-event-system.md:3`)
  > "소유자의 지적: "루트로 옮긴다"만으로는 수렴·배치·전파 통제가 설명되지 않는다 — 수렴은 ADR 0007의 파생 단계, 배치는 `batch()`, 전파는 재계산 목록과 단일 순회로 답하고, 이벤트 시스템 전체를 4라운드 공격 대상에 올렸다(`HANDOFF.md` §3)." (`adr/0008-event-system.md:11`)
- 상태: 현행
- 출처: `adr/0008-event-system.md:59`(정본), `03-mental-model.md:110`, `08-design-a-to-z.md:248`, `reviews/round-1.md:81`
- 닫은 사람: 편집자 결정(1라운드 R17 명세 6항, `reviews/round-1.md:81`), 편집자 결정(4라운드, `reviews/round-4.md:169`)
- 라운드: 4
- 까닭: `adr/0008-event-system.md:22`, `reviews/round-1.md:81`

### EVENT-005 디스패처 규칙 1 — 순서

- 결정:
  > | # | 규칙 | 판정과 개정 |
  > | - | ---- | ----------- |
  > | 1 | **순서** — 계산 순회에서 얻는 문서 순서의 위 → 아래. 값 변화 없이 시그널만 가진 노드는 뒤에 publish 순서로 | 통과(V10). 현재의 루트 쓰기 순서를 뒤집으므로 소비자에게 보이는 변경 |
- 보충: 없음
- 상태: 현행
- 출처: `adr/0008-event-system.md:61-63`(정본), `03-mental-model.md:110`
- 닫은 사람: 편집자 결정(4라운드, `reviews/round-4.md:90` V10)
- 라운드: 4
- 까닭: `reviews/round-1.md:81`

### EVENT-006 디스패처 규칙 2 — 배달 집합

- 결정:
  > | # | 규칙 | 판정과 개정 |
  > | - | ---- | ----------- |
  > | 2 | **배달 집합** — (이번 커밋에서 `local`·`emit`·`diagnostics`가 바뀐 노드) ∪ (시그널 비트가 대기 중인 노드) ∪ (**활성 여부가 바뀐 노드**, 값이 같아도) ∪ (**유효 스키마가 바뀐 노드**, 값이 같아도) | F20. `cat` → `dog` 뒤 `meow`처럼 emit이 그대로인 비활성화를 자식 구독자가 모르는 구멍을 막는다. 유효 스키마 항은 5차에서 더했다(07 §4.0의 4.9, §4.27): 게이트를 가진 조각이 켜지거나 꺼지면 그 조각이 덧씌운 노드는 값이 같아도 제약이 바뀌므로 배달한다. 유효 스키마는 그 노드에 얹힌 켜진 조각의 집합(덧씌움 집합)으로 메모하며, 같은 집합이면 같은 참조를 돌려준다. 파동 중 고정 집합 내 노드로 온 시그널은 다음 파동 |
- 보충: 없음
- 상태: 현행
- 출처: `adr/0008-event-system.md:61-62,64`(정본), `03-mental-model.md:110`, `08-design-a-to-z.md:248`, `07-conclusions.md:96`
- 닫은 사람: 편집자 결정(4라운드, `reviews/round-4.md:141` F20), 편집자 결정(10라운드 5차 본문, `07-conclusions.md:96`·`adr/0008-event-system.md:13`)
- 라운드: 10
- 까닭: `adr/0008-event-system.md:64`
- 충돌:
  > `adr/0008-event-system.md:64`의 "(이번 커밋에서 `local`·`emit`·`diagnostics`가 바뀐 노드) ∪ (시그널 비트가 대기 중인 노드) ∪ (**활성 여부가 바뀐 노드**, 값이 같아도) ∪ (**유효 스키마가 바뀐 노드**, 값이 같아도)"는 18라운드 결정과 다르다: 배달 집합에 (이번 커밋에서 상호작용 상태가 바뀐 노드)와 (이번 커밋에서 경로가 바뀐 노드)가 더해진다(EVENT-066). 18라운드 결정이 이긴다(`reviews/round-18-closing.md:2198,2211`).

### EVENT-007 디스패처 규칙 3 — revision 원장은 커밋 시 배달 집합 전체를 한 번에 올림

- 결정:
  > | # | 규칙 | 판정과 개정 |
  > | - | ---- | ----------- |
  > | 3 | **원장** — `revision`은 **커밋 시 배달 집합 전체를 한 번에** 올린다 | F16. 이전 본문의 "리스너 직전에 올린다"를 뒤집는다. 노드마다 직전 bump는 리스너의 `flushSync`에서 커밋 2회·렌더 2,000회, 일괄은 커밋 1회·렌더 1,000회이고 stale은 둘 다 0이었다(V5) — 본문이 적었던 "미리 올리면 stale"은 재현되지 않았다 |
- 보충: 없음
- 상태: 현행
- 출처: `adr/0008-event-system.md:61-62,65`(정본), `reviews/round-4.md:137`
- 닫은 사람: 편집자 결정(4라운드, `reviews/round-4.md:137` F16·`reviews/round-4.md:85` V5)
- 라운드: 4
- 까닭: `reviews/round-4.md:85`

### EVENT-008 디스패처 규칙 4 — 파동, 리스너 되먹임의 판별, 되먹임 상한과 그 초기화

- 결정:
  > | # | 규칙 | 판정과 개정 |
  > | - | ---- | ----------- |
  > | 4 | **파동** — 고정된 집합을 순회한다. 리스너 안의 쓰기(**리스너 되먹임**)는 즉시 동기로 정착·커밋되고 그 통지는 현재 파동이 끝난 뒤 다음 파동이다. 같은 파동의 리스너가 같은 것을 본다는 보장은 **payload에 한정**한다 — `node.value`는 현재 커밋을 돌려준다 | 상한은 **최외곽 진입의 되먹임 사슬당 25**다(06 §4.6). 사슬은 최외곽 진입 하나(§5)의 통지에서 리스너 되먹임이 이어 낸 파동들이며, 세는 것은 되먹임이 낸 파동뿐이다. 상한에 닿으면 마지막 파동을 한 번 더 배달하되 **그 파동의 리스너 되먹임만 거부**하고 `diagnostics`에 `listenerFeedback` 예산 초과를 적는다(§8). **사용자 입력과 호출자 쓰기는 결코 거부하지 않는다**(ADR 0013 결정 1, P2). 거부하므로 통지되지 않은 쓰기가 없고 트리와 DOM이 어긋나지 않는다. 그 뒤의 진행은 §3의 "예산 초과"를 따른다. 2라운드 S10의 모순은 "보장은 payload에 한정"으로 닫힌다 |
  >
  > **리스너 되먹임의 판별.** 리스너 되먹임은 파동을 배달하는 동안 리스너 호출 안에서 일어난 쓰기다. 그 쓰기는 바깥 쓰기의 호출 스택 안에서 돌므로 진입 깊이가 2 이상이고(`spikes/work-loop/REPORT-v4c.txt` §1), 새 진입이 아니라 같은 최외곽 진입의 사슬에 속한다. 호출자가 리스너 밖에서 부른 쓰기는 새 진입이므로 이 상한에 걸리지 않는다.
  >
  > 상한은 **최외곽 진입이 끝날 때**(깊이 1 → 0) 초기화하며 **미루지 않는다.** 틱을 단위로 하면 측정상 리스너 없이 25번째, 권장 스토어 리스너를 붙이면 13번째 호출자 쓰기에서 상한에 닿아 호출자의 `setValue`가 조용히 버려지고, 틱은 타이밍이므로 G5에 어긋난다. 진입 사슬의 되먹임만 세면 같은 30회 쓰기가 내내 상한에 닿지 않는다(06 §4.6). 미루고 초기화하는 현재 방식(`EventCascadeManager.ts:110-116`)은 같은 입력을 틱마다 다시 돌리므로, 그대로 두면 현재의 결함을 재현한다(T-4).
- 보충:
  > 소유자(10라운드 A-4): "루프의 가능성을 제한하지는 않는다. 이때문에 순환된 값이 진동하거나 발산할 수 있으며, 이를 막기 위한 상한값이 있고, 그 상한값을 초과하면 적절한 error 를 표시한다. 이는 react 의 hook 과 동일한 설계를 갖는다." (`reviews/round-10-owner-answers.md:10`)
  > "소유자: "루프의 가능성을 제한하지는 않는다. … 그 상한값을 초과하면 적절한 error를 표시한다. 이는 react의 hook과 동일한 설계를 갖는다." 그리고 "구태여 막지 않을 뿐이지 루프를 만드는 걸 권하는 설계는 절대 아니다."" (`adr/0008-event-system.md:102`)
  > 소유자(2라운드, 상한에 걸렸을 때): ""상한 초과가 되면 쓰기가 막히나? 값은 들어가고 유효성 검증 오류가 나는 것 아닌가."" (`reviews/round-2.md:116`)
  > 편집자 결정(18C-14): "【추론】 함수 안의 쓰기: 다른 노드에 쓰는 정해진 길은 반환이다." (`reviews/round-18-closing.md:405`)
  > 편집자 결정(18C-14): "【추론】 함수 안에서 폼의 공개 쓰기 API(`setValue`·`push`·`pop`·`update`·`remove`·`clear`·`batch`, EVENT-027)를 부르면 리스너 되먹임 쓰기와 같게 다룬다." (`reviews/round-18-closing.md:406`)
  > 편집자 결정(18C-14): "【추론】 그 쓰기를 오류로 막지 않는다." (`reviews/round-18-closing.md:407`)
  > 편집자 결정(18C-14): "【추론】 바깥 쓰기가 호출 스택에 있으므로 새 진입이 아니라 안쪽 진입이다(EVENT-027)." (`reviews/round-18-closing.md:408`)
  > 편집자 결정(18C-14): "【추론】 그 쓰기는 지금 파동이 끝난 뒤에 돈다." (`reviews/round-18-closing.md:409`)
  > 편집자 결정(18C-14): "【추론】 리스너 되먹임과 같은 되먹임 예산(최외곽 진입의 되먹임 사슬당 25, EVENT-008)에 든다." (`reviews/round-18-closing.md:410`)
  > 편집자 결정(18C-14): "【추론】 넘으면 되먹임 초과와 같게 사슬 끝에서 던진다((가칭) `SCHEMA_FORM_ERROR.FEEDBACK_LIMIT_EXCEEDED`, `adr/0014-error-policy.md:271`)." (`reviews/round-18-closing.md:411`)
  > 편집자 결정(18C-14): "【추론】 정착 중에 사용자 코드가 쓰는 장치는 이것 하나다(G4)." (`reviews/round-18-closing.md:412`)
- 상태: 현행
- 출처: `adr/0008-event-system.md:61-62,66,72,74`(정본), `06-conclusions.md:154-161`, `07-conclusions.md:93`, `08-design-a-to-z.md:248`, `reviews/round-4.md:136`, `reviews/round-18-closing.md:405-412`
- 닫은 사람: 원리(`reviews/round-10-owner-answers.md:10` A-4, 상한을 두고 넘으면 오류로 알린다는 원칙), 편집자 결정(4라운드, `reviews/round-4.md:136` F15, 마지막 파동을 한 번 더 배달하고 되먹임만 거부), 편집자 결정(06 도출 D-17, `06-conclusions.md:158`; 10라운드 5차 본문 `adr/0008-event-system.md:13`·`07-conclusions.md:93`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-14)
- 라운드: 18
- 까닭: `06-conclusions.md:157-159`, `adr/0008-event-system.md:74`, `reviews/round-18-closing.md:416-423`
- 충돌:
  > `adr/0008-event-system.md:66`의 "`diagnostics`에 `listenerFeedback` 예산 초과를 적는다(§8)"는 되먹임 파동의 초과를 `diagnostics`에 남긴다. 17라운드 규칙과 다르다. 17라운드 규칙이 이긴다(`adr/0008-event-system.md:97`의 "되먹임 파동과 `onChange` 중첩의 초과는 `diagnostics`에 남기지 않는다(ADR 0014 4판의 코드 목록)", `adr/0008-event-system.md:178`, `adr/0014-error-policy.md:207`).
  > `adr/0008-event-system.md:193`의 "리스너 되먹임만 거부하고 신호"는 되먹임 초과의 신호를 남기던 5차 규칙이다. 17라운드 규칙이 이긴다(`adr/0014-error-policy.md:207`).
  > `06-conclusions.md:158`의 "거부 시 신호를 낸다"는 되먹임 초과의 신호를 남기던 06 도출 D-17의 규칙이다. 17라운드 규칙이 이긴다(`adr/0014-error-policy.md:207`).

### EVENT-009 디스패처 규칙 5 — 분리된 노드

- 결정:
  > | # | 규칙 | 판정과 개정 |
  > | - | ---- | ----------- |
  > | 5 | **분리된 노드** — 배달 전에 트리에서 떨어진 노드는 건너뛰고 대기 비트를 지운다 | 통과(V10) |
- 보충: 없음
- 상태: 현행
- 출처: `adr/0008-event-system.md:61-62,67`(정본)
- 닫은 사람: 편집자 결정(4라운드, `reviews/round-4.md:90` V10)
- 라운드: 4
- 까닭: `reviews/round-1.md:81`

### EVENT-010 디스패처 규칙 6 — 리스너 격리, 모은 예외는 사슬 끝에서, 기록은 onError로

- 결정:
  > | # | 규칙 | 판정과 개정 |
  > | - | ---- | ----------- |
  > | 6 | **격리** — 리스너 호출을 하나씩 격리한다. 배달은 계속하고, 모은 예외는 배달을 끝낸 뒤 사슬 끝에서 던진다(하나면 원래 값 그대로, 둘 이상이면 `SchemaFormError` 하나의 `details.errors`에 발생 순서대로 담는다, 모든 환경). 기록마다 Form 속성 `onError`에 보낸다(가칭 `onListenerError`는 `onError`에 흡수되었다, ADR 0014 4판) | F21. `subscribe`는 공개 API이므로 소비자 코드 한 줄이 폼 전체를 멈출 수 있다 |
- 보충:
  > 소유자(17라운드 통보 4의 셋째 답): "4번은 이야기를 듣고보니, 모든 form 내부 error를 정리해서 출력할 수만 있다면, (warning / error 모두) onError 핸들러를 넣어도 괜찮을 것 같기도 해. 오히려, validate error 가 걸러진 에러 로깅용 전용 채널로 쓸 수 있겠어. 이거 에이전트들로 수렴을 시켜봐. 어떤게 나을지" (`reviews/round-17-owner-answers.md:15`)
  > "이 error 처리 기법에 대해서 확장 조사를 한번 해보세요. 질문 대부분이, 오류가 나도 form 은 동작시키고 console 을 낼까요, 아니면 그냥 터트릴까요 로 귀결되네요. 하나씩 읽고 답할 가치가 없습니다. 베스트케이스와 논리적 완결성을 지닌 방법을 찾으세요" (`reviews/round-14-owner-answers.md:11`, O-5 리스너 예외의 프로덕션 출력)
- 상태: 현행
- 출처: `adr/0008-event-system.md:61-62,68`(정본), `adr/0008-event-system.md:7,201`, `reviews/round-4.md:142`
- 닫은 사람: 편집자 결정(4라운드, `reviews/round-4.md:142` F21·`reviews/round-4.md:90` V10), 편집자 결정(14라운드 O-5 위임, `reviews/round-14-owner-answers.md:11`), 17라운드 스웜 수렴(편집자 결정, `adr/0008-event-system.md:201`)
- 라운드: 17
- 까닭: `adr/0008-event-system.md:68`

### EVENT-011 리스너 목록은 파동 시작 시점에 고정

- 결정:
  > **리스너 목록은 파동 시작 시점에 고정한다**(F17). 파동 중 구독한 리스너는 다음 파동부터 받고 놓친 것은 `revision`으로 따라잡으며(T-6), 파동 중 해지된 리스너는 부르지 않는다(현재 코드와 같다). 이것으로 소비자의 `flushSync`가 가상화 reveal 커밋을 파동 안으로 끌어들일 때 안쪽 컨트롤이 명령을 2회 받던 문제가 사라진다(V6).
- 보충: 없음
- 상태: 현행
- 출처: `adr/0008-event-system.md:70`(정본), `reviews/round-4.md:138`
- 닫은 사람: 편집자 결정(4라운드, `reviews/round-4.md:138` F17·`reviews/round-4.md:86` V6)
- 라운드: 4
- 까닭: `reviews/round-4.md:86`

### EVENT-012 상태 칸의 쓰기는 원본 쓰기가 아니다

- 결정:
  > **상태 칸의 쓰기는 원본 쓰기가 아니다**(R15, ADR 0007). `setState`형 쓰기(`dirty`·`touched`)와 명령 시그널은 원본을 바꾸지 않으므로 정착의 입력도, §5의 진입도, 예약 층의 자동 쓰기(채움·`controls.derived`·`controls.injectTo`·`controls.unsetValue`·나감의 비움)도 아니다.
- 보충: 없음
- 상태: 현행
- 출처: `adr/0008-event-system.md:76#1-2`(정본), `reviews/round-1.md:79,164`
- 닫은 사람: 편집자 결정(1라운드 R15, `reviews/round-1.md:79`), 편집자 결정(10라운드 5차 본문, `adr/0008-event-system.md:13`)
- 라운드: 10(예약 층 이름은 15라운드 표기)
- 까닭: `adr/0008-event-system.md:76`

### EVENT-013 batch(fn) — 쓰기를 표시하고 fn 끝에서 정착 한 번·파동 한 번

- 결정:
  > `batch(fn)`은 fn 안의 쓰기를 표시만 하고, fn이 끝날 때 정착 한 번·파동 한 번을 낸다.
- 보충:
  > 편집자 결정(18C-20): "【추론】 updater의 `prev`는 직전 커밋에, 이 배치에서 앞서 표시된 쓰기 가운데 그 노드의 서브트리에 닿은 것을 순서대로 얹은 값이다." (`reviews/round-18-closing.md:612`)
  > 편집자 결정(18C-20): "【추론】 `fn` 안의 평범한 읽기(`value`, `outputValue`, `inactiveValues`, `FormHandle.getValue()`)는 여전히 직전 커밋을 돌려준다." (`reviews/round-18-closing.md:623`)
- 상태: 현행
- 출처: `adr/0008-event-system.md:80#1`(정본), `adr/0008-event-system.md:36`, `reviews/round-18-closing.md:612,623`
- 닫은 사람: 편집자 결정(4라운드, 실행 검증을 통과한 제안, `adr/0008-event-system.md:3`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-20)
- 라운드: 18
- 까닭: `adr/0008-event-system.md:36`, `reviews/round-18-closing.md:642-648`

### EVENT-014 중첩 batch는 가장 바깥이 이긴다

- 결정:
  > 중첩 `batch`는 가장 바깥이 이긴다.
- 보충: 없음
- 상태: 현행
- 출처: `adr/0008-event-system.md:80#2`(정본)
- 닫은 사람: 편집자 결정(4라운드, 실행 검증을 통과한 제안, `adr/0008-event-system.md:3`)
- 라운드: 4
- 까닭: `adr/0008-event-system.md:80`

### EVENT-015 fn 안의 reset — 곧바로 정착하고 그 커밋은 fn 끝의 파동에 합류

- 결정:
  > `fn` 안의 `reset`은 경로와 무관하게 그 로드를 곧바로 정착한다(로드는 새 수명이라 앞서 표시된 쓰기를 덮고, 재생성 경로에서는 새 루트를 세우는 정착이다). `fn`의 나머지 쓰기 묶음은 그대로 끝에서 정착 한 번이며, `reset`의 커밋은 따로 파동을 내지 않고 `fn` 끝의 파동 한 번에 합류하며(두 커밋에서 바뀐 노드의 payload는 §4의 체인을 따른다. 리스너 안의 `reset`은 §2 규칙 4대로 다음 파동에 든다), 검증 요청과 `onChange`는 바깥 최외곽 진입의 끝에서 낸다(§5의 예외, 09 §2.6의 열째, 16라운드 스웜 수렴(편집자 결정)).
- 보충:
  > "`batch(fn)`·`onChange`·리스너 안의 reset은 경로와 무관하게 그 로드를 호출 안에서 곧바로 정착한다(로드는 새 수명이라 앞서 표시된 쓰기를 덮는다)" (`09-landing-and-test-strategy.md:90`)
  > 편집자 결정(18C-101): "【추론】 `batch` 안의 로드를 곧바로 정착하는 규칙(EVENT-015)은 `resetSubtree()`에는 그 하위 트리에만 적용한다." (`reviews/round-18-closing.md:2849`)
- 상태: 현행
- 출처: `adr/0008-event-system.md:80#3-5`(정본), `adr/0008-event-system.md:8`, `09-landing-and-test-strategy.md:90`, `reviews/round-18-closing.md:2849`
- 닫은 사람: 16라운드 스웜 수렴(편집자 결정, `09-landing-and-test-strategy.md:79,90`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-101)
- 라운드: 18
- 까닭: `09-landing-and-test-strategy.md:90`, `reviews/round-18-closing.md:2853-2855`

### EVENT-016 리스너 안의 batch는 자기 배치이며 리스너 되먹임으로 센다

- 결정:
  > - 리스너 안의 `batch`는 바깥 배치의 표시 구간이 이미 끝난 뒤이므로 **자기 배치**다 — 자기 정착 한 번과 파동 한 번을 낸다. 진입으로는 새 진입이 아니다. 리스너 안이므로 진입 깊이는 2 이상이고, 그 쓰기는 §2 규칙 4의 리스너 되먹임으로 세어진다.
- 보충: 없음
- 상태: 현행
- 출처: `adr/0008-event-system.md:82`(정본), `reviews/round-4.md:139`
- 닫은 사람: 편집자 결정(4라운드, `reviews/round-4.md:139` F18), 편집자 결정(06 도출 D-17, 10라운드 5차 본문 `adr/0008-event-system.md:13`)
- 라운드: 10
- 까닭: `adr/0008-event-system.md:72`

### EVENT-017 batch의 fn이 던질 때 — 표시된 쓰기는 정착·통지, 예외는 사슬 머리 끝에서

- 결정:
  > `batch`의 fn이 throw하면 표시된 쓰기는 정착·통지되고, 그 예외는 모아 두었다가 사슬 머리의 끝에서 던진다(안쪽 `batch`는 정상 반환한다, ADR 0014 4판 §2).
- 보충: 없음
- 상태: 현행
- 출처: `adr/0008-event-system.md:83#1`(정본), `adr/0014-error-policy.md:49`
- 닫은 사람: 편집자 결정(14라운드 O-5 위임, `reviews/round-14-owner-answers.md:11`), 편집자 결정(17라운드, ADR 0014 4판 채택)
- 라운드: 17
- 까닭: `adr/0014-error-policy.md:49`

### EVENT-018 렌더 중 쓰기는 소비자 오류이며 core는 구별하지 않음

- 결정:
  > 렌더 중 쓰기는 소비자 오류이며 core는 구별하지 않는다.
- 보충: 없음
- 상태: 현행
- 출처: `adr/0008-event-system.md:83#2`(정본), `reviews/round-4.md:139`
- 닫은 사람: 편집자 결정(4라운드, `reviews/round-4.md:139` F18)
- 라운드: 4
- 까닭: `reviews/round-4.md:139`

### EVENT-019 배치는 정착 횟수를 바꾸므로 값이 순차 호출과 다를 수 있다

- 결정:
  > **배치는 정착 횟수를 바꾸므로 값이 순차 호출과 다를 수 있다**(06 §4.3, 07 §4.0의 4.3). 정착이 출발할 때 예약 층 규칙의 에지 기준점은 직전 커밋이고, 채움은 노드가 생길 때 한 번이다. 그래서 순차 호출에서 첫 정착이 커밋한 값은 뒤 정착이 덮지 않지만, `batch`로 묶으면 정착이 한 번이라 중간 상태가 커밋되지 않는다. 반례 E2: 분기 A는 `x`에 `default` `'A'`, 분기 B는 `'B'`일 때, `kind`를 `a`로 쓴 뒤 `b`로 쓰면 순차는 `x = 'A'`, 같은 두 쓰기를 `batch`로 묶으면 `x = 'B'`다(노드 단위 채움에서도 같다, 실행). 채움과 `controls.injectTo`의 결과가 이렇게 갈리는 것은 결함이 아니라 축의 귀결이며, `batch`의 문서 주석에 "배치는 정착 횟수를 바꾸므로 채움과 `controls.injectTo`의 결과가 순차 호출과 다를 수 있다"를 적는다. 같게 만드는 길은 셋(배치 안에서도 쓰기마다 정착, 원본마다 출처 기록, 통지된 값의 철회)이고 모두 G7·P3·P2와 부딪친다.
- 보충: 없음
- 상태: 현행
- 출처: `adr/0008-event-system.md:85`(정본), `adr/0008-event-system.md:130`, `06-conclusions.md:130-137`, `07-conclusions.md:91`
- 닫은 사람: 편집자 결정(06 도출 D-13, `06-conclusions.md:134`; 10라운드 5차 본문 `adr/0008-event-system.md:13`·`07-conclusions.md:91`)
- 라운드: 10
- 까닭: `06-conclusions.md:135`

### EVENT-020 예산 다섯과 각 예산이 세는 것

- 결정:
  > **예산은 다섯이며 서로 다른 것을 센다**(`03-mental-model.md` §4, 06 N4). 이름은 §8의 `exceededBudget` 값이며, 17라운드에 정착의 세 예산만 남겼다(ADR 0014 4판 §5).
  >
  > | 예산 | 세는 것 | 상한 | `exceededBudget` |
  > | ---- | ------- | ---- | ---------------- |
  > | 호스트 바퀴 | 조각 집합이 안 바뀔 때까지 게이트를 다시 평가하는 횟수 | 게이트 가진 조각 수 + 노드 게이트 수 + 1 | `hostWheel` |
  > | 파생 라운드 | `controls.derived`·`controls.injectTo`·`controls.unsetValue`의 적용 라운드 | 25 | `derive` |
  > | 전이 라운드 | 생긴 노드에 채움을 넣고, 나감 정책이 참으로 정해진 나간 노드를 비우고 다시 도는 라운드 | ADR 0007이 소유한다 | `transition` |
  > | 리스너 되먹임 파동 | 최외곽 진입의 사슬에서 되먹임이 낸 파동(§2 규칙 4) | 25 | 없음(`diagnostics`에 남기지 않는다) |
  > | `onChange` 중첩 | `onChange` 안의 쓰기가 연 새 진입의 중첩(§5) | 25 | 없음(`diagnostics`에 남기지 않는다) |
- 보충: 없음
- 상태: 현행
- 출처: `adr/0008-event-system.md:87-95`(정본), `08-design-a-to-z.md:248`
- 닫은 사람: 편집자 결정(06 N4, 10라운드 5차 본문 `adr/0008-event-system.md:13`), 편집자 결정(17라운드, ADR 0014 4판 채택)
- 라운드: 17
- 까닭: `adr/0008-event-system.md:87`
- 충돌:
  > `adr/0008-event-system.md:87`의 "17라운드에 정착의 세 예산만 남겼다"는 18라운드 결정과 다르다: 재귀 펼침의 멈춤이 `exceededBudget` 값 (가칭) `'recursion'`을 더한다(ERROR-190). 18라운드 결정이 이긴다(`reviews/round-18-closing.md:28`).

### EVENT-021 예산 초과 시의 진행 — 커밋 → 검증 요청 → onChange, 예외는 onChange 중첩 하나

- 결정:
  > 어느 예산을 넘겨도 그 진입은 개발 모드와 프로덕션 모두 **커밋 → 검증 요청 → `onChange`** 순서로 진행한다. 예외는 `onChange` 중첩 예산 하나로, 넘긴 그 `onChange`만 부르지 않는다(§5, 원장 §4). 정착의 예산(호스트 바퀴·파생·전이)을 넘기면 그 정착의 자동 쓰기를 모두 뺀 원본 B를 커밋하고(ADR 0007), 리스너 되먹임 예산을 넘기면 거부된 되먹임 없이 커밋이 이어진다.
- 보충: 없음
- 상태: 현행
- 출처: `adr/0008-event-system.md:97#2-4`(정본), `06-conclusions.md:147-152`, `07-conclusions.md:92`
- 닫은 사람: 편집자 결정(06 도출 D-16·D-31, `06-conclusions.md:150`; 10라운드 5차 본문 `adr/0008-event-system.md:13`·`07-conclusions.md:92`)
- 라운드: 10
- 까닭: `06-conclusions.md:151`

### EVENT-022 예산 초과의 throw는 그 진입의 onChange와 검증 요청을 건너뛰게 하지 않는다

- 결정:
  > throw가 그 진입의 `onChange`와 검증 요청을 건너뛰게 하지 않는다 — D-10이 없앤 것이 바로 개발 모드와 프로덕션의 관측 차이였다(06 §4.5, 6라운드 검증 #11의 처방은 기각).
- 보충:
  > 소유자(4라운드 D-10): "**(c) 한 수정에 정확히 한 번.**" (`reviews/round-4.md:116`)
- 상태: 현행
- 출처: `adr/0008-event-system.md:99#3`(정본), `06-conclusions.md:150-151`, `07-conclusions.md:92`
- 닫은 사람: 편집자 결정(06 도출 D-16, `06-conclusions.md:150-151`; 10라운드 5차 본문 `adr/0008-event-system.md:13`)
- 라운드: 10
- 까닭: `06-conclusions.md:151`

### EVENT-023 UpdateValue의 payload — 커밋 시점의 {previous, current}, 호스트는 local과 emit을 모두 실음

- 결정:
  > `UpdateValue`의 payload는 커밋 시점의 `{previous, current}`이며 호스트는 `local`과 `emit`을 둘 다 싣는다.
- 보충: 없음
- 상태: 현행
- 출처: `adr/0008-event-system.md:106#1`(정본)
- 닫은 사람: 편집자 결정(4라운드, `adr/0008-event-system.md:12`)
- 라운드: 4
- 까닭: `reviews/round-4.md:140`

### EVENT-024 previous는 마지막으로 통지한 값, 커밋 번호, payload는 불변

- 결정:
  > - `previous`는 **그 노드에 마지막으로 통지한 값**이다. 파동 안의 중간 커밋은 payload로 관측되지 않으므로 `{previous, current}`가 체인을 이룬다(F19).
  > - 커밋에는 `revision`과 별개의 단조 **커밋 번호**가 있고 검증 스탬프는 커밋 번호를 쓴다 — 같은 `revision`으로 찍힌 서로 다른 커밋을 비동기 검증이 식별하지 못하던 반례(V13)의 처방이다(F28).
  > - payload는 **불변**이다. 개발 모드에서 `Object.freeze`하며, 리스너의 변조가 다음 리스너에 보이지 않는다(F28).
- 보충: 없음
- 상태: 현행
- 출처: `adr/0008-event-system.md:108-110`(정본), `reviews/round-4.md:140,149`
- 닫은 사람: 편집자 결정(4라운드, `reviews/round-4.md:140` F19·`reviews/round-4.md:149` F28)
- 라운드: 4
- 까닭: `adr/0008-event-system.md:109`

### EVENT-025 UpdateValue payload에 출처 필드를 더하지 않는다

- 결정:
  > O-3(출처 필드는 더하지 않음)
- 보충:
  > 소유자(14라운드 O-3): "더해도 되긴 하는데, 어차피 이벤트 컨텍스트 데이터니까, update 의 오리진을 구분할 니즈가 있을까요?" (`reviews/round-14-owner-answers.md:9`)
  > "O-3은 출처 필드를 더하지 않음" (`reviews/round-14-values-check.md:108`)
  > 열린 부분(결정 전부): "`UpdateValue` 통지에 출처(`source`) 칸을 더하지 않는 것으로 확정하는가." (`reviews/round-18-agenda.md:163`)
  > 소유자(12-5 답): "source 를 저장하는건 문제 없습니다. 다만, 사용자가 이걸 쓸 일이 있을지는 모르겠군요. 오히려 dirved 가 발화된 경우, input에 다른 표시를 하거나 하는 등에는 쓸 수 있겠습니다만. 아무튼 이 통지에 옵션을 추가하는건 문제 없습니다" (`reviews/round-18-owner-answers.md:15`)
- 상태: 대체됨(→ EVENT-060)
- 출처: `08-design-a-to-z.md:531`(정본), `08-design-a-to-z.md:513`, `reviews/round-14-values-check.md:88,108`, `reviews/round-18-owner-answers.md:15`
- 닫은 사람: 편집자 결정(14라운드, O-3 되물음의 해석, `08-design-a-to-z.md:531`·`reviews/round-14-values-check.md:108`), 편집자 결정(18라운드, 소유자 물음으로 올림, `reviews/round-18-agenda.md:163`), 소유자 답(`reviews/round-18-owner-answers.md:15` 12-5; 대체)
- 라운드: 18
- 까닭: `reviews/round-14-owner-answers.md:9`

### EVENT-026 루트 onChange — 최외곽 동기 진입당 1회, 마지막 파동 뒤 최종 emit, 디바운스 없음

- 결정:
  > 소유자 결정(2026-09-22, `reviews/round-4.md` §4): 디바운스의 목적은 파동이 여러 번 돌아도 `onChange`가 한 번만 불리고 비동기 검증기가 한 번만 요청되게 하는 것이었으며, 그 때문에 dev React와 prod React의 라이프사이클이 어긋나는 문제가 있었다. 새 설계의 `onChange`는 **최외곽 동기 진입당 1회**, 그 진입의 마지막 파동 뒤에 최종 emit으로 부른다. 디바운스는 없다. 현재의 `afterMicrotask`(이름과 달리 매크로태스크 디바운스, T-9)는 사라지고 `useEffect`와의 경합도 사라진다. F31이 F22를 대체한다.
- 보충:
  > "소유자: 디바운스의 목적은 마이크로태스크 파동이 여러 번 돌아도 `onChange`가 한 번만 불리고 비동기 검증기가 안전하게 한 번만 요청되게 하는 것이었으며, 그 때문에 dev React와 prod React의 라이프사이클이 어긋나는 문제(마이크로태스크와 `useEffect`의 경합)가 있었다." (`reviews/round-4.md:116`)
- 상태: 현행
- 출처: `adr/0008-event-system.md:114`(정본), `open-questions.md:96`, `reviews/round-4.md:116,153`, `08-design-a-to-z.md:248`
- 닫은 사람: 소유자 답(`reviews/round-4.md:116` D-10)
- 라운드: 4
- 까닭: `reviews/round-4.md:116`

### EVENT-027 진입의 정의 — 공개 쓰기 API, 진입이 아닌 것, 진입 깊이 카운터와 검증 요청 먼저

- 결정:
  > **진입의 정의**(`spikes/work-loop/REPORT-v4c.txt` §1): 같은 루트의 다른 공개 쓰기 API가 호출 스택에 없는 상태에서 이루어진 한 번의 공개 쓰기 호출. 공개 쓰기 API는 `setValue`·`push`·`pop`·`update`·`remove`·`clear`·`batch`이고(06 N6, 07 §6.2), `reset`·`resetSubtree`·마운트는 그것을 거쳐 진입이 된다. 프로토타입 목록의 `select`(분기 선택)는 폼이 분기를 고르지 않으므로 사라졌고(07 §6.2 N2·N6), `write`는 입력의 `onChange`가 부르는 `setValue`에 흡수되며, `removeKey`는 `Merge`로 키에 `undefined`를 쓰는 것으로 대신한다(`03-mental-model.md` §3). 읽기·`subscribe`·상태 칸 쓰기(§2의 R15)는 진입이 아니다. 구현은 루트의 **진입 깊이 카운터**이며, 깊이가 1 → 0이 될 때 검증을 먼저 요청하고 그다음 `onChange`를 부른다(순서가 반대면 `onChange` 안의 쓰기가 만든 새 스탬프가 옛것에 밀린다).
- 보충: 없음
- 상태: 현행
- 출처: `adr/0008-event-system.md:116#1-4`(정본), `reviews/round-5-derivations.md:24`
- 닫은 사람: 편집자 결정(5라운드 도출 C-9, `reviews/round-5-derivations.md:24`), 편집자 결정(10라운드 5차 본문, `adr/0008-event-system.md:13`)
- 라운드: 10
- 까닭: `reviews/round-5-derivations.md:24`

### EVENT-028 검증 요청은 진입당 1회, 실행은 마이크로태스크에 모아 최신 커밋 번호 하나만

- 결정:
  > 검증 요청은 최외곽 진입당 1회이나 실행은 마이크로태스크에 모아 최신 커밋 번호 하나만 돌린다(14라운드 답 O-6. 늦은 결과를 버리는 스탬프 규칙과 같은 방향).
- 보충:
  > 소유자(14라운드 O-6): "가 확정" (`reviews/round-14-owner-answers.md:12`)
  > "(가) 요청은 진입당 1회로 두되 **실행은 마이크로태스크에 모아 최신 커밋 번호 하나만** 돌린다(늦은 결과를 버리는 스탬프 규칙과 같은 방향). (나) 진입마다 실행한다." (`reviews/round-14-owner-review.md:39`)
- 상태: 현행
- 출처: `adr/0008-event-system.md:116#5`(정본), `adr/0008-event-system.md:124,136`
- 닫은 사람: 소유자 답(`reviews/round-14-owner-answers.md:12` O-6)
- 라운드: 14
- 까닭: `reviews/round-14-owner-review.md:40`

### EVENT-029 진입 깊이는 루트별

- 결정:
  > 진입 깊이는 루트별이므로 한 핸들러에서 쓴 두 폼은 두 진입이다.
- 보충: 없음
- 상태: 현행
- 출처: `adr/0008-event-system.md:116#6`(정본)
- 닫은 사람: 편집자 결정(5라운드 도출 C-9, `reviews/round-5-derivations.md:24`), 편집자 결정(10라운드 5차 본문, `adr/0008-event-system.md:13`)
- 라운드: 10
- 까닭: `adr/0008-event-system.md:116`

### EVENT-030 열린 진입 안의 재생성 reset — 새 루트가 옛 루트의 진입을 이어받음

- 결정:
  > 예외 하나: 열린 진입 안에서 재생성 경로의 `reset`이 만든 새 루트는 옛 루트의 진입 깊이와 배치의 표시 구간, 그 사슬의 되먹임 파동 수·`onChange` 중첩 수·모아 둔 오류를 이어받고, 옛 루트의 최외곽 진입이 끝날 때 새 루트의 검증 요청과 `onChange`를 낸다. 옛 루트는 폐기되므로 표시된 쓰기를 정착하지 않고 파동도 검증 요청도 `onChange`도 내지 않으며, 새 루트의 커밋은 같은 자리의 쓰기가 받을 파동(§3, §2 규칙 4)에 합류한다(09 §2.6의 열째, 16라운드 스웜 수렴(편집자 결정)).
- 보충: 없음
- 상태: 현행
- 출처: `adr/0008-event-system.md:116#7-8`(정본), `adr/0008-event-system.md:8`, `09-landing-and-test-strategy.md:90`
- 닫은 사람: 16라운드 스웜 수렴(편집자 결정, `09-landing-and-test-strategy.md:79,90`)
- 라운드: 16
- 까닭: `09-landing-and-test-strategy.md:90`

### EVENT-031 emit 참조가 바뀌지 않은 쓰기는 onChange도 검증 요청도 내지 않는다

- 결정:
  > emit 참조가 바뀌지 않은 쓰기는 `onChange`도 검증 요청도 내지 않는다.
- 보충:
  > 편집자 결정(18C-50): "【추론】 새로 만든 것이 직전 커밋의 것과 키 목록(순서 포함)도 같고 키마다의 자식 `emit` 참조도 같으면 직전 참조를 둔다(얕은 비교, 재계산 목록의 호스트만)." (`reviews/round-18-closing.md:1386`)
  > 편집자 결정(18C-50): "【추론】 그래서 EVENT-031·EVENT-006의 "emit 참조가 바뀜"은 "방출 값이 바뀜"과 같아진다." (`reviews/round-18-closing.md:1387`)
  > 편집자 결정(18C-50): "【추론】 `onChange`·배달·검증 요청은 참조 비교만으로 값 비교를 따른다." (`reviews/round-18-closing.md:1388`)
- 상태: 현행
- 출처: `adr/0008-event-system.md:116#9`(정본), `adr/0008-event-system.md:128,157`, `reviews/round-18-closing.md:1386-1388`
- 닫은 사람: 편집자 결정(10라운드 5차 본문, `adr/0008-event-system.md:13`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-50)
- 라운드: 18
- 까닭: `adr/0008-event-system.md:157`, `reviews/round-18-closing.md:1405-1411`

### EVENT-032 reset의 검증 요청 예외 — emit 참조가 그대로여도 OnChange 비트면 한 번

- 결정:
  > 예외 하나: `reset`은 검증 결과를 비운 뒤 로드하므로 `ValidationMode`의 `OnChange` 비트가 켜져 있으면 emit 참조가 그대로여도 검증을 한 번 요청한다. `onChange`는 이 예외에 들지 않는다(09 §2.6의 아홉째, 16라운드 스웜 수렴(편집자 결정)).
- 보충:
  > 편집자 결정(18C-101): "【추론】 로드 뒤 `OnChange` 비트면 한 번 하는 검증(LANDING-041, ERROR-040, EVENT-032)은 `resetSubtree()`에는 그 하위 트리에만 적용한다." (`reviews/round-18-closing.md:2848`)
- 상태: 현행
- 출처: `adr/0008-event-system.md:116#10-11`(정본), `adr/0008-event-system.md:8`, `09-landing-and-test-strategy.md:89`, `reviews/round-18-closing.md:2848`
- 닫은 사람: 16라운드 스웜 수렴(편집자 결정, `09-landing-and-test-strategy.md:79,89`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-101)
- 라운드: 18
- 까닭: `09-landing-and-test-strategy.md:89`, `reviews/round-18-closing.md:2853-2855`

### EVENT-033 onChange 안의 쓰기는 새 진입

- 결정:
  > `onChange` 안의 쓰기는 깊이 0에서 시작하므로 **새 진입**이다.
- 보충: 없음
- 상태: 현행
- 출처: `adr/0008-event-system.md:118#1`(정본)
- 닫은 사람: 편집자 결정(5라운드 도출 C-9, `reviews/round-5-derivations.md:24`), 편집자 결정(10라운드 5차 본문, `adr/0008-event-system.md:13`)
- 라운드: 10
- 까닭: `adr/0008-event-system.md:116`

### EVENT-034 onChange 중첩 상한 25 — 26번째는 적용·검증 요청하되 onChange를 건너뛰고 사슬 끝에서 throw

- 결정:
  > 중첩 상한은 25이며, 26번째는 쓰기를 적용하고 검증도 요청하되 `onChange`를 건너뛰고 모든 환경에서 사슬 끝에서 throw한다(17라운드 소유자 답 R17-1 나).
- 보충: 없음
- 상태: 현행
- 출처: `adr/0008-event-system.md:118#2`(정본), `adr/0008-event-system.md:118`, `adr/0014-error-policy.md:53`
- 닫은 사람: 소유자 답(`reviews/round-17-owner-answers.md:9` R17-1), 편집자 결정(17라운드, ADR 0014 4판 채택)
- 라운드: 17
- 까닭: `adr/0008-event-system.md:118`

### EVENT-035 형제 진입을 합치는 것은 batch(fn)뿐이며 답은 배치 API의 공개와 문서

- 결정:
  > **C-8은 D-10의 정의 그대로다** — 형제 진입을 합치는 것은 `batch(fn)`뿐이며, 답은 배치 API의 공개와 문서다.
- 보충: 없음
- 상태: 현행
- 출처: `adr/0008-event-system.md:130#2`(정본), `reviews/round-5-derivations.md:23`
- 닫은 사람: 편집자 결정(5라운드 도출 C-8, `reviews/round-5-derivations.md:23`)
- 라운드: 5
- 까닭: `reviews/round-5-derivations.md:23`

### EVENT-036 React 이펙트의 쓰기는 새 진입이며 core가 아니라 문서화로 답한다

- 결정:
  > `spikes/events/entry.spike.test.tsx`(React 19 + jsdom, 7/7 통과)가 확정한 사실이다. 컴포넌트가 이펙트에서 파생 값을 쓰면 키 입력 하나가 **진입 2·`onChange` 2·검증 2·React 커밋 2**를 낸다. 레이아웃 이펙트든 패시브 이펙트든 같다 — React 19는 이산 이벤트 렌더의 패시브 이펙트를 커밋 끝에서 동기로 flush한다. 이펙트가 돌 때 진입 깊이는 이미 0이므로, **어떤 스택 기반 진입 정의로도 합칠 수 없다.**
  >
  > core가 풀 문제가 아니라 **문서화 대상**이다. 파생 값은 React 이펙트가 아니라 스키마 예약 층의 `controls.derived`(자기 값)·`controls.injectTo`(다른 노드의 값)로 쓰고, 값을 지우는 것은 `controls.unsetValue`로 하거나, 스토어 리스너로 쓴다 — 같은 스파이크의 스토어 리스너 변형은 진입 1·`onChange` 1·검증 1·커밋 1(파동 2)이다. 예약 층의 쓰기는 정착의 파생 단계에서 일어나므로 새 진입을 만들지 않는다.
- 보충:
  > "core가 풀 문제가 아니라 **문서화 대상**이다" (`adr/0007-settle-cycle.md:107`)
  > "소비자에게 보인다: 첫 `onChange`는 파생 값이 없는 stale emit(`{a:'x'}`, 커밋 2)이고 둘째가 최종값(`{a:'x', b:'derived:x'}`, 커밋 3)이다. 통지마다 저장하는 앱은 키 입력당 두 번 저장하고 첫 저장이 stale이다." (`adr/0008-event-system.md:136`)
  > "DOM·emit·마지막 `onChange`는 끝에서 일치한다(tearing 없음)." (`adr/0008-event-system.md:136`)
- 상태: 현행
- 출처: `adr/0008-event-system.md:134,138`(정본), `adr/0008-event-system.md:136`, `adr/0007-settle-cycle.md:107`, `reviews/round-5-derivations.md:25`
- 닫은 사람: 편집자 결정(5라운드 도출 C-10, `reviews/round-5-derivations.md:25`)
- 라운드: 5(예약 층 이름은 15라운드 표기)
- 까닭: `adr/0008-event-system.md:136`

### EVENT-037 RequestRemount는 공개 명령으로 남는다

- 결정:
  > D-9 수락: `RequestRemount`는 공개 명령으로 남는다(F32). 소유자: "내부에서 쓰는 값이 아니라, 사용자가 특정 서브트리의 값을 제어·비제어 컴포넌트와 무관하게 최신화하기 위한 사용자 도구." ADR 0008이 적었던 "제거 후보"는 삭제한다.
- 보충:
  > 소유자(4라운드 D-9): "**(b) 유지.** 소유자: "내부에서 쓰는 값이 아니라, 사용자가 특정 서브트리의 값을 제어·비제어 컴포넌트와 무관하게 최신화하기 위한 사용자 도구"" (`reviews/round-4.md:115`)
- 상태: 현행
- 출처: `adr/0008-event-system.md:142`(정본), `open-questions.md:96`, `reviews/round-4.md:115,154`
- 닫은 사람: 소유자 답(`reviews/round-4.md:115` D-9)
- 라운드: 4
- 까닭: `reviews/round-4.md:115`

### EVENT-038 명령 publish를 공개 API로 연다(C-11) — 소유자 확정 대기

- 결정:
  > 도출(소유자 확정 대기): 명령 publish를 공개 API로 연다 — `FormHandle.refresh(path)`·`remount(path)`를 `focus`·`select`와 대칭으로 둔다. 두 명령이 무엇을 버리는지 적는다.
- 보충:
  > "명령 publish를 공개 API로 여는 것(C-11)은 원리에서 도출이며(`reviews/round-5-derivations.md` §1) 소유자 확정 대기다." (`adr/0008-event-system.md:3`)
  > "**명령 publish의 공개 API화**(C-11) — 소유자 확정 대기. `FormHandle`의 표면과 `publish`의 공개 타입을 함께 정해야 한다." (`adr/0008-event-system.md:206`)
  > "오늘의 사실(검증자 실측, `reviews/round-5-derivations.md` §1 C-11): 소비자는 `Refresh`도 `Remount`도 타입상 publish하지 못한다 — `AbstractNode.ts:891`의 `publish`가 내부 타입만 받고 사내 테스트조차 `as any`로 우회한다." (`adr/0008-event-system.md:144`)
  > ""Refresh는 비공개, Remount만 공개"라는 전제는 절반이 틀렸다." (`adr/0008-event-system.md:144`)
- 상태: 대체됨(→ EVENT-063)
- 출처: `adr/0008-event-system.md:146`(정본), `adr/0008-event-system.md:3,206`, `reviews/round-5-derivations.md:22`, `03-mental-model.md:172`, `reviews/round-18-closing.md:1182-1191`
- 닫은 사람: 편집자 결정(5라운드 도출 C-11, 소유자 확정 대기, `reviews/round-5-derivations.md:22`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-42)
- 라운드: 18
- 까닭: `adr/0008-event-system.md:144`, `reviews/round-18-closing.md:1193-1196`
- 충돌:
  > `03-mental-model.md:172`의 "명령(`focus`·`select`·`refresh`·`remount`)은 공개 API (D-9)"는 `refresh`·`remount`의 publish까지 공개 API로 적는다. D-9는 `RequestRemount`를 공개 명령으로 남긴 답이고, 명령 publish의 공개 API화는 소유자 확정 대기다. 정본이 이긴다(`adr/0008-event-system.md:146`).

### EVENT-039 명령 표 — RequestRefresh가 하는 일, 버리는 것, 범위

- 결정:
  > | 명령 | 하는 일 | 버리는 것 | 범위 |
  > | ---- | ------- | --------- | ---- |
  > | `RequestRefresh` | 입력의 `key`를 바꿔 비제어 입력이 커밋된 값을 다시 읽게 한다(`SchemaNodeInput.tsx:94,120`). 자식 노드 프록시를 마운트한 입력(컨테이너)은 다시 마운트하지 않는다. 로드(`reset`, `setValue(V)`)가 낸 Refresh는 core가 로드된 노드 모두에 내므로 그 자식들이 저마다 받고(로드는 값이 같아도 원본을 새로 쓰므로 ADR 0007 §3의 '그 밖의 쓰기가 원본을 바꾸면 낸다'에 든다), 컨테이너 하나에 명시로 보낸 `refresh`는 아무것도 다시 마운트하지 않는다(서브트리는 `remount`로 한다. 범위 칸의 '그 노드의 입력 하나'에서 나온다)(09 §2.6의 다섯째, 16라운드 스웜 수렴(편집자 결정)) | 그 입력의 캐럿·선택·IME 조합 상태 | 그 노드의 입력 하나 |
- 보충: 없음
- 상태: 현행
- 출처: `adr/0008-event-system.md:148-150`(정본), `09-landing-and-test-strategy.md:85`
- 닫은 사람: 편집자 결정(5라운드 도출 C-11, `reviews/round-5-derivations.md:22`), 16라운드 스웜 수렴(편집자 결정, `09-landing-and-test-strategy.md:79,85`)
- 라운드: 16
- 까닭: `reviews/round-5-derivations.md:22`
- 충돌:
  > `adr/0008-event-system.md:150`의 "로드(`reset`, `setValue(V)`)"는 소유자 답과 다르다: `setValue(V)`는 로드가 아니라 전체 교체 쓰기이고, 로드는 마운트·`FormHandle.reset()`·`resetSubtree()`뿐이다(WRITE-090). 소유자 답이 이긴다(`reviews/round-18-owner-answers.md:26`).

### EVENT-040 명령 표 — RequestRemount가 하는 일, 버리는 것, 범위

- 결정:
  > | 명령 | 하는 일 | 버리는 것 | 범위 |
  > | ---- | ------- | --------- | ---- |
  > | `RequestRemount` | 래퍼의 `key=version`을 바꿔 서브트리를 리마운트한다(`SchemaNodeProxy.tsx:84,89`, T-18) | 서브트리의 React 로컬 상태, 비제어 DOM 값, 이펙트 상태 전부 | 서브트리 |
- 보충: 없음
- 상태: 현행
- 출처: `adr/0008-event-system.md:148-149,151`(정본)
- 닫은 사람: 소유자 답(`reviews/round-4.md:115` D-9), 편집자 결정(5라운드 도출 C-11, `reviews/round-5-derivations.md:22`)
- 라운드: 5
- 까닭: `reviews/round-5-derivations.md:22`

### EVENT-041 Refresh는 범위가 좁은 리마운트 — 명시 호출이 캐럿을 날리는 것은 귀결로 문서화

- 결정:
  > `Refresh`는 "가벼운 도구"가 아니라 **범위가 좁은 리마운트**다. 소비자가 자기 입력의 `onChange` 안에서 `refresh`를 부르면 캐럿이 날아가는 것은 명시 호출의 귀결이며, 그렇게 문서화한다.
- 보충: 없음
- 상태: 현행
- 출처: `adr/0008-event-system.md:153#1-2`(정본), `reviews/round-5-derivations.md:22`
- 닫은 사람: 편집자 결정(5라운드 도출 C-11, `reviews/round-5-derivations.md:22`)
- 라운드: 5
- 까닭: `reviews/round-5-derivations.md:22`

### EVENT-042 core가 스스로 Refresh를 보내는 규칙 — 쓰기의 출처로 판단, 타이핑에는 보내지 않음

- 결정:
  > core가 스스로 `Refresh`를 보내는 규칙은 바뀌지 않는다 — 쓰기의 출처로 판단하고 타이핑에는 보내지 않는다(A6 + F7, T-2).
- 보충: 없음
- 상태: 현행
- 출처: `adr/0008-event-system.md:153#3`(정본), `reviews/round-4.md:128`
- 닫은 사람: 편집자 결정(4라운드, `reviews/round-4.md:128` F7)
- 라운드: 4
- 까닭: `reviews/round-4.md:128`

### EVENT-043 진단 표면 — 한 칸·한 이벤트·한 속성, onChange에 싣지 않음, 리터럴 이름

- 결정:
  > 예산 초과를 비롯한 정착의 결과 상태는 한 칸, 한 이벤트, 한 속성으로 관측한다. `onChange`에 싣지 않는다 — emit 참조가 바뀌지 않은 쓰기는 `onChange`를 내지 않으므로 예산 초과가 보이지 않기 때문이다(06 §4.9, C2).
  >
  > | 자리 | 이름 |
  > | ---- | ---- |
  > | 이벤트 | `UpdateDiagnostics` — `diagnostics`가 바뀐 커밋에만 낸다(§4) |
  >
  > 삼중 짝은 `state` / `UpdateState` / `onStateChange`와 같은 모양이다.
  >
  > 4차 본문에 흩어져 있던 리터럴 셋(`budget-exceeded`, `wave-cap-exceeded`, `onchange-cap-exceeded`)과 칸 이름 `settle`이 이 한 모양으로 모인다(P7). 리터럴은 코드 관례대로 camelCase다.
- 보충: 없음
- 상태: 현행
- 출처: `adr/0008-event-system.md:157,159-160,162,166,180`(정본, 157행은 `adr/0008-event-system.md:157#1-2`), `adr/0008-event-system.md:106`, `06-conclusions.md:360`
- 닫은 사람: 편집자 결정(06 도출 N4·4.9, `06-conclusions.md:360`; 10라운드 5차 본문 `adr/0008-event-system.md:13`)
- 라운드: 10
- 까닭: `adr/0008-event-system.md:157`

### EVENT-044 진단 표면 — onDiagnosticsChange와 onError, 제출 거부는 Form이 한다

- 결정:
  > | 자리 | 이름 |
  > | ---- | ---- |
  > | Form 속성 | `onDiagnosticsChange` — 호스트가 진단 상태를 관측하는 자리(§3). 제출 거부는 `<Form>`이 한다(§8) |
  > | Form 속성 | `onError` — 원인 오류의 기록을 받는 관찰자(ADR 0014 §3). 끄는 스위치 `throwOnBudgetExceeded`는 없다 |
- 보충:
  > 소유자(17라운드 R17-1): "나 허용. 망가진 값을 올리는게 더 위험하겠다." (`reviews/round-17-owner-answers.md:9`)
  > 소유자(14라운드 O-2): "가 로 가죠. 다만, 이런 예산초과된 상태로 동작하는건 되도록 막는 방향을 원하긴 해요." (`reviews/round-14-owner-answers.md:8`)
- 상태: 현행
- 출처: `adr/0008-event-system.md:159-160,163-164`(정본), `adr/0008-event-system.md:100,201`
- 닫은 사람: 소유자 답(`reviews/round-17-owner-answers.md:9` R17-1), 17라운드 스웜 수렴(편집자 결정, `adr/0008-event-system.md:201`)
- 라운드: 17
- 까닭: `reviews/round-17-owner-answers.md:9`

### EVENT-045 배달 경로 — 정착을 거치지 않는 사건과 유효 스키마 변경

- 결정:
  > | 사건 | 배달 |
  > | --- | --- |
  > | 상태 변경(`dirty`·`touched`), 외부 오류 설정·지움, 명령(`focus`·`select`·`refresh`·`remount`) | 정착을 거치지 않는 사건이다. 같은 루트 디스패처가 **같은 진입 규칙**으로 배달한다. 최외곽 진입의 끝에서 한 번, 명령은 즉시 재발행 통로를 유지한다(`DeferrableNodeProxy`가 오늘 하는 것) |
  > | 유효 스키마 변경 | 정착 파동의 배달 집합에 든다(08 §7). 비트는 슬라이스 4에서 정한다 |
- 보충:
  > 소유자(16라운드 답 3): "배달 경로 제안 | "예" | 확정(제안 → 결정)" (`reviews/round-16-owner-answers.md:9`)
  > "**배달 경로 제안.** 정착을 거치지 않는 사건(상태, 외부 오류, 명령)은 같은 루트 디스패처가 같은 진입 규칙으로 배달하고, 검증 결과는 커밋 번호 스탬프를 검사한 뒤 자기 파동으로 배달한다(09 §2.4). 권고: 예." (`reviews/round-16-owner-review.md:54`)
- 상태: 현행
- 출처: `09-landing-and-test-strategy.md:60-62,64`(정본), `reviews/round-16-owner-review.md:54`
- 닫은 사람: 소유자 답(`reviews/round-16-owner-answers.md:9` 3)
- 라운드: 16
- 까닭: `09-landing-and-test-strategy.md:58`
- 충돌:
  > `09-landing-and-test-strategy.md:64`의 "비트는 슬라이스 4에서 정한다"는 18라운드 결정과 다르다: 유효 스키마 변경의 비트는 `UpdateJsonSchema`(가칭)다(EVENT-064). 18라운드 결정이 이긴다(`reviews/round-18-closing.md:1442-1446`).

### EVENT-046 배달 경로 — 검증 결과는 스탬프를 검사한 뒤 자기 파동으로

- 결정:
  > | 사건 | 배달 |
  > | --- | --- |
  > | 검증 결과 | 약속이 풀린 뒤 커밋 번호 스탬프를 검사해 최신이면 **자기 파동**으로 오류 갱신을 배달한다. 정착 파동에 끼워 넣지 않는다. 늦은 결과는 버린다(08 §11). 이 파동의 리스너 예외는 `onError`에 한 번, 이어 주인 없는 오류 싱크로 한 번 드러나며 미처리 거부로 남기지 않는다(ADR 0014 4판의 `OnChange` 검증 실행 실패와 같은 표면, 17라운드 스웜 수렴(편집자 결정)) |
- 보충: 없음
- 상태: 현행
- 출처: `09-landing-and-test-strategy.md:60-61,63`(정본), `reviews/round-16-owner-review.md:54`
- 닫은 사람: 소유자 답(`reviews/round-16-owner-answers.md:9` 3), 17라운드 스웜 수렴(편집자 결정, `09-landing-and-test-strategy.md:63`, 이 파동의 리스너 예외의 드러남)
- 라운드: 17
- 까닭: `09-landing-and-test-strategy.md:63`

### EVENT-047 되돌림 가능성 — 중간, 소비자에게 보이는 변화

- 결정:
  > 중간. `subscribe`와 이벤트 타입은 공개 API다. 통지 시점, 배달 순서(루트 쓰기의 깊이 순서가 뒤집힌다), 배열 연산의 동기화, `onChange` 호출 횟수는 모두 소비자의 타이밍 가정에 영향을 준다. `payload.previous`의 뜻이 "직전 커밋"에서 "마지막으로 통지한 값"으로 바뀌는 것도 관측 가능한 변화다. 값이 같아도 유효 스키마가 바뀐 노드에 통지가 가는 것, 개발 모드의 예산 초과 throw, `diagnostics`의 모양도 소비자에게 보이는 표면이다.
- 보충: 없음
- 상태: 현행(기록)
- 출처: `adr/0008-event-system.md:213`(정본)
- 닫은 사람: 편집자 결정(10라운드 5차 본문, `adr/0008-event-system.md:13`)
- 라운드: 10
- 까닭: `adr/0008-event-system.md:213`
- 충돌:
  > `adr/0008-event-system.md:213`의 "개발 모드의 예산 초과 throw"는 예산 초과 throw를 개발 모드의 것으로 적는다. 17라운드 규칙과 다르다. 17라운드 규칙이 이긴다(`adr/0008-event-system.md:99`, `adr/0014-error-policy.md:53`).

### EVENT-048 유효 스키마 변경 통지의 표면

- 결정:
  > - **유효 스키마 변경 통지의 표면** — §2 규칙 2가 배달하는 유효 스키마 변경을 어느 이벤트 타입과 payload로 싣는지(`03-mental-model.md` §6, `07-conclusions.md` §11.2).
- 보충: 없음
- 상태: 대체됨(→ EVENT-064)
- 출처: `adr/0008-event-system.md:202`(정본), `reviews/round-18-agenda.md:108`, `reviews/round-18-closing.md:1442-1460`
- 닫은 사람: 편집자 결정(17라운드, 18라운드 안건으로 이관), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-52)
- 라운드: 18
- 까닭: `adr/0008-event-system.md:202`, `reviews/round-18-closing.md:1462-1465`

### EVENT-049 상태 칸 변경의 배달 — ADR 0008이 적지 않은 것

- 결정:
  > - **상태 칸 변경의 배달** — `setState`와 `controls.resetInteraction`이 바꾼 `dirty`·`touched`가 §2 규칙 2의 배달 집합에 어느 항으로 드는지 이 ADR은 적지 않는다.
- 보충:
  > "정착을 거치지 않는 사건이다. 같은 루트 디스패처가 **같은 진입 규칙**으로 배달한다. 최외곽 진입의 끝에서 한 번" (`09-landing-and-test-strategy.md:62`)
  > "예약 층의 `controls.resetInteraction`(옛 `&pristine`)은 원본이 아니라 상태 칸을 초기화하며, 그 판정은 정착의 **커밋**에서 한다(`03-mental-model.md` §4)." (`adr/0008-event-system.md:76`)
- 상태: 분할됨(→ EVENT-066, EVENT-067)
- 출처: `adr/0008-event-system.md:203`(정본), `09-landing-and-test-strategy.md:62`, `reviews/round-18-closing.md:2195-2201`
- 닫은 사람: 편집자 결정(10라운드 5차 본문의 미결, `adr/0008-event-system.md:203`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-82)
- 라운드: 18
- 까닭: `adr/0008-event-system.md:203`, `reviews/round-18-closing.md:2203-2205`

### EVENT-050 실제 브라우저의 IME 확인

- 결정:
  > - **실제 브라우저의 IME 확인** — 스파이크는 `fireEvent`로 조합 3단계를 흉내 냈고, jsdom은 조합 중 프로그램적 value 쓰기가 조합을 취소하는 브라우저 동작을 모델링하지 않는다(`spikes/events/REPORT-caret.txt` §4).
- 보충: 없음
- 상태: 대체됨(→ EVENT-065)
- 출처: `adr/0008-event-system.md:205`(정본), `reviews/round-18-agenda.md:111`, `reviews/round-18-closing.md:1768-1772,1778-1787`
- 닫은 사람: 편집자 결정(17라운드, 18라운드 안건으로 이관), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-63)
- 라운드: 18
- 까닭: `adr/0008-event-system.md:205`, `reviews/round-18-closing.md:1774-1776`

### EVENT-051 UpdatePath — 배열 재인덱싱 시 경로 변경 통지

- 결정:
  > - **`UpdatePath`** — 배열 재인덱싱 시 경로 변경 통지. 노드 identity와 경로의 대응은 새 구조에서도 남는다(ADR 0011).
- 보충: 없음
- 상태: 분할됨(→ EVENT-066, EVENT-068)
- 출처: `adr/0008-event-system.md:207`(정본), `reviews/round-18-closing.md:2211-2216`
- 닫은 사람: 편집자 결정(10라운드 5차 본문의 미결, `adr/0008-event-system.md:207`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-83)
- 라운드: 18
- 까닭: `adr/0008-event-system.md:207`, `reviews/round-18-closing.md:2218-2220`

### EVENT-052 globalState — OR 누적을 이번 개편에서 고칠지

- 결정:
  > - **`globalState`** — 현재는 OR 누적이어서 내릴 수 없고 출처를 알 수 없다. 이번 개편에서 함께 고칠지.
- 보충: 없음
- 상태: 대체됨(→ EVENT-062)
- 출처: `adr/0008-event-system.md:208`(정본), `reviews/round-18-agenda.md:86`, `01-current-structure.md:80`, `reviews/round-18-closing.md:1155-1171`
- 닫은 사람: 편집자 결정(17라운드, 18라운드 안건으로 이관), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-41)
- 라운드: 18
- 까닭: `01-current-structure.md:80`, `reviews/round-18-closing.md:1173-1176`

### EVENT-053 C-10의 문서 자리 — 어느 문서가 소유하는지

- 결정:
  > - **C-10의 문서 자리** — "파생 값은 이펙트가 아니라 `controls.derived`/`controls.injectTo`/스토어 리스너로 쓴다"를 어느 문서가 소유하는지(README인가 마이그레이션 안내인가).
- 보충: 없음
- 상태: 대체됨(→ EVENT-069)
- 출처: `adr/0008-event-system.md:209`(정본), `reviews/round-18-closing.md:2226-2229`
- 닫은 사람: 편집자 결정(10라운드 5차 본문의 미결, `adr/0008-event-system.md:209`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-84)
- 라운드: 18
- 까닭: `adr/0008-event-system.md:138`, `reviews/round-18-closing.md:2231-2231`

### EVENT-054 React 이펙트를 거친 진입 간 순환이 React 자체 한도에 막히는지

- 결정:
  > React 이펙트를 거친 진입 간 순환이 React 자체 한도에 막히는지는 실행하지 않았다(7절).
- 보충:
  > "| D-17 React 이펙트 순환이 React 자체 한도에 막히는가 | 그대로 |" (`07-conclusions.md:397`)
  > "| D-17 React 이펙트 순환 | 4.6에서 진입 사슬 단위로 바꾼 뒤, React 이펙트를 거친 진입 간 순환이 React 자체 한도에 막히는가 | 이벤트 스파이크에 이펙트 되먹임 사례 추가 | 막히면 코어 예산에서 제외 |" (`06-conclusions.md:402`)
- 상태: 대체됨(→ EVENT-070)
- 출처: `06-conclusions.md:161#2`(정본), `06-conclusions.md:402`, `07-conclusions.md:397`, `reviews/round-18-closing.md:2237-2239,2244-2250`
- 닫은 사람: 편집자 결정(06 도출 D-17의 남는 것, `06-conclusions.md:161`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-85; PR-7 게이트 조건부)
- 라운드: 18
- 까닭: `06-conclusions.md:161`, `reviews/round-18-closing.md:2241-2242`

### EVENT-055 대체됨: 예산 초과 시 개발 모드의 throw는 최외곽 진입 끝에서

- 결정:
  > - **결론.** 개발 모드와 프로덕션 모두 커밋 → 검증 요청 → `onChange` 순서로 진행하고, 개발 모드의 throw는 최외곽 진입 끝에서 한다.
- 보충:
  > 소유자(10라운드 B-1): "권고를 따릅니다만, 기본적으론 form 을 터트려서(error 를 throw 해서) 알려주는게 좋지 않을까 싶네요... 이 루프가 만들어지는건 기본적으로 schema를 잘못 짰기 때문이니까, 런타임에 발생할 확률은 비교적 낮겠고요. 그리고 다시 말하지만, 구태여 막지 않을 뿐이지 루프를 만드는걸 권하는 설계는 절대 아닙니다." (`reviews/round-10-owner-answers.md:13`)
  > "**모든 환경**에서 커밋·통지 뒤 사슬 끝에서 throw한다(17라운드 소유자 답 R17-1 나: "망가진 값을 올리는게 더 위험하겠다")." (`adr/0008-event-system.md:99`)
  > "개발 모드만 던지고 프로덕션은 신호만 내던 5차 본문의 규칙(소유자 B-1)은 이 답으로 대체되었다." (`adr/0008-event-system.md:99`)
- 상태: 대체됨(→ EVENT-021, ERROR-070, ERROR-071)
- 출처: `06-conclusions.md:150`(정본), `adr/0008-event-system.md:13,97,99`
- 닫은 사람: 소유자 답(`reviews/round-17-owner-answers.md:9` R17-1)
- 라운드: 17
- 까닭: `adr/0008-event-system.md:99`

### EVENT-056 대체됨: 루트 onChange는 파동마다 한 번, 디바운스는 Form 옵션(F22)

- 결정:
  > | F22 | T-9 | 루트 `onChange`는 **파동마다 한 번**. 디바운스는 Form 옵션(D-10) |
- 보충:
  > "F31이 F22를 대체한다." (`adr/0008-event-system.md:114`)
- 상태: 대체됨(→ EVENT-026)
- 출처: `reviews/round-4.md:143`(정본), `reviews/round-4.md:153`, `adr/0008-event-system.md:114`
- 닫은 사람: 소유자 답(`reviews/round-4.md:116` D-10)
- 라운드: 4
- 까닭: `reviews/round-4.md:116`

### EVENT-057 대체됨: 파동 상한은 틱당, 상한에서 개발 모드 throw·프로덕션은 무시(F15)

- 결정:
  > | F15 | B3-4·T-4 | 파동 상한은 동기 호출당이 아니라 **틱당**(매크로태스크에서 초기화)이다 — React 레이아웃 이펙트를 거치는 되먹임을 세기 위해. 상한에 닿으면 **마지막 파동을 한 번 더 배달하되 그 파동의 리스너 쓰기는 거부**한다(개발 모드 throw, 프로덕션은 무시 + `settle` 기록). 미루지 않는다 — 미루고 초기화하면 현재 코드처럼 같은 입력이 틱마다 다시 돈다(RE `:89`, `2-current-after-reset`). 거부하므로 트리와 DOM이 어긋나지 않는다(통지되지 않은 쓰기가 없다). 리스너가 매 통지마다 쓰는 것은 소비자 오류다 |
- 보충:
  > "파동 예산의 단위를 "틱"에서 "최외곽 진입의 되먹임 사슬"로 바꾼다." (`06-conclusions.md:158`)
- 상태: 대체됨(→ EVENT-008, ERROR-071, ERROR-142)
- 출처: `reviews/round-4.md:136`(정본), `06-conclusions.md:154-160`, `adr/0008-event-system.md:13,74`
- 닫은 사람: 편집자 결정(06 도출 D-17, `06-conclusions.md:158`; 10라운드 5차 본문 `adr/0008-event-system.md:13`), 소유자 답(`reviews/round-17-owner-answers.md:9` R17-1)
- 라운드: 17
- 까닭: `06-conclusions.md:159`

### EVENT-058 exceededBudget의 전이 값 이름은 'transition' — transitionDefaults·nodeCreationDefaults 이름 항목은 닫힘

- 결정:
  > 5차의 이름 항목(`transitionDefaults`를 `nodeCreationDefaults`로 바꿀지, 07 §6.2 N4)은 ADR 0014 4판이 값을 `'transition'`으로 적어 닫혔다.
- 보충:
  > "**`exceededBudget`의 `transitionDefaults` 이름** — 닫힘. ADR 0014 4판 §5가 값을 `'hostWheel'`·`'derive'`·`'transition'` 셋으로 적었다(§8)." (`adr/0008-event-system.md:204`)
- 상태: 현행
- 출처: `adr/0008-event-system.md:182`(정본), `adr/0008-event-system.md:172,204`, `adr/0014-error-policy.md:207`
- 닫은 사람: 편집자 결정(17라운드, ADR 0014 4판 채택)
- 라운드: 17
- 까닭: `adr/0008-event-system.md:182`

### EVENT-059 reset의 문서화 대상 셋 — 렌더 중 reset, 언마운트된 Form의 reset, 재대조 reset의 진입

- 결정:
  > 렌더 중의 reset은 React의 '렌더 중 갱신' 경고를 받는다. 언마운트된 `<Form>`의 핸들로 부른 reset은 통지 없는 로드일 뿐 오류가 아니다. 둘째의 재대조 reset은 레이아웃 효과 안의 새 최외곽 진입이며, 그 `onChange` 안에서 호출자가 상태를 바꾸면 React가 그리기 전에 동기로 다시 그린다(셋 모두 문서화).
- 보충:
  > "모든 통지가 동기이므로 렌더 중 사용자 코드의 쓰기는 React의 "렌더 중 갱신" 경고를 받는다." (`09-landing-and-test-strategy.md:54`)
  > "두 번째 reset은 독립된 진입이며 ADR 0008의 규칙대로 자기 통지를 낸다(재대조는 ADR 0008 §6의 이펙트 진입과 같은 새 진입이다)." (`09-landing-and-test-strategy.md:82`)
- 상태: 현행
- 출처: `09-landing-and-test-strategy.md:90#9-11`(정본), `09-landing-and-test-strategy.md:54,82`
- 닫은 사람: 16라운드 스웜 수렴(편집자 결정, `09-landing-and-test-strategy.md:79,90`)
- 라운드: 16
- 까닭: `09-landing-and-test-strategy.md:54`, `09-landing-and-test-strategy.md:82`

### EVENT-060 `UpdateValue` 통지에 출처 칸을 둔다 — 이름과 값 목록은 편집자

- 결정:
  > 나. 출처 칸을 둔다. 이름과 값 목록은 편집자가 정한다(통지는 사실만 싣는다: 쓰기 종류의 출처 — 입력·자동 쓰기(derived·injectTo·default 채움·trim)·로드). 소유자가 든 쓰임은 derived가 발화한 입력을 다르게 표시하는 것이다.
- 보충:
  > 소유자(12-5 답): "source 를 저장하는건 문제 없습니다. 다만, 사용자가 이걸 쓸 일이 있을지는 모르겠군요. 오히려 dirved 가 발화된 경우, input에 다른 표시를 하거나 하는 등에는 쓸 수 있겠습니다만. 아무튼 이 통지에 옵션을 추가하는건 문제 없습니다" (`reviews/round-18-owner-answers.md:15`)
  > 편집자 결정(18C-100): "【추론】 쓰기 종류의 목록(VALUE-032)과 `UpdateValue` 출처 칸의 값(EVENT-060)에 '호출자 전체 교체'(`setValue(V)`)를 더한다." (`reviews/round-18-closing.md:2834`)
- 상태: 현행
- 출처: `reviews/round-18-owner-answers.md:15`(정본, 12-5의 반영 칸. 표 행이라 조각 번호로 나눌 수 없다), `reviews/round-18-closing.md:2834`
- 닫은 사람: 소유자 답(`reviews/round-18-owner-answers.md:15` 12-5), 편집자 결정(18라운드, `reviews/round-18-owner-answers.md:15` 반영 칸; 이름과 값 목록), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-100)
- 라운드: 18
- 까닭: `reviews/round-18-owner-answers.md:15`, `reviews/round-18-closing.md:2836-2837`
- 충돌:
  > `08-design-a-to-z.md:531`의 "O-3(출처 필드는 더하지 않음)"은 소유자 답과 다르다. 소유자 답이 이긴다(`reviews/round-18-owner-answers.md:15`).
  > `08-design-a-to-z.md:382`의 "공개 payload에는 출처를 더하지 않는다(14라운드: 니즈가 약하다. 필요하면 나중에 더한다)"는 소유자 답과 다르다. 소유자 답이 이긴다(`reviews/round-18-owner-answers.md:15`).
  > `reviews/round-14-values-check.md:108`의 "O-3은 출처 필드를 더하지 않음"은 소유자 답과 다르다. 소유자 답이 이긴다(`reviews/round-18-owner-answers.md:15`).

### EVENT-061 `batch(fn)` 안의 updater는 부른 자리에서 실행되어 앞선 표시를 이어 받고(던지면 `fn`의 예외), 평범한 읽기는 직전 커밋을 돌려준다

- 결정:
  > 【추론】 `batch(fn)` 안에서 updater는 이어진다.
  > 【추론】 같은 노드에 `setValue(p => p + 1)`을 두 번 부르면 2가 더해진다.
  > 【추론】 updater 꼴이 호출자에게 기대하게 하는 결과다.
  > 【추론】 updater의 `prev`는 직전 커밋에, 이 배치에서 앞서 표시된 쓰기 가운데 그 노드의 서브트리에 닿은 것을 순서대로 얹은 값이다.
  > 【추론】 잎의 `prev`는 이 배치에서 그 노드에 마지막으로 표시된 원본(`interpret`를 지난 값)이다.
  > 【추론】 표시가 없으면 직전 커밋이다.
  > 【추론】 가지의 `prev`는 커밋된 값에 그 서브트리의 표시들을 경로별로 덮어 얹은 값이다.
  > 【추론】 정착의 의미는 적용하지 않는다.
  > 【추론】 채움, `derived`, 투영은 `prev`에 들지 않고, `fn`이 끝난 뒤 정착에서 한 번 적용된다.
  > 【추론】 updater는 부른 자리에서, 그 쓰기를 표시하는 동안 실행된다.
  > 【추론】 정착 때 실행하지 않는다.
  > 【추론】 updater가 던지면 그것은 `fn`의 예외다.
  > 【추론】 ADR 0014의 진입 규칙대로 모아 두었다가 사슬 머리가 끝날 때 던진다(`adr/0014-error-policy.md:49`).
  > 【추론】 정착 오류가 되지 않는다.
  > 【추론】 `fn` 안의 평범한 읽기(`value`, `outputValue`, `inactiveValues`, `FormHandle.getValue()`)는 여전히 직전 커밋을 돌려준다.
  > 【추론】 읽기는 계산하지 않기 때문이다(VALUE-013).
  > 【추론】 가지의 덮어 얹기는 updater라는 쓰기의 일부이며 읽기가 아니다.
  > 【추론】 `batch` 밖에서는 두 규칙이 겹친다.
  > 【추론】 쓰기마다 정착하므로 `prev`는 직전 커밋, 곧 `value`다.
  > 【추론】 그래서 SURFACE-031의 "`prev`는 `value`다"는 `batch` 밖에서 그대로 맞고, `batch(fn)` 안에서는 이 블록의 규칙이 이긴다.
  > 【추론】 `fn` 안에서 `reset`을 부르면 그 로드는 호출 안에서 곧바로 정착하고, 앞서 표시된 쓰기를 덮는다(`09-landing-and-test-strategy.md:90`).
  > 【추론】 그래서 그 뒤의 읽기와 updater의 기준은 reset의 커밋이다.
  > 【추론】 비용은 `batch` 안에서 updater를 부를 때만 든다.
  > 【추론】 잎은 원본 하나를 읽는다.
  > 【추론】 가지는 그 서브트리에 앞서 표시된 경로 수에 비례하는 조립이 든다.
  > 【추론】 평범한 읽기와 `batch` 밖의 쓰기에는 새 비용이 없다.
  > 【추론】 `batch` 문서 주석에 다음을 적는다: "fn 안의 쓰기는 표시만 되고 fn이 끝날 때 한 번 정착한다. fn 안의 updater `setValue(prev => …)`는 부른 자리에서 실행되고, 앞선 쓰기를 반영한 `prev`를 받아 이어진다(같은 노드에 +1을 두 번 하면 +2). updater가 던지면 fn의 예외로 다뤄진다. 그 밖의 읽기(`value`·`outputValue`·`inactiveValues`·`getValue()`)는 직전 커밋을 돌려준다. 채움·`derived`·투영은 정착에서 적용되므로 `prev`에 들지 않는다. 채움과 `injectTo` 때문에 배치의 결과는 순차 호출과 다를 수 있다."
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-18-closing.md:609-635`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-20)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:642-648`
- 충돌:
  > `06-conclusions.md:358`의 "`setValue(updater)`는 유지하고 `prev`는 `value`다."는 `batch(fn)` 안에서는 18라운드 결정과 다르다: 그 안에서 `prev`는 직전 커밋에 앞선 표시를 얹은 값이다. `batch` 밖에서는 그대로 맞는다. 18라운드 결정이 이긴다(`reviews/round-18-closing.md:628`).

### EVENT-062 `globalState`는 형상 안 노드에서 유도한다 — 키별 참 노드 수, 값은 `true`, 0이면 키가 빠짐, 0↔1을 넘을 때만 새 객체와 `UpdateGlobalState`

- 결정:
  > 【추론】 `globalState`는 누적하지 않고 트리에서 유도한다.
  > 【추론】 키 k가 참인 것은 형상에 있는 노드 가운데 하나라도 `state[k]`가 참인 때뿐이다.
  > 【추론】 `globalState`는 참인 노드가 하나 이상인 키만 담고 값은 `true`다.
  > 【추론】 수가 0이면 키가 빠진다.
  > 【추론】 런타임은 키마다 참인 노드의 수를 든다.
  > 【추론】 수는 노드 상태가 바뀔 때와 노드가 형상에 들고 날 때 O(1)로 고친다.
  > 【추론】 어느 키의 수가 0과 1 사이를 넘을 때만 `globalState` 객체를 새로 짓고 `UpdateGlobalState`를 낸다.
  > 【추론】 그 밖에는 같은 참조를 돌려준다.
  > 【추론】 결과로 `dirty`가 내려간다.
  > 【추론】 모든 노드의 `dirty`가 풀리거나 비루트 노드에서 `clearSubtreeState()`를 불러도 내려간다.
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-18-closing.md:1160-1169`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-41)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:1173-1176`

### EVENT-063 명령 넷은 공개 노드 메서드 — `FormHandle`은 넷 모두 대칭, 공개 `publish` 없음

- 결정:
  > 【추론】 명령 넷은 공개 노드 메서드 `focus()`·`select()`·`refresh()`·`remount()`다.
  > 【추론】 각 메서드는 그 노드에 요청 사건을 내는 문장 하나이고, 원본을 쓰지 않는다.
  > 【추론】 배달은 EVENT-045·LANDING-076이다.
  > 【추론】 `FormHandle`은 오늘의 `focus(path)`·`select(path)`에 `refresh(path)`·`remount(path)`를 대칭으로 더한다.
  > 【추론】 넷 모두 `find(path)`한 노드의 메서드를 부르고, 노드가 없으면 아무것도 하지 않는다(오늘 `Form.tsx:147-150`과 같음).
  > 【추론】 노드의 공개 `publish`와 publish용 공개 사건 형은 두지 않는다.
  > 【추론】 명령이 대신한다.
  > 【추론】 두 명령이 버리는 것은 EVENT-039·EVENT-040의 표가 적고, README(PR-8)가 옮긴다.
  > 【추론】 노드 메서드는 PR-4(배달 경로)에서 겉면에 더하고 멤버 목록 시험과 08 §13 행을 함께 고친다.
  > 【추론】 `FormHandle`의 둘은 PR-7이다.
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-18-closing.md:1182-1191`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-42)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:1193-1196`

### EVENT-064 유효 스키마 변경 통지 `UpdateJsonSchema`(가칭) — 메모 참조가 마지막 통지와 다를 때, 생성 때는 없음, payload `{ previous, current }` 참조, 출처 칸 없음, 계산 상태 비트와 분리

- 결정:
  > 【추론】 유효 스키마 변경은 이벤트 타입 하나로 싣는다.
  > 【추론】 가칭은 `UpdateJsonSchema`다(`UpdateValue`↔`value`처럼 공개 읽기 `node.jsonSchema`를 따른 이름).
  > 【추론】 커밋에서 노드의 메모된 유효 스키마 참조가 그 노드에 마지막으로 통지한 것과 다를 때 켜진다.
  > 【추론】 같은 덧씌움 집합이면 같은 참조이므로 참조 비교로 충분하다.
  > 【추론】 EVENT-006 배달 집합의 "유효 스키마가 바뀐 노드" 항이 이 비트다.
  > 【추론】 트리 생성(마운트·재생성)에서는 통지하지 않는다.
  > 【추론】 같은 스키마의 reset·`setValue` 로드에서 바뀌면 통지한다.
  > 【추론】 payload는 `{ previous, current }`이며 둘 다 유효 스키마 참조이고 복사하지 않는다.
  > 【추론】 `previous`는 마지막으로 통지한 것이다(EVENT-024).
  > 【추론】 개발 모드 `Object.freeze`는 payload 객체에만 한다.
  > 【추론】 유효 스키마는 작성자 객체를 참조로 옮겨 쓸 수 있기 때문이다.
  > 【추론】 출처 칸은 없다.
  > 【추론】 12-5의 출처는 `UpdateValue`의 쓰기 출처이고, 유효 스키마 변경은 쓰기가 아니다.
  > 【추론】 렌더 계층은 `SchemaNodeProxy`의 재렌더 마스크에 이 비트를 더한다.
  > 【추론】 계산 상태(`active`·`visible`·`readOnly`·`disabled`·`watchValues`)의 비트와는 따로 둔다.
  > 【추론】 오늘의 내부 `UpdateComputedProperties`(`src/core/types/event.ts:63`)가 계산 상태 쪽 비트다.
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-18-closing.md:1442-1454,1458-1460`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-52)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:1462-1465`
- 충돌:
  > `reviews/round-18-closing.md:1448`의 "같은 스키마의 reset·`setValue` 로드"는 소유자 답과 다르다: `setValue`는 로드가 아니라 전체 교체 쓰기이고, 로드는 마운트·`FormHandle.reset()`·`resetSubtree()`뿐이다(WRITE-090). 소유자 답이 이긴다(`reviews/round-18-owner-answers.md:26`).

### EVENT-065 IME 조합의 동기 통지 확인 — 게이트 PR-7(스토리북 브라우저, 사람 확인 목록)

- 결정:
  > 통지는 입력 처리기 안에서 동기다(ADR 0008, 기존 규칙).
  > PR: PR-7, 스토리북 브라우저 프로젝트(Chromium, TEST-024).
  > 후보 방법은 CDP `Input.imeSetComposition`/`Input.insertText`로 한국어 조합 ㄱ→가→각을 내는 것이다.
  > 대상: (a) 노드에 묶인 평범한 제어 입력, (b) 캐럿 기록을 하는 포매터 입력, (c) 조합 중에 Refresh가 도착한 입력.
  > 사람이 한 번 확인하는 목록에 macOS Safari·Chrome의 한국어 IME를 둔다.
  > 통과: 조합 단계마다 DOM 값이 IME 글과 같다.
  > 통과: 조합 중 `value` 세터 호출이 0회다.
  > 통과: `compositionend`가 한 번 오고, 그 뒤 노드 값이 최종 글이다.
  > 통과: (c)에서는 조합 중인 글이 늦은 쓰기로 노드에 닿지 않는다(REACT-024).
  > 실패: 먼저 바인딩 계층에서 고친다(조합 중에는 복원·Refresh로 인한 DOM 쓰기를 미룸).
  > 실패: core의 통지 시점(ADR 0008 §1의 동기 통지)을 바꿔야만 풀리면 소유자에게 올린다.
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-18-closing.md:1768,1778-1787`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-63)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:1774-1776`

### EVENT-066 배달 집합 규칙 2의 추가 항 — (이번 커밋에서 상호작용 상태가 바뀐 노드), (이번 커밋에서 경로가 바뀐 노드)

- 결정:
  > 【추론】 `controls.resetInteraction`이 커밋에서 바꾼 `dirty`·`touched`는 그 정착 파동의 배달 집합에 든다.
  > 【추론】 ADR 0008 §2 규칙 2에 항 하나를 더하는 것이다: "(이번 커밋에서 상호작용 상태가 바뀐 노드)".
  > 【추론】 커밋에서 경로가 바뀐 노드는 그 정착 파동의 배달 집합에 든다(규칙 2에 항 "(이번 커밋에서 경로가 바뀐 노드)"를 더한다).
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-18-closing.md:2197-2198,2211`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-82·18C-83)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:2203-2205`, `reviews/round-18-closing.md:2218-2220`

### EVENT-067 `setState`의 상태 칸 변경은 정착 밖 사건 — 최외곽 진입 끝에 한 번, 비트 `UpdateState`, 같은 노드는 합쳐 한 번, `onStateChange` 한 번

- 결정:
  > 【추론】 `setState`가 바꾼 `dirty`·`touched`는 EVENT-045(16라운드 답 3)대로 정착을 거치지 않는 사건이다.
  > 【추론】 같은 루트 디스패처가 같은 진입 규칙으로, 최외곽 진입의 끝에서 한 번 배달한다.
  > 【추론】 비트는 오늘과 같은 `UpdateState`다.
  > 【추론】 한 진입 안에서 두 경로가 같은 노드를 바꾸면 비트는 합쳐져 그 노드에 한 번 배달된다.
  > 【추론】 `onStateChange`는 최외곽 진입의 끝에서 한 번 부른다.
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-18-closing.md:2195-2196,2199-2201`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-82)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:2203-2205`

### EVENT-068 `UpdatePath` — payload `{ previous, current }`, 재인덱싱된 아이템의 자손 포함, 공개 이벤트 형 밖, 렌더 계층이 입력을 다시 그림

- 결정:
  > 【추론】 비트는 `UpdatePath`, payload는 오늘처럼 `{ previous, current }`다.
  > 【추론】 재인덱싱된 아이템의 자손도 포함한다(오늘 `__updatePath__`의 재귀와 같다).
  > 【추론】 오늘처럼 공개 이벤트 형(오늘 `NodeEventType`, 곧 `PublicNodeEventType` 여섯)에는 넣지 않는다.
  > 【추론】 렌더 계층은 입력을 다시 그리는 사건 집합에 이 비트를 더한다.
  > 【추론】 입력의 `path`·`name` prop과, 경로를 키로 쓰는 맵(첨부 파일 맵, `useChildNodeErrors`의 상태 맵)이 새 경로를 따라가게 하기 위해서다.
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-18-closing.md:2212-2216`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-83)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:2218-2220`

### EVENT-069 C-10의 사용 규칙은 README가 소유 — 이주 안내에는 README를 가리키는 한 줄, 작성은 PR-8

- 결정:
  > 【추론】 "파생 값은 이펙트가 아니라 `controls.derived`/`controls.injectTo`/스토어 리스너로 쓴다"는 판과 무관한 사용 규칙이므로 README(와 `docs/QUICK_REFERENCE.md`·`docs/agents`의 `validation-and-state.md`)가 소유한다.
  > 【추론】 이주 안내에는 한 줄만 두고 README를 가리킨다.
  > 【추론】 그 한 줄은, 오늘 매크로태스크 디바운스가 가리던 "이펙트 쓰기면 키 입력당 `onChange` 2회"가 새 설계에서 드러난다는 점이다(LANDING-022 이주 19와 짝).
  > 【추론】 작성은 PR-8이다.
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-18-closing.md:2226-2229`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-84)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:2231`

### EVENT-070 React 이펙트를 거친 진입 간 순환은 core 예산에 넣지 않는다 — 예방은 C-10 문서, 게이트 PR-7(React 18·19 실행)

- 결정:
  > 【추론】 규칙은 지금 정한다.
  > 【추론】 core의 예산은 진입 사슬 단위이고(EVENT-008), React 이펙트를 거친 순환은 매번 새 진입이라 core 예산에 넣지 않는다.
  > 【추론】 예방은 C-10의 문서(18C-84)가 맡는다.
  > PR: PR-7(React 18 실행 시험을 두는 PR, REACT-017).
  > 무엇: 이벤트 스파이크(`spikes/events/`)에 이펙트 되먹임 사례를 더한다.
  > 무엇: `useLayoutEffect`와 `useEffect`에서 `node.setValue`로 서로를 되쓰는 두 필드를 만들고, React 18과 19에서 각각 실행한다.
  > 통과: 두 이펙트 모두에서 React가 순환을 끊는다(throw나 중단).
  > 통과: 그러면 이 규칙을 그대로 둔다.
  > 실패(특히 패시브 이펙트 순환이 개발 모드 경고만 내고 계속 도는 경우): core가 진입 간 순환 감지를 더할지 소유자에게 올린다.
  > 실패: 이것은 core 예산의 단위를 바꾸는 일이라 편집자가 정하지 않는다.
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-18-closing.md:2237-2239,2244-2250`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-85)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:2241-2242`

### EVENT-071 로드가 아닌 쓰기(`setValue(V)` 포함)의 Refresh는 원본이 실제로 바뀐 노드에만(쓴 입력 제외) — "값이 같아도 낸다"는 로드의 새 수명만

- 결정:
  > 【추론】 로드가 아닌 쓰기(`setValue(V)` 포함)는 ADR 0007 §3대로 원본이 실제로 바뀐 노드에만 Refresh를 내고, 쓴 입력 자신은 제외한다.
  > 【추론】 "값이 같아도 낸다"는 로드의 새 수명에만 해당한다.
  > PR: PR-2(정착의 Refresh 대상)·PR-7(입력의 다시 마운트)
  > 무엇: 입력 중에 리스너가 `setValue(getValue())`를 부르는 장면과, 잎 하나만 바꾼 `setValue(V)`에서 `RequestRefresh`를 받는 노드를 센다.
  > 통과: 앞 장면은 0회, 뒤 장면은 바뀐 잎만 1회이며, 캐럿과 IME 상태가 남는다.
  > 실패: 원본이 바뀌지 않은 노드가 Refresh를 받으면 정착의 Refresh 대상을 고친다.
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-18-closing.md:2730-2731,2738-2741`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-94)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:2734-2736`

### EVENT-072 `resetSubtree()`에 걸린 로드 규칙(로드 뒤 검증, `batch` 안의 즉시 정착, 한 로드에 한 번, 로드마다 다시 만듦)은 그 하위 트리에만

- 결정:
  > 【추론】 로드 뒤 `OnChange` 비트면 한 번 하는 검증(LANDING-041, ERROR-040, EVENT-032)은 `resetSubtree()`에는 그 하위 트리에만 적용한다.
  > 【추론】 `batch` 안의 로드를 곧바로 정착하는 규칙(EVENT-015)은 `resetSubtree()`에는 그 하위 트리에만 적용한다.
  > 【추론】 "한 로드에 한 번"(VALIDATE-048)은 `resetSubtree()`에는 그 하위 트리에만 적용한다.
  > 【추론】 "로드마다 다시 만든다"(VALUE-030)는 `resetSubtree()`에는 그 하위 트리에만 적용한다.
  > PR: PR-2(정착)·PR-4(검증)
  > 무엇: `OnChange` 폼에서 `batch` 안과 밖에서 `resetSubtree()`를 부르고, 정착 시점, 검증 요청 수, 검증 불가 기록, 경고등 경로 집합을 본다.
  > 통과: 로드 규칙이 그 하위 트리에만 적용되고, 하위 트리 밖의 기록과 경로는 그대로다.
  > 실패: 이 블록을 고친다.
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-18-closing.md:2848-2851,2857-2860`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-101)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:2853-2855`
