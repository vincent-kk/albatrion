# 단일 원장 — 쓰기

영역: 쓰기(WRITE) — 쓰기 종류, core는 값을 고치지 않는다, 형변환. 기준 커밋: `ba398c330`(저장소 `packages/canard/schema-form/architecture`). 이 원장이 인용하는 `path:line`은 모두 이 커밋의 줄 번호다. 정본 우선순위는 다음 순서다. (1) 소유자 답은 고정이다. 18라운드 소유자 답 S1(`reviews/round-18-owner-answers.md:7-9`)은 parse와 형변환에 관한 앞 문장을 대체한다. (2) `adr/0013-core-does-not-rewrite-values.md`가 이 영역의 정본이다(그 문서의 상태 줄은 "제안(5차 본문)"이며 `ledger/README.md` §2의 표가 이 영역의 정본으로 적는다). (3) `03-mental-model.md` §3(원리 원장)은 `08-design-a-to-z.md` §8과 다르면 03이 이긴다. ADR 0013이 적지 않은 나감의 비움 세부와 로드의 수명은 03 §3이 정본이다. (4) 뒤 라운드가 앞 라운드를 이긴다. `09-landing-and-test-strategy.md` §2.6(`reset`)은 16라운드 스웜 수렴의 정본이다. (5) `06-conclusions.md`·`07-conclusions.md`는 그때의 기록이다. 거기 적힌 규칙이 뒤 문서에 없으면 항목이 되고, 뒤 문서가 바꿨으면 "대체됨"으로 남는다. 값 조작 표(`02-target-overview.md` §4, `07-conclusions.md` 4.28, `08-design-a-to-z.md` §8.3)는 쓰기 표에서 도출한 보기이며 항목이 아니다. 같은 대상 규칙(`08-design-a-to-z.md` §8.5)은 03 §4의 정착 영역으로 넘긴다.

## 색인

| 번호 | 한 줄 요약 | 상태 | 닫은 사람 |
| --- | --- | --- | --- |
| WRITE-001 | core는 받은 값을 고치지 않는다 — 유효하지 않은 값은 그대로 들어가고 에러로 보인다 | 현행 | 소유자 답(`reviews/round-5-derivations.md:7` P1'), 소유자 답(`reviews/round-2.md:119` 새 원칙) |
| WRITE-002 | 예외는 방출 정책뿐 — 비활성 원본을 지우는 것은 나감 정책 키를 켰을 때뿐 | 현행 | 원리(P4, `adr/0013-core-does-not-rewrite-values.md:30`), 소유자 답(`reviews/round-13-owner-answers.md:8` 2 나감 비움 기본값; 셋째 문장) |
| WRITE-003 | 제약을 입력 단계에서 강제하는 일은 입력 컴포넌트에 위임한다 | 현행 | 소유자 답(`reviews/round-2.md:119` 새 원칙), 소유자 답(`reviews/round-5-derivations.md:7` P1') |
| WRITE-004 | 형상 계산이 수렴하지 않을 때도 값은 받아들인다 | 현행 | 소유자 답(`reviews/round-2.md:116` 상한에 걸렸을 때) |
| WRITE-005 | 원본에 쓰는 주체 — 사용자 입력, 호출자, 작성자가 선언한 규칙뿐 | 현행 | 원리(P2, `03-mental-model.md:74`), 소유자 답(`reviews/round-13-owner-answers.md:8` 2 나감 비움 기본값; 나감의 비움) |
| WRITE-006 | 쓰기의 종류는 호출자가 선언한다 — core는 추론하지 않는다(D-4) | 현행 | 원리(D-4 원리에서 도출, `adr/0013-core-does-not-rewrite-values.md:3`) |
| WRITE-007 | 쓰기 표 — 원본을 바꾸는 사건, 종류, 자식 원본 | 현행 | 편집자 결정(5라운드, ADR 0013 5차 본문 `adr/0013-core-does-not-rewrite-values.md:13`), 소유자 답(`reviews/round-10-owner-answers.md:7` A-1; 채움 행), 소유자 답(`reviews/round-10-owner-answers.md:19` D-6; `controls.injectTo`의 로드 발화), 편집자 결정(9라운드 도출, `07-conclusions.md:276`; `controls.derived` 행의 에지), 소유자 답(`reviews/round-12-owner-answers.md:19` §9 로드에서 `&derived`; `controls.derived`의 로드 발화), 소유자 답(`reviews/round-10-owner-answers.md:29,39` E-21; `controls.unsetValue` 행), 소유자 답(`reviews/round-13-owner-answers.md:8` 2 나감 비움 기본값; 나감의 비움 행), 소유자 답(`reviews/round-17-owner-answers.md:10` R17-2; 나감의 비움 행의 하위 트리), 소유자 답(`reviews/round-17-owner-answers.md:11` R17-3; 리프 입력 행의 `options.trim`), 편집자 결정(17라운드, `reviews/round-17-owner-answers.md:11` 반영 칸; 리프 입력 행에 둔 쓰기 종류), 편집자 결정(18라운드, 소유자 물음으로 올림, `reviews/round-18-agenda.md:160`), 소유자 답(`reviews/round-18-owner-answers.md:12` 12-2; trim 행만 WRITE-078로 대체), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-59) |
| WRITE-008 | 자동 쓰기는 다섯 — 억제 비트는 그 호출이 일으킨 다섯을 모두 끈다(D-5) | 대체됨(→ WRITE-078) | 원리(D-5 원리에서 도출, `adr/0013-core-does-not-rewrite-values.md:3`), 소유자 답(`reviews/round-13-owner-answers.md:8` 2 나감 비움 기본값; 다섯째 나감의 비움), 편집자 결정(9라운드, `07-conclusions.md:304` 6.1 소유자가 동의한 이름), 소유자 답(`reviews/round-18-owner-answers.md:12` 12-2; 대체) |
| WRITE-009 | `options.trim`의 자른 값은 사용자 입력과 같은 쓰기 — 자동 쓰기가 아니다 | 대체됨(→ WRITE-078) | 소유자 답(`reviews/round-17-owner-answers.md:11` R17-3; 포커스 아웃 때 자름), 편집자 결정(17라운드, `reviews/round-17-owner-answers.md:11` 반영 칸; 사용자 입력과 같은 쓰기, 자동 쓰기 아님), 편집자 결정(18라운드, 소유자 물음으로 올림, `reviews/round-18-agenda.md:160`), 소유자 답(`reviews/round-18-owner-answers.md:12` 12-2; 대체) |
| WRITE-010 | "없음"과 `''`·`null`·`{}`은 다르다 — `undefined`를 쓰면 없음 | 현행 | 소유자 답(`reviews/round-10-owner-answers.md:15` C-11), 소유자 답(`reviews/round-10-owner-answers.md:18` C-2), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-18) |
| WRITE-011 | `controls.derived`는 원본을 쓴다 | 현행 | 편집자 결정(6라운드 D-11, `06-conclusions.md:112`), 편집자 결정(9라운드, `07-conclusions.md:90` 4.0의 4.1 행) |
| WRITE-012 | `controls.injectTo` — 작성자가 선언한 전체 교체, 런타임은 에지, 로드에서 발화 | 현행 | 소유자 답(`reviews/round-10-owner-answers.md:19` D-6), 편집자 결정(4라운드, 에지 발화 F11 `reviews/round-4-spec.md:144`) |
| WRITE-013 | 자동 쓰기는 비객체 호스트의 원본을 건드리지 않고 core는 호출자가 넘긴 객체를 바꾸지 않는다 | 현행 | 편집자 결정(5라운드, ADR 0013 4차 본문 `adr/0013-core-does-not-rewrite-values.md:12`; F10·T-12·F24·T-19), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-100) |
| WRITE-014 | null은 키 없는 전체 교체다(D-1) | 분할됨(→ WRITE-092, WRITE-090) | 원리(D-1 원리에서 도출, `adr/0013-core-does-not-rewrite-values.md:3`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-16), 소유자 답(`reviews/round-18-owner-answers.md:26` 18C 검토 4번; 대체) |
| WRITE-015 | 쓰기 옵션 — 비트마스크 `SetValueOption`, Form 속성, 기본·자리·우선순위·배치·범위·`Merge` | 현행 | 소유자 답(`reviews/round-4.md:113` D-7; 호출 단위 비트), 원리(D-5 원리에서 도출, `adr/0013-core-does-not-rewrite-values.md:3`; 범위), 편집자 결정(9라운드, `07-conclusions.md:304` 6.1 소유자가 동의한 이름), 편집자 결정(6라운드 D-19, `06-conclusions.md:163`; `Merge`의 배열 통째 교체), 16라운드 스웜 수렴(편집자 결정, `adr/0013-core-does-not-rewrite-values.md:8`; 배치 행의 `fn` 안 `reset`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-59) |
| WRITE-016 | `Refresh`는 옵션이 아니라 core가 출처로 판단한다 | 현행 | 편집자 결정(5라운드 후속 C-5·C-6, `open-questions.md:52`), 소유자 답(`reviews/round-2.md:117` 비제어 입력의 복구; 설계 위임) |
| WRITE-017 | `setValue(getValue())`에는 로드 뒤의 채움이 그대로 적용된다(D-7 (a)) | 대체됨(→ WRITE-090) | 소유자 답(`reviews/round-4.md:113` D-7), 소유자 답(`reviews/round-18-owner-answers.md:26` 18C 검토 4번; 대체) |
| WRITE-018 | 값을 통째로 주입할 때 — 모든 노드로 분배, 방출에서만 빠짐, 로드에는 나감이 없음 | 현행 | 편집자 결정(5라운드, ADR 0013 5차 본문 `adr/0013-core-does-not-rewrite-values.md:13`), 소유자 답(`reviews/round-10-owner-answers.md:8` A-2; 노드 게이트는 조각 게이트와 같은 장치), 편집자 결정(13라운드, `03-mental-model.md:84`; 로드에는 나감이 없음) |
| WRITE-019 | 잠복 — 전체 교체가 옛 잠복 값을 없애고, 남는 잠복 하나는 `getInactiveValues(path)`로 열거 | 현행 | 편집자 결정(2라운드 codex 교차검증 반영, `adr/0013-core-does-not-rewrite-values.md:100`), 원리(P4, `adr/0013-core-does-not-rewrite-values.md:78`) |
| WRITE-020 | 잠복 값 열거 API `getInactiveValues(path)`의 반환 모양 | 대체됨(→ WRITE-087) | 편집자 결정(5라운드, ADR 0013 미결 `adr/0013-core-does-not-rewrite-values.md:102`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-81) |
| WRITE-021 | 초기값 보존 옵션 — (a) 기각, (b)의 둘은 기본 계약, 하나는 기각, `preserveDefaultValue`는 억제 비트로 | 현행 | 소유자 답(`reviews/round-2.md:118` 로드 → 저장의 왕복), 편집자 결정(2라운드 codex 교차검증 반영, `adr/0013-core-does-not-rewrite-values.md:100`), 원리(P4, `adr/0013-core-does-not-rewrite-values.md:82`) |
| WRITE-022 | core가 값을 바꾸던 곳 — 배열 길이 채우기·차단은 입력 컴포넌트로, `null`→`{}`와 `Normalize`는 폐기 | 현행 | 소유자 답(`reviews/round-2.md:119` 새 원칙; 배열 행), 편집자 결정(5라운드, ADR 0013 4차 본문 `adr/0013-core-does-not-rewrite-values.md:12`; F27·E16) |
| WRITE-023 | core가 값을 바꾸던 곳 — 분기 전환·`active` 전이의 reset은 기본 폐기 | 현행 | 소유자 답(`reviews/round-13-owner-answers.md:8` 2 나감 비움 기본값) |
| WRITE-024 | core가 값을 바꾸던 곳 — 조각이 켜질 때의 `default` 주입은 채움으로 | 현행 | 소유자 답(`reviews/round-10-owner-answers.md:7` A-1), 소유자 답(`reviews/round-9-spec.md:52` 읽기2 채우기 원천), 소유자 답(`reviews/round-9-spec.md:56` 읽기2 시점(A/B)) |
| WRITE-025 | core가 값을 바꾸던 곳 — `computed.derived`·`injectTo`는 예약 층으로 남고 `controls.unsetValue`가 더해진다 | 현행 | 원리(P2, `adr/0013-core-does-not-rewrite-values.md:36`), 소유자 답(`reviews/round-12-owner-answers.md:13` 5 `&clearValue` 두 문장) |
| WRITE-026 | core가 값을 바꾸던 곳 — 참조 그룹 `options.virtual`은 현행 유지 | 현행 | 소유자 답(`reviews/round-10-owner-answers.md:31` E-4), 소유자 답(`reviews/round-12-owner-answers.md:16` 8 `virtual`) |
| WRITE-027 | 로드는 새 수명 — 형상의 모든 노드를 생긴 노드로 친다 | 대체됨(→ WRITE-090) | 편집자 결정(9라운드 도출, `07-conclusions.md:106` 4.22), 소유자 답(`reviews/round-10-owner-answers.md:7` A-1), 소유자 답(`reviews/round-18-owner-answers.md:26` 18C 검토 4번; 대체) |
| WRITE-028 | `controls.unsetValue` — 로드 정착에서 참이면 지우고 런타임은 경계에서만 | 현행 | 소유자 답(`reviews/round-10-owner-answers.md:29,39` E-21), 편집자 결정(12라운드 수용, `07-conclusions.md:251`) |
| WRITE-029 | 형상에 없는 노드의 규칙은 평가하지 않는다 — 다시 생기면 에지는 거짓→참 | 현행 | 소유자 답(`reviews/round-12-owner-answers.md:18` §9 형상에 없는 노드) |
| WRITE-030 | 값 조작 셋의 대응 — 채움, 바꾸기, 지우기의 장치 | 현행 | 소유자 답(`reviews/round-9-spec.md:48` 읽기2), 소유자 답(`reviews/round-10-owner-answers.md:15` C-11; 런타임 채움 키 없음), 소유자 답(`reviews/round-12-owner-answers.md:20` §9 `undefined` 반환), 소유자 답(`reviews/round-13-owner-answers.md:8` 2 나감 비움 기본값; 나감의 발화원) |
| WRITE-031 | 나감 정책 키 `unsetOnInactive` — 이름, 형, 네 층, 같은 층은 유지 우선 | 현행 | 소유자 답(`reviews/round-12-owner-answers.md:10` 3 꺼질 때 값 정책; 별도 옵션), 소유자 답(`reviews/round-13-owner-answers.md:17` 나감 정책 키 이름), 소유자 답(`reviews/round-13-owner-answers.md:8` 2 나감 비움 기본값; 기본 유지), 소유자 답(`reviews/round-10-owner-answers.md:16` C-15; `controls.children` 항목의 값 키), 소유자 답(`reviews/round-13-owner-answers.md:16` Form 속성의 자리; Form 속성 층), 편집자 결정(13라운드, 소유자 검토 문서가 장치의 모양으로 제시 `reviews/round-13-owner-review.md:66`; 세부가 포괄을 덮음), 편집자 결정(15라운드 결정 2, `08-design-a-to-z.md:298`; 형용사 형), 17라운드 스웜 수렴(편집자 결정, `08-design-a-to-z.md:298`; Form 속성은 `boolean`만), 편집자 결정(12라운드 도출, `reviews/round-12-derivation.md:60`; 같은 층은 유지 우선) |
| WRITE-032 | 나감의 정책은 직전 커밋의 선언으로 정하고 조각 층은 꺼지는 순간에도 적용된다 | 현행 | 원리(P3, `03-mental-model.md:94`) |
| WRITE-033 | 나가는 객체·분기의 정책은 함께 나가는 하위 트리로 내려간다(R17-2 ㄴ) | 현행 | 소유자 답(`reviews/round-17-owner-answers.md:10` R17-2), 소유자 답(`reviews/round-13-owner-answers.md:7` 1 잠금 규칙; `children` 그룹 예외) |
| WRITE-034 | 나감 사슬의 세부 셋 — 선언의 나감, 잠복 자손, 선언의 나감의 `extras` | 현행 | 17라운드 스웜 수렴(편집자 결정, `reviews/raw-round17-convergence.md:117`) |
| WRITE-035 | 비움으로 정해진 노드는 `raw`와 `extras`를 모두 없음으로 한다 | 현행 | 17라운드 스웜 수렴(편집자 결정, `03-mental-model.md:94`) |
| WRITE-036 | 쓰기로 원본이 없어진 소멸은 나감이 아니다 — `controls.children` 항목의 `controls.active: false`는 노드 게이트 | 현행 | 17라운드 스웜 수렴(편집자 결정, `reviews/raw-round17-convergence.md:78` O8-다; 소멸), 17라운드 스웜 수렴(편집자 결정, `08-design-a-to-z.md:299`; 항목 게이트의 층) |
| WRITE-037 | 나감의 비움 — 단위는 노드의 나감, 로드에는 없음, 다섯째 자동 쓰기, 기본은 유지 | 현행 | 소유자 답(`reviews/round-13-owner-answers.md:8` 2 나감 비움 기본값), 소유자 답(`reviews/round-13-owner-answers.md:17` 나감 정책 키 이름), 편집자 결정(13라운드, `adr/0013-core-does-not-rewrite-values.md:10`) |
| WRITE-038 | 나감에서 식과 Form 속성의 시점 — 직전 커밋의 값 | 현행 | 17라운드 스웜 수렴(편집자 결정, `08-design-a-to-z.md:301`), 소유자 답(`reviews/round-17-owner-answers.md:13` 통보 2), 소유자 답(`reviews/round-12-owner-answers.md:18` §9 형상에 없는 노드) |
| WRITE-039 | 노드 게이트 `controls.active: false`도 같은 장치 — `controls.visible`은 언제나 보존 | 현행 | 원리(G4, `reviews/round-12-derivation.md:61`), 소유자 답(`reviews/round-13-owner-answers.md:8` 2 나감 비움 기본값; 정책대로) |
| WRITE-040 | 나감의 비움의 비용 — 하위 트리를 위에서 아래로 한 번 순회 | 현행 | 편집자 결정(14라운드, `reviews/raw-round14-unset-subtree.md:23`; 첫째–둘째 문장), 17라운드 스웜 수렴(편집자 결정, `reviews/raw-round17-convergence.md:117`; 셋째 문장) |
| WRITE-041 | 오늘의 꺼짐·켜짐 동작은 이주 항목 — 방출에서 지움과 원본 지움의 차이 셋 | 현행 | 소유자 답(`reviews/round-13-owner-answers.md:8` 2 나감 비움 기본값) |
| WRITE-042 | `reset`은 로드로 충분하다 — 판정 기준 | 현행 | 소유자 답(`reviews/round-16-owner-answers.md:8` 2), 16라운드 스웜 수렴(편집자 결정, `09-landing-and-test-strategy.md:79`) |
| WRITE-043 | `reset`의 경로 — 같은 스키마면 로드, 다르면 재생성 | 현행 | 16라운드 스웜 수렴(편집자 결정, `09-landing-and-test-strategy.md:79`), 소유자 답(`reviews/round-16-owner-answers.md:16` 10) |
| WRITE-044 | `reset`의 값의 출처와 재대조 | 현행 | 16라운드 스웜 수렴(편집자 결정, `09-landing-and-test-strategy.md:79`) |
| WRITE-045 | `reset`이 유지하는 것, 상호작용과 Form 층의 초기화 | 현행 | 16라운드 스웜 수렴(편집자 결정, `09-landing-and-test-strategy.md:79`), 소유자 답(`00-goals.md:109` C6; `dirty`·`touched` 현행 유지), 소유자 답(`reviews/round-17-owner-answers.md:9` R17-1; `diagnostics` 재기록) |
| WRITE-046 | `reset`의 스키마가 다른 경로 — 호출 안에서 동기로 재생성하고 옛 트리를 폐기 | 현행 | 16라운드 스웜 수렴(편집자 결정, `09-landing-and-test-strategy.md:79`) |
| WRITE-047 | 소비자가 든 옛 노드가 옛 트리를 붙잡는 범위 | 대체됨(→ WRITE-086) | 편집자 결정(17라운드, 18라운드 안건으로 이관 `reviews/round-18-agenda.md:111`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-61) |
| WRITE-048 | `reset`이 로드하는 배열의 아이템 identity — `reset`만의 예외를 두지 않는다 | 현행 | 16라운드 스웜 수렴(편집자 결정, `09-landing-and-test-strategy.md:79`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-103) |
| WRITE-049 | `FormHandle.reset`의 값 출처 규칙을 노드 `resetSubtree()`에 옮기지 않는다 | 현행 | 16라운드 스웜 수렴(편집자 결정, `09-landing-and-test-strategy.md:79`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-44) |
| WRITE-050 | `resetSubtree`를 남길지와 남길 때의 값 출처 | 대체됨(→ WRITE-085) | 편집자 결정(17라운드, 18라운드 안건으로 이관 `reviews/round-18-agenda.md:88`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-44) |
| WRITE-051 | `reset`의 비용 | 현행 | 16라운드 스웜 수렴(편집자 결정, `09-landing-and-test-strategy.md:79`), 소유자 답(`reviews/round-16-owner-answers.md:16` 10) |
| WRITE-052 | 노드마다 타입에 맞는 parse — 뜻이 그대로인 변환만(형 정규화, ADR 0013 결정 1의 이름 붙은 예외) | 현행 | 소유자 답(`reviews/round-18-owner-answers.md:7` S1), 소유자 답(`reviews/round-18-owner-answers.md:8` S1 이어서), 편집자 결정(18라운드, `reviews/round-18-owner-answers.md:8`; 이름 붙은 예외(형 정규화)의 표기) |
| WRITE-053 | 변환 목록 — ajv `coerceTypes`의 부분집합, 자동 변환은 늘 켜져 있다 | 분할됨(→ WRITE-075, WRITE-076) | 소유자 답(`reviews/round-18-owner-answers.md:8` S1 이어서; ajv 규칙 수준), 18라운드 스웜 수렴(편집자 결정, `reviews/raw-round18-s1-unconvertible-review.md:81`; 변환 목록), 편집자 결정(18라운드, `reviews/round-18-owner-answers.md:9`; 늘 켜짐) |
| WRITE-054 | 바꾸지 못한 값은 받은 그대로 든다 — 정합 상태(경고등)가 공개 형의 판별자 | 현행 | 소유자 답(`reviews/round-18-owner-answers.md:9` S1 셋째) |
| WRITE-055 | 변환하지 못한 입력의 `onError` 경고 — level, 코드(가칭), 보내는 때, 제출 | 중복(→ ERROR-182) | 소유자 답(`reviews/round-18-owner-answers.md:9` S1 셋째; `onError` 전달), 편집자 결정(18라운드, `reviews/round-18-owner-answers.md:9`; level·코드·보내는 때), 소유자 답(`reviews/round-17-owner-answers.md:14` 통보 3; 제출) |
| WRITE-056 | parse를 부르는 자리와 적용 범위 | 현행 | 편집자 결정(18라운드, `reviews/round-18-owner-answers.md:7`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-36) |
| WRITE-057 | S1 결정의 후속 세부 | 분할됨(→ VALUE-030, SURFACE-052, CONTROLS-074, WRITE-084, REACT-027, LANDING-150, LANDING-151, LANDING-125, ERROR-195, VALUE-033) | 편집자 결정(18라운드, `reviews/round-18-owner-answers.md:9`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-40) |
| WRITE-058 | `setValue(undefined)`의 정의와 입력의 객체 전체 쓰기의 종류 | 분할됨(→ WRITE-080, WRITE-081) | 편집자 결정(17라운드, 18라운드 안건으로 이관 `reviews/round-18-agenda.md:42,46`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-16·18C-17) |
| WRITE-059 | 배열 아이템의 생김과 채움의 세부 | 대체됨(→ NODE-051, WRITE-088, FRAGMENT-051, NODE-052) | 편집자 결정(17라운드, 18라운드 안건으로 이관 `reviews/round-18-agenda.md:109`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-59) |
| WRITE-060 | `controls.derived`의 덮어쓰기 — 레벨과 혼합안을 버리고 에지로 | 현행(부정 결정) | 편집자 결정(9라운드 도출, `07-conclusions.md:276`) |
| WRITE-061 | 대체됨: 타입별 파서의 강제 변환은 입력 컴포넌트로(ADR 0013 분류표 행) | 대체됨(→ WRITE-052) | 소유자 답(`reviews/round-18-owner-answers.md:7` S1), 소유자 답(`reviews/round-18-owner-answers.md:8` S1 이어서) |
| WRITE-062 | 대체됨: 파서 강제 변환의 폐기는 유지(ADR 0013 `trim` 행의 끝) | 대체됨(→ WRITE-052) | 소유자 답(`reviews/round-18-owner-answers.md:7` S1) |
| WRITE-063 | 대체됨: 오늘의 `src/core/parsers/`를 그대로 쓴다(S1 첫 반영) | 대체됨(→ WRITE-052) | 소유자 답(`reviews/round-18-owner-answers.md:8` S1 이어서) |
| WRITE-064 | 대체됨: 공개 값 형은 오늘처럼 그 타입의 값, 파싱 실패는 `NaN`(S1 첫 반영) | 대체됨(→ WRITE-054) | 소유자 답(`reviews/round-18-owner-answers.md:9` S1 셋째) |
| WRITE-065 | 대체됨: 쓰기 옵션은 비트 워드가 아니라 옵션 객체(5라운드 후속 C-5·C-6) | 대체됨(→ WRITE-015) | 편집자 결정(9라운드, `07-conclusions.md:345` 6.2의 N1) |
| WRITE-066 | 대체됨: `PreventInjection`은 `disableDefaultInjection`(이름 후보)이 됐다 | 대체됨(→ WRITE-015) | 편집자 결정(9라운드, `07-conclusions.md:304` 6.1 소유자가 동의한 이름) |
| WRITE-067 | 대체됨: 통째로 받은 배열의 아이템과 `push()`로 만든 아이템은 로드로 취급해 `default`가 들어간다(06 4.7) | 대체됨(→ WRITE-015, WRITE-007, WRITE-059) | 소유자 답(`reviews/round-10-owner-answers.md:7` A-1), 편집자 결정(9라운드, `07-conclusions.md:106` 4.22) |
| WRITE-068 | 대체됨: 조각이 꺼질 때 값을 제거하는 옵션의 기본값은 true(12라운드 답 3) | 대체됨(→ WRITE-031, WRITE-037) | 소유자 답(`reviews/round-13-owner-answers.md:8` 2 나감 비움 기본값) |
| WRITE-069 | 비객체 V의 `Merge`와 되먹임 거부를 호출자에게 알리는 표면(`setValue(undefined)`와 함께) | 분할됨(→ WRITE-079, WRITE-081, ERROR-194) | 편집자 결정(17라운드, 18라운드 안건으로 이관 `reviews/round-18-agenda.md:42,43`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-16·18C-17) |
| WRITE-070 | 객체 호스트 `default`의 자손 분배 규칙 | 대체됨(→ WRITE-082) | 편집자 결정(17라운드, 18라운드 안건으로 이관 `reviews/round-18-agenda.md:44`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-18) |
| WRITE-071 | `defaultValue`는 분배 시 복사하거나 불변으로 취급한다(F24) | 현행 | 편집자 결정(4라운드, F24 `reviews/round-4-spec.md:157`) |
| WRITE-072 | 대체됨: 자동 쓰기는 `default` 주입, `injectTo`, `&derived` 셋(06 용어) | 대체됨(→ WRITE-008) | 소유자 답(`reviews/round-10-owner-answers.md:7` A-1; `default` 주입이 채움으로), 소유자 답(`reviews/round-12-owner-answers.md:13` 5 `&clearValue`; `controls.unsetValue`가 더해짐), 소유자 답(`reviews/round-13-owner-answers.md:8` 2 나감 비움 기본값; 다섯째 나감의 비움) |
| WRITE-073 | 대체됨: D-5의 끄는 스위치는 로드의 `default` 하나만 끈다(06 4.14) | 대체됨(→ WRITE-008, WRITE-015) | 편집자 결정(9라운드, `07-conclusions.md:103` 4.0의 4.14 행), 편집자 결정(9라운드, `07-conclusions.md:345` 6.2의 N1) |
| WRITE-074 | 억제 옵션의 JSDoc이 "로드"를 정의한다 | 현행 | 편집자 결정(5라운드 소비자 검토 반영, `reviews/raw-round5-consumer.md:184`) |
| WRITE-075 | 변환 목록 — ajv `coerceTypes`의 부분집합 | 현행 | 소유자 답(`reviews/round-18-owner-answers.md:8` S1 이어서; ajv 규칙 수준), 18라운드 스웜 수렴(편집자 결정, `reviews/raw-round18-s1-unconvertible-review.md:81`; 변환 목록) |
| WRITE-076 | 자동 변환은 늘 켜져 있다 — 끄는 옵션을 두지 않는다 | 현행 | 소유자 답(`reviews/round-18-owner-answers.md:11` 12-1) |
| WRITE-077 | 자동 변환을 끄는 옵션 — 두지 않되 필요하면 `<Form>`의 prop 하나로 | 현행 | 소유자 답(`reviews/round-18-owner-answers.md:11` 12-1) |
| WRITE-078 | 포커스 아웃 trim의 쓰기는 자동 쓰기(여섯째) — 억제 비트의 대상, 같으면 쓰지 않음 | 현행 | 소유자 답(`reviews/round-18-owner-answers.md:12` 12-2), 소유자 답(`reviews/round-17-owner-answers.md:11` R17-3 "다") |
| WRITE-079 | 비객체 V의 `Merge`는 그 자리를 통째로 바꾼다 — 부분 쓰기라 채움은 생긴 노드에만, 로드 아닌 쓰기의 `null`은 채움을 받지 않음 | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-16) |
| WRITE-080 | 입력 `onChange`의 쓰기 종류 — 옵션 없으면 입력 쓰기(부분), `Overwrite`면 그 노드의 로드, `Merge`면 부분 쓰기 | 분할됨(→ WRITE-091, WRITE-090) | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-16), 소유자 답(`reviews/round-18-owner-answers.md:26` 18C 검토 4번; 대체) |
| WRITE-081 | `Overwrite`는 V가 `undefined`여도 로드이며 채움을 받는다 — 채움 없이 빼는 길은 `Merge`·`DisableAutomaticWrites`·옵션 없는 입력 `onChange(undefined)` | 대체됨(→ WRITE-090) | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-17), 소유자 답(`reviews/round-18-owner-answers.md:26` 18C 검토 4번; 대체) |
| WRITE-082 | 호스트 채움 값의 분배와 객체 호스트 '없음'의 정의(상태 둘에서 계산) — `{}`도 호스트 `default`를 막지 않음 | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-18) |
| WRITE-083 | 포커스 아웃 `trim`은 자동 쓰기 — 원본만 쓰고, 바깥 오류와 dirty는 건드리지 않으며, 같은 값이면 쓰지 않음 | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-19) |
| WRITE-084 | `interpret` 칸의 계약 — 순수, 던지지 않음, 모든 입력에 값, 멱등, 바꾸지 못하면 항등 | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-40) |
| WRITE-085 | 노드 되돌림의 출처는 루트의 로드 스냅숏 — 로드마다 `setIn`, `defaultValue`는 `getIn(snapshot, path)`, `resetSubtree()`는 상태 비움 뒤 로드, 배열 아이템은 구조 연산을 따라 자기 값 | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-44), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-97), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-103), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-105) |
| WRITE-086 | 재생성 reset의 폐기는 참조를 끊지 않는다 — 폐기의 네 일, 옛 노드의 읽기와 쓰기, 트리를 붙잡는 비용의 문서화 | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-61) |
| WRITE-087 | 잠복 원본 열거의 반환 모양 — 읽기 전용 `{ path, value }` 배열, 전순서, 얼린 빈 배열 공유, 커밋 단계 메모 | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-81) |
| WRITE-088 | `push`는 로드가 아니라 구조 연산 — 만든 아이템은 생긴 노드로서 채움을 받고, `push(v)`면 없음인 자손에만 채움 | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-59) |
| WRITE-089 | core는 타입별 빈 값을 만들지 않는다 — 채움의 원천은 `controls.default` > `default` > 없음, 오늘의 `getEmptyValue` 경로는 없음, 빈 호스트의 방출은 VALUE-034 | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-87) |
| WRITE-090 | 채움은 노드가 생길 때만 — 로드는 마운트·`reset()`·`resetSubtree()`, `setValue(V)`는 전체 교체 쓰기(`setValue(undefined)`는 채움 없이 비우고 `setValue(getValue())`는 멱등) | 현행 | 소유자 답(`reviews/round-18-owner-answers.md:26` 18C 검토 4번), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-96), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-97), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-102), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-103) |
| WRITE-091 | 입력 `onChange`의 쓰기 종류에서 그대로인 것 — 옵션 없으면 입력 쓰기(부분, 자기 입력에 Refresh 없음), 두 번째 인자로 비트마스크, `Merge`면 부분 쓰기, 억제 비트, `handleChange`의 부수 효과는 그대로 | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-16) |
| WRITE-092 | null은 키 없는 전체 교체다(D-1) — 모든 자식의 원본이 없음, null 아래에 원본을 남기지 않음 | 현행 | 원리(D-1 원리에서 도출, `adr/0013-core-does-not-rewrite-values.md:3`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-16) |
| WRITE-093 | `union` 행의 해석 — 기본 spec과 유효 목록, `isMember`·`convert`·`interpret`(규칙 A: 순서 무관·멱등·무할당), 노드에 드는 모든 쓰기의 경계와 한 진입의 두 번 해석, `Merge`는 통째, `trim`은 `finishInput`, PR-2·PR-4 게이트 | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-91), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-104) |
| WRITE-094 | `setValue(V)`는 로드가 아니지만 V에 없는 경로의 원본(잠복 원본 포함)을 없음으로 만든다 — 잠복 원본이 지워지는 길 셋, 멱등은 방출 값·채움·에지에 대해 | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-96) |
| WRITE-095 | 아이템을 만들거나 없애는 모든 쓰기는 스냅숏 배열의 자리를 맞춘다 — 새 자리는 `undefined`, 값은 싣지 않음, O(배열 길이) | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-97), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-105) |
| WRITE-096 | null 계약의 문구 — 로드가 아닌 쓰기로 온 `null` 아래 자식은 채움 없이 없음, 로드로 온 `null`은 채움, 쓰기 종류에 호출자 전체 교체 | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-100) |
| WRITE-097 | 정리 — 억제 비트의 범위(로드·전체 교체 쓰기·`Merge`), 낡은 근거와 가리킴, LANDING-118, `setValue(undefined)`와 노드 게이트의 채움 | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-103) |
| WRITE-098 | U7 정련 — 쓰기 경계는 정적 목록(`schemaType`, `nullable`)으로 한 번, 전이 단계는 최종 유효 목록이 좁은 노드만 원래 쓰인 값을 다시 해석, 로드도 같음, 유효 목록의 정의, PR-2 게이트 | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-104), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-105) |
| WRITE-099 | U7 정련 2 — 전이 단계의 재해석은 전이 쓰기(다음 라운드, 한 라운드에 한 번, 상한이면 원본 B에는 쓰기 경계의 해석만), `VALIDATOR_COMPILE_FAILED`는 폼 수준 기록, 정적 선언 없는 이름의 게이트 없는 분기끼리 fold가 다르면 청사진 오류, `node.type`은 여덟, `union` 입력이 보내는 값, 목록 밖 `default`는 노드가 생길 때마다, `push(v)`의 스냅숏은 생성 값, `NON_JSON_WHOLE_VALUE`는 개발 모드에서만, 좁혀지지 않은 유효 목록은 `schemaType` 그 값, PR-2·PR-4·PR-1 게이트 | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-105), 소유자 답(`reviews/round-18-owner-answers.md:24` 18C 검토 1번; 입력이 보내는 값) |

