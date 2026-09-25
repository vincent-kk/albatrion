# 단일 원장 — 목표·비목표·가치·원리·물려받은 제약

기준 커밋: `ba398c330`(저장소 `packages/canard/schema-form/architecture`). 이 원장이 인용하는 `path:line`은 모두 이 커밋의 줄 번호다. 정본 우선순위는 `ledger/README.md` §1을 따른다. 소유자 답이 먼저이고, 이 영역의 정본은 `00-goals.md`(목표 G1–G8, 추가 목표 C1–C8, 비목표), `03-mental-model.md` §1(원리와 소유자의 축·답), `08-design-a-to-z.md` §1(다섯 가치), `04-inherited-constraints.md`(물려받은 제약)다. `03`과 `08`이 다르면 `03`이 이기고, 뒤 라운드가 앞 라운드를 이긴다. `06-conclusions.md`(8라운드까지)·`07-conclusions.md`(9라운드)는 그때의 기록이라, 뒤 문서가 바꾼 규칙은 "대체됨"으로 남긴다. 목표(G)와 추가 목표(C)의 닫은 사람은 `00-goals.md` "출처" 절과 `reviews/round-2.md` §결정의 소유자 발언이다. 상태 값의 뜻: **현행**은 지금 유효한 규칙, **대체됨**은 뒤 라운드가 바꾼 규칙(옛 문장을 원문 그대로 남긴다), **열림**은 18라운드 안건으로 넘어가 아직 정해지지 않은 것이다.

## 색인

| 번호 | 한 줄 요약 | 상태 | 닫은 사람 |
| --- | --- | --- | --- |
| GOAL-001 | 한 문장 — 무엇을 만드는가 | 현행 | 편집자 결정(2라운드, `00-goals.md:5` 소유자 발언의 재구성) |
| GOAL-002 | 00-goals의 표기 주의 — `&키`는 `controls.키`로 읽고 문서는 고치지 않음 | 현행 | 소유자 답(`reviews/round-15-decisions.md:9` 1), 소유자 답(`reviews/round-15-decisions.md:13` 5), 소유자 답(`reviews/round-15-decisions.md:15` 7), 편집자 결정(15라운드, `00-goals.md:3`) |
| GOAL-003 | G1 스키마는 공유 계약이다 — 판정의 동치 | 현행 | 소유자 답(`00-goals.md:141` G1), 편집자 결정(2라운드, `00-goals.md:5` 소유자 발언의 재구성) |
| GOAL-004 | G2 표준이 형상을 말하고 FE가 표현을 더한다 — 층의 분리 | 현행 | 소유자 답(`00-goals.md:142` G2, `00-goals.md:143` G2, `00-goals.md:144` G2), 편집자 결정(2라운드, `00-goals.md:5` 소유자 발언의 재구성) |
| GOAL-005 | G3 의미는 위임한다 — 재구현하지 않는다 | 현행 | 소유자 답(`00-goals.md:145` G3, `00-goals.md:146` G3), 편집자 결정(2라운드, `00-goals.md:5` 소유자 발언의 재구성) |
| GOAL-006 | G4 하나의 개념에는 하나의 장치 — 구조의 정합성 | 현행 | 소유자 답(`00-goals.md:147` G4, `00-goals.md:148` G4·G5), 편집자 결정(2라운드, `00-goals.md:5` 소유자 발언의 재구성) |
| GOAL-007 | 대체됨: G4의 "트리의 형태가 렌더링 선택에 좌우되지 않는다" | 대체됨(→ GOAL-008) | 편집자 결정(2라운드, `00-goals.md:5` 소유자 발언의 재구성) |
| GOAL-008 | G4를 좁힘 — 트리의 형태는 렌더링 런타임에 좌우되지 않는다 | 현행 | 소유자 답(`00-goals.md:116` 근거 발언), 편집자 결정(9라운드, `07-conclusions.md:72` 3.3 그대로) |
| GOAL-009 | G5 한 장으로 설명되는 라이프사이클 — 결정성 | 현행 | 소유자 답(`00-goals.md:148` G4·G5, `00-goals.md:149` G5), 편집자 결정(2라운드, `00-goals.md:5` 소유자 발언의 재구성) |
| GOAL-010 | G5의 "같은 쓰기 순서"는 정착 단위이고 batch는 쓰기 하나로 센다 | 현행 | 편집자 결정(9라운드, `07-conclusions.md:72` 3.1 그대로) |
| GOAL-011 | G6 정밀한 고속 제어 — 비용은 변경에 비례한다 | 현행 | 소유자 답(`00-goals.md:150` G6), 편집자 결정(2라운드, `00-goals.md:5` 소유자 발언의 재구성) |
| GOAL-012 | G7 반응의 척추를 보존한다 | 현행 | 소유자 답(`00-goals.md:151` G7), 편집자 결정(2라운드, `00-goals.md:5` 소유자 발언의 재구성) |
| GOAL-013 | G8 보편적인 관행을 따른다 | 현행 | 소유자 답(`00-goals.md:152` G8), 편집자 결정(2라운드, `00-goals.md:5` 소유자 발언의 재구성) |
| GOAL-014 | C1 BE 소유 스키마 위의 FE 표현 층 — 새 장치를 두지 않음 | 현행 | 소유자 답(`reviews/round-2.md:113` C1), 소유자 답(`00-goals.md:104` C1) |
| GOAL-015 | C2 작성자 실수의 가시성 — 채택 | 현행 | 소유자 답(`reviews/round-2.md:112` 목표 후보 C1–C8), 소유자 답(`00-goals.md:105` C2) |
| GOAL-016 | C3 프레임워크 독립적인 core — 채택과 core·렌더 계층의 경계 세부 | 현행 | 소유자 답(`reviews/round-2.md:114` C3), 소유자 답(`00-goals.md:106` C3, `00-goals.md:116`, `00-goals.md:117`) |
| GOAL-017 | C4 표준 스키마의 타입 수용과 추론 — 채택 | 현행 | 소유자 답(`reviews/round-2.md:112` 목표 후보 C1–C8), 소유자 답(`00-goals.md:107` C4) |
| GOAL-018 | C5 지원 방언 — 방언은 플러그인의 영역, 폼은 두 철자를 모두 읽음 | 현행 | 소유자 답(`reviews/round-2.md:112` 목표 후보 C1–C8), 소유자 답(`00-goals.md:108` C5) |
| GOAL-019 | C6 편집 중 상태의 보존과 격리 — 채택, 현행 유지 | 현행 | 소유자 답(`reviews/round-2.md:112` 목표 후보 C1–C8), 소유자 답(`00-goals.md:109` C6) |
| GOAL-020 | C7 확장 계약의 재설계 — 일시에 메이저 버전급 변경 | 현행 | 소유자 답(`reviews/round-2.md:112` 목표 후보 C1–C8), 소유자 답(`00-goals.md:110` C7) |
| GOAL-021 | C8 이행 경로 — 릴리즈 노트·배포 문서와 이행 프롬프트 | 현행 | 소유자 답(`reviews/round-2.md:112` 목표 후보 C1–C8), 소유자 답(`00-goals.md:111` C8) |
| GOAL-022 | 비목표 넷 | 현행(부정 결정) | 소유자 답(`00-goals.md:146` G3; 첫 글머리), 편집자 결정(2라운드, `00-goals.md:5` 소유자 발언의 재구성; 둘째–넷째 글머리) |
| GOAL-023 | 목표 사이의 긴장 G3 ↔ G6 — 가드 비용의 측정과 역색인 | 현행 | 편집자 결정(3–5라운드 기록, `reviews/round-1.md:28` 측정, `adr/0009-performance-budget-and-benchmarks.md:53`) |
| GOAL-024 | 목표 사이의 긴장 G5 ↔ G6, G5 ↔ G7, G2 ↔ G1 | 현행 | 편집자 결정(2라운드, `00-goals.md:130-135`) |
| GOAL-025 | P1 판정은 검증기의 것이다 | 현행 | 소유자 답(`00-goals.md:141` G1, `00-goals.md:145` G3), 편집자 결정(9라운드 문구 통과 갈음, `03-mental-model.md:222`) |
| GOAL-026 | P1′ 폼이 스키마에서 읽는 것은 노드 트리의 모양을 정하는 문법뿐 | 현행 | 소유자 답(`reviews/round-5-derivations.md:7` P1′), 소유자 답(`reviews/round-12-owner-answers.md:10` 3 꺼질 때 값 정책), 소유자 답(`reviews/round-15-decisions.md:13` 5), 소유자 답(`reviews/round-13-owner-answers.md:8` 2 나감 비움 기본값) |
| GOAL-027 | P1′의 분기 문장 — 게이트 없이 분기를 고르지 않음, 게이트는 둘뿐 | 현행 | 소유자 답(`reviews/round-10-owner-answers.md:9` A-3), 소유자 답(`reviews/round-10-owner-answers.md:11` B-22), 편집자 결정(11라운드 확인 목록, `03-mental-model.md:21`) |
| GOAL-028 | P2 원본은 호출자와 작성자만 쓴다 | 현행 | 소유자 답(`reviews/round-2.md:119` 새 원칙, `reviews/round-9-spec.md:24` 축6), 소유자 답(`reviews/round-9-spec.md:52` 읽기2 채우기 원천, `reviews/round-9-spec.md:56` 읽기2 시점(A/B)), 소유자 답(`reviews/round-13-owner-answers.md:8` 2 나감 비움 기본값), 소유자 답(`reviews/round-15-decisions.md:13` 5), 편집자 결정(9라운드 문구 통과 갈음, `03-mental-model.md:222`) |
| GOAL-029 | P3 형상은 상태의 순수 함수다 | 현행 | 소유자 답(`reviews/round-10-owner-answers.md:9` A-3; 선택 상태 제거), 편집자 결정(9라운드 문구 통과 갈음, `03-mental-model.md:222`) |
| GOAL-030 | P4 방출은 정책이다 | 현행 | 소유자 답(`reviews/round-13-owner-answers.md:8` 2 나감 비움 기본값), 편집자 결정(9라운드 문구 통과 갈음, `03-mental-model.md:222`) |
| GOAL-031 | P5 core는 렌더러를 모른다 | 현행 | 소유자 답(`reviews/round-2.md:114` C3), 소유자 답(`00-goals.md:117` C3 세부 3), 편집자 결정(9라운드 문구 통과 갈음, `03-mental-model.md:222`) |
| GOAL-032 | 원리의 위계 — P1이 가장 위, P2–P4는 쓰기·계산·읽기 | 현행 | 편집자 결정(5라운드, `03-mental-model.md:23`) |
| GOAL-033 | 소유자의 축 열 항목은 원리 위에 놓이고 충돌하면 이긴다 | 현행 | 편집자 결정(9라운드, `03-mental-model.md:25`의 원문 `reviews/round-9-spec.md` §1) |
| GOAL-034 | 축 1 폼은 JSON Schema 문법을 해석하지 않는다 — controls.discriminator 예외 | 현행 | 소유자 답(`reviews/round-9-spec.md:19` 축1), 소유자 답(`reviews/round-10-owner-answers.md:11` B-22), 소유자 답(`reviews/round-12-owner-answers.md:9` 2 명시 필수) |
| GOAL-035 | 축 2 조건에 쓰는 프로퍼티는 properties에 선언 — 컨벤션, 검사하지 않음 | 현행 | 소유자 답(`reviews/round-9-spec.md:20` 축2), 소유자 답(`reviews/round-10-owner-answers.md:40` E-19) |
| GOAL-036 | 축 3 then·oneOf·allOf·anyOf 블록에서 프로퍼티 노드를 선언할 수 있음 | 현행 | 소유자 답(`reviews/round-9-spec.md:21` 축3) |
| GOAL-037 | 축 4 JSON Schema 설정에 의한 변환은 값을 조작하지 않음과 그 읽기 | 현행 | 소유자 답(`reviews/round-9-spec.md:22` 축4), 소유자 답(`reviews/round-9-spec.md:56` 읽기2 시점(A/B)), 편집자 결정(9라운드 읽기, `07-conclusions.md:80`), 소유자 답(`reviews/round-13-owner-answers.md:8` 2 나감 비움 기본값) |
| GOAL-038 | 축 5 노드의 현재 제약을 최신화해 제공할 의무는 폼이 짐 | 현행 | 소유자 답(`reviews/round-9-spec.md:23` 축5) |
| GOAL-039 | 축 6 controls의 키는 값을 제어하는 층 | 현행 | 소유자 답(`reviews/round-9-spec.md:24` 축6), 소유자 답(`reviews/round-15-decisions.md:13` 5) |
| GOAL-040 | 축 7 JSON Schema 표현은 controls 표현으로 대체할 수 있어야 함 | 현행 | 소유자 답(`reviews/round-9-spec.md:25` 축7), 소유자 답(`reviews/round-15-decisions.md:13` 5) |
| GOAL-041 | 축 8 controls의 식과 injectTo는 예약어 — 동작 위계와 이름 컨벤션 | 현행 | 소유자 답(`reviews/round-9-spec.md:26` 축8), 소유자 답(`reviews/round-15-decisions.md:13` 5) |
| GOAL-042 | 축 9 폼 전용 키는 그룹 객체 셋 안에만 — 평면 & 축약과 computed 별칭 없음 | 현행 | 소유자 답(`reviews/round-15-decisions.md:13` 5), 소유자 답(`03-mental-model.md:37` 소유자 인용) |
| GOAL-043 | 대체됨: 축 9 computed와 &를 함께 제공하는 쪽을 선호(9라운드) | 대체됨(→ GOAL-042) | 소유자 답(`reviews/round-9-spec.md:27` 축9) |
| GOAL-044 | 축 10 글로벌·로컬 설정 — 13라운드 개정으로 코어에는 글로벌 잠금 없음 | 현행 | 소유자 답(`reviews/round-9-spec.md:28` 축10), 소유자 답(`reviews/round-10-owner-answers.md:12` B-12), 소유자 답(`reviews/round-13-owner-answers.md:7` 1 잠금 규칙), 소유자 답(`reviews/round-13-owner-answers.md:16` Form 속성의 자리) |
| GOAL-045 | 소유자의 요약 발언 — controls와 if/then/else로 JSON만으로도 동작하는 구조 | 현행 | 소유자 답(`reviews/round-9-spec.md:32` 요약 발언), 편집자 결정(15라운드, `03-mental-model.md:40` `&`를 `controls`로 읽음) |
| GOAL-046 | 소유자의 답 읽기 1 — oneOf·anyOf는 진짜 검증 조건 | 현행 | 소유자 답(`reviews/round-9-spec.md:42` 읽기1, `reviews/round-9-spec.md:44` 읽기1(이어서)) |
| GOAL-047 | 소유자의 답 읽기 2 — 채우기·바꾸기·지우기 모두 가능, 채움의 원천과 시점 | 현행 | 소유자 답(`reviews/round-9-spec.md:48` 읽기2, `reviews/round-9-spec.md:52` 읽기2 채우기 원천, `reviews/round-9-spec.md:56` 읽기2 시점(A/B)) |
| GOAL-048 | 소유자의 답 읽기 3 — 코어의 상태 키는 그 노드에만, 나감 비움 정책은 하위 트리로 | 현행 | 소유자 답(`reviews/round-9-spec.md:60` 읽기3), 소유자 답(`reviews/round-10-owner-answers.md:25` E-13), 소유자 답(`reviews/round-13-owner-answers.md:7` 1 잠금 규칙), 소유자 답(`reviews/round-17-owner-answers.md:10` R17-2) |
| GOAL-049 | 다섯 가치 — 일관성·투명성·예측가능성·표현자유도와 받치는 목표·원리 | 현행 | 소유자 답(`reviews/round-14-values-check.md:3` 소유자 지시), 편집자 결정(14라운드, `08-design-a-to-z.md:29-37` 뜻과 받치는 목표·원리) |
| GOAL-050 | 다섯 가치 — 고속성(최소 생성·메모리 안정·캐싱) | 현행 | 소유자 답(`reviews/round-16-owner-answers.md:16` 10) |
| GOAL-051 | 계승할 제약 — 오늘의 규칙이 지키는 현상은 그대로 지킴 | 현행 | 소유자 답(`04-inherited-constraints.md:3` 소유자 인용), 편집자 결정(4라운드, `04-inherited-constraints.md:5`) |
| GOAL-052 | T-1 타이핑은 같은 이벤트 핸들러 안에서 리렌더된다 | 현행 | 편집자 결정(4라운드, `04-inherited-constraints.md:5` 수용 기준 검토) |
| GOAL-053 | T-2 타이핑은 입력을 리마운트하지 않는다 | 현행 | 편집자 결정(4라운드, `04-inherited-constraints.md:5` 수용 기준 검토), 편집자 결정(4라운드, `reviews/round-4.md:128` F7) |
| GOAL-054 | T-3 가상화된 노드는 포커스·선택 명령으로 즉시 드러난다 | 현행 | 편집자 결정(4라운드, `04-inherited-constraints.md:5` 수용 기준 검토) |
| GOAL-055 | T-4 순환은 상한에서 멈춘다 — 정착 예산과 사슬 끝의 동기 throw | 현행 | 편집자 결정(4라운드, `04-inherited-constraints.md:5` 수용 기준 검토), 소유자 답(`reviews/round-1.md:179` 순환은 돌려 보고 터뜨린다), 소유자 답(`reviews/round-17-owner-answers.md:9` R17-1) |
| GOAL-056 | T-5 두 단계 단언 — 새 설계는 단일 단계로 다시 씀 | 현행 | 편집자 결정(4라운드, `04-inherited-constraints.md:5` 수용 기준 검토) |
| GOAL-057 | T-6 늦은 구독자는 놓친 것을 알 수 있다 | 현행 | 편집자 결정(4라운드, `04-inherited-constraints.md:5` 수용 기준 검토) |
| GOAL-058 | T-7 배열 연산은 동기다 | 현행 | 편집자 결정(4라운드, `04-inherited-constraints.md:5` 수용 기준 검토) |
| GOAL-059 | T-8 사용자 주입 컴포넌트는 격리된다 | 현행 | 편집자 결정(4라운드, `04-inherited-constraints.md:5` 수용 기준 검토) |
| GOAL-060 | T-9 루트 onChange는 최외곽 동기 진입당 1회, 디바운스 없음 | 현행 | 편집자 결정(4라운드, `04-inherited-constraints.md:5` 수용 기준 검토), 소유자 답(`reviews/round-4.md:116` D-10) |
| GOAL-061 | T-10 blur의 Touched 지연 — 렌더 계층, 그대로 | 현행 | 편집자 결정(4라운드, `04-inherited-constraints.md:5` 수용 기준 검토) |
| GOAL-062 | T-11 렌더 중의 값 읽기는 계산하지 않는다 | 현행 | 편집자 결정(4라운드, `04-inherited-constraints.md:5` 수용 기준 검토) |
| GOAL-063 | T-12 자동 쓰기는 null 조상을 객체로 만들지 않는다 | 현행 | 편집자 결정(4라운드, `04-inherited-constraints.md:5` 수용 기준 검토) |
| GOAL-064 | T-13 검증 결과는 세대 토큰으로 걸러진다 — revision 스탬프 | 현행 | 편집자 결정(4라운드, `04-inherited-constraints.md:5` 수용 기준 검토) |
| GOAL-065 | T-14 같은 틱 재진입 injectTo 가드 — 파생 라운드 상한으로 대체 | 현행 | 편집자 결정(4라운드, `04-inherited-constraints.md:5` 수용 기준 검토) |
| GOAL-066 | T-15 한 번 드러난 가상화 노드는 placeholder로 돌아가지 않는다 | 현행 | 편집자 결정(4라운드, `04-inherited-constraints.md:5` 수용 기준 검토) |
| GOAL-067 | T-16 Deferrable 래퍼 여부는 생성 시점에 고정 | 현행 | 편집자 결정(4라운드, `04-inherited-constraints.md:5` 수용 기준 검토) |
| GOAL-068 | T-17 포커스·선택 명령의 대상 선택자 | 현행 | 편집자 결정(4라운드, `04-inherited-constraints.md:5` 수용 기준 검토) |
| GOAL-069 | T-18 RequestRemount 유지 | 현행 | 편집자 결정(4라운드, `04-inherited-constraints.md:5` 수용 기준 검토), 소유자 답(`reviews/round-4.md:115` D-9) |
| GOAL-070 | T-19 defaultValue와 jsonSchema의 deep clone — 호출자의 객체를 바꾸지 않는 계약 | 현행 | 편집자 결정(4라운드, `04-inherited-constraints.md:5` 수용 기준 검토) |
| GOAL-071 | T-20 초기화 순서 — 생성이 곧 첫 정착 | 현행 | 편집자 결정(4라운드, `04-inherited-constraints.md:5` 수용 기준 검토) |
| GOAL-072 | 대체됨: T-21 reset()의 key=version 전체 리마운트 — 16라운드에 reset은 로드, 입력 단위 다시 마운트로 바뀜 | 대체됨(→ LANDING-039, WRITE-042, EVENT-039, REACT-019) | 편집자 결정(4라운드, `04-inherited-constraints.md:5` 수용 기준 검토) |
| GOAL-073 | T-22 배열 아이템의 React key는 생성 순서의 nonce | 현행 | 편집자 결정(4라운드, `04-inherited-constraints.md:5` 수용 기준 검토) |
| GOAL-074 | T-23 분기 복원은 원본 배열 상태 우선 — 구조로 흡수 | 현행 | 편집자 결정(4라운드, `04-inherited-constraints.md:5` 수용 기준 검토) |
| GOAL-075 | 새 설계에서 사라지는 장치와 그 이유 | 현행(부정 결정) | 편집자 결정(4라운드, `04-inherited-constraints.md:48-49` F23·F27) |
| GOAL-076 | 실제 브라우저의 IME 조합 중 쓰기 확인 | 열림(→ `reviews/round-18-agenda.md:111`) | 편집자 결정(18라운드 안건 이관, `reviews/round-18-agenda.md:111`) |
| GOAL-077 | 대체됨: P1′의 6차 문구(다중 타입, oneOf·anyOf 분기, & 명령뿐) | 대체됨(→ GOAL-026) | 소유자 답(`reviews/round-5-derivations.md:7` P1′) |
| GOAL-078 | 대체됨: P2의 6차 문구(쓰는 주체 넷) | 대체됨(→ GOAL-028) | 편집자 결정(8라운드, `06-conclusions.md:70`) |
| GOAL-079 | 대체됨: P3의 6차 문구(선택 상태를 입력으로 둠) | 대체됨(→ GOAL-029) | 편집자 결정(8라운드, `06-conclusions.md:71`) |
| GOAL-080 | 대체됨: 06 §3.2 P2의 문구 제안(자동 쓰기는 로드 계약과 injectTo·&derived뿐) | 대체됨(→ GOAL-081, GOAL-028) | 편집자 결정(8라운드, `06-conclusions.md:98`) |
| GOAL-081 | 대체됨: 07 §3.2 P2의 문구(&default·&derived·&injectTo·&unsetValue) | 대체됨(→ GOAL-028) | 편집자 결정(9라운드, `07-conclusions.md:74`) |
| GOAL-082 | 대체됨: 06 §3.4 판별식 식별의 const·enum 읽기를 형상 읽기에 넣는 괄호 | 대체됨(→ GOAL-034, GOAL-027) | 소유자 답(`reviews/round-6-coherence.md:144` 소유자 인용), 편집자 결정(8라운드, `06-conclusions.md:102`) |
| GOAL-083 | 원리 제안 P6–P9의 처리 — 새 원리로 두지 않음 | 현행(기록) | 스웜 수렴(편집자 결정, `06-conclusions.md:209-216`), 소유자 답(`HANDOFF.md:17` 7라운드 소유자 지시) |
| GOAL-084 | 플러그인 FormTypeInput이 동기 UpdateValue나 Promise 배열 API에 기대는지 확인 | 열림(→ `reviews/round-18-agenda.md:139` 11-8) | 편집자 결정(4라운드, `04-inherited-constraints.md:51` 아직 확인하지 않은 것) |
| GOAL-085 | 용어 — 쓰는 주체 셋(작성자·호출자·사용자)의 뜻 | 현행 | 편집자 결정(14라운드, `08-design-a-to-z.md:9` 용어), 편집자 결정(15라운드, `08-design-a-to-z.md:13` 그룹 객체 셋 표기) |
| GOAL-086 | 가치끼리 부딪히는 자리에서 설계가 고른 쪽 — 충돌 넷 | 현행 | 스웜 수렴(편집자 결정, `reviews/raw-round14-antigravity.md:26-31`; 앞 세 행), 편집자 결정(14라운드 가치 검토, `08-design-a-to-z.md:520`), 편집자 결정(15라운드, `08-design-a-to-z.md:527` 그룹 셋 대체 표기) |
| GOAL-087 | C3 남은 세부 — 스키마 타입의 컴포넌트 자리를 core가 불투명하게 다루고 바인딩 계층이 타입을 입히는 방법 | 열림(→ `reviews/round-18-agenda.md:140` 11-9) | 편집자 결정(2라운드, `open-questions.md:58` Q8) |