## 항목

### WRITE-001 core는 받은 값을 고치지 않는다 — 유효하지 않은 값은 그대로 들어가고 에러로 보인다

- 결정:
  > **core는 받은 값을 고치지 않는다.** 유효하지 않은 값은 그대로 들어가고 에러로 보인다. 입력을 막지 않는다.
- 보충:
  > 소유자(2026-09-23, 합의 근거): "그걸 바랐다면 ajv autofix 같은 걸 쓰지 않았을까. 나는 form이 값을 바꾸도록 이전에 설계했고, 이 방식이 사용자에게 혼란을 준다는 걸 느껴서, 값 수정은 안 하고 에러만 보여주는 걸 기본 동작으로 하려고 했다. 빼거나 지우는 건 모두 `&`로 시작하는 명령으로 조작해야 한다." (`adr/0013-core-does-not-rewrite-values.md:23`)
  > 18라운드 S1 반영: "ADR 0013 결정 1에는 이름 붙은 예외(형 정규화)로 적는다." (`reviews/round-18-owner-answers.md:8`)
  > 18라운드 S1 반영: "이것은 값의 교정이 아니라 JSON·JS 자동 형변환을 통제할 수 있게 구현한 것이므로 ADR 0013 결정 1의 대상이 아니다." (`reviews/round-18-owner-answers.md:7`)
- 상태: 현행
- 출처: `adr/0013-core-does-not-rewrite-values.md:29`(정본), `adr/0013-core-does-not-rewrite-values.md:17,23`, `06-conclusions.md:249`
- 닫은 사람: 소유자 답(`reviews/round-5-derivations.md:7` P1'), 소유자 답(`reviews/round-2.md:119` 새 원칙)
- 라운드: 5
- 까닭: `adr/0013-core-does-not-rewrite-values.md:23`

### WRITE-002 예외는 방출 정책뿐 — 비활성 원본을 지우는 것은 나감 정책 키를 켰을 때뿐

- 결정:
  > **예외는 방출 정책뿐이다 — 비활성 노드의 값은 방출에서 빠지고, `omitEmpty`·`omitTrailing`이 방출을 줄인다.** 원본을 지우는 것이 아니라 방출을 계산할 때의 투영이다(ADR 0006·0007, P4). 비활성 노드의 원본을 지우는 것은 작성자나 호출자(Form 속성)가 나감 정책 키를 켰을 때뿐이며, 그것은 core의 교정이 아니라 그들이 선언한 자동 쓰기다(P2, 13라운드 답 2).
- 보충:
  > "**비활성화는 쓰기가 아니다** — 조각이 꺼져도 원본은 기본으로 그대로다(P4, 축 4항(JSON Schema 설정은 값을 조작하지 않는다))." (`03-mental-model.md:92`)
- 상태: 현행
- 출처: `adr/0013-core-does-not-rewrite-values.md:30`(정본), `03-mental-model.md:92`
- 닫은 사람: 원리(P4, `adr/0013-core-does-not-rewrite-values.md:30`), 소유자 답(`reviews/round-13-owner-answers.md:8` 2 나감 비움 기본값; 셋째 문장)
- 라운드: 13
- 까닭: `adr/0013-core-does-not-rewrite-values.md:30`

### WRITE-003 제약을 입력 단계에서 강제하는 일은 입력 컴포넌트에 위임한다

- 결정:
  > **제약을 입력 단계에서 강제하는 일은 입력 컴포넌트에 위임한다.** core는 제약을 유효 스키마로 노출하고(`node.jsonSchema`) 위반은 검증이 알린다.
- 보충: 없음
- 상태: 현행
- 출처: `adr/0013-core-does-not-rewrite-values.md:31`(정본), `adr/0013-core-does-not-rewrite-values.md:17`
- 닫은 사람: 소유자 답(`reviews/round-2.md:119` 새 원칙), 소유자 답(`reviews/round-5-derivations.md:7` P1')
- 라운드: 5
- 까닭: `adr/0013-core-does-not-rewrite-values.md:17`

### WRITE-004 형상 계산이 수렴하지 않을 때도 값은 받아들인다

- 결정:
  > 형상 계산이 수렴하지 않을 때도 값은 받아들인다(ADR 0007).
- 보충: 없음
- 상태: 현행
- 출처: `adr/0013-core-does-not-rewrite-values.md:32`(정본)
- 닫은 사람: 소유자 답(`reviews/round-2.md:116` 상한에 걸렸을 때)
- 라운드: 2
- 까닭: `reviews/round-2.md:116`

### WRITE-005 원본에 쓰는 주체 — 사용자 입력, 호출자, 작성자가 선언한 규칙뿐

- 결정:
  > 원본에 쓰는 주체는 사용자 입력, 호출자의 `setValue`·`reset`, 그리고 작성자가 선언한 규칙뿐이다. 규칙은 노드가 생길 때의 채움과 그 원천 `controls.default`·`default`, 예약 층의 `controls.derived`·`controls.injectTo`·`controls.unsetValue`, 그리고 정책이 참으로 정해진 노드의 나감 비움이다. core가 스스로 원본을 "고치는" 일은 없다.
- 보충: 없음
- 상태: 현행
- 출처: `adr/0013-core-does-not-rewrite-values.md:36#1-3`(정본)
- 닫은 사람: 원리(P2, `03-mental-model.md:74`), 소유자 답(`reviews/round-13-owner-answers.md:8` 2 나감 비움 기본값; 나감의 비움)
- 라운드: 13
- 까닭: `adr/0013-core-does-not-rewrite-values.md:36`

### WRITE-006 쓰기의 종류는 호출자가 선언한다 — core는 추론하지 않는다(D-4)

- 결정:
  > 쓰기의 종류는 **호출자가 선언한다.** core는 추론하지 않는다(D-4).
- 보충: 없음
- 상태: 현행
- 출처: `adr/0013-core-does-not-rewrite-values.md:36#4-5`(정본), `03-mental-model.md:88`, `08-design-a-to-z.md:278`, `open-questions.md:50`
- 닫은 사람: 원리(D-4 원리에서 도출, `adr/0013-core-does-not-rewrite-values.md:3`)
- 라운드: 5
- 까닭: `adr/0013-core-does-not-rewrite-values.md:3`

### WRITE-007 쓰기 표 — 원본을 바꾸는 사건, 종류, 자식 원본

- 결정:
  > | 사건 | 종류 | 자식 원본 |
  > | ---- | ---- | -------- |
  > | 리프 입력(포커스 아웃 때 `options.trim`이 자른 값의 쓰기 포함), `setValue(V, SetValueOption.Merge)` | 부분 쓰기 | 지정한 것만 바뀐다 |
  > | `setValue(V)`(기본 `Overwrite`), `defaultValue`, `reset()` | **전체 교체(로드)** | V에 없는 자식의 원본은 **없음**이 된다 |
  > | `controls.injectTo` | 전체 교체(대상에), 작성자 선언 | 대상에 대해 위와 같다 |
  > | `controls.derived` | 자기 값 덮기, 작성자 선언 | 의존 값이 바뀔 때(에지). 사용자가 쓴 값은 다음 의존 변화 또는 그 노드가 다시 생길 때까지 남는다 |
  > | `controls.unsetValue` | 자기 값을 없음으로, 작성자 선언 | 식이 거짓에서 참이 되는 순간. 로드에서는 로드된 값으로 평가해 참이면 지운다 |
  > | 나감의 비움(선택, 기본 꺼짐) | 나간 노드의 값을 없음으로, 작성자·호출자 선언(정책 키) | 노드가 나갈 때 한 번(하위 트리 포함, 공유 노드 제외). 로드에는 없다. 전이 단계, 최종 형상 기준. 정책 키(`unsetOnInactive`)는 노드 > `controls.children`의 `controls` > 조각의 `controls` > Form 속성, 같은 층은 하나라도 유지면 유지. 나가는 객체·분기에 켠 정책은 함께 나가는 하위 트리로 내려가고 자손이 스스로 적은 선언이 가까운 순서로 이긴다(17라운드 소유자 답 R17-2 ㄴ, 08 §8.4) |
  > | 배열 `push`/`remove`/`update` | 구조 연산 | 그 아이템만. `push`로 생긴 아이템은 생긴 노드이므로 채움을 받는다 |
  > | 채움 | 노드 생성 사건, 작성자 선언 | 노드가 **생길 때** **없음**이면 `controls.default` > `default` > 없음. 이미 있던 노드는 다시 채우지 않고 지운 값도 다시 채우지 않는다 |
- 보충:
  > "| 사용자 입력 | 부분 쓰기 | 렌더 계층 | 그 리프만. 입력이 `undefined`를 보내면 없음이 된다 |" (`03-mental-model.md:78`)
  > "| `setValue(V, SetValueOption.Merge)` | 부분 쓰기 | 호출자 | V에 있는 키만. 키에 `undefined`를 쓰면 그 키는 없음이 된다(`extras` 포함, `removeKey` 불필요). V가 통째로 준 배열은 통째 교체 |" (`03-mental-model.md:79`)
  > "| `setValue(V)`(기본 `Overwrite`), `defaultValue`, `reset()` | **전체 교체(로드)** | 호출자 | V에 없는 자식 원본은 **없음**이 된다. `null`·`17`도 V다. `setValue(getValue())`도 전체 교체다(D-7) |" (`03-mental-model.md:80`)
  > "| `controls.injectTo` | 전체 교체(대상에) | 작성자 | 원천의 방출 값이 직전 커밋과 다를 때(에지). 로드에서는 직전 값이 없으므로 발화한다(`fire`, 소유자 동의) |" (`03-mental-model.md:81`)
  > "| `controls.derived` | 자기 값 덮기 | 작성자 | 의존 값이 바뀔 때(에지). 로드에서는 직전 값이 없으므로 발화한다(로드는 새 수명, `controls.injectTo`와 같은 읽기). 식이 `undefined`면 쓰지 않는다. 사용자가 쓴 값은 다음 의존 변화 또는 그 노드가 다시 생길 때까지 남는다(재탄생은 새 삶) |" (`03-mental-model.md:82`)
  > "| `controls.unsetValue` | 자기 값 없음으로 | 작성자 | 식이 거짓→참이 되는 순간. 로드에서는 로드된 값으로 평가해 참이면 지운다(소유자). 입력은 남는다 |" (`03-mental-model.md:83`)
  > "| 채움 | 없음인 키에 한 번 | 노드 생성 사건 | 노드가 **생길 때**(직전 커밋의 형상에 없고 이번 최종 형상에 있을 때) 없음이면 `controls.default` > `default` > 없음. 이미 있던 노드는 새 조각이 켜져도 다시 채우지 않는다. 지운 값은 다시 채워지지 않는다. 채움 값은 그 노드가 처음 채워지는 전이 라운드의 유효 스키마에서 읽는다. 뒤 라운드에 켜진 조각의 `default`는 쓰지 않는다 |" (`03-mental-model.md:85`)
  > "| 배열 `push`/`remove`/`update` | 구조 연산 | 호출자·렌더 계층 | 그 아이템만. `push`로 생긴 아이템은 생긴 노드이므로 채움을 받는다 |" (`03-mental-model.md:86`)
  > "생김은 노드 단위다. 직전 커밋의 형상에 없고 이번 정착의 최종 형상에 있는 노드만 생긴 것이고, 본체·게이트 없는 `allOf` 항목·이미 켜져 있던 다른 조각이 두고 있던 노드는 새 조각이 켜져도 생기지 않는다." (`07-conclusions.md:110`)
  > 열린 부분(리프 입력 행에 넣은 `options.trim`이 자른 값의 쓰기만. 표 행이라 나누지 않는다. 다른 행은 닫혀 있다): "포커스 아웃 `trim`이 자른 값의 쓰기가 자동 쓰기인가." (`reviews/round-18-agenda.md:160`)
  > 소유자(12-2 답): "자동 쓰기 아닙니까? 그리고 trim 전후 값이 같으면 쓰지 않아도 됩니다. 효율적이게." (`reviews/round-18-owner-answers.md:12`)
  > 편집자 결정(18C-59): "ㄴ `push`는 로드가 아니다." (`reviews/round-18-closing.md:1654`)
  > 편집자 결정(18C-59): "`push`는 구조 연산이다." (`reviews/round-18-closing.md:1655`)
  > 편집자 결정(18C-59): "만든 아이템은 생긴 노드로서 채움을 받는다(`controls.default` > `default` > 없음)." (`reviews/round-18-closing.md:1656`)
  > 편집자 결정(18C-59): "`push(v)`면 원본은 `v`이고, 없음인 자손에만 채움이 간다." (`reviews/round-18-closing.md:1657`)
- 상태: 현행
- 출처: `adr/0013-core-does-not-rewrite-values.md:38-47`(정본), `03-mental-model.md:76-86`, `08-design-a-to-z.md:262-272`, `07-conclusions.md:110`, `02-target-overview.md:287`, `adr/0013-core-does-not-rewrite-values.md:106`, `reviews/round-18-owner-answers.md:12`, `reviews/round-18-closing.md:1654-1657`
- 닫은 사람: 편집자 결정(5라운드, ADR 0013 5차 본문 `adr/0013-core-does-not-rewrite-values.md:13`), 소유자 답(`reviews/round-10-owner-answers.md:7` A-1; 채움 행), 소유자 답(`reviews/round-10-owner-answers.md:19` D-6; `controls.injectTo`의 로드 발화), 편집자 결정(9라운드 도출, `07-conclusions.md:276`; `controls.derived` 행의 에지), 소유자 답(`reviews/round-12-owner-answers.md:19` §9 로드에서 `&derived`; `controls.derived`의 로드 발화), 소유자 답(`reviews/round-10-owner-answers.md:29,39` E-21; `controls.unsetValue` 행), 소유자 답(`reviews/round-13-owner-answers.md:8` 2 나감 비움 기본값; 나감의 비움 행), 소유자 답(`reviews/round-17-owner-answers.md:10` R17-2; 나감의 비움 행의 하위 트리), 소유자 답(`reviews/round-17-owner-answers.md:11` R17-3; 리프 입력 행의 `options.trim`), 편집자 결정(17라운드, `reviews/round-17-owner-answers.md:11` 반영 칸; 리프 입력 행에 둔 쓰기 종류), 편집자 결정(18라운드, 소유자 물음으로 올림, `reviews/round-18-agenda.md:160`), 소유자 답(`reviews/round-18-owner-answers.md:12` 12-2; trim 행만 WRITE-078로 대체), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-59)
- 라운드: 18
- 까닭: `adr/0013-core-does-not-rewrite-values.md:36`, `reviews/round-18-closing.md:1686-1690`
- 충돌:
  > `adr/0013-core-does-not-rewrite-values.md:49`의 "core의 자동 쓰기가 아니다"는 쓰기 표 리프 입력 행 괄호이며 정본과 다르다. 정본이 이긴다(`reviews/round-18-owner-answers.md:12`, WRITE-078).
  > `adr/0013-core-does-not-rewrite-values.md:41`의 "| `setValue(V)`(기본 `Overwrite`), `defaultValue`, `reset()` | **전체 교체(로드)** |"는 소유자 답과 다르다: `setValue(V)`는 로드가 아니라 전체 교체 쓰기이고 이미 형상에 있던 노드를 다시 채우지 않으며, 로드는 마운트(`defaultValue`)·`FormHandle.reset()`·`resetSubtree()`뿐이다(WRITE-090). 소유자 답이 이긴다(`reviews/round-18-owner-answers.md:26`).
  > `03-mental-model.md:80`의 "| `setValue(V)`(기본 `Overwrite`), `defaultValue`, `reset()` | **전체 교체(로드)** | 호출자 |"는 소유자 답과 다르다: `setValue(V)`는 로드가 아니라 전체 교체 쓰기이고 이미 형상에 있던 노드를 다시 채우지 않으며, 로드는 마운트(`defaultValue`)·`FormHandle.reset()`·`resetSubtree()`뿐이다(WRITE-090). 소유자 답이 이긴다(`reviews/round-18-owner-answers.md:26`).
  > `08-design-a-to-z.md:266`의 "| `setValue(V)`(기본 `Overwrite`), `defaultValue`, `reset()` | 전체 교체(로드) | 호출자 |"는 소유자 답과 다르다: `setValue(V)`는 로드가 아니라 전체 교체 쓰기이고 이미 형상에 있던 노드를 다시 채우지 않으며, 로드는 마운트(`defaultValue`)·`FormHandle.reset()`·`resetSubtree()`뿐이다(WRITE-090). 소유자 답이 이긴다(`reviews/round-18-owner-answers.md:26`).

### WRITE-008 자동 쓰기는 다섯 — 억제 비트는 그 호출이 일으킨 다섯을 모두 끈다(D-5)

- 결정:
  > **자동 쓰기는 채움·`controls.derived`·`controls.injectTo`·`controls.unsetValue`·나감의 비움 다섯이고, 억제 비트는 그 호출이 일으킨 다섯을 모두 끈다**(D-5). 있는 값을 바꾸거나 지우는 자동 쓰기는 작성자가 선언한 `controls.derived`·`controls.injectTo`·`controls.unsetValue`와 정책 키를 켠 나감 비움뿐이고, 채움은 "없음"인 키에만 간다. 이름은 확정되었다(`07-conclusions.md` 6.1, 오늘 내부 플래그 `Automatic`의 어휘).
- 보충: 없음
- 상태: 대체됨(→ WRITE-078)
- 출처: `adr/0013-core-does-not-rewrite-values.md:68`(정본), `adr/0013-core-does-not-rewrite-values.md:49`, `adr/0013-core-does-not-rewrite-values.md:3`
- 닫은 사람: 원리(D-5 원리에서 도출, `adr/0013-core-does-not-rewrite-values.md:3`), 소유자 답(`reviews/round-13-owner-answers.md:8` 2 나감 비움 기본값; 다섯째 나감의 비움), 편집자 결정(9라운드, `07-conclusions.md:304` 6.1 소유자가 동의한 이름), 소유자 답(`reviews/round-18-owner-answers.md:12` 12-2; 대체)
- 라운드: 18
- 까닭: `adr/0013-core-does-not-rewrite-values.md:3`
- 충돌:
  > `adr/0013-core-does-not-rewrite-values.md:68`의 "자동 쓰기는 채움·`controls.derived`·`controls.injectTo`·`controls.unsetValue`·나감의 비움 다섯이고, 억제 비트는 그 호출이 일으킨 다섯을 모두 끈다"는 포커스 아웃 `trim`이 자른 값의 쓰기를 자동 쓰기에서 뺀 셈이다. 소유자 답과 다르다. 소유자 답이 이긴다(`reviews/round-18-owner-answers.md:12`, WRITE-078: 자동 쓰기는 여섯이고 자른 값의 쓰기도 억제 비트의 대상).

### WRITE-009 `options.trim`의 자른 값은 사용자 입력과 같은 쓰기 — 자동 쓰기가 아니다

- 결정:
  > `options.trim`이 포커스 아웃 때 자른 값은 사용자 입력과 같은 쓰기(입력 출처)이며 core의 자동 쓰기가 아니다(17라운드 소유자 답 R17-3). 그래서 자동 쓰기는 다섯 그대로이고 억제 비트의 대상이 아니다.
- 보충:
  > "| `options.trim`(오늘은 `StringNode` 안에 있다) | **문자열 동작 행의 `finishInput` 칸으로**(17라운드 소유자 답 R17-3). 포커스 아웃 때 어댑터가 타입을 모르는 입력 마침 신호(`finishInput`)를 보내면 행이 `options.trim`을 판단해 자른 값을 돌려주고, `dispatch`의 진입이 사용자 입력과 같은 쓰기(입력 출처)로 쓴다. 자른 값이 현재 값과 같으면 쓰지 않는다. 입력마다 자르지 않는 것은 입력 중에 공백을 칠 수 있어야 하기 때문이다. core의 자동 쓰기가 아니므로 P2 안이다." (`adr/0013-core-does-not-rewrite-values.md:89`)
  > 열린 부분(두 문장 모두 — 자른 값의 쓰기가 자동 쓰기인지와 그래서 억제 비트의 대상이 아닌지. 포커스 아웃 때 자르는 것 자체는 R17-3으로 닫혀 있다): "포커스 아웃 `trim`이 자른 값의 쓰기가 자동 쓰기인가." (`reviews/round-18-agenda.md:160`)
  > 소유자(12-2 답): "자동 쓰기 아닙니까? 그리고 trim 전후 값이 같으면 쓰지 않아도 됩니다. 효율적이게." (`reviews/round-18-owner-answers.md:12`)
- 상태: 대체됨(→ WRITE-078)
- 출처: `adr/0013-core-does-not-rewrite-values.md:49#2-3`(정본), `adr/0013-core-does-not-rewrite-values.md:89`, `adr/0013-core-does-not-rewrite-values.md:40`, `adr/0013-core-does-not-rewrite-values.md:7`, `reviews/round-18-owner-answers.md:12`
- 닫은 사람: 소유자 답(`reviews/round-17-owner-answers.md:11` R17-3; 포커스 아웃 때 자름), 편집자 결정(17라운드, `reviews/round-17-owner-answers.md:11` 반영 칸; 사용자 입력과 같은 쓰기, 자동 쓰기 아님), 편집자 결정(18라운드, 소유자 물음으로 올림, `reviews/round-18-agenda.md:160`), 소유자 답(`reviews/round-18-owner-answers.md:12` 12-2; 대체)
- 라운드: 18
- 까닭: `reviews/round-17-owner-answers.md:11`

### WRITE-010 "없음"과 `''`·`null`·`{}`은 다르다 — `undefined`를 쓰면 없음

- 결정:
  > "없음"과 `''`·`null`·`{}`은 다르다. 리프에 `undefined`를 쓰면 없음이 된다. 입력 컴포넌트가 `onChange(undefined)`를 보내도 값이 없음이 된다(소유자 답 11). `Merge`로 키에 `undefined`를 쓰면 그 키는 없음이 된다. `extras`의 키도 같고, 따로 `removeKey`를 두지 않는다(소유자 답 2).
- 보충:
  > 편집자 결정(18C-18): "【추론】 객체 호스트가 없음이라는 것은 호스트와 모든 자손의 `raw`·`extras`가 없음인 것이다(상태 둘에서 계산, P3)." (`reviews/round-18-closing.md:560`)
- 상태: 현행
- 출처: `adr/0013-core-does-not-rewrite-values.md:51`(정본), `03-mental-model.md:92`, `02-target-overview.md:286`, `08-design-a-to-z.md:294`, `reviews/round-18-closing.md:560`
- 닫은 사람: 소유자 답(`reviews/round-10-owner-answers.md:15` C-11), 소유자 답(`reviews/round-10-owner-answers.md:18` C-2), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-18)
- 라운드: 18
- 까닭: `adr/0013-core-does-not-rewrite-values.md:51`, `reviews/round-18-closing.md:571-576`
- 충돌:
  > `adr/0013-core-does-not-rewrite-values.md:51`의 ""없음"과 `''`·`null`·`{}`은 다르다"는 객체 호스트의 채움에서 18라운드 결정과 다르다: 객체 호스트의 없음은 호스트와 모든 자손의 `raw`·`extras`가 없음인 것이라, 로드한 V가 그 자리에 `{}`를 주어도 호스트는 `controls.default` > `default`를 받는다(WRITE-082). 18라운드 결정이 이긴다(`reviews/round-18-closing.md:560-561`).

### WRITE-011 `controls.derived`는 원본을 쓴다

- 결정:
  > `controls.derived`는 원본을 쓴다(`07-conclusions.md` 4.0의 4.1 행).
- 보충: 없음
- 상태: 현행
- 출처: `adr/0013-core-does-not-rewrite-values.md:52#1`(정본), `06-conclusions.md:116-117`
- 닫은 사람: 편집자 결정(6라운드 D-11, `06-conclusions.md:112`), 편집자 결정(9라운드, `07-conclusions.md:90` 4.0의 4.1 행)
- 라운드: 9
- 까닭: `06-conclusions.md:117`

### WRITE-012 `controls.injectTo` — 작성자가 선언한 전체 교체, 런타임은 에지, 로드에서 발화

- 결정:
  > `controls.injectTo`는 작성자가 선언한 전체 교체이고 런타임에는 **원천의 방출이 직전 커밋과 다를 때만** 발화한다(F11). 로드에는 직전 값이 없으므로 발화한다(`fire`, 소유자 동의).
- 보충: 없음
- 상태: 현행
- 출처: `adr/0013-core-does-not-rewrite-values.md:52#2-3`(정본), `03-mental-model.md:81`, `08-design-a-to-z.md:267`
- 닫은 사람: 소유자 답(`reviews/round-10-owner-answers.md:19` D-6), 편집자 결정(4라운드, 에지 발화 F11 `reviews/round-4-spec.md:144`)
- 라운드: 10
- 까닭: `07-conclusions.md:241`

### WRITE-013 자동 쓰기는 비객체 호스트의 원본을 건드리지 않고 core는 호출자가 넘긴 객체를 바꾸지 않는다

- 결정:
  > 자동 쓰기는 비객체 호스트의 원본을 건드리지 않고(F10, T-12), core는 호출자가 넘긴 객체를 바꾸지 않는다(F24, T-19).
- 보충:
  > "호스트의 원본이 `null`·`17` 같은 잘못된 종류의 값일 때 그 자식은 존재하고 렌더되며 빈 상태를 보인다. 호스트의 그 원본을 비우는 것은 사용자·호출자의 부분 쓰기뿐이고 **그 자식의 투영된 방출이 존재하게 될 때만** 비운다. 자동 쓰기(채움 등)는 비객체 호스트의 원본을 건드리지 않으므로, `setValue({ user: null })` 뒤 `name`의 채움 값은 방출에 나타나지 않고 사용자가 `name`에 입력하면 `user`가 객체가 되어 방출된다(ADR 0007 F1, ADR 0013 F10)." (`08-design-a-to-z.md:274`)
- 상태: 현행
- 출처: `adr/0013-core-does-not-rewrite-values.md:52#4`(정본), `08-design-a-to-z.md:274`, `reviews/round-18-closing.md:2831-2832`
- 닫은 사람: 편집자 결정(5라운드, ADR 0013 4차 본문 `adr/0013-core-does-not-rewrite-values.md:12`; F10·T-12·F24·T-19), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-100)
- 라운드: 18
- 까닭: `08-design-a-to-z.md:274`, `reviews/round-18-closing.md:2836-2837`
- 충돌:
  > `08-design-a-to-z.md:274`의 "`setValue({ user: null })` 뒤 `name`의 채움 값은 방출에 나타나지 않고"는 18라운드 결정과 다르다: 로드가 아닌 쓰기로 온 `null` 아래 자식은 채움 없이 없음이며(WRITE-090, WRITE-092), 채움 값을 드는 것은 로드로 온 `null` 아래 자식이다(WRITE-096). 18라운드 결정이 이긴다(`reviews/round-18-closing.md:2831-2832`).

### WRITE-014 null은 키 없는 전체 교체다(D-1)

- 결정:
  > **null은 키 없는 전체 교체다**(D-1). 키가 없으므로 모든 자식의 원본이 없음이 된다. 로드는 생김의 기준을 비우므로 형상의 노드가 채움을 받아 빈 상태를 만든다 — #338의 계약이 특수 장치도 셋째 칸도 없이 이 표에서 나온다. "null 아래에 원본을 남긴다"는 호출자가 "없다"고 쓴 것을 숨겨 두는 것이므로 P2에 어긋난다. 상태: 원리에서 도출(`07-conclusions.md` 4절, 확인만 남음).
- 보충:
  > "실수로 누른 `null`의 되돌리기는 입력 컴포넌트의 몫이다(D-1). 표준 예제로 남긴다." (`adr/0013-core-does-not-rewrite-values.md:107`)
  > 편집자 결정(18C-16): "【추론】 로드가 아닌 쓰기로 온 `null`·비객체 값도 그 자리의 자식 원본을 없음으로 만들지만 새 수명이 아니므로 채움을 받지 않는다(WRITE-014의 '빈 상태' 채움은 로드에만 해당)." (`reviews/round-18-closing.md:471`)
- 상태: 분할됨(→ WRITE-092, WRITE-090)
- 출처: `adr/0013-core-does-not-rewrite-values.md:53`(정본), `adr/0013-core-does-not-rewrite-values.md:107`, `03-mental-model.md:90,92`, `02-target-overview.md:286`, `08-design-a-to-z.md:294`, `adr/0006-single-value-ownership.md:76`(VALUE-015의 정본; E9·E18 삭제와 비객체 호스트 자식 규칙은 VALUE-015에만 있다), `reviews/round-18-closing.md:471`
- 닫은 사람: 원리(D-1 원리에서 도출, `adr/0013-core-does-not-rewrite-values.md:3`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-16), 소유자 답(`reviews/round-18-owner-answers.md:26` 18C 검토 4번; 대체)
- 라운드: 18
- 까닭: `adr/0013-core-does-not-rewrite-values.md:53`, `reviews/round-18-closing.md:502-510`

### WRITE-015 쓰기 옵션 — 비트마스크 `SetValueOption`, Form 속성, 기본·자리·우선순위·배치·범위·`Merge`

- 결정:
  > 공개 옵션은 비트마스크다 — `SetValueOption.Overwrite | Merge | DisableAutomaticWrites | EnableAutomaticWrites`, Form 속성은 `disableAutomaticWrites`(`07-conclusions.md` 6.1·6.2의 N1).
  > | 규칙 | 내용 |
  > | ---- | ---- |
  > | 기본 | 쓰기 종류는 `Overwrite` — 오늘과 같다 |
  > | 자리 | `setValue(V, option)`뿐 아니라 **`reset(option)`과 마운트**에도 둔다. 마운트는 `defaultValue`가 로드이므로 Form 속성이 그 자리다 |
  > | 우선순위 | **호출 옵션 > Form 속성**, 양방향이다. 속성이 켜 둔 억제를 호출이 끌 수 있고 그 반대도 된다. 억제 비트가 둘(`DisableAutomaticWrites`·`EnableAutomaticWrites`)인 이유가 이것이다 — 상속·끄기·켜기 세 상태. 호출에 둘 다 없으면 Form 속성을 따르고, 둘 다 주면 억제가 이긴다 |
  > | 배치 | 한 배치 안에 서로 다른 억제 값이 섞이면 **억제가 이긴다**(보수적. `fn` 안의 `reset`의 로드는 묶음 밖이다, ADR 0008 §3) |
  > | 범위 | 억제는 그 호출이 일으킨 예약 층의 자동 쓰기 전부를 막는다 — 채움, `controls.derived`, `controls.injectTo`, `controls.unsetValue`, 나감의 비움. 로드(전체 교체, `reset`, 마운트)뿐 아니라 `Merge`에 주면 `Merge`가 통째로 준 배열의 아이템 채움과 그 `Merge`가 촉발한 `controls.derived`도 막는다. 로드된 값 자체는 막지 않는다. `controls.active`의 방출 제외는 쓰기가 아니라 투영이므로 범위 밖이고, 정책이 참으로 정해진 노드의 나감 비움은 범위 안이다. 뒤이은 사용자 입력·리스너가 일으킨 정착은 다른 호출이므로 억제가 듣지 않는다(F25, 원장 §3). |
  > | `Merge` | `Merge`는 V에 없는 키를 로드하지 않는다. V가 통째로 준 배열은 통째 교체다. 그 아이템 가운데 직전 커밋의 형상에 없던 노드는 생긴 노드로서 채움을 받으며, 어떤 아이템이 생긴 것인지는 원장 §6의 배열 아이템 설계 항목이다. `Merge`에 준 억제 비트는 그 호출이 일으킨 자동 쓰기에 적용되므로 이 채움도 막는다(원장 §3) |
- 보충:
  > "`FormHandle.reset(option?)`은 `DisableAutomaticWrites`·`EnableAutomaticWrites` 두 비트만 받는다(ADR 0013의 억제 스위치 표, `06-conclusions.md`의 '`reset(option?)`은 두 비트만 받는다'). `Overwrite`·`Merge`는 받지 않는다." (`09-landing-and-test-strategy.md:93`)
  > "`fn` 안의 `reset`의 억제 비트는 그 로드에만 들며, 로드가 `fn`의 쓰기 묶음에 들지 않으므로 ADR 0013의 배치 규칙('섞이면 억제가 이긴다')은 묶음의 쓰기끼리만 합산한다." (`09-landing-and-test-strategy.md:90`)
  > 편집자 결정(18C-59): "【추론】 로드가 아닌 통째 쓰기(`Merge`의 배열, 입력 쓰기 등)에서는 직전 커밋의 형상에 없던 키만 생긴 노드로서 채움을 받는다." (`reviews/round-18-closing.md:1647`)
  > 편집자 결정(18C-59): "【추론】 곧 새로 만든 뒤쪽 아이템이다." (`reviews/round-18-closing.md:1648`)
  > 편집자 결정(18C-59): "【추론】 이것이 WRITE-015 `Merge` 행이 미룬 "어떤 아이템이 생긴 것인가"의 답이다." (`reviews/round-18-closing.md:1649`)
- 상태: 현행
- 출처: `adr/0013-core-does-not-rewrite-values.md:57`(정본), `adr/0013-core-does-not-rewrite-values.md:59-66,104,105`, `03-mental-model.md:88`, `08-design-a-to-z.md:278`, `02-target-overview.md:285`, `09-landing-and-test-strategy.md:90,93`, `06-conclusions.md:165-167`, `adr/0007-settle-cycle.md:88,89`, `reviews/round-18-closing.md:1647-1649`
- 닫은 사람: 소유자 답(`reviews/round-4.md:113` D-7; 호출 단위 비트), 원리(D-5 원리에서 도출, `adr/0013-core-does-not-rewrite-values.md:3`; 범위), 편집자 결정(9라운드, `07-conclusions.md:304` 6.1 소유자가 동의한 이름), 편집자 결정(6라운드 D-19, `06-conclusions.md:163`; `Merge`의 배열 통째 교체), 16라운드 스웜 수렴(편집자 결정, `adr/0013-core-does-not-rewrite-values.md:8`; 배치 행의 `fn` 안 `reset`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-59)
- 라운드: 18
- 까닭: `06-conclusions.md:167`, `reviews/round-18-closing.md:1686-1690`
- 충돌:
  > `adr/0013-core-does-not-rewrite-values.md:65`의 "로드(전체 교체, `reset`, 마운트)뿐 아니라"는 소유자 답과 다르다: 전체 교체(`setValue(V)`)는 로드가 아니라 전체 교체 쓰기이고, 로드는 마운트·`FormHandle.reset()`·`resetSubtree()`뿐이며, `DisableAutomaticWrites`는 그 쓰기로 새로 생긴 노드의 채움과 다른 자동 쓰기를 끈다(WRITE-090). 소유자 답이 이긴다(`reviews/round-18-owner-answers.md:26`).

### WRITE-016 `Refresh`는 옵션이 아니라 core가 출처로 판단한다

- 결정:
  > `Refresh`는 옵션이 아니라 core가 출처로 판단한다(F7).
- 보충:
  > "core는 로드된 노드 모두에 Refresh를 낸다(오늘의 `Overwrite`와 같다." (`09-landing-and-test-strategy.md:85`)
- 상태: 현행
- 출처: `open-questions.md:52`(정본)
- 닫은 사람: 편집자 결정(5라운드 후속 C-5·C-6, `open-questions.md:52`), 소유자 답(`reviews/round-2.md:117` 비제어 입력의 복구; 설계 위임)
- 라운드: 5
- 까닭: `open-questions.md:52`

### WRITE-017 `setValue(getValue())`에는 로드 뒤의 채움이 그대로 적용된다(D-7 (a))

- 결정:
  > **`setValue(getValue())`에는 로드 뒤의 채움이 그대로 적용된다**(D-7 (a), 수락). 로드는 생김의 기준을 비우므로, 사용자가 지운 키는 `getValue()`에 없고 그 노드는 생긴 노드로서 다시 채워진다. 그래서 멱등이 아니다. 소유자: "form에 값을 씌우는 경우와 기본값을 설정하는 경우가 다르다. props로는 함수 단위 제어가 안 된다." 호출 단위의 억제 비트가 그 답이다(F30).
- 보충: 없음
- 상태: 대체됨(→ WRITE-090)
- 출처: `adr/0013-core-does-not-rewrite-values.md:70`(정본), `adr/0013-core-does-not-rewrite-values.md:3`, `03-mental-model.md:80`, `08-design-a-to-z.md:266`
- 닫은 사람: 소유자 답(`reviews/round-4.md:113` D-7), 소유자 답(`reviews/round-18-owner-answers.md:26` 18C 검토 4번; 대체)
- 라운드: 18
- 까닭: `adr/0013-core-does-not-rewrite-values.md:70`

### WRITE-018 값을 통째로 주입할 때 — 모든 노드로 분배, 방출에서만 빠짐, 로드에는 나감이 없음

- 결정:
  > 주입된 값은 꺼진 조각의 노드와 노드 게이트(`controls.active`)가 거짓인 노드까지 포함해 모든 노드의 원본으로 분배되고, 형상은 그 값으로 수렴한다(ADR 0002). 노드 게이트는 조각 게이트와 같은 장치이므로 두 경우가 같게 동작한다(`07-conclusions.md` 4.24).
  > 꺼진 조각의 값과 게이트가 거짓인 노드의 값은 **방출에서** 빠진다. 기본은 원본을 지우지 않는다(P4). 로드에는 나감이 없으므로 나감 정책 키를 켜도 주입된 값은 지워지지 않는다(원장 §3). `controls.visible: false`로 숨긴 필드와 스키마가 선언하지 않은 키는 방출된다. 스키마가 선언하지 않은 키는 `extras`에 받은 순서로 방출된다. 숨김은 렌더링에만 닿는다.
  > 나머지는 검증이 에러로 알린다.
- 보충:
  > "**소유자 스스로 확신이 없다고 밝혔다.** 교차검증에 올렸다(§6)" (`reviews/round-2.md:120`)
- 상태: 현행
- 출처: `adr/0013-core-does-not-rewrite-values.md:74-76`(정본)
- 닫은 사람: 편집자 결정(5라운드, ADR 0013 5차 본문 `adr/0013-core-does-not-rewrite-values.md:13`), 소유자 답(`reviews/round-10-owner-answers.md:8` A-2; 노드 게이트는 조각 게이트와 같은 장치), 편집자 결정(13라운드, `03-mental-model.md:84`; 로드에는 나감이 없음)
- 라운드: 13
- 까닭: `adr/0013-core-does-not-rewrite-values.md:78`

### WRITE-019 잠복 — 전체 교체가 옛 잠복 값을 없애고, 남는 잠복 하나는 `getInactiveValues(path)`로 열거

- 결정:
  > 2라운드의 "절대 제거하지 않는다"가 남긴 결함 — 레코드 A 뒤에 레코드 B를 로드하면 A의 잠복 값이 분기 전환에서 되살아난다 — 은 **전체 교체가 V에 없는 키를 없음으로 만들면서** 사라진다. 비활성화(원본 보존)와 전체 교체(원본에도 적용)를 구분한 것이 답이었다. 남는 잠복은 하나다: 비활성 조각이 선언한 자식의 원본은 방출되지 않으므로 검증기가 기각하지도 잔여 목록에 오르지도 않는다 — 설계상 잠복이다(P4). core는 이를 열거하는 읽기 전용 API를 두어 렌더 계층이 보여 주거나 지울 수 있게 한다(F26, `getInactiveValues(path)`, ADR 0006).
- 보충: 없음
- 상태: 현행
- 출처: `adr/0013-core-does-not-rewrite-values.md:78`(정본)
- 닫은 사람: 편집자 결정(2라운드 codex 교차검증 반영, `adr/0013-core-does-not-rewrite-values.md:100`), 원리(P4, `adr/0013-core-does-not-rewrite-values.md:78`)
- 라운드: 5
- 까닭: `adr/0013-core-does-not-rewrite-values.md:100`
- 충돌:
  > `adr/0013-core-does-not-rewrite-values.md:78`의 "core는 이를 열거하는 읽기 전용 API를 두어 렌더 계층이 보여 주거나 지울 수 있게 한다(F26, `getInactiveValues(path)`, ADR 0006)."는 잠복 원본 열거를 `getInactiveValues`라는 읽기로 적는다. 소유자 답과 다르다. 소유자 답이 이긴다(`reviews/round-18-owner-answers.md:22`, VALUE-029: 잠복 원본 열거는 루트 노드의 함수이고 노드마다 getter `inactiveValues`).

### WRITE-020 잠복 값 열거 API `getInactiveValues(path)`의 반환 모양

- 결정:
  > 잠복 값 열거 API `getInactiveValues(path)`(F26, ADR 0006)의 반환 모양.
- 보충: 없음
- 상태: 대체됨(→ WRITE-087)
- 출처: `adr/0013-core-does-not-rewrite-values.md:108`(정본), `reviews/round-18-owner-answers.md:22` (이름과 자리: VALUE-029), `reviews/round-18-closing.md:2171-2182,2188-2189`
- 닫은 사람: 편집자 결정(5라운드, ADR 0013 미결 `adr/0013-core-does-not-rewrite-values.md:102`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-81)
- 라운드: 18
- 까닭: `adr/0013-core-does-not-rewrite-values.md:108`, `reviews/round-18-closing.md:2184-2186`
- 충돌:
  > `adr/0013-core-does-not-rewrite-values.md:108`의 "잠복 값 열거 API `getInactiveValues(path)`(F26, ADR 0006)의 반환 모양."은 잠복 원본 열거를 `getInactiveValues`라는 읽기로 적는다. 소유자 답과 다르다. 소유자 답이 이긴다(`reviews/round-18-owner-answers.md:22`, VALUE-029: 잠복 원본 열거는 루트 노드의 함수이고 노드마다 getter `inactiveValues`). 반환 모양은 열림 그대로다.

### WRITE-021 초기값 보존 옵션 — (a) 기각, (b)의 둘은 기본 계약, 하나는 기각, `preserveDefaultValue`는 억제 비트로

- 결정:
  > (a)("첫 의도된 쓰기 전까지 `getValue()`가 주입된 값을 그대로 돌려준다")는 택하지 않는다 — 첫 편집에서 기본값이 나타나고 미선언 키가 빠지는 점프가 생긴다. (b)의 셋 가운데 둘은 **기본 계약이 되었다**: 로드한 값에 없는 키에만 채움(`controls.default` > `default`)이 들어가는 것과, 미선언 키를 호스트의 별도 칸(`extras`)에 보존하는 것(E16). 남은 하나("손대지 않은 값에는 `omitEmpty`·`omitTrailing`을 건너뛴다")는 이력 의존이므로 채택하지 않는다 — 방출은 상태의 투영이다(P4). `preserveDefaultValue`라는 이름은 사라지고 그 자리에 억제 비트 `DisableAutomaticWrites`가 남는다.
- 보충: 없음
- 상태: 현행
- 출처: `adr/0013-core-does-not-rewrite-values.md:82`(정본)
- 닫은 사람: 소유자 답(`reviews/round-2.md:118` 로드 → 저장의 왕복), 편집자 결정(2라운드 codex 교차검증 반영, `adr/0013-core-does-not-rewrite-values.md:100`), 원리(P4, `adr/0013-core-does-not-rewrite-values.md:82`)
- 라운드: 5
- 까닭: `adr/0013-core-does-not-rewrite-values.md:82`

### WRITE-022 core가 값을 바꾸던 곳 — 배열 길이 채우기·차단은 입력 컴포넌트로, `null`→`{}`와 `Normalize`는 폐기

- 결정:
  > | 오늘의 동작 | 새 원칙에서 |
  > | ---------- | ---------- |
  > | 배열을 `minItems`까지 채우기, `maxItems` 초과 `push` 차단 | **입력 컴포넌트로.** core는 제약을 유효 스키마로 노출하고 위반은 검증이 알린다 |
  > | nullable이 아닌 객체의 `null`을 `{}`로 바꾸기(S7), 비객체 값 버리기 | **폐기.** 보존·방출하고 type 에러를 낸다. 동작 변화로 기록한다(F27, `04-inherited-constraints.md`) |
  > | `Normalize`의 미선언 키 제거 | **폐기.** 미선언 키는 `extras` 칸에 보존하고 받은 순서로 방출한다(E16) |
- 보충: 없음
- 상태: 현행
- 출처: `adr/0013-core-does-not-rewrite-values.md:86,90-92`(정본), `open-questions.md:52`
- 닫은 사람: 소유자 답(`reviews/round-2.md:119` 새 원칙; 배열 행), 편집자 결정(5라운드, ADR 0013 4차 본문 `adr/0013-core-does-not-rewrite-values.md:12`; F27·E16)
- 라운드: 5
- 까닭: `adr/0013-core-does-not-rewrite-values.md:17`

### WRITE-023 core가 값을 바꾸던 곳 — 분기 전환·`active` 전이의 reset은 기본 폐기

- 결정:
  > | 오늘의 동작 | 새 원칙에서 |
  > | ---------- | ---------- |
  > | 분기 전환·`active` 전이의 reset — 오늘의 동작(12·14라운드 탐침): 꺼지면 원본을 지우고, 다시 켜지면 노드가 생성될 때의 값(없으면 `default`)으로 되돌린다. 뒤의 전체 교체는 이 복원 값을 바꾸지 않는다. `oneOf` 전환에서 둘 다 없으면 앞 분기의 같은 이름·같은 타입 터미널 값을 잇는다 | **기본은 폐기.** 원본을 두고 방출에서만 뺀다. 같은 종류의 노드를 공유하므로 값이 남는다(ADR 0005 §3). 원본까지 지우려면 작성자가 나감 정책 키를 켠다. 그때도 로드 값으로 복원하지 않고, 다시 생긴 노드는 채움(`controls.default` > `default`)을 받는다(13라운드 답 2, 원장 §6) |
- 보충: 없음
- 상태: 현행
- 출처: `adr/0013-core-does-not-rewrite-values.md:86,93`(정본), `08-design-a-to-z.md:305`
- 닫은 사람: 소유자 답(`reviews/round-13-owner-answers.md:8` 2 나감 비움 기본값)
- 라운드: 13
- 까닭: `adr/0013-core-does-not-rewrite-values.md:93`

### WRITE-024 core가 값을 바꾸던 곳 — 조각이 켜질 때의 `default` 주입은 채움으로