## 항목

### GOAL-001 한 문장 — 무엇을 만드는가

- 결정:
  > 표준 JSON Schema를 **그대로** 받아, 표준 검증기와 **같은 판정**을 내리면서, 큰 폼을 **변경에 비례하는 비용**으로 움직이는, **한 장으로 설명되는** 폼 엔진.
- 보충: 없음
- 상태: 현행
- 출처: `00-goals.md:15`(정본), `08-design-a-to-z.md:27`
- 닫은 사람: 편집자 결정(2라운드, `00-goals.md:5` 소유자 발언의 재구성)
- 라운드: 2
- 까닭: `00-goals.md:9-11`

### GOAL-002 00-goals의 표기 주의 — `&키`는 `controls.키`로 읽고 문서는 고치지 않음

- 결정:
  > 표기 주의(15라운드). 이 문서의 `&키`·`control` 표기는 `controls.키` 그룹 표기로 바뀌었고, 조각 식의 기준점은 호스트(`./x`)가 되었으며, 맨 폼 전용 키는 `options`·`presentation` 그룹으로 옮겨졌다. 이 문서는 그때의 기록이라 고치지 않는다. 살아 있는 규칙은 `03-mental-model.md`와 `08-design-a-to-z.md`, 결정은 `reviews/round-15-decisions.md`에 있다.
- 보충: 없음
- 상태: 현행
- 출처: `00-goals.md:3`(정본), `06-conclusions.md:3`, `07-conclusions.md:3`, `reviews/round-15-apply-spec.md:46,79`
- 닫은 사람: 소유자 답(`reviews/round-15-decisions.md:9` 1), 소유자 답(`reviews/round-15-decisions.md:13` 5), 소유자 답(`reviews/round-15-decisions.md:15` 7), 편집자 결정(15라운드, `00-goals.md:3`)
- 라운드: 15
- 까닭: `03-mental-model.md:37`

### GOAL-003 G1 스키마는 공유 계약이다 — 판정의 동치

- 결정:
  > 폼의 유효성 판정은 독립 표준 검증기가 같은 스키마와 같은 값에 내리는 판정과 같다. 폼이 통과시킨 값을 서버가 기각하는 일은 없다. 이 성질은 기능별 규율이 아니라 구조로 보장된다.
  > - 스키마의 소유자가 FE든 BE든 동작이 같다.
  > - 폼에 들어오는 경로(`<Form>`이든 core를 직접 쓰든)가 달라도 계약이 같다.
  > - 폼이 더 엄격해지는 것은 허용되지만, 표준 판정에 AND로 덧붙는 형태로만이다.
  > → ADR 0001
- 보충: 없음
- 상태: 현행
- 출처: `00-goals.md:19-27`(정본), `00-goals.md:11`, `06-conclusions.md:77`, `HANDOFF.md:31`
- 닫은 사람: 소유자 답(`00-goals.md:141` G1), 편집자 결정(2라운드, `00-goals.md:5` 소유자 발언의 재구성)
- 라운드: 2
- 까닭: `00-goals.md:9-11`

### GOAL-004 G2 표준이 형상을 말하고 FE가 표현을 더한다 — 층의 분리

- 결정:
  > 폼의 동작은 세 층으로 나뉘고, 아래층은 위층을 모른다.
  > | 층 | 어휘 | 정하는 것 |
  > | -- | ---- | --------- |
  > | 유효성 | 표준 JSON Schema | 값이 옳은가 |
  > | 형상 | 표준 JSON Schema의 조건·합성 구문 (+ 사용자의 분기 선택) | 어떤 필드가 존재하는가, 각 필드의 제약은 무엇인가 |
  > | 표현 | FE 전용 어휘 (`&`) | 어떻게 보이고 어떻게 반응하는가 |
  > - BE가 선언한 스키마를 아무 가공 없이 넣어도 쓸 만한 폼이 나온다.
  > - FE가 표현 층을 더하면 폭넓은 표현이 가능하다. 지금의 동적 표현식 시스템이 주는 표현력은 줄어들지 않는다. 표현 층은 값을 바꿀 수는 있어도 판정에는 닿지 못한다.
  > - 무엇이 FE 전용인지는 기계적으로 가려진다.
  > → ADR 0002, 0003
- 보충:
  > "이 문서의 `&키`·`control` 표기는 `controls.키` 그룹 표기로 바뀌었고, 조각 식의 기준점은 호스트(`./x`)가 되었으며, 맨 폼 전용 키는 `options`·`presentation` 그룹으로 옮겨졌다." (`00-goals.md:3`)
- 상태: 현행
- 출처: `00-goals.md:29-43`(정본), `06-conclusions.md:78`
- 닫은 사람: 소유자 답(`00-goals.md:142` G2, `00-goals.md:143` G2, `00-goals.md:144` G2), 편집자 결정(2라운드, `00-goals.md:5` 소유자 발언의 재구성)
- 라운드: 2
- 까닭: `00-goals.md:9`

### GOAL-005 G3 의미는 위임한다 — 재구현하지 않는다

- 결정:
  > 값이 스키마를 만족하는지는 언제나 검증기 구현체가 답한다. 폼은 스키마의 구조(무엇이 어디에 선언되어 있는가)만 읽는다. 스펙 준수는 검증기의 책임이고 스키마 선언은 작성자의 책임이다. 폼이 독자 스펙을 떠안지 않는다.
  > - 검증기는 교체 가능한 플러그인으로 남는다. 폼은 검증기를 내장하지 않는다.
  > - 같은 개념을 평가하는 장치는 하나다.
  > → ADR 0004, 0005
- 보충: 없음
- 상태: 현행
- 출처: `00-goals.md:45-52`(정본), `03-mental-model.md:13`
- 닫은 사람: 소유자 답(`00-goals.md:145` G3, `00-goals.md:146` G3), 편집자 결정(2라운드, `00-goals.md:5` 소유자 발언의 재구성)
- 라운드: 2
- 까닭: `00-goals.md:9`

### GOAL-006 G4 하나의 개념에는 하나의 장치 — 구조의 정합성

- 결정:
  > 노드 트리의 구성, 특히 자식을 가진 노드(object·array)가 자식을 만들고 켜고 끄는 방식을 하나의 모델로 다시 짠다. 합목적적이고, 특수 경로가 없고, 읽는 사람이 예측할 수 있어야 한다.
  > - 조건부로 형상을 바꾸는 모든 구문이 같은 장치와 같은 라이프사이클을 탄다.
  > - object와 array는 "자식의 집합이 어디서 오는가"만 다르고 나머지는 같은 모델을 따른다.
  > - 값은 한 곳에만 있다.
  > → ADR 0005, 0006, 0011
- 보충: 없음
- 상태: 현행
- 출처: `00-goals.md:54-63`(정본; 61행은 GOAL-007), `06-conclusions.md:79`
- 닫은 사람: 소유자 답(`00-goals.md:147` G4, `00-goals.md:148` G4·G5), 편집자 결정(2라운드, `00-goals.md:5` 소유자 발언의 재구성)
- 라운드: 2
- 까닭: `00-goals.md:147-148`

### GOAL-007 대체됨: G4의 "트리의 형태가 렌더링 선택에 좌우되지 않는다"

- 결정:
  > - 트리의 형태가 렌더링 선택에 좌우되지 않는다(현재는 좌우된다 — `01-current-structure.md` §6).
- 보충: 없음
- 상태: 대체됨(→ GOAL-008)
- 출처: `00-goals.md:61`(정본)
- 닫은 사람: 편집자 결정(2라운드, `00-goals.md:5` 소유자 발언의 재구성)
- 라운드: 2
- 까닭: `06-conclusions.md:100`

### GOAL-008 G4를 좁힘 — 트리의 형태는 렌더링 런타임에 좌우되지 않는다

- 결정:
  > **3.3 G4를 좁힌다.** "트리의 형태는 렌더링 런타임에 좌우되지 않는다"로 `00-goals.md` 59행을 고친다. 소유자의 발언(114행, 입력 컴포넌트 유무로 노드 종류가 달라지는 것은 의도된 기능)이 근거다. 목표 문장의 변경이라 확인이 필요하다.