- 결정:
  > | 오늘의 동작 | 새 원칙에서 |
  > | ---------- | ---------- |
  > | 조각이 켜질 때의 `default` 주입 | **채움으로 바뀐다.** 노드가 생길 때 한 번, 노드 단위, 원천은 `controls.default` > `default`(`07-conclusions.md` 4.22) |
- 보충: 없음
- 상태: 현행
- 출처: `adr/0013-core-does-not-rewrite-values.md:86,94`(정본), `07-conclusions.md:106-111`, `03-mental-model.md:85`, `08-design-a-to-z.md:271`
- 닫은 사람: 소유자 답(`reviews/round-10-owner-answers.md:7` A-1), 소유자 답(`reviews/round-9-spec.md:52` 읽기2 채우기 원천), 소유자 답(`reviews/round-9-spec.md:56` 읽기2 시점(A/B))
- 라운드: 10
- 까닭: `07-conclusions.md:111`

### WRITE-025 core가 값을 바꾸던 곳 — `computed.derived`·`injectTo`는 예약 층으로 남고 `controls.unsetValue`가 더해진다

- 결정:
  > | 오늘의 동작 | 새 원칙에서 |
  > | ---------- | ---------- |
  > | `computed.derived`, `injectTo` | **남는다.** 예약 층의 `controls.derived`·`controls.injectTo`가 되며, 작성자가 명시한 쓰기이므로 이 원칙의 대상이 아니다. `controls.unsetValue`가 같은 부류로 더해진다 |
- 보충: 없음
- 상태: 현행
- 출처: `adr/0013-core-does-not-rewrite-values.md:86,95`(정본)
- 닫은 사람: 원리(P2, `adr/0013-core-does-not-rewrite-values.md:36`), 소유자 답(`reviews/round-12-owner-answers.md:13` 5 `&clearValue` 두 문장)
- 라운드: 12
- 까닭: `adr/0013-core-does-not-rewrite-values.md:95`

### WRITE-026 core가 값을 바꾸던 곳 — 참조 그룹 `options.virtual`은 현행 유지

- 결정:
  > | 오늘의 동작 | 새 원칙에서 |
  > | ---------- | ---------- |
  > | 참조 그룹(`options.virtual`) | **현행 유지**(`options.virtual`로 유지하되 `required` 재작성은 버리고 `options` 그룹째 검증기 앞에서 지워진다, 12라운드 답 8). 소유자: "virtual 은 스키마로 선언되는건 아니니까 그냥 둡시다. 유효성검증도 영향 없고." 참조 그룹 노드로의 전환(D-6)은 하지 않는다 |
- 보충: 없음
- 상태: 현행
- 출처: `adr/0013-core-does-not-rewrite-values.md:86,96`(정본)
- 닫은 사람: 소유자 답(`reviews/round-10-owner-answers.md:31` E-4), 소유자 답(`reviews/round-12-owner-answers.md:16` 8 `virtual`)
- 라운드: 12
- 까닭: `adr/0013-core-does-not-rewrite-values.md:96`

### WRITE-027 로드는 새 수명 — 형상의 모든 노드를 생긴 노드로 친다

- 결정:
  > **로드는 새 수명이다.** 전체 교체(마운트·`setValue(V)`·`reset()`·`defaultValue`)는 트리를 새로 만든 것으로 보아 형상에 있는 모든 노드를 생긴 노드로 친다. 그래서 로드 뒤에는 없음인 값이 모두 채움을 받고, `setValue(null)` 뒤 자식이 다시 객체가 되어도 채움을 받는다(D-1의 null 계약이 이 문장에서 나온다).
- 보충: 없음
- 상태: 대체됨(→ WRITE-090)
- 출처: `03-mental-model.md:90#1-3`(정본), `adr/0013-core-does-not-rewrite-values.md:53,70`
- 닫은 사람: 편집자 결정(9라운드 도출, `07-conclusions.md:106` 4.22), 소유자 답(`reviews/round-10-owner-answers.md:7` A-1), 소유자 답(`reviews/round-18-owner-answers.md:26` 18C 검토 4번; 대체)
- 라운드: 18
- 까닭: `03-mental-model.md:90`

### WRITE-028 `controls.unsetValue` — 로드 정착에서 참이면 지우고 런타임은 경계에서만

- 결정:
  > `controls.unsetValue`는 로드 정착 안에서 참이면 지운다. 로드 정착에서 `controls.unsetValue`의 직전 값은 거짓이다. 같은 정착 안의 채움이나 파생으로 참이 되어도 지운다(소유자 답 21 "현재 데이터를 기준으로"). 런타임에는 경계에서만 움직인다. 거짓→참에서 지우고, 참→거짓에서는 아무 일도 하지 않는다(값을 되살리지 않는다).
- 보충: 없음
- 상태: 현행
- 출처: `03-mental-model.md:90#4-8`(정본), `03-mental-model.md:83`, `adr/0013-core-does-not-rewrite-values.md:44`, `08-design-a-to-z.md:269,316`
- 닫은 사람: 소유자 답(`reviews/round-10-owner-answers.md:29,39` E-21), 편집자 결정(12라운드 수용, `07-conclusions.md:251`)
- 라운드: 12
- 까닭: `07-conclusions.md:251`

### WRITE-029 형상에 없는 노드의 규칙은 평가하지 않는다 — 다시 생기면 에지는 거짓→참

- 결정:
  > **형상에 없는 노드의 규칙은 평가하지 않는다**(P4: 형상 변화는 쓰기가 아니다). 그 노드가 형상 밖에 있는 동안의 원천 변화는 에지가 아니고, 노드가 (다시) 생기면 그 노드의 `controls.unsetValue`·`controls.derived`·`controls.injectTo`의 에지는 거짓→참으로 본다(직전 값이 없다). 비활성 원천의 방출이 사라지는 것도 다른 노드의 `controls.injectTo`에 에지가 아니다.
- 보충: 없음
- 상태: 현행
- 출처: `03-mental-model.md:90#9-11`(정본)
- 닫은 사람: 소유자 답(`reviews/round-12-owner-answers.md:18` §9 형상에 없는 노드)
- 라운드: 12
- 까닭: `03-mental-model.md:90`

### WRITE-030 값 조작 셋의 대응 — 채움, 바꾸기, 지우기의 장치

- 결정:
  > **값 조작 셋의 대응.** 없는 값 채우기 = 채움(`controls.default`·`default`). 있는 값 바꾸기 = `controls.derived`(자기), `controls.injectTo`(남). 있는 값 지우기 = `controls.unsetValue`(원본에서), `controls.active: false`(방출에서). 런타임에 "없음일 때만 채우는" 별도 키는 두지 않는다. `controls.derived`·`controls.injectTo`의 식이 `undefined`를 돌려주면 쓰지 않는다(그 라운드의 후보가 아니다). 없음으로 만드는 장치는 `controls.unsetValue` 하나이고 발화원이 둘이다 — 식의 거짓→참, 그리고 정책이 참으로 정해진 노드의 나감(G4).
- 보충:
  > 소유자(읽기 2): "없는 값을 채우는 것과 있는 값을 바꾸는 것, 있는 값을 제거하는 것 모두 원리상 가능해야 한다." (`reviews/round-9-spec.md:48`)
- 상태: 현행
- 출처: `03-mental-model.md:94#1-7`(정본), `02-target-overview.md:270-284`, `07-conclusions.md:191-203`, `08-design-a-to-z.md:282-294`
- 닫은 사람: 소유자 답(`reviews/round-9-spec.md:48` 읽기2), 소유자 답(`reviews/round-10-owner-answers.md:15` C-11; 런타임 채움 키 없음), 소유자 답(`reviews/round-12-owner-answers.md:20` §9 `undefined` 반환), 소유자 답(`reviews/round-13-owner-answers.md:8` 2 나감 비움 기본값; 나감의 발화원)
- 라운드: 13
- 까닭: `03-mental-model.md:94`

### WRITE-031 나감 정책 키 `unsetOnInactive` — 이름, 형, 네 층, 같은 층은 유지 우선

- 결정:
  > 나감 정책 키 `unsetOnInactive`(이름은 소유자 13라운드 확정. 철자는 노드의 `controls.unsetOnInactive`, Form 속성 `unsetOnInactive`)는 형용사 형(`boolean` 또는 식→`boolean`, 15라운드 결정 2. Form 속성은 `boolean`만)이며 네 층에서 세부가 포괄을 덮는다: 노드 자신 > `controls.children` 항목의 `controls` > 조각의 `controls` > Form 속성. 같은 층에 여럿이면 하나라도 유지면 유지한다(되돌릴 수 없는 쓰기는 만장일치).
- 보충:
  > "자리 둘: 노드의 `controls.unsetOnInactive`(그리고 `children` 항목·조각의 `controls`), Form 속성 `unsetOnInactive`. 형은 형용사 형(`boolean` 또는 식→`boolean`, 15라운드 결정 2)이고 Form 속성은 노드 문맥이 없으므로 `boolean`만이다(부류 표의 앞 판에 적힌 "`boolean`만, 13라운드"는 사실과 달랐다. 13라운드는 이름과 기본값만 정했다, 17라운드 스웜 수렴(편집자 결정))." (`08-design-a-to-z.md:298`)
- 상태: 현행
- 출처: `03-mental-model.md:94#8`(정본), `08-design-a-to-z.md:298`, `adr/0013-core-does-not-rewrite-values.md:45`, `07-conclusions.md:203`, `adr/0003-group-namespace.md:95#9`(CONTROLS-040의 정본, 층 규칙이 겹침)
- 닫은 사람: 소유자 답(`reviews/round-12-owner-answers.md:10` 3 꺼질 때 값 정책; 별도 옵션), 소유자 답(`reviews/round-13-owner-answers.md:17` 나감 정책 키 이름), 소유자 답(`reviews/round-13-owner-answers.md:8` 2 나감 비움 기본값; 기본 유지), 소유자 답(`reviews/round-10-owner-answers.md:16` C-15; `controls.children` 항목의 값 키), 소유자 답(`reviews/round-13-owner-answers.md:16` Form 속성의 자리; Form 속성 층), 편집자 결정(13라운드, 소유자 검토 문서가 장치의 모양으로 제시 `reviews/round-13-owner-review.md:66`; 세부가 포괄을 덮음), 편집자 결정(15라운드 결정 2, `08-design-a-to-z.md:298`; 형용사 형), 17라운드 스웜 수렴(편집자 결정, `08-design-a-to-z.md:298`; Form 속성은 `boolean`만), 편집자 결정(12라운드 도출, `reviews/round-12-derivation.md:60`; 같은 층은 유지 우선)
- 라운드: 17
- 까닭: `03-mental-model.md:94`

### WRITE-032 나감의 정책은 직전 커밋의 선언으로 정하고 조각 층은 꺼지는 순간에도 적용된다

- 결정:
  > 나감의 정책은 직전 커밋에서 그 노드에 걸려 있던 선언(그때 켜져 있던 조각의 `controls`, 부모의 `controls.children` 항목, 노드 자신의 키)으로 정한다(P3). 조각 층은 그 조각이 꺼지는 순간에도 적용된다.
- 보충: 없음
- 상태: 현행
- 출처: `03-mental-model.md:94#9-10`(정본), `08-design-a-to-z.md:302`
- 닫은 사람: 원리(P3, `03-mental-model.md:94`)
- 라운드: 13
- 까닭: `03-mental-model.md:94`

### WRITE-033 나가는 객체·분기의 정책은 함께 나가는 하위 트리로 내려간다(R17-2 ㄴ)

- 결정:
  > 나가는 객체·분기에 켠 `unsetOnInactive`는 함께 나가는 하위 트리로 내려간다(17라운드 소유자 답 R17-2 ㄴ: "해당 브랜치가 꺼질떄, 하위 트리노드가 모두 꺼진다고 봐야할거같아". 13라운드 답 1의 둘째 예외, 08 §8.4). 나가는 노드의 비움 여부는 그 노드와 그 위의 **나가는** 조상들을 가까운 순서로 보아, 직전 커밋의 위 층 가운데 하나라도 명시된 첫 마디가 정하고(한 마디의 같은 층에 여럿이면 하나라도 유지면 유지), 끝까지 없으면 Form 속성이 정한다. 그래서 자손이 스스로 적은 선언이 가까운 순서로 이긴다(자손의 `false`는 남긴다). 나가지 않는 조상의 정책은 내려가지 않는다.
- 보충:
  > "13라운드 답 1("모든 control 필드는 자체 노드만 지원. children 그룹은 예외")에 둔 둘째 예외다. 소유자: "해당 브랜치가 꺼질떄, 하위 트리노드가 모두 꺼진다고 봐야할거같아." 나가는 노드의 비움 여부는 그 노드와 그 위의 **나가는** 조상들을 가까운 순서로 보아, 직전 커밋에서 세 층(노드 자신 > 그 노드를 가리키는 `controls.children` 항목의 `controls` > 그 노드를 직접 선언한 조각의 `controls`) 가운데 하나라도 명시된 첫 마디가 정하고(한 마디의 같은 층에 여럿이면 하나라도 유지면 유지), 끝까지 없으면 Form 속성이 정한다." (`08-design-a-to-z.md:302`)
  > "나가지 않는 조상과 나가지 않는 선언의 정책은 내려가지 않는다." (`08-design-a-to-z.md:302`)
- 상태: 현행
- 출처: `03-mental-model.md:94#11-14`(정본), `08-design-a-to-z.md:270,302`, `adr/0013-core-does-not-rewrite-values.md:7,45`, `07-conclusions.md:203`
- 닫은 사람: 소유자 답(`reviews/round-17-owner-answers.md:10` R17-2), 소유자 답(`reviews/round-13-owner-answers.md:7` 1 잠금 규칙; `children` 그룹 예외)
- 라운드: 17
- 까닭: `reviews/round-17-owner-answers.md:10`

### WRITE-034 나감 사슬의 세부 셋 — 선언의 나감, 잠복 자손, 선언의 나감의 `extras`

- 결정:
  > 세부 셋: (가) 노드는 남고 그 노드를 선언한 조각만 꺼지는 "선언의 나감"도 사슬의 한 마디로 센다. 그 층은 나가는 선언 안의 자기 키 > 나가는 선언 또는 나가는 노드의 부모 선언에 속한 `children` 항목 > 그 선언을 호스트의 직계 자식으로 적은 조각이며, 나가지 않는 선언의 층은 세지 않는다. (나) 앞서 자기 게이트로 나가 원본을 든 채 잠복한 자손도 조상이 비움으로 나가는 순간 같은 사슬로 정해 비운다(잠복 자손 자신의 층은 직전 커밋에 효력이 있던 선언만 세므로 명시한 유지는 이긴다. 앞선 호출에서 `DisableAutomaticWrites`로 억제된 잠복 원본도 뒤의 다른 호출에서는 비운다). (라) 선언의 나감에서는 `extras`를 건드리지 않는다. 남는 순서 의존 하나(조각에 명시한 유지가 조상보다 먼저 꺼진 경우)는 조각 범위 규칙의 귀결이다.
- 보충:
  > "첫째, **선언의 나감**: 노드는 남고 그 노드를 선언한 조각만 꺼지는 것(판별 union의 공유 객체 `addr` 아래 A 분기에만 있는 `zip`)도 사슬의 한 마디로 센다." (`08-design-a-to-z.md:302`)
- 상태: 현행
- 출처: `03-mental-model.md:94#15-20`(정본), `08-design-a-to-z.md:302`
- 닫은 사람: 17라운드 스웜 수렴(편집자 결정, `reviews/raw-round17-convergence.md:117`)
- 라운드: 17
- 까닭: `reviews/raw-round17-convergence.md:117`

### WRITE-035 비움으로 정해진 노드는 `raw`와 `extras`를 모두 없음으로 한다

- 결정:
  > 함께 닫힌 것(17라운드 스웜 수렴(편집자 결정)): 비움으로 정해진 노드는 `raw`(잘못된 종류의 값 포함)와 `extras`를 모두 없음으로 한다.
- 보충:
  > "두 상태에는 자기 층이 없으므로 그 노드의 해석된 정책을 따른다." (`08-design-a-to-z.md:300`)
- 상태: 현행
- 출처: `03-mental-model.md:94#21`(정본), `08-design-a-to-z.md:300`
- 닫은 사람: 17라운드 스웜 수렴(편집자 결정, `03-mental-model.md:94`)
- 라운드: 17
- 까닭: `08-design-a-to-z.md:300`

### WRITE-036 쓰기로 원본이 없어진 소멸은 나감이 아니다 — `controls.children` 항목의 `controls.active: false`는 노드 게이트

- 결정:
  > 쓰기로 원본이 없어진 소멸(배열 아이템 `remove`, 통째 교체, 로드)은 나감이 아니다. `controls.children` 항목의 `controls.active: false`는 노드 게이트다.
- 보충:
  > "쓰기로 원본 자체가 없어져 노드가 사라지는 것(배열 아이템 `remove`, 통째 교체로 짧아진 배열, 로드)은 나감이 아니라 소멸이며 비움의 대상도, 억제 비트·원본 B의 기록 대상도 아니다. 비객체 호스트 아래 자식은 존재하므로 나감이 아니다. 부모 `controls.children` 항목의 `controls.active: false`(항목 게이트)는 노드 게이트와 같은 장치라 그 노드 자신의 나감이며 층(자기 키 > 그 항목을 포함한 `children` 항목 > 조각)을 그대로 센다(17라운드 스웜 수렴(편집자 결정))." (`08-design-a-to-z.md:299`)
- 상태: 현행
- 출처: `03-mental-model.md:94#22-23`(정본), `08-design-a-to-z.md:299`
- 닫은 사람: 17라운드 스웜 수렴(편집자 결정, `reviews/raw-round17-convergence.md:78` O8-다; 소멸), 17라운드 스웜 수렴(편집자 결정, `08-design-a-to-z.md:299`; 항목 게이트의 층)
- 라운드: 17
- 까닭: `08-design-a-to-z.md:299`

### WRITE-037 나감의 비움 — 단위는 노드의 나감, 로드에는 없음, 다섯째 자동 쓰기, 기본은 유지

- 결정:
  > | 사건 | 종류 | 누가 | 자식 원본에 미치는 것 |
  > | ---- | ---- | ---- | -------------------- |
  > | 나감의 비움(선택, 기본 꺼짐) | 나간 노드의 값을 없음으로 | 작성자 또는 호출자(정책 키를 켠 곳. Form 속성 층은 호출자) | 노드가 **나갈 때**(직전 커밋의 형상에 있었고 이번 최종 형상에 없을 때, 하위 트리 포함) 한 번. 선언이 하나라도 켜져 있으면 나가지 않는다(공유 노드). 로드에는 나감이 없다. 전이 단계, 최종 형상 기준. 다섯째 자동 쓰기(억제 비트·원본 B의 대상). 기본은 유지(P4: 방출에서만 빠지고 원본은 남는다 — 소유자 13라운드: "onChange로 넘어가는 값에서 지워지는 게 기본값이면 된다") |
- 보충: 없음
- 상태: 현행
- 출처: `03-mental-model.md:84`(정본), `08-design-a-to-z.md:270,299`, `adr/0013-core-does-not-rewrite-values.md:45`
- 닫은 사람: 소유자 답(`reviews/round-13-owner-answers.md:8` 2 나감 비움 기본값), 소유자 답(`reviews/round-13-owner-answers.md:17` 나감 정책 키 이름), 편집자 결정(13라운드, `adr/0013-core-does-not-rewrite-values.md:10`)
- 라운드: 13
- 까닭: `03-mental-model.md:84`

### WRITE-038 나감에서 식과 Form 속성의 시점 — 직전 커밋의 값

- 결정:
  > 어느 선언이 걸리는가도, 걸린 선언이 식일 때의 값도 직전 커밋(그 노드가 형상에 있던 마지막 커밋)의 것이다. 식은 다른 형용사 키처럼 노드가 형상에 있는 동안 계산된 값을 가지며 나감에서는 그 값을 쓴다. 나가는 순간 형상 밖의 노드를 새로 평가하지 않으므로(위 로드 문단의 '형상에 없는 노드의 규칙은 평가하지 않는다', 12라운드 §9 소유자 동의) 식은 나감을 일으킨 변화를 보지 못한다(보게 하려면 12라운드 §9에 예외가 필요하다, 08 §16.3의 통보). Form 속성 층은 정착이 시작될 때 core가 든 값이며 속성의 바뀜은 나감이 아니다.
- 보충:
  > "그래서 식은 나감을 일으킨 변화를 보지 못한다(보게 하려면 12라운드 §9에 예외가 필요하다. 소유자 통보 2 허용: "예. 허용해야 합니다."). Form 속성 층은 정착이 시작될 때 core가 든 값(React가 마지막으로 커밋한 속성)이며, 속성이 바뀌는 것은 쓰기도 나감도 아니고 이미 잠복한 원본을 거슬러 비우지 않는다. Form 속성 층은 네 층의 가장 아래(포괄) 층이며 참일 때 로컬을 덮는 전체 잠금(`readOnly`·`disabled`)과 다르다." (`08-design-a-to-z.md:301`)
- 상태: 현행
- 출처: `03-mental-model.md:94#24-27`(정본), `08-design-a-to-z.md:301`
- 닫은 사람: 17라운드 스웜 수렴(편집자 결정, `08-design-a-to-z.md:301`), 소유자 답(`reviews/round-17-owner-answers.md:13` 통보 2), 소유자 답(`reviews/round-12-owner-answers.md:18` §9 형상에 없는 노드)
- 라운드: 17
- 까닭: `08-design-a-to-z.md:301`

### WRITE-039 노드 게이트 `controls.active: false`도 같은 장치 — `controls.visible`은 언제나 보존

- 결정:
  > 노드 게이트 `controls.active: false`도 같은 장치라 `controls.active`는 정책대로 비우고 `controls.visible`은 언제나 보존한다.
- 보충: 없음
- 상태: 현행
- 출처: `03-mental-model.md:94#28`(정본), `08-design-a-to-z.md:303`
- 닫은 사람: 원리(G4, `reviews/round-12-derivation.md:61`), 소유자 답(`reviews/round-13-owner-answers.md:8` 2 나감 비움 기본값; 정책대로)
- 라운드: 13
- 까닭: `reviews/round-12-derivation.md:61`

### WRITE-040 나감의 비움의 비용 — 하위 트리를 위에서 아래로 한 번 순회

- 결정:
  > 비용: 나감의 비움은 나간 하위 트리를 위에서 아래로 한 번 순회하며 조상의 정책을 인자로 내려보낸다(노드당 상수, 위로 거슬러 오르지 않는다). 청사진이 "하위 트리에 정책 선언 없음"을 미리 표시하면 Form 속성이 꺼져 있을 때 순회를 건너뛴다. 꺼진 조각이 선언한 하위 트리와 잠복 하위 트리의 순회가 더해지며(노드당 상수), 이것은 §7 비용의 상한(재계산 목록과 자동 쓰기 기록만 순회한다)에 둔 예외다(원장 §4).
- 보충: 없음
- 상태: 현행
- 출처: `08-design-a-to-z.md:304`(정본)
- 닫은 사람: 편집자 결정(14라운드, `reviews/raw-round14-unset-subtree.md:23`; 첫째–둘째 문장), 17라운드 스웜 수렴(편집자 결정, `reviews/raw-round17-convergence.md:117`; 셋째 문장)
- 라운드: 17
- 까닭: `08-design-a-to-z.md:304`

### WRITE-041 오늘의 꺼짐·켜짐 동작은 이주 항목 — 방출에서 지움과 원본 지움의 차이 셋

- 결정:
  > 오늘의 동작(꺼지면 원본을 지우고 켜지면 노드가 생성될 때의 값, 없으면 `default`로 복원)은 이주 항목이다. 소유자: "onChange로 넘어가는 값에서 지워지는 게 기본값이면 된다." 13라운드 답 2의 되물음("차이는 재전환시 값의 잔류 여부인건가?")의 답: 차이는 셋이다. 다시 켜질 때 옛 값이 되살아나는가, 꺼진 동안 `getInactiveValues`로 읽히는가, 그 원본이 메모리에 남는가.
- 보충: 없음
- 상태: 현행
- 출처: `08-design-a-to-z.md:305`(정본)
- 닫은 사람: 소유자 답(`reviews/round-13-owner-answers.md:8` 2 나감 비움 기본값)
- 라운드: 13
- 까닭: `reviews/round-13-owner-answers.md:8`
- 충돌:
  > `08-design-a-to-z.md:305`의 "꺼진 동안 `getInactiveValues`로 읽히는가"는 잠복 원본 열거를 `getInactiveValues`라는 읽기로 적는다. 소유자 답과 다르다. 소유자 답이 이긴다(`reviews/round-18-owner-answers.md:22`, VALUE-029: 잠복 원본 열거는 루트 노드의 함수이고 노드마다 getter `inactiveValues`).

### WRITE-042 `reset`은 로드로 충분하다 — 판정 기준

- 결정:
  > 값의 리셋은 로드로 충분하고 오늘보다 싸고 안전하다(트리·캐시·노드 참조가 그대로이고, 동기라 틈이 없다). 로드만으로 모자란 것은 상호작용 상태, 입력 컴포넌트의 내부 상태, Form 층의 상태 셋이며 장치를 더해 닫는다. 로드로 닫을 수 없는 것은 스키마가 실제로 바뀐 경우 하나이며, 그때는 reset 호출 안에서 트리와 캐시를 새로 만든다. 판정 기준: reset 뒤의 값·상호작용 상태·표시 상태(오류와 그 표시)는 같은 prop으로 막 마운트한 폼과 같고(`key` 재마운트와 같은 결과), 노드 트리와 identity, 구독, 캐시, 렌더러와 호출자 `children`, 자식 프록시를 마운트하고 있는 입력의 비값 상태는 남는다(`key`보다 효율적이고 안전한 쪽). 지금 자식을 그리지 않는 입력, 곧 접힌 펼침 영역과 빈 배열은 다시 마운트된다.
- 보충:
  > 소유자(16라운드 답 2): "기본적으로 값에 대한 리셋이긴 한데요, 기존 사용방식을 참고해서 로드로 충분한지 검토해보세요." (`reviews/round-16-owner-answers.md:8`)
- 상태: 현행
- 출처: `09-landing-and-test-strategy.md:77`(정본), `09-landing-and-test-strategy.md:73,79`
- 닫은 사람: 소유자 답(`reviews/round-16-owner-answers.md:8` 2), 16라운드 스웜 수렴(편집자 결정, `09-landing-and-test-strategy.md:79`)
- 라운드: 16
- 까닭: `09-landing-and-test-strategy.md:73`

### WRITE-043 `reset`의 경로 — 같은 스키마면 로드, 다르면 재생성

- 결정:
  > **경로 — 같은 스키마인가.** `jsonSchema` prop이 트리의 작성 루트와 같은 객체이거나, JSON으로 표현되는 부분(원시 값, 배열, 평범한 객체)이 키 순서까지 깊게 같고 그 밖의 값(함수, 컴포넌트, React 요소, 클래스 인스턴스)이 참조로 같으면 같은 스키마다(`properties`의 키 순서는 필드 순서다. 키 순서를 보지 않는 `@winglet/common-utils`의 `equals`는 그대로 쓰지 않는다). 같으면 로드, 다르면 재생성(일곱째)이다. 비교는 참조가 다를 때만 하며 비용은 스키마 크기에 비례하는 순회 한 번이다. 같은 스키마로 판정된 새 객체는 트리가 들지 않고 캐시의 키는 처음의 작성 루트 그대로다(08 §11.1). 그래서 렌더마다 새로 만드는 인라인 스키마도 함수·컴포넌트 칸이 같으면 로드를 탄다(답 2의 '불필요한 캐시 리빌드 없음', 답 10의 재생성 방지). 스키마 객체를 제자리에서 고친 뒤의 reset은 그 변경을 반영하지 않는다(바꾸려면 새 객체를 준다). `<Form>`이 `jsonSchema`·`defaultValue`를 마운트와 reset 때만 읽는 것은 오늘과 같다.
- 보충: 없음
- 상태: 현행
- 출처: `09-landing-and-test-strategy.md:81#1-9`(정본)
- 닫은 사람: 16라운드 스웜 수렴(편집자 결정, `09-landing-and-test-strategy.md:79`), 소유자 답(`reviews/round-16-owner-answers.md:16` 10)
- 라운드: 16
- 까닭: `09-landing-and-test-strategy.md:81`

### WRITE-044 `reset`의 값의 출처와 재대조

- 결정:
  > **값의 출처와 재대조.** reset은 호출 시점에 커밋된 prop(`jsonSchema`·`defaultValue`·`errors`·`showError`)으로 곧바로 로드하고, 호출이 돌아오면 커밋이 끝나 있다. 동시에 호출자의 갱신 차선으로 `<Form>`의 렌더를 하나 예약하고, 그 렌더의 커밋에서 prop이 reset이 쓴 것과 다르면(스키마는 첫째의 규칙, `defaultValue`·`errors`는 값의 깊은 같음, `showError`는 값) 커밋된 prop으로 reset을 한 번 더 한다. 그래서 같은 처리기에서 prop을 바꾼 뒤 부른 reset(`setRecord(b); formRef.current.reset()`, `startTransition` 안 포함)은 끝에서 새 prop을 반영하고(`startTransition` 안에서는 첫 로드의 옛 값이 한 번 그려지고 `onChange`로 나간다, 문서화), prop이 그대로인 reset(인라인 `defaultValue`로 부모가 다시 그린 경우 포함)은 로드 한 번으로 끝난다. 두 번째 reset은 독립된 진입이며 ADR 0008의 규칙대로 자기 통지를 낸다(재대조는 ADR 0008 §6의 이펙트 진입과 같은 새 진입이다). 그 경로에서는 `onChange`가 두 번이다. 예약된 재대조는 `<Form>`이 먼저 언마운트되면 버린다. prop 갱신만 `startTransition` 안에서 하고 reset은 밖에서 부른 경우는 오늘처럼 새 prop이 반영되지 않는다(문서화). 재대조의 reset은 원래 호출의 억제 비트를 그대로 쓴다.
- 보충: 없음
- 상태: 현행
- 출처: `09-landing-and-test-strategy.md:82`(정본)
- 닫은 사람: 16라운드 스웜 수렴(편집자 결정, `09-landing-and-test-strategy.md:79`)
- 라운드: 16
- 까닭: `09-landing-and-test-strategy.md:82`

### WRITE-045 `reset`이 유지하는 것, 상호작용과 Form 층의 초기화

- 결정:
  > **유지하는 것.** 노드 트리와 노드 identity, 청사진과 식 컴파일, 가드·사본 캐시, 검증기 등록, 유효 스키마 메모, 가상화의 드러난 기록(identity가 이어지는 노드에만), provider, `<form>`, 렌더러, 호출자 `children`.
  > **상호작용과 Form 층.** 두 경로 모두 한 진입 안에서: `dirty`·`touched`를 비우고 집계 상태가 실제로 바뀐 때만 `onStateChange`를 한 번 낸다(이미 비어 있으면 내지 않는다. `onChange`의 '바뀐 때만'과 같은 규칙. 오늘은 빠지는 것으로 판독했다, `reviews/raw-round16-reset.md` §4의 H1). 명령형 외부 오류와 검증 결과를 비우고 `errors` prop을 다시 적용한다. 첨부 파일 맵의 내용을 비운다(오늘과 같다). `showError`를 prop 값으로 돌린다(오늘은 유지된다, `Form.tsx:101`. 바뀌는 동작이며 근거는 위의 판정 기준이다). 로드이므로 `diagnostics`를 새로 적는다(예산 안이면 `stable`이 되고, 넘으면 다시 기록된다. 바뀌었으면 `onDiagnosticsChange`를 낸다. 앞서 `degraded`였다면 로드가 풀고 제출 거부도 풀리며, 로드가 다시 예산을 넘기면 다시 `degraded`가 되어 제출을 거부한다. 17라운드 소유자 답 R17-1 나).
- 보충: 없음
- 상태: 현행
- 출처: `09-landing-and-test-strategy.md:83-84`(정본)
- 닫은 사람: 16라운드 스웜 수렴(편집자 결정, `09-landing-and-test-strategy.md:79`), 소유자 답(`00-goals.md:109` C6; `dirty`·`touched` 현행 유지), 소유자 답(`reviews/round-17-owner-answers.md:9` R17-1; `diagnostics` 재기록)
- 라운드: 17
- 까닭: `09-landing-and-test-strategy.md:77`

### WRITE-046 `reset`의 스키마가 다른 경로 — 호출 안에서 동기로 재생성하고 옛 트리를 폐기

- 결정:
  > **스키마가 다른 경로.** 트리와 캐시를 새로 만든다(비용은 `<Form key>`의 재생성과 같다). reset 호출 안에서 동기로 만들고(트리 생성은 core의 연산이다, C3), 새 트리를 로드한 뒤 돌아오기 전에 핸들(`node`·`getValue`·`setValue` 등)을 새 트리로 바꾼다. 그래서 최외곽 호출의 `reset(); getValue()`와 `reset(); setValue(x)`는 경로와 무관하게 새 트리에 닿고(열린 진입 안에서도 같다, 열째), 오늘의 틈(reset 직후 `setValue`가 사라지고 `submit`이 아무것도 하지 않음)이 재생성 경로에도 남지 않는다. React 연결은 외부 저장소(`useSyncExternalStore`)로 알려 막는 차선으로 곧바로 커밋한다(`startTransition` 안에서도 옛 화면이 입력을 받는 틈을 두지 않는다). 옛 트리는 폐기로 표시하고 리스너를 놓는다. 옛 트리를 폐기할 때 그 노드들의 Refresh 번호와 상호작용 초기화 번호를 통지 없이 함께 올려, 폐기된 트리의 입력 인스턴스가 뒤늦게 낸 `onChange`·`onFileAttach`(언마운트 때의 flush 포함)와 흐림 뒤 미룬 `touched`가 여섯째의 검사에서 core에 닿기 전에 버려지게 한다. 여섯째의 검사를 받지 않는 컨테이너 입력의 늦은 `onChange`는 `handleChange`의 진입 하나(§2.3의 셋째)로 오고 그 진입 전체(값 쓰기, 외부 오류 지움, `dirty` 표시)가 입력 출처 표식(§2.3의 둘째)을 달고 오므로, 폐기된 노드는 셋을 모두 조용히 버린다. 늦은 `onFileAttach`는 노드 쓰기가 아니라 reset을 넘어 남는 Form 층 첨부 파일 맵의 쓰기이므로(오늘의 `SchemaNodeInput.tsx:61-67`), 래퍼가 맵에 쓰기 전에 노드의 폐기 표시를 읽어 폐기된 노드면 버린다(컨테이너 입력 포함). 표식 없이 폐기된 노드에 온 쓰기, 곧 호출자가 미리 잡아 둔 옛 노드 참조로 한 쓰기는 적용하지 않고 호출자 오류(`SchemaFormError`)로 환경 불문 즉시 던진다(ADR 0014 4판의 호출자 오류). 그래서 폐기된 노드에서 던지는 쓰기는 호출자가 잡아 둔 옛 노드 참조로 한 것뿐이다. 입력 컴포넌트가 래퍼를 거치지 않고 `FormTypeInputProps`의 `node`로 한 쓰기도 표식이 없으므로 이 옛 노드 참조에 들며, 재생성 reset 뒤 타이머나 언마운트 정리에서 하면 던진다(문서화, 열여섯째). 노드 참조와 가상화 기록은 이어지지 않는다(노드 참조가 reset을 넘어 이어지는 것은 로드 경로뿐이다. 문서화). 옛 트리의 콜백 억제를 위한 별도 표지(오늘의 `ready`)는 필요 없다. `onChange`는 로드 경로와 같은 규칙이다(새 트리의 방출 참조는 새로우므로 사실상 한 번 낸다).
- 보충: 없음
- 상태: 현행
- 출처: `09-landing-and-test-strategy.md:87#1-15`(정본)
- 닫은 사람: 16라운드 스웜 수렴(편집자 결정, `09-landing-and-test-strategy.md:79`)
- 라운드: 16
- 까닭: `09-landing-and-test-strategy.md:87`

### WRITE-047 소비자가 든 옛 노드가 옛 트리를 붙잡는 범위

- 결정:
  > 소비자가 든 옛 노드가 옛 트리를 붙잡는 범위(폐기 때 부모·자식 참조를 끊는가)는 PR-7 전 설계 항목이다(08 §15).
- 보충: 없음
- 상태: 대체됨(→ WRITE-086)
- 출처: `09-landing-and-test-strategy.md:87#22`(정본), `08-design-a-to-z.md:497`, `reviews/round-18-closing.md:1730-1738`
- 닫은 사람: 편집자 결정(17라운드, 18라운드 안건으로 이관 `reviews/round-18-agenda.md:111`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-61)
- 라운드: 18
- 까닭: `09-landing-and-test-strategy.md:87`, `reviews/round-18-closing.md:1740-1744`

### WRITE-048 `reset`이 로드하는 배열의 아이템 identity — `reset`만의 예외를 두지 않는다

- 결정:
  > reset이 로드하는 배열의 아이템 identity는 `setValue(V)`(`Overwrite`)의 통째 교체와 같은 PR-5의 규칙을 따르고 reset만의 예외를 두지 않는다(원장의 쓰기 표에서 둘은 같은 행이다. 규칙 자체는 08 §15의 슬라이스 5 항목). 입력은 다섯째로 초기화되므로 안전은 identity 규칙이 아니라 다섯째의 범위에 기댄다. identity가 끊겨 새로 생긴 아이템은 가상화 기록이 없어 다시 지연된다.
- 보충: 없음
- 상태: 현행
- 출처: `09-landing-and-test-strategy.md:92`(정본), `reviews/round-18-closing.md:2882`
- 닫은 사람: 16라운드 스웜 수렴(편집자 결정, `09-landing-and-test-strategy.md:79`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-103)
- 라운드: 18
- 까닭: `09-landing-and-test-strategy.md:92`, `reviews/round-18-closing.md:2891-2893`
- 충돌:
  > `09-landing-and-test-strategy.md:92`의 "원장의 쓰기 표에서 둘은 같은 행이다"는 18라운드 결정과 다르다: `setValue(V)`는 로드가 아니라 전체 교체 쓰기라 쓰기 표에서 reset과 다른 행이며, reset만의 예외를 두지 않는 근거는 모든 배열 통째 쓰기가 위치로 잇는다는 NODE-051이다(WRITE-097). 18라운드 결정이 이긴다(`reviews/round-18-closing.md:2882`).

### WRITE-049 `FormHandle.reset`의 값 출처 규칙을 노드 `resetSubtree()`에 옮기지 않는다

- 결정:
  > `FormHandle.reset`의 값 출처 규칙(prop)을 노드 `resetSubtree()`(오늘은 노드 생성 때의 값으로, `AbstractNode.ts:1138-1144`)에 옮기지 않는다. 두 연산은 이름과 대상(폼의 prop 상태 대 노드 하위 트리)이 달라 한 개념의 두 장치가 아니다.
- 보충:
  > 편집자 결정(18C-44): "【추론】 `FormHandle.reset()`은 커밋된 prop을 로드하고, 그 값이 스냅숏도 된다." (`reviews/round-18-closing.md:1229`)
  > 편집자 결정(18C-44): "【추론】 스냅숏은 core 자신의 로드 기록이며 prop 규칙을 core로 옮긴 것이 아니므로 WRITE-049는 그대로다." (`reviews/round-18-closing.md:1230`)
- 상태: 현행
- 출처: `09-landing-and-test-strategy.md:95#2-3`(정본), `reviews/round-18-closing.md:1229-1230`
- 닫은 사람: 16라운드 스웜 수렴(편집자 결정, `09-landing-and-test-strategy.md:79`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-44)
- 라운드: 18
- 까닭: `09-landing-and-test-strategy.md:95`, `reviews/round-18-closing.md:1240-1247`

### WRITE-050 `resetSubtree`를 남길지와 남길 때의 값 출처

- 결정:
  > `resetSubtree`는 08 §13 공개 표면에 없으므로 남길지와 남길 때의 값 출처는 PR-7 전 설계 항목이다(08 §15. 노드마다 초기값 사본을 드는 것은 ADR 0006과 메모리 비용에 걸린다).
- 보충: 없음
- 상태: 대체됨(→ WRITE-085)
- 출처: `09-landing-and-test-strategy.md:95#4`(정본), `08-design-a-to-z.md:497`, `reviews/round-18-closing.md:1220-1238`
- 닫은 사람: 편집자 결정(17라운드, 18라운드 안건으로 이관 `reviews/round-18-agenda.md:88`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-44)
- 라운드: 18
- 까닭: `09-landing-and-test-strategy.md:95`, `reviews/round-18-closing.md:1240-1247`

### WRITE-051 `reset`의 비용

- 결정:
  > 같은 스키마의 reset 한 번은 트리 전체 순회 한 번(로드에만 허용, 08 §7)과 자식 프록시를 그리지 않는 마운트된 입력 수만큼의 입력 다시 마운트다. 참조가 다른 같은 스키마는 스키마 크기에 비례하는 비교 한 번이 더해진다. 전처리, 검증기 재컴파일, `new Function`, 노드 재생성, 가상화 재지연이 없어진다. 같은 처리기에서 prop을 바꾼 reset은 로드가 한 번 더 든다(`defaultValue`가 깊게 같으면 건너뛴다). 검증기 등록의 메모리는 '살아 있는 작성 루트의 수 + 최근 해제 목록 크기'로 묶인다. 답 10의 고속성(최소 생성, 메모리 안정, 재생성 방지)과 같은 방향이다. 스키마가 실제로 바뀐 reset은 오늘과 같은 비용이다.
- 보충: 없음
- 상태: 현행
- 출처: `09-landing-and-test-strategy.md:98`(정본)
- 닫은 사람: 16라운드 스웜 수렴(편집자 결정, `09-landing-and-test-strategy.md:79`), 소유자 답(`reviews/round-16-owner-answers.md:16` 10)
- 라운드: 16
- 까닭: `09-landing-and-test-strategy.md:98`

### WRITE-052 노드마다 타입에 맞는 parse — 뜻이 그대로인 변환만(형 정규화, ADR 0013 결정 1의 이름 붙은 예외)

- 결정:
  > 확정. 노드마다 타입에 맞는 parse 함수를 둔다.
  > 이것은 값의 교정이 아니라 JSON·JS 자동 형변환을 통제할 수 있게 구현한 것이므로 ADR 0013 결정 1의 대상이 아니다.
  > 확정(나). parse는 뜻이 그대로인 변환만 한다(ajv 규칙 수준). 오늘 파서의 문자 제거, 정수 자르기, 빈 값 치환(`""`, `[]`, `{}`), 불리언의 진릿값 변환은 parse에서 뺀다. ADR 0013 결정 1에는 이름 붙은 예외(형 정규화)로 적는다.
- 보충:
  > 소유자(S1 둘째 답): "S1. node 는 각자의 타입에 맞는 parse 함수를 가져야 합니다. 지금처럼요. 이건 값의 조작이라기보단, json or JS 의 자동형변환을 통제 가능하게 구현하는 방향이라고 보아도 좋습니다." (`reviews/round-18-owner-answers.md:7`)
  > 소유자(S1 이어서): ""나"로 갑시다. 이게 정확히 내가 원하는 기능이에요. 그 이상을 하는건 나도 원치 않습니다." (`reviews/round-18-owner-answers.md:8`)
  > "이 답이 대체하는 자리: `adr/0013-core-does-not-rewrite-values.md:88`(타입별 파서의 강제 변환은 입력 컴포넌트로)과 `:89`(파서 강제 변환의 폐기는 유지), `03-mental-model.md:152`(파서 강제 변환은 입력 컴포넌트로), `09-landing-and-test-strategy.md:9`(파서 변환은 교체 대상), `:33`(PR-2의 교체 대상 칸의 `core/parsers/*`는 그대로 쓰는 것으로), `:160`(파서 변환을 단언하는 시험을 버림)." (`reviews/round-18-owner-answers.md:7`)
- 상태: 현행
- 출처: `reviews/round-18-owner-answers.md:7-8`(정본), `reviews/raw-round18-s1-parse-check.md`
- 닫은 사람: 소유자 답(`reviews/round-18-owner-answers.md:7` S1), 소유자 답(`reviews/round-18-owner-answers.md:8` S1 이어서), 편집자 결정(18라운드, `reviews/round-18-owner-answers.md:8`; 이름 붙은 예외(형 정규화)의 표기)
- 라운드: 18
- 까닭: `reviews/round-18-owner-answers.md:7`
- 충돌:
  > `03-mental-model.md:152`의 "파서 강제 변환·`minItems` 채우기는 입력 컴포넌트로"는 정본과 다르다. 정본이 이긴다(`reviews/round-18-owner-answers.md:7-8`).

### WRITE-053 변환 목록 — ajv `coerceTypes`의 부분집합, 자동 변환은 늘 켜져 있다

- 결정:
  > 변환 목록(ajv `coerceTypes`의 부분집합): 수 노드는 앞뒤 공백을 뺀 전체가 수 표기인 문자열을 유한한 수로 바꾸고(정수 노드는 결과가 안전한 정수일 때만, 이미 수인 값은 자르지 않는다), 문자열 노드는 유한한 수와 불리언을, 불리언 노드는 정확히 `"true"`·`"false"`와 수 1·0을 바꾼다. `null`은 어느 노드에서도 바꾸지 않는다. 이미 자기 타입인 값은 그대로 둔다.
  > 자동 변환(`"123"`을 123으로)은 S1의 parse 자체이며 지금처럼 늘 켜져 있다(끄는 옵션을 두지 않는다).
- 보충:
  > 소유자(S1 셋째 답의 물음): "다만, 그럼 한가지, 자동전환시도는 어떻게 되는거죠? "123" -> 123 같이 변환하는거요. 이건 편의기능에 가까울거같은데, 지원하나요?" (`reviews/round-18-owner-answers.md:9`)
  > "수 노드: 문자열이고, 앞뒤 공백을 뺀 나머지가 비어 있지 않은 JSON 수 표기(부호 `-`, 10진 정수부, 소수부와 지수부는 있어도 되고 없어도 됨)일 때 수로 바꿉니다. 결과가 유한해야 합니다. 소수부와 지수부가 없는 정수 표기라면 결과가 안전한 정수 범위 안에 있어야 합니다." (`reviews/raw-round18-s1-unconvertible-review.md:82`)
- 상태: 분할됨(→ WRITE-075, WRITE-076)
- 출처: `reviews/round-18-owner-answers.md:9`(정본), `reviews/raw-round18-s1-unconvertible-review.md:81-95`
- 닫은 사람: 소유자 답(`reviews/round-18-owner-answers.md:8` S1 이어서; ajv 규칙 수준), 18라운드 스웜 수렴(편집자 결정, `reviews/raw-round18-s1-unconvertible-review.md:81`; 변환 목록), 편집자 결정(18라운드, `reviews/round-18-owner-answers.md:9`; 늘 켜짐)
- 라운드: 18
- 까닭: `reviews/round-18-owner-answers.md:8`

### WRITE-054 바꾸지 못한 값은 받은 그대로 든다 — 정합 상태(경고등)가 공개 형의 판별자

- 결정:
  > 확정(나′, 경고등, `onError` 전달).
  > 바꾸지 못한 값은 받은 그대로 들고 `value`·방출·제출이 모두 그 값이다(비우기·대체·거부 없음). 노드는 정합 상태(경고등)를 들고, 이것이 공개 형의 판별자다(이름과 모양은 18라운드 §7).
- 보충:
  > 소유자(S1 셋째 답): "나 로 확정합니다. 경고등 추가도 승인합니다. 변환에러는 onError 로 전달하죠." (`reviews/round-18-owner-answers.md:9`)
  > 소유자(S1 셋째 답의 넷째 말): "그럼 이건 어때? Node 가 자신 타입에 맞는 값을 제공한다는걸 보장하진 못하지만, 현재 Node 의 값이 "정합한지" 여부는 상태로 둘 수 있을거같아. error 와 별개로, 이 상태를 보고 현재 값의 건전성을 판단하도록 하는건 어떤가?" (`reviews/round-18-owner-answers.md:9`)
- 상태: 현행
- 출처: `reviews/round-18-owner-answers.md:9`(정본), `reviews/raw-round18-s1-unconvertible-review.md`
- 닫은 사람: 소유자 답(`reviews/round-18-owner-answers.md:9` S1 셋째)
- 라운드: 18
- 까닭: `reviews/round-18-owner-answers.md:9`

### WRITE-055 변환하지 못한 입력의 `onError` 경고 — level, 코드(가칭), 보내는 때, 제출

- 결정:
  > 편집자 결정: `onError` 기록의 level은 `warning`이고(값을 보존하므로 폼의 약속은 지켜진다. error 층은 throw·거부·싱크로 드러나야 해 통보 3과 부딪힌다), 가칭 `SCHEMA_FORM_WARNING.VALUE_TYPE_MISMATCH`를 노드의 정합 상태가 켜질 때마다 한 번 보낸다(path, 기대 형, 받은 값의 종류, 쓰기 출처). 검증기가 있든 없든 보낸다(core의 parse가 찾는 것이라 검증 결과가 아니다). 제출은 검증기가 있으면 검증이 막고 없으면 막지 않는다(통보 3).
- 보충: 없음
- 상태: 중복(→ ERROR-182)
- 출처: `reviews/round-18-owner-answers.md:9`(정본)
- 닫은 사람: 소유자 답(`reviews/round-18-owner-answers.md:9` S1 셋째; `onError` 전달), 편집자 결정(18라운드, `reviews/round-18-owner-answers.md:9`; level·코드·보내는 때), 소유자 답(`reviews/round-17-owner-answers.md:14` 통보 3; 제출)
- 라운드: 18
- 까닭: `reviews/round-18-owner-answers.md:9`

### WRITE-056 parse를 부르는 자리와 적용 범위

- 결정:
  > 편집자가 닫을 세부: parse는 각 동작 행의 `interpret`(입력 해석) 칸이 부르고, 적용 범위는 '지금처럼'을 따라 노드에 드는 모든 쓰기다.
- 보충:
  > "`parsers`의 새 자리는 18라운드의 노드 구조 항목에서 정한다" (`reviews/round-18-owner-answers.md:7`)
  > 편집자 결정(18C-36): "【추론】 S1 parse 함수는 `src/core/behaviors/utils/parse/`에 둔다." (`reviews/round-18-closing.md:988`)
  > 편집자 결정(18C-36): "【추론】 부르는 쪽은 동작 행의 `interpret` 칸뿐이다(WRITE-056)." (`reviews/round-18-closing.md:989`)
  > 편집자 결정(18C-36): "【추론】 18C-02의 `union` 행이 수·문자열·불리언 변환을 `type`에 적힌 순서로 부르므로 이 변환들은 두 종류 이상이 쓴다." (`reviews/round-18-closing.md:990`)
  > 편집자 결정(18C-36): "【추론】 그래서 NODE-009대로 `behaviors/utils/` 아래, 주제 디렉토리 `parse/`에 둔다." (`reviews/round-18-closing.md:991`)
  > 편집자 결정(18C-36): "【추론】 NODE-009와 어긋나지 않는다." (`reviews/round-18-closing.md:992`)
  > 편집자 결정(18C-36): "【추론】 PR-2는 이 자리에 S1 변환(`reviews/round-18-owner-answers.md:9`의 변환 목록, WRITE-052)만 하는 parse를 새로 둔다." (`reviews/round-18-closing.md:993`)
  > 편집자 결정(18C-36): "【추론】 오늘의 `src/core/parsers/`는 그것을 가져오는 옛 노드와 함께 `src/__legacy__/core/parsers/`로 옮긴다(18C-49)." (`reviews/round-18-closing.md:994`)
  > 편집자 결정(18C-36): "【추론】 레거시는 새 parse를 가져오지 않는다." (`reviews/round-18-closing.md:995`)
- 상태: 현행
- 출처: `reviews/round-18-owner-answers.md:7`(정본), `reviews/round-18-closing.md:988-995`
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-owner-answers.md:7`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-36)
- 라운드: 18
- 까닭: `reviews/round-18-owner-answers.md:7`, `reviews/round-18-closing.md:997-999`
- 충돌:
  > `reviews/round-18-closing.md:990`의 "`type`에 적힌 순서로 부르므로"는 소유자 답과 다르다: `union` 노드의 해석은 `type`의 선언 순서도 검증기 플러그인의 규칙도 쓰지 않고, 변환 목록(WRITE-075)으로 받아 줄 형이 정확히 하나일 때만 그 형으로 바꾼다(BLUEPRINT-042). 소유자 답이 이긴다(`reviews/round-18-owner-answers.md:24`).

### WRITE-057 S1 결정의 후속 세부

- 결정:
  > 후속 세부는 `reviews/round-18-agenda.md` §6의 'S1 결정의 후속 세부' 행
- 보충:
  > "(1) 정합 상태(경고등)의 이름과 공개 형 판별자의 모양, 루트에서 트리 전체의 불일치를 한 번에 읽는 자리(§7과 함께)." (`reviews/round-18-agenda.md:80`)
  > "(3) 틀린 형의 값을 게이트와 식이 볼 때: `if`의 `minimum`은 수가 아닌 값에 참이고, 식이 틀린 형에서 던지면 `EXPRESSION_THREW`로 `degraded`가 되어 검증기 없는 폼도 제출이 막힌다." (`reviews/round-18-agenda.md:80`)
  > "(5) 가상 노드의 예외(자기 원본이 없어 모양이 틀린 쓰기는 오늘처럼 거부)와 `VirtualNode.ts:45`의 길이 검사 앞에 배열 확인." (`reviews/round-18-agenda.md:80`)
  > 편집자 결정(18C-40): "(5) 가상 노드의 예외와 배열 먼저 확인은 18C-21로 닫는다." (`reviews/round-18-closing.md:1128`)
  > 편집자 결정(18C-40): "【추론】 (6) 옛 설계 문서(03·04·08·09·ADR)는 고치지 않는다(원장 답, `reviews/round-18-owner-answers.md:10`)." (`reviews/round-18-closing.md:1129`)
  > 편집자 결정(18C-40): "【추론】 어긋남은 원장의 충돌 칸에 적는다(03:152는 WRITE-052에 이미 있다)." (`reviews/round-18-closing.md:1130`)
- 상태: 분할됨(→ VALUE-030, SURFACE-052, CONTROLS-074, WRITE-084, REACT-027, LANDING-150, LANDING-151, LANDING-125, ERROR-195, VALUE-033)
- 출처: `reviews/round-18-owner-answers.md:9`(정본), `reviews/round-18-agenda.md:80`, `reviews/round-18-closing.md:1084-1132,1143-1147`
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-owner-answers.md:9`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-40)
- 라운드: 18
- 까닭: `reviews/round-18-agenda.md:80`, `reviews/round-18-closing.md:1134-1141`