- 보충: 없음
- 상태: 현행
- 출처: `06-conclusions.md:100`(정본), `reviews/round-6-coherence.md:209`, `reviews/round-7-convergence.md:76`, `07-conclusions.md:72`
- 닫은 사람: 소유자 답(`00-goals.md:116` 근거 발언), 편집자 결정(9라운드, `07-conclusions.md:72` 3.3 그대로)
- 라운드: 9
- 까닭: `00-goals.md:116`, `reviews/round-6-coherence.md:65`

### GOAL-009 G5 한 장으로 설명되는 라이프사이클 — 결정성

- 결정:
  > 쓰기 하나가 정착된 상태에 이르는 길은 하나이고, 순서가 고정되어 있으며, 동기다. 비동기는 경계(통지, 검증, React)에만 있다. 같은 스키마와 같은 쓰기 순서는 타이밍과 무관하게 같은 상태를 낸다.
  > - 소유자가 데이터의 흐름을 순서도 한 장으로 따라갈 수 있다.
  > - 구독자는 정착된 상태만 본다. 원인과 결과의 순서가 뒤집히지 않는다.
  > - 핵심 동작을 타이머 없이 테스트할 수 있다.
  > → ADR 0007
- 보충: 없음
- 상태: 현행
- 출처: `00-goals.md:65-73`(정본), `06-conclusions.md:80`
- 닫은 사람: 소유자 답(`00-goals.md:148` G4·G5, `00-goals.md:149` G5), 편집자 결정(2라운드, `00-goals.md:5` 소유자 발언의 재구성)
- 라운드: 2
- 까닭: `00-goals.md:148-149`

### GOAL-010 G5의 "같은 쓰기 순서"는 정착 단위이고 batch는 쓰기 하나로 센다

- 결정:
  > **3.1 G5의 "같은 쓰기 순서"는 정착 단위이고, `batch`는 쓰기 하나로 센다.**
  > `batch`는 타이밍이 아니라 호출자가 선언한 쓰기 단위다(G7, `adr/0008:72`). 이 읽기에서 "배치와 순차의 값 차이는 결함이 아니다"(4.3)가 나온다. 다르게 읽으면 "정착마다 없음인 `default`를 커밋한다"와 "커밋된 값은 뒤의 전환에서 덮지 않는다" 가운데 하나를 버려야 한다. 셋은 양립하지 않는다는 것이 독립 모델과 프로토타입 둘에서 실행으로 확인됐다.
- 보충: 없음
- 상태: 현행
- 출처: `06-conclusions.md:95-96`(정본), `07-conclusions.md:72`
- 닫은 사람: 편집자 결정(9라운드, `07-conclusions.md:72` 3.1 그대로)
- 라운드: 9
- 까닭: `06-conclusions.md:96`

### GOAL-011 G6 정밀한 고속 제어 — 비용은 변경에 비례한다

- 결정:
  > 패키지의 핵심 가치다. 어떤 동작의 비용은 폼의 크기가 아니라 그 동작이 바꾼 것의 크기에 비례한다. 계산할 필요가 없는 것은 계산하지 않는다.
  > - 대상 상황: 대규모 쓰기, 배치 작업, 빠른 연속 입력, 화면 전환(분기 전환·마운트).
  > - 같은 값을 두 번 읽으면 같은 참조다.
  > - 성능은 주장하지 않고 측정한다. 기존 구현이 기준선이고, 예산과 시나리오는 설계의 일부다.
  > - 번들 크기도 예산이다(현재 gzip 약 44KB).
  > → ADR 0009
- 보충: 없음
- 상태: 현행
- 출처: `00-goals.md:75-84`(정본), `06-conclusions.md:81`, `08-design-a-to-z.md:36`
- 닫은 사람: 소유자 답(`00-goals.md:150` G6), 편집자 결정(2라운드, `00-goals.md:5` 소유자 발언의 재구성)
- 라운드: 2
- 까닭: `00-goals.md:150`

### GOAL-012 G7 반응의 척추를 보존한다

- 결정:
  > 노드 단위의 구독, 이벤트 시그널링, 배치 갱신은 노드 트리의 축이자 대규모 폼을 빠르게 움직이는 장치다. 개편하되 없애지 않는다. 배치는 통지의 묶음에서 "쓰기 묶음 → 정착 1회 → 통지 1회"로 강해진다.
  > → ADR 0008
- 보충: 없음
- 상태: 현행
- 출처: `00-goals.md:86-90`(정본), `06-conclusions.md:82`
- 닫은 사람: 소유자 답(`00-goals.md:151` G7), 편집자 결정(2라운드, `00-goals.md:5` 소유자 발언의 재구성)
- 라운드: 2
- 까닭: `00-goals.md:151`

### GOAL-013 G8 보편적인 관행을 따른다

- 결정:
  > JSON Schema로 폼을 만드는 분야의 보편적이고 직관적인 관행과 UX를 조사해 흡수한다. 독자적인 방식은 보편적인 방식이 목표를 해칠 때에만 택한다.
  > → ADR 0010(작성 대기)
- 보충: 없음
- 상태: 현행
- 출처: `00-goals.md:92-96`(정본), `06-conclusions.md:83`
- 닫은 사람: 소유자 답(`00-goals.md:152` G8), 편집자 결정(2라운드, `00-goals.md:5` 소유자 발언의 재구성)
- 라운드: 2
- 까닭: `00-goals.md:152`

### GOAL-014 C1 BE 소유 스키마 위의 FE 표현 층 — 새 장치를 두지 않음

- 결정:
  > | # | 목표 | 소유자의 결정 |
  > | - | ---- | ------------- |
  > | C1 | **BE 소유 스키마 위에 FE의 표현 층을 얹는 수단** | **새 장치를 두지 않는다.** Form은 단일 `jsonSchema`를 받고, FE 전용 설정은 소비자가 넘기기 전에 merge한다. 직렬화할 수 없는 값(컴포넌트)의 통로는 이미 있다(`formTypeInputMap`, `formTypeInputDefinitions`). 소유자: "병합을 form이 해야 하는 의도를 모르겠다. 서버 스키마를 수정하지 않겠다는 의도 하나 때문에 이중 입구를 만드는 것 아닌가." 제안됐던 `overlay` prop은 철회했다(ADR 0012). 필요한 것은 merge 방법을 적은 문서다(C8) |
- 보충: 없음
- 상태: 현행
- 출처: `00-goals.md:104`(정본), `reviews/round-2.md:113`, `06-conclusions.md:89`
- 닫은 사람: 소유자 답(`reviews/round-2.md:113` C1), 소유자 답(`00-goals.md:104` C1)
- 라운드: 2
- 까닭: `00-goals.md:104`

### GOAL-015 C2 작성자 실수의 가시성 — 채택

- 결정:
  > | # | 목표 | 소유자의 결정 |
  > | - | ---- | ------------- |
  > | C2 | **작성자 실수의 가시성** — 폼 생성 시점의 오류, 개발 모드 경고, 주인 없는 검증 에러의 폼 수준 표시 | **채택.** "각종 에러들의 출력을 적당하게 제공해야 한다. 지금 에러 구조는 꽤 잘 짜여 있을 것이다. 그걸 확장하자." |
- 보충: 없음
- 상태: 현행
- 출처: `00-goals.md:105`(정본), `reviews/round-2.md:112`, `06-conclusions.md:84`, `08-design-a-to-z.md:34`
- 닫은 사람: 소유자 답(`reviews/round-2.md:112` 목표 후보 C1–C8), 소유자 답(`00-goals.md:105` C2)
- 라운드: 2
- 까닭: `00-goals.md:100`

### GOAL-016 C3 프레임워크 독립적인 core — 채택과 core·렌더 계층의 경계 세부

- 결정:
  > | # | 목표 | 소유자의 결정 |
  > | - | ---- | ------------- |
  > | C3 | **프레임워크 독립적인 core** | **채택.** "원래 core만 떼어내서 mjs 환경에서 쓸 수 있도록 추상화했고, vue나 svelte 같은 다른 플랫폼에 이식될 수 있는 코어 모듈로 설계한 게 맞다. react 메인으로 쓰다 보니 react 관련 타입이 많이 붙었는데, 걷어낼 수 있으면 좋겠다." 세부는 아래 |
  > 1. **core는 React를 모른다.** 런타임 import도, 타입도. 스키마 타입의 컴포넌트 자리는 core에서 불투명한 값이고, React에 특화된 타입은 바인딩 계층이 입힌다.
  > **인라인 `FormTypeInput`을 꽂으면 자식 노드가 사라지는 것은 의도된 기능이다.**
  > 소유자: "브랜치 노드의 터미널 전략이 압도적으로 저렴해서, 사용자가 되도록 터미널 전략을 쓰게 하려고 설계한 방법. 1종 오류를 감수하고 2종 오류를 배제한 선택." 난해하거나 혼란이 있으면(꽂은 입력이 `ChildNodeComponents`를 쓰는 경우) 끊어도 되고, 그러면 터미널로 쓰려는 사용자는 명시적으로 `terminal: true`를 준다.
  > 3. **명령 어휘(`RequestFocus`/`RequestSelect`/`RequestRefresh`)는 core에 남는다.** 소유자: "렌더러 독립적인, html 관련 어휘고 코어 동작에 영향을 주지 않는다. mjs 환경에서도 그게 컴포넌트 같은 렌더러가 아닐 뿐이지 데이터 표현 계층이라는 측면에서 보면 틀린 표현이 아니다."
- 보충: 없음
- 상태: 현행
- 출처: `00-goals.md:106`(정본), `00-goals.md:113-117`, `reviews/round-2.md:114`, `HANDOFF.md:38`
- 닫은 사람: 소유자 답(`reviews/round-2.md:114` C3), 소유자 답(`00-goals.md:106` C3, `00-goals.md:116`, `00-goals.md:117`)
- 라운드: 2
- 까닭: `00-goals.md:116-117`

### GOAL-017 C4 표준 스키마의 타입 수용과 추론 — 채택

- 결정:
  > | # | 목표 | 소유자의 결정 |
  > | - | ---- | ------------- |
  > | C4 | **표준 스키마의 타입 수용과 추론** | **채택.** "이외에도 JSONSchema 관련 타입 오류는 모두 수정을 원한다. 개발 과정에서 발견되는 것이든 뭐든." |
- 보충: 없음
- 상태: 현행
- 출처: `00-goals.md:107`(정본), `reviews/round-2.md:112`
- 닫은 사람: 소유자 답(`reviews/round-2.md:112` 목표 후보 C1–C8), 소유자 답(`00-goals.md:107` C4)
- 라운드: 2
- 까닭: `00-goals.md:100`

### GOAL-018 C5 지원 방언 — 방언은 플러그인의 영역, 폼은 두 철자를 모두 읽음

- 결정:
  > | # | 목표 | 소유자의 결정 |
  > | - | ---- | ------------- |
  > | C5 | 지원 방언의 범위 | **질문이 부정확했다.** 검증의 방언은 플러그인의 영역이다(소유자의 지적). 폼이 정할 것은 구조를 읽을 때 아는 철자뿐이고, 방언 스위치 없이 **두 철자를 모두 읽는다** — `items: [..]`와 `prefixItems`, `definitions`와 `$defs`, (Q7을 채택하면) `dependencies`와 `dependentSchemas`. `open-questions.md` Q9 닫힘 |
- 보충:
  > "| `dependentSchemas`·`dependentRequired`·`dependencies`를 게이트와 조각의 모델로 환원할지(Q7) | `open-questions.md:54-56`, `adr/0002-guard-fragment-model.md:198`, `08-design-a-to-z.md:451`(§15) | PR-1 | 설계 결정 |" (`reviews/round-18-agenda.md:15`)
- 상태: 현행
- 출처: `00-goals.md:108`(정본), `reviews/round-2.md:112`
- 닫은 사람: 소유자 답(`reviews/round-2.md:112` 목표 후보 C1–C8), 소유자 답(`00-goals.md:108` C5)
- 라운드: 2
- 까닭: `00-goals.md:100`

### GOAL-019 C6 편집 중 상태의 보존과 격리 — 채택, 현행 유지

- 결정:
  > | # | 목표 | 소유자의 결정 |
  > | - | ---- | ------------- |
  > | C6 | **편집 중 상태의 보존과 격리** | **채택, 현행 유지.** "input을 건드렸을 때(touched), 값이 바뀌었을 때(dirty)를 기준으로 조합 조건을 갖고 있고 지금 구현도 그렇다. 이건 바뀌지 않길 바란다." 구현은 ADR 0006·0007 |
- 보충: 없음
- 상태: 현행
- 출처: `00-goals.md:109`(정본), `reviews/round-2.md:112`
- 닫은 사람: 소유자 답(`reviews/round-2.md:112` 목표 후보 C1–C8), 소유자 답(`00-goals.md:109` C6)
- 라운드: 2
- 까닭: `00-goals.md:100`

### GOAL-020 C7 확장 계약의 재설계 — 일시에 메이저 버전급 변경

- 결정:
  > | # | 목표 | 소유자의 결정 |
  > | - | ---- | ------------- |
  > | C7 | **확장 계약의 재설계** | **채택.** "스키마폼 관련 모든 버전은 일시에 메이저 버전급 변경을 진행한다." `@canard/schema-form`과 플러그인 패키지 전부가 함께 올라간다 |
- 보충: 없음
- 상태: 현행
- 출처: `00-goals.md:110`(정본), `reviews/round-2.md:112`
- 닫은 사람: 소유자 답(`reviews/round-2.md:112` 목표 후보 C1–C8), 소유자 답(`00-goals.md:110` C7)
- 라운드: 2
- 까닭: `00-goals.md:100`

### GOAL-021 C8 이행 경로 — 릴리즈 노트·배포 문서와 이행 프롬프트

- 결정:
  > | # | 목표 | 소유자의 결정 |
  > | - | ---- | ------------- |
  > | C8 | **이행 경로** | **채택, 두 층위로.** (1) 릴리즈 노트와 배포 문서 — 수정의 의도와 목표, 기존 사용 방법별 대체 용법. (2) **그 수정을 수행할 수 있는 프롬프트** — 에이전트가 소비자의 맥락에 맞게 고칠 수 있도록. 이 패키지는 이미 `docs/agents` 자산을 에이전트에 주입하는 장치(`@slats/agents-assets-sync`)를 갖고 있어 이행 프롬프트를 같은 경로로 배포할 수 있다 |
- 보충: 없음
- 상태: 현행
- 출처: `00-goals.md:111`(정본), `reviews/round-2.md:112`, `06-conclusions.md:85`
- 닫은 사람: 소유자 답(`reviews/round-2.md:112` 목표 후보 C1–C8), 소유자 답(`00-goals.md:111` C8)
- 라운드: 2
- 까닭: `00-goals.md:100`

### GOAL-022 비목표 넷

- 결정:
  > - JSON Schema 검증기를 구현하지 않는다.
  > - 작성자의 실수를 폼 내부 검증으로 메우지 않는다(#340 구현 브랜치를 폐기한 이유).
  > - 기존 동작과의 호환 계층을 두지 않는다. 소유자는 완전한 파괴적 변경을 각오하고 있으며, 범위는 기능과 흐름상의 이점으로 판단한다.
  > - 기존 테스트를 회귀 오라클로 쓰지 않는다. 테스트는 새로 구성한다(`02-target-overview.md` §5). 기존 구현은 성능의 기준선으로만 쓴다.
- 보충:
  > "예외: 조합과 옛 키가 없는 17파일은 기대값을 이름만 바꿔 e2e의 추가 단언으로 살린다(16라운드 답 7, 09 §4.3)." (`08-design-a-to-z.md:608`)
- 상태: 현행(부정 결정)
- 출처: `00-goals.md:119-124`(정본)
- 닫은 사람: 소유자 답(`00-goals.md:146` G3; 첫 글머리), 편집자 결정(2라운드, `00-goals.md:5` 소유자 발언의 재구성; 둘째–넷째 글머리)
- 라운드: 2
- 까닭: `00-goals.md:122-123`

### GOAL-023 목표 사이의 긴장 G3 ↔ G6 — 가드 비용의 측정과 역색인

- 결정:
  > - **G3 ↔ G6.** 가드를 검증기에 위임하면 호출 비용이 생기고, 폼이 `if`의 내부를 읽지 않으면 의존 경로를 모른다. 측정(ADR 0009): 루트에 걸린 가드 200개를 키 입력마다 전부 돌려도 7.9 µs이고, "가드가 걸린 객체의 참조가 그대로면 건너뛴다"는 루트 가드에 효과가 없다. 유효한 것은 변경 경로 → 가드의 역색인뿐이며, 이것도 측정이 필요를 보일 때만 넣는다.
- 보충: 없음
- 상태: 현행
- 출처: `00-goals.md:132`(정본), `adr/0009-performance-budget-and-benchmarks.md:53`, `reviews/round-1.md:28`
- 닫은 사람: 편집자 결정(3–5라운드 기록, `reviews/round-1.md:28` 측정, `adr/0009-performance-budget-and-benchmarks.md:53`)
- 라운드: 5
- 까닭: `reviews/round-1.md:28`

### GOAL-024 목표 사이의 긴장 G5 ↔ G6, G5 ↔ G7, G2 ↔ G1

- 결정:
  > - **G5 ↔ G6.** 동기 작업 루프는 쓰기 한 번의 작업량을 늘릴 수 있다. 해소: 건너뛰기가 설계의 일부다 — 참조가 그대로인 가드, dirty 표시가 없는 서브트리, 의존 값이 그대로인 표현식.
  > - **G5 ↔ G7.** 이벤트가 내부 상태를 움직이지 않게 되는 것은 척추를 없애는 것이 아니다. 구독·시그널링·`revision`은 남고, 바뀌는 것은 "내부 로직은 이벤트를 구독하지 않는다" 하나다.
  > - **G2 ↔ G1.** 표현 층이 값을 지울 수 있다(`&active`). 판정은 방출 값에 대해 내려지므로 계약은 깨지지 않지만, 그 결과 값이 invalid가 되는 것은 작성자의 책임이다.
- 보충:
  > "이 문서의 `&키`·`control` 표기는 `controls.키` 그룹 표기로 바뀌었고, 조각 식의 기준점은 호스트(`./x`)가 되었으며, 맨 폼 전용 키는 `options`·`presentation` 그룹으로 옮겨졌다." (`00-goals.md:3`)
- 상태: 현행
- 출처: `00-goals.md:133-135`(정본)
- 닫은 사람: 편집자 결정(2라운드, `00-goals.md:130-135`)
- 라운드: 2
- 까닭: `00-goals.md:133-135`

### GOAL-025 P1 판정은 검증기의 것이다

- 결정:
  > | # | 원리 | 한 문장 | 근원 |
  > | - | ---- | ------- | ---- |
  > | P1 | **판정은 검증기의 것이다** | 폼은 스키마의 뜻을 해석하지 않는다. 폼의 판정 = `validator(작성된 스키마, 방출 값)`. 폼이 스키마에서 읽는 것은 **형상**(어떤 노드가 있는가)을 만드는 데 필요한 최소한이다 | G1, G3, ADR 0001·0004 |
- 보충: 없음
- 상태: 현행
- 출처: `03-mental-model.md:13`(정본), `06-conclusions.md:68`, `08-design-a-to-z.md:47`
- 닫은 사람: 소유자 답(`00-goals.md:141` G1, `00-goals.md:145` G3), 편집자 결정(9라운드 문구 통과 갈음, `03-mental-model.md:222`)
- 라운드: 9
- 까닭: `03-mental-model.md:13`(근원 칸)

### GOAL-026 P1′ 폼이 스키마에서 읽는 것은 노드 트리의 모양을 정하는 문법뿐

- 결정:
  > **P1′ (소유자, 2026-09-23).** 폼이 스키마에서 읽는 것은 **노드 트리의 모양을 정하는 문법뿐**이다 — 타입(`type`, 튜플. 다중 `type`은 §6의 설계 항목), 자식의 존재(`properties`, `items`, `prefixItems`), 조건부 존재(`if/then/else`, `allOf` 항목). 값의 유효성을 정하는 문법(`required`, `false`, `not`, `additionalProperties`, 범위·패턴)은 검증기의 것이고, 폼은 그 판정을 **보여 줄 뿐** 값을 고치지 않는다. 값을 빼거나 지우는 것은 작성자의 `controls`의 명령과, 호출자가 Form 속성으로 켠 나감 정책뿐이다(둘 다 P2의 쓰기 주체다. 폼이 스스로 지우는 일은 없다). 소유자의 말: "그걸 바랐다면 ajv autofix 같은 걸 쓰지 않았을까. … 값 수정은 안 하고 에러만 보여주는 걸 기본 동작으로 하려고 했다."
- 보충: 없음
- 상태: 현행
- 출처: `03-mental-model.md:19`(정본), `08-design-a-to-z.md:48`, `06-conclusions.md:69`(옛 문구, GOAL-077)
- 닫은 사람: 소유자 답(`reviews/round-5-derivations.md:7` P1′), 소유자 답(`reviews/round-12-owner-answers.md:10` 3 꺼질 때 값 정책), 소유자 답(`reviews/round-15-decisions.md:13` 5), 소유자 답(`reviews/round-13-owner-answers.md:8` 2 나감 비움 기본값)
- 라운드: 15
- 까닭: `reviews/round-5-derivations.md:7`
- 충돌:
  > `08-design-a-to-z.md:48`의 "조건부 존재(`if/then/else`, `allOf` 항목, `oneOf`·`anyOf`의 분기)"는 정본과 다르다. 정본이 이긴다(`03-mental-model.md:19`, 08과 03이 다르면 03이 이긴다).

### GOAL-027 P1′의 분기 문장 — 게이트 없이 분기를 고르지 않음, 게이트는 둘뿐

- 결정:
  > **P1′의 분기 문장(10·11라운드).** 폼은 게이트 없이 분기를 고르지 않는다. 게이트는 둘뿐이다 — `if`(검증기가 판정)와 `controls.active`(작성자의 식). `controls.discriminator`는 분기마다 `controls.active`를 적어 주는 설탕이며 게이트의 종류를 더하지 않는다. 분기가 선언한 필드는 조각으로 읽어 노드로 만들고, 어느 분기가 유효한지는 검증기만 판정한다. "읽는 것은 모양 문법뿐"의 유일한 예외는 `controls.discriminator` 아래의 `const`·`enum`이다(§1.2의 축 1항(폼은 JSON Schema 문법을 해석하지 않는다) 예외, §5). 소유자의 틀(답 3 "`if/then/else`는 예외적으로 분기를 결정한다", 답 22)과 같은 뜻이다: 예약 층 밖에서 형상을 조건부로 정하는 문법은 `if/then/else`뿐이고, 명시 없는 `oneOf`·`anyOf`는 모든 분기가 켜진다. 오늘의 `const`·`enum` 자동 감지는 사라지므로 "현행과 같다"(답 22)는 아니며 이주 항목이다(11라운드 확인 목록).
- 보충: 없음
- 상태: 현행
- 출처: `03-mental-model.md:21`(정본), `08-design-a-to-z.md:48`, `07-conclusions.md:76`
- 닫은 사람: 소유자 답(`reviews/round-10-owner-answers.md:9` A-3), 소유자 답(`reviews/round-10-owner-answers.md:11` B-22), 편집자 결정(11라운드 확인 목록, `03-mental-model.md:21`)
- 라운드: 11
- 까닭: `reviews/round-10-owner-answers.md:9`, `reviews/round-10-owner-answers.md:11`

### GOAL-028 P2 원본은 호출자와 작성자만 쓴다

- 결정:
  > | # | 원리 | 한 문장 | 근원 |
  > | - | ---- | ------- | ---- |
  > | P2 | **원본은 호출자와 작성자만 쓴다** | 노드의 원본(raw)에 쓰는 주체는 사용자 입력, 호출자의 `setValue`·`reset`, 그리고 작성자가 선언한 규칙(노드가 생길 때의 채움과 그 원천 `controls.default`·`default`, 예약 층의 `controls.derived`·`controls.injectTo`·`controls.unsetValue`, 나감 정책이 참으로 정해진 노드의 나감 비움)이다. 나감 정책 키의 Form 속성 층은 호출자가 켠다. core가 스스로 원본을 "고치는" 일은 없다 | ADR 0013, 소유자의 축 6항(`controls`의 키는 값을 제어하는 층이다) |
- 보충: 없음
- 상태: 현행
- 출처: `03-mental-model.md:14`(정본), `08-design-a-to-z.md:49`, `07-conclusions.md:74`(GOAL-081), `06-conclusions.md:70`(GOAL-078), `06-conclusions.md:98`(GOAL-080)
- 닫은 사람: 소유자 답(`reviews/round-2.md:119` 새 원칙, `reviews/round-9-spec.md:24` 축6), 소유자 답(`reviews/round-9-spec.md:52` 읽기2 채우기 원천, `reviews/round-9-spec.md:56` 읽기2 시점(A/B)), 소유자 답(`reviews/round-13-owner-answers.md:8` 2 나감 비움 기본값), 소유자 답(`reviews/round-15-decisions.md:13` 5), 편집자 결정(9라운드 문구 통과 갈음, `03-mental-model.md:222`)
- 라운드: 15
- 까닭: `03-mental-model.md:14`(근원 칸), `07-conclusions.md:74`

### GOAL-029 P3 형상은 상태의 순수 함수다

- 결정:
  > | # | 원리 | 한 문장 | 근원 |
  > | - | ---- | ------- | ---- |
  > | P3 | **형상은 상태의 순수 함수다** | 어떤 조각이 켜져 있고 어떤 자식이 존재하는지는 (스키마, 원본 전체)에서 매번 같은 절차로 계산된다. 이력을 읽지 않는다. 계산은 원본을 읽기만 한다 | ADR 0007 |
- 보충: 없음
- 상태: 현행
- 출처: `03-mental-model.md:15`(정본), `08-design-a-to-z.md:50`, `06-conclusions.md:71`(GOAL-079)
- 닫은 사람: 소유자 답(`reviews/round-10-owner-answers.md:9` A-3; 선택 상태 제거), 편집자 결정(9라운드 문구 통과 갈음, `03-mental-model.md:222`)
- 라운드: 10
- 까닭: `03-mental-model.md:5`

### GOAL-030 P4 방출은 정책이다

- 결정:
  > | # | 원리 | 한 문장 | 근원 |
  > | - | ---- | ------- | ---- |
  > | P4 | **방출은 정책이다** | 방출 값은 원본과 형상의 투영이다. 비활성 노드의 제외, `omitEmpty`·`omitTrailing`은 원본을 건드리지 않는 투영 규칙이며, 작성자가 고른다 | ADR 0006·0013 |
- 보충: 없음
- 상태: 현행
- 출처: `03-mental-model.md:16`(정본), `06-conclusions.md:72`, `08-design-a-to-z.md:51`
- 닫은 사람: 소유자 답(`reviews/round-13-owner-answers.md:8` 2 나감 비움 기본값), 편집자 결정(9라운드 문구 통과 갈음, `03-mental-model.md:222`)
- 라운드: 9
- 까닭: `03-mental-model.md:16`(근원 칸)

### GOAL-031 P5 core는 렌더러를 모른다

- 결정:
  > | # | 원리 | 한 문장 | 근원 |
  > | - | ---- | ------- | ---- |
  > | P5 | **core는 렌더러를 모른다** | core는 노드 트리·작업 루프·통지만 안다. React도, 컴포넌트도, 화면의 명령도 모른다. 렌더 계층이 core를 구독한다 | ADR 0008·0011 |
- 보충:
  > "`03-mental-model.md` 13행의 "화면의 명령도 모른다"는 소유자가 명령 어휘를 코어에 두기로 한 C3 세부 3과 맞게 고친다(소유자 확인)." (`06-conclusions.md:215`)
  > "명령은 렌더러와 무관한 표현 계층의 어휘다" (`03-mental-model.md:172`)
  > "렌더러와 무관한 어휘로 core에 남는다(`open-questions.md` Q8 닫힘)." (`adr/0008-event-system.md:32`)
- 상태: 현행
- 출처: `03-mental-model.md:17`(정본), `06-conclusions.md:73`, `08-design-a-to-z.md:52`
- 닫은 사람: 소유자 답(`reviews/round-2.md:114` C3), 소유자 답(`00-goals.md:117` C3 세부 3), 편집자 결정(9라운드 문구 통과 갈음, `03-mental-model.md:222`)
- 라운드: 9
- 까닭: `03-mental-model.md:17`(근원 칸)
- 충돌:
  > `03-mental-model.md:17`의 "화면의 명령도 모른다"는 명령이 화면에서 하는 일(포커스·선택·다시 마운트의 실행)을 core가 모른다는 뜻으로 읽는다. 명령 어휘는 렌더러와 무관한 명령 시그널로 core의 통지에 남는다(소유자 답 `00-goals.md:117` C3 세부 3, 같은 문서의 도출표 `03-mental-model.md:172`, 채택 ADR `adr/0008-event-system.md:32`). 문구를 고치자는 `06-conclusions.md:215`의 제안은 옛 문서를 고치지 않으므로 이 읽기로 갈음한다.

### GOAL-032 원리의 위계 — P1이 가장 위, P2–P4는 쓰기·계산·읽기

- 결정:
  > P1이 가장 위에 있다. P2–P4는 "폼이 값을 어떻게 다루는가"를 셋으로 나눈 것이다 — **쓰기(P2)**, **계산(P3)**, **읽기(P4)**. 한 사건이 두 칸에 걸치면 설계가 잘못된 것이다.
- 보충: 없음
- 상태: 현행
- 출처: `03-mental-model.md:23`(정본), `08-design-a-to-z.md:54`
- 닫은 사람: 편집자 결정(5라운드, `03-mental-model.md:23`)
- 라운드: 5
- 까닭: `03-mental-model.md:23`

### GOAL-033 소유자의 축 열 항목은 원리 위에 놓이고 충돌하면 이긴다

- 결정:
  > 원리 위에 놓이며, 충돌하면 이 열 항목이 이긴다. 요지만 적는다.
- 보충: 없음
- 상태: 현행
- 출처: `03-mental-model.md:27`(정본), `07-conclusions.md:47`
- 닫은 사람: 편집자 결정(9라운드, `03-mental-model.md:25`의 원문 `reviews/round-9-spec.md` §1)
- 라운드: 9
- 까닭: `03-mental-model.md:25`

### GOAL-034 축 1 폼은 JSON Schema 문법을 해석하지 않는다 — controls.discriminator 예외

- 결정:
  > 1. 폼은 JSON Schema 문법을 해석하지 않는다. `if` 블록은 그 블록이 지금 켜지는지만 본다. `oneOf`·`anyOf`도 같다. 스키마로 분기를 표현할 때는 `if` 블록이 컨벤션이고, `enum`·`const` 판별식은 쓰지 않는다. **예외(10라운드, 소유자 동의):** 작성자가 `controls.discriminator`로 명시한 union은 분기의 `const`·`enum`을 읽어 분기별 `controls.active`로 바꾼다.
- 보충:
  > "추가할 근거가 있으면 상당한 이유와 함께 제안하라고 하셨다." (`07-conclusions.md:49`)
- 상태: 현행
- 출처: `03-mental-model.md:29`(정본), `07-conclusions.md:49`, `08-design-a-to-z.md:58`
- 닫은 사람: 소유자 답(`reviews/round-9-spec.md:19` 축1), 소유자 답(`reviews/round-10-owner-answers.md:11` B-22), 소유자 답(`reviews/round-12-owner-answers.md:9` 2 명시 필수)
- 라운드: 12
- 까닭: `reviews/round-9-spec.md:19`

### GOAL-035 축 2 조건에 쓰는 프로퍼티는 properties에 선언 — 컨벤션, 검사하지 않음

- 결정:
  > 2. 조건에 쓰는 프로퍼티는 `properties`에 선언되어야 한다. 컨벤션이며 폼은 검사하지 않는다(소유자: "`if` 안에 `anyOf`·`oneOf`나 더 복잡한 스키마가 올 수 있어 관여하기로 하면 끝이 없다").
- 보충: 없음
- 상태: 현행
- 출처: `03-mental-model.md:30`(정본), `07-conclusions.md:50`, `08-design-a-to-z.md:59`
- 닫은 사람: 소유자 답(`reviews/round-9-spec.md:20` 축2), 소유자 답(`reviews/round-10-owner-answers.md:40` E-19)
- 라운드: 10
- 까닭: `03-mental-model.md:30`
- 충돌:
  > `07-conclusions.md:50`의 "조건에 쓰는 프로퍼티는 `properties`에 선언되어야 한다(제약)."는 정본과 다르다. 정본이 이긴다(`03-mental-model.md:30` 컨벤션이며 폼은 검사하지 않는다, 소유자 답 `reviews/round-10-owner-answers.md:40` E-19).

### GOAL-036 축 3 then·oneOf·allOf·anyOf 블록에서 프로퍼티 노드를 선언할 수 있음

- 결정:
  > 3. `then`·`oneOf`·`allOf`·`anyOf` 블록에서 프로퍼티 노드를 선언할 수 있다.
- 보충:
  > "제약은 2항뿐이다." (`07-conclusions.md:51`)
- 상태: 현행
- 출처: `03-mental-model.md:31`(정본), `07-conclusions.md:51`, `08-design-a-to-z.md:60`
- 닫은 사람: 소유자 답(`reviews/round-9-spec.md:21` 축3)
- 라운드: 9
- 까닭: `reviews/round-9-spec.md:21`

### GOAL-037 축 4 JSON Schema 설정에 의한 변환은 값을 조작하지 않음과 그 읽기

- 결정:
  > 4. JSON Schema 설정에 의한 폼 변환과 필드 노출 변환에서 값을 조작하지 않는다. 읽기: 조각의 켜짐·꺼짐은 **있는 값을 바꾸거나 지우지 않는다**(나감의 비움은 JSON Schema 설정이 아니라 정책 키의 쓰기다, §3). 없음인 키를 채우는 것은 노드가 생기는 사건의 일부다(§3).
- 보충: 없음
- 상태: 현행
- 출처: `03-mental-model.md:32`(정본), `07-conclusions.md:52`, `07-conclusions.md:80`, `08-design-a-to-z.md:61`
- 닫은 사람: 소유자 답(`reviews/round-9-spec.md:22` 축4), 소유자 답(`reviews/round-9-spec.md:56` 읽기2 시점(A/B)), 편집자 결정(9라운드 읽기, `07-conclusions.md:80`), 소유자 답(`reviews/round-13-owner-answers.md:8` 2 나감 비움 기본값)
- 라운드: 13
- 까닭: `07-conclusions.md:80`

### GOAL-038 축 5 노드의 현재 제약을 최신화해 제공할 의무는 폼이 짐

- 결정:
  > 5. 각 노드가 지금 가진 제약(JSON Schema 조건)을 최신화해 제공할 의무는 폼이 진다(§4의 병합표).
- 보충:
  > "유효성 조건 밖의 커스텀 필드를 어떻게 병합할지는 고민해 볼 필요가 있다." (`07-conclusions.md:53`)
- 상태: 현행
- 출처: `03-mental-model.md:33`(정본), `07-conclusions.md:53`, `08-design-a-to-z.md:62`
- 닫은 사람: 소유자 답(`reviews/round-9-spec.md:23` 축5)
- 라운드: 9
- 까닭: `reviews/round-9-spec.md:23`

### GOAL-039 축 6 controls의 키는 값을 제어하는 층

- 결정:
  > 6. `controls`의 키에는 완전히 다른 규칙이 적용된다. 값을 바꾸고, 필드를 가리고, 상태 변화에 따라 값을 빼거나 바꾸거나 다른 노드에 영향을 준다. "값을 제어하는" 층이다. (15라운드 개정: `&` 축약을 없애고 `controls` 그룹으로 적는다)
- 보충: 없음
- 상태: 현행
- 출처: `03-mental-model.md:34`(정본), `07-conclusions.md:54`, `08-design-a-to-z.md:63`
- 닫은 사람: 소유자 답(`reviews/round-9-spec.md:24` 축6), 소유자 답(`reviews/round-15-decisions.md:13` 5)
- 라운드: 15
- 까닭: `reviews/round-9-spec.md:24`

### GOAL-040 축 7 JSON Schema 표현은 controls 표현으로 대체할 수 있어야 함

- 결정:
  > 7. JSON Schema 표현은 `controls` 표현으로 대체할 수 있어야 한다. (15라운드 개정)
- 보충: 없음
- 상태: 현행
- 출처: `03-mental-model.md:35`(정본), `07-conclusions.md:55`, `08-design-a-to-z.md:64`
- 닫은 사람: 소유자 답(`reviews/round-9-spec.md:25` 축7), 소유자 답(`reviews/round-15-decisions.md:13` 5)
- 라운드: 15
- 까닭: `reviews/round-9-spec.md:25`

### GOAL-041 축 8 controls의 식과 injectTo는 예약어 — 동작 위계와 이름 컨벤션

- 결정:
  > 8. `controls`의 식과 `injectTo`는 폼을 제어하는 예약어이며 명확한 동작 위계와 이름 컨벤션을 가진다. (15라운드 개정)
- 보충: 없음
- 상태: 현행
- 출처: `03-mental-model.md:36`(정본), `07-conclusions.md:56`, `08-design-a-to-z.md:65`
- 닫은 사람: 소유자 답(`reviews/round-9-spec.md:26` 축8), 소유자 답(`reviews/round-15-decisions.md:13` 5)
- 라운드: 15
- 까닭: `reviews/round-9-spec.md:26`

### GOAL-042 축 9 폼 전용 키는 그룹 객체 셋 안에만 — 평면 & 축약과 computed 별칭 없음

- 결정:
  > 9. 폼 전용 키는 그룹 객체 셋(`controls`·`options`·`presentation`) 안에만 둔다. 평면 `&` 축약과 `computed` 별칭은 두지 않는다. (15라운드 개정. 이전 문장 "`computed`(새 이름 `control`)와 `&`의 동시 제공은 유지한다"를 뒤집었다. 소유자: "숏컷을 모두 없애고 중첩 객체로 하는 게 빼기도 편하고 나중에 서버 스키마랑 클라이언트 스키마를 병합하기도 편하겠지")
- 보충: 없음
- 상태: 현행
- 출처: `03-mental-model.md:37`(정본), `08-design-a-to-z.md:66`, `reviews/round-15-apply-spec.md:46,79`
- 닫은 사람: 소유자 답(`reviews/round-15-decisions.md:13` 5), 소유자 답(`03-mental-model.md:37` 소유자 인용)
- 라운드: 15
- 까닭: `03-mental-model.md:37`

### GOAL-043 대체됨: 축 9 computed와 &를 함께 제공하는 쪽을 선호(9라운드)

- 결정:
  > 9. `computed`와 `&`를 함께 제공하는 쪽을 선호한다(제거해도 무방하다).
- 보충: 없음
- 상태: 대체됨(→ GOAL-042)
- 출처: `07-conclusions.md:57`(정본)
- 닫은 사람: 소유자 답(`reviews/round-9-spec.md:27` 축9)
- 라운드: 9
- 까닭: `reviews/round-9-spec.md:27`

### GOAL-044 축 10 글로벌·로컬 설정 — 13라운드 개정으로 코어에는 글로벌 잠금 없음

- 결정:
  > 10. 글로벌 설정과 로컬 설정의 동시 제공과 경합은 기존과 같이 제공한다. 읽기(소유자, 10라운드): "props로 전달되는 글로벌 값이 개별 값을 덮는다. `rootJSONSchema`도 props와 동치." **개정(소유자, 13라운드):** "글로벌 readOnly나 disabled 같은 개념은 없애고 모든 control 필드는 자체 노드만 지원. children 그룹은 예외. 이건 검증의 영역이 아니라 react의 표현 영역." 곧 코어에는 글로벌 잠금이 없고, 루트 스키마 키는 루트 노드의 로컬 키이며, Form 속성 `readOnly`·`disabled`는 렌더 계층이 참일 때만 거는 전체 잠금(코어 밖, P5)이다. 소유자 확인(13라운드): "props로 전달되는 글로벌 readOnly와 disabled만 특별 관리를 하자. 코어 트리와 유리된 전역 동작으로 읽으면 된다."
- 보충: 없음
- 상태: 현행
- 출처: `03-mental-model.md:38`(정본), `07-conclusions.md:58`, `07-conclusions.md:60`, `08-design-a-to-z.md:67`
- 닫은 사람: 소유자 답(`reviews/round-9-spec.md:28` 축10), 소유자 답(`reviews/round-10-owner-answers.md:12` B-12), 소유자 답(`reviews/round-13-owner-answers.md:7` 1 잠금 규칙), 소유자 답(`reviews/round-13-owner-answers.md:16` Form 속성의 자리)
- 라운드: 13
- 까닭: `reviews/round-13-owner-answers.md:7`

### GOAL-045 소유자의 요약 발언 — controls와 if/then/else로 JSON만으로도 동작하는 구조

- 결정:
  > 요약 발언: "최소한의 제약으로 jsonSchema를 최대한 반영. UI 제어는 최대한 `&`로. 값 변경도 전량 `&`와 `injectTo`로. JSON Schema는 사후 검증, 폼은 대상값을 만들면서 검증이라는 태생적 차이를 `&` 패밀리로 메우고, `if/then/else`를 함께 써서 JSON만으로도 동작하는 구조."(15라운드: 이 발언의 `&`는 `controls`로 읽는다)
- 보충: 없음
- 상태: 현행
- 출처: `03-mental-model.md:40`(정본), `07-conclusions.md:62`
- 닫은 사람: 소유자 답(`reviews/round-9-spec.md:32` 요약 발언), 편집자 결정(15라운드, `03-mental-model.md:40` `&`를 `controls`로 읽음)
- 라운드: 15
- 까닭: `reviews/round-9-spec.md:32`

### GOAL-046 소유자의 답 읽기 1 — oneOf·anyOf는 진짜 검증 조건

- 결정:
  > - **읽기 1.** `oneOf`·`anyOf`는 형상 선언이 아니라 진짜 검증 조건이다. 분기의 필드는 노드의 `controls.active`·`controls.visible`이나 부모의 자식 집합 제어로 다루고, JSON만으로 다루려면 분기 안에 `if/then/else`를 넣는다. 순수한 `oneOf`·`anyOf`도 허용하되 그때는 작성자가 `controls`로 제어할 책임을 진다.
- 보충: 없음
- 상태: 현행
- 출처: `03-mental-model.md:44`(정본), `07-conclusions.md:66`, `08-design-a-to-z.md:71`
- 닫은 사람: 소유자 답(`reviews/round-9-spec.md:42` 읽기1, `reviews/round-9-spec.md:44` 읽기1(이어서))
- 라운드: 9
- 까닭: `reviews/round-9-spec.md:42`

### GOAL-047 소유자의 답 읽기 2 — 채우기·바꾸기·지우기 모두 가능, 채움의 원천과 시점

- 결정:
  > - **읽기 2.** 없는 값 채우기, 있는 값 바꾸기, 있는 값 지우기는 모두 원리상 가능해야 한다. 채움의 원천은 `controls.default` > `default` > 없음, 시점은 노드가 생길 때(A).
- 보충:
  > "4항의 "값을 조작하지 않는다"에 없음인 키를 채우는 것도 든다." (`07-conclusions.md:67`)
  > "없는 값 채우기(표준 `default`, 호출자의 `defaultValue`, `&derived`·`injectTo`, 표현식으로 계산한 기본값), 있는 값 바꾸기, 있는 값 지우기는 모두 원리상 가능해야 한다." (`07-conclusions.md:67`)
- 상태: 현행
- 출처: `03-mental-model.md:45`(정본), `07-conclusions.md:67`, `07-conclusions.md:80`, `08-design-a-to-z.md:72`
- 닫은 사람: 소유자 답(`reviews/round-9-spec.md:48` 읽기2, `reviews/round-9-spec.md:52` 읽기2 채우기 원천, `reviews/round-9-spec.md:56` 읽기2 시점(A/B))
- 라운드: 9
- 까닭: `reviews/round-9-spec.md:56`

### GOAL-048 소유자의 답 읽기 3 — 코어의 상태 키는 그 노드에만, 나감 비움 정책은 하위 트리로

- 결정:
  > - **읽기 3.** 축 10항(글로벌과 로컬의 경합, 13라운드 개정)은 루트 스키마의 `readOnly`·`disabled` 같은 것을 가리켰으나 13라운드에 개정되었다: 코어의 상태 키는 그 노드에만 걸린다(로컬뿐). 조상의 상속도, 루트의 글로벌도 없다. 자손을 거는 길은 부모의 `controls.children`(명시한 대상)과 켜진 조각의 `controls`뿐이다. 나감의 비움 정책 `unsetOnInactive`만은 둘째 예외로, 나가는 객체·분기에 켠 정책이 함께 나가는 하위 트리로 내려간다(17라운드 소유자 답 R17-2 ㄴ, §3). 전체 잠금은 렌더 계층의 Form 속성이다.
- 보충: 없음
- 상태: 현행
- 출처: `03-mental-model.md:46`(정본), `07-conclusions.md:68`, `08-design-a-to-z.md:73`
- 닫은 사람: 소유자 답(`reviews/round-9-spec.md:60` 읽기3), 소유자 답(`reviews/round-10-owner-answers.md:25` E-13), 소유자 답(`reviews/round-13-owner-answers.md:7` 1 잠금 규칙), 소유자 답(`reviews/round-17-owner-answers.md:10` R17-2)
- 라운드: 17
- 까닭: `reviews/round-17-owner-answers.md:10`

### GOAL-049 다섯 가치 — 일관성·투명성·예측가능성·표현자유도와 받치는 목표·원리

- 결정:
  > 소유자가 14라운드에 핵심 가치 다섯을 이름 붙였다. 목표(`00-goals.md`의 G1–G8)와 원리(원장 §1의 P1–P5)가 어느 가치를 받치는지 적는다.
  > | 가치 | 뜻 | 받치는 목표·원리 |
  > | --- | --- | --- |
  > | 일관성 | 같은 개념은 어디서나 같은 이름·같은 규칙·같은 우선순위다. 하나의 개념에는 하나의 장치 | G4(하나의 개념에 하나의 장치), G2(층의 분리), P3(형상은 순수 함수) |
  > | 투명성 | 작성자와 호출자가 "왜 이 값이 이렇게 됐는가"를 문서와 런타임에서 알 수 있다 | C2(작성자 실수의 가시성), P2(원본을 쓰는 주체는 셋뿐), 오류·경고 분류표(§11) |
  > | 예측가능성 | 같은 스키마·같은 입력이면 문서만으로 결과를 미리 말할 수 있다 | G5(한 장으로 설명되는 라이프사이클), G1(판정의 동치), P1(판정은 검증기의 것) |
  > | 표현자유도 | 실제 폼 요구를 스키마와 `controls`의 명령으로 적을 수 있고 표준 JSON Schema 표현을 잃지 않는다 | G2, G8(보편 관행), 축 6·7항(`controls`는 값을 제어하는 층, JSON Schema 표현은 `controls`로 대체 가능), P4(방출은 정책) |
- 보충: 없음
- 상태: 현행
- 출처: `08-design-a-to-z.md:29-37`(정본)
- 닫은 사람: 소유자 답(`reviews/round-14-values-check.md:3` 소유자 지시), 편집자 결정(14라운드, `08-design-a-to-z.md:29-37` 뜻과 받치는 목표·원리)
- 라운드: 14
- 까닭: `reviews/round-14-values-check.md:3`

### GOAL-050 다섯 가치 — 고속성(최소 생성·메모리 안정·캐싱)

- 결정:
  > | 가치 | 뜻 | 받치는 목표·원리 |
  > | --- | --- | --- |
  > | 고속성 | 입력 한 번에 드는 일이 작고 상한이 있으며 스키마 크기에 비례 이상으로 커지지 않는다. 필요한 것만 만들고(최소 생성), 같은 일을 되풀이해도 메모리가 자라지 않으며(메모리 안정), 한 번 만든 것은 캐시해 다시 만들지 않는다(캐싱을 통한 속도, 재생성 방지). 목적은 모바일에서도 돌아가는 안정성과 경제성이다(16라운드 답 10) | G6(비용은 변경에 비례), G7(반응의 척추 보존), 예산 다섯(§7), 가드·사본 캐시(§11.1), 유효 스키마 메모(§4) |
- 보충:
  > "최초부터 이 form의 목적은 모바일에서도 실행가능한 수준의 안정성과 경제성이라서요" (`reviews/round-16-owner-answers.md:18`)
- 상태: 현행
- 출처: `08-design-a-to-z.md:36`(정본), `reviews/round-16-owner-answers.md:16`
- 닫은 사람: 소유자 답(`reviews/round-16-owner-answers.md:16` 10)
- 라운드: 16
- 까닭: `reviews/round-16-owner-answers.md:16`

### GOAL-051 계승할 제약 — 오늘의 규칙이 지키는 현상은 그대로 지킴

- 결정:
  > 상태: 관찰 + 대응(제안). 현재 코드가 사용자 경험의 문제를 겪고 나서 굳힌 규칙들이다. 새 설계는 구조를 바꾸지만 이 규칙들이 지키는 **현상**은 그대로 지켜야 한다. 각 항목에 현재의 장치(`file:line`), 그것이 막는 문제, 새 설계에서의 대응, 수용 기준(테스트)을 적는다. 소유자: "캐럿 소실 문제와 같은 제어 컴포넌트에서의 세밀한 UX 제어 같은 트러블슈팅 기록은 우리가 계승해야 한다."
- 보충: 없음
- 상태: 현행
- 출처: `04-inherited-constraints.md:3`(정본)
- 닫은 사람: 소유자 답(`04-inherited-constraints.md:3` 소유자 인용), 편집자 결정(4라운드, `04-inherited-constraints.md:5`)
- 라운드: 4
- 까닭: `04-inherited-constraints.md:3`

### GOAL-052 T-1 타이핑은 같은 이벤트 핸들러 안에서 리렌더된다

- 결정:
  > | # | 제약 | 현재의 장치 | 막는 문제 | 새 설계의 대응 | 수용 기준 |
  > | - | ---- | ----------- | --------- | -------------- | --------- |
  > | T-1 | **타이핑은 같은 이벤트 핸들러 안에서 리렌더된다** | 초기화된 노드는 `UpdateValue`를 동기로 발행한다(`AbstractNode.ts:891-900`; 발행 지점 전부가 `this.initialized`를 `immediate`로 넘긴다 — `StringNode.ts:63-69`, `ObjectNode/…/BranchStrategy.ts:199-206` 등 10곳). `useSyncExternalStore` 구독이 동기로 불리고(`hooks/useSchemaNodeTracker.ts:36-44`) 입력은 렌더 중 `node.value`를 읽는다(`SchemaNodeInput.tsx:116`) | 제어 컴포넌트의 캐럿 소실. 통지가 한 틱 늦으면 `value` 속성이 DOM보다 늦어 포맷팅 입력에서 캐럿이 끝으로 튄다 | 통지는 항상 동기(ADR 0008 "통지의 시점"). "즉시" 옵션이 없어진다 — 모든 통지가 정착 직후 동기이므로 | **바뀜(4라운드 F14)**: (1) 일반 제어 입력의 중간 삽입 `ab\|cd` + "xy" → `abxycd@4`, (2) input 이벤트 직후 DOM 값 = 커밋 값, (3) IME 조합 3단계. 기존 `controlled-interaction.render.test.tsx:340-368`(포맷터 + 북키핑)은 통지 시점의 회귀를 잡지 못하므로(`spikes/events/REPORT-caret.txt`) 유지하되 이 기준으로 세지 않는다 |
- 보충: 없음
- 상태: 현행
- 출처: `04-inherited-constraints.md:9`(정본)
- 닫은 사람: 편집자 결정(4라운드, `04-inherited-constraints.md:5` 수용 기준 검토)
- 라운드: 4
- 까닭: `04-inherited-constraints.md:9`(막는 문제 칸), `04-inherited-constraints.md:3`

### GOAL-053 T-2 타이핑은 입력을 리마운트하지 않는다

- 결정:
  > | # | 제약 | 현재의 장치 | 막는 문제 | 새 설계의 대응 | 수용 기준 |
  > | - | ---- | ----------- | --------- | -------------- | --------- |
  > | T-2 | **타이핑은 입력을 리마운트하지 않는다** | 타이핑 경로의 옵션(`HANDLE_CHANGE_OPTION`, `SchemaNodeInput/type.ts:33-37`)에 `Refresh` 비트가 없다. `RequestRefresh`는 `Overwrite`/`Merge`에만 실린다(`core/types/value.ts:34-35,51,62-65`). 입력의 `key={version}`은 `RequestRefresh`에만 바뀐다(`SchemaNodeInput.tsx:121`). 주석: `useFormTypeInputControl.ts:20-23` | 비제어 입력의 리마운트로 캐럿·IME 조합 상태가 사라진다 | ADR 0007의 규칙: 커밋된 원본이 그 노드의 입력이 방금 보고한 값과 다른 노드에만 `RequestRefresh`. 타이핑은 같으므로 보내지 않는다 | 같은 파일의 타이핑 시나리오 + `reset`/`setValue(Overwrite)` 뒤 비제어 입력이 새 값을 읽는 시나리오(`refresh.*.render.test.tsx`) |
- 보충:
  > "동치 비교를 버리고 **출처**로 판단한다: 쓰기에 출처 노드를 싣고, 그 노드 자신의 입력에서 온 부분 쓰기는 Refresh를 내지 않으며 그 밖의 쓰기(전체 교체·`injectTo`·전이·다른 노드의 입력)가 raw를 바꾸면 낸다." (`reviews/round-4.md:128`)
- 상태: 현행
- 출처: `04-inherited-constraints.md:10`(정본)
- 닫은 사람: 편집자 결정(4라운드, `04-inherited-constraints.md:5` 수용 기준 검토), 편집자 결정(4라운드, `reviews/round-4.md:128` F7)
- 라운드: 4
- 까닭: `04-inherited-constraints.md:10`(막는 문제 칸), `04-inherited-constraints.md:3`
- 충돌:
  > `04-inherited-constraints.md:10`의 "ADR 0007의 규칙: 커밋된 원본이 그 노드의 입력이 방금 보고한 값과 다른 노드에만 `RequestRefresh`."는 뒤의 결정과 다르다. 채택된 ADR이 이긴다(`adr/0007-settle-cycle.md:90` F7, EVENT-042).

### GOAL-054 T-3 가상화된 노드는 포커스·선택 명령으로 즉시 드러난다

- 결정:
  > | # | 제약 | 현재의 장치 | 막는 문제 | 새 설계의 대응 | 수용 기준 |
  > | - | ---- | ----------- | --------- | -------------- | --------- |
  > | T-3 | **가상화된 노드는 포커스·선택 명령으로 즉시 드러나고, 드러난 커밋 안에서 명령을 다시 받는다** | `RequestFocus`/`RequestSelect`만 지연 마운트를 강제 해제한다(`DeferrableNodeProxy.tsx:9-14`). `RequestRefresh`는 제외 — 폼 전체의 지연이 풀린다. 드러난 뒤 안쪽 컨트롤이 같은 커밋의 자식 레이아웃 이펙트에서 구독하므로 명령을 **동기로** 다시 발행한다(`DeferrableNodeProxy.tsx:44-58`) | 지연 마운트된 필드에 `focus()`를 불렀는데 아무 일도 없거나, 명령이 유실·반복된다 | ADR 0008 배달 집합 2항(시그널 비트가 대기 중인 노드 포함). 재발행 규칙은 렌더 계층의 것이며 그대로 계승한다(core는 렌더러를 모른다 — P5) | `__tests__/scenarios/virtualization.*.render.test.tsx`의 포커스·선택 시나리오 |
- 보충: 없음
- 상태: 현행
- 출처: `04-inherited-constraints.md:11`(정본)
- 닫은 사람: 편집자 결정(4라운드, `04-inherited-constraints.md:5` 수용 기준 검토)
- 라운드: 4
- 까닭: `04-inherited-constraints.md:11`(막는 문제 칸), `04-inherited-constraints.md:3`

### GOAL-055 T-4 순환은 상한에서 멈춘다 — 정착 예산과 사슬 끝의 동기 throw

- 결정:
  > | # | 제약 | 현재의 장치 | 막는 문제 | 새 설계의 대응 | 수용 기준 |
  > | - | ---- | ----------- | --------- | -------------- | --------- |
  > | T-4 | **순환은 상한에서 멈추고, 상한은 틱마다 초기화된다** | `MAX_LOOP_COUNT = 100`(`EventCascadeManager.ts:34`), `__acquireBatch__`에서 검사(`:90-107`), 유휴 시 매크로태스크로 초기화(`:110-116`). throw는 마이크로태스크 안에서 나므로 호출자의 `try/catch`에 잡히지 않는다 | `injectTo`·derived의 되먹임이 탭을 멈춘다 | 정착 루프의 세 예산 — 조각 바퀴(조건부 조각 수 + 1), 파생 라운드(25), 전이(조각 수)(F2·F3). 이벤트 쪽에는 틱당 파동 25와 `onChange` 중첩 25가 따로 있다(ADR 0008). 상한을 넘기는 라운드는 실행하지 않고 마지막 완료 라운드로 고정한다(E7). 모든 환경에서 커밋·통지 뒤 사슬 끝에서 **동기로** throw하고(호출자가 잡을 수 있다) `diagnostics`는 `degraded`로 다음 로드까지 남는다(17라운드 소유자 답 R17-1 나, ADR 0014 4판. 4라운드의 개발 모드 throw와 프로덕션 신호(E6)를 대체한다). 파동 상한은 현재처럼 **틱당**이며 상한에 닿으면 리스너 쓰기를 거부한다(4라운드 F15) — 미루고 초기화하는 현재 방식은 같은 입력을 틱마다 다시 돌린다 | `core/__tests__/*injectTo*`, `computed.derived.render.test.tsx`의 수렴 가드(`caughtErrors`) |
- 보충: 없음
- 상태: 현행
- 출처: `04-inherited-constraints.md:12`(정본)
- 닫은 사람: 편집자 결정(4라운드, `04-inherited-constraints.md:5` 수용 기준 검토), 소유자 답(`reviews/round-1.md:179` 순환은 돌려 보고 터뜨린다), 소유자 답(`reviews/round-17-owner-answers.md:9` R17-1)
- 라운드: 17
- 까닭: `04-inherited-constraints.md:12`(막는 문제 칸), `04-inherited-constraints.md:3`
- 충돌:
  > `04-inherited-constraints.md:12`의 "정착 루프의 세 예산 — 조각 바퀴(조건부 조각 수 + 1), 파생 라운드(25), 전이(조각 수)(F2·F3)."는 뒤 라운드의 결정과 다르다. 뒤 라운드가 이긴다(`03-mental-model.md:116` 호스트 바퀴(게이트 가진 조각 수 + 노드 게이트 수 + 1), 전이 라운드는 호스트 바퀴와 같은 식).
  > `04-inherited-constraints.md:12`의 "상한을 넘기는 라운드는 실행하지 않고 마지막 완료 라운드로 고정한다(E7)."는 뒤 라운드의 결정과 다르다. 뒤 라운드가 이긴다(`adr/0007-settle-cycle.md:47` 원본 B 커밋).
  > `04-inherited-constraints.md:12`의 "이벤트 쪽에는 틱당 파동 25와 `onChange` 중첩 25가 따로 있다(ADR 0008)."는 뒤 라운드의 결정과 다르다. 뒤 라운드가 이긴다(`adr/0008-event-system.md:66` 최외곽 진입의 되먹임 사슬당 25).
  > `04-inherited-constraints.md:12`의 "파동 상한은 현재처럼 **틱당**이며 상한에 닿으면 리스너 쓰기를 거부한다(4라운드 F15)"는 뒤 라운드의 결정과 다르다. 뒤 라운드가 이긴다(`adr/0008-event-system.md:74` 최외곽 진입이 끝날 때 초기화, 틱 단위는 G5에 어긋남).

### GOAL-056 T-5 두 단계 단언 — 새 설계는 단일 단계로 다시 씀

- 결정:
  > | # | 제약 | 현재의 장치 | 막는 문제 | 새 설계의 대응 | 수용 기준 |
  > | - | ---- | ----------- | --------- | -------------- | --------- |
  > | T-5 | **두 단계 단언 — 동기 단계와 정착 단계** | 하네스의 `flushOnMount: false`(`__tests__/renderForm.tsx:63-66`)로 마이크로태스크 캐스케이드 전의 DOM을 단언한다. 13개 파일이 쓴다(`harness.smoke`, `composition.allOf-ifThenElse`, `computed.derived`, `computed.visibility`, `computed.readonly-disabled`, `composition.oneOf.initial`, `virtual`, `composition.anyOf`, `composition.nested-branch`, `composition.oneOf.switch`, `array.prefixItems-terminal`, `nullable`, `multi-render-split-brain`) | 초기 마운트의 priming 회귀와 정착 뒤 상태를 구별하지 못한다 | 새 설계에는 두 번째 단계가 없다 — 생성이 곧 첫 정착이고 통지는 동기다. 이 13개 파일의 "동기 뒤 정착" 단언은 **단일 단계로 다시 쓴다.** 무엇이 회귀였는지는 각 테스트의 제목이 말하므로 제목을 보존한다 | 13개 파일의 시나리오가 단일 단계에서 같은 최종 DOM을 낸다 |
- 보충:
  > "하니스는 재사용하고 기존 시나리오의 기대값은 버리되 상황 목록은 자산으로 옮긴다." (`08-design-a-to-z.md:608`)
- 상태: 현행
- 출처: `04-inherited-constraints.md:13`(정본)
- 닫은 사람: 편집자 결정(4라운드, `04-inherited-constraints.md:5` 수용 기준 검토)
- 라운드: 4
- 까닭: `04-inherited-constraints.md:13`(막는 문제 칸), `04-inherited-constraints.md:3`
- 충돌:
  > `04-inherited-constraints.md:13`의 "13개 파일의 시나리오가 단일 단계에서 같은 최종 DOM을 낸다"는 뒤 라운드의 결정과 다르다. 뒤 라운드가 이긴다(`09-landing-and-test-strategy.md:160` 렌더 시나리오 `composition.*`·`computed.*`는 버리고 새로 쓴다, `08-design-a-to-z.md:608`).

### GOAL-057 T-6 늦은 구독자는 놓친 것을 알 수 있다

- 결정:
  > | # | 제약 | 현재의 장치 | 막는 문제 | 새 설계의 대응 | 수용 기준 |
  > | - | ---- | ----------- | --------- | -------------- | --------- |
  > | T-6 | **늦은 구독자는 놓친 것을 알 수 있다** | `subscribe` 전에 지나간 이벤트는 재생되지 않는다. 상태 미러는 `useSchemaNodeSubscribe`의 `onSubscribe` catch-up을 쓴다. `revision(mask)`는 리스너 유무와 무관한 단조 카운터다(패키지 `CLAUDE.md` Key APIs, `useSchemaNodeTracker`) | 마운트 순서에 따라 렌더가 stale 상태에 갇힌다(split-brain) | ADR 0008 §2 규칙 3(F16): `revision`은 커밋 시 배달 집합 전체를 한 번에 올린다. 파동 중에 구독한 리스너는 원장으로 따라잡는다(F17) | `multi-render-split-brain.render.test.tsx` |
- 보충: 없음
- 상태: 현행
- 출처: `04-inherited-constraints.md:14`(정본)
- 닫은 사람: 편집자 결정(4라운드, `04-inherited-constraints.md:5` 수용 기준 검토)
- 라운드: 4
- 까닭: `04-inherited-constraints.md:14`(막는 문제 칸), `04-inherited-constraints.md:3`

### GOAL-058 T-7 배열 연산은 동기다

- 결정:
  > | # | 제약 | 현재의 장치 | 막는 문제 | 새 설계의 대응 | 수용 기준 |
  > | - | ---- | ----------- | --------- | -------------- | --------- |
  > | T-7 | **배열 연산은 동기다** | 현재 `push`/`remove`/`pop`/`clear`는 마이크로태스크 하나 뒤에 풀리는 Promise를 돌려준다(`01-current-structure.md`) | `await arr.push(x)` 뒤에 구독자가 이미 봤다는 뜻이 되지 않는다 | 동기 API로 바꾼다(ADR 0007·0008). 파괴적 변경 | 배열 시나리오 전부(`array.*.render.test.tsx`) — Promise 가정 제거 |
- 보충: 없음
- 상태: 현행
- 출처: `04-inherited-constraints.md:15`(정본)
- 닫은 사람: 편집자 결정(4라운드, `04-inherited-constraints.md:5` 수용 기준 검토)
- 라운드: 4
- 까닭: `04-inherited-constraints.md:15`(막는 문제 칸), `04-inherited-constraints.md:3`

### GOAL-059 T-8 사용자 주입 컴포넌트는 격리된다

- 결정:
  > | # | 제약 | 현재의 장치 | 막는 문제 | 새 설계의 대응 | 수용 기준 |
  > | - | ---- | ----------- | --------- | -------------- | --------- |
  > | T-8 | **사용자 주입 컴포넌트는 격리된다** | `withErrorBoundary`로 1회 래핑(`SchemaNodeProxy`/`SchemaNodeInputWrapper`, `VirtualizationManager` 생성자) — 패키지 `CLAUDE.md` Error Isolation | 입력 하나의 throw가 폼 전체를 떨어뜨린다 | 렌더 계층 규칙. 그대로. core 쪽 대응은 ADR 0008 6항(리스너 격리 — `subscribe` 소비자의 throw가 뒤의 노드 통지를 막지 않는다) | 기존 에러 경계 테스트 + 새로 "리스너가 throw해도 다음 노드가 통지된다" |
- 보충: 없음
- 상태: 현행
- 출처: `04-inherited-constraints.md:16`(정본)
- 닫은 사람: 편집자 결정(4라운드, `04-inherited-constraints.md:5` 수용 기준 검토)
- 라운드: 4
- 까닭: `04-inherited-constraints.md:16`(막는 문제 칸), `04-inherited-constraints.md:3`

### GOAL-060 T-9 루트 onChange는 최외곽 동기 진입당 1회, 디바운스 없음

- 결정:
  > | # | 제약 | 현재의 장치 | 막는 문제 | 새 설계의 대응 | 수용 기준 |
  > | - | ---- | ----------- | --------- | -------------- | --------- |
  > | T-9 | **루트 `onChange`와 OnChange 검증은 매크로태스크로 디바운스된다** | `afterMicrotask`(이름과 달리 취소 뒤 재예약하는 **매크로태스크**, `AbstractNode/utils/afterMicrotask/afterMicrotask.ts:18-28`)가 `__handleChange__`를 감싼다(`AbstractNode.ts:1219-1223`) — `validate()`와 루트 `onChange`가 함께 묶인다 | 키 입력마다 소비자 콜백과 검증기가 돈다 | 소유자 결정 D-10(`reviews/round-4.md` §4, F31이 F22를 대체): 루트 `onChange`는 **최외곽 동기 진입당 1회**, 디바운스 없음(진입 깊이 카운터, `spikes/work-loop/REPORT-v4c.txt`). React 이펙트의 쓰기는 새 진입이라 키 입력당 2회이며 문서화 대상(C-10). 검증은 커밋 번호 스탬프로 비동기(F28) | `validation.*.render.test.tsx`, 루트 `onChange` 호출 횟수 단언 |
- 보충: 없음
- 상태: 현행
- 출처: `04-inherited-constraints.md:17`(정본)
- 닫은 사람: 편집자 결정(4라운드, `04-inherited-constraints.md:5` 수용 기준 검토), 소유자 답(`reviews/round-4.md:116` D-10)
- 라운드: 4
- 까닭: `04-inherited-constraints.md:17`(막는 문제 칸), `04-inherited-constraints.md:3`

### GOAL-061 T-10 blur의 Touched 지연 — 렌더 계층, 그대로

- 결정:
  > | # | 제약 | 현재의 장치 | 막는 문제 | 새 설계의 대응 |
  > | - | ---- | ----------- | --------- | -------------- |
  > | T-10 | blur의 Touched는 `requestAnimationFrame`으로 늦추고 focus가 취소한다 | `SchemaNodeInput.tsx:80-86` | 포커스 이동 중 에러가 깜빡인다 | 렌더 계층. 그대로 |
- 보충: 없음
- 상태: 현행
- 출처: `04-inherited-constraints.md:25`(정본)
- 닫은 사람: 편집자 결정(4라운드, `04-inherited-constraints.md:5` 수용 기준 검토)
- 라운드: 4
- 까닭: `04-inherited-constraints.md:25`(막는 문제 칸), `04-inherited-constraints.md:3`

### GOAL-062 T-11 렌더 중의 값 읽기는 계산하지 않는다

- 결정:
  > | # | 제약 | 현재의 장치 | 막는 문제 | 새 설계의 대응 |
  > | - | ---- | ----------- | --------- | -------------- |
  > | T-11 | 렌더 중의 값 읽기는 계산하지 않는다 | `get value()`가 만료·잠금이 아니면 캐시를 돌려준다(`ObjectNode/…/BranchStrategy.ts:304`), commit-on-read 제거(`DETAIL.md:101`) | 렌더 중 읽기가 null 조상을 조기 승격시키거나 전파 가드를 어긋나게 한다 | P3·ADR 0006: 읽기는 메모를 돌려줄 뿐 계산하지 않는다(정착된 읽기 4–11 ns). 구조로 흡수 |
- 보충: 없음
- 상태: 현행
- 출처: `04-inherited-constraints.md:26`(정본)
- 닫은 사람: 편집자 결정(4라운드, `04-inherited-constraints.md:5` 수용 기준 검토)
- 라운드: 4
- 까닭: `04-inherited-constraints.md:26`(막는 문제 칸), `04-inherited-constraints.md:3`

### GOAL-063 T-12 자동 쓰기는 null 조상을 객체로 만들지 않는다

- 결정:
  > | # | 제약 | 현재의 장치 | 막는 문제 | 새 설계의 대응 |
  > | - | ---- | ----------- | --------- | -------------- |
  > | T-12 | 자동 쓰기는 null 조상을 객체로 만들지 않는다 | `option & Automatic \|\| !__hasNullAncestor__`이면 전달하지 않는다(`AbstractNode.ts:1117`, `value.ts:46`) | reset·derived가 빈 폼을 객체로 만든다 | A2·A5: 호스트의 `raw`를 비우는 것은 **사용자·호출자의 부분 쓰기**뿐이다. default 주입과 `injectTo`는 비객체 호스트의 `raw`를 건드리지 않는다 — `injectTo`가 대상의 전체 교체라도 조상의 `raw`는 그대로. 4라운드 F10으로 명세에 넣었다 |
- 보충: 없음
- 상태: 현행
- 출처: `04-inherited-constraints.md:27`(정본)
- 닫은 사람: 편집자 결정(4라운드, `04-inherited-constraints.md:5` 수용 기준 검토)
- 라운드: 4
- 까닭: `04-inherited-constraints.md:27`(막는 문제 칸), `04-inherited-constraints.md:3`

### GOAL-064 T-13 검증 결과는 세대 토큰으로 걸러진다 — revision 스탬프

- 결정:
  > | # | 제약 | 현재의 장치 | 막는 문제 | 새 설계의 대응 |
  > | - | ---- | ----------- | --------- | -------------- |
  > | T-13 | 검증 결과는 세대 토큰으로 걸러진다 | `__generation__` 단조 증가, 구세대 결과 폐기(`ValidationManager.ts:56-62, 121-124`) | 비동기 검증의 경합으로 stale 에러가 남는다 | ADR 0004·0007: revision 스탬프. 같은 장치 |
- 보충: 없음
- 상태: 현행
- 출처: `04-inherited-constraints.md:28`(정본)
- 닫은 사람: 편집자 결정(4라운드, `04-inherited-constraints.md:5` 수용 기준 검토)
- 라운드: 4
- 까닭: `04-inherited-constraints.md:28`(막는 문제 칸), `04-inherited-constraints.md:3`

### GOAL-065 T-14 같은 틱 재진입 injectTo 가드 — 파생 라운드 상한으로 대체

- 결정:
  > | # | 제약 | 현재의 장치 | 막는 문제 | 새 설계의 대응 |
  > | - | ---- | ----------- | --------- | -------------- |
  > | T-14 | 같은 틱의 재진입 `injectTo`는 건너뛰고 매크로태스크로 해제한다 | `InjectionGuardManager.ts:4-8`, `AbstractNode.ts:977-1019` | 순환 주입의 스택 오버플로 | A3 파생 라운드 상한 25. 틱 기반 가드는 사라진다 |
- 보충: 없음
- 상태: 현행
- 출처: `04-inherited-constraints.md:29`(정본)
- 닫은 사람: 편집자 결정(4라운드, `04-inherited-constraints.md:5` 수용 기준 검토)
- 라운드: 4
- 까닭: `04-inherited-constraints.md:29`(막는 문제 칸), `04-inherited-constraints.md:3`

### GOAL-066 T-15 한 번 드러난 가상화 노드는 placeholder로 돌아가지 않는다

- 결정:
  > | # | 제약 | 현재의 장치 | 막는 문제 | 새 설계의 대응 |
  > | - | ---- | ----------- | --------- | -------------- |
  > | T-15 | 한 번 드러난 가상화 노드는 placeholder로 돌아가지 않는다(defer-once) | `helpers/virtualization/INTENT.md:12`, `DETAIL.md:16` | 값 변경·스크롤 아웃에서 포커스·선택이 사라진다 | 렌더 계층. 그대로 |
- 보충: 없음
- 상태: 현행
- 출처: `04-inherited-constraints.md:30`(정본)
- 닫은 사람: 편집자 결정(4라운드, `04-inherited-constraints.md:5` 수용 기준 검토)
- 라운드: 4
- 까닭: `04-inherited-constraints.md:30`(막는 문제 칸), `04-inherited-constraints.md:3`

### GOAL-067 T-16 Deferrable 래퍼 여부는 생성 시점에 고정

- 결정:
  > | # | 제약 | 현재의 장치 | 막는 문제 | 새 설계의 대응 |
  > | - | ---- | ----------- | --------- | -------------- |
  > | T-16 | Deferrable 래퍼 여부는 생성 시점에 고정한다 | `useChildNodeComponents.tsx:66` | 훅 집합이 바뀌어 Rules of Hooks 위반 | 렌더 계층. 그대로 |
- 보충: 없음
- 상태: 현행
- 출처: `04-inherited-constraints.md:31`(정본)
- 닫은 사람: 편집자 결정(4라운드, `04-inherited-constraints.md:5` 수용 기준 검토)
- 라운드: 4
- 까닭: `04-inherited-constraints.md:31`(막는 문제 칸), `04-inherited-constraints.md:3`

### GOAL-068 T-17 포커스·선택 명령의 대상 선택자

- 결정:
  > | # | 제약 | 현재의 장치 | 막는 문제 | 새 설계의 대응 |
  > | - | ---- | ----------- | --------- | -------------- |
  > | T-17 | 포커스·선택 명령의 대상은 `input, textarea, button` 하나의 선택자로 찾고, select는 `typeof element.select === 'function'`일 때만 부른다 | `useFormTypeInputControl.ts:38-41, 49-59` | 복합 컴포넌트의 오발동, `select()` 타입 에러 | 렌더 계층. 그대로 |
- 보충: 없음
- 상태: 현행
- 출처: `04-inherited-constraints.md:32`(정본)
- 닫은 사람: 편집자 결정(4라운드, `04-inherited-constraints.md:5` 수용 기준 검토)
- 라운드: 4
- 까닭: `04-inherited-constraints.md:32`(막는 문제 칸), `04-inherited-constraints.md:3`

### GOAL-069 T-18 RequestRemount 유지

- 결정:
  > | # | 제약 | 현재의 장치 | 막는 문제 | 새 설계의 대응 |
  > | - | ---- | ----------- | --------- | -------------- |
  > | T-18 | `RequestRemount`는 래퍼의 `key=version`으로 서브트리를 강제 리마운트한다 | `SchemaNodeProxy.tsx:84,89` | 일반 갱신으로 못 고치는 손상된 입력 상태의 탈출구 | **유지(D-9).** 소유자: 사용자가 서브트리의 입력을 제어·비제어와 무관하게 최신화하는 사용자 도구. ADR 0008의 "제거 후보"는 삭제 |
- 보충: 없음
- 상태: 현행
- 출처: `04-inherited-constraints.md:33`(정본)
- 닫은 사람: 편집자 결정(4라운드, `04-inherited-constraints.md:5` 수용 기준 검토), 소유자 답(`reviews/round-4.md:115` D-9)
- 라운드: 4
- 까닭: `04-inherited-constraints.md:33`(막는 문제 칸), `04-inherited-constraints.md:3`

### GOAL-070 T-19 defaultValue와 jsonSchema의 deep clone — 호출자의 객체를 바꾸지 않는 계약

- 결정:
  > | # | 제약 | 현재의 장치 | 막는 문제 | 새 설계의 대응 |
  > | - | ---- | ----------- | --------- | -------------- |
  > | T-19 | `defaultValue`와 `jsonSchema`는 마운트 시 deep clone한다 | `Form.tsx:91, 94`(`[version]` 의존) | 호출자의 객체를 제자리에서 바꾸거나 frozen 객체에서 throw | ADR 0001: 스키마는 변형하지 않으므로 clone이 필요 없다. `defaultValue`는 노드로 **분배**되므로 원본을 바꾸지 않는다 — 다만 배열·객체 리프(터미널)는 참조를 들 수 있어 clone 또는 "호출자의 객체를 바꾸지 않는다"는 계약이 필요. 4라운드 F24로 명세에 넣었다 |
- 보충: 없음
- 상태: 현행
- 출처: `04-inherited-constraints.md:34`(정본)
- 닫은 사람: 편집자 결정(4라운드, `04-inherited-constraints.md:5` 수용 기준 검토)
- 라운드: 4
- 까닭: `04-inherited-constraints.md:34`(막는 문제 칸), `04-inherited-constraints.md:3`

### GOAL-071 T-20 초기화 순서 — 생성이 곧 첫 정착

- 결정:
  > | # | 제약 | 현재의 장치 | 막는 문제 | 새 설계의 대응 |
  > | - | ---- | ----------- | --------- | -------------- |
  > | T-20 | 초기화 순서: 자식 초기화 → computed 준비 → 초기 분기 prime → 자식 처리 | `ObjectNode/…/BranchStrategy.ts:717-726` | `oneOf` 초기 렌더의 경쟁 조건 | 생성이 곧 첫 정착(A3). 순서는 단일 순회가 정한다. 수용 기준: `composition.oneOf.initial.render.test.tsx` |
- 보충: 없음
- 상태: 현행
- 출처: `04-inherited-constraints.md:35`(정본)
- 닫은 사람: 편집자 결정(4라운드, `04-inherited-constraints.md:5` 수용 기준 검토)
- 라운드: 4
- 까닭: `04-inherited-constraints.md:35`(막는 문제 칸), `04-inherited-constraints.md:3`

### GOAL-072 대체됨: T-21 reset()의 key=version 전체 리마운트 — 16라운드에 reset은 로드, 입력 단위 다시 마운트로 바뀜

- 결정:
  > | # | 제약 | 현재의 장치 | 막는 문제 | 새 설계의 대응 |
  > | - | ---- | ----------- | --------- | -------------- |
  > | T-21 | `reset()`은 루트 컨텍스트의 `key=version`으로 전체를 리마운트한다 | `Form.tsx:151, 186` | 비제어 DOM의 잔류 값과 사용자 컴포넌트의 내부 플래그 | 렌더 계층의 선택. A6의 `RequestRefresh`만으로 부족한 경우(내부 플래그)가 있으므로 그대로 두되, core의 `reset()`은 전체 교체 + Refresh다 |
- 보충:
  > "로드만으로 모자란 것은 상호작용 상태, 입력 컴포넌트의 내부 상태, Form 층의 상태 셋이며 장치를 더해 닫는다." (`09-landing-and-test-strategy.md:77`)
  > "core는 로드된 노드 모두에 Refresh를 낸다(오늘의 `Overwrite`와 같다. core는 React를 모른다, C3)." (`09-landing-and-test-strategy.md:85`)
- 상태: 대체됨(→ LANDING-039, WRITE-042, EVENT-039, REACT-019)
- 출처: `04-inherited-constraints.md:36`(정본)
- 닫은 사람: 편집자 결정(4라운드, `04-inherited-constraints.md:5` 수용 기준 검토)
- 라운드: 4
- 까닭: `04-inherited-constraints.md:36`(막는 문제 칸), `09-landing-and-test-strategy.md:77`

### GOAL-073 T-22 배열 아이템의 React key는 생성 순서의 nonce

- 결정:
  > | # | 제약 | 현재의 장치 | 막는 문제 | 새 설계의 대응 |
  > | - | ---- | ----------- | --------- | -------------- |
  > | T-22 | 배열 아이템의 React key는 생성 순서의 nonce다 | `ArrayNode/…/BranchStrategy.ts:70, 381`, `useChildNodeComponents.tsx:62` | append 시 기존 행이 리마운트되어 포커스를 잃는다 | ADR 0011 identity(R13): 인덱스와 독립적인 단조 키 유지. 통째 쓰기의 대응 규칙은 미결 |
- 보충:
  > "배열 아이템의 생김과 채움(통째 교체의 identity, `push`가 로드인가), `contains`·`prefixItems`(Q13), 큰 배열의 지연 실체화(벤치 뒤)(`08-design-a-to-z.md:458`, `adr/0011-branch-node-composition.md:92-94`)." (`reviews/round-18-agenda.md:109`)
- 상태: 현행
- 출처: `04-inherited-constraints.md:37`(정본)
- 닫은 사람: 편집자 결정(4라운드, `04-inherited-constraints.md:5` 수용 기준 검토)
- 라운드: 4
- 까닭: `04-inherited-constraints.md:37`(막는 문제 칸), `04-inherited-constraints.md:3`

### GOAL-074 T-23 분기 복원은 원본 배열 상태 우선 — 구조로 흡수

- 결정:
  > | # | 제약 | 현재의 장치 | 막는 문제 | 새 설계의 대응 |
  > | - | ---- | ----------- | --------- | -------------- |
  > | T-23 | 분기 복원은 자식의 원본 배열 상태를 합성 값보다 우선한다 | `ObjectNode/…/BranchStrategy/DETAIL.md:7, 74, 103` | `omitTrailing` 배열의 후행 빈 항목이 분기 전환에서 사라진다 | P4: 비활성화는 원본을 건드리지 않으므로 복원할 것이 없다 — 구조로 흡수. 수용 기준: 그 회귀 테스트 |
- 보충: 없음
- 상태: 현행
- 출처: `04-inherited-constraints.md:38`(정본)
- 닫은 사람: 편집자 결정(4라운드, `04-inherited-constraints.md:5` 수용 기준 검토)
- 라운드: 4
- 까닭: `04-inherited-constraints.md:38`(막는 문제 칸), `04-inherited-constraints.md:3`

### GOAL-075 새 설계에서 사라지는 장치와 그 이유

- 결정:
  > | 사라지는 것 | 이유 |
  > | ----------- | ---- |
  > | `immediate` 인자와 "UpdateValue만 동기" 예외 | 모든 통지가 동기다 |
  > | 노드별 `EventCascadeManager`와 마이크로태스크 배치 | 내부 상태 전이가 이벤트를 타지 않는다. 배치는 `batch()` |
  > | `MAX_LOOP_COUNT`의 틱별 초기화 | 상한이 정착 루프 안에 있다 |
  > | `SetValueOption`의 `Batch`·`Isolate`·`EmitChange`·`Propagate`·`PublishUpdateEvent` | 전파와 통지가 옵션이 아니라 구조다 |
  > | `flushOnMount: false`의 두 번째 단계 | 생성이 곧 첫 정착이다. 두 번째 단계가 지키던 "매크로태스크 뒤 값 불변"은 비동기 검증·`onChange`를 기다린 뒤의 단언으로 옮긴다(F23) |
  > | 비객체 값을 `{}`·`[]`로 버리는 것 | 3.1판은 보존·방출하고 type 에러를 낸다(F27). 동작 변화 |
- 보충:
  > "오늘 파서의 문자 제거, 정수 자르기, 빈 값 치환(`""`, `[]`, `{}`), 불리언의 진릿값 변환은 parse에서 뺀다." (`reviews/round-18-owner-answers.md:8`)
  > "바꾸지 못한 값은 받은 그대로 들고 `value`·방출·제출이 모두 그 값이다(비우기·대체·거부 없음)." (`reviews/round-18-owner-answers.md:9`)
- 상태: 현행(부정 결정)
- 출처: `04-inherited-constraints.md:42-49`(정본)
- 닫은 사람: 편집자 결정(4라운드, `04-inherited-constraints.md:48-49` F23·F27)
- 라운드: 4
- 까닭: `04-inherited-constraints.md:44-49`(이유 칸)

### GOAL-076 실제 브라우저의 IME 조합 중 쓰기 확인

- 결정:
  > - IME 조합 중의 쓰기: 캐럿 스파이크가 compositionstart → 입력 → compositionend 흐름을 fireEvent로 흉내 내 동기 통지에서 통과, 마이크로태스크에서 한 단계 지연을 확인했다(`spikes/events/REPORT-caret.txt`). jsdom은 조합 중 value 쓰기가 조합을 취소하는 브라우저 동작을 모델링하지 않으므로 실제 브라우저 확인이 남아 있다.
- 보충: 없음
- 상태: 열림(→ `reviews/round-18-agenda.md:111`)
- 출처: `04-inherited-constraints.md:54`(정본), `reviews/round-18-agenda.md:111`
- 닫은 사람: 편집자 결정(18라운드 안건 이관, `reviews/round-18-agenda.md:111`)
- 라운드: 18
- 까닭: `04-inherited-constraints.md:54`

### GOAL-077 대체됨: P1′의 6차 문구(다중 타입, oneOf·anyOf 분기, & 명령뿐)

- 결정:
  > - **P1′ (소유자, 2026-09-23).** 폼이 스키마에서 읽는 것은 노드 트리의 모양을 정하는 문법뿐이다. 타입(`type`, 다중 타입, 튜플), 자식의 존재(`properties`, `items`, `prefixItems`), 조건부 존재(`if/then/else`, `allOf`, `oneOf`·`anyOf`의 분기)가 그것이다. 값의 유효성을 정하는 문법(`required`, `false`, `not`, `additionalProperties`, 범위와 패턴)은 검증기의 것이고, 폼은 그 판정을 보여 줄 뿐 값을 고치지 않는다. 값을 빼거나 지우는 것은 작성자의 `&` 명령뿐이다.
- 보충: 없음
- 상태: 대체됨(→ GOAL-026)
- 출처: `06-conclusions.md:69`(정본)
- 닫은 사람: 소유자 답(`reviews/round-5-derivations.md:7` P1′)
- 라운드: 8
- 까닭: `reviews/round-5-derivations.md:7`

### GOAL-078 대체됨: P2의 6차 문구(쓰는 주체 넷)

- 결정:
  > - **P2. 원본은 호출자와 작성자만 쓴다.** 원본에 쓰는 주체는 사용자 입력, 호출자의 `setValue`와 `reset`, 작성자가 선언한 `injectTo`, 로드 계약의 `default` 넷뿐이다. 코어가 스스로 원본을 고치는 일은 없다. (7라운드에서 `&derived`가 다섯째 주체로 더해졌다. 4절 참조. P2–P5는 모두 소유자의 명시적 확인 대기 상태다(`03-mental-model.md` 107행).)
- 보충: 없음
- 상태: 대체됨(→ GOAL-028)
- 출처: `06-conclusions.md:70`(정본)
- 닫은 사람: 편집자 결정(8라운드, `06-conclusions.md:70`)
- 라운드: 8
- 까닭: `06-conclusions.md:70`

### GOAL-079 대체됨: P3의 6차 문구(선택 상태를 입력으로 둠)

- 결정:
  > - **P3. 형상은 상태의 순수 함수다.** 어떤 조각이 켜져 있고 어떤 자식이 존재하는지는 스키마, 원본 전체, 선택 상태에서 매번 같은 절차로 계산된다. 이력을 읽지 않는다. 계산은 원본을 읽기만 한다.
- 보충: 없음
- 상태: 대체됨(→ GOAL-029)
- 출처: `06-conclusions.md:71`(정본)
- 닫은 사람: 편집자 결정(8라운드, `06-conclusions.md:71`)
- 라운드: 8
- 까닭: `03-mental-model.md:5`

### GOAL-080 대체됨: 06 §3.2 P2의 문구 제안(자동 쓰기는 로드 계약과 injectTo·&derived뿐)

- 결정:
  > **3.2 P2의 문구.** "코어의 자동 쓰기는 로드 계약(`default`)과 작성자가 선언한 쓰기(`injectTo`·`&derived`)뿐이다"로 `03-mental-model.md` 10행과 45행을 고친다. P2는 아직 명시적 확인 대기이므로, 이 문장의 확인이 곧 P2의 확인이다. 이 확인에는 5.1의 답(로드 우선순위 문장을 넣을지)이 함께 들어간다.
- 보충: 없음
- 상태: 대체됨(→ GOAL-081, GOAL-028)
- 출처: `06-conclusions.md:98`(정본)
- 닫은 사람: 편집자 결정(8라운드, `06-conclusions.md:98`)
- 라운드: 8
- 까닭: `06-conclusions.md:98`

### GOAL-081 대체됨: 07 §3.2 P2의 문구(&default·&derived·&injectTo·&unsetValue)

- 결정:
  > **3.2 P2의 문구(바뀜).** "원본에 쓰는 주체는 사용자 입력, 호출자의 `setValue`와 `reset`, 그리고 작성자가 선언한 규칙(노드가 생길 때의 채움과 그 원천인 예약 층의 `&default` 또는 표준 `default`, 그리고 예약 층의 `&derived`·`&injectTo`·`&unsetValue`)이다. 코어가 스스로 원본을 고치는 일은 없다"로 `03-mental-model.md` 10행과 45행을 고친다. 06은 작성자가 선언한 쓰기로는 `injectTo`와 `&derived`만 들었고, 6항이 "확장 조작"으로 넓혔다.
- 보충: 없음
- 상태: 대체됨(→ GOAL-028)
- 출처: `07-conclusions.md:74`(정본)
- 닫은 사람: 편집자 결정(9라운드, `07-conclusions.md:74`)
- 라운드: 9
- 까닭: `07-conclusions.md:74`

### GOAL-082 대체됨: 06 §3.4 판별식 식별의 const·enum 읽기를 형상 읽기에 넣는 괄호

- 결정:
  > **3.4 P1′의 괄호.** "판별식 식별을 위한 `const`·`enum` 값 읽기는 형상 읽기에 든다"를 `03-mental-model.md` 15행에 더한다. 소유자 인용(`adr/0005:90`)이 근거다.
- 보충: 없음
- 상태: 대체됨(→ GOAL-034, GOAL-027)
- 출처: `06-conclusions.md:102`(정본), `07-conclusions.md:76`
- 닫은 사람: 소유자 답(`reviews/round-6-coherence.md:144` 소유자 인용), 편집자 결정(8라운드, `06-conclusions.md:102`)
- 라운드: 8
- 까닭: `07-conclusions.md:76`

### GOAL-083 원리 제안 P6–P9의 처리 — 새 원리로 두지 않음

- 결정:
  > - **P6 (i) "자동 쓰기는 최종 형상의 함수다"** — 전이 주입에 채택(4.2). `injectTo`에도 적용해야 숨은 파생값 반례가 닫히고, 독립 모델의 N8 실험은 "`default`만 되돌리기"로는 부족함을 보였다.
  > - **P6 (ii) "이력은 방아쇠로만 읽는다"** — 기존 도출표의 재진술. **F13 순서 힌트(직전 커밋의 활성 집합을 가드 평가 순서로 쓰는 것)는 단서 복원이 아니라 제거한다.** 6라운드가 복원하라 한 단서 "고정점이 유일한 스키마에서만"은 폼이 가드의 뜻을 해석해야 판정할 수 있어 P1′에 걸린다. 힌트를 끄면 두 이력의 결과가 같아진다는 것을 실행으로 확인했다. 역순 사슬의 비용은 Q15(직전 커밋의 활성 집합을 출발 가설로 쓰는 최적화, `open-questions.md` 90행)에서 측정한다.
  > - **P6 (iii) "배치는 순차와 같다"** — 기각(4.3).
  > - **P7 "예산은 한 칸에 같은 모양으로 관측된다"** — 예산 다섯에 한해 G4의 재진술. 로드 값이 방출에서 빠지는 신호(D-15)는 새 내용이며 7절 실험 뒤 정한다.
  > - **P8 "코어의 공개 어휘는 렌더러 중립 의미로 정의된다"** — P5의 재진술. `refresh`와 `remount`의 의미를 React의 `key` 교체로 서술한 곳을 중립 의미로 고친다. `03-mental-model.md` 13행의 "화면의 명령도 모른다"는 소유자가 명령 어휘를 코어에 두기로 한 C3 세부 3과 맞게 고친다(소유자 확인).
  > - **P9 "상태 칸 하나에 공개 이름 하나"** — 칸마다 이름 하나(단사형)는 G4의 재진술. 이름마다 칸 하나(전단사형)는 새 내용이며 6절의 이름 제안이 그것을 따른다.
- 보충: 없음
- 상태: 현행(기록)
- 출처: `06-conclusions.md:209-216`(정본), `HANDOFF.md:17`
- 닫은 사람: 스웜 수렴(편집자 결정, `06-conclusions.md:209-216`), 소유자 답(`HANDOFF.md:17` 7라운드 소유자 지시)
- 라운드: 7
- 까닭: `HANDOFF.md:17`

### GOAL-084 플러그인 FormTypeInput이 동기 UpdateValue나 Promise 배열 API에 기대는지 확인

- 결정:
  > - 플러그인이 제공하는 `FormTypeInput`들(`packages/canard/schema-form-*-plugin`) 가운데 동기 `UpdateValue`나 Promise 배열 API에 기대는 것이 있는가.
- 보충: 없음
- 상태: 열림(→ `reviews/round-18-agenda.md:139` 11-8)
- 출처: `04-inherited-constraints.md:53`(정본)
- 닫은 사람: 편집자 결정(4라운드, `04-inherited-constraints.md:51` 아직 확인하지 않은 것)
- 라운드: 4
- 까닭: `04-inherited-constraints.md:53`

### GOAL-085 용어 — 쓰는 주체 셋(작성자·호출자·사용자)의 뜻

- 결정:
  > | 용어 | 뜻 |
  > | --- | --- |
  > | 작성자 | 스키마를 쓰는 사람. 그룹 객체 셋과 표준 키워드를 적는다 |
  > | 호출자 | `<Form>`이나 core를 쓰는 코드. `setValue`·`reset`·Form 속성을 준다 |
  > | 사용자 | 입력란에 값을 넣는 사람 |
- 보충: 없음
- 상태: 현행
- 출처: `08-design-a-to-z.md:11-15`(정본)
- 닫은 사람: 편집자 결정(14라운드, `08-design-a-to-z.md:9` 용어), 편집자 결정(15라운드, `08-design-a-to-z.md:13` 그룹 객체 셋 표기)
- 라운드: 15
- 까닭: `03-mental-model.md:14`(P2의 쓰는 주체)

### GOAL-086 가치끼리 부딪히는 자리에서 설계가 고른 쪽 — 충돌 넷

- 결정:
  > | 충돌 | 고른 쪽 | 어디에 적혀 있는가 |
  > | --- | --- | --- |
  > | 표현자유도 대 예측가능성 | 표현자유도. 동적 제어를 온전히 허용하고, `setValue(getValue())`의 재채움(로드는 새 수명), `batch`와 순차의 값 차이, 순환의 가능성을 예산과 신호로 받아들인다 | 원장 §3·§4, ADR 0008 §3, 소유자 답 4 |
  > | 고속성 대 투명성 | 고속성. 진 규칙의 에지를 경고 없이 소비하고 상태 칸을 둘로 제한한다. 14라운드에 개발 모드 정착 기록을 더해 프로덕션 비용 없이 추적성을 되찾았다 | 원장 §4·§5(정착 추적 행) |
  > | 고속성 대 일관성 | 고속성. 조상 잠금 상속을 두지 않아 트리 순회 비용을 없앴다. 그 대신 "그 노드에만"이라는 한 규칙으로 일관성을 잡았다 | 원장 §4 병합표 상태 키 행, 소유자 13라운드 답 1 |
  > | 표현자유도 대 일관성 | 일관성. `&`는 제어 키에만 붙이고 표현 키는 접두가 없다(15라운드에 그룹 셋으로 대체). 하나의 개념에 하나의 장치(게이트 둘, 없음으로 만드는 장치 하나) | 원장 §1.4, 소유자 13라운드 답 3 |
- 보충: 없음
- 상태: 현행
- 출처: `08-design-a-to-z.md:522-527`(정본), `reviews/raw-round14-antigravity.md:26-31`
- 닫은 사람: 스웜 수렴(편집자 결정, `reviews/raw-round14-antigravity.md:26-31`; 앞 세 행), 편집자 결정(14라운드 가치 검토, `08-design-a-to-z.md:520`), 편집자 결정(15라운드, `08-design-a-to-z.md:527` 그룹 셋 대체 표기)
- 라운드: 15
- 까닭: `reviews/raw-round14-antigravity.md:29-31`, `reviews/round-14-values-check.md:3`

### GOAL-087 C3 남은 세부 — 스키마 타입의 컴포넌트 자리를 core가 불투명하게 다루고 바인딩 계층이 타입을 입히는 방법

- 결정:
  > 남은 세부: 스키마 타입에서 컴포넌트 자리를 core가 어떻게 불투명하게 다루고 바인딩 계층이 어떻게 타입을 입히는가.
- 보충: 없음
- 상태: 열림(→ `reviews/round-18-agenda.md:140` 11-9)
- 출처: `open-questions.md:62`(정본)
- 닫은 사람: 편집자 결정(2라운드, `open-questions.md:58` Q8)
- 라운드: 2
- 까닭: `00-goals.md:115`(C3 세부 1)