### WRITE-058 `setValue(undefined)`의 정의와 입력의 객체 전체 쓰기의 종류

- 결정:
  > `setValue(undefined)`의 정의, 입력의 객체 전체 쓰기가 로드인지(derivations §3 D-4·D-5).
- 보충: 없음
- 상태: 분할됨(→ WRITE-080, WRITE-081)
- 출처: `adr/0013-core-does-not-rewrite-values.md:106#1`(정본), `reviews/round-18-closing.md:463-500,516-540`
- 닫은 사람: 편집자 결정(17라운드, 18라운드 안건으로 이관 `reviews/round-18-agenda.md:42,46`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-16·18C-17)
- 라운드: 18
- 까닭: `adr/0013-core-does-not-rewrite-values.md:106`, `reviews/round-18-closing.md:502-510`, `reviews/round-18-closing.md:542-548`

### WRITE-059 배열 아이템의 생김과 채움의 세부

- 결정:
  > 배열 아이템의 생김과 채움(통째 쓰기의 재생성과 재조정, `push`가 로드인가, `contains`·`prefixItems`)은 미정(07 11.2)이다.
- 보충: 없음
- 상태: 대체됨(→ NODE-051, WRITE-088, FRAGMENT-051, NODE-052)
- 출처: `02-target-overview.md:287#1`(정본), `adr/0013-core-does-not-rewrite-values.md:106`, `reviews/round-18-closing.md:1638-1684,1692-1698`
- 닫은 사람: 편집자 결정(17라운드, 18라운드 안건으로 이관 `reviews/round-18-agenda.md:109`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-59)
- 라운드: 18
- 까닭: `adr/0013-core-does-not-rewrite-values.md:106`, `reviews/round-18-closing.md:1686-1690`

### WRITE-060 `controls.derived`의 덮어쓰기 — 레벨과 혼합안을 버리고 에지로

- 결정:
  > 입력을 열어 둔 채 매번 덮어쓰는 레벨은 사용자 편집마다 입력을 리마운트하므로 계승 제약 T-2 "타이핑은 입력을 리마운트하지 않는다"에 걸린다(실행으로 확인). 쓴 주체에 따라 방아쇠를 가르는 혼합안은 G4 "특수 경로가 없다"에 걸린다. `injectTo`와 로드 규칙이 다른 에지는 G4에 걸린다.
- 보충:
  > "06의 5.2(D-11′, 사용자가 파생 필드를 덮어쓸 수 있는가)는 에지다." (`07-conclusions.md:276`)
- 상태: 현행(부정 결정)
- 출처: `06-conclusions.md:282`(정본), `06-conclusions.md:280-286`, `07-conclusions.md:276`
- 닫은 사람: 편집자 결정(9라운드 도출, `07-conclusions.md:276`)
- 라운드: 9
- 까닭: `06-conclusions.md:282`

### WRITE-061 대체됨: 타입별 파서의 강제 변환은 입력 컴포넌트로(ADR 0013 분류표 행)

- 결정:
  > | 오늘의 동작 | 새 원칙에서 |
  > | ---------- | ---------- |
  > | 타입별 파서의 강제 변환 | **입력 컴포넌트로**(P2). 입력을 값으로 해석하는 일은 입력의 몫이다 |
- 보충: 없음
- 상태: 대체됨(→ WRITE-052)
- 출처: `adr/0013-core-does-not-rewrite-values.md:86,88`(정본), `03-mental-model.md:152`
- 닫은 사람: 소유자 답(`reviews/round-18-owner-answers.md:7` S1), 소유자 답(`reviews/round-18-owner-answers.md:8` S1 이어서)
- 라운드: 18
- 까닭: `reviews/round-18-owner-answers.md:7`

### WRITE-062 대체됨: 파서 강제 변환의 폐기는 유지(ADR 0013 `trim` 행의 끝)

- 결정:
  > 파서 강제 변환의 폐기는 유지하고 trim 행만 뒤집혔다
- 보충: 없음
- 상태: 대체됨(→ WRITE-052)
- 출처: `adr/0013-core-does-not-rewrite-values.md:89`(정본)
- 닫은 사람: 소유자 답(`reviews/round-18-owner-answers.md:7` S1)
- 라운드: 18
- 까닭: `reviews/round-18-owner-answers.md:7`

### WRITE-063 대체됨: 오늘의 `src/core/parsers/`를 그대로 쓴다(S1 첫 반영)

- 결정:
  > 오늘의 `src/core/parsers/`(`parseString`, `parseNumber`, `parseBoolean`, `parseArray`, `parseObject`. 파싱할 수 없는 입력에서 throw하지 않는다)를 그대로 쓴다.
- 보충: 없음
- 상태: 대체됨(→ WRITE-052)
- 출처: `reviews/round-18-owner-answers.md:7`(정본)
- 닫은 사람: 소유자 답(`reviews/round-18-owner-answers.md:8` S1 이어서)
- 라운드: 18
- 까닭: `reviews/round-18-owner-answers.md:8`

### WRITE-064 대체됨: 공개 값 형은 오늘처럼 그 타입의 값, 파싱 실패는 `NaN`(S1 첫 반영)

- 결정:
  > 공개 값 형은 오늘처럼 그 타입의 값이다(수 노드는 수, 파싱 실패는 `NaN`).
- 보충: 없음
- 상태: 대체됨(→ WRITE-054)
- 출처: `reviews/round-18-owner-answers.md:7`(정본)
- 닫은 사람: 소유자 답(`reviews/round-18-owner-answers.md:9` S1 셋째)
- 라운드: 18
- 까닭: `reviews/round-18-owner-answers.md:9`

### WRITE-065 대체됨: 쓰기 옵션은 비트 워드가 아니라 옵션 객체(5라운드 후속 C-5·C-6)

- 결정:
  > 결론(5라운드 후속 C-5·C-6): 비트 워드가 아니라 옵션 객체 `{ mode?: 'Overwrite' | 'Merge'; disableDefaultInjection?: boolean }`.
- 보충: 없음
- 상태: 대체됨(→ WRITE-015)
- 출처: `open-questions.md:52`(정본)
- 닫은 사람: 편집자 결정(9라운드, `07-conclusions.md:345` 6.2의 N1)
- 라운드: 9
- 까닭: `adr/0013-core-does-not-rewrite-values.md:13`

### WRITE-066 대체됨: `PreventInjection`은 `disableDefaultInjection`(이름 후보)이 됐다

- 결정:
  > `PreventInjection`은 `disableDefaultInjection`(이름 후보)이 됐고 `reset(options)`·마운트에도 있다.
- 보충: 없음
- 상태: 대체됨(→ WRITE-015)
- 출처: `open-questions.md:52#3`(정본)
- 닫은 사람: 편집자 결정(9라운드, `07-conclusions.md:304` 6.1 소유자가 동의한 이름)
- 라운드: 9
- 까닭: `07-conclusions.md:345`

### WRITE-067 대체됨: 통째로 받은 배열의 아이템과 `push()`로 만든 아이템은 로드로 취급해 `default`가 들어간다(06 4.7)

- 결정:
  > 통째로 받은 배열의 아이템과 `push()`로 만든 아이템은 로드로 취급해 `default`가 들어간다.
- 보충: 없음
- 상태: 대체됨(→ WRITE-015, WRITE-007, WRITE-059)
- 출처: `06-conclusions.md:166#2`(정본), `06-conclusions.md:168`
- 닫은 사람: 소유자 답(`reviews/round-10-owner-answers.md:7` A-1), 편집자 결정(9라운드, `07-conclusions.md:106` 4.22)
- 라운드: 10
- 까닭: `adr/0013-core-does-not-rewrite-values.md:66`

### WRITE-068 대체됨: 조각이 꺼질 때 값을 제거하는 옵션의 기본값은 true(12라운드 답 3)

- 결정:
  > 단, 기본값은 true, false 로 끌 수 있도록 한다. 이는 omitEmpty 와 동일하게, 빼는게 기본 동작이라고 가정한 구성이다.
- 보충: 없음
- 상태: 대체됨(→ WRITE-031, WRITE-037)
- 출처: `reviews/round-12-owner-answers.md:10`(정본)
- 닫은 사람: 소유자 답(`reviews/round-13-owner-answers.md:8` 2 나감 비움 기본값)
- 라운드: 13
- 까닭: `reviews/round-13-owner-answers.md:8`

### WRITE-069 비객체 V의 `Merge`와 되먹임 거부를 호출자에게 알리는 표면(`setValue(undefined)`와 함께)

- 결정:
  > `setValue(undefined)`와 비객체 V의 `Merge`, 되먹임 거부를 호출자에게 알리는 표면(슬라이스 2 전).
- 보충:
  > "되먹임 거부를 호출자에게 알리는 표면(정해지면 오류 코드가 생길 수 있음)" (`reviews/round-18-agenda.md:43`)
- 상태: 분할됨(→ WRITE-079, WRITE-081, ERROR-194)
- 출처: `03-mental-model.md:212`(정본), `08-design-a-to-z.md:489`, `reviews/round-18-agenda.md:42-43`, `reviews/round-18-closing.md:463-500,516-540`
- 닫은 사람: 편집자 결정(17라운드, 18라운드 안건으로 이관 `reviews/round-18-agenda.md:42,43`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-16·18C-17)
- 라운드: 18
- 까닭: `03-mental-model.md:212`, `reviews/round-18-closing.md:502-510`, `reviews/round-18-closing.md:542-548`

### WRITE-070 객체 호스트 `default`의 자손 분배 규칙

- 결정:
  > | 객체 호스트 `default`의 자손 분배 규칙(프로토타입에만 흔적) | 2 전(18라운드 안건 C: 쓰기 의미론의 세부) |
- 보충: 없음
- 상태: 대체됨(→ WRITE-082)
- 출처: `08-design-a-to-z.md:491`(정본), `reviews/round-18-agenda.md:44`, `reviews/round-18-closing.md:554-569`
- 닫은 사람: 편집자 결정(17라운드, 18라운드 안건으로 이관 `reviews/round-18-agenda.md:44`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-18)
- 라운드: 18
- 까닭: `08-design-a-to-z.md:491`, `reviews/round-18-closing.md:571-576`

### WRITE-071 `defaultValue`는 분배 시 복사하거나 불변으로 취급한다(F24)

- 결정:
  > 터미널 노드가 참조를 들 수 있으므로 `defaultValue`는 분배 시 복사하거나 불변으로 취급한다(F24, T-19).
- 보충:
  > "| F24 | A2 | core는 호출자가 넘긴 객체를 바꾸지 않는다. 터미널 노드가 참조를 들 수 있으므로 `defaultValue`는 분배 시 복사하거나 불변으로 취급한다(T-19) |" (`reviews/round-4-spec.md:157`)
- 상태: 현행
- 출처: `adr/0011-branch-node-composition.md:62#2`(정본), `reviews/round-4-spec.md:157`
- 닫은 사람: 편집자 결정(4라운드, F24 `reviews/round-4-spec.md:157`)
- 라운드: 4
- 까닭: `adr/0011-branch-node-composition.md:62`

### WRITE-072 대체됨: 자동 쓰기는 `default` 주입, `injectTo`, `&derived` 셋(06 용어)

- 결정:
  > | 자동 쓰기 | 사용자나 호출자가 아니라 규칙이 원본에 쓰는 것. `default` 주입, `injectTo`, `&derived` 셋이다 |
- 보충: 없음
- 상태: 대체됨(→ WRITE-008)
- 출처: `06-conclusions.md:43`(정본), `07-conclusions.md:30`
- 닫은 사람: 소유자 답(`reviews/round-10-owner-answers.md:7` A-1; `default` 주입이 채움으로), 소유자 답(`reviews/round-12-owner-answers.md:13` 5 `&clearValue`; `controls.unsetValue`가 더해짐), 소유자 답(`reviews/round-13-owner-answers.md:8` 2 나감 비움 기본값; 다섯째 나감의 비움)
- 라운드: 13
- 까닭: `07-conclusions.md:30`

### WRITE-073 대체됨: D-5의 끄는 스위치는 로드의 `default` 하나만 끈다(06 4.14)

- 결정:
  > **D-5** 로드 시 `default`는 없음인 키에만 들어가고, 끄는 스위치는 이 하나만 끈다(P2).
- 보충: 없음
- 상태: 대체됨(→ WRITE-008, WRITE-015)
- 출처: `06-conclusions.md:225#1`(정본), `07-conclusions.md:103`
- 닫은 사람: 편집자 결정(9라운드, `07-conclusions.md:103` 4.0의 4.14 행), 편집자 결정(9라운드, `07-conclusions.md:345` 6.2의 N1)
- 라운드: 9
- 까닭: `07-conclusions.md:103`

### WRITE-074 억제 옵션의 JSDoc이 "로드"를 정의한다

- 결정:
  > JSDoc이 "로드"를 정의한다.
- 보충:
  > "어느 것이든 JSDoc에 "로드"를 정의한다 — 생성 시 `defaultValue`, `reset()`, `setValue(V, Overwrite)`, `null`로의 교체와 그 정착 안의 전이." (`reviews/raw-round5-consumer.md:184`)
- 상태: 현행
- 출처: `adr/0007-settle-cycle.md:147#3`(정본), `reviews/raw-round5-consumer.md:184`
- 닫은 사람: 편집자 결정(5라운드 소비자 검토 반영, `reviews/raw-round5-consumer.md:184`)
- 라운드: 5
- 까닭: `reviews/raw-round5-consumer.md:184`
- 충돌:
  > `reviews/raw-round5-consumer.md:184`의 "생성 시 `defaultValue`, `reset()`, `setValue(V, Overwrite)`, `null`로의 교체와 그 정착 안의 전이"는 소유자 답과 다르다: `setValue(V, Overwrite)`와 `null`로의 교체는 로드가 아니라 전체 교체 쓰기이고, 로드는 마운트·`FormHandle.reset()`·`resetSubtree()`뿐이다(WRITE-090). 소유자 답이 이긴다(`reviews/round-18-owner-answers.md:26`).

### WRITE-075 변환 목록 — ajv `coerceTypes`의 부분집합

- 결정:
  > 변환 목록(ajv `coerceTypes`의 부분집합): 수 노드는 앞뒤 공백을 뺀 전체가 수 표기인 문자열을 유한한 수로 바꾸고(정수 노드는 결과가 안전한 정수일 때만, 이미 수인 값은 자르지 않는다), 문자열 노드는 유한한 수와 불리언을, 불리언 노드는 정확히 `"true"`·`"false"`와 수 1·0을 바꾼다. `null`은 어느 노드에서도 바꾸지 않는다. 이미 자기 타입인 값은 그대로 둔다.
- 보충:
  > "수 노드: 문자열이고, 앞뒤 공백을 뺀 나머지가 비어 있지 않은 JSON 수 표기(부호 `-`, 10진 정수부, 소수부와 지수부는 있어도 되고 없어도 됨)일 때 수로 바꿉니다. 결과가 유한해야 합니다. 소수부와 지수부가 없는 정수 표기라면 결과가 안전한 정수 범위 안에 있어야 합니다." (`reviews/raw-round18-s1-unconvertible-review.md:82`)
- 상태: 현행
- 출처: `reviews/round-18-owner-answers.md:9`(정본, S1 셋째의 반영 칸. 표 행이라 조각 번호로 나눌 수 없다. WRITE-053에서 분할), `reviews/raw-round18-s1-unconvertible-review.md:81-95`
- 닫은 사람: 소유자 답(`reviews/round-18-owner-answers.md:8` S1 이어서; ajv 규칙 수준), 18라운드 스웜 수렴(편집자 결정, `reviews/raw-round18-s1-unconvertible-review.md:81`; 변환 목록)
- 라운드: 18
- 까닭: `reviews/round-18-owner-answers.md:8`

### WRITE-076 자동 변환은 늘 켜져 있다 — 끄는 옵션을 두지 않는다

- 결정:
  > 자동 변환(`"123"`을 123으로)은 S1의 parse 자체이며 지금처럼 늘 켜져 있다(끄는 옵션을 두지 않는다).
- 보충:
  > 소유자(S1 셋째 답의 물음): "다만, 그럼 한가지, 자동전환시도는 어떻게 되는거죠? "123" -> 123 같이 변환하는거요. 이건 편의기능에 가까울거같은데, 지원하나요?" (`reviews/round-18-owner-answers.md:9`)
  > 소유자(12-1 답): "자동변환을 따로 끄는 옵션은 생각하지 않습니다만, 필요하다고 한다면 form 단위에서 props 로 추가하도록 하시죠" (`reviews/round-18-owner-answers.md:11`)
- 상태: 현행
- 출처: `reviews/round-18-owner-answers.md:9`(정본, S1 셋째의 반영 칸. 표 행이라 조각 번호로 나눌 수 없다. WRITE-053에서 분할), `reviews/round-18-owner-answers.md:11`
- 닫은 사람: 소유자 답(`reviews/round-18-owner-answers.md:11` 12-1)
- 라운드: 18
- 까닭: `reviews/round-18-owner-answers.md:11`

### WRITE-077 자동 변환을 끄는 옵션 — 두지 않되 필요하면 `<Form>`의 prop 하나로

- 결정:
  > 끄는 옵션은 두지 않는다. 필요가 생기면 노드나 스키마 단위가 아니라 `<Form>`의 prop 하나로 더한다(설계 예약: 폼 단위, 이름은 그때 정함).
- 보충:
  > 소유자(12-1 답): "자동변환을 따로 끄는 옵션은 생각하지 않습니다만, 필요하다고 한다면 form 단위에서 props 로 추가하도록 하시죠" (`reviews/round-18-owner-answers.md:11`)
- 상태: 현행
- 출처: `reviews/round-18-owner-answers.md:11`(정본, 12-1의 반영 칸. 표 행이라 조각 번호로 나눌 수 없다)
- 닫은 사람: 소유자 답(`reviews/round-18-owner-answers.md:11` 12-1)
- 라운드: 18
- 까닭: `reviews/round-18-owner-answers.md:11`

### WRITE-078 포커스 아웃 trim의 쓰기는 자동 쓰기(여섯째) — 억제 비트의 대상, 같으면 쓰지 않음

- 결정:
  > 자른 값의 쓰기는 core의 **자동 쓰기**다(R17-3 선택지 "다"의 원문 "자동 쓰기가 여섯이 됨"이 맞고, 17라운드 반영 칸의 "자동 쓰기가 아니다"는 편집자의 오독이었다). 따라서 자동 쓰기는 여섯이고 억제 비트(`DisableAutomaticWrites`)의 대상이며, 억제를 켠 폼에서는 포커스 아웃 때 자르지 않는다. 자른 값이 현재 값과 같으면 쓰지 않는다(소유자 확정).
- 보충:
  > 소유자(12-2 답): "자동 쓰기 아닙니까? 그리고 trim 전후 값이 같으면 쓰지 않아도 됩니다. 효율적이게." (`reviews/round-18-owner-answers.md:12`)
- 상태: 현행
- 출처: `reviews/round-18-owner-answers.md:12`(정본, 12-2의 반영 칸. 표 행이라 조각 번호로 나눌 수 없다), `reviews/round-17-owner-answers.md:11`
- 닫은 사람: 소유자 답(`reviews/round-18-owner-answers.md:12` 12-2), 소유자 답(`reviews/round-17-owner-answers.md:11` R17-3 "다")
- 라운드: 18
- 까닭: `reviews/round-18-owner-answers.md:12`
- 충돌:
  > `adr/0013-core-does-not-rewrite-values.md:49`의 "`options.trim`이 포커스 아웃 때 자른 값은 사용자 입력과 같은 쓰기(입력 출처)이며 core의 자동 쓰기가 아니다(17라운드 소유자 답 R17-3). 그래서 자동 쓰기는 다섯 그대로이고 억제 비트의 대상이 아니다"는 소유자 답과 다르다. 소유자 답이 이긴다(`reviews/round-18-owner-answers.md:12`).
  > `adr/0013-core-does-not-rewrite-values.md:89`의 "core의 자동 쓰기가 아니므로 P2 안이다"는 소유자 답과 다르다. 소유자 답이 이긴다(`reviews/round-18-owner-answers.md:12`).
  > `08-design-a-to-z.md:130`의 "자른 값은 사용자 입력과 같은 쓰기(입력 출처)이며 코어의 자동 쓰기가 아니다(자동 쓰기는 다섯 그대로, P2)"는 소유자 답과 다르다. 소유자 답이 이긴다(`reviews/round-18-owner-answers.md:12`).
  > `adr/0003-group-namespace.md:32`의 "자른 값은 사용자 입력과 같은 쓰기(입력 출처)이며 core의 자동 쓰기가 아니고"는 소유자 답과 다르다. 소유자 답이 이긴다(`reviews/round-18-owner-answers.md:12`).

### WRITE-079 비객체 V의 `Merge`는 그 자리를 통째로 바꾼다 — 부분 쓰기라 채움은 생긴 노드에만, 로드 아닌 쓰기의 `null`은 채움을 받지 않음

- 결정:
  > 【추론】 (나) `Merge`는 키로 합칠 수 있는 자리에서만 합친다.
  > 【추론】 그 자리의 값을 통째로 바꾸는 경우는 둘이다.
  > 【추론】 하나는 V나 V 안의 값이 평범한 객체가 아닌 때다(`null`, `undefined`, 원시 값, 배열, 객체 호스트에 온 배열).
  > 【추론】 다른 하나는 그 자리의 노드가 객체 호스트가 아닌 때다.
  > 【추론】 이는 이미 정한 배열 규칙('통째로 준 배열은 통째 교체')을 일반화한 것이다.
  > 【추론】 바뀐 자리의 자식 원본은 없음이 되고, 호스트는 받은 값을 든다(`undefined`면 없음).
  > 【추론】 이 쓰기는 부분 쓰기이며 로드가 아니다.
  > 【추론】 그래서 채움은 이 쓰기로 새로 생긴 노드에만 들어간다.
  > 【추론】 로드가 아닌 쓰기로 온 `null`·비객체 값도 그 자리의 자식 원본을 없음으로 만들지만 새 수명이 아니므로 채움을 받지 않는다(WRITE-014의 '빈 상태' 채움은 로드에만 해당).
  > 【추론】 호출자 오류로 던지지 않고 조용히 버리지도 않는다.
  > 【추론】 그래서 새 코드가 없다.
  > 【추론】 틀린 종류의 값이면 S1 규칙대로 경고등이 켜지고 `VALUE_TYPE_MISMATCH` 경고가 간다.
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-18-closing.md:463-474`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-16)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:502-510`

### WRITE-080 입력 `onChange`의 쓰기 종류 — 옵션 없으면 입력 쓰기(부분), `Overwrite`면 그 노드의 로드, `Merge`면 부분 쓰기

- 결정:
  > 【추론】 (다) 입력 구성 요소가 옵션 없이 `onChange(V)`를 부르면 '입력 쓰기'다.
  > 【추론】 그 노드의 값이 V가 된다.
  > 【추론】 잎과 터미널에서는 원본을 바꾼다.
  > 【추론】 자식이 있는 노드에서는 V에 없는 자식이 없음이 되고, 선언되지 않은 키는 `extras`로 간다.
  > 【추론】 트리 전체로 보면 그 노드 아래만 바뀌는 부분 쓰기이며 로드가 아니다.
  > 【추론】 그래서 새 수명이 없고, 지운 키를 다시 채우지 않으며, 채움은 생긴 노드에만 들어간다.
  > 【추론】 `derived`와 `injectTo`는 평소 에지 규칙을 따른다.
  > 【추론】 Refresh는 쓴 입력 자신에게 보내지 않는다(T-2).
  > 【추론】 이 쓰기로 원본이 바뀐 자손에게만 보낸다(ADR 0007 §3의 출처 규칙).
  > 【추론】 입력은 두 번째 인자로 공개 비트마스크를 넘길 수 있다(오늘도 넘긴다).
  > 【추론】 `Overwrite`를 주면 V가 무엇이든(`undefined` 포함, 18C-17) 그 노드의 로드가 된다.
  > 【추론】 그래서 자기 입력까지 Refresh를 받는다.
  > 【추론】 `Merge`를 주면 (나)의 부분 쓰기가 된다.
  > 【추론】 출처 규칙대로 자기 입력은 Refresh를 받지 않는다.
  > 【추론】 억제 비트는 그 쓰기가 일으킨 자동 쓰기에 적용된다.
  > 【추론】 `handleChange`의 바깥 오류 지움과 dirty 표시(REACT-011)는 옵션과 무관하게 그대로다.
- 보충: 없음
- 상태: 분할됨(→ WRITE-091, WRITE-090)
- 출처: `reviews/round-18-closing.md:475-489,493`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-16), 소유자 답(`reviews/round-18-owner-answers.md:26` 18C 검토 4번; 대체)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:502-510`

### WRITE-081 `Overwrite`는 V가 `undefined`여도 로드이며 채움을 받는다 — 채움 없이 빼는 길은 `Merge`·`DisableAutomaticWrites`·옵션 없는 입력 `onChange(undefined)`

- 결정:
  > 【추론】 규칙은 쓰기 종류마다 하나다.
  > 【추론】 쓰기의 종류는 호출자가 선언하고, core는 값으로 종류를 추론하지 않는다(D-4).
  > 【추론】 V가 `undefined`라는 것은 종류를 바꾸지 않는다.
  > 【추론】 `Overwrite`는 V가 무엇이든(`undefined` 포함) 그 노드 서브트리의 로드이며 채움을 받는다.
  > 【추론】 공개 `setValue`의 기본 옵션도 `Overwrite`이므로 `setValue(undefined)`가 여기에 든다.
  > 【추론】 노드와 자손의 원본이 없음이 된다.
  > 【추론】 로드는 새 수명이므로(WRITE-027), 형상의 노드 가운데 `controls.default`나 `default`를 가진 것은 채움을 받는다.
  > 【추론】 `setValue(null)`(D-1)과 같은 길이다.
  > 【추론】 다른 점은 하나다: 호스트가 `null`을 들지 않고 없음이다.
  > 【추론】 입력이 `onChange(undefined, SetValueOption.Overwrite)`를 부른 경우도 같다(18C-16 (다)).
  > 【추론】 가상 노드에서는 참조한 잎마다 `Overwrite`로 `undefined`를 쓰므로 잎마다 같은 규칙을 따른다(18C-21).
  > 【추론】 채움 없이 값을 빼는 길은 셋이다.
  > 【추론】 첫째, `DisableAutomaticWrites` 비트를 준다(D-7의 호출 단위 옵션).
  > 【추론】 둘째, `Merge`를 쓴다(18C-16 (나), 소유자 C-2).
  > 【추론】 셋째, 입력 구성 요소는 옵션 없이 `onChange(undefined)`를 부른다.
  > 【추론】 이는 입력 쓰기이므로(18C-16 (다)) 채움 없이 값을 뺀다.
  > 【추론】 소유자 C-11(REACT-005)을 지킨다.
  > 【추론】 `setValue`와 `SetValueOption.Overwrite`의 문서 주석에 적는다: "V가 `undefined`여도 로드이며, 기본값이 있는 자리는 다시 채워진다. 채움 없이 값을 빼려면 `Merge`나 `DisableAutomaticWrites`를 쓴다."
  > 【추론】 `FormTypeInputProps`의 `onChange`와 입력 작성 문서(18C-40 (2)의 입력 계약과 같은 자리)에 적는다: "값을 빼려면 옵션 없이 `onChange(undefined)`를 부른다. `Overwrite`를 넘기면 기본값이 다시 채워진다."
- 보충: 없음
- 상태: 대체됨(→ WRITE-090)
- 출처: `reviews/round-18-closing.md:516-534`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-17), 소유자 답(`reviews/round-18-owner-answers.md:26` 18C 검토 4번; 대체)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:542-548`

### WRITE-082 호스트 채움 값의 분배와 객체 호스트 '없음'의 정의(상태 둘에서 계산) — `{}`도 호스트 `default`를 막지 않음

- 결정:
  > 【추론】 호스트(객체, 배열)의 채움 값 D는 `controls.default` > `default` 순이다.
  > 【추론】 D는 그 호스트가 처음 채워지는 라운드의 유효 스키마에서 읽는다.
  > 【추론】 호스트가 생길 때 없음이면, D는 그 호스트에 대한 쓰기로 들어간다.
  > 【추론】 분배는 그 호스트에 대한 쓰기와 같다.
  > 【추론】 D의 키는 해당 자식의 원본이 된다(더 깊이 재귀).
  > 【추론】 선언되지 않은 키는 `extras`로 가고, D가 객체가 아니면 호스트가 그 값을 든다.
  > 【추론】 객체 호스트가 없음이라는 것은 호스트와 모든 자손의 `raw`·`extras`가 없음인 것이다(상태 둘에서 계산, P3).
  > 【추론】 그래서 로드한 V가 그 자리에 `{}`를 주어도 호스트는 D를 받는다.
  > 【추론】 채움은 부모부터 순회한다.
  > 【추론】 그래서 D가 준 키의 자손은 이미 없음이 아니어서 자기 `default`를 받지 않는다.
  > 【추론】 D에 없는 자손은 없음으로 남아, 자기 차례에 `controls.default` > `default`를 받는다.
  > 【추론】 채움은 자동 쓰기이므로 억제 비트의 대상이고, 원본 B의 자동 쓰기 기록에 든다.
  > 【추론】 D는 복사하거나 불변으로 다룬다(F24).
  > 【추론】 분배된 값은 잎마다 `interpret`를 지난다.
  > 【추론】 꺼진 조각의 자손에도 쓰기의 분배 규칙대로 들어가 잠복 원본이 된다(WRITE-018과 같은 분배).
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-18-closing.md:554-568`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-18)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:571-576`

### WRITE-083 포커스 아웃 `trim`은 자동 쓰기 — 원본만 쓰고, 바깥 오류와 dirty는 건드리지 않으며, 같은 값이면 쓰지 않음

- 결정:
  > 【추론】 포커스 아웃 때 자른 값을 쓰는 것은 자동 쓰기다.
  > 【추론】 다른 자동 쓰기(채움, `derived`, `injectTo`, `unsetValue`, 나감의 비움)처럼 원본만 쓴다.
  > 【추론】 바깥 오류를 지우지 않고 dirty를 표시하지 않는다(오늘 `trim`과 같다).
  > 【추론】 값 쓰기, 바깥 오류 지움, dirty 표시를 `batch` 하나로 묶자는 스웜의 권고(`reviews/round-18-agenda.md:45`)는 버린다.
  > 【추론】 그 세 가지 묶음은 사용자 입력의 `handleChange`에만 있는 것이다.
  > 【추론】 자른 값이 현재 값과 같으면 쓰지 않는다(12-2).
  > 【추론】 억제를 켠 폼에서는 자르지 않는다.
  > 【추론】 자동 쓰기이므로 그 노드의 입력은 Refresh를 받는다.
  > 【추론】 이미 포커스를 잃은 뒤라 치던 글자를 잃지 않는다.
  > 【추론】 `UpdateValue`의 출처 칸 값은 자동 쓰기(trim)다(12-5).
  > 【추론】 바깥 오류는 검증 결과 층이다.
  > 【추론】 그래서 ADR 0014의 층 구분은 바뀌지 않는다.
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-18-closing.md:582-593`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-19)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:599-603`

### WRITE-084 `interpret` 칸의 계약 — 순수, 던지지 않음, 모든 입력에 값, 멱등, 바꾸지 못하면 항등

- 결정:
  > 【추론】 `interpret` 칸의 계약은 순수, 던지지 않음, 모든 입력에 값을 돌려줌, 멱등, 바꾸지 못하면 항등이다.
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-18-closing.md:1131`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-40)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:1134-1141`

### WRITE-085 노드 되돌림의 출처는 루트의 로드 스냅숏 — 로드마다 `setIn`, `defaultValue`는 `getIn(snapshot, path)`, `resetSubtree()`는 상태 비움 뒤 로드, 배열 아이템은 구조 연산을 따라 자기 값

- 결정:
  > 【추론】 `resetSubtree()`와 게터 `defaultValue`를 남기고, 둘의 출처를 루트가 드는 로드 스냅숏으로 한다.
  > 【추론】 루트는 로드 스냅숏 하나를 든다.
  > 【추론】 경로 P에 값 V를 싣는 로드마다 `snapshot = setIn(snapshot, P, V)`로 고친다.
  > 【추론】 구조를 나눠 쓰므로 V와 스냅숏의 나머지는 복사하지 않고 P 위의 조상 칸만 새로 짓는다(로드 하나에 O(깊이)).
  > 【추론】 V는 바꾸지 않는 값으로 다룬다(WRITE-013, F24).
  > 【추론】 `node.defaultValue`는 `getIn(snapshot, node.path)`다.
  > 【추론】 로드가 그 경로에 닿기 전까지 같은 참조를 돌려준다.
  > 【추론】 `node.resetSubtree()`는 진입 하나에서 `clearSubtreeState()`를 한 뒤 `node.defaultValue`를 그 하위 트리에 로드한다.
  > 【추론】 로드이므로 빠진 키를 채우고(D-7, WRITE-017) 새 수명을 시작한다(SETTLE-027).
  > 【추론】 `FormHandle.reset()`은 커밋된 prop을 로드하고, 그 값이 스냅숏도 된다.
  > 【추론】 스냅숏은 core 자신의 로드 기록이며 prop 규칙을 core로 옮긴 것이 아니므로 WRITE-049는 그대로다.
  > 【추론】 배열 아이템은 자기 되돌림 값을 지킨다: 스냅숏은 위치가 아니라 신원을 따른다.
  > 【추론】 배열의 구조 연산은 그 경로의 스냅숏 배열도 고친다.
  > 【추론】 `remove(i)`·`pop`은 그 자리를 잘라 내고, `push(v)`·삽입은 새 아이템의 생성 값(`v`, 없으면 `undefined`라 되돌림이 채움을 받는다)을 넣는다.
  > 【추론】 이 비용은 스냅숏 배열에서 O(배열 길이)이며, 그 연산이 이미 하는 재색인과 같은 차수다.
  > 【추론】 구조 연산이 아닌 쓰기(`update(i, v)`, 입력 쓰기, `Merge`)는 스냅숏을 건드리지 않는다.
  > 【추론】 배열 통째 로드는 그 경로의 스냅숏을 바꾸며, 로드는 위의 규칙을 그대로 따른다.
- 보충:
  > 반영 칸(18C 검토 4번, 로드 스냅숏): "`setValue`는 로드가 아니므로 `defaultValue` 게터와 `resetSubtree()`의 로드 스냅숏을 바꾸지 않는다(배열의 구조 연산이 스냅숏을 고치는 18C-44의 규칙은 그대로다)." (`reviews/round-18-owner-answers.md:26`)
  > 편집자 결정(18C-97): "【추론】 아이템을 만들거나 없애는 모든 쓰기는 구조 연산처럼 그 경로의 스냅숏 배열의 자리를 맞춘다." (`reviews/round-18-closing.md:2779`)
  > 편집자 결정(18C-97): "【추론】 없어진 아이템의 자리는 잘라 내고, 새 아이템의 자리에는 `undefined`를 넣으며, 값은 싣지 않는다." (`reviews/round-18-closing.md:2780`)
  > 편집자 결정(18C-105): "【추론】 구조 연산(`push(v)`·삽입)은 WRITE-085대로 생성 값 `v`를 스냅숏 자리에 넣고, 아이템을 만드는 비구조 쓰기만 `undefined`를 넣는다." (`reviews/round-18-closing.md:2954`)
- 상태: 현행
- 출처: `reviews/round-18-closing.md:1220-1236`(정본), `reviews/round-18-closing.md:2779-2780,2883-2884`, `reviews/round-18-closing.md:2954`
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-44), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-97), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-103), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-105)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:1240-1247`, `reviews/round-18-closing.md:2784-2786`, `reviews/round-18-closing.md:2891-2893`
- 충돌:
  > `reviews/round-18-closing.md:1235`의 "구조 연산이 아닌 쓰기(`update(i, v)`, 입력 쓰기, `Merge`)는 스냅숏을 건드리지 않는다"는 18라운드 결정과 다르다: 아이템을 만들거나 없애는 모든 쓰기는 구조 연산처럼 그 경로의 스냅숏 배열의 자리를 맞추고 값은 싣지 않는다(WRITE-095). 18라운드 결정이 이긴다(`reviews/round-18-closing.md:2779-2780`).
  > `reviews/round-18-closing.md:1228`의 "로드이므로 빠진 키를 채우고(D-7, WRITE-017) 새 수명을 시작한다(SETTLE-027)"는 18라운드 결정과 다르다: 그 가리킴은 WRITE-090과 SETTLE-046이다(WRITE-097). 18라운드 결정이 이긴다(`reviews/round-18-closing.md:2883`).
  > `reviews/round-18-closing.md:1236`의 "배열 통째 로드는 그 경로의 스냅숏을 바꾸며"는 18라운드 결정과 다르다: "배열 통째 로드"는 로드(마운트·`FormHandle.reset()`·`resetSubtree()`)가 싣는 배열이며, 로드가 아닌 배열 통째 쓰기의 스냅숏은 WRITE-095가 정한다(WRITE-097). 18라운드 결정이 이긴다(`reviews/round-18-closing.md:2884`).

### WRITE-086 재생성 reset의 폐기는 참조를 끊지 않는다 — 폐기의 네 일, 옛 노드의 읽기와 쓰기, 트리를 붙잡는 비용의 문서화

- 결정:
  > 【추론】 재생성 reset이 옛 트리를 폐기해도 노드 사이의 부모·자식·루트 참조는 끊지 않는다.
  > 【추론】 폐기가 하는 일은 넷이다: 폐기 표시, 리스너·구독 해제, Refresh 번호와 상호작용 초기화 번호를 통지 없이 올리기, 폼 쪽이 옛 트리를 놓기(핸들 교체).
  > 【추론】 검증기 등록의 참조 수는 폐기가 내리지 않는다.
  > 【추론】 옛 트리의 효과 정리에서 내린다.
  > 【추론】 옛 노드를 읽으면(`value`·`outputValue`·`inactiveValues`·`parentNode`·`find` 등) 폐기 직전 마지막 커밋을 그대로 돌려준다.
  > 【추론】 옛 노드에 쓰면 `DISPOSED_NODE_WRITE`(가칭, 기존)로 던진다.
  > 【추론】 이 코드의 범위와 형상을 떠난 노드의 옛 참조는 18C-34가 정한다.
  > 【추론】 소비자가 옛 노드 하나를 들고 있으면 그 옛 트리 전체가 수거되지 않고 남는다.
  > 【추론】 이를 문서화하고, 수명을 이어 가려면 새 핸들에서 다시 찾으라고 안내한다.
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-18-closing.md:1730-1738`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-61)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:1740-1744`

### WRITE-087 잠복 원본 열거의 반환 모양 — 읽기 전용 `{ path, value }` 배열, 전순서, 얼린 빈 배열 공유, 커밋 단계 메모

- 결정:
  > 【추론】 `node.inactiveValues`(와 그것이 부르는 루트 노드의 함수)는 읽기 전용 배열 `ReadonlyArray<{ readonly path: string; readonly value: unknown }>`을 돌려준다.
  > 【추론】 항목은 그 노드 아래에서 형상에 없고 원본을 든 노드(잎·터미널, 그리고 잘못된 종류의 값을 든 노드)마다 하나다.
  > 【추론】 `path`는 절대 JSON Pointer(`node.path`와 같은 표기)다.
  > 【추론】 `value`는 그 노드가 든 원본이며 복사하지 않는다.
  > 【추론】 순서는 청사진의 전순서(문서 순서)다.
  > 【추론】 아래에 잠복 원본이 없으면 모든 노드가 공유하는 얼린 빈 배열 하나를 돌려준다.
  > 【추론】 배열과 항목 객체는 얼린다.
  > 【추론】 메모는 커밋 단계에서만 만든다.
  > 【추론】 잠복 집합이나 잠복 원본이 바뀐 노드의 조상 경로만 다시 만들고, 루트의 함수는 경로로 찾기만 한다.
  > 【추론】 바뀐 것이 없으면 이전 참조를 그대로 돌려준다.
  > 【추론】 그래서 "같은 값을 두 번 읽으면 같은 참조"가 성립한다.
  > 【추론】 같은 항목 객체를 조상들의 배열이 함께 쓴다(절대 경로라서 가능하다).
  > PR: PR-2 벤치.
  > 무엇: 커밋 때 조상 경로 메모를 갱신하는 비용을 잰다.
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-18-closing.md:2171-2182,2188-2189`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-81)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:2184-2186`

### WRITE-088 `push`는 로드가 아니라 구조 연산 — 만든 아이템은 생긴 노드로서 채움을 받고, `push(v)`면 없음인 자손에만 채움

- 결정:
  > ㄴ `push`는 로드가 아니다.
  > `push`는 구조 연산이다.
  > 만든 아이템은 생긴 노드로서 채움을 받는다(`controls.default` > `default` > 없음).
  > `push(v)`면 원본은 `v`이고, 없음인 자손에만 채움이 간다.
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-18-closing.md:1654-1657`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-59)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:1686-1690`

### WRITE-089 core는 타입별 빈 값을 만들지 않는다 — 채움의 원천은 `controls.default` > `default` > 없음, 오늘의 `getEmptyValue` 경로는 없음, 빈 호스트의 방출은 VALUE-034

- 결정:
  > 【추론】 core는 `default`가 없는 자리에 타입별 빈 값을 만들지 않는다.
  > 【추론】 채움의 원천은 `controls.default` > `default` > 없음뿐이다(VALUE-007, SCHEMA-002).
  > 【추론】 `Form`이 `defaultValue` 없이 서거나 `reset`될 때 루트에 로드하는 값은 없음이며, 빈 호스트와 루트가 무엇을 방출하는지는 18C-88이 정한다.
  > 【추론】 그래서 오늘의 `getEmptyValue` 경로는 새 설계에 없고, 빈 폼의 `FormHandle.getValue()`는 18C-88대로 오늘처럼 `{}`다.
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-18-closing.md:2283-2286`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-87)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:2290-2296`

### WRITE-090 채움은 노드가 생길 때만 — 로드는 마운트·`reset()`·`resetSubtree()`, `setValue(V)`는 전체 교체 쓰기(`setValue(undefined)`는 채움 없이 비우고 `setValue(getValue())`는 멱등)

- 결정:
  > 채움(`controls.default` > `default`)은 노드가 생길 때만 일어난다: 마운트, `FormHandle.reset()`, `resetSubtree()`, 분기가 켜짐, 배열 아이템이 생김.
  > 로드는 마운트, `FormHandle.reset()`(커밋된 prop), `resetSubtree()`(그 하위 트리)뿐이며, 로드는 새 수명이라 형상의 모든 노드를 생긴 노드로 치고 없음인 값이 채움을 받는다.
  > `setValue(V)`와 `Overwrite`를 준 입력 쓰기는 로드가 아니라 전체 교체 쓰기이며, 이미 형상에 있던 노드를 다시 채우지 않고 그 쓰기로 새로 생긴 노드만 채움을 받는다.
  > 그래서 `setValue(undefined)`는 채움 없이 비우고, `setValue(getValue())`는 멱등이다.
  > `Overwrite`를 준 입력 쓰기는 다른 입력 쓰기처럼 자기 입력에 Refresh를 보내지 않는다.
  > `setValue(null)` 뒤 자식이 다시 객체가 되어도 노드가 새로 생기지 않으면 채우지 않는다.
  > `setValue`는 로드가 아니므로 `defaultValue` 게터와 `resetSubtree()`의 로드 스냅숏을 바꾸지 않는다(배열의 구조 연산이 스냅숏을 고치는 18C-44의 규칙은 그대로다).
  > `DisableAutomaticWrites`는 그 쓰기로 새로 생긴 노드의 채움과 다른 자동 쓰기를 끈다.
  > `setValue(undefined)`와 입력의 `onChange(undefined, SetValueOption.Overwrite)`는 오늘처럼 채움 없이 비우므로 이주 행이 없다.
- 보충:
  > 소유자(18C 검토 4번): "잠깐. default 나 defaultValue 가 영향을 주는건 "최초 로드시" 와 "브랜치가 꺼졌다 켜졌을때 값이 없는 경우" 뿐 아닌가? 그러니까 정말 최초에만 영향을 주는거고, undefined 가 오면 명시적으로 해당 필드는 비워야 하지 않나?" (`reviews/round-18-owner-answers.md:26`)
  > 소유자(18C 검토 4번): "defaultValue의 동작을 생각하면 이 값으로 계속 되돌아가는건 너무 이상한 동작으로 보이는데?" (`reviews/round-18-owner-answers.md:26`)
  > 소유자(18C 검토 4번): "4번 B 안 확정." (`reviews/round-18-owner-answers.md:26`)
  > 편집자 결정(18C-96): "【추론】 WRITE-090의 멱등은 방출 값·채움·에지에 대한 것이다." (`reviews/round-18-closing.md:2763`)
  > 편집자 결정(18C-96): "【추론】 첫 `setValue(getValue())`는 잠복 원본과 투영으로 빠진 원본을 없음으로 만들며(VALUE-031), 둘째 호출부터는 바뀌는 것이 없다." (`reviews/round-18-closing.md:2764`)
  > 편집자 결정(18C-97): "【추론】 WRITE-090의 "`setValue`는 로드가 아니므로 `defaultValue` 게터와 `resetSubtree()`의 로드 스냅숏을 바꾸지 않는다"는 스냅숏의 값에 대한 말이다." (`reviews/round-18-closing.md:2781`)
  > 편집자 결정(18C-102): "【추론】 로드는 에지와 생김의 기준을 비운다." (`reviews/round-18-closing.md:2866`)
  > 편집자 결정(18C-102): "【추론】 로드가 아닌 쓰기(`setValue(V)` 포함)는 직전 커밋을 기준으로 한다." (`reviews/round-18-closing.md:2867`)
  > 편집자 결정(18C-103): "【추론】 `setValue(undefined)`는 이미 있던 노드를 다시 채우지 않고 비운다." (`reviews/round-18-closing.md:2888`)
  > 편집자 결정(18C-103): "【추론】 채움이 일어나는 사건에는 노드 게이트(`controls.active`)가 켜짐도 든다(SETTLE-005)." (`reviews/round-18-closing.md:2889`)
- 상태: 현행
- 출처: `reviews/round-18-owner-answers.md:26`(정본, 반영 칸), `reviews/round-18-closing.md:2763-2764,2781,2866-2867,2888-2889`
- 닫은 사람: 소유자 답(`reviews/round-18-owner-answers.md:26` 18C 검토 4번), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-96), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-97), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-102), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-103)
- 라운드: 18
- 까닭: `reviews/round-18-owner-answers.md:26`, `reviews/round-18-closing.md:2766-2768`, `reviews/round-18-closing.md:2784-2786`, `reviews/round-18-closing.md:2869-2870`, `reviews/round-18-closing.md:2891-2893`

### WRITE-091 입력 `onChange`의 쓰기 종류에서 그대로인 것 — 옵션 없으면 입력 쓰기(부분, 자기 입력에 Refresh 없음), 두 번째 인자로 비트마스크, `Merge`면 부분 쓰기, 억제 비트, `handleChange`의 부수 효과는 그대로

- 결정:
  > 【추론】 (다) 입력 구성 요소가 옵션 없이 `onChange(V)`를 부르면 '입력 쓰기'다.
  > 【추론】 그 노드의 값이 V가 된다.
  > 【추론】 잎과 터미널에서는 원본을 바꾼다.
  > 【추론】 자식이 있는 노드에서는 V에 없는 자식이 없음이 되고, 선언되지 않은 키는 `extras`로 간다.
  > 【추론】 트리 전체로 보면 그 노드 아래만 바뀌는 부분 쓰기이며 로드가 아니다.
  > 【추론】 그래서 새 수명이 없고, 지운 키를 다시 채우지 않으며, 채움은 생긴 노드에만 들어간다.
  > 【추론】 `derived`와 `injectTo`는 평소 에지 규칙을 따른다.
  > 【추론】 Refresh는 쓴 입력 자신에게 보내지 않는다(T-2).
  > 【추론】 이 쓰기로 원본이 바뀐 자손에게만 보낸다(ADR 0007 §3의 출처 규칙).
  > 【추론】 입력은 두 번째 인자로 공개 비트마스크를 넘길 수 있다(오늘도 넘긴다).
  > 【추론】 `Merge`를 주면 (나)의 부분 쓰기가 된다.
  > 【추론】 출처 규칙대로 자기 입력은 Refresh를 받지 않는다.
  > 【추론】 억제 비트는 그 쓰기가 일으킨 자동 쓰기에 적용된다.
  > 【추론】 `handleChange`의 바깥 오류 지움과 dirty 표시(REACT-011)는 옵션과 무관하게 그대로다.
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-18-closing.md:475-484,487-489,493`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-16)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:502-510`

### WRITE-092 null은 키 없는 전체 교체다(D-1) — 모든 자식의 원본이 없음, null 아래에 원본을 남기지 않음

- 결정:
  > **null은 키 없는 전체 교체다**(D-1). 키가 없으므로 모든 자식의 원본이 없음이 된다.
  > "null 아래에 원본을 남긴다"는 호출자가 "없다"고 쓴 것을 숨겨 두는 것이므로 P2에 어긋난다. 상태: 원리에서 도출(`07-conclusions.md` 4절, 확인만 남음).
- 보충:
  > "실수로 누른 `null`의 되돌리기는 입력 컴포넌트의 몫이다(D-1). 표준 예제로 남긴다." (`adr/0013-core-does-not-rewrite-values.md:107`)
  > 편집자 결정(18C-16): "【추론】 로드가 아닌 쓰기로 온 `null`·비객체 값도 그 자리의 자식 원본을 없음으로 만들지만 새 수명이 아니므로 채움을 받지 않는다(WRITE-014의 '빈 상태' 채움은 로드에만 해당)." (`reviews/round-18-closing.md:471`)
- 상태: 현행
- 출처: `adr/0013-core-does-not-rewrite-values.md:53`(정본, #1–#2·#4–#5. WRITE-014에서 분할), `adr/0013-core-does-not-rewrite-values.md:53#1-2`, `adr/0013-core-does-not-rewrite-values.md:53#4-5`, `adr/0013-core-does-not-rewrite-values.md:107`, `02-target-overview.md:286`, `08-design-a-to-z.md:294`, `adr/0006-single-value-ownership.md:76`(VALUE-036의 정본; E9·E18 삭제와 비객체 호스트 자식 규칙은 VALUE-036에만 있다), `reviews/round-18-closing.md:471`
- 닫은 사람: 원리(D-1 원리에서 도출, `adr/0013-core-does-not-rewrite-values.md:3`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-16)
- 라운드: 18
- 까닭: `adr/0013-core-does-not-rewrite-values.md:53`, `reviews/round-18-closing.md:502-510`

### WRITE-093 `union` 행의 해석 — 기본 spec과 유효 목록, `isMember`·`convert`·`interpret`(규칙 A: 순서 무관·멱등·무할당), 노드에 드는 모든 쓰기의 경계와 한 진입의 두 번 해석, `Merge`는 통째, `trim`은 `finishInput`, PR-2·PR-4 게이트

- 결정:
  > 【추론】 청사진은 union 칸마다 기본 spec `UnionSpec { kinds, mask, nullable }`을 한 번 만들어 얼리며, `kinds`는 그 칸의 `schemaType`과 같은 참조다.
  > 【추론】 유효 목록이 좁혀진 노드는 `{ kinds: 유효 목록, mask, nullable }`을 그 노드의 유효 스키마 메모 항목에 함께 둔다.
  > 【추론】 `interpret`는 노드의 현재 spec을 받으며, 좁히지 않은 노드의 현재 spec은 기본 spec 그 자체다.
  > 【추론】 노드의 유효 목록(`reviews/round-18-owner-answers.md:37`의 U4·U5)은 노드마다 계산하고, 유효 스키마 메모가 바뀔 때만 다시 계산한다.
  > 【추론】 좁히는 게이트가 없으면 유효 목록은 `schemaType`과 같은 얼린 참조를 공유하며, 이것이 흔한 경우이고 비용은 0이다.
  > 【추론】 교집합에 `'null'`만 남으면(노드가 nullable이고 게이트가 `{null}`만 허용) 유효 목록은 빈 목록이고, null이 아닌 모든 값에 경고등이 켜지며, 기본 입력은 빈 읽기 전용이다.
  > 【추론】 `isMember(value, kind)`는 JSON Schema의 뜻을 따른다.
  > 【추론】 `isMember(v, 'string')`은 `typeof v === 'string'`이다.
  > 【추론】 `isMember(v, 'number')`는 `typeof v === 'number' && Number.isFinite(v)`이다.
  > 【추론】 `isMember(v, 'integer')`는 `Number.isInteger(v)`이며 안전한 정수 범위는 보지 않는다(ajv와 같음).
  > 【추론】 `isMember(v, 'boolean')`은 `typeof v === 'boolean'`이다.
  > 【추론】 `isMember(v, 'object')`는 `typeof v === 'object' && v !== null && !Array.isArray(v)`이며 프로토타입은 보지 않는다.
  > 【추론】 `isMember(v, 'array')`는 `Array.isArray(v)`이다.
  > 【추론】 `null`은 목록이 아니라 `nullable`로만 보며, `v === null`이다.
  > 【추론】 `convert(value, kind)`는 WRITE-075를 옮긴 것이며, 이미 그 형인 값에는 부르지 않는다.
  > 【추론】 `convert(·, 'number')`는 앞뒤 공백을 뺀 전체가 JSON 수 표기이고 결과가 유한한 문자열을 `Number(t)`로 바꾸며, 소수부·지수부 없는 표기는 안전한 정수여야 하고, 불리언, `"01"`, `"1e400"`, `"9007199254740993"`은 받지 않는다.
  > 【추론】 `convert(·, 'integer')`는 `number` 변환이 되고 결과가 `Number.isSafeInteger`인 문자열을 바꾸며(`"1.0"`→`1`, `"1e2"`→`100`), 이미 수인 값(자르지 않음), `"1.5"`, `"1e16"`은 받지 않는다.
  > 【추론】 `convert(·, 'string')`은 유한한 수를 `String(n)`으로(`-0`→`"0"`), 불리언을 `"true"`·`"false"`로 바꾸며, `NaN`·`±Infinity`, `null`, 객체, 배열은 받지 않는다.
  > 【추론】 `convert(·, 'boolean')`은 정확히 `"true"`·`"false"`와 수 `1`→`true`, `0`·`-0`→`false`를 바꾸며, `" true"`, `"1"`, 그 밖의 수는 받지 않는다.
  > 【추론】 `convert(·, 'object')`와 `convert(·, 'array')`는 아무것도 받지 않는다(`reviews/round-18-owner-answers.md:29`).
  > 【추론】 `interpret(value, spec)`는 `undefined`이면 `undefined`, `null`이면 `null`(VALUE-033), 멤버이면 참조 그대로를 돌려준다.
  > 【추론】 그 밖에는 목록의 형마다 `convert`를 해서 성공한 결과를 `===`로 중복 없이 세고, 결과가 정확히 하나면 그 값을, 아니면 `value`를 돌려준다(`reviews/round-18-owner-answers.md:24`).
  > 【추론】 `interpret`는 순수하고, 던지지 않으며, 멱등이고, 바꾸지 못하면 항등이다(WRITE-084).
  > 【추론】 후보는 배열에 모으지 않고 개수와 첫 결과만 세며, 할당 없이 구현한다.
  > 【추론】 원소가 하나인 목록은 단일 노드의 행과 같다: `['integer','number']`는 number 규칙을 따른다.
  > 【추론】 `['integer','number','boolean']`의 `"2"`는 결과가 둘이지만 같은 값이므로 `2`다.
  > 【추론】 둘 이상의 형이 받아 주는 경우는 정확히 목록 ⊇ {string, boolean}, 목록 ∩ {number, integer} = ∅, 값 ∈ {0, -0, 1}일 때이며, `object`·`array`가 있고 없음에 따라 4종 × 값 3개로 12건이다.
  > 【추론】 그 증명: 문자열은 `number`·`integer`(같은 결과)와 `boolean`(`"true"`·`"false"`, 수 표기가 아님)이 받아 둘이 겹치지 않고, 불리언은 `string` 하나만 받으며, 비유한 수·`null`·객체·배열·그 밖의 값은 아무 형도 받지 않고, 유한한 수는 `string`(늘)과 `boolean`(`0`·`-0`·`1`)이 받는다.
  > 【추론】 전수 실행(`reviews/raw-round18-union-swarm/d-rule-a.mjs`, 목록 127개 × nullable 2 × 값 40종 × 모든 순열)에서 경우는 12건이고 순서 위반과 멱등 위반은 0이므로, 규칙 A는 선언 순서와 무관하다.
  > 【추론】 `interpret`는 노드에 드는 모든 쓰기의 경계에서 한 번 돈다(WRITE-056).
  > 【추론】 그 쓰기는 입력 쓰기(옵션 없음·`Merge`·`Overwrite`, WRITE-080), `setValue(V)`와 로드(마운트·`reset()`·`resetSubtree()`, WRITE-090), 조상 쓰기가 나눠 준 값(WRITE-018, WRITE-082), 채움(WRITE-090), `controls.derived`(WRITE-011), union 노드 자체를 대상으로 한 `controls.injectTo`(WRITE-012), `unsetValue`와 나감의 비움, 포커스 아웃 `trim`(WRITE-083)이다.
  > 【추론】 한 진입에서 쓰인 값의 두 번 해석(`reviews/round-18-owner-answers.md:37`의 U7)에서 첫째 해석의 목록은 직전 커밋의 유효 목록이고, 마운트·`reset()`이면 `schemaType`이다.
  > 【추론】 둘째 해석은 그 진입의 전이 단계에서 커밋 전에 하며, 목록이 바뀐 노드에서만 결과를 바꾼다(`interpret`가 멱등).
  > 【추론】 그래서 `setValue({kind:'num', a:'42'})`는 직전 상태와 상관없이 `a = 42`이다.
  > 【추론】 union 노드에 대한 `Merge` 쓰기는 늘 값 전체를 바꾼다: union은 객체 호스트가 아니다(WRITE-079).
  > 【추론】 union 값 안(`/slot/key`)을 가리키는 `controls.injectTo` 대상은 동적 대상 없음 `SCHEMA_FORM_ERROR.INJECT_TARGET_MISSING`이다(CONTROLS-079).
  > 【추론】 어긋난 값을 로드하면 바꾸지 않고 그대로 들고, 경고등을 켜며, 받은 그대로 방출한다(WRITE-054, VALUE-033).
  > 【추론】 `trim`은 union 행의 `finishInput`이 맡으며, 현재 값이 문자열이면 자르고 그 결과를 `interpret`에 넘기고, 문자열이 아니면 아무것도 하지 않으며, 경고는 없다(CONTROLS-006).
  > PR: PR-2(행·`interpret`·경고등·두 번 해석·방출)·PR-4(검증 에러의 귀속과 경고 코드 확정)
  > 무엇: `src/core/behaviors/utils/parse/__tests__/interpret.table.test.ts`·`interpret.properties.test.ts`, `src/core/behaviors/unionBehavior/__tests__/union.write-paths.test.ts`·`union.mismatch-light.test.ts`, 렌더 시나리오 `union.gated-effective-list`·`union.entry-two-step`·`union.rule-a`·`union.ambiguous`·`union.integer`·`union.object-array`·`union.non-json-value`·`union.omit-empty`·`union.default-fill`·`union.expressions`를 돌린다.
  > 통과: 변환 표의 모든 칸, 전수 실행의 12건·순서 무관·멱등·쓰기당 할당 0, 쓰기 경로마다의 사례, 경고등의 켜짐·재발송 규칙과 기록 칸이 위대로다.
  > 실패: 전수 실행에서 12건 밖의 경우나 순서 위반이 나오면 `convert` 표를 고치고, 규칙이 사례를 하나로 정하지 못하면 이 블록을 고친다.
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-18-closing.md:2482-2519,2566-2569`(정본), `reviews/round-18-closing.md:2908-2910,2914`
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-91), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-104)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:2556-2564`
- 충돌:
  > `reviews/round-18-closing.md:2513`의 "첫째 해석의 목록은 직전 커밋의 유효 목록이고, 마운트·`reset()`이면 `schemaType`이다"는 18C-104의 결정과 다르다: 쓰기 경계에서는 게이트와 무관한 정적 목록(`schemaType`, `nullable`)으로 해석하며, 로드(마운트, `FormHandle.reset()`, `resetSubtree()`)도 같다(WRITE-098). 18C-104의 결정이 이긴다(`reviews/round-18-closing.md:2908-2909,2914`).
  > `reviews/round-18-closing.md:2514`의 "목록이 바뀐 노드에서만 결과를 바꾼다(`interpret`가 멱등)"는 18C-104의 결정과 다르다: 전이 단계에서는 최종 유효 목록이 정적 목록보다 좁은 노드만, 첫째 해석의 결과가 아니라 원래 쓰인 값을 최종 유효 목록으로 다시 해석해 원본으로 삼는다(WRITE-098). 18C-104의 결정이 이긴다(`reviews/round-18-closing.md:2910`).

### WRITE-094 `setValue(V)`는 로드가 아니지만 V에 없는 경로의 원본(잠복 원본 포함)을 없음으로 만든다 — 잠복 원본이 지워지는 길 셋, 멱등은 방출 값·채움·에지에 대해

- 결정:
  > 【추론】 `setValue(V)`는 로드가 아니지만 전체 교체 쓰기로서 V에 없는 경로의 원본(잠복 원본 포함)을 없음으로 만든다(WRITE-019, WRITE-007).
  > 【추론】 잠복 원본이 지워지는 길은 나감 정책, 로드, V가 그 경로를 담지 않은 전체 교체 쓰기다.
  > 【추론】 WRITE-090의 멱등은 방출 값·채움·에지에 대한 것이다.
  > 【추론】 첫 `setValue(getValue())`는 잠복 원본과 투영으로 빠진 원본을 없음으로 만들며(VALUE-031), 둘째 호출부터는 바뀌는 것이 없다.
  > PR: PR-2(쓰기)
  > 무엇: `omitEmpty` 필드에 `''`가 있고 꺼진 분기에 원본이 있는 폼에서 `setValue(getValue())`를 두 번 부른다.
  > 통과: 첫 호출에서 두 원본이 없음이 되어 `inactiveValues`에서 빠지고 방출 값·채움·에지는 그대로이며, 둘째 호출은 원본을 바꾸지 않고 `UpdateValue`를 내지 않는다.
  > 실패: 결과가 다르면 이 블록이나 WRITE-090의 보충을 고친다.
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-18-closing.md:2761-2764,2770-2773`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-96)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:2766-2768`

### WRITE-095 아이템을 만들거나 없애는 모든 쓰기는 스냅숏 배열의 자리를 맞춘다 — 새 자리는 `undefined`, 값은 싣지 않음, O(배열 길이)

- 결정:
  > 【추론】 아이템을 만들거나 없애는 모든 쓰기는 구조 연산처럼 그 경로의 스냅숏 배열의 자리를 맞춘다.
  > 【추론】 없어진 아이템의 자리는 잘라 내고, 새 아이템의 자리에는 `undefined`를 넣으며, 값은 싣지 않는다.
  > 【추론】 WRITE-090의 "`setValue`는 로드가 아니므로 `defaultValue` 게터와 `resetSubtree()`의 로드 스냅숏을 바꾸지 않는다"는 스냅숏의 값에 대한 말이다.
  > 【추론】 비용은 구조 연산과 같은 O(배열 길이)다.
  > PR: PR-5(배열)
  > 무엇: 위 실패 장면과, 입력 쓰기·`Merge`로 아이템 수를 바꾼 뒤 각 아이템의 `defaultValue`와 `resetSubtree()`를 본다.
  > 통과: 남은 아이템은 자기 되돌림 값을 지키고, 새 아이템의 `defaultValue`는 `undefined`라 `resetSubtree()`가 채움을 준다.
  > 실패: 스냅숏 배열이 신원과 어긋나면 자리 맞춤을 고친다.
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-18-closing.md:2779-2782,2788-2791`(정본), `reviews/round-18-closing.md:2954`
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-97), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-105)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:2784-2786`
- 충돌:
  > `reviews/round-18-closing.md:2780`의 "새 아이템의 자리에는 `undefined`를 넣으며"는 18C-105의 결정과 다르다: 구조 연산(`push(v)`·삽입)은 WRITE-085대로 생성 값 `v`를 스냅숏 자리에 넣고, 아이템을 만드는 비구조 쓰기만 `undefined`를 넣는다(WRITE-099). 18C-105의 결정이 이긴다(`reviews/round-18-closing.md:2954`).

### WRITE-096 null 계약의 문구 — 로드가 아닌 쓰기로 온 `null` 아래 자식은 채움 없이 없음, 로드로 온 `null`은 채움, 쓰기 종류에 호출자 전체 교체

- 결정:
  > 【추론】 로드가 아닌 쓰기로 온 `null` 아래 자식은 채움 없이 없음이다(WRITE-090, WRITE-092).
  > 【추론】 로드로 온 `null` 아래 자식은 로드의 새 수명이라 채움을 받는다.
  > 【추론】 그래서 VALUE-036의 "빈 상태"는 로드로 온 `null` 아래에서는 채운 상태이고, 로드가 아닌 쓰기로 온 `null` 아래에서는 없음이다.
  > 【추론】 쓰기 종류의 목록(VALUE-032)과 `UpdateValue` 출처 칸의 값(EVENT-060)에 '호출자 전체 교체'(`setValue(V)`)를 더한다.
  > PR: PR-2(쓰기 종류)
  > 무엇: `name`에 `default`가 있는 폼에서 `setValue({ user: null })` 뒤와 `{ user: null }`을 로드한 `FormHandle.reset()` 뒤의 `name`의 원본과 방출, 그리고 `setValue(V)`가 낸 `UpdateValue`의 출처 칸을 본다.
  > 통과: `setValue` 뒤 `name`은 없음이고, 로드 뒤 `name`은 채움 값을 들되 방출에 나타나지 않으며, 출처 칸은 호출자 전체 교체다.
  > 실패: 이 블록을 고친다.
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-18-closing.md:2831-2834,2839-2842`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-100)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:2836-2837`

### WRITE-097 정리 — 억제 비트의 범위(로드·전체 교체 쓰기·`Merge`), 낡은 근거와 가리킴, LANDING-118, `setValue(undefined)`와 노드 게이트의 채움

- 결정:
  > 【추론】 억제 비트 `DisableAutomaticWrites`의 범위는 그 호출(로드와 전체 교체 쓰기, `Merge`)이 일으킨 예약 층의 쓰기 전부다.
  > 【추론】 WRITE-048의 "원장의 쓰기 표에서 둘은 같은 행이다"는 낡은 근거다: `setValue(V)`는 로드가 아니라 전체 교체 쓰기라 쓰기 표에서 reset과 다른 행이며, reset만의 예외를 두지 않는 근거는 모든 배열 통째 쓰기가 위치로 잇는다는 NODE-051이다.
  > 【추론】 WRITE-085의 "로드이므로 빠진 키를 채우고(D-7, WRITE-017) 새 수명을 시작한다(SETTLE-027)"의 가리킴은 WRITE-090과 SETTLE-046이다.
  > 【추론】 WRITE-085의 "배열 통째 로드"는 로드(마운트·`FormHandle.reset()`·`resetSubtree()`)가 싣는 배열이며, 로드가 아닌 배열 통째 쓰기의 스냅숏은 18C-97이 정한다.
  > 【추론】 FRAGMENT-054의 "(VALUE-015·WRITE-014)"의 가리킴은 VALUE-036과 WRITE-092다.
  > 【추론】 WRITE-010 보충에 남은 18C-17의 줄은 WRITE-090이 대체했으므로 지운다.
  > 【추론】 LANDING-118은 가리키던 WRITE-017이 대체되었으므로 `대체됨(→ WRITE-090)`이다.
  > 【추론】 `setValue(undefined)`는 이미 있던 노드를 다시 채우지 않고 비운다.
  > 【추론】 채움이 일어나는 사건에는 노드 게이트(`controls.active`)가 켜짐도 든다(SETTLE-005).
  > PR: PR-2(채움)
  > 무엇: 빠진 키에서 참이 되는 `if`와 `controls.active` 게이트를 가진 폼에서 루트 `setValue(undefined)`를 부른다.
  > 통과: 이미 있던 노드는 채우지 않고 비우며, 게이트가 뒤집혀 새로 생기거나 켜진 노드는 채움을 받는다.
  > 실패: 채움 사건의 목록을 고친다.
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-18-closing.md:2881-2889,2895-2898`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-103)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:2891-2893`

### WRITE-098 U7 정련 — 쓰기 경계는 정적 목록(`schemaType`, `nullable`)으로 한 번, 전이 단계는 최종 유효 목록이 좁은 노드만 원래 쓰인 값을 다시 해석, 로드도 같음, 유효 목록의 정의, PR-2 게이트

- 결정:
  > 【추론】 쓰기 경계에서는 그 노드의 정적 목록(`schemaType`, `nullable`)으로 한 번 해석한다.
  > 【추론】 이 목록은 게이트와 무관하므로 직전 상태에 기대지 않는다.
  > 【추론】 전이 단계에서는 이 진입에서 쓰인 노드마다, 최종 유효 목록이 정적 목록보다 좁으면 원래 쓰인 값(쓰기 경계에서 바뀐 값이 아니라 호출자·입력이 준 값)을 최종 유효 목록으로 다시 해석해 그 결과를 원본으로 삼는다.
  > 【추론】 그래서 결과는 "쓰인 값을 최종 유효 목록으로 한 번 해석한 것"과 같고, 직전 커밋의 게이트 상태에 기대지 않는다.
  > 【추론】 예: 본체 `a:{type:['string','boolean']}`에 `kind`가 `'text'`면 `a`를 `string`으로, `'flag'`면 `boolean`으로 좁히는 게이트가 있을 때, `setValue({kind:'flag', a:0})`는 직전 `kind`가 무엇이든 `a = false`다.
  > 【추론】 이 진입에서 쓰이지 않은 노드는 다시 해석하지 않는다(소급 변환 없음).
  > 【추론】 로드(마운트, `FormHandle.reset()`, `resetSubtree()`)도 같은 두 단계를 따른다.
  > 【추론】 비용: 쓰인 노드 가운데 유효 목록이 정적 목록보다 좁은 노드에 한해 `interpret` 한 번과 쓰인 값의 참조 보관이다.
  > 【추론】 18C-91의 "첫째 해석의 목록은 직전 커밋의 유효 목록"과 "둘째 해석은 … 목록이 바뀐 노드에서만 결과를 바꾼다(`interpret`가 멱등)"는 이 블록이 대체하며, 18C-91의 `setValue({kind:'num', a:'42'})` 예는 이 규칙에서도 `a = 42`다.
  > 【추론】 노드의 유효 목록은 `schemaType` ∩ (켜진 게이트 선언의 허용 집합)을 원소마다의 교집합(BLUEPRINT-044)으로 계산하고 `'null'`을 뗀 것이며, 이는 유효 스키마 `type`의 병합 결과와 같다(`reviews/round-18-owner-answers.md:37`의 U4·U5, BLUEPRINT-021).
  > 【추론】 이 정의는 모든 종류에 같으며, 원소가 하나인 목록은 단일 노드의 경우이고, number 노드에 게이트 `integer`가 켜지면 정수 규칙을 따른다.
  > PR: PR-2(두 번 해석)
  > 무엇: 렌더 시나리오 `union.entry-two-step`에 위 예의 폼을 더해, 직전 `kind`가 `'text'`일 때와 `'flag'`일 때 각각 `setValue({kind:'flag', a:0})`를 부르고, `defaultValue`가 `{kind:'flag', a:0}`인 마운트와, `kind`를 `'text'`로 바꾼 뒤 두 필드를 담은 객체 노드의 `resetSubtree()`를 돌린다.
  > 통과: 모든 경우에 `a === false`이고 경고등이 꺼져 있으며, 쓰이지 않은 형제 노드는 다시 해석되지 않는다.
  > 실패: 결과가 직전 상태에 따라 갈리면 두 단계의 목록과 다시 해석하는 값을 고친다.
- 보충:
  > 편집자 결정(18C-105): "【추론】 전이 단계의 재해석은 전이 쓰기다." (`reviews/round-18-closing.md:2938`)
  > 편집자 결정(18C-105): "【추론】 그 결과가 원본을 바꾸고 게이트를 뒤집으면 채움·비움과 같은 규칙으로 다음 라운드를 부르며, 라운드 상한(게이트 가진 조각 수 + 노드 게이트 수 + 1, SETTLE-005)은 그대로다." (`reviews/round-18-closing.md:2939`)
  > 편집자 결정(18C-105): "【추론】 한 노드는 한 라운드에 한 번만 다시 해석한다." (`reviews/round-18-closing.md:2940`)
  > 편집자 결정(18C-105): "【추론】 상한을 넘기면 SETTLE-011대로 원본 B를 커밋하고, 원본 B에는 쓰기 경계의 해석(정적 목록)만 남는다." (`reviews/round-18-closing.md:2942`)
  > 편집자 결정(18C-105): "【추론】 전이 단계의 재해석은 게이트 상태가 최종이 아니므로 원본 B에서 버린다." (`reviews/round-18-closing.md:2943`)
  > 편집자 결정(18C-105): "【추론】 원본 B에 남은 값이 좁혀진 유효 목록 밖이면 경고등이 켜진다." (`reviews/round-18-closing.md:2944`)
  > 편집자 결정(18C-105): "【추론】 비용: 라운드마다, 유효 목록이 바뀐 쓰인 노드에 한해 `interpret` 한 번이다." (`reviews/round-18-closing.md:2945`)
- 상태: 현행
- 출처: `reviews/round-18-closing.md:2908-2918,2925-2928`(정본), `reviews/round-18-closing.md:2938-2940,2942-2945`
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-104), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-105)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:2920-2923`

### WRITE-099 U7 정련 2 — 전이 단계의 재해석은 전이 쓰기(다음 라운드, 한 라운드에 한 번, 상한이면 원본 B에는 쓰기 경계의 해석만), `VALIDATOR_COMPILE_FAILED`는 폼 수준 기록, 정적 선언 없는 이름의 게이트 없는 분기끼리 fold가 다르면 청사진 오류, `node.type`은 여덟, `union` 입력이 보내는 값, 목록 밖 `default`는 노드가 생길 때마다, `push(v)`의 스냅숏은 생성 값, `NON_JSON_WHOLE_VALUE`는 개발 모드에서만, 좁혀지지 않은 유효 목록은 `schemaType` 그 값, PR-2·PR-4·PR-1 게이트

- 결정:
  > 【추론】 전이 단계의 재해석은 전이 쓰기다.
  > 【추론】 그 결과가 원본을 바꾸고 게이트를 뒤집으면 채움·비움과 같은 규칙으로 다음 라운드를 부르며, 라운드 상한(게이트 가진 조각 수 + 노드 게이트 수 + 1, SETTLE-005)은 그대로다.
  > 【추론】 한 노드는 한 라운드에 한 번만 다시 해석한다.
  > 【추론】 예: 본체 `a:{type:['string','boolean']}`에 `a`가 수이면 `boolean`으로, 아니면 `string`으로 좁히는 게이트가 있을 때, `setValue({a:0})`는 쓰기 경계에서 `0`(받아 줄 형이 둘이라 그대로)이고, 첫 라운드의 재해석에서 `false`가 되어 게이트가 `string`으로 뒤집히며, 다음 라운드의 재해석에서 `"0"`이 되고 게이트가 더 뒤집히지 않으므로 `a = "0"`이 커밋된다.
  > 【추론】 상한을 넘기면 SETTLE-011대로 원본 B를 커밋하고, 원본 B에는 쓰기 경계의 해석(정적 목록)만 남는다.
  > 【추론】 전이 단계의 재해석은 게이트 상태가 최종이 아니므로 원본 B에서 버린다.
  > 【추론】 원본 B에 남은 값이 좁혀진 유효 목록 밖이면 경고등이 켜진다.
  > 【추론】 비용: 라운드마다, 유효 목록이 바뀐 쓰인 노드에 한해 `interpret` 한 번이다.
  > 【추론】 `VALIDATOR_COMPILE_FAILED`는 폼 수준 기록이다.
  > 【추론】 그 기록은 폼 수준 로드(마운트, `FormHandle.reset()`)마다 한 번 낸다.
  > 【추론】 `resetSubtree()`는 그 기록을 다시 내지도 초기화하지도 않으며, 그 기록이 막은 `OnChange` 검증 예약은 다음 폼 수준 로드까지 막힌 채다.
  > 【추론】 그래서 18C-101의 "한 로드에 한 번"(VALIDATE-048)을 `resetSubtree()`의 하위 트리에 적용한다는 문장은 이 블록이 대체한다.
  > 【추론】 정적 선언이 없는 이름에서 게이트 없는 분기끼리 fold가 다르면 게이트 없는 선언끼리의 다른 종류이므로 `SHARED_NODE_KIND_CONFLICT` 청사진 오류다(BLUEPRINT-012, 소유자 O-10).
  > 【추론】 `node.type`의 값은 여덟(`virtual` 포함)이고, 18C-02의 "일곱"은 스키마에서 오는 종류만 센 것이다.
  > 【추론】 `union` 노드의 입력은 목록의 한 형의 값이나 없음을 보내며, 어떤 형을 보낼지는 입력 구현(UI 플러그인)이 정한다(`reviews/round-18-owner-answers.md:24`의 반영 칸 다섯째 문장, 목록을 읽는 자리는 BLUEPRINT-040).
  > 【추론】 목록 밖 `default`의 경고등·경고는 마운트만이 아니라 노드가 생길 때마다(WRITE-090의 채움 시점) 켜고 보낸다.
  > 【추론】 구조 연산(`push(v)`·삽입)은 WRITE-085대로 생성 값 `v`를 스냅숏 자리에 넣고, 아이템을 만드는 비구조 쓰기만 `undefined`를 넣는다.
  > 【추론】 `NON_JSON_WHOLE_VALUE`의 깊이 점검은 VALUE-037대로 개발 모드에서만 돌며, 핸들러가 있어도 프로덕션에서는 돌지 않는다.
  > 【추론】 좁혀지지 않은 노드의 유효 목록은 `schemaType` 그 값(스칼라면 스칼라, 배열이면 그 배열 참조)이며 "같은 참조"는 이것을 뜻한다.
  > 【추론】 그래서 E26(18C-90)에서 게이트가 켜진 동안의 유효 목록은 `schemaType`과 같은 `'number'`다.
  > PR: PR-2(전이 라운드)
  > 무엇: 렌더 시나리오 `union.entry-two-step`에 위 예의 폼과, `a`가 문자열이면 `boolean`으로 아니면 `string`으로 좁히는 폼(되먹임이 멈추지 않는 반례)을 더해 각각 `setValue({a:0})`를 부른다.
  > 통과: 첫 폼은 `a === "0"`이고 경고등이 꺼져 있으며, 둘째 폼은 전이 라운드 상한을 넘겨 원본 B로 `a === 0`을 커밋하고 경고등이 켜지며 `diagnostics.status`가 `'degraded'`다.
  > 실패: 재해석이 라운드를 부르는 규칙이나 원본 B에 남는 값을 고친다.
  > PR: PR-2(스냅숏·유효 목록)
  > 무엇: 배열에 `push('x')`와 삽입을 한 뒤 새 아이템의 `defaultValue`와 `resetSubtree()`를 보고, E26 폼에서 게이트를 켠 뒤 `a`의 유효 목록을 본다.
  > 통과: 새 아이템의 `defaultValue`는 생성 값이고 `resetSubtree()`가 그 값으로 되돌리며, E26의 유효 목록은 `node.schemaType`과 같은 `'number'`다.
  > 실패: 스냅숏 자리 맞춤이나 유효 목록의 표현을 고친다.
  > PR: PR-4(검증 불가 기록)
  > 무엇: 전체 스키마 컴파일이 실패하는 `OnChange` 폼을 마운트하고 값을 쓴 뒤, 자식의 `resetSubtree()`를 부르고 값을 쓰며, 이어 `FormHandle.reset()`을 부르고 값을 쓴다.
  > 통과: `VALIDATOR_COMPILE_FAILED`는 마운트 뒤와 `FormHandle.reset()` 뒤에 한 번씩 나고, `resetSubtree()` 뒤에는 다시 나지 않으며 그 뒤의 쓰기도 `OnChange` 검증을 예약하지 않는다.
  > 실패: 기록의 단위를 고친다.
  > PR: PR-1(청사진 판정)
  > 무엇: `union.kind-procedure.test.ts`에 정적 선언 없이 호스트의 게이트 없는 `oneOf` 분기 둘이 같은 이름을 `string`과 `number`로 적은 칸을 더하고, `virtual` 노드를 가진 코퍼스에서 `node.type`의 값을 모으며, `union.type-test.ts`에서 union props의 `onChange` 형을 본다.
  > 통과: 그 칸은 `SHARED_NODE_KIND_CONFLICT` 청사진 오류이고, 모은 값은 모두 여덟 값 가운데 하나이며, union props의 `onChange`는 목록의 형의 값과 없음만 받는다.
  > 실패: 절차나 종류 목록이나 props의 형을 고친다.
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-18-closing.md:2938-2957,2969-2984`(정본), `reviews/round-18-owner-answers.md:24`
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-105), 소유자 답(`reviews/round-18-owner-answers.md:24` 18C 검토 1번; 입력이 보내는 값)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:2959-2967`
