# 단일 원장 — 예약 층(`controls`·`options`·`presentation`)

기준 커밋: `ba398c330`(저장소 `packages/canard/schema-form/architecture`). 이 원장이 인용하는 `path:line`은 모두 이 커밋의 줄 번호다. 이 영역은 예약 층의 그룹 객체 셋, `controls`의 키와 부류와 단계, 조각 범위 제어와 식의 기준점, 상태 키는 그 노드에만이라는 규칙, 로컬 층 안의 결합, `controls.injectTo`, `controls` 식 언어를 다룬다. 정본 우선순위는 다음 순서다. (1) 소유자 답은 고정이다. (2) `adr/0003-group-namespace.md`(6차 본문, 15라운드, 일부 수락, 17라운드 소유자 답 반영)가 이 영역의 정본이다. (3) `03-mental-model.md`(원리 원장)는 `08-design-a-to-z.md`와 다르면 원장이 이긴다. (4) 뒤 라운드가 앞 라운드를 이긴다. (5) `06-conclusions.md`·`07-conclusions.md`는 그때의 기록이며 고치지 않는다. 거기 적힌 규칙이 뒤 문서에 없으면 항목이 되고, 뒤 문서가 바꿨으면 "대체됨"으로 남는다. 상태 값의 뜻: **현행**은 지금 유효한 규칙, **현행(부정 결정)**은 두지 않기로 정한 것, **대체됨**은 한때 유효했으나 뒤 라운드가 바꾼 규칙(옛 문장을 원문 그대로 남긴다), **열림**은 18라운드 안건으로 넘어갔거나 안건에 행 없이 남은 미결이다. 같은 대상 규칙의 순위(ADR 0003 §6 첫째)는 `SETTLE-004`, 로드 스위치(§6 둘째)는 `WRITE-008`·`WRITE-015`, 순환 금지 없음(§6 셋째)은 `SETTLE-016`, 검증기 앞 제거(§7)는 `VALIDATE-004`·`VALIDATE-005`가 정본 항목이다.

## 색인

| 번호 | 한 줄 요약 | 상태 | 닫은 사람 |
| --- | --- | --- | --- |
| CONTROLS-001 | 두 층 — JSON Schema 층과 예약 층 | 현행 | 소유자 답(`reviews/round-9-spec.md:24` 축6), 소유자 답(`reviews/round-9-spec.md:26` 축8), 소유자 답(`reviews/round-15-decisions.md:12` 4), 소유자 답(`reviews/round-17-owner-answers.md:12` 통보 1), 17라운드 스웜 수렴(편집자 결정, `adr/0003-group-namespace.md:30`; 인라인 `FormTypeInput`의 암묵 터미널) |
| CONTROLS-002 | 방향 — 폼 제어는 예약 층에 모으고 FE에 귀속, 검증에 개입하지 않음 | 현행 | 소유자 답(`00-goals.md:144` G2), 소유자 답(`reviews/round-15-decisions.md:13` 5) |
| CONTROLS-003 | 그룹을 가르는 기준 — 값·형상을 바꾸는가, 때에 따라 바뀌는가 | 현행 | 편집자 결정(15라운드, ADR 0003 6차 본문 `adr/0003-group-namespace.md:8`), 소유자 답(`reviews/round-15-decisions.md:12` 4) |
| CONTROLS-004 | `trim`은 `options`의 닫힌 목록에 둔다 | 현행 | 소유자 답(`reviews/round-15-decisions.md:12` 4), 소유자 답(`reviews/round-17-owner-answers.md:11` R17-3) |
| CONTROLS-005 | `trim`은 포커스 아웃 때 저장값을 자르고 입력마다 자르지 않는다 | 현행 | 소유자 답(`reviews/round-17-owner-answers.md:11` R17-3) |
| CONTROLS-006 | `trim`의 판단은 문자열 동작 행의 `finishInput` 칸, 어댑터는 신호만 | 현행 | 소유자 답(`reviews/round-17-owner-answers.md:11` R17-3), 소유자 답(`reviews/round-17-owner-answers.md:43` 9 입력 마침 칸), 소유자 답(`reviews/round-17-owner-answers.md:54` 9번 확인), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-91) |
| CONTROLS-007 | 자른 값은 입력 출처 쓰기이며 자동 쓰기가 아니고, 같으면 쓰지 않는다 | 대체됨(→ WRITE-078) | 소유자 답(`reviews/round-17-owner-answers.md:11` R17-3), 편집자 결정(17라운드, 현재 값과 같으면 쓰지 않는다 `adr/0013-core-does-not-rewrite-values.md:89`), 편집자 결정(18라운드, 소유자 물음으로 올림, `reviews/round-18-agenda.md:160`), 소유자 답(`reviews/round-18-owner-answers.md:12` 12-2; 대체) |
| CONTROLS-008 | `trim` 쓰기가 바깥 오류를 지우고 dirty를 표시하는지 — 18라운드 안건 | 대체됨(→ WRITE-083) | 편집자 결정(17라운드, 18라운드 안건으로 이관), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-19) |
| CONTROLS-009 | 그룹 표 — `controls`: 때에 따라 바꾸는 규칙과 정책, 정착 루프가 읽음 | 현행 | 소유자 답(`reviews/round-15-decisions.md:12` 4), 소유자 답(`reviews/round-15-decisions.md:14` 6) |
| CONTROLS-010 | 그룹 표 — `options`: 정적 설정, 청사진과 투영이 읽음 | 현행 | 소유자 답(`reviews/round-15-decisions.md:12` 4), 소유자 답(`reviews/round-17-owner-answers.md:11` R17-3) |
| CONTROLS-011 | 그룹 표 — `presentation`: 보이는 것, 렌더 계층만 읽음 | 현행 | 소유자 답(`reviews/round-15-decisions.md:15` 7), 소유자 답(`reviews/round-17-owner-answers.md:12` 통보 1), 편집자 결정(17라운드, ADR 0014 4판 채택; `PRESENTATION_KEY_SUSPECT`(가칭)) |
| CONTROLS-012 | 그룹 이름 — 명사, 항목의 지도는 복수·하나의 면은 단수 | 현행 | 소유자 답(`reviews/round-15-decisions.md:14` 6), 소유자 답(`reviews/round-15-decisions.md:15` 7) |
| CONTROLS-013 | 병합은 그룹 단위로 병합표를 적용한다 | 현행 | 소유자 답(`reviews/round-15-decisions.md:12` 4), 소유자 답(`reviews/round-12-owner-answers.md:24` §9 `&options`), 소유자 답(`reviews/round-10-owner-answers.md:27` E-18) |
| CONTROLS-014 | JSON Schema 층의 표현은 예약 층의 표현으로 대체할 수 있어야 한다 | 현행 | 소유자 답(`reviews/round-9-spec.md:25` 축7), 소유자 답(`reviews/round-15-decisions.md:13` 5) |
| CONTROLS-015 | `controls.active`로 방출에서 빠진 값의 판정은 작성자 책임, 폼은 고지 의무만 | 현행 | 소유자 답(`adr/0003-group-namespace.md:46` 소유자 인용, ADR 안의 기록), 소유자 답(`reviews/round-10-owner-answers.md:8` A-2) |
| CONTROLS-016 | 철자 하나 — 제어 키는 `controls` 안에만, 평면 `&` 축약·`computed` 별칭 없음 | 현행 | 소유자 답(`reviews/round-15-decisions.md:12` 4), 소유자 답(`reviews/round-15-decisions.md:13` 5), 소유자 답(`reviews/round-15-apply-spec.md:46` 숏컷 폐지), 소유자 답(`reviews/round-15-apply-spec.md:79` 숏컷 폐지), 소유자 답(`03-mental-model.md:37` 숏컷 폐지) |
| CONTROLS-017 | 표준 키워드와 `controls`의 키는 다른 층의 두 선언 | 현행 | 소유자 답(`reviews/round-9-spec.md:52` 읽기2 채우기 원천), 편집자 결정(15라운드, ADR 0003 6차 본문 `adr/0003-group-namespace.md:8`) |
| CONTROLS-018 | 형용사·동사 키와 `derived`의 문자열은 언제나 식, `default`는 값, 선언 부류는 식이 아님 | 현행 | 소유자 답(`reviews/round-15-decisions.md:10` 2), 편집자 결정(15라운드, ADR 0003 6차 본문 `adr/0003-group-namespace.md:8`) |
| CONTROLS-019 | `controls`의 네 부류와 형 | 현행 | 소유자 답(`reviews/round-15-decisions.md:10` 2), 소유자 답(`reviews/round-15-decisions.md:11` 3) |
| CONTROLS-020 | 단계는 ADR 0007 작업 루프의 이름 | 현행 | 편집자 결정(10라운드, ADR 0003 5차 본문 `adr/0003-group-namespace.md:10`) |
| CONTROLS-021 | 키 표 — `active`: 게이트, 노드 게이트와 조각 게이트는 한 장치 | 현행 | 소유자 답(`reviews/round-10-owner-answers.md:8` A-2), 소유자 답(`reviews/round-13-owner-answers.md:8` 2 나감 비움 기본값), 편집자 결정(10라운드, ADR 0003 5차 본문 `adr/0003-group-namespace.md:10`) |
| CONTROLS-022 | 키 표 — `visible`: 숨기기만, 방출은 그대로 | 현행 | 소유자 답(`reviews/round-9-spec.md:64` 예약 층의 뜻), 편집자 결정(10라운드, ADR 0003 5차 본문 `adr/0003-group-namespace.md:10`) |
| CONTROLS-023 | 키 표 — `readOnly`·`disabled`: 그 노드에만 거는 잠금 | 현행 | 소유자 답(`reviews/round-13-owner-answers.md:7` 1 잠금 규칙) |
| CONTROLS-024 | 키 표 — `unsetOnInactive`: 나감 정책, 네 층, 하위 트리로 내려감, 직전 커밋의 값 | 현행 | 소유자 답(`reviews/round-13-owner-answers.md:8` 2 나감 비움 기본값), 소유자 답(`reviews/round-13-owner-answers.md:17` 나감 정책 키 이름), 소유자 답(`reviews/round-17-owner-answers.md:10` R17-2), 소유자 답(`reviews/round-17-owner-answers.md:13` 통보 2), 편집자 결정(13라운드, 네 층과 같은 층의 유지 우선 `reviews/round-13-owner-review.md:66`) |
| CONTROLS-025 | 키 표 — `default`: 노드가 생길 때 없음이면 채우는 원천, 표준 `default`보다 앞 | 현행 | 소유자 답(`reviews/round-9-spec.md:52` 읽기2 채우기 원천), 소유자 답(`reviews/round-9-spec.md:56` 읽기2 시점(A/B)), 소유자 답(`reviews/round-10-owner-answers.md:7` A-1) |
| CONTROLS-026 | 키 표 — `derived`: 의존 값이 바뀌는 에지에서 자기 값을 덮음 | 현행 | 소유자 답(`reviews/round-12-owner-answers.md:19` §9 로드에서 `&derived`), 소유자 답(`reviews/round-12-owner-answers.md:20` §9 `undefined` 반환), 편집자 결정(9라운드 도출, `07-conclusions.md:276`) |
| CONTROLS-027 | 키 표 — `injectTo`: 자기 방출 값의 에지에서 다른 노드를 덮음, 로드에서 발화 | 현행 | 소유자 답(`reviews/round-15-decisions.md:11` 3), 편집자 결정(4라운드, 에지 발화 F11 `reviews/round-4-spec.md:144`) |
| CONTROLS-028 | 키 표 — `unsetValue`: 거짓→참 에지에서 없음으로, 로드는 로드된 값으로 평가, 둘째 발화원은 나감 | 현행 | 소유자 답(`reviews/round-10-owner-answers.md:29` E-21), 소유자 답(`reviews/round-10-owner-answers.md:39` E-21 되물음), 소유자 답(`reviews/round-12-owner-answers.md:13` 5 `&clearValue` 두 문장), 소유자 답(`reviews/round-13-owner-answers.md:8` 2 나감 비움 기본값), 편집자 결정(13라운드, 둘째 발화원은 나감 `reviews/round-13-owner-review.md:65`) |
| CONTROLS-029 | 키 표 — `resetInteraction`: 식이 참이 되면 `dirty`·`touched` 초기화 | 현행 | 소유자 답(`reviews/round-12-owner-answers.md:15` 7 "input을 초기화"), 소유자 답(`reviews/round-12-owner-answers.md:13` 5 `&clearValue` 두 문장), 소유자 답(`reviews/round-9-spec.md:68` pristine 정정), 소유자 답(`reviews/round-10-owner-answers.md:32` E-5) |
| CONTROLS-030 | 키 표 — `children`: 이름으로 가리킨 직계 자식에 거는 제어, 안쪽 `controls`는 닫힌 목록 | 현행 | 소유자 답(`reviews/round-9-spec.md:108` 자식 집합 제어), 소유자 답(`reviews/round-10-owner-answers.md:16` C-15), 소유자 답(`reviews/round-10-owner-answers.md:21` D-14), 소유자 답(`reviews/round-13-owner-answers.md:7` 1 잠금 규칙; children 그룹은 예외), 소유자 답(`reviews/round-15-decisions.md:14` 6) |
| CONTROLS-031 | 키 표 — `discriminator`: 판별 키 이름, 청사진의 변환과 끌어올림 | 현행 | 소유자 답(`reviews/round-10-owner-answers.md:11` B-22), 소유자 답(`reviews/round-12-owner-answers.md:9` 2 `&discriminator`), 소유자 답(`reviews/round-14-owner-answers.md:7` O-1) |
| CONTROLS-032 | 키 표 — `watch`: 의존 경로 선언, `watchValues` | 현행 | 편집자 결정(10라운드, ADR 0003 5차 본문 `adr/0003-group-namespace.md:10`), 17라운드 스웜 수렴(편집자 결정, `08-design-a-to-z.md:115`; 선언이 여럿일 때) |
| CONTROLS-033 | 값 조작 셋 1 — 없는 값 채우기는 채움 | 현행 | 소유자 답(`reviews/round-9-spec.md:48` 읽기2), 편집자 결정(10라운드, ADR 0003 5차 본문 `adr/0003-group-namespace.md:10`) |
| CONTROLS-034 | 값 조작 셋 2 — 있는 값 바꾸기는 `derived`(자기)와 `injectTo`(남) | 현행 | 소유자 답(`reviews/round-9-spec.md:48` 읽기2), 편집자 결정(10라운드, ADR 0003 5차 본문 `adr/0003-group-namespace.md:10`) |
| CONTROLS-035 | 값 조작 셋 3 — 있는 값 지우기는 `unsetValue`(원본)와 `active: false`(방출) | 현행 | 소유자 답(`reviews/round-9-spec.md:48` 읽기2), 편집자 결정(10라운드, ADR 0003 5차 본문 `adr/0003-group-namespace.md:10`) |
| CONTROLS-036 | 런타임에 "없음일 때만 채우는" 별도 키는 두지 않는다 | 현행(부정 결정) | 소유자 답(`reviews/round-10-owner-answers.md:15` C-11) |
| CONTROLS-037 | 없음으로 만드는 장치는 `unsetValue` 하나 | 현행 | 편집자 결정(13라운드, 소유자 검토 문서가 장치의 모양으로 제시 `reviews/round-13-owner-review.md:65`), 소유자 답(`reviews/round-12-owner-answers.md:10` 3 꺼질 때 값 정책) |
| CONTROLS-038 | `unsetValue`의 발화원 둘 — 식의 거짓→참과 정책이 참인 노드의 나감 | 현행 | 편집자 결정(13라운드, 소유자 검토 문서가 장치의 모양으로 제시 `reviews/round-13-owner-review.md:65`), 소유자 답(`reviews/round-12-owner-answers.md:10` 3 꺼질 때 값 정책) |
| CONTROLS-039 | 정책 키 `unsetOnInactive` — 이름, 형용사 형, Form 속성은 `boolean`만 | 현행 | 소유자 답(`reviews/round-13-owner-answers.md:17` 나감 정책 키 이름), 소유자 답(`reviews/round-15-decisions.md:10` 2), 소유자 답(`reviews/round-17-owner-answers.md:13` 통보 2) |
| CONTROLS-040 | 나감 정책의 층 — 세부가 포괄을 덮고 같은 층은 유지 우선 | 현행 | 편집자 결정(13라운드, 소유자 검토 문서가 장치의 모양으로 제시 `reviews/round-13-owner-review.md:66`), 편집자 결정(13라운드, 13라운드 답 2로 닫힘 `07-conclusions.md:238`) |
| CONTROLS-041 | 나감의 기본은 유지 | 현행 | 소유자 답(`reviews/round-13-owner-answers.md:8` 2 나감 비움 기본값) |
| CONTROLS-042 | 조각 범위 제어와 조각 게이트 | 현행 | 소유자 답(`reviews/round-9-spec.md:108` 자식 집합 제어), 소유자 답(`reviews/round-9-spec.md:32` 요약 발언), 편집자 결정(10라운드, ADR 0003 5차 본문 `adr/0003-group-namespace.md:10`) |
| CONTROLS-043 | 식의 기준점 — 선언한 노드(호스트), `.`·`..`는 폼의 확장 표기 | 현행 | 소유자 답(`reviews/round-15-decisions.md:9` 1), 소유자 답(`reviews/round-12-owner-answers.md:21` §9 조각 식의 경로 기준) |
| CONTROLS-044 | 조각 범위 제어와 `children`은 상속이 아니라 명시한 대상에 거는 제어 | 현행 | 소유자 답(`reviews/round-13-owner-answers.md:7` 1 잠금 규칙), 소유자 답(`reviews/round-9-spec.md:108` 자식 집합 제어) |
| CONTROLS-045 | 상태 키는 그 노드에만 — 코어에 글로벌 없음, 조상 상속 없음, 전체 잠금은 렌더 계층 | 현행 | 소유자 답(`reviews/round-13-owner-answers.md:7` 1 잠금 규칙), 소유자 답(`reviews/round-10-owner-answers.md:25` E-13), 소유자 답(`reviews/round-13-owner-answers.md:16` Form 속성의 자리), 소유자 답(`reviews/round-12-owner-answers.md:7` 1 Form 속성 `false`) |
| CONTROLS-046 | 로컬 층 안의 결합 — 잠금은 OR, 표시는 AND | 현행 | 편집자 결정(13라운드, 원장 §7 `03-mental-model.md:227`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-69; CONTROLS-082로 확정) |
| CONTROLS-047 | BE가 같은 스키마를 자기 검증기에 넣을 때 | 현행 | 편집자 결정(15라운드, ADR 0003 6차 본문 `adr/0003-group-namespace.md:8`) |
| CONTROLS-048 | 남는 것 — `controls` 식 시스템 전체, `computed`는 `controls`로 | 현행 | 소유자 답(`reviews/round-9-spec.md:24` 축6), 소유자 답(`00-goals.md:143` G2), 소유자 답(`reviews/round-15-decisions.md:13` 5) |
| CONTROLS-049 | 흡수되는 것 — `&if`·`computed.if`는 조각 범위의 `controls.active`로 | 현행 | 편집자 결정(10라운드, ADR 0003 5차 본문 `adr/0003-group-namespace.md:10`), 소유자 답(`reviews/round-15-decisions.md:9` 1) |
| CONTROLS-050 | 사라지는 것 — 평면 `&키` 축약, 판별식 자동 감지 | 현행 | 소유자 답(`reviews/round-15-decisions.md:13` 5), 소유자 답(`reviews/round-12-owner-answers.md:9` 2 `&discriminator`), 소유자 답(`reviews/round-10-owner-answers.md:9` A-3) |
| CONTROLS-051 | 이주 항목 — 예약 층의 키와 렌더 계층 이름 | 현행 | 소유자 답(`reviews/round-15-decisions.md:13` 5), 소유자 답(`reviews/round-15-decisions.md:21` 8), 소유자 답(`reviews/round-10-owner-answers.md:32` E-5), 소유자 답(`reviews/round-13-owner-answers.md:7` 1 잠금 규칙), 소유자 답(`reviews/round-17-owner-answers.md:11` R17-3) |
| CONTROLS-052 | 인라인 `FormTypeInput`의 암묵 터미널은 렌더 계층의 판정 함수로 | 현행 | 17라운드 스웜 수렴(편집자 결정, `adr/0003-group-namespace.md:147`), 소유자 답(`reviews/round-17-owner-answers.md:12` 통보 1), 소유자 답(`reviews/round-2.md:114` C3), 소유자 답(`00-goals.md:116` 터미널 전략) |
| CONTROLS-053 | 비활성 대상에도 `injectTo`가 쓴다(잠복 원본), 대상이 켜져도 재발화하지 않음(D-28) | 현행 | 편집자 결정(8라운드 D-28 편집자 판정, `06-conclusions.md:242`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-14) |
| CONTROLS-054 | 원천이 비활성이면 `injectTo`는 없음을 읽는다(D-34) | 현행 | 편집자 결정(8라운드 D-34 편집자 판정, `06-conclusions.md:256`) |
| CONTROLS-055 | 로드에서의 `injectTo` — `fire`(작성자가 위)를 고르고 `fill`·`skip`을 버림(D-27) | 분할됨(→ CONTROLS-084, WRITE-090) | 소유자 답(`reviews/round-10-owner-answers.md:19` D-6), 소유자 답(`reviews/round-18-owner-answers.md:26` 18C 검토 4번; 대체) |
| CONTROLS-056 | 대체됨: 글로벌 > 로컬, 루트 스키마 키는 정의되면 `false`여도 덮음(10라운드 답 12) | 대체됨(→ CONTROLS-045) | 소유자 답(`reviews/round-13-owner-answers.md:7` 1 잠금 규칙) |
| CONTROLS-057 | 대체됨: 결합식에 조상들과 Form 속성이 든다(9라운드 4.26) | 대체됨(→ CONTROLS-045, CONTROLS-046) | 소유자 답(`reviews/round-13-owner-answers.md:7` 1 잠금 규칙), 소유자 답(`reviews/round-10-owner-answers.md:25` E-13) |
| CONTROLS-058 | 대체됨: `&readOnly`와 `control.readOnly`는 한 선언의 두 철자이고 `control`이 이김 | 대체됨(→ CONTROLS-016) | 소유자 답(`reviews/round-15-decisions.md:13` 5) |
| CONTROLS-059 | 대체됨: `computed`와 `&`의 동시 제공을 선호(축 9항) | 대체됨(→ CONTROLS-016) | 소유자 답(`reviews/round-15-decisions.md:13` 5) |
| CONTROLS-060 | 대체됨: 글로벌 설정식과 로컬 설정식의 동시 제공과 경합(축 10항) | 대체됨(→ CONTROLS-045) | 소유자 답(`reviews/round-13-owner-answers.md:7` 1 잠금 규칙) |
| CONTROLS-061 | 대체됨: 제어용 필드에만 `&`를 붙이고 나머지는 접두 없는 닫힌 목록(13라운드 답 3, 14라운드 O-9) | 대체됨(→ CONTROLS-009, CONTROLS-010, CONTROLS-011, CONTROLS-016) | 소유자 답(`reviews/round-15-decisions.md:12` 4), 소유자 답(`reviews/round-15-decisions.md:13` 5) |
| CONTROLS-062 | 로컬 선언끼리의 결합에 대한 소유자 확인 | 대체됨(→ CONTROLS-082) | 편집자 결정(13라운드, 소유자 확인 대상으로 남김 `adr/0003-group-namespace.md:144`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-69) |
| CONTROLS-063 | `controls.children`의 대상별 식과 값 키의 세부, 조각에서만 선언된 자식을 가리킬 수 있는가 | 대체됨(→ CONTROLS-073) | 편집자 결정(17라운드, 18라운드 안건으로 이관), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-12) |
| CONTROLS-064 | 조각 객체에 값 키를 둘 때의 세부 | 대체됨(→ CONTROLS-077) | 편집자 결정(17라운드, 18라운드 안건으로 이관), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-60) |
| CONTROLS-065 | `virtualRequired`가 `required` 재작성과 함께 사라지는지 확인 | 대체됨(→ CONTROLS-078) | 편집자 결정(15라운드, ADR 0003 6차 본문 미결 `adr/0003-group-namespace.md:146`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-70) |
| CONTROLS-066 | 스키마를 직렬화할 수 없다는 점과 core→`PluginManager`의 React 모듈 import 분리 | 분할됨(→ CONTROLS-075, CONTROLS-076) | 편집자 결정(17라운드, 18라운드 안건으로 이관), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-55) |
| CONTROLS-067 | `controls.injectTo` 함수의 `ctx` 인자와 반환 모양 | 대체됨(→ CONTROLS-079) | 편집자 결정(17라운드, 18라운드 안건으로 이관), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-14), 소유자 답(`reviews/round-12-owner-answers.md:20` 12라운드 §9; 반환 `null`·`undefined`) |
| CONTROLS-068 | `controls` 식 언어의 명세 — 문법, 전역 이름, `@` 맥락, 경로가 읽는 값, 배열 색인 | 분할됨(→ CONTROLS-080, CONTROLS-079) | 편집자 결정(17라운드, 18라운드 안건으로 이관), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-13) |
| CONTROLS-069 | 대체됨: `&active`는 값을 빼는 유일한 작성자 명령(6라운드 대조표) | 대체됨(→ CONTROLS-021, CONTROLS-035) | 소유자 답(`reviews/round-9-spec.md:48` 읽기2), 편집자 결정(10라운드, ADR 0003 5차 본문 `adr/0003-group-namespace.md:10`) |
| CONTROLS-070 | 리프 노드의 잠금을 누가 집행하는가 — 오늘은 입력 컴포넌트 구현에 위임, 새 설계는 키의 유지만 적음 | 현행 | 편집자 결정(6라운드, 새 설계 칸은 4차 본문이 적은 것 `05-before-after.md:7`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-71) |
| CONTROLS-071 | `FormTypeInputProps.alias`의 처분 | 대체됨(→ CONTROLS-081) | 편집자 결정(6라운드, 미확인으로 남김 `05-before-after.md:9`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-72) |
| CONTROLS-072 | `placeholder` 키가 어느 그룹에 드는가 | 대체됨(→ CONTROLS-081) | 편집자 결정(6라운드, 미확인으로 남김 `05-before-after.md:9`), 편집자 결정(14라운드, O-9 닫힌 목록에서 뺌 `reviews/round-14-owner-review.md:55`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-72; `errorMessages` 절반은 CONTROLS-051) |
| CONTROLS-073 | `controls.children` 항목 — 대상 해석, 청사진 오류, 형상 밖 대상, 항목 게이트 자리, 대상별 식, 값 키의 층, 상태 키는 로컬 결합 | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-12) |
| CONTROLS-074 | 틀린 형의 값을 게이트와 식이 볼 때 — 폼은 값을 가르지 않고, 식이 던지면 식 실패 | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-40) |
| CONTROLS-075 | core는 `app/plugin`을 가져오지 않는다 — 검증기는 바인딩이 골라 인자로, PR-4 경계 린트는 새 fractal, PR-7에 `src/core/**` 전체 | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-55) |
| CONTROLS-076 | 인라인 구성 요소를 담은 스키마의 직렬화 장치는 두지 않는다 | 현행(부정 결정) | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-55) |
| CONTROLS-077 | 조각 `controls`의 허용 키는 `children` 항목 목록과 같다 — 값 키는 조각이 선언한 직계 자식마다 조각 층으로 | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-60) |
| CONTROLS-078 | `virtualRequired`는 새 설계에 없고 대체도 없다 — `options` 닫힌 목록 밖, 맨 키는 모르는 키로 검증기에 | 현행(부정 결정) | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-70) |
| CONTROLS-079 | `controls.injectTo`는 함수 `(value, ctx)` 하나 — 청사진이 정적으로 아는 대상 없음, `ctx` 여덟 칸, 반환 키는 원천 기준 경로, 항목은 전체 교체, `undefined` 항목과 `null`·`undefined` 반환은 쓰지 않음, 비활성 대상은 잠복 원본, 함수 안의 쓰기는 되먹임 | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-14) |
| CONTROLS-080 | `controls` 식 언어 명세 — 문법·컴파일, 전역 이름, 경로 토큰, `*` 없음, 경로는 방출 트리를 읽음, 형상 밖은 `undefined`, 배열 색인·길이, `@` 맥락 | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-13), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-91) |
| CONTROLS-081 | `alias`·`placeholder`는 그룹 키가 아니다 — `presentation.FormTypeInputProps` 안의 키로 입력 prop에 펼침, 맨 `placeholder`는 모르는 키로 검증기에, `errorMessages`는 `presentation` | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-72) |
| CONTROLS-082 | 로컬 선언끼리의 결합 확정 — 겹치는 자리 넷, 잠금은 OR·표시는 AND, 순서와 자리에 무관, 값을 쓰는 규칙은 층에서 세부가 이김, D-7과 어긋나지 않음 | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-69) |
| CONTROLS-083 | 잠금은 세 층이 나눠 맡는다 — core는 잠금 상태만 계산하고 쓰기를 거부하지 않음, 렌더 계층은 실효 잠금을 prop으로 넘기고 입력 쓰기를 버림, 잠긴 모양은 입력 구성 요소 | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-71) |
| CONTROLS-084 | 로드에서의 `injectTo` — `fire`(작성자가 위)를 고르고 `skip`을 버림, 원리가 말하는 것(D-27) | 현행 | 소유자 답(`reviews/round-10-owner-answers.md:19` D-6) |
| CONTROLS-085 | `union` 값과 식·게이트 — 어긋난 값도 거르거나 변환하지 않고 봄, 식의 경로는 객체의 자기 키와 배열의 색인으로만 내려감(원시 값 아래는 `undefined`) | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-91) |

항목 형식은 `ledger/README.md` §3을 따른다. **결정**은 정본 원문을 글자 그대로 옮기고, **보충**은 다른 출처가 더한 조건·예외·값을 원문 그대로 `path:line`과 함께 적는다. **출처**의 첫 위치가 정본이다. **충돌**은 다른 위치가 정본과 다르게 적었을 때만 둔다.

## 항목

### CONTROLS-001 두 층 — JSON Schema 층과 예약 층

- 결정:
  > | 층 | 무엇 | 하는 일 | 하지 않는 일 |
  > | --- | --- | --- | --- |
  > | JSON Schema 층 | 표준 키워드 전부. 맨 키는 모두 이 층의 것이다 | 검증기에 그대로 간다. 폼은 노드 트리의 모양을 정하는 문법(`type`, `properties`, `items`, `prefixItems`, `if/then/else`, `allOf` 항목, `oneOf`·`anyOf`의 분기)와 표준 `readOnly`만 읽는다(P1′, 원장 §1.4). 모르는 맨 키는 확장 키워드로 보아 검증기에 넘기고 폼은 읽지 않는다 | 값을 채우지도 바꾸지도 지우지도 않는다. 표준 `default`는 노드가 생길 때 채움의 원천으로만 읽히고, 표준 `readOnly`는 잠금으로 읽힌다 |
  > | 예약 층 | 폼 전용 키 전부. 그룹 객체 셋 안에만 있다. `controls`(값·형상을 때에 따라 바꾸는 규칙과 정책. 정착 루프가 읽는다), `options`(값·형상의 정적 설정. 청사진과 투영이 읽는다), `presentation`(보이는 것. 렌더 계층만 읽는다(청사진은 `presentation`을 읽지 않는다. 인라인 `FormTypeInput`의 암묵 터미널은 렌더 계층이 청사진에 넘기는 판정 함수가 정한다, 17라운드 스웜 수렴(편집자 결정))). `controls`·`options` 안의 모르는 키는 청사진 오류다. `presentation`의 모르는 키는 플러그인 자유 칸이다. | 값과 UI를 제어한다(축 6항(`controls`의 키는 값을 제어하는 층이다)). 게이트, 잠금과 숨김, 값의 출처, 에지에서의 동작, 자식 집합 제어, 명시 판별, 정적 형상, 표현 | 판정에 닿지 못한다(G2). 검증기는 예약 층의 키를 보지 않는다 |
- 보충:
  > "| JSON Schema 층 | 표준 키워드 전부 | 검증기에 그대로 간다. 폼은 형상(`type`, `properties`, `items`·`prefixItems`, `if/then/else`, `allOf`, `oneOf`·`anyOf`의 분기)과 표준 `readOnly`(잠금으로 읽는다)만 읽는다 | 값을 채우지도 바꾸지도 지우지도 않는다. 표준 `default`는 노드가 생길 때 채움의 원천으로만 읽힌다 |" (`03-mental-model.md:52`)
  > "| 예약 층 | 폼 전용 키 전부. 그룹 객체 셋 안에만 있다. `controls`(값·형상을 때에 따라 바꾸는 규칙과 정책: 게이트·잠금·숨김·값 규칙·자식 제어·판별·의존 선언. 정착 루프가 읽는다), `options`(값·형상의 정적 설정: `terminal`, `virtual`, `propertyKeys`, `omitEmpty`, `omitTrailing`, `trim`(포커스 아웃 때 문자열 동작 행의 `finishInput` 칸이 판단한다, 17라운드 소유자 답 R17-3). 청사진과 투영이 읽는다), `presentation`(보이는 것: `formType`, `FormTypeInput`, `FormTypeInputProps`, `FormTypeRendererProps`, `errorMessages`, 플러그인 자유 칸. 렌더 계층만 읽는다(청사진은 `presentation`을 읽지 않는다. 인라인 `FormTypeInput`의 암묵 터미널은 렌더 계층이 넘기는 판정이다, 17라운드 스웜 수렴(편집자 결정))). 맨 키는 모두 JSON Schema의 것이고 폼은 읽지 않는다. `controls`·`options` 안의 모르는 키는 청사진 오류다. `presentation`의 모르는 키는 플러그인 자유 칸이다. 평면 `&` 축약은 없다(15라운드, `reviews/round-15-decisions.md`. 13라운드 답 3의 경계와 14라운드 O-9의 닫힌 목록을 대체한다). 검증기에 넘기기 전에 키워드 위치의 그룹 객체 셋을 지운다(규칙 하나). 오늘 맨 키로 쓰는 `disabled`·`visible`·`active`는 `controls`로, `terminal`·`virtual`·`propertyKeys`는 `options`로, `formType`·`FormTypeInput`·`FormTypeInputProps`·`FormTypeRendererProps`·`errorMessages`와 플러그인의 `options` 자유 칸은 `presentation`으로 옮긴다(이주). `options.trim`은 `options`에 남는다(17라운드 소유자 답 R17-3). `options.virtual`은 그대로 두되 오늘의 `required` 재작성(가상 이름을 실제 자식 이름으로 펼침)은 버린다 | 값과 UI를 제어한다(축 6항(`controls`의 키는 값을 제어하는 층이다)). 게이트, 잠금과 숨김, 값의 출처, 에지에서의 동작, 자식 집합 제어, 명시 판별 | 판정에 닿지 못한다(G2). 검증기는 예약 층의 키를 보지 않는다 |" (`03-mental-model.md:53`)
- 상태: 현행
- 출처: `adr/0003-group-namespace.md:27-30`(정본), `03-mental-model.md:50-53`, `08-design-a-to-z.md:123`
- 닫은 사람: 소유자 답(`reviews/round-9-spec.md:24` 축6), 소유자 답(`reviews/round-9-spec.md:26` 축8), 소유자 답(`reviews/round-15-decisions.md:12` 4), 소유자 답(`reviews/round-17-owner-answers.md:12` 통보 1), 17라운드 스웜 수렴(편집자 결정, `adr/0003-group-namespace.md:30`; 인라인 `FormTypeInput`의 암묵 터미널)
- 라운드: 17
- 까닭: `adr/0003-group-namespace.md:32`, `adr/0003-group-namespace.md:46`
- 충돌:
  > `adr/0003-group-namespace.md:92`의 "청사진 — 상태와 작업 루프를 바꾸지 않는다"는 이 표의 `controls` 읽는 이(정착 루프)와 다르다. `discriminator`의 단계는 키마다 단계를 적은 키 표가 정한다(CONTROLS-031). 그룹의 읽는 이는 그룹을 가르는 기준이 아니다(`adr/0003-group-namespace.md:32`).
  > `adr/0003-group-namespace.md:93`의 "청사진과 표시"는 이 표의 `controls` 읽는 이(정착 루프)와 다르다. `watch`의 단계는 키마다 단계를 적은 키 표가 정한다(CONTROLS-032). 그룹의 읽는 이는 그룹을 가르는 기준이 아니다(`adr/0003-group-namespace.md:32`).

### CONTROLS-002 방향 — 폼 제어는 예약 층에 모으고 FE에 귀속, 검증에 개입하지 않음

- 결정:
  > 방향은 소유자가 발의했다 — "form의 표시 제어의 자유권은 모두 & 키워드로 모으고, 이들은 FE에 귀속, 유효성 검증에 개입하지 않도록 한다." 그 `&`는 15라운드에 그룹 객체로 바뀌었고 뜻은 같다.
- 보충: 없음
- 상태: 현행
- 출처: `adr/0003-group-namespace.md:3#4`(정본), `00-goals.md:144`
- 닫은 사람: 소유자 답(`00-goals.md:144` G2), 소유자 답(`reviews/round-15-decisions.md:13` 5)
- 라운드: 15
- 까닭: `00-goals.md:144`

### CONTROLS-003 그룹을 가르는 기준 — 값·형상을 바꾸는가, 때에 따라 바뀌는가

- 결정:
  > 값·형상을 바꾸는가 아니면 보이는 것만 바꾸는가, 그리고 때에 따라 바뀌는가 아니면 정적인가. "코어가 읽는가"는 구현의 경계라 기준이 아니다.
- 보충: 없음
- 상태: 현행
- 출처: `adr/0003-group-namespace.md:32#2`(정본)
- 닫은 사람: 편집자 결정(15라운드, ADR 0003 6차 본문 `adr/0003-group-namespace.md:8`), 소유자 답(`reviews/round-15-decisions.md:12` 4)
- 라운드: 15
- 까닭: `adr/0003-group-namespace.md:32`

### CONTROLS-004 `trim`은 `options`의 닫힌 목록에 둔다

- 결정:
  > `trim`은 15라운드 결정 4대로 `options`의 닫힌 목록에 둔다.
- 보충: 없음
- 상태: 현행
- 출처: `adr/0003-group-namespace.md:32#3`(정본), `08-design-a-to-z.md:130`, `adr/0003-group-namespace.md:37`
- 닫은 사람: 소유자 답(`reviews/round-15-decisions.md:12` 4), 소유자 답(`reviews/round-17-owner-answers.md:11` R17-3)
- 라운드: 17
- 까닭: `reviews/round-17-owner-answers.md:11`

### CONTROLS-005 `trim`은 포커스 아웃 때 저장값을 자르고 입력마다 자르지 않는다

- 결정:
  > 포커스 아웃 때 저장값을 자르며 입력마다 자르지 않는다(입력 중에 공백을 칠 수 있어야 한다).
- 보충:
  > "소유자가 든 까닭은 입력 중 공백을 칠 수 없게 되는 것이다("트림이 꺼져있을때 사용자가 띄어쓰기 입력을 못하거든 … 트림 기능은 데이터 제어 기능으로서 포커스 아웃이 될때 동작하도록 한거야")." (`08-design-a-to-z.md:130`)
- 상태: 현행
- 출처: `adr/0003-group-namespace.md:32#4`(정본), `08-design-a-to-z.md:130`, `adr/0003-group-namespace.md:139`
- 닫은 사람: 소유자 답(`reviews/round-17-owner-answers.md:11` R17-3)
- 라운드: 17
- 까닭: `reviews/round-17-owner-answers.md:11`

### CONTROLS-006 `trim`의 판단은 문자열 동작 행의 `finishInput` 칸, 어댑터는 신호만

- 결정:
  > 판단은 문자열 동작 행의 `finishInput` 칸에 두고, 어댑터는 타입을 모르는 입력 마침 신호(`finishInput`)만 보낸다.
- 보충:
  > "그래서 React 어댑터에 문자열 전용 논리가 들어가지 않는다." (`08-design-a-to-z.md:130`)
  > 편집자 결정(18C-91): "【추론】 `trim`은 union 행의 `finishInput`이 맡으며, 현재 값이 문자열이면 자르고 그 결과를 `interpret`에 넘기고, 문자열이 아니면 아무것도 하지 않으며, 경고는 없다(CONTROLS-006)." (`reviews/round-18-closing.md:2519`)
- 상태: 현행
- 출처: `adr/0003-group-namespace.md:32#5`(정본), `08-design-a-to-z.md:130`, `reviews/round-18-closing.md:2519`
- 닫은 사람: 소유자 답(`reviews/round-17-owner-answers.md:11` R17-3), 소유자 답(`reviews/round-17-owner-answers.md:43` 9 입력 마침 칸), 소유자 답(`reviews/round-17-owner-answers.md:54` 9번 확인), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-91)
- 라운드: 18
- 까닭: `reviews/round-17-owner-answers.md:11`, `reviews/round-18-closing.md:2556-2564`

### CONTROLS-007 자른 값은 입력 출처 쓰기이며 자동 쓰기가 아니고, 같으면 쓰지 않는다

- 결정:
  > 자른 값은 사용자 입력과 같은 쓰기(입력 출처)이며 core의 자동 쓰기가 아니고, 현재 값과 같으면 쓰지 않는다(17라운드 소유자 답 R17-3, ADR 0013).
- 보충:
  > "자른 값은 사용자 입력과 같은 쓰기(입력 출처)이며 코어의 자동 쓰기가 아니다(자동 쓰기는 다섯 그대로, P2)." (`08-design-a-to-z.md:130`)
  > 열린 부분(한 문장이라 나누지 않는다 — 자동 쓰기가 아니라는 분류): "포커스 아웃 `trim`이 자른 값의 쓰기가 자동 쓰기인가." (`reviews/round-18-agenda.md:160`)
  > 열린 부분(같은 문장 — 현재 값과 같으면 쓰지 않는다는 전제): "함께: "자른 값이 현재 값과 같으면 쓰지 않는다"(§3 :45의 전제, 편집자 결정)를 받는가" (`reviews/round-18-agenda.md:160`)
  > 소유자(12-2 답): "자동 쓰기 아닙니까? 그리고 trim 전후 값이 같으면 쓰지 않아도 됩니다. 효율적이게." (`reviews/round-18-owner-answers.md:12`)
- 상태: 대체됨(→ WRITE-078)
- 출처: `adr/0003-group-namespace.md:32#6`(정본), `08-design-a-to-z.md:130`, `reviews/round-18-agenda.md:45`, `adr/0013-core-does-not-rewrite-values.md:89`, `09-landing-and-test-strategy.md:49`, `08-design-a-to-z.md:476`, `reviews/round-18-owner-answers.md:12`
- 닫은 사람: 소유자 답(`reviews/round-17-owner-answers.md:11` R17-3), 편집자 결정(17라운드, 현재 값과 같으면 쓰지 않는다 `adr/0013-core-does-not-rewrite-values.md:89`), 편집자 결정(18라운드, 소유자 물음으로 올림, `reviews/round-18-agenda.md:160`), 소유자 답(`reviews/round-18-owner-answers.md:12` 12-2; 대체)
- 라운드: 18
- 까닭: `reviews/round-17-owner-answers.md:11`

### CONTROLS-008 `trim` 쓰기가 바깥 오류를 지우고 dirty를 표시하는지 — 18라운드 안건

- 결정:
  > 이 쓰기가 바깥 오류를 지우고 dirty를 표시하는지는 18라운드 안건이다.
- 보충: 없음
- 상태: 대체됨(→ WRITE-083)
- 출처: `adr/0003-group-namespace.md:32#7`(정본), `08-design-a-to-z.md:130`, `reviews/round-18-agenda.md:45`, `reviews/round-18-closing.md:582-597`
- 닫은 사람: 편집자 결정(17라운드, 18라운드 안건으로 이관), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-19)
- 라운드: 18
- 까닭: `reviews/round-18-agenda.md:45`, `reviews/round-18-closing.md:599-603`

### CONTROLS-009 그룹 표 — `controls`: 때에 따라 바꾸는 규칙과 정책, 정착 루프가 읽음

- 결정:
  > | 그룹 | 뜻 | 읽는 이 | 키 |
  > | --- | --- | --- | --- |
  > | `controls` | 값·형상을 **때에 따라** 바꾸는 규칙과 정책 | 정착 루프 | `active` `visible` `readOnly` `disabled` `default` `derived` `injectTo` `unsetValue` `resetInteraction` `unsetOnInactive` `children` `discriminator` `watch` |
- 보충: 없음
- 상태: 현행
- 출처: `adr/0003-group-namespace.md:34-36`(정본)
- 닫은 사람: 소유자 답(`reviews/round-15-decisions.md:12` 4), 소유자 답(`reviews/round-15-decisions.md:14` 6)
- 라운드: 15
- 까닭: `adr/0003-group-namespace.md:32`
- 충돌:
  > `adr/0003-group-namespace.md:92`의 "청사진 — 상태와 작업 루프를 바꾸지 않는다"는 이 행의 읽는 이(정착 루프)와 다르다. `discriminator`의 단계는 키마다 단계를 적은 키 표가 정한다(CONTROLS-031). 그룹 표의 읽는 이는 그룹을 가르는 기준이 아니다(`adr/0003-group-namespace.md:32`).
  > `adr/0003-group-namespace.md:93`의 "청사진과 표시"는 이 행의 읽는 이(정착 루프)와 다르다. `watch`의 단계는 키마다 단계를 적은 키 표가 정한다(CONTROLS-032). 그룹 표의 읽는 이는 그룹을 가르는 기준이 아니다(`adr/0003-group-namespace.md:32`).

### CONTROLS-010 그룹 표 — `options`: 정적 설정, 청사진과 투영이 읽음

- 결정:
  > | 그룹 | 뜻 | 읽는 이 | 키 |
  > | --- | --- | --- | --- |
  > | `options` | 값·형상의 **정적** 설정 | 청사진과 투영 | `terminal` `virtual` `propertyKeys` `omitEmpty` `omitTrailing` `trim`(포커스 아웃 때 문자열 동작 행이 자른다, 17라운드 소유자 답 R17-3) |
- 보충:
  > "| `options` | 값·형상의 정적 설정 | 청사진과 투영 | `terminal`, `virtual`, `propertyKeys`, `omitEmpty`, `omitTrailing`, `trim`(포커스 아웃 때 저장값을 자른다. 17라운드 소유자 답 R17-3, 아래 문단) |" (`08-design-a-to-z.md:127`)
- 상태: 현행
- 출처: `adr/0003-group-namespace.md:34,35,37`(정본), `08-design-a-to-z.md:127`
- 닫은 사람: 소유자 답(`reviews/round-15-decisions.md:12` 4), 소유자 답(`reviews/round-17-owner-answers.md:11` R17-3)
- 라운드: 17
- 까닭: `adr/0003-group-namespace.md:32`

### CONTROLS-011 그룹 표 — `presentation`: 보이는 것, 렌더 계층만 읽음

- 결정:
  > | 그룹 | 뜻 | 읽는 이 | 키 |
  > | --- | --- | --- | --- |
  > | `presentation` | 보이는 것 | 렌더 계층만(청사진은 `presentation`을 읽지 않는다. 인라인 `FormTypeInput`의 암묵 터미널은 렌더 계층의 판정 함수가 정한다) | `formType` `FormTypeInput` `FormTypeInputProps` `FormTypeRendererProps` `errorMessages`, 플러그인 자유 칸(`trim`은 `options`의 키다. `presentation`에 적은 `trim`은 `controls`·`options`의 키 이름이라 개발 모드 경고 `PRESENTATION_KEY_SUSPECT`(가칭)의 대상이다, ADR 0014 4판) |
- 보충:
  > "| `presentation` | 보이는 것 | 렌더 계층만(청사진은 `presentation`을 읽지 않는다. 인라인 `FormTypeInput`의 암묵 터미널은 렌더 계층이 넘기는 판정이다, 17라운드 스웜 수렴(편집자 결정), 소유자 통보 1 허용) | `formType`, `FormTypeInput`, `FormTypeInputProps`, `FormTypeRendererProps`, `errorMessages`, 플러그인 자유 칸 |" (`08-design-a-to-z.md:128`)
- 상태: 현행
- 출처: `adr/0003-group-namespace.md:34,35,38`(정본), `08-design-a-to-z.md:128`
- 닫은 사람: 소유자 답(`reviews/round-15-decisions.md:15` 7), 소유자 답(`reviews/round-17-owner-answers.md:12` 통보 1), 편집자 결정(17라운드, ADR 0014 4판 채택; `PRESENTATION_KEY_SUSPECT`(가칭))
- 라운드: 17
- 까닭: `adr/0003-group-namespace.md:32`

### CONTROLS-012 그룹 이름 — 명사, 항목의 지도는 복수·하나의 면은 단수

- 결정:
  > 그룹 이름은 명사이고 수는 뜻을 따른다. 셀 수 있는 항목의 지도는 복수(`controls`, `options`. JSON Schema가 `properties`·`$defs`처럼 이름 붙은 항목의 지도를 복수로 쓰는 관례와 같다), 하나의 면은 단수(`presentation`).
- 보충: 없음
- 상태: 현행
- 출처: `adr/0003-group-namespace.md:40`(정본), `08-design-a-to-z.md:130`
- 닫은 사람: 소유자 답(`reviews/round-15-decisions.md:14` 6), 소유자 답(`reviews/round-15-decisions.md:15` 7)
- 라운드: 15
- 까닭: `adr/0003-group-namespace.md:40`

### CONTROLS-013 병합은 그룹 단위로 병합표를 적용한다

- 결정:
  > 병합은 그룹 단위로 원장 §4의 병합표를 적용한다(ADR 0005 §5, 15라운드).
- 보충: 없음
- 상태: 현행
- 출처: `adr/0003-group-namespace.md:42`(정본)
- 닫은 사람: 소유자 답(`reviews/round-15-decisions.md:12` 4), 소유자 답(`reviews/round-12-owner-answers.md:24` §9 `&options`), 소유자 답(`reviews/round-10-owner-answers.md:27` E-18)
- 라운드: 15
- 까닭: `reviews/round-15-decisions.md:12`

### CONTROLS-014 JSON Schema 층의 표현은 예약 층의 표현으로 대체할 수 있어야 한다

- 결정:
  > JSON Schema 층의 표현은 예약 층의 표현으로 대체할 수 있어야 한다(축 7항(JSON Schema 표현은 `controls` 표현으로 대체할 수 있어야 한다)). `if/then/else`의 조각은 조각 객체의 `controls.active`로, 표준 `default`는 `controls.default`로, 표준 `readOnly`는 `controls.readOnly`로, `oneOf`·`anyOf` 분기의 `const`·`enum`은 `controls.discriminator`로 옮길 수 있다.
- 보충: 없음
- 상태: 현행
- 출처: `adr/0003-group-namespace.md:44`(정본), `02-target-overview.md:57`(SCHEMA-019의 정본 위치)
- 닫은 사람: 소유자 답(`reviews/round-9-spec.md:25` 축7), 소유자 답(`reviews/round-15-decisions.md:13` 5)
- 라운드: 15
- 까닭: `reviews/round-9-spec.md:25`

### CONTROLS-015 `controls.active`로 방출에서 빠진 값의 판정은 작성자 책임, 폼은 고지 의무만

- 결정:
  > `controls.active`가 거짓이어서 값이 방출에서 빠진 결과를 검증기가 어떻게 판정하는지는 스키마 작성자의 책임이다 — 소유자: "active를 쓰면 값이 제거되는데, 그건 사용자 책임으로 생각한다. 어쨌거나 유효성 검증에 직접 개입하는 건 아니니." 잘못된 스키마에 대해 폼은 개발 모드에서 고지할 의무만 진다(소유자 답 A-2).
- 보충:
  > 반영 칸(12-10, 컨벤션을 어긴 양의 순환 스키마): "TEST-061은 현행(부정 결정)이 되고, A-2의 고지 의무는 이 경우에 적용하지 않는다(답 19가 이긴다)." (`reviews/round-18-owner-answers.md:20`)
- 상태: 현행
- 출처: `adr/0003-group-namespace.md:46`(정본), `reviews/round-18-owner-answers.md:20`
- 닫은 사람: 소유자 답(`adr/0003-group-namespace.md:46` 소유자 인용, ADR 안의 기록), 소유자 답(`reviews/round-10-owner-answers.md:8` A-2)
- 라운드: 10
- 까닭: `reviews/round-10-owner-answers.md:8`

### CONTROLS-016 철자 하나 — 제어 키는 `controls` 안에만, 평면 `&` 축약·`computed` 별칭 없음

- 결정:
  > - 제어 키는 `controls` 안에만 적는다. 평면 `&키` 축약과 `computed` 별칭은 없다(15라운드). 그룹이 "이 키는 폼의 것"이라는 표시를 하므로 `&`가 하던 둘째 일은 사라졌고, 남은 평평한 철자 하나를 위해 우선순위 규칙·이중 타입·이중 문서를 치르는 것은 G4(하나의 개념에 하나의 장치)에 걸린다. 서버 스키마에 넘길 때는 그룹 셋을 지우면 끝이고, 서버 스키마와 클라이언트 스키마를 합칠 때는 그룹 셋만 덧붙이면 된다.
- 보충:
  > 편집자 결정(216C-03): "【추론】 형은 런타임이 받는 것만 광고해야 하고, 런타임이 옛 키를 조용히 무시하는 것은 원장이 정한 "맨 키는 검증기로"의 결과이므로 형 삭제와 별개의 제품 질문이다." (`reviews/round-216-closing.md:42`)
- 상태: 현행
- 출처: `adr/0003-group-namespace.md:50`(정본), `08-design-a-to-z.md:93`, `08-design-a-to-z.md:338`, `03-mental-model.md:53`, `02-target-overview.md:319#3`(SURFACE-021의 정본 위치), `02-target-overview.md:319#4`(SURFACE-022의 정본 위치)
- 닫은 사람: 소유자 답(`reviews/round-15-decisions.md:12` 4), 소유자 답(`reviews/round-15-decisions.md:13` 5), 소유자 답(`reviews/round-15-apply-spec.md:46` 숏컷 폐지), 소유자 답(`reviews/round-15-apply-spec.md:79` 숏컷 폐지), 소유자 답(`03-mental-model.md:37` 숏컷 폐지)
- 라운드: 15
- 까닭: `adr/0003-group-namespace.md:50`

### CONTROLS-017 표준 키워드와 `controls`의 키는 다른 층의 두 선언

- 결정:
  > - 표준 키워드와 `controls`의 키는 다른 층의 두 선언이다. `controls.readOnly`는 표준 `readOnly`의 표현식 판이고, `controls.default`는 표준 `default`보다 앞서는 채움의 원천(값)이다. 그룹 아래라 이름이 같아도 구별된다.
- 보충: 없음
- 상태: 현행
- 출처: `adr/0003-group-namespace.md:51`(정본), `02-target-overview.md:56#4`(SCHEMA-019의 출처 위치)
- 닫은 사람: 소유자 답(`reviews/round-9-spec.md:52` 읽기2 채우기 원천), 편집자 결정(15라운드, ADR 0003 6차 본문 `adr/0003-group-namespace.md:8`)
- 라운드: 15
- 까닭: `adr/0003-group-namespace.md:51`

### CONTROLS-018 형용사·동사 키와 `derived`의 문자열은 언제나 식, `default`는 값, 선언 부류는 식이 아님

- 결정:
  > - 형용사·동사 키와 `controls.derived`의 문자열 값은 언제나 식이다. 문자열 상수는 `"'KRW'"`처럼 따옴표 안에 적는다. `controls.default`는 값이고, 선언 부류의 문자열은 식이 아니다(`discriminator`는 키 이름, `watch`는 경로)(§3).
- 보충: 없음
- 상태: 현행
- 출처: `adr/0003-group-namespace.md:52`(정본)
- 닫은 사람: 소유자 답(`reviews/round-15-decisions.md:10` 2), 편집자 결정(15라운드, ADR 0003 6차 본문 `adr/0003-group-namespace.md:8`)
- 라운드: 15
- 까닭: `adr/0003-group-namespace.md:52`

### CONTROLS-019 `controls`의 네 부류와 형

- 결정:
  > 부류가 형과 동작을 예측하게 한다. 형용사는 참인 동안 유지되는 상태, 명사는 값의 출처, 동사는 참이 되는 순간의 동작, 선언은 구조다.
  > | 부류 | 형 | 키 |
  > | --- | --- | --- |
  > | 형용사 | `boolean` 또는 식→`boolean`. 참인 동안 | `active` `visible` `readOnly` `disabled` `unsetOnInactive` |
  > | 명사 | 값의 출처 | `default`(값), `derived`(식→값), `injectTo`(함수→`{ 경로: 값 }`. 남에게 주는 값의 출처) |
  > | 동사 | `boolean` 또는 식→`boolean`. 참이 되는 순간 | `unsetValue` `resetInteraction` |
  > | 선언 | 구조 | `children`(배열), `discriminator`(문자열), `watch`(문자열 배열) |
- 보충: 없음
- 상태: 현행
- 출처: `adr/0003-group-namespace.md:69,71-76`(정본), `08-design-a-to-z.md:93`, `08-design-a-to-z.md:95-100`
- 닫은 사람: 소유자 답(`reviews/round-15-decisions.md:10` 2), 소유자 답(`reviews/round-15-decisions.md:11` 3)
- 라운드: 15
- 까닭: `reviews/round-15-decisions.md:10`

### CONTROLS-020 단계는 ADR 0007 작업 루프의 이름

- 결정:
  > 단계는 ADR 0007의 작업 루프(표시 → 계산 → 파생 → 전이 → 커밋 → 통지 → 검증)의 이름이다.
- 보충: 없음
- 상태: 현행
- 출처: `adr/0003-group-namespace.md:78`(정본)
- 닫은 사람: 편집자 결정(10라운드, ADR 0003 5차 본문 `adr/0003-group-namespace.md:10`)
- 라운드: 10
- 까닭: `adr/0003-group-namespace.md:78`

### CONTROLS-021 키 표 — `active`: 게이트, 노드 게이트와 조각 게이트는 한 장치

- 결정:
  > | 키 | 뜻 | 단계 | 부류 |
  > | --- | --- | --- | --- |
  > | `active` | 게이트. 거짓이면 그 노드는 형상에 없다 — 숨겨지고 방출에서 빠진다. 원본은 기본으로 남아 `getInactiveValues`로 읽는다. 나감 정책 키를 켜면 나갈 때 한 번 비운다(원장 §3). 노드 스키마에 쓰면 노드 게이트, 조각 객체에 쓰면 조각 게이트이며, 두 범위는 한 장치다. 거짓에서 참이 되면 노드가 생기므로 그때 없음이면 채운다 | 계산 — 호스트 바퀴 안에서 `if` 가드와 같이 평가 | 형용사 |
- 보충:
  > "| `active` | 형용사 | 노드 스키마(노드 게이트), 조각 객체(조각 게이트) | 계산(호스트 바퀴) | 거짓이면 형상에서 뺀다. 원본은 기본으로 남고 방출에서 빠진다 | 거짓인 노드는 생기지 않는다 | 거짓→참에 노드가 생겨 채움을 받는다 |" (`08-design-a-to-z.md:104`)
  > 편집자 결정(26C-08): "【추론】 `active` 게터는 그 노드가 형상에 있는가(선언한 조각이 켜져 있고 노드 자신의 `controls.active`가 거짓이 아님, VALUE-006)를 읽는 멤버이므로, 살아 있는(형상 안) 노드에서는 늘 참이다." (`reviews/round-26-closing.md:87`)
  > 편집자 결정(26C-08): "【추론】 형상에 남으면서 `active`가 거짓인 노드는 없다." (`reviews/round-26-closing.md:90`)
- 상태: 현행
- 출처: `adr/0003-group-namespace.md:80,81,82`(정본), `08-design-a-to-z.md:104`, `07-conclusions.md:122`
- 닫은 사람: 소유자 답(`reviews/round-10-owner-answers.md:8` A-2), 소유자 답(`reviews/round-13-owner-answers.md:8` 2 나감 비움 기본값), 편집자 결정(10라운드, ADR 0003 5차 본문 `adr/0003-group-namespace.md:10`)
- 라운드: 13
- 까닭: `07-conclusions.md:122`
- 충돌:
  > `adr/0003-group-namespace.md:82`의 "원본은 기본으로 남아 `getInactiveValues`로 읽는다."는 잠복 원본 열거를 `getInactiveValues`라는 읽기로 적는다. 소유자 답과 다르다. 소유자 답이 이긴다(`reviews/round-18-owner-answers.md:22`, VALUE-029: 잠복 원본 열거는 루트 노드의 함수이고 노드마다 getter `inactiveValues`).

### CONTROLS-022 키 표 — `visible`: 숨기기만, 방출은 그대로

- 결정:
  > | 키 | 뜻 | 단계 | 부류 |
  > | --- | --- | --- | --- |
  > | `visible` | 거짓이면 숨기기만 한다. 방출은 그대로다. 전환은 노드 생성이 아니다 | 계산의 끝 | 형용사 |
- 보충:
  > "| `visible` | 형용사 | 노드 | 계산의 끝 | 표시만 가린다. 형상·값·방출을 바꾸지 않는다 | — | 전환은 생성이 아니다 |" (`08-design-a-to-z.md:105`)
  > 편집자 결정(28C-02): "【추론】 계산 게터 `enabled`는 `active && visible`이다: 원장은 이 게터를 이름만 적었고(26C-01, LANDING-066, `reviews/raw-round17-node-structure.md:136`) 뜻을 새로 정하지 않았으므로 옛 엔진 `AbstractNode.enabled`의 뜻을 유지한다(뜻을 바꾸는 이주는 LANDING 이주 항목으로 적는 것이 원장의 방식이고 `enabled`에는 그런 항목이 없다)." (`reviews/round-28-closing.md:22`)
  > 편집자 결정(28C-02): "【추론】 살아 있는(형상 안) 노드에서는 `active`가 늘 참이므로(26C-08) `enabled`는 `visible`과 같고, 잠금(`readOnly`·`disabled`)과는 무관하다." (`reviews/round-28-closing.md:23`)
  > 편집자 결정(28C-02): "【추론】 `visible`·`readOnly`·`disabled` 게터는 CONTROLS-082의 로컬 결합 결과(잠금은 OR, 표시는 AND, 자리 넷)를 돌려주며, Form 속성의 전체 잠금은 렌더 계층이 그 위에 OR하므로 코어 게터에 들지 않는다." (`reviews/round-28-closing.md:24`)
  > 편집자 결정(467C-01): "【추론】 `FieldNodeState.Dirty`→`FieldNodeState.Edited`(bit 1), `ShowError.Dirty`→`ShowError.Edited`(bit 4), `ShowError.DirtyTouched`→`ShowError.EditedTouched`(bit 16), `required`→`isRequired`, `active`→`isActive`, `visible`→`isVisible`, `enabled`→`isPresent`, `readOnly`→`isReadOnly`, `disabled`→`isDisabled`, `misfit`→`isMisfit`로 바꾼다. 노드 boolean은 is 접두사를 쓰고 isRoot는 유지하며 record와 getter는 같은 이름이다. React props·FieldInputHint·schema·controls 키와 재계산 dirty 어휘는 유지하고 옛 이름 별칭은 두지 않는다. `isEdited`는 `!!state[FieldNodeState.Edited]`, `isTouched`는 `!!state[FieldNodeState.Touched]`이다. 사용자 입력만 Edited를 세우고 프로그램 setValue·배열 동사·fill·파생 쓰기·injectTo·unsetValue·trim은 세우지 않는다. 원래 값 복귀로 Edited가 지워지지 않으며 reset·clearSubtreeState·resetInteraction이 초기화한다. detach 뒤 isEdited·isTouched는 마지막 커밋 상태를 유지하고 isDivergent는 isPresent·isActive처럼 현재 출력 기여를 설명하므로 false다. ShowError의 기본 EditedTouched 정책과 비트 값은 유지하며 Submitted나 Divergent 조건을 더하지 않는다. 근거는 원문 29–31·60·76–78이다." (`reviews/round-467-closing.md:8`)
- 상태: 현행
- 출처: `adr/0003-group-namespace.md:80,81,83`(정본), `08-design-a-to-z.md:105`, `07-conclusions.md:123`
- 닫은 사람: 소유자 답(`reviews/round-9-spec.md:64` 예약 층의 뜻), 편집자 결정(10라운드, ADR 0003 5차 본문 `adr/0003-group-namespace.md:10`)
- 라운드: 10
- 까닭: `07-conclusions.md:123`

### CONTROLS-023 키 표 — `readOnly`·`disabled`: 그 노드에만 거는 잠금

- 결정:
  > | 키 | 뜻 | 단계 | 부류 |
  > | --- | --- | --- | --- |
  > | `readOnly`, `disabled` | 잠금. 그 노드에만 걸린다. 값·형상·방출을 바꾸지 않는다 | 계산의 끝에서 한 번(코어에 글로벌 없음) | 형용사 |
- 보충:
  > "| `readOnly`, `disabled` | 형용사 | 노드 | 계산의 끝 | 그 노드의 입력을 잠근다. 자손에 내려가지 않는다 | — | — |" (`08-design-a-to-z.md:106`)
  > 편집자 결정(28C-02): "【추론】 `visible`·`readOnly`·`disabled` 게터는 CONTROLS-082의 로컬 결합 결과(잠금은 OR, 표시는 AND, 자리 넷)를 돌려주며, Form 속성의 전체 잠금은 렌더 계층이 그 위에 OR하므로 코어 게터에 들지 않는다." (`reviews/round-28-closing.md:24`)
  > 편집자 결정(28C-02): "【추론】 떼어진 노드의 `visible`·`readOnly`·`disabled`는 NODE-044의 고정 읽기이며, 26C-10의 `misfit` 등과 같이 떼어질 때 그 노드가 형상에 있던 마지막 커밋의 값을 한 번 갈무리한다; 26C-08의 예외는 `active`와 그것에서 도출되는 `enabled`에만 있다." (`reviews/round-28-closing.md:25`)
  > 편집자 결정(467C-01): "【추론】 `FieldNodeState.Dirty`→`FieldNodeState.Edited`(bit 1), `ShowError.Dirty`→`ShowError.Edited`(bit 4), `ShowError.DirtyTouched`→`ShowError.EditedTouched`(bit 16), `required`→`isRequired`, `active`→`isActive`, `visible`→`isVisible`, `enabled`→`isPresent`, `readOnly`→`isReadOnly`, `disabled`→`isDisabled`, `misfit`→`isMisfit`로 바꾼다. 노드 boolean은 is 접두사를 쓰고 isRoot는 유지하며 record와 getter는 같은 이름이다. React props·FieldInputHint·schema·controls 키와 재계산 dirty 어휘는 유지하고 옛 이름 별칭은 두지 않는다. `isEdited`는 `!!state[FieldNodeState.Edited]`, `isTouched`는 `!!state[FieldNodeState.Touched]`이다. 사용자 입력만 Edited를 세우고 프로그램 setValue·배열 동사·fill·파생 쓰기·injectTo·unsetValue·trim은 세우지 않는다. 원래 값 복귀로 Edited가 지워지지 않으며 reset·clearSubtreeState·resetInteraction이 초기화한다. detach 뒤 isEdited·isTouched는 마지막 커밋 상태를 유지하고 isDivergent는 isPresent·isActive처럼 현재 출력 기여를 설명하므로 false다. ShowError의 기본 EditedTouched 정책과 비트 값은 유지하며 Submitted나 Divergent 조건을 더하지 않는다. 근거는 원문 29–31·60·76–78이다." (`reviews/round-467-closing.md:8`)
- 상태: 현행
- 출처: `adr/0003-group-namespace.md:80,81,84`(정본), `08-design-a-to-z.md:106`, `07-conclusions.md:123`
- 닫은 사람: 소유자 답(`reviews/round-13-owner-answers.md:7` 1 잠금 규칙)
- 라운드: 13
- 까닭: `reviews/round-13-owner-answers.md:7`

### CONTROLS-024 키 표 — `unsetOnInactive`: 나감 정책, 네 층, 하위 트리로 내려감, 직전 커밋의 값

- 결정:
  > | 키 | 뜻 | 단계 | 부류 |
  > | --- | --- | --- | --- |
  > | `unsetOnInactive` | 나감 정책이 참으로 정해진 노드가 나갈 때 원본을 한 번 비운다. 기본 꺼짐. 네 층(노드 > `children` 항목의 `controls` > 조각의 `controls` > Form 속성), 같은 층은 하나라도 유지면 유지. 나가는 객체·분기에 켠 정책은 함께 나가는 하위 트리로 내려가고, 자손이 스스로 적은 선언이 가까운 순서로 이긴다(17라운드 소유자 답 R17-2 ㄴ, 08 §8.4) | 전이 | 형용사(어느 선언이 걸리는가도, 걸린 선언이 식일 때의 값도 직전 커밋의 것이며 나가는 순간 새로 평가하지 않는다. Form 속성은 `boolean`만) |
- 보충:
  > "| `unsetOnInactive` | 형용사 | 노드, `children` 항목의 `controls`, 조각의 `controls`, Form 속성 | 전이 | 정책이 참으로 정해진 노드가 나갈 때 원본을 한 번 비운다. 나가는 객체·분기에 켠 정책은 함께 나가는 하위 트리로 내려가고, 자손이 스스로 적은 선언이 가까운 순서로 이긴다(17라운드 소유자 답 R17-2 ㄴ, §8.4). 어느 선언이 걸리는가도, 걸린 선언이 식일 때의 값도 직전 커밋(그 노드가 형상에 있던 마지막 커밋)의 것이다. Form 속성은 `boolean`만. 기본 꺼짐 | 로드에는 나감이 없다 | 나갈 때 한 번 |" (`08-design-a-to-z.md:112`)
  > 편집자 결정(28C-05): "【추론】 ERROR-122의 자리별 값 표에 행 하나를 더해 읽는다: `controls.unsetOnInactive`의 식(노드 자신, `controls.children` 항목의 `controls`, 조각의 `controls`)이 직전 커밋의 방출 트리에서 던지면 그 선언은 "유지"다." (`reviews/round-28-closing.md:55`)
  > 편집자 결정(28C-05): "【추론】 층 규칙은 그대로다: 그 층의 유지가 아래 층의 비움을 덮는다(세부가 포괄을 덮는다)." (`reviews/round-28-closing.md:57`)
- 상태: 현행
- 출처: `adr/0003-group-namespace.md:80,81,85`(정본), `08-design-a-to-z.md:112`, `07-conclusions.md:128`
- 닫은 사람: 소유자 답(`reviews/round-13-owner-answers.md:8` 2 나감 비움 기본값), 소유자 답(`reviews/round-13-owner-answers.md:17` 나감 정책 키 이름), 소유자 답(`reviews/round-17-owner-answers.md:10` R17-2), 소유자 답(`reviews/round-17-owner-answers.md:13` 통보 2), 편집자 결정(13라운드, 네 층과 같은 층의 유지 우선 `reviews/round-13-owner-review.md:66`)
- 라운드: 17
- 까닭: `reviews/round-17-owner-answers.md:10`

### CONTROLS-025 키 표 — `default`: 노드가 생길 때 없음이면 채우는 원천, 표준 `default`보다 앞

- 결정:
  > | 키 | 뜻 | 단계 | 부류 |
  > | --- | --- | --- | --- |
  > | `default` | 노드가 생길 때 값이 없음이면 채우는 원천. 표준 `default`보다 앞선다(`controls.default` > `default` > 없음). 이미 있던 노드는 다시 채우지 않는다 | 전이 | 명사(값) |
- 보충:
  > "| `default` | 명사 | 노드 | 전이 | 노드가 생길 때 없음이면 채운다. 표준 `default`보다 앞 | 형상의 모든 노드가 생긴 노드 | 생긴 노드에만 |" (`08-design-a-to-z.md:107`)
- 상태: 현행
- 출처: `adr/0003-group-namespace.md:80,81,86`(정본), `08-design-a-to-z.md:107`, `07-conclusions.md:126`
- 닫은 사람: 소유자 답(`reviews/round-9-spec.md:52` 읽기2 채우기 원천), 소유자 답(`reviews/round-9-spec.md:56` 읽기2 시점(A/B)), 소유자 답(`reviews/round-10-owner-answers.md:7` A-1)
- 라운드: 10
- 까닭: `reviews/round-9-spec.md:52`

### CONTROLS-026 키 표 — `derived`: 의존 값이 바뀌는 에지에서 자기 값을 덮음

- 결정:
  > | 키 | 뜻 | 단계 | 부류 |
  > | --- | --- | --- | --- |
  > | `derived` | 의존 값이 바뀌는 에지에서 자기 값을 다시 계산해 원본을 덮는다. 사용자가 쓴 값은 다음 의존 변화 또는 그 노드가 다시 생길 때까지 남는다 | 파생 | 명사(식) |
- 보충:
  > "| `derived` | 명사 | 노드 | 파생 | 의존 값이 바뀔 때 자기 값을 덮는다. 식이 `undefined`면 쓰지 않는다. 사용자가 쓴 값은 다음 의존 변화 또는 그 노드가 다시 생길 때까지 남는다 | 발화한다(직전 값이 없다) | 에지 |" (`08-design-a-to-z.md:108`)
- 상태: 현행
- 출처: `adr/0003-group-namespace.md:80,81,87`(정본), `08-design-a-to-z.md:108`, `07-conclusions.md:125`
- 닫은 사람: 소유자 답(`reviews/round-12-owner-answers.md:19` §9 로드에서 `&derived`), 소유자 답(`reviews/round-12-owner-answers.md:20` §9 `undefined` 반환), 편집자 결정(9라운드 도출, `07-conclusions.md:276`)
- 라운드: 12
- 까닭: `07-conclusions.md:276`

### CONTROLS-027 키 표 — `injectTo`: 자기 방출 값의 에지에서 다른 노드를 덮음, 로드에서 발화

- 결정:
  > | 키 | 뜻 | 단계 | 부류 |
  > | --- | --- | --- | --- |
  > | `injectTo` | 자기 방출 값이 직전 커밋과 다를 때(에지) 다른 노드를 덮는다. 로드에는 직전 값이 없으므로 발화한다. 이름은 원천에 적고 대상을 가리키므로 방향을 남긴다(`inject`만 남기면 방향이 읽히지 않는다. 15라운드) | 파생 | 명사(함수) |
- 보충:
  > "| `injectTo` | 명사 | 노드 | 파생 | 원천의 방출 값이 바뀔 때 대상에 전체 교체를 쓴다. 남에게 주는 값의 출처 | 발화한다 | 에지 |" (`08-design-a-to-z.md:109`)
  > 편집자 결정(29C-01): "【추론】 생긴 노드와 로드된 노드의 `controls.derived`·`controls.injectTo`는 원천의 방출 값이 `undefined`여도(채움 전) 거짓→참 에지로 발화한다: WRITE-029·FRAGMENT-050 (2)·CONTROLS-027은 에지의 조건을 "직전 값이 없다"로만 두고 원천 값의 유무를 조건으로 두지 않으며, CONTROLS-079의 `value`는 원천의 방출 값이라 방출이 없으면 `undefined`다." (`reviews/round-29-closing.md:9`)
  > 편집자 결정(29C-01): "【추론】 채움 뒤에는 새 에지가 있다: 채움 쓰기는 SETTLE-005 전이 행의 "→ 표시로"와 SETTLE-010(파생과 전이는 둘 다 표시로 돌아간다)에 따라 표시·계산·파생을 다시 지나고, 기준점은 그 규칙이 마지막으로 소비한 원천 값(`undefined`)이므로 채움 값으로의 변화는 SETTLE-004의 "원천이 다른 값으로 다시 바뀌면 새 에지"다." (`reviews/round-29-closing.md:12`)
- 상태: 현행
- 출처: `adr/0003-group-namespace.md:80,81,88`(정본), `08-design-a-to-z.md:109`, `07-conclusions.md:125`
- 닫은 사람: 소유자 답(`reviews/round-15-decisions.md:11` 3), 편집자 결정(4라운드, 에지 발화 F11 `reviews/round-4-spec.md:144`)
- 라운드: 15
- 까닭: `reviews/round-15-decisions.md:11`

### CONTROLS-028 키 표 — `unsetValue`: 거짓→참 에지에서 없음으로, 로드는 로드된 값으로 평가, 둘째 발화원은 나감

- 결정:
  > | 키 | 뜻 | 단계 | 부류 |
  > | --- | --- | --- | --- |
  > | `unsetValue` | 식이 거짓에서 참이 되는 에지에서 자기 값을 없음으로 만든다. 로드에서는 로드된 값으로 평가해 참이면 지운다. 지운 뒤의 입력은 남는다. 참에서 거짓이 되면 아무 일도 하지 않는다(값을 되살리지 않는다). 둘째 발화원은 정책이 참으로 정해진 노드의 나감이다(원장 §3) | 파생(식), 전이(나감) | 동사 |
- 보충:
  > "| `unsetValue` | 동사 | 노드 | 파생 | 식이 거짓→참이 되는 순간 값을 없음으로. 입력은 남는다 | 로드된 값으로 평가해 참이면 지운다 | 거짓→참에서 지우고 참→거짓에서는 아무 일도 없다 |" (`08-design-a-to-z.md:110`)
- 상태: 현행
- 출처: `adr/0003-group-namespace.md:80,81,89`(정본), `08-design-a-to-z.md:110`, `07-conclusions.md:125`, `07-conclusions.md:131`, `07-conclusions.md:251`
- 닫은 사람: 소유자 답(`reviews/round-10-owner-answers.md:29` E-21), 소유자 답(`reviews/round-10-owner-answers.md:39` E-21 되물음), 소유자 답(`reviews/round-12-owner-answers.md:13` 5 `&clearValue` 두 문장), 소유자 답(`reviews/round-13-owner-answers.md:8` 2 나감 비움 기본값), 편집자 결정(13라운드, 둘째 발화원은 나감 `reviews/round-13-owner-review.md:65`)
- 라운드: 13
- 까닭: `07-conclusions.md:131`

### CONTROLS-029 키 표 — `resetInteraction`: 식이 참이 되면 `dirty`·`touched` 초기화

- 결정:
  > | 키 | 뜻 | 단계 | 부류 |
  > | --- | --- | --- | --- |
  > | `resetInteraction` | 식이 참이 되면 `dirty`·`touched`를 초기화한다. 값은 건드리지 않는다. 옛 이름 `pristine` | 커밋 | 동사 |
- 보충:
  > "| `resetInteraction` | 동사 | 노드 | 커밋 | 식이 참이 되면 `dirty`·`touched`를 초기화한다. 값은 건드리지 않는다 | `unsetValue`와 같은 시점 규칙 | 같음 |" (`08-design-a-to-z.md:111`)
  > 편집자 결정(28C-04): "【추론】 `DisableAutomaticWrites`로 억제한 로드(`FormHandle.reset(DisableAutomaticWrites)` 등)에서도 `controls.resetInteraction`은 커밋 단계에서 로드된 값으로 판정하고 참이면 `dirty`·`touched`를 비운다." (`reviews/round-28-closing.md:47`)
  > 편집자 결정(28C-04): "【추론】 억제 비트의 범위는 그 호출이 일으킨 예약 층의 자동 쓰기(채움, `controls.derived`, `controls.injectTo`, `controls.unsetValue`, 나감의 비움)이고, `controls.resetInteraction`은 원본 쓰기도 예약 층의 자동 쓰기도 아니므로(EVENT-012) 그 범위 밖이다; 포커스 아웃 `trim`은 호출 비트가 아니라 Form 속성 `disableAutomaticWrites`만이 억제한다(21C-01, WRITE-100)." (`reviews/round-28-closing.md:48`)
  > 편집자 결정(202C-01): "【추론】 소유자는 멈춤 없이, 권한 문제는 미루라고 했다. G4의 품질 증거는 이미 셋이고 PR 최종 검증이 남아 있으니 verifier 하나를 뒤로 미뤄도 위험이 작다." (`reviews/round-202-closing.md:9`)
  > 편집자 결정(467C-01): "【추론】 `FieldNodeState.Dirty`→`FieldNodeState.Edited`(bit 1), `ShowError.Dirty`→`ShowError.Edited`(bit 4), `ShowError.DirtyTouched`→`ShowError.EditedTouched`(bit 16), `required`→`isRequired`, `active`→`isActive`, `visible`→`isVisible`, `enabled`→`isPresent`, `readOnly`→`isReadOnly`, `disabled`→`isDisabled`, `misfit`→`isMisfit`로 바꾼다. 노드 boolean은 is 접두사를 쓰고 isRoot는 유지하며 record와 getter는 같은 이름이다. React props·FieldInputHint·schema·controls 키와 재계산 dirty 어휘는 유지하고 옛 이름 별칭은 두지 않는다. `isEdited`는 `!!state[FieldNodeState.Edited]`, `isTouched`는 `!!state[FieldNodeState.Touched]`이다. 사용자 입력만 Edited를 세우고 프로그램 setValue·배열 동사·fill·파생 쓰기·injectTo·unsetValue·trim은 세우지 않는다. 원래 값 복귀로 Edited가 지워지지 않으며 reset·clearSubtreeState·resetInteraction이 초기화한다. detach 뒤 isEdited·isTouched는 마지막 커밋 상태를 유지하고 isDivergent는 isPresent·isActive처럼 현재 출력 기여를 설명하므로 false다. ShowError의 기본 EditedTouched 정책과 비트 값은 유지하며 Submitted나 Divergent 조건을 더하지 않는다. 근거는 원문 29–31·60·76–78이다." (`reviews/round-467-closing.md:8`)
- 상태: 현행
- 출처: `adr/0003-group-namespace.md:80,81,90`(정본), `08-design-a-to-z.md:111`, `07-conclusions.md:127`
- 닫은 사람: 소유자 답(`reviews/round-12-owner-answers.md:15` 7 "input을 초기화"), 소유자 답(`reviews/round-12-owner-answers.md:13` 5 `&clearValue` 두 문장), 소유자 답(`reviews/round-9-spec.md:68` pristine 정정), 소유자 답(`reviews/round-10-owner-answers.md:32` E-5)
- 라운드: 12
- 까닭: `reviews/round-12-owner-answers.md:15`

### CONTROLS-030 키 표 — `children`: 이름으로 가리킨 직계 자식에 거는 제어, 안쪽 `controls`는 닫힌 목록

- 결정:
  > | 키 | 뜻 | 단계 | 부류 |
  > | --- | --- | --- | --- |
  > | `children` | 부모가 이름으로 가리킨 직계 자식에 제어를 건다. 형태는 `[{ targets: [...], controls: { readOnly, disabled, visible, active, default, derived, unsetValue, resetInteraction, unsetOnInactive } }]`이다. `targets`와 `controls`를 나누고, `controls`에는 상태 키뿐 아니라 값 키도 둔다(소유자 답 14·15). 안쪽 `controls`는 닫힌 목록이며 `children`·`injectTo`·`discriminator`·`watch`는 들지 않는다. 한 홉짜리 장치라 손자에 걸려면 자식 스키마에 `controls.children`을 적는다 | 안쪽 `controls`의 각 키가 위 행의 단계를 따른다 | 선언 |
- 보충:
  > "| `children` | 선언 | 객체 노드 | 각 키의 단계 | `[{ targets: [자식 이름…], controls: { readOnly, visible, active, disabled, unsetValue, default, derived, resetInteraction, unsetOnInactive } }]`. 이름으로 가리킨 직계 자식에 건다. 안쪽 `controls`는 닫힌 목록이며 `children`·`injectTo`·`discriminator`·`watch`는 들지 않는다. 손자에 걸려면 자식 스키마에 `controls.children`을 적는다 | — | — |" (`08-design-a-to-z.md:113`)
  > "형태는 `controls: { children: [{ targets: ['name', 'email'], controls: { readOnly: './locked', unsetValue: '...' } }] }`이며, 안쪽 `controls`에는 상태 키뿐 아니라 값 키(`default`, `derived`, `unsetValue`, `resetInteraction`, `unsetOnInactive`)도 둔다(소유자 답 14·15)." (`02-target-overview.md:297`)
  > 편집자 결정(29C-04): "【추론】 조각 객체의 `controls`에 둘 수 있는 키는 CONTROLS-077의 닫힌 목록(`active` `visible` `readOnly` `disabled` `default` `derived` `unsetValue` `resetInteraction` `unsetOnInactive`)이고 `injectTo`는 청사진 오류다; `controls.children` 항목의 안쪽 `controls`도 같다(CONTROLS-030)." (`reviews/round-29-closing.md:45`)
  > 편집자 결정(29C-04): "【추론】 02(PR-1) 청사진이 조각과 `controls.children` 항목의 `controls`에 `injectTo`를 모르는 키로 거부하는 것(`src/core/blueprint/utils/diagnostics/validateControlGroups.ts:27-46,95-113`의 키 목록과 모르는 키 거부, 조각 여부는 `src/core/blueprint/utils/diagnostics/collectDeclarations.ts:30-35,89`)은 원장과 맞으며 고칠 것이 없다." (`reviews/round-29-closing.md:48`)
  > 편집자 결정(35C-11): "【추론】 CONTROLS-030은 `children`을 "부모가 이름으로 가리킨 직계 자식"에 거는 한 홉 장치로 적고 CONTROLS-073은 `targets`를 호스트 청사진의 직계 자식 이름으로 풀므로, 작성된 이름이 없는 배열 아이템(위치는 런타임이다)은 대상이 될 수 없다; 06은 위치 대상을 지원하지 않고 경고도 더하지 않으며, 배열 호스트의 `controls.children`은 02 청사진이 풀리지 않는 `targets`에 이미 하는 처리에 맡긴다. 그 처리가 없으면 뒤 라운드의 청사진 진단이지 배열 행의 경고가 아니다(새 경고 코드는 ERROR-164의 라운드다)." (`reviews/round-35-closing.md:90`)
- 상태: 현행
- 출처: `adr/0003-group-namespace.md:80,81,91`(정본), `08-design-a-to-z.md:113`, `02-target-overview.md:297`, `07-conclusions.md:122`
- 닫은 사람: 소유자 답(`reviews/round-9-spec.md:108` 자식 집합 제어), 소유자 답(`reviews/round-10-owner-answers.md:16` C-15), 소유자 답(`reviews/round-10-owner-answers.md:21` D-14), 소유자 답(`reviews/round-13-owner-answers.md:7` 1 잠금 규칙; children 그룹은 예외), 소유자 답(`reviews/round-15-decisions.md:14` 6)
- 라운드: 15
- 까닭: `reviews/round-10-owner-answers.md:16`

### CONTROLS-031 키 표 — `discriminator`: 판별 키 이름, 청사진의 변환과 끌어올림

- 결정:
  > | 키 | 뜻 | 단계 | 부류 |
  > | --- | --- | --- | --- |
  > | `discriminator` | 작성자가 union 호스트에 적은 판별 키 이름(`"discriminator": "kind"`). 청사진이 각 분기의 그 키의 `const`·`enum`을 읽어 분기별 `active: "./kind === 값"`으로 바꾸고 그 키의 분기 선언을 게이트 없는 선언으로도 취급해 끌어올린다(14라운드 O-1). 분기 스키마(`kind: { const }`, `required`)는 고치지 않는다(ADR 0005 §4) | 청사진 — 상태와 작업 루프를 바꾸지 않는다 | 선언 |
- 보충:
  > "| `discriminator` | 선언 | union 호스트 | 청사진 | 분기의 그 키 `const`·`enum`을 읽어 분기별 `active: "./키 === 값"`으로 바꾼다. 상태와 루프를 바꾸지 않는다. 그 키의 분기 선언을 **게이트 없는 선언으로도 취급해 끌어올린다**(14라운드 확정. 태그 키가 분기 안에만 있는 생성기 스키마도 그대로 받는다. 존재만 더하는 선언이며 제약은 교차하지 않는다 — 게이트 없는 분기와 같은 문맥, 편집자 도출). 어느 분기에도 그 키의 `const`·`enum`이 없거나, 분기 선언의 종류가 서로 다르거나, `const`·`enum` 값이 두 분기에 겹치면 청사진 오류 | — | — |" (`08-design-a-to-z.md:114`)
- 상태: 현행
- 출처: `adr/0003-group-namespace.md:80,81,92`(정본), `08-design-a-to-z.md:114`
- 닫은 사람: 소유자 답(`reviews/round-10-owner-answers.md:11` B-22), 소유자 답(`reviews/round-12-owner-answers.md:9` 2 `&discriminator`), 소유자 답(`reviews/round-14-owner-answers.md:7` O-1)
- 라운드: 14
- 까닭: `reviews/round-14-owner-answers.md:7`

### CONTROLS-032 키 표 — `watch`: 의존 경로 선언, `watchValues`

- 결정:
  > | 키 | 뜻 | 단계 | 부류 |
  > | --- | --- | --- | --- |
  > | `watch` | 의존 경로 선언. 값과 형상을 바꾸지 않는다. 경로의 값은 공개 prop `watchValues`(위치 배열)로 입력에 전달된다. 선언이 여럿이면 의존은 합집합, `watchValues`는 유효 스키마의 것(나중 승) | 청사진과 표시 | 선언 |
- 보충:
  > "| `watch` | 선언 | 노드 | 청사진·표시 | 의존 경로 선언. 식이 읽는 경로를 정적으로 알 수 없을 때 작성자가 적는다. 경로의 값은 순서대로 공개 prop `watchValues`로 입력에 전달된다(`src/types/formTypeInput.ts:59`). 선언이 여럿이면 의존은 모든 선언의 합집합(청사진, 정적)이고 `watchValues`는 유효 스키마의 `controls.watch`(켜진 선언 가운데 전순서에서 나중 것)이며 한 선언 안의 순서와 중복은 그대로다(17라운드 스웜 수렴(편집자 결정)) | — | — |" (`08-design-a-to-z.md:115`)
  > "| `&watch` | `string\|string[]`. 명시적 의존 경로 | 유지 | 유지 | `getObservedValuesFactory.ts:29` / `adr/0003:25` |" (`05-before-after.md:44`)
  > 편집자 결정(28C-07): "【추론】 코어 게터 `watchValues`(CONTROLS-032)는 PR-6, 곧 04의 겉면 멤버다: `reviews/raw-round17-node-structure.md:136`이 계산 상태 게터 여섯 가운데 `active`를 뺀 다섯을 PR-6으로 적었고, 26C-01이 LANDING-066의 넷만 인용한 것은 그 목록을 닫은 것이 아니다." (`reviews/round-28-closing.md:75`)
  > 편집자 결정(28C-07): "【추론】 26C-01의 규칙("기제를 들여오는 PR")으로도 같다: `watchValues`의 기제 — 유효 스키마의 `controls.watch` 선택(나중 승)과 방출 트리의 경로 읽기(CONTROLS-080 (5)) — 는 상태 키·제어 단계의 것이다." (`reviews/round-28-closing.md:76`)
  > 편집자 결정(28C-07): "【추론】 `FormTypeInputProps.watchValues`로 넘기는 일은 PR-7 렌더 계층이고, LANDING-137(`omitEmpty` 아래 빈 문자열이 `undefined`)은 게터가 방출 트리를 읽는 결과이므로 PR-6의 게터에 든다; EVENT-064의 계산 상태 비트에 `watchValues`가 드는 것은 PR-4 배달의 몫이다." (`reviews/round-28-closing.md:77`)
- 상태: 현행
- 출처: `adr/0003-group-namespace.md:80,81,93`(정본), `08-design-a-to-z.md:115`, `07-conclusions.md:124`, `05-before-after.md:44`
- 닫은 사람: 편집자 결정(10라운드, ADR 0003 5차 본문 `adr/0003-group-namespace.md:10`), 17라운드 스웜 수렴(편집자 결정, `08-design-a-to-z.md:115`; 선언이 여럿일 때)
- 라운드: 17
- 까닭: `08-design-a-to-z.md:115`
- 충돌:
  > `05-before-after.md:44`의 "`string\|string[]`"은 정본과 다르다: `watch`의 형은 문자열 배열이며 단일 문자열은 받지 않는다(CONTROLS-019). 정본이 이긴다(`adr/0003-group-namespace.md:76`).

### CONTROLS-033 값 조작 셋 1 — 없는 값 채우기는 채움

- 결정:
  > 없는 값 채우기는 채움(`controls.default`·`default`)이다.
- 보충: 없음
- 상태: 현행
- 출처: `adr/0003-group-namespace.md:95#2`(정본)
- 닫은 사람: 소유자 답(`reviews/round-9-spec.md:48` 읽기2), 편집자 결정(10라운드, ADR 0003 5차 본문 `adr/0003-group-namespace.md:10`)
- 라운드: 10
- 까닭: `reviews/round-9-spec.md:48`

### CONTROLS-034 값 조작 셋 2 — 있는 값 바꾸기는 `derived`(자기)와 `injectTo`(남)

- 결정:
  > 있는 값 바꾸기는 `controls.derived`(자기)와 `controls.injectTo`(남)다.
- 보충: 없음
- 상태: 현행
- 출처: `adr/0003-group-namespace.md:95#3`(정본)
- 닫은 사람: 소유자 답(`reviews/round-9-spec.md:48` 읽기2), 편집자 결정(10라운드, ADR 0003 5차 본문 `adr/0003-group-namespace.md:10`)
- 라운드: 10
- 까닭: `reviews/round-9-spec.md:48`

### CONTROLS-035 값 조작 셋 3 — 있는 값 지우기는 `unsetValue`(원본)와 `active: false`(방출)

- 결정:
  > 있는 값 지우기는 `controls.unsetValue`(원본에서)와 `controls.active: false`(방출에서)다.
- 보충: 없음
- 상태: 현행
- 출처: `adr/0003-group-namespace.md:95#4`(정본)
- 닫은 사람: 소유자 답(`reviews/round-9-spec.md:48` 읽기2), 편집자 결정(10라운드, ADR 0003 5차 본문 `adr/0003-group-namespace.md:10`)
- 라운드: 10
- 까닭: `reviews/round-9-spec.md:48`

### CONTROLS-036 런타임에 "없음일 때만 채우는" 별도 키는 두지 않는다

- 결정:
  > 런타임에 "없음일 때만 채우는" 별도 키는 두지 않는다(소유자 답 11).
- 보충: 없음
- 상태: 현행(부정 결정)
- 출처: `adr/0003-group-namespace.md:95#5`(정본)
- 닫은 사람: 소유자 답(`reviews/round-10-owner-answers.md:15` C-11)
- 라운드: 10
- 까닭: `reviews/round-10-owner-answers.md:15`

### CONTROLS-037 없음으로 만드는 장치는 `unsetValue` 하나

- 결정:
  > 없음으로 만드는 장치는 `controls.unsetValue` 하나이고 발화원이 둘이다.
- 보충: 없음
- 상태: 현행
- 출처: `adr/0003-group-namespace.md:95#6`(정본)
- 닫은 사람: 편집자 결정(13라운드, 소유자 검토 문서가 장치의 모양으로 제시 `reviews/round-13-owner-review.md:65`), 소유자 답(`reviews/round-12-owner-answers.md:10` 3 꺼질 때 값 정책)
- 라운드: 13
- 까닭: `reviews/round-13-owner-review.md:65`

### CONTROLS-038 `unsetValue`의 발화원 둘 — 식의 거짓→참과 정책이 참인 노드의 나감

- 결정:
  > 하나는 식의 거짓→참이고, 다른 하나는 정책이 참으로 정해진 노드의 나감이다.
- 보충: 없음
- 상태: 현행
- 출처: `adr/0003-group-namespace.md:95#7`(정본)
- 닫은 사람: 편집자 결정(13라운드, 소유자 검토 문서가 장치의 모양으로 제시 `reviews/round-13-owner-review.md:65`), 소유자 답(`reviews/round-12-owner-answers.md:10` 3 꺼질 때 값 정책)
- 라운드: 13
- 까닭: `reviews/round-13-owner-review.md:65`

### CONTROLS-039 정책 키 `unsetOnInactive` — 이름, 형용사 형, Form 속성은 `boolean`만

- 결정:
  > 정책 키(`unsetOnInactive`, 이름은 소유자 13라운드 확정)는 형용사 형(`boolean` 또는 식→`boolean`, 15라운드 결정 2)이며 Form 속성은 `boolean`만이다.
- 보충: 없음
- 상태: 현행
- 출처: `adr/0003-group-namespace.md:95#8`(정본)
- 닫은 사람: 소유자 답(`reviews/round-13-owner-answers.md:17` 나감 정책 키 이름), 소유자 답(`reviews/round-15-decisions.md:10` 2), 소유자 답(`reviews/round-17-owner-answers.md:13` 통보 2)
- 라운드: 17
- 까닭: `reviews/round-13-owner-answers.md:17`

### CONTROLS-040 나감 정책의 층 — 세부가 포괄을 덮고 같은 층은 유지 우선

- 결정:
  > 노드 자신 > `children` 항목의 `controls` > 조각 객체의 `controls` > Form 속성 순으로 세부가 포괄을 덮고, 같은 층에 여럿이면 하나라도 유지면 유지한다.
- 보충: 없음
- 상태: 현행
- 출처: `adr/0003-group-namespace.md:95#9`(정본), `03-mental-model.md:94#8`(WRITE-031의 정본, 층 규칙이 겹침)
- 닫은 사람: 편집자 결정(13라운드, 소유자 검토 문서가 장치의 모양으로 제시 `reviews/round-13-owner-review.md:66`), 편집자 결정(13라운드, 13라운드 답 2로 닫힘 `07-conclusions.md:238`)
- 라운드: 13
- 까닭: `reviews/round-13-owner-review.md:66`

### CONTROLS-041 나감의 기본은 유지

- 결정:
  > 기본은 유지다(13라운드 답 2).
- 보충: 없음
- 상태: 현행
- 출처: `adr/0003-group-namespace.md:95#10`(정본), `02-target-overview.md:299`
- 닫은 사람: 소유자 답(`reviews/round-13-owner-answers.md:8` 2 나감 비움 기본값)
- 라운드: 13
- 까닭: `reviews/round-13-owner-answers.md:8`

### CONTROLS-042 조각 범위 제어와 조각 게이트

- 결정:
  > 조각 객체(예: `allOf` 항목)에 둔 제어 키는 그 조각이 켜져 있는 동안 그 조각이 직접 선언한 호스트의 직계 자식에 걸린다(더 깊은 자손에는 그 자손을 직접 선언한 안쪽 조각의 `controls`가 걸린다). 조각 객체의 `controls.active`는 조각 게이트다. 거짓이면 그 조각의 선언과 제약이 빠지지만, 다른 켜진 조각이 선언한 같은 노드는 존재한다.
- 보충:
  > "조각 객체에 둔 제어 키는 그 조각이 켜져 있는 동안 그 조각이 직접 선언한 호스트의 직계 자식에 걸린다(더 깊은 자손에는 그 자손을 직접 선언한 안쪽 조각의 `controls`가 걸린다)(나감의 정책은 꺼지는 순간에도 적용, 원장 §3)." (`02-target-overview.md:297`)
  > "조각 객체(`allOf` 항목, 분기, `then`)의 `controls.active`는 그 조각의 게이트이고, 그 밖의 제어 키(`controls.readOnly` 등)는 그 조각이 직접 선언한 호스트의 직계 자식에 조각이 켜진 동안 걸린다(조각 범위 제어)." (`08-design-a-to-z.md:117`)
- 상태: 현행
- 출처: `adr/0003-group-namespace.md:99`(정본), `02-target-overview.md:297`, `08-design-a-to-z.md:117`, `07-conclusions.md:165`
- 닫은 사람: 소유자 답(`reviews/round-9-spec.md:108` 자식 집합 제어), 소유자 답(`reviews/round-9-spec.md:32` 요약 발언), 편집자 결정(10라운드, ADR 0003 5차 본문 `adr/0003-group-namespace.md:10`)
- 라운드: 10
- 까닭: `reviews/round-9-spec.md:108`
- 충돌:
  > `07-conclusions.md:165`의 "조각 객체의 `&visible`·`&readOnly`·`&disabled`는 그 조각이 선언한 노드 집합에 거는 제한이며, 조각이 켜진 동안만 결합에 들어간다."는 정본과 다르다. 정본이 이긴다(`adr/0003-group-namespace.md:99`).

### CONTROLS-043 식의 기준점 — 선언한 노드(호스트), `.`·`..`는 폼의 확장 표기

- 결정:
  > **식의 기준점(15라운드).** 모든 JSON Pointer는 그것을 선언한 노드를 기준으로 푼다. 노드는 그 자체로 행위의 원천이자 네임스페이스다. `oneOf`·`allOf`·`then` 조각, `controls.children` 항목, `controls.discriminator`가 만드는 게이트는 모두 호스트 스키마 안의 선언이므로 호스트가 기준이다. 조각은 같은 네임스페이스의 다른 표현 위치이지 다른 네임스페이스가 아니다(소유자). `if` 부속 스키마가 검증기에 의해 호스트 인스턴스에 대고 평가되는 것과 같은 자리다. 5차 본문이 조각 식의 기준을 "호스트의 직계 자식 자리"로 두었던 것은 편집자의 도출이었고 이 판에서 되돌렸다. `.`·`..`는 폼의 확장 표기이므로 폼이 정당하고 일관되게 처리한다(소유자 12라운드). 자식에 적던 식을 `controls.children`으로 옮기면 `../x`를 `./x`로 고친다.
- 보충: 없음
- 상태: 현행
- 출처: `adr/0003-group-namespace.md:101`(정본), `08-design-a-to-z.md:118`
- 닫은 사람: 소유자 답(`reviews/round-15-decisions.md:9` 1), 소유자 답(`reviews/round-12-owner-answers.md:21` §9 조각 식의 경로 기준)
- 라운드: 15
- 까닭: `reviews/round-15-decisions.md:9`

### CONTROLS-044 조각 범위 제어와 `children`은 상속이 아니라 명시한 대상에 거는 제어

- 결정:
  > 조각 범위 제어와 `controls.children`은 조상에서 내려오는 상속이 아니라 명시한 대상에 거는 제어다.
- 보충:
  > "부모의 `controls.children`과 켜진 조각의 `controls`다(상태 키가 아닌 나감의 비움 정책 `unsetOnInactive`만은 나가는 객체·분기에 켠 정책이 함께 나가는 하위 트리로 내려간다, 17라운드 소유자 답 R17-2 ㄴ, 원장 §3)." (`02-target-overview.md:297`)
  > "나감의 비움 정책 `unsetOnInactive`는 상태 키가 아니며, 13라운드 답 1의 둘째 예외로 함께 나가는 하위 트리에 내려간다(17라운드 소유자 답 R17-2 ㄴ, §8.4)." (`08-design-a-to-z.md:337`)
  > 편집자 결정(439C-02): "【추론】 가설 3(PR428, 가지 `vincent-kk/schema-form-validate-skip`)은 `AnalysisContext`의 `hasChildTargets` 플래그를 `collectDeclarations.ts`의 선언 생성 자리에서 세우고 `blueprint.ts`에서 `validateChildTargets`를 플래그가 참일 때만 부른다(플래그는 공개 결과 `Blueprint.capabilities`가 아니라 분석 문맥 전용; J-33). 네 게이트(774파일 4,944시험 실패 0), Node·Bun 관측 동치 174비교 차이 0, 변이 M1~M3 검출, 측정 창(UTC 2026-10-20 17:48:05~17:58:54, NODE_ENV=production, A/A′/B)에서 동치 10행·미입증 4행·입증(느림) 0, 호출 수 1→0. 독립 검토(agy) PASS 0건, 검증자(Claude Opus) PASS(낮은 지적 셋 반영: `c6bda8628`·`ea2044270`·`3054c1253`). 433C-01 허가로 코디네이터가 `cc1b1db47`로 gh squash 병합했다. 가설 2(PR429, 가지 `vincent-kk/schema-form-shape-skip`)는 노드 구성이 만들고 있는 템플릿에 다시 닿는 순간(`constructing.has(key)` 분기)에만 `hasTemplateRecursion`을 세우고 `validateShape`를 그때만 부른다: 템플릿 재귀가 없으면 노드 그래프에 순환이 생길 수 없어(간선은 `appendChildEntries.ts:75`와 `populateVirtualNodes.ts:123·150`에서만 생기고 가상 노드는 먼저 있던 간선만 복사) `RecursiveShapeUnbounded`가 불가능하므로 결과는 같다. 네 게이트(Storybook EVENT-065 시간 초과 1건은 425C-02 단독 재실행 4/4), 관측 동치 174비교 차이 0(착지 전후), M1~M3 검출, 측정 창(UTC 18:33:34~18:39:53, production)에서 입증(느림) 0(nested d6 입증(빠름), oneOf-40·80 미입증), `validateShape`·`visitShape` 호출 B에서 0. 기준(#428)을 가지에 병합해 착지하고 게이트·관측 동치를 다시 돌렸다. 독립 검토(agy) PASS 0건, 검증자 PASS(낮은 지적 F1 플래그를 필수 필드로 하고 문맥 생성 시 false 초기화, F2 `buildNodes/DETAIL.md` 문장, F3 착지 전 실패 수 표기; 모두 반영 `0a22140d0`·`587e48762`·`2b0a28395`; 게이트를 항상 거짓으로 만드는 변이 M4가 차등 시험 edge-23과 called-once 3시험에서 검출됨; J-35). 코디네이터가 `8a3ee595a`로 gh squash 병합했다. 제품 끝은 `8a3ee595a`다. 증거는 `.seiri/tasks/child-targets-skip-439/`와 `.../shape-skip-439/`다." (`reviews/round-439-closing.md:10`)
- 상태: 현행
- 출처: `adr/0003-group-namespace.md:111`(정본), `02-target-overview.md:297`, `08-design-a-to-z.md:337`, `07-conclusions.md:158`
- 닫은 사람: 소유자 답(`reviews/round-13-owner-answers.md:7` 1 잠금 규칙), 소유자 답(`reviews/round-9-spec.md:108` 자식 집합 제어)
- 라운드: 13
- 까닭: `reviews/round-13-owner-answers.md:7`

### CONTROLS-045 상태 키는 그 노드에만 — 코어에 글로벌 없음, 조상 상속 없음, 전체 잠금은 렌더 계층

- 결정:
  > 코어에는 글로벌이 없다(소유자 13라운드 답 1: "글로벌 readOnly 나 disabled 같은 개념은 없애고 모든 control 필드는 자체 노드만 지원. children 그룹은 예외."). 표준 `readOnly`와 `controls`의 키는 그 노드에만 걸린다. 루트 스키마의 키는 루트 노드의 로컬 키이며, 오늘 루트 키 다섯(`readOnly`·`disabled`·`active`·`visible`·`pristine`)의 특수 처리는 사라진다(이주). 조상의 상태는 자손에 상속되지 않는다(소유자 답 13). 그래서 터미널이 아닌 객체 노드를 대상으로 한 잠금은 입력이 없으므로 효과가 없고(표준 `readOnly`는 청사진 경고), 배열 노드의 잠금은 렌더 계층이 아이템 추가·삭제·이동 입력에 적용하며, 터미널 객체·배열은 입력이 있으므로 리프와 같다. `active`·`visible`은 구조상 하위 트리를 가린다(원장 §4). 자손을 거는 길은 부모의 `controls.children`과 켜진 조각의 `controls`뿐이다(§4). Form 속성 `readOnly`·`disabled`는 렌더 계층이 참일 때만 거는 전체 잠금이며 코어의 상태가 아니다(P5).
- 보충:
  > "**로컬**은 노드 자신의 키와 `controls`의 식이다." (`02-target-overview.md:294`)
  > "오늘 루트 키 다섯(`readOnly`·`disabled`·`active`·`visible`·`pristine`)의 특수 처리와 README의 "Priority System"은 사라진다." (`08-design-a-to-z.md:335`)
  > "렌더 계층이 코어의 결과 위에 OR한다." (`08-design-a-to-z.md:339`)
  > 편집자 결정(65C-02): "【추론】 상태 키(SETTLE-003 "상태 키는 그 노드에만 걸린다", CONTROLS-045), 전역 상태(EVENT-062 "형상 안 노드에서 유도한다 — 키별 참 노드 수"), 감시 트리거는 모두 청사진이 선언한 기능이므로 어느 노드가 그 기능을 가질 수 있는지는 컴파일 때 정해진다; 그러므로 그 통과가 바뀐 노드 전체를 훑는 것은 SETTLE-017의 "역의존 표(정적 색인)"와 같은 결로 청사진 범위의 정적 색인(기능 → 그 기능을 선언한 청사진 노드 집합)으로 바꿀 수 있고, 통과는 재계산 목록과 그 색인의 교집합만 방문한다. 기능을 선언한 노드가 없는 폼에서는 통과가 0 방문이다. 의미는 바뀌지 않는다: 어느 노드가 어떤 상태 키·전역 상태 비트·감시를 갖는지는 그대로이고, 방문 순서가 결과에 들지 않는 통과에만 적용한다(순서가 결과에 드는 통과는 SETTLE-006의 순서를 지킨다)." (`reviews/round-65-closing.md:17`)
- 상태: 현행
- 출처: `adr/0003-group-namespace.md:115`(정본), `02-target-overview.md:291-297`, `08-design-a-to-z.md:335-339`, `07-conclusions.md:158`, `07-conclusions.md:164`
- 닫은 사람: 소유자 답(`reviews/round-13-owner-answers.md:7` 1 잠금 규칙), 소유자 답(`reviews/round-10-owner-answers.md:25` E-13), 소유자 답(`reviews/round-13-owner-answers.md:16` Form 속성의 자리), 소유자 답(`reviews/round-12-owner-answers.md:7` 1 Form 속성 `false`)
- 라운드: 13
- 까닭: `reviews/round-13-owner-answers.md:7`, `reviews/round-10-owner-answers.md:25`

### CONTROLS-046 로컬 층 안의 결합 — 잠금은 OR, 표시는 AND

- 결정:
  > 로컬 층 안에서 상태 키가 여럿 겹칠 때(표준 `readOnly`, `controls.readOnly`, 켜진 조각의 범위 제어, 부모의 `controls.children` 항목)는 선언은 합집합·제한은 교집합의 원리대로 잠금(`readOnly`·`disabled`)은 하나라도 참이면 잠기고 표시(`active`·`visible`)는 모두 참이어야 켜진다.
- 보충:
  > "코어에 글로벌은 없고, Form 속성의 전체 잠금은 렌더 계층이 그 결과 위에 OR한다(소유자 13라운드)." (`03-mental-model.md:138`)
  > "편집자 판정이며 소유자 확인을 기다린다(원장 §4·§7)." (`02-target-overview.md:298`)
- 상태: 현행
- 출처: `03-mental-model.md:138#4`(정본), `adr/0003-group-namespace.md:144`, `02-target-overview.md:298`, `08-design-a-to-z.md:338`, `07-conclusions.md:158`, `07-conclusions.md:160`, `07-conclusions.md:164`, `reviews/round-12-owner-answers.md:11`, `reviews/round-12-owner-answers.md:23`, `reviews/round-18-closing.md:1924`
- 닫은 사람: 편집자 결정(13라운드, 원장 §7 `03-mental-model.md:227`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-69; CONTROLS-082로 확정)
- 라운드: 18
- 까닭: `07-conclusions.md:163`, `reviews/round-18-closing.md:1970-1976`
- 충돌:
  > `02-target-overview.md:298`의 "편집자 판정이며 소유자 확인을 기다린다(원장 §4·§7)."는 18라운드 결정과 다르다: 이 결합은 18C-69의 편집자 결정(18라운드)으로 확정되어 소유자 확인을 기다리지 않는다. 18라운드 결정이 이긴다(`reviews/round-18-closing.md:1924`).
  > `adr/0003-group-namespace.md:144`의 "편집자 판정이며 소유자 확인 대상이다(원장 §7)."는 18라운드 결정과 다르다: 이 결합은 18C-69의 편집자 결정(18라운드)으로 확정되어 소유자 확인을 기다리지 않는다(CONTROLS-082). 18라운드 결정이 이긴다(`reviews/round-18-closing.md:1924`).

### CONTROLS-047 BE가 같은 스키마를 자기 검증기에 넣을 때

- 결정:
  > - BE가 같은 스키마를 자기 검증기에 넣을 때: 미지 키워드를 무시하는 검증기면 아무것도 하지 않아도 되고, strict면 같은 그룹 셋을 지운다.
- 보충: 없음
- 상태: 현행
- 출처: `adr/0003-group-namespace.md:128`(정본), `adr/0003-group-namespace.md:50`
- 닫은 사람: 편집자 결정(15라운드, ADR 0003 6차 본문 `adr/0003-group-namespace.md:8`)
- 라운드: 15
- 까닭: `adr/0003-group-namespace.md:50`

### CONTROLS-048 남는 것 — `controls` 식 시스템 전체, `computed`는 `controls`로

- 결정:
  > - **남는다:** `controls` 식 시스템 전체 — JSON Pointer로 다른 노드의 값을 읽는 동적 함수와 §3의 키. G2(FE 표현력 유지)의 근거다. 오늘의 `computed` 컨테이너는 `controls`라는 이름으로 남는다.
- 보충:
  > "| 표현식 문법과 참조 형식 | `#/path`·`./path`·`../path`·`/path`·`@`·`#`를 `new Function`으로 컴파일한다 | **JSON Pointer 동적 함수 전체 유지** | 유지 | `ComputedPropertiesManager/utils/regex.ts:84-101`, `createDynamicFunction.ts:41` / `adr/0003:25` |" (`05-before-after.md:57`)
- 상태: 현행
- 출처: `adr/0003-group-namespace.md:136`(정본), `05-before-after.md:57`
- 닫은 사람: 소유자 답(`reviews/round-9-spec.md:24` 축6), 소유자 답(`00-goals.md:143` G2), 소유자 답(`reviews/round-15-decisions.md:13` 5)
- 라운드: 15
- 까닭: `00-goals.md:143`

### CONTROLS-049 흡수되는 것 — `&if`·`computed.if`는 조각 범위의 `controls.active`로

- 결정:
  > - **흡수된다:** `&if`와 `computed.if`는 조각 범위의 `controls.active`로 흡수된다. 분기 객체에 `&if`를 쓰던 스키마는 같은 식을 그 분기 객체의 `controls.active`로 옮긴다. 기준점은 둘 다 호스트라 식은 그대로다. JSON의 `if`가 이미 조각 게이트이므로 `&if`를 두면 같은 게이트의 셋째 철자가 되어 G4에 걸린다.
- 보충:
  > 편집자 결정(305C-03): "【추론】 fairy08의 별도 발견(옛 문법 `computed.if`·`&if`가 든 스키마는 오류나 경고 없이 키가 무시됨)은 새 설계의 원칙 그대로다: 폼은 그룹 객체 셋(`controls`·`options`·`presentation`) 안의 키만 읽고(CONTROLS-001), 맨 키는 JSON Schema 층의 모르는 키로 검증기에 간다(CONTROLS-078·CONTROLS-081이 같은 원리로 `virtualRequired`·`placeholder`를 처리). `computed`와 `&` 접두 키는 CONTROLS-049의 이주 항목이고, 이주 진단을 넣으면 폼이 맨 키를 읽게 되어 원칙을 어기므로 넣지 않는다. 이주 안내는 README 1.0.0 이주 절(270C-01, 마무리 단계에 한 번에 씀)이 CONTROLS-049의 이주 항목 목록으로 적는다. 소유자 결정이 필요한 공개 동작 변경이 아니므로 대기열에 올리지 않는다." (`reviews/round-305-closing.md:25`)
- 상태: 현행
- 출처: `adr/0003-group-namespace.md:137`(정본)
- 닫은 사람: 편집자 결정(10라운드, ADR 0003 5차 본문 `adr/0003-group-namespace.md:10`), 소유자 답(`reviews/round-15-decisions.md:9` 1)
- 라운드: 15
- 까닭: `adr/0003-group-namespace.md:137`

### CONTROLS-050 사라지는 것 — 평면 `&키` 축약, 판별식 자동 감지

- 결정:
  > - **사라진다:** 평면 `&키` 축약 전부. 분기의 `const`·`enum`을 판별식으로 자동 감지하는 것(`getExpressionFromSchema.ts:35-51`). 폼은 `oneOf`·`anyOf`로 분기를 고르지 않는다(P1′). 판별이 필요하면 작성자가 `controls.discriminator`나 분기별 `controls.active`를 적는다.
- 보충: 없음
- 상태: 현행
- 출처: `adr/0003-group-namespace.md:138`(정본)
- 닫은 사람: 소유자 답(`reviews/round-15-decisions.md:13` 5), 소유자 답(`reviews/round-12-owner-answers.md:9` 2 `&discriminator`), 소유자 답(`reviews/round-10-owner-answers.md:9` A-3)
- 라운드: 15
- 까닭: `adr/0003-group-namespace.md:138`

### CONTROLS-051 이주 항목 — 예약 층의 키와 렌더 계층 이름

- 결정:
  > - **이주 항목:** `computed` → `controls`(별칭 없음), `&X` → `controls.X`, `&if`·`computed.if` → 분기 객체의 `controls.active`, 판별식 자동 감지 → `controls.discriminator` 또는 분기별 `controls.active`, `&pristine`·맨 키 `pristine` → `controls.resetInteraction`, `injectTo` → `controls.injectTo`, 맨 키 `disabled`·`visible`·`active` → `controls.*`, 루트 스키마 키 다섯의 특수 처리 제거, 맨 키 `terminal`·`virtual`·`propertyKeys` → `options.*`, 맨 키 `formType`·`FormTypeInput`·`FormTypeInputProps`·`FormTypeRendererProps`·`errorMessages`와 `options`의 플러그인 자유 칸 → `presentation.*`, `options.trim`은 `options`에 남고 포커스 아웃 때 문자열 동작 행이 자른다(17라운드 소유자 답 R17-3), 자식의 식을 `controls.children`으로 옮길 때 `../x` → `./x`, 플러그인 키 `FormGroup`·`FormLabel`·`FormInput`·`FormError` → `FormTypeGroupRenderer`·`FormTypeLabelRenderer`·`FormTypeInputRenderer`·`FormTypeErrorRenderer`, Form 속성 `CustomFormTypeRenderer` → `FormTypeGroupRenderer`(같은 이름의 Form 속성 셋이 새로 생긴다), `ChildNodeComponentProps`와 `FormGroupProps`의 prop `FormTypeRenderer`(와 `OverridableFormTypeInputProps`의 Omit 목록) → `FormTypeGroupRenderer`.
- 보충:
  > 편집자 결정(216C-03): "【추론】 형은 런타임이 받는 것만 광고해야 하고, 런타임이 옛 키를 조용히 무시하는 것은 원장이 정한 "맨 키는 검증기로"의 결과이므로 형 삭제와 별개의 제품 질문이다." (`reviews/round-216-closing.md:42`)
  > 편집자 결정(216C-04): "【추론】 코어가 React를 모르는 채로 문맥을 적는 길이 있으면 제네릭을 늘리거나 any로 내리는 것보다 낫다. 런타임이 거부하는 자리에서 설정을 읽는 입력은 형 문제가 아니라 이주가 끝나지 않은 결함이고, 원장이 그 자리를 이미 정했으므로 바로 고친다." (`reviews/round-216-closing.md:57`)
- 상태: 현행
- 출처: `adr/0003-group-namespace.md:139`(정본), `08-design-a-to-z.md:130`, `03-mental-model.md:53`, `adr/0003-group-namespace.md:125`
- 닫은 사람: 소유자 답(`reviews/round-15-decisions.md:13` 5), 소유자 답(`reviews/round-15-decisions.md:21` 8), 소유자 답(`reviews/round-10-owner-answers.md:32` E-5), 소유자 답(`reviews/round-13-owner-answers.md:7` 1 잠금 규칙), 소유자 답(`reviews/round-17-owner-answers.md:11` R17-3)
- 라운드: 17
- 까닭: `adr/0003-group-namespace.md:139`

### CONTROLS-052 인라인 `FormTypeInput`의 암묵 터미널은 렌더 계층의 판정 함수로

- 결정:
  > 터미널 판정은 렌더 계층의 판정 함수로 옮겨 core는 React 구성 요소를 판정하지 않는다(17라운드 스웜 수렴(편집자 결정), 통보 1은 17라운드 소유자 답으로 허용).
- 보충:
  > "인라인 `FormTypeInput`을 꽂은 객체·배열 노드가 터미널이 되는 암묵 규칙은 소유자가 의도된 기능이라 한 것이므로(`00-goals.md`, ADR 0011 §3) 유지하되 렌더 계층의 기능으로 옮긴다." (`08-design-a-to-z.md:130`)
  > "렌더 계층(React 바인딩)이 노드 선언의 `presentation.FormTypeInput`이 있고 `null`이 아닌지를 보는 판정 함수를 청사진에 넘기고, 청사진은 한 노드의 터미널 전략을 `options.terminal`(명시, 양방향) → 넘겨받은 판정 → `type`의 순서로 정한다(§12)." (`08-design-a-to-z.md:130`)
  > "core는 `presentation`을 그룹 객체로 병합하고 검증기 앞에서 지울 뿐 그 안의 키를 읽지도 해석하지도 않으며(P5), core만 쓰는 호스트에는 암묵 규칙이 없다(17라운드 스웜 수렴(편집자 결정), 소유자 통보 1 허용)." (`08-design-a-to-z.md:130`)
- 상태: 현행
- 출처: `adr/0003-group-namespace.md:147#2`(정본), `08-design-a-to-z.md:130`, `adr/0003-group-namespace.md:30`
- 닫은 사람: 17라운드 스웜 수렴(편집자 결정, `adr/0003-group-namespace.md:147`), 소유자 답(`reviews/round-17-owner-answers.md:12` 통보 1), 소유자 답(`reviews/round-2.md:114` C3), 소유자 답(`00-goals.md:116` 터미널 전략)
- 라운드: 17
- 까닭: `reviews/round-2.md:114`
- 충돌:
  > `08-design-a-to-z.md:130`의 "청사진은 한 노드의 터미널 전략을 `options.terminal`(명시, 양방향) → 넘겨받은 판정 → `type`의 순서로 정한다(§12)"는 18라운드 결정과 다르다: 이 순서는 두 행을 가진 종류(object·array)에만 적용되고, 행이 하나인 종류는 전략을 그 행에서 정한다(NODE-047). 18라운드 결정이 이긴다(`reviews/round-18-closing.md:1035`).

### CONTROLS-053 비활성 대상에도 `injectTo`가 쓴다(잠복 원본), 대상이 켜져도 재발화하지 않음(D-28)

- 결정:
  > - **결론.** 쓴다(잠복 원본). 대상이 나중에 켜져도 원천이 바뀐 것이 아니므로 재발화하지 않는다.
  > - **왜.** `injectTo`는 호출자의 전체 교체와 같고(`03-mental-model.md` 43행), 전체 교체는 꺼진 조각의 노드까지 분배된다(ADR 0013 63행). 비활성화는 쓰기가 아니다. 이 규칙이면 독립 모델 N6의 네 경로가 모두 같은 값이 된다.
- 보충:
  > 편집자 결정(18C-14): "【추론】 형상에 없는(비활성) 대상은 오류가 아니며(ERROR-124) 잠복 원본에 쓴다(CONTROLS-053, WRITE-018과 같은 분배)." (`reviews/round-18-closing.md:402`)
  > 편집자 결정(18C-14): "【추론】 대상이 나중에 켜져도 다시 발화하지 않는다(CONTROLS-053은 현행이다)." (`reviews/round-18-closing.md:403`)
- 상태: 현행
- 출처: `06-conclusions.md:244-245`(정본), `reviews/round-18-closing.md:402-403`
- 닫은 사람: 편집자 결정(8라운드 D-28 편집자 판정, `06-conclusions.md:242`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-14)
- 라운드: 18
- 까닭: `06-conclusions.md:245`, `reviews/round-18-closing.md:416-423`

### CONTROLS-054 원천이 비활성이면 `injectTo`는 없음을 읽는다(D-34)

- 결정:
  > `injectTo`가 읽는 것은 원천의 방출 값이고(ADR 0007 79행), 비활성 노드는 방출에서 빠지므로(P4) 없음으로 읽는다.
- 보충: 없음
- 상태: 현행
- 출처: `06-conclusions.md:258#1`(정본)
- 닫은 사람: 편집자 결정(8라운드 D-34 편집자 판정, `06-conclusions.md:256`)
- 라운드: 8
- 까닭: `06-conclusions.md:258`

### CONTROLS-055 로드에서의 `injectTo` — `fire`(작성자가 위)를 고르고 `fill`·`skip`을 버림(D-27)

- 결정:
  > - **`fire` (작성자가 위).** 전체 교체는 모든 원천을 "없음에서 바뀐 것"으로 만들므로 `injectTo`가 모두 발화하고 `total`은 100이 된다. 서버가 준 90은 사라진다. 스키마가 진실이다. 초안 원리 아래의 도출이다. 4.3의 직전 커밋 규칙을 마운트에 문자 그대로 적용하면 이것이 나오고, 4라운드 명세 34행 "`reset()`은 `injectTo`를 일으킨다"와 현재 코드의 마운트 동작과 같다.
  > - **지워진 선택지.** `skip`(로드 때는 발화하지 않음)은 `{ source: 'A' }`만 로드했을 때 초기 복사조차 없어 원천이 다시 바뀔 때까지 대상이 빈다. 공개 문서가 `injectTo`의 용도를 "Initial copy, default seeding"이라 적고 오늘 코드도 마운트에서 원천의 `default`로 대상을 채우므로 G2(표현력은 줄지 않는다)에 걸린다. 이 탈락은 `injectTo`를 G2의 '동적 표현식 시스템'에 드는 것으로 읽는다는 전제에 선다. 리셋 전 이력과 비교하는 안은 P3에 걸린다. 마운트·노드 reset·`FormHandle.reset`에 서로 다른 규칙(현재 코드)은 G4에 걸린다.
  > - **원리가 말하는 것.** P2는 작성자를 정당한 쓰기 주체로 인정하므로 `fire`를 허용한다. "있는 값을 고치지 않는다"(`03-mental-model.md` 82행)는 코어 자신의 `default`에 대한 문장이지 작성자의 규칙에 대한 문장이 아니다. 그러나 허용과 선호는 다르다. 이것은 "스키마의 규칙이 진실인가, 받은 데이터가 진실인가"라는 제품의 가치다.
  > - **멱등성은 기준이 아니다.** `setValue(getValue())`가 모든 상태에서 멱등인 것은 `skip`뿐인데, 소유자가 이미 D-7에서 멱등을 버렸고(`default` 로드 계약도 같은 모양으로 비멱등이다), `skip`은 위에서 지워졌다.
- 보충: 없음
- 상태: 분할됨(→ CONTROLS-084, WRITE-090)
- 출처: `06-conclusions.md:268,270-272`(정본), `07-conclusions.md:245`
- 닫은 사람: 소유자 답(`reviews/round-10-owner-answers.md:19` D-6), 소유자 답(`reviews/round-18-owner-answers.md:26` 18C 검토 4번; 대체)
- 라운드: 18
- 까닭: `06-conclusions.md:271`

### CONTROLS-056 대체됨: 글로벌 > 로컬, 루트 스키마 키는 정의되면 `false`여도 덮음(10라운드 답 12)

- 결정:
  > 5.0의 12(글로벌 > 로컬, 루트 스키마 키는 정의되면 `false`여도 덮음)는 13라운드에 개정되었다.
- 보충: 없음
- 상태: 대체됨(→ CONTROLS-045)
- 출처: `07-conclusions.md:158#3`(정본), `reviews/round-10-owner-answers.md:12`, `07-conclusions.md:235`, `reviews/round-12-owner-answers.md:8`, `07-conclusions.md:166`
- 닫은 사람: 소유자 답(`reviews/round-13-owner-answers.md:7` 1 잠금 규칙)
- 라운드: 13
- 까닭: `reviews/round-13-owner-answers.md:7`

### CONTROLS-057 대체됨: 결합식에 조상들과 Form 속성이 든다(9라운드 4.26)

- 결정:
  > - `active = 존재(형상) ∧ 자기 ∧ 조상들 ∧ 조상의 &children 항목 ∧ 켜진 조각의 범위 제어`
  > - `readOnly = Form 속성 ∨ 표준 readOnly ∨ 노드 자신의 &readOnly ∨ 조상들 ∨ &children 항목 ∨ 켜진 조각의 범위 제어`
- 보충: 없음
- 상태: 대체됨(→ CONTROLS-045, CONTROLS-046)
- 출처: `07-conclusions.md:161-162`(정본)
- 닫은 사람: 소유자 답(`reviews/round-13-owner-answers.md:7` 1 잠금 규칙), 소유자 답(`reviews/round-10-owner-answers.md:25` E-13)
- 라운드: 13
- 까닭: `07-conclusions.md:158`

### CONTROLS-058 대체됨: `&readOnly`와 `control.readOnly`는 한 선언의 두 철자이고 `control`이 이김

- 결정:
  > `&readOnly`와 `control.readOnly`는 한 선언의 두 철자이므로 `control`이 이긴다(오늘 `computed`가 이기던 규칙).
- 보충: 없음
- 상태: 대체됨(→ CONTROLS-016)
- 출처: `07-conclusions.md:164#2`(정본)
- 닫은 사람: 소유자 답(`reviews/round-15-decisions.md:13` 5)
- 라운드: 15
- 까닭: `reviews/round-15-decisions.md:13`

### CONTROLS-059 대체됨: `computed`와 `&`의 동시 제공을 선호(축 9항)

- 결정:
  > 9. 기존 computed 와 &를 동시 제공하는건 일종의 선택지를 제공한 것이다. 제거해도 무방하나, 제공하는 방향을 선호한다.
- 보충: 없음
- 상태: 대체됨(→ CONTROLS-016)
- 출처: `reviews/round-9-spec.md:27`(정본), `adr/0003-group-namespace.md:3`
- 닫은 사람: 소유자 답(`reviews/round-15-decisions.md:13` 5)
- 라운드: 15
- 까닭: `reviews/round-15-decisions.md:13`

### CONTROLS-060 대체됨: 글로벌 설정식과 로컬 설정식의 동시 제공과 경합(축 10항)

- 결정:
  > 10. 글로벌 설정식과 로컬 설정식의 동시 제공 및 경합도 기존과 같이 제공하길 바란다.
- 보충: 없음
- 상태: 대체됨(→ CONTROLS-045)
- 출처: `reviews/round-9-spec.md:28`(정본), `adr/0003-group-namespace.md:3`
- 닫은 사람: 소유자 답(`reviews/round-13-owner-answers.md:7` 1 잠금 규칙)
- 라운드: 13
- 까닭: `reviews/round-13-owner-answers.md:7`

### CONTROLS-061 대체됨: 제어용 필드에만 `&`를 붙이고 나머지는 접두 없는 닫힌 목록(13라운드 답 3, 14라운드 O-9)

- 결정:
  > | 3 폼 전용 키 접두 | 이후 대화로 "나" 방향 확정. 다만, 제안했던 form 전용필드용 프리픽스는 매력적이나, 너무 난해해진다. 제어용 필드들에 대해서만 &를 붙이는 방향으로 가자. (대화: "FormTypeInputProps, FormTypeRendererProps, formType, FormTypeInput, terminal, errorMessages, 전부 &를 붙인다는건가? 그건 좀 과한거같은데") |
- 보충: 없음
- 상태: 대체됨(→ CONTROLS-009, CONTROLS-010, CONTROLS-011, CONTROLS-016)
- 출처: `reviews/round-13-owner-answers.md:9`(정본), `reviews/round-14-owner-answers.md:15`, `08-design-a-to-z.md:123`, `adr/0003-group-namespace.md:8`
- 닫은 사람: 소유자 답(`reviews/round-15-decisions.md:12` 4), 소유자 답(`reviews/round-15-decisions.md:13` 5)
- 라운드: 15
- 까닭: `reviews/round-15-decisions.md:12`

### CONTROLS-062 로컬 선언끼리의 결합에 대한 소유자 확인

- 결정:
  > - 로컬 선언끼리의 결합의 소유자 확인. 원장 §4는 노드 자신의 표준 `readOnly`, `controls.readOnly`, 켜진 조각의 범위 제어, 부모의 `controls.children` 항목이 겹치면 잠금(`readOnly`·`disabled`)은 하나라도 참이면 잠기고 표시(`active`·`visible`)는 모두 참이어야 켜진다고 정했다. 코어에 글로벌은 없고, Form 속성의 전체 잠금은 렌더 계층이 그 결과 위에 OR한다(13라운드 답 1). 편집자 판정이며 소유자 확인 대상이다(원장 §7).
- 보충:
  > 소유자(12라운드 §3 답, 두 문장 전문): "해당 조건은 중복 선언시(부모선언 + 자식노드 자체 선언) 이를 병합하는게 아니라 덮어쓰는걸 고려했다. 하지만 이를 or 조건이나 체인으로 엮을 수 있나? 말한대로 루프가 발생하면 form 을 터트리고 오류를 보여주면 된다. 이 기능은 설계를 요한다." (`reviews/round-12-owner-answers.md:11`)
  > 편집자 결정(18C-69): "그때 소유자의 답은 "좀 더 설명 필요. 이것만으론 이해가 잘 안된다. 글로벌이 덮을 수 있는건 readOnly / disabled 뿐이고, 나머지는 글로벌 선언과 무관하게 각자의 스콥에서만 동작하지 않나?"였다(`reviews/round-12-owner-answers.md:23`)." (`reviews/round-18-closing.md:1938`)
  > 편집자 결정(18C-69): "| `edit` | `true` | `false` OR `false` → 고칠 수 있다 | `true` AND `true` → 보인다 |" (`reviews/round-18-closing.md:1956`)
  > 편집자 결정(18C-69): "| `view` | `true` | `false` OR `true` → 잠긴다 | `true` AND `true` → 보인다 |" (`reviews/round-18-closing.md:1957`)
  > 편집자 결정(18C-69): "| `hidden` | `true` | `false` OR `false` | `true` AND `false` → 숨는다 |" (`reviews/round-18-closing.md:1958`)
  > 편집자 결정(18C-69): "| `edit` | `false` | `false` OR `false` | `false` AND `true` → 숨는다 |" (`reviews/round-18-closing.md:1959`)
  > 편집자 결정(18C-69): "자기 `readOnly: false`는 `view`의 잠금을 풀지 않는다." (`reviews/round-18-closing.md:1961`)
  > 편집자 결정(18C-69): "오늘은 순위 사슬이라 노드의 `readOnly: false`가 이긴다(`reviews/round-13-owner-review.md:26`)." (`reviews/round-18-closing.md:1962`)
  > 편집자 결정(18C-69): "이 변화의 이주 행은 이미 있다(LANDING-016 이주 13)." (`reviews/round-18-closing.md:1963`)
  > 편집자 결정(18C-69): "`<Form readOnly>`를 주면 렌더 계층이 위 결과에 OR하므로 모든 행이 잠긴다." (`reviews/round-18-closing.md:1964`)
  > 편집자 결정(18C-69): "앞의 두 문장은 둘 다 설계에 남는다." (`reviews/round-18-closing.md:1966`)
  > 편집자 결정(18C-69): "덮어쓰기(첫 문장)는 값을 쓰는 규칙에 남는다: 한 노드에는 값을 하나만 쓸 수 있으므로, 부모 선언과 자식 자신의 선언이 겹치면 세부가 이긴다(SETTLE-004, 나감 정책은 CONTROLS-040)." (`reviews/round-18-closing.md:1967`)
  > 편집자 결정(18C-69): "or로 엮기(둘째 문장)는 참인 동안 성립하는 상태 키에 남는다: 잠금은 OR로, 표시는 AND로 엮는다." (`reviews/round-18-closing.md:1968`)
- 상태: 대체됨(→ CONTROLS-082)
- 출처: `adr/0003-group-namespace.md:144`(정본), `02-target-overview.md:298`, `03-mental-model.md:227`, `reviews/round-12-owner-answers.md:23`, `reviews/round-18-closing.md:1922-1936`
- 닫은 사람: 편집자 결정(13라운드, 소유자 확인 대상으로 남김 `adr/0003-group-namespace.md:144`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-69)
- 라운드: 18
- 까닭: `03-mental-model.md:227`, `reviews/round-18-closing.md:1970-1976`
- 충돌:
  > `adr/0003-group-namespace.md:144`의 "편집자 판정이며 소유자 확인 대상이다(원장 §7)."는 18라운드 결정과 다르다: 18C-69의 편집자 결정(18라운드)으로 확정되어 소유자 확인을 기다리지 않는다. 18라운드 결정이 이긴다(`reviews/round-18-closing.md:1924`).

### CONTROLS-063 `controls.children`의 대상별 식과 값 키의 세부, 조각에서만 선언된 자식을 가리킬 수 있는가

- 결정:
  > `controls.children`의 대상별 식과 값 키의 세부, 조각에서만 선언된 자식을 `targets`로 가리킬 수 있는지(`03-mental-model.md` §6).
- 보충: 없음
- 상태: 대체됨(→ CONTROLS-073)
- 출처: `adr/0003-group-namespace.md:143#1`(정본), `02-target-overview.md:299`, `reviews/round-18-agenda.md:25`, `reviews/round-18-agenda.md:110`, `reviews/round-18-closing.md:270-297`
- 닫은 사람: 편집자 결정(17라운드, 18라운드 안건으로 이관), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-12)
- 라운드: 18
- 까닭: `reviews/round-18-agenda.md:25`, `reviews/round-18-closing.md:299-303`

### CONTROLS-064 조각 객체에 값 키를 둘 때의 세부

- 결정:
  > 조각 객체에 값 키(`unsetValue`, `default`, `resetInteraction`)를 둘 때의 세부도 같이 정한다.
- 보충: 없음
- 상태: 대체됨(→ CONTROLS-077)
- 출처: `adr/0003-group-namespace.md:143#2`(정본), `02-target-overview.md:299`, `reviews/round-18-agenda.md:110`, `reviews/round-18-closing.md:1704-1720`
- 닫은 사람: 편집자 결정(17라운드, 18라운드 안건으로 이관), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-60)
- 라운드: 18
- 까닭: `reviews/round-18-agenda.md:110`, `reviews/round-18-closing.md:1722-1724`

### CONTROLS-065 `virtualRequired`가 `required` 재작성과 함께 사라지는지 확인

- 결정:
  > - `virtualRequired`는 `options`의 키 목록에 없어 그룹 안에 둘 수 없다. 오늘 `required` 재작성이 만드는 키이므로(`transformCondition.ts:40-52`) 재작성을 버리면 함께 사라지는지 확인한다.
- 보충: 없음
- 상태: 대체됨(→ CONTROLS-078)
- 출처: `adr/0003-group-namespace.md:146`(정본), `reviews/round-12-owner-answers.md:16`, `reviews/round-18-closing.md:1982-1986`
- 닫은 사람: 편집자 결정(15라운드, ADR 0003 6차 본문 미결 `adr/0003-group-namespace.md:146`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-70)
- 라운드: 18
- 까닭: `reviews/round-12-owner-answers.md:16`, `reviews/round-18-closing.md:1988-1989`

### CONTROLS-066 스키마를 직렬화할 수 없다는 점과 core→`PluginManager`의 React 모듈 import 분리

- 결정:
  > 남는 것은 스키마를 직렬화할 수 없다는 점과, 오늘 core가 `ValidationManager` → `app/plugin`의 `PluginManager`를 거쳐 React 구성 요소 모듈을 런타임에 가져오는 import의 분리다(PR-4 전 설계 항목, `01-current-structure.md` §6) — `open-questions.md` Q8.
- 보충: 없음
- 상태: 분할됨(→ CONTROLS-075, CONTROLS-076)
- 출처: `adr/0003-group-namespace.md:147#3`(정본), `reviews/round-18-agenda.md:108`, `reviews/round-18-closing.md:1533-1544`
- 닫은 사람: 편집자 결정(17라운드, 18라운드 안건으로 이관), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-55)
- 라운드: 18
- 까닭: `reviews/round-18-agenda.md:108`, `reviews/round-18-closing.md:1546-1548`

### CONTROLS-067 `controls.injectTo` 함수의 `ctx` 인자와 반환 모양

- 결정:
  > - `controls.injectTo` 함수의 `ctx` 인자와 반환 모양의 세부는 식 언어 명세(원장 §6)에 걸려 있다.
- 보충:
  > 소유자(12라운드 §9 답): "동의. 이는 자칫 ealry return 과 혼동이 발생해서 문제가 있었다" (`reviews/round-12-owner-answers.md:20`)
- 상태: 대체됨(→ CONTROLS-079)
- 출처: `adr/0003-group-namespace.md:148`(정본), `reviews/round-18-agenda.md:34`, `03-mental-model.md:215`, `reviews/round-18-closing.md:382-414`
- 닫은 사람: 편집자 결정(17라운드, 18라운드 안건으로 이관), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-14), 소유자 답(`reviews/round-12-owner-answers.md:20` 12라운드 §9; 반환 `null`·`undefined`)
- 라운드: 18
- 까닭: `reviews/round-18-agenda.md:34`, `reviews/round-18-closing.md:416-423`

### CONTROLS-068 `controls` 식 언어의 명세 — 문법, 전역 이름, `@` 맥락, 경로가 읽는 값, 배열 색인

- 결정:
  > - `controls` 식 언어의 명세(슬라이스 1·2 전): 허용 문법과 전역 이름, `@` 맥락과 그 변경이 에지인지, `#`·`*` 표기, 경로가 읽는 값(원본인지 방출 값인지 투영 값인지 — 게이트는 투영 값), 비활성·없는 노드를 읽을 때의 값, `controls.injectTo`의 함수 형태와 `ctx` 인자, 배열 항목의 색인과 길이를 읽는 문법.
- 보충: 없음
- 상태: 분할됨(→ CONTROLS-080, CONTROLS-079)
- 출처: `03-mental-model.md:215`(정본), `08-design-a-to-z.md:488`, `08-design-a-to-z.md:489`, `reviews/round-18-agenda.md:32-35`, `reviews/round-18-closing.md:311-368`
- 닫은 사람: 편집자 결정(17라운드, 18라운드 안건으로 이관), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-13)
- 라운드: 18
- 까닭: `reviews/round-18-agenda.md:32-35`, `reviews/round-18-closing.md:370-376`

### CONTROLS-069 대체됨: `&active`는 값을 빼는 유일한 작성자 명령(6라운드 대조표)

- 결정:
  > | 키워드 | 현재 | 새 설계 | 변화 | 근거 |
  > | ------ | ---- | ------- | ---- | ---- |
  > | `&active` | `false`면 값 쓰기 불가 + 방출 제외 | 유지. 조각의 비활성화와 **같은 연산**이고, 값을 빼는 유일한 작성자 명령이다 | 유지 | `checkComputedOptionFactory.ts:22-26` / `adr/0003:25`, `03-mental-model.md:15` |
- 보충: 없음
- 상태: 대체됨(→ CONTROLS-021, CONTROLS-035)
- 출처: `05-before-after.md:37-38,40`(정본), `05-before-after.md:62`
- 닫은 사람: 소유자 답(`reviews/round-9-spec.md:48` 읽기2), 편집자 결정(10라운드, ADR 0003 5차 본문 `adr/0003-group-namespace.md:10`)
- 라운드: 10
- 까닭: `reviews/round-9-spec.md:48`, `adr/0003-group-namespace.md:95`

### CONTROLS-070 리프 노드의 잠금을 누가 집행하는가 — 오늘은 입력 컴포넌트 구현에 위임, 새 설계는 키의 유지만 적음

- 결정:
  > | 키워드 | 현재 | 새 설계 | 변화 | 근거 |
  > | ------ | ---- | ------- | ---- | ---- |
  > | `&readOnly`·`&disabled` | FormTypeInput 구현에 위임한다 | 유지 | 유지 | 동일 / `adr/0003:25` |
- 보충:
  > 편집자 결정(18C-71): "【추론】 잠금은 세 층이 나눠 맡는다." (`reviews/round-18-closing.md:1995`)
  > 편집자 결정(18C-71): "【추론】 (1) core는 노드의 잠금 상태만 계산한다." (`reviews/round-18-closing.md:1996`)
  > 편집자 결정(18C-71): "【추론】 쓰기를 거부하지 않으므로 공개 `setValue`와 자동 쓰기(`derived`·`injectTo`·채움)는 잠긴 노드에도 적용된다." (`reviews/round-18-closing.md:1997`)
  > 편집자 결정(18C-71): "【추론】 잠금은 값·형상·방출을 바꾸지 않는다." (`reviews/round-18-closing.md:1998`)
  > 편집자 결정(18C-71): "【추론】 (2) 렌더 계층은 실효 잠금(core의 잠금 OR Form 속성의 전체 잠금)을 입력 구성 요소의 `readOnly`·`disabled` prop으로 넘긴다." (`reviews/round-18-closing.md:1999`)
  > 편집자 결정(18C-71): "【추론】 실효 잠금이 켜진 동안에는 `handleChange`가 입력 쓰기를 버린다." (`reviews/round-18-closing.md:2000`)
  > 편집자 결정(18C-71): "【추론】 오늘은 노드의 잠금만 보고 버리므로(`src/components/SchemaNode/SchemaNodeInput/SchemaNodeInput.tsx:51`) 이 판단에 Form 속성의 잠금을 더한다." (`reviews/round-18-closing.md:2001`)
  > 편집자 결정(18C-71): "【추론】 (3) 잠긴 모양을 그리고 입력을 막는 것은 입력 구성 요소(`FormTypeInput`) 구현의 몫이다." (`reviews/round-18-closing.md:2002`)
  > 편집자 결정(18C-71): "【추론】 오늘과 같다." (`reviews/round-18-closing.md:2003`)
- 상태: 현행
- 출처: `05-before-after.md:37-38,42`(정본), `reviews/round-18-closing.md:1995-2004`
- 닫은 사람: 편집자 결정(6라운드, 새 설계 칸은 4차 본문이 적은 것 `05-before-after.md:7`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-71)
- 라운드: 18
- 까닭: `05-before-after.md:7`, `adr/0003-group-namespace.md:84`, `adr/0003-group-namespace.md:115`, `reviews/round-18-closing.md:2006-2008`

### CONTROLS-071 `FormTypeInputProps.alias`의 처분

- 결정:
  > | 키워드 | 현재 | 새 설계 | 변화 | 근거 |
  > | ------ | ---- | ------- | ---- | ---- |
  > | `FormTypeInputProps.alias` | 타입만 선언돼 있고 패키지 안에 소비처가 없다 — 외부 구현체용 패스스루 | 언급 없음 | **미확인** | `jsonSchema.ts:235` |
- 보충: 없음
- 상태: 대체됨(→ CONTROLS-081)
- 출처: `05-before-after.md:37-38,54`(정본), `05-before-after.md:66`, `05-before-after.md:214`, `reviews/round-18-closing.md:2014-2021`
- 닫은 사람: 편집자 결정(6라운드, 미확인으로 남김 `05-before-after.md:9`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-72)
- 라운드: 18
- 까닭: `05-before-after.md:9`, `reviews/round-18-closing.md:2023-2025`

### CONTROLS-072 `placeholder` 키가 어느 그룹에 드는가

- 결정:
  > | 키워드 | 현재 | 새 설계 | 변화 | 근거 |
  > | ------ | ---- | ------- | ---- | ---- |
  > | `placeholder`·`errorMessages` | `errorMessages`는 검증기에 넘기기 전 제거 대상이다. `placeholder`는 `types/jsonSchema.ts:233`에 선언돼 입력 컴포넌트가 소비한다 | 언급 없음 | **미확인** | `stripSchemaExtensions.ts:29-53` |
- 보충:
  > "`placeholder`는 오늘 최상위 키가 아니라 뺐습니다." (`reviews/round-14-owner-review.md:55`)
- 상태: 대체됨(→ CONTROLS-081)
- 출처: `05-before-after.md:37-38,56`(정본), `05-before-after.md:66`, `05-before-after.md:214`, `reviews/round-14-owner-review.md:55`, `adr/0003-group-namespace.md:125`, `reviews/round-18-closing.md:2014-2021`
- 닫은 사람: 편집자 결정(6라운드, 미확인으로 남김 `05-before-after.md:9`), 편집자 결정(14라운드, O-9 닫힌 목록에서 뺌 `reviews/round-14-owner-review.md:55`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-72; `errorMessages` 절반은 CONTROLS-051)
- 라운드: 18
- 까닭: `05-before-after.md:9`, `reviews/round-14-owner-review.md:55`, `reviews/round-18-closing.md:2023-2025`
- 충돌:
  > `adr/0003-group-namespace.md:125`의 "오늘 `stripSchemaExtensions`가 지우는 키는 `FormTypeInput`·`FormTypeInputProps`·`FormTypeRendererProps`·`errorMessages`·`options`·`injectTo` 여섯뿐이고 `&` 키·`computed`·`virtual`·`formType`·`terminal`·`placeholder`·`propertyKeys`는 검증기에 간다."는 `placeholder`를 맨 키로 적어 `reviews/round-14-owner-review.md:55`("오늘 최상위 키가 아니라")와 다르다. 오늘의 타입 선언은 `placeholder`를 `FormTypeInputProps` 안에 둔다(`05-before-after.md:56`의 `types/jsonSchema.ts:233`). 어느 쪽도 새 그룹 자리를 정하지 않았으므로 이 항목은 열림이다.

### CONTROLS-073 `controls.children` 항목 — 대상 해석, 청사진 오류, 형상 밖 대상, 항목 게이트 자리, 대상별 식, 값 키의 층, 상태 키는 로컬 결합

- 결정:
  > 【추론】 PR-1·PR-2가 쓰는 부분은 (1)–(5)이고, PR-6이 쓰는 부분은 (6)–(7)이다.
  > 【추론】 (1) 대상 해석: `targets`의 이름은 그 `children` 선언을 가진 호스트 청사진의 직계 자식 이름으로 푼다.
  > 【추론】 자식 이름은 본체와 모든 조각 선언의 합집합이고, 끌어올린 판별 키와 가상 이름을 포함한다.
  > 【추론】 조각에서만 선언된 자식도 가리킬 수 있다.
  > 【추론】 같은 이름에 종류가 다른 노드가 여럿이면 모두에 걸린다.
  > 【추론】 (2) 청사진 오류: 청사진에 없는 이름이거나, 호스트의 전략이 터미널이라 자식 노드가 없으면 청사진 오류다.
  > 【추론】 (3) 형상에 없는 대상: 청사진에 있으나 지금 형상에 없는 대상은 오류가 아니다.
  > 【추론】 그 항목은 대상이 형상에 있는 동안만 효력을 가진다.
  > 【추론】 항목 자신의 `controls.active`는 (4)의 게이트로서 호스트에서 평가되어 대상의 존재를 정하며, 이 문장의 대상이 아니다.
  > 【추론】 그래서 `controls.children` 대상이 형상에 없을 때의 코드는 생기지 않는다.
  > 【추론】 (4) 항목 게이트의 전순서 자리: 항목의 `controls.active`는 노드 게이트와 같은 장치이므로 노드 게이트의 자리 규칙을 따른다.
  > 【추론】 곧 그 `children` 선언을 담은 조각(본체면 본체) 바로 뒤, 그 조각의 노드 게이트들 다음에 항목 순서대로 든다.
  > 【추론】 (6) 대상별 식: 항목 `controls`의 식은 기준점이 호스트이고 항목마다 한 번 평가되어 모든 대상에 같은 값으로 걸린다.
  > 【추론】 대상마다 다른 식은 항목을 나눠 적는다.
  > 【추론】 (7) 값 키: 값 키(`default`, `derived`, `unsetValue`, `resetInteraction`, `unsetOnInactive`)는 각 대상 노드에 그 키를 적은 것처럼 동작하되 층은 `children` 항목 층이다.
  > 【추론】 같은 대상에서는 조각의 `controls` < `children` 항목 < 노드 자신이다.
  > 【추론】 같은 층이면 전순서에서 나중이 이기고 한 배열 안이면 뒤 항목이 이긴다.
  > 【추론】 다만 `unsetOnInactive`는 CONTROLS-040대로 같은 층에 여럿이면 하나라도 유지면 유지한다.
  > 【추론】 `derived`는 대상마다 같은 값을 쓴다.
  > 【추론】 상태 키는 층 순서가 아니라 로컬 결합을 따른다.
  > 【추론】 잠금(`readOnly`·`disabled`)은 하나라도 참이면 잠기고(OR), 표시(`active`·`visible`)는 모두 참이어야 켜진다(AND).
  > 【추론】 CONTROLS-046이 그대로다(18C-69).
- 보충:
  > 편집자 결정(18C-12, SETTLE-041로 나뉜 (5)): "【추론】 (5) 예산 셈: 호스트 바퀴와 전이 라운드 식의 '노드 게이트 수'는 `controls.active`를 가진 `children` 항목을 대상 수와 무관하게 항목마다 하나로 센다." (`reviews/round-18-closing.md:283`)
  > 편집자 결정(35C-11): "【추론】 CONTROLS-030은 `children`을 "부모가 이름으로 가리킨 직계 자식"에 거는 한 홉 장치로 적고 CONTROLS-073은 `targets`를 호스트 청사진의 직계 자식 이름으로 풀므로, 작성된 이름이 없는 배열 아이템(위치는 런타임이다)은 대상이 될 수 없다; 06은 위치 대상을 지원하지 않고 경고도 더하지 않으며, 배열 호스트의 `controls.children`은 02 청사진이 풀리지 않는 `targets`에 이미 하는 처리에 맡긴다. 그 처리가 없으면 뒤 라운드의 청사진 진단이지 배열 행의 경고가 아니다(새 경고 코드는 ERROR-164의 라운드다)." (`reviews/round-35-closing.md:90`)
  > 편집자 결정(384C-01): "【추론】 조각의 derive 규칙은 조각이 켜진 동안 그 조각이 직접 선언한 배열 아이템 모두에 닿는다. 규칙 표는 공유 소유 판정으로 객체 속성 항목에 더해 한 스키마 items·additionalItems의 반복 템플릿(별표 이름)과 튜플·prefixItems의 색인 자리를 대상으로 잡고, 런타임 대상 해석은 반복 템플릿이면 현재 형상의 살아 있는 아이템 전부를, 색인 자리면 그 이름의 자식 하나를 돌려주며 조각 층이면 선택된 선언 ID로 거른다. 식은 호스트에서 라운드마다 한 번 평가한 값을 모든 대상이 함께 쓰고, 쓰기 후보·에지·소비 값은 대상 경로와 정체를 넣은 키로 아이템마다 따로 둔다 — 그래서 아이템이 생기거나 되살아나면 그 아이템만 에지를 밟고, 이름이 바뀐 아이템은 옛 에지를 물려받지 않으며, 같은 대상에 겹치는 쓰기는 ADR 0003 §6의 순위(뒤 조각이 앞 조각을, 아이템 자신의 층이 조각 층을, unsetValue가 derived를 이김)를 그대로 따른다. 라운드 상한 25는 라운드 수의 상한이라 대상 수와 무관하고, 상호작용 초기화의 대상 수집은 집합으로 아이템 수에 비례한다. 조각의 injectTo는 청사진 오류라 대상이 아니다." (`reviews/round-384-closing.md:8`)
  > 편집자 결정(403C-01): "【추론】 PR #416을 fde6ab359로 squash 병합했다(커밋 80aa09947 DETAIL, d9ca55595 코드·시험, 9b2ca7af3 마무리). 비효율 하나: 나감 정책에 묶인 조각이 켜진 채 다른 잎을 쓰는 평상시 쓰기마다 commitExitPolicyValues가 자식마다 getControlLayers로 제어 층 전체를 모아 그 조각의 소유 자식인지 찾았고, 이 비용은 조각 수에 초선형이었다. 바뀐 규칙 한 문장: 선택된 선언(없으면 직전 커밋의 선택, 그것도 없으면 선언 전부)과 선언 자식의 소유 경로로 "이 조각의 첫 소유 자식인가"만 직접 판정하고, 전체 정책 층 수집·평가, 정책 우선순위, 같은 층 keep 우선, 직전 커밋 나감 의미는 그대로 둔다(CONTROLS-077, CONTROLS-073(7), WRITE-032, NODE-044). 캐시와 전역 상태는 없고 공개 API는 불변이다. 효과(Node v26.12.0·Bun 1.4.3, 두 바퀴 중앙값, 작업 폴더 dist 전후): 평상시 쓰기 F=64·C=16 Node 3.522→1.134 ms(−67.8%), Bun 16.575→1.412 ms(−91.5%); 실제 나감 쓰기는 바뀌지 않았고 Node 나감 F=64의 +8.8%는 측정 문서가 적은 나감 행 범위(−12.4%~+8.8%) 안이다. 계측: plain F=64 control의 getControlLayers 572→18회, exit 78→78회, 그중 commitExitPolicyValues 호출자 몫 3→3회. 정방향·역방향 각각 72장면·323단계 배달 비교 차이 0. 새 시험은 수정 전 구현에서 572회 상한으로 실패함을 확인했고 기존 시험의 기대값 변경은 0건이다. 결정 58의 입구 수치(F=64 평상시 쓰기 3.38 ms 중 2.34 ms, Node)는 이 병합으로 대부분 사라졌으므로 58 실험은 남은 비용(약 1.1 ms)을 기준으로 다시 잰다. 388라운드 허용 범위의 실험이며 소유자가 되돌릴 수 있다." (`reviews/round-403-closing.md:8`)
  > 편집자 결정(462C-04): "【추론】 위 18행에서 소유자가 "FieldInput의 useEffect cleanup으로 값을 조작하는 방법은 아예 안 되겠네"를 확인하고 비활성화 과정에 매크로태스크 하나만큼 쓰기 창을 여는 안을 물었다. React의 cleanup 시점이 매크로태스크 경계와 맞물린다는 보장이 없고(자동 배칭·transition·Suspense) 유예창 안의 쓰기는 방금 뗀 쓰기 주소 장치를 타이머로 되살리는 것이라 기각하고, 선언 키 하나와 동기 콜백 하나를 제안해 소유자가 둘 다 진행하게 했다("내가 가끔 겪는 요구사항이야"). 리뷰에서 위 19행으로 이름을 `inactive` 어휘로 통일했고(훅 `onDeactivate` → `onInactive`), 문자열 노드에서 식과 리터럴을 가를 수 없음을 소유자가 짚어 `injectTo`처럼 함수형으로 갔으며, 위 20행으로 "같은 함수 인터페이스"를 조건으로 채택했고, 함수를 받게 된 뒤에도 값이 본질이고 `setValue(value | updater)`의 선례가 있어 키 이름은 `inactiveValue`로 두었다. 계약(`plan/branch-switch/exit-value.md`): 인터페이스 하나 `(value, context) => unknown`(`value`는 직전 커밋 값, `context`는 `InjectToContext`와 같은 묶음을 직전 커밋 스냅샷으로, `undefined`는 바꾸지 않음, 의존 추적 없음); `controls.inactiveValue`는 리터럴 또는 이 함수(허용 위치는 `unsetOnInactive`와 같고 식 컴파일 목록에는 넣지 않음); `node.onInactive(listener)`는 `subscribe`와 나란한 멤버로 인스턴스에 묶임; 두 함수 안의 쓰기는 무시와 개발 경고(정착 중 쓰기를 막는 가드가 지금 없어 중첩 정착을 열지 않기 위함), 예외는 정착을 깨지 않음; 게이트 나감에만 불리고 폼 언마운트·아이템 삭제·소멸 인스턴스에는 불리지 않음; 우선순위는 콜백 > 키, 자손 경로 > 조상 결과; 삽입 지점은 `finalizeExits`의 `retainExitedSlot` 뒤; 공개 선언은 멤버 하나·형 셋·키 하나·경고 멤버 둘. 순서는 B11 → B12 → B9-0 재개 → B9-1~3 → B10 → 설계 Ⅳ 검토이며, B12는 codex 워커에 위임했고 B9-0는 같은 머리 위에서 병행하되 창은 코디네이터 허가로 하나씩 연다." (`reviews/round-462-closing.md:14`)
- 상태: 현행
- 출처: `reviews/round-18-closing.md:270-275,277-282,288-297`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-12)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:299-303`

### CONTROLS-074 틀린 형의 값을 게이트와 식이 볼 때 — 폼은 값을 가르지 않고, 식이 던지면 식 실패

- 결정:
  > 【추론】 (3) 틀린 형을 게이트와 식이 볼 때, 폼은 값을 가르지 않는다.
  > 【추론】 게이트와 식은 형이 틀린 값을 거르지 않은 방출 트리 하나를 읽되(18C-13 (5)), 객체가 아닌 원본을 든 객체 호스트 자신의 게이트 입력은 FRAGMENT-016대로 `{}`다.
  > 【추론】 `if` 게이트의 판정(수 아닌 값에 `minimum`이 참)은 검증기의 JSON Schema 의미이며 폼이 바꾸지 않는다.
  > 【추론】 작성자 안내에 "`if` 서브스키마에 `type`을 함께 적는다"를 넣는다.
  > 【추론】 `controls` 식이 틀린 형에서 던지면 이미 정한 대로 `EXPRESSION_THREW`, `degraded`, 제출 거부가 된다.
  > 【추론】 검증기 유무와 무관하다(R17-1).
  > 【추론】 식 언어 명세(18C-13)에 "식은 형이 틀린 값을 만날 수 있고, 던지면 식 실패다. `typeof`로 지킨다"를 적는다.
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-18-closing.md:1116-1122`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-40)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:1134-1141`

### CONTROLS-075 core는 `app/plugin`을 가져오지 않는다 — 검증기는 바인딩이 골라 인자로, PR-4 경계 린트는 새 fractal, PR-7에 `src/core/**` 전체

- 결정:
  > 【추론】 (1) core는 `app/plugin`을 가져오지 않는다.
  > 【추론】 검증기는 18C-54의 순서로 바인딩 계층이 골라 트리 생성 인자로 넘긴다.
  > 【추론】 보고기·터미널 판정 함수가 이미 쓰는 통로와 같다.
  > 【추론】 core만 쓰는 호스트는 `nodeFromJSONSchema`의 선택 인자로 직접 넘긴다(오늘도 있다, `src/core/nodeFromJSONSchema.ts:23`).
  > 【추론】 `PluginManager`의 검증기 칸은 바인딩 계층이 읽는 등록소로 남는다.
  > 【추론】 PR-4의 경계 린트는 새 fractal(`src/core/{blueprint,record,behaviors,navigation,settle,dispatch,validation,SchemaNode}/**`)에 건다.
  > 【추론】 `src/core/**` 전체로 넓히는 것은 PR-7이다.
  > 【추론】 타입 쪽 의존은 GOAL-088(18C-76)에서 다룬다.
- 보충:
  > 편집자 결정(70C-01): "【추론】 서명은 `nodeFromJSONSchema<Schema extends JSONSchema>(props: { jsonSchema: Schema; defaultValue?: InferValueType<Schema>; validator?: Validator; validationMode?: ValidationMode; context?: Dictionary; onChange?: (value: InferValueType<Schema> | undefined) => void; onStateChange?: () => void; errorReporter?: FormErrorReporter; unsetOnInactive?: boolean; disableAutomaticWrites?: boolean; isTerminal?: (schema: JSONSchema) => boolean | undefined; isAtomic?: (value: unknown) => boolean; deferMountValidation?: boolean }): InferSchemaNode<Schema>`이고 돌려주는 것은 마운트가 끝난 루트다. 칸마다 근거가 있다: `validator`는 함수 `validatorFactory`가 `{ compile, compileGuard, … }` 객체로 바뀌는 32C-01과 같은 방향이며 형은 새 엔진 쪽 `core/validation/type.ts`의 `Validator`다(공개 index가 아닌 모듈에서 내보냄, 32C-01); `context`는 옛 `contextNode`(`contextNodeFactory`의 노드)를 값으로 바꾼 것으로 `SchemaNode/`의 `setContext`가 받는 값이다; `errorReporter`는 05가 core 인자로 둔 보고기(`report`·`hasConsumer`, LANDING-064 PR-4 행)이고 `isTerminal`·`isAtomic`은 REACT-003이 렌더 계층이 넘긴다고 한 판정 둘이며 core만 쓰는 호스트가 주지 않으면 판정이 없다; `deferMountValidation`은 69C-05의 미룸 선택으로 기본은 꺼짐이라 켜지 않은 호출은 오늘대로 사슬 끝에서 검증을 요청한다. 안에서는 69C-01의 바인딩 전용 통로 가운데 "트리 생성(마운트 없음)"과 "마운트"를 차례로 부르고, `<Form>`은 첫 마운트에서 이 함수를(`deferMountValidation: true`, 버퍼형 보고기) 부르며 재생성 reset은 같은 트리 생성 통로 → 인계 → 마운트를 부르므로 두 경로가 같은 생성 함수를 지난다 — VALIDATE-010 "직접 부르는 경로와 `<Form>` 경로가 같은 계약"의 구현이다." (`reviews/round-70-closing.md:9`)
- 상태: 현행
- 출처: `reviews/round-18-closing.md:1533-1540`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-55)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:1546-1548`

### CONTROLS-076 인라인 구성 요소를 담은 스키마의 직렬화 장치는 두지 않는다

- 결정:
  > 【추론】 (2) 인라인 구성 요소를 담은 스키마는 직렬화할 수 없고, 이를 풀 장치를 두지 않는다.
  > 【추론】 직렬화할 수 있는 길은 `presentation.formType`과 `formTypeInputMap`·`formTypeInputDefinitions`다.
  > 【추론】 core는 스키마를 직렬화하지 않는다.
  > 【추론】 사본은 `presentation`을 지우고(VALIDATE-004), 같은 스키마 비교는 JSON 밖 칸을 참조로 본다(LANDING-039).
- 보충: 없음
- 상태: 현행(부정 결정)
- 출처: `reviews/round-18-closing.md:1541-1544`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-55)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:1546-1548`

### CONTROLS-077 조각 `controls`의 허용 키는 `children` 항목 목록과 같다 — 값 키는 조각이 선언한 직계 자식마다 조각 층으로

- 결정:
  > 【추론】 조각 객체(`allOf` 항목, 분기, `then`/`else`)의 `controls`에 둘 수 있는 키는 `controls.children` 항목의 닫힌 목록과 같다: `active` `visible` `readOnly` `disabled` `default` `derived` `unsetValue` `resetInteraction` `unsetOnInactive`.
  > 【추론】 `active`는 조각 게이트이고, 나머지는 조각 범위 제어다.
  > 【추론】 `children`·`injectTo`·`discriminator`·`watch`는 청사진 오류다.
  > 【추론】 값 키는 조각이 켜져 있는 동안, 그 조각이 직접 선언한 호스트의 직계 자식마다 따로 걸린다.
  > 【추론】 각 대상에게는 조각 층의 선언으로 작용하며, 같은 값이나 같은 식이 대상 모두에 쓰인다.
  > 【추론】 식의 기준점은 호스트다.
  > 【추론】 `default`는 켜진 조각의 대상 노드가 생길 때 채움 원천이 된다.
  > 【추론】 그 순위는 노드 자신의 `controls.default` > `children` 항목 > 조각의 `controls.default` > 표준 `default`(유효 스키마) > 없음이다.
  > 【추론】 같은 층이면 조각 전순서에서 나중이 이긴다.
  > 【추론】 대상마다 다른 기본값은 조각 안의 자식 선언에 적는다.
  > 【추론】 `unsetValue`는 식 하나가 거짓→참이 되는 에지에서 대상 모두를 없음으로 만든다.
  > 【추론】 로드에서는 로드된 값으로 평가한다.
  > 【추론】 생긴 대상 노드에서 참이면 채우지 않는다.
  > 【추론】 `resetInteraction`은 식이 참이 되면 대상 모두의 `dirty`·`touched`를 비운다(커밋 단계).
  > 【추론】 같은 대상에 여러 자동 쓰기가 겹치면 ADR 0003 §6의 순위와 층을 그대로 따른다.
  > 【추론】 조각이 켜지고 꺼지는 순간의 에지 기준은 18C-51을 따른다.
  > 【추론】 새 오류 코드는 없다(기존 청사진 오류의 모르는 키 부류).
- 보충:
  > 편집자 결정(29C-04): "【추론】 조각 객체의 `controls`에 둘 수 있는 키는 CONTROLS-077의 닫힌 목록(`active` `visible` `readOnly` `disabled` `default` `derived` `unsetValue` `resetInteraction` `unsetOnInactive`)이고 `injectTo`는 청사진 오류다; `controls.children` 항목의 안쪽 `controls`도 같다(CONTROLS-030)." (`reviews/round-29-closing.md:45`)
  > 편집자 결정(29C-04): "【추론】 FRAGMENT-050의 "조각의 `controls`에 둔 에지 규칙(`unsetValue`·`derived`·`resetInteraction`·`injectTo`)"에서 `injectTo`는 18C-51이 지나가며 적은 열거이며, 같은 18라운드의 뒤 블록 18C-60이 허용 키 집합을 명시적으로 닫았으므로 CONTROLS-077이 이긴다; 조각 층의 에지 규칙은 `unsetValue`·`derived`·`resetInteraction` 셋으로 읽는다." (`reviews/round-29-closing.md:46`)
  > 편집자 결정(29C-04): "【추론】 02(PR-1) 청사진이 조각과 `controls.children` 항목의 `controls`에 `injectTo`를 모르는 키로 거부하는 것(`src/core/blueprint/utils/diagnostics/validateControlGroups.ts:27-46,95-113`의 키 목록과 모르는 키 거부, 조각 여부는 `src/core/blueprint/utils/diagnostics/collectDeclarations.ts:30-35,89`)은 원장과 맞으며 고칠 것이 없다." (`reviews/round-29-closing.md:48`)
  > 소유자(373라운드, 배열 조각의 controls가 한 스키마 items 아이템에 걸리지 않는 것은 결함이며 수정한다): "아. 그렇네 완전 결함이군. \n너희 판단이 맞아. 수정이 필요하다" (`reviews/round-373-owner-answers.md:7`)
  > 편집자 결정(376C-02): "【추론】 조각이 items·additionalItems·prefixItems로 선언한 아이템도 그 조각이 직접 선언한 호스트의 직계 자식이다(373라운드 소유자 답). 따라서 조각의 값 키(default·unsetValue·unsetOnInactive·derived·resetInteraction)와 상태 키는 한 스키마 items·additionalItems 아이템과 튜플 자리에 모두 아이템마다 따로 걸리고, 식은 호스트에서 한 번 평가해 같은 값을 아이템 모두에 쓴다. 조각의 injectTo는 청사진 오류라 대상이 아니다(29C-04). 소유 판정은 선언 경로가 /properties/·/prefixItems/ 뒤에 오거나 /items·/additionalItems로 끝나거나 그 뒤에 /가 오는 조각 경로를 소유자로 보는 도우미 하나로 getControlLayers·buildFeatureNodeIndex·getDeriveRuleTable이 함께 한다. 구현 누락은 둘로 나눠 고친다: 값·상태 키(items 조각 층 PR)와 파생 규칙 표(규칙 대상을 이름으로 하나만 돌려주는 getRuleTargets와 그 호출부를 아이템 전체로 넓히는 별도 PR). 결정 대기열 60은 소유자 물음이 아니라 이 보충으로 답이 난 결함이라 닫는다(fairy08의 읽기 전용 대조). 라운드 상한 25(SETTLE-004)는 그대로다." (`reviews/round-376-closing.md:10`)
  > 편집자 결정(377C-01): "【추론】 선언 경로가 어느 조각에 속하는지는 engine의 utils/controls에 둔 도우미 하나(getFragmentOwnerPaths)가 정하고, blueprint의 buildFeatureNodeIndex·settle의 getControlLayers·derive의 getDeriveRuleTable 세 호출부가 같은 판정을 쓴다. 세 사용자가 engine의 서로 다른 자식 fractal이라 가장 낮은 공통 fractal은 engine이고, 기관은 공통 조상이 될 수 없으며, 도우미는 문자열만 받아 자식의 형을 가져오지 않는다. 판정은 선언 경로가 조각 경로 뒤에 /properties/·/prefixItems/로 이어지거나 /items·/additionalItems로 이어지고 그 뒤가 끝이거나 /인 경우이며, 키워드와 같은 이름의 속성이 만드는 키워드 그릇 경로 후보는 선언 경로가 될 수 없어 호출부의 실제 자식 포함 판정에서 걸러지므로 옛 접두 판정과 동치다. 이로써 조각이 items·additionalItems로 선언한 아이템은 상태 키 색인에 별표 자리로, prefixItems와 옛 튜플 items 자리는 색인 이름으로 들고, 아이템마다 그 조각의 default·unsetOnInactive·상태 키를 조각 층으로 받으며, 조각이 꺼져 아이템이 나갈 때는 그 조각의 unsetOnInactive가 Form 정책보다 앞선다(WRITE-032). 조각 derive 규칙은 getDeriveRuleTable이 대상 후보를 객체 속성 항목에 한정하므로 아직 아이템에 닿지 않고 376C-02의 별도 PR이 고친다." (`reviews/round-377-closing.md:8`)
  > 편집자 결정(384C-01): "【추론】 조각의 derive 규칙은 조각이 켜진 동안 그 조각이 직접 선언한 배열 아이템 모두에 닿는다. 규칙 표는 공유 소유 판정으로 객체 속성 항목에 더해 한 스키마 items·additionalItems의 반복 템플릿(별표 이름)과 튜플·prefixItems의 색인 자리를 대상으로 잡고, 런타임 대상 해석은 반복 템플릿이면 현재 형상의 살아 있는 아이템 전부를, 색인 자리면 그 이름의 자식 하나를 돌려주며 조각 층이면 선택된 선언 ID로 거른다. 식은 호스트에서 라운드마다 한 번 평가한 값을 모든 대상이 함께 쓰고, 쓰기 후보·에지·소비 값은 대상 경로와 정체를 넣은 키로 아이템마다 따로 둔다 — 그래서 아이템이 생기거나 되살아나면 그 아이템만 에지를 밟고, 이름이 바뀐 아이템은 옛 에지를 물려받지 않으며, 같은 대상에 겹치는 쓰기는 ADR 0003 §6의 순위(뒤 조각이 앞 조각을, 아이템 자신의 층이 조각 층을, unsetValue가 derived를 이김)를 그대로 따른다. 라운드 상한 25는 라운드 수의 상한이라 대상 수와 무관하고, 상호작용 초기화의 대상 수집은 집합으로 아이템 수에 비례한다. 조각의 injectTo는 청사진 오류라 대상이 아니다." (`reviews/round-384-closing.md:8`)
  > 편집자 결정(386C-01): "【추론】 P1: 게이트가 있는 선택에서도 이탈 대기 맵이 비어 있으면 `selectChildren`의 비활성 항목과 `primeHost`의 baseline 항목은 경로 키를 만들지 않고 조회·삭제도 하지 않는다. 맵이 비어 있지 않으면 이전 경로 그대로다. 지우는 비효율은 oneOf-20 갱신당 330회·마운트당 288회의 빈 조회용 문자열 생성이고, 측정은 잡음 안(−0.5%·−0.1%)이며 예측과 같다. `primeHost`의 조회는 지연된 SharedNodeConflict 정착에서만 자연 적중하고 그 정착은 오류로 끝나므로, 조회를 지우지 않고 합성 시험으로 조회 계약만 확인한다. P-08: 조각 소유는 호출마다 선택된 선언의 소유 경로 집합 하나를 지연 생성해 집합 조회로 판정한다(`getControlLayers`), `buildFeatureNodeIndex`는 호스트마다 자식별 소유 집합을 첫 해당 조각에서 만든다. 호출을 넘는 캐시는 없고 층·그룹·자식 순서는 그대로다. 조각 F=128 쓰기는 Node 1,936 → 315 µs(−84%), 배가 비 2.05·2.72·3.46 → 1.27·1.55·1.81로 작업량이 선형이 됐다. 원칙은 바꾸지 않았다: 정착 단계 순서(SETTLE-001), 고정된 비게이트 시작과 라운드마다 모든 게이트(SETTLE-018·SETTLE-020), 위치 정체성(NODE-051), 게이트 전부 평가(BLUEPRINT-007), 배달 계약, 공개 API 94." (`reviews/round-386-closing.md:8`)
  > 편집자 결정(389C-03): "【추론】 F1: 선택 루프의 자식 재사용과 비활성 간선 삭제, 이탈 대기 키와 잠복 원본 키, `captureExitedRaw`·`hasLivePathKind`·`getLatentOrder`가 `kind` 문자열로 종류를 비교해 서로 다른 union fold가 뭉치므로, 뒤 간선만 켠 값으로 마운트하면 호스트 바퀴 예산 초과로 끝나고 뒤 간선이 살아 있다가 앞 간선이 켜지면 생존 노드가 앞선 종류가 아니다(BLUEPRINT-043 (2)·FRAGMENT-049 위반). 고침은 kind 비교·키 자리 전부를 먼저 분류한 뒤(정체 용도는 정착을 넘어 안정한 청사진 노드 정체로, 행 선택·터미널 판정 같은 범주 용도는 그대로) 자리 묶음마다 커밋 하나로 하며, union이 아닌 종류의 관측 동작은 불변이다. 측정 묶음보다 앞선다. F2: 배열 아이템은 첫 fold의 템플릿만 연결해 게이트 조각 둘이 `items`를 다른 타입으로 나누고 뒤 fold만 켜지면 아이템이 오류 없이 사라진다. 배열 아이템(`items`·`additionalItems`·`prefixItems`)은 조각의 직계 자식이므로(376C-02·377C-01) BLUEPRINT-011·044 S5의 "같은 이름 다른 종류는 종류별 노드, 동시에 켜지면 충돌"이 아이템 이름에도 적용된다. 범위가 커서 영향 범위 조사(fairy08, 읽기 전용) 뒤 설계를 정하고 별도 PR로 한다." (`reviews/round-389-closing.md:12`)
  > 편집자 결정(391C-01): "【추론】 배열 아이템(`items`·`additionalItems`·`prefixItems`)은 조각의 직계 자식이므로(376C-02·377C-01) 같은 이름 다른 종류의 규칙이 아이템 이름(반복 템플릿의 별표, 튜플의 색인)에도 적용된다: 청사진은 fold마다의 아이템 후보를 문서 순서로 두되 후보 목록은 fold가 여럿일 때만 만들고, 첫 후보 필드는 단일 후보 소비자를 위해 남긴다(두 필드의 문서 주석이 "첫 후보이며 fold를 구분하는 경로는 후보 목록을 쓴다"고 적어 이름 함정을 막는다). 정착은 켜진 후보가 하나면 그 종류의 아이템 노드를 두고, 같은 자리의 다른 fold가 동시에 켜지면 `SHARED_NODE_CONFLICT`이며 앞선 종류가 산다(FRAGMENT-049). 후보가 여럿이고 선택 전이면 입력을 첫 후보로 해석하지 않고 보존하며, 분배는 기존 규칙대로 첫 종류에 한다. 배열 호스트의 이탈·복원도 객체 자식처럼 경로·정체 토큰별 잠복 열쇠를 남기고 같은 후보만 복원한다 — 복원한 통째 배열이 그 자리로 재분배되지 않도록 분배 기록의 선택 필드가 보존 자리를 들며, 그 필드는 다중 후보 호스트의 복원에만 생기고 뒤따르는 새 쓰기(같은 자리·통째·동사·reset·스냅숏 로드)를 막지 않는다. 지름길(push·pop·꼬리·splice)과 정적 첫 로드의 자격은 "후보 하나"일 때로 유지하므로 단일 후보 호스트의 동작과 비용은 그대로다(L1b 계약). 파생 규칙표는 후보마다 대상 행을, 빈 자리 UI의 종류 추정은 켜진 후보의 종류를 쓴다." (`reviews/round-391-closing.md:8`)
  > 편집자 결정(400C-01): "【추론】 터미널 모드(options.terminal)는 느리지 않다: 객체 1000키 마운트 Node −90%·Bun −64%, 배열 8천 마운트 거의 0으로 0.16.1보다 빠르다. 느린 것은 표시 없이 하위 선언이 없는 호스트(자식 0개 브랜치)이며 원인은 모든 키가 선언 밖 값이 되어 키마다 복사(계측 비율 37%)와 재조립(47%)되는 것이다. 0.16.1은 items 없는 배열 스키마를 거부하므로 그 모양의 옛 판 수치는 없다. 결함 수정 셋(F2·F3·394C-02)은 배열 동사 비용을 바꾸지 않았다(수정 전 대비 모든 행 −7%~+6%). 다음 구현 묶음 L3의 수용 가설은 다섯이고 각각 지우는 비효율 하나를 이름 지었다(370라운드): (a) 선언 밖 키마다 defineProperty를 일반 대입으로(writeObjectKey, __proto__ 보호는 코드에만 있으므로 그 불변을 시험으로 고정하고 원장 보충으로 적음); (b) items 없는 배열의 push·insert(N) 지름길 — 선언 밖 값뿐인 배열의 덧붙임이 모든 칸을 걷는 O(N) 접두 증명·재사용 검사를 없앰(자격 배제 목록 그대로, prefixItems 튜플 뒤 꼬리 제외, 새 빈 children 참조·UpdateChildren·revision 유지, 전체 배달 비교); (c) nextExtras 끝의 sameValue가 markWrite의 비교와 중복인 두 번 비교 제거(Merge 길 동일성 확인이 선행 조건); (d) 이미 해석된 자식에 staticSpec을 다시 조회하지 않고 넘김(all-keys 격차의 2.75%); (e) 게이트 조각이 있는 폼의 평상시 쓰기가 나감 정책 의존 판정마다 조각별 전체 통제 층을 만든 뒤 소유 하나를 찾는 것을 직접 소유 판정으로(조각 수에 초선형, F=64에서 Node 3.38→1.05 ms·Bun 16.6→1.36 ms, 72장면·323단계 차등 0, 정책 평가·층 순서 불변, 캐시 없음; 결정 58의 입구 수치 3.38 ms 중 2.34 ms). 가설마다 커밋 하나, PR 하나(대기열 56), 검증은 agy high(397라운드). 증명 먼저 후보(비효율로 이름 짓기 전 증명 필요, 지금 쪼개지 않음): all-keys 격차 중 DETAIL 설계 기록만 근거인 알고리즘 몫(커밋 후보 루프, 커밋마다 RevisionLedger 생성, dirty 색인 반복), (c) 다섯(없는 misfit 경로 삭제, 빈 commitGlobalState 방문, hasDistributedChildInput 재검사, effectiveType 재검사, keepsHostKeys 훑기), 빈 상호작용 상태 공유(노드당 56 B, 정체성 비교·제자리 변경 부재 증명 선행). 수용 후보(M3 때 현재 수치로 소유자 수용 목록): all-keys 격차 중 원장 계약 몫(SETTLE-001·002·003, 노드별 revision·EVENT 배달), 선언 밖 값의 불변 사본·순서 보관이 요구하는 키 수 비례 복사·재조립(VALUE-002, SETTLE-042·043), 터미널 객체 한 키 변경의 첫 다른 키 위치 비례 비교(두 판 같은 방향), 노드 레코드 376 B(NODE-018 추정 210~260 B 초과, NODE-055 판정은 하지 않음), 청사진 스키마 노드당 약 1,820~1,830 B와 폼 하나 기준 트리+청사진 메모리 0.16.1 대비 약 5분의 1 증가(398라운드 소유자 판단으로 청사진 공유는 지금 하지 않음). 폐기: 선언 밖 값 입력 재사용(Merge에서 이전 값 상실, 호출자 객체 변조가 폼 값에 전파, 396라운드 예측 가능성 원칙 위반). 기록만: items 없는 배열 remove(0)의 extras 인식 splice(범위 밖), 빈 배열→빈 배열의 새 children 참조와 UpdateChildren(원장 요구인지 부산물인지 미확인, 지름길은 보존), 빈 구조 그릇 정리(지울 것 없음, L3-3 닫음)." (`reviews/round-400-closing.md:8`)
  > 편집자 결정(403C-01): "【추론】 PR #416을 fde6ab359로 squash 병합했다(커밋 80aa09947 DETAIL, d9ca55595 코드·시험, 9b2ca7af3 마무리). 비효율 하나: 나감 정책에 묶인 조각이 켜진 채 다른 잎을 쓰는 평상시 쓰기마다 commitExitPolicyValues가 자식마다 getControlLayers로 제어 층 전체를 모아 그 조각의 소유 자식인지 찾았고, 이 비용은 조각 수에 초선형이었다. 바뀐 규칙 한 문장: 선택된 선언(없으면 직전 커밋의 선택, 그것도 없으면 선언 전부)과 선언 자식의 소유 경로로 "이 조각의 첫 소유 자식인가"만 직접 판정하고, 전체 정책 층 수집·평가, 정책 우선순위, 같은 층 keep 우선, 직전 커밋 나감 의미는 그대로 둔다(CONTROLS-077, CONTROLS-073(7), WRITE-032, NODE-044). 캐시와 전역 상태는 없고 공개 API는 불변이다. 효과(Node v26.12.0·Bun 1.4.3, 두 바퀴 중앙값, 작업 폴더 dist 전후): 평상시 쓰기 F=64·C=16 Node 3.522→1.134 ms(−67.8%), Bun 16.575→1.412 ms(−91.5%); 실제 나감 쓰기는 바뀌지 않았고 Node 나감 F=64의 +8.8%는 측정 문서가 적은 나감 행 범위(−12.4%~+8.8%) 안이다. 계측: plain F=64 control의 getControlLayers 572→18회, exit 78→78회, 그중 commitExitPolicyValues 호출자 몫 3→3회. 정방향·역방향 각각 72장면·323단계 배달 비교 차이 0. 새 시험은 수정 전 구현에서 572회 상한으로 실패함을 확인했고 기존 시험의 기대값 변경은 0건이다. 결정 58의 입구 수치(F=64 평상시 쓰기 3.38 ms 중 2.34 ms, Node)는 이 병합으로 대부분 사라졌으므로 58 실험은 남은 비용(약 1.1 ms)을 기준으로 다시 잰다. 388라운드 허용 범위의 실험이며 소유자가 되돌릴 수 있다." (`reviews/round-403-closing.md:8`)
  > 편집자 결정(467C-01): "【추론】 `FieldNodeState.Dirty`→`FieldNodeState.Edited`(bit 1), `ShowError.Dirty`→`ShowError.Edited`(bit 4), `ShowError.DirtyTouched`→`ShowError.EditedTouched`(bit 16), `required`→`isRequired`, `active`→`isActive`, `visible`→`isVisible`, `enabled`→`isPresent`, `readOnly`→`isReadOnly`, `disabled`→`isDisabled`, `misfit`→`isMisfit`로 바꾼다. 노드 boolean은 is 접두사를 쓰고 isRoot는 유지하며 record와 getter는 같은 이름이다. React props·FieldInputHint·schema·controls 키와 재계산 dirty 어휘는 유지하고 옛 이름 별칭은 두지 않는다. `isEdited`는 `!!state[FieldNodeState.Edited]`, `isTouched`는 `!!state[FieldNodeState.Touched]`이다. 사용자 입력만 Edited를 세우고 프로그램 setValue·배열 동사·fill·파생 쓰기·injectTo·unsetValue·trim은 세우지 않는다. 원래 값 복귀로 Edited가 지워지지 않으며 reset·clearSubtreeState·resetInteraction이 초기화한다. detach 뒤 isEdited·isTouched는 마지막 커밋 상태를 유지하고 isDivergent는 isPresent·isActive처럼 현재 출력 기여를 설명하므로 false다. ShowError의 기본 EditedTouched 정책과 비트 값은 유지하며 Submitted나 Divergent 조건을 더하지 않는다. 근거는 원문 29–31·60·76–78이다." (`reviews/round-467-closing.md:8`)
- 상태: 현행
- 출처: `reviews/round-18-closing.md:1704-1720`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-60)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:1722-1724`

### CONTROLS-078 `virtualRequired`는 새 설계에 없고 대체도 없다 — `options` 닫힌 목록 밖, 맨 키는 모르는 키로 검증기에

- 결정:
  > 【추론】 `virtualRequired`는 새 설계에 없고, 대체도 없다.
  > 【추론】 이 키를 만드는 곳은 `processVirtualSchema`의 `required` 재작성뿐이고(`src/helpers/jsonSchema/preprocessSchema/utils/processVirtualSchema/utils/transformCondition.ts:40-52`), 읽는 곳은 `BranchStrategy/utils`의 조건 사전뿐이다(`src/core/nodes/ObjectNode/strategies/BranchStrategy/utils/getFieldConditionMap/utils/flattenConditions.ts:55,87`).
  > 【추론】 새 설계는 재작성을 하지 않고(LANDING-019), 만드는 쪽과 읽는 쪽을 모두 PR-1에서 걷어 낸다(LANDING-081).
  > 【추론】 따라서 `options`의 닫힌 목록에 넣지 않는다.
  > 【추론】 작성자가 맨 키로 적은 `virtualRequired`는 JSON Schema 층의 모르는 키로 검증기에 가며, 폼은 읽지 않는다(CONTROLS-001).
- 보충:
  > 소유자(230라운드, 대기열 19 옛 키 진단): "아냐 따로 하지마. 조용히 무시(커스텀 키 무시)" (`reviews/round-230-owner-answers.md:9`)
- 상태: 현행(부정 결정)
- 출처: `reviews/round-18-closing.md:1982-1986`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-70)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:1988-1989`

### CONTROLS-079 `controls.injectTo`는 함수 `(value, ctx)` 하나 — 청사진이 정적으로 아는 대상 없음, `ctx` 여덟 칸, 반환 키는 원천 기준 경로, 항목은 전체 교체, `undefined` 항목과 `null`·`undefined` 반환은 쓰지 않음, 비활성 대상은 잠복 원본, 함수 안의 쓰기는 되먹임

- 결정:
  > 【추론】 형태는 `controls.injectTo: (value, ctx) => { [경로]: 값 } | Array<[경로, 값]> | null | undefined`다.
  > 【추론】 오늘의 `InjectToHandler` 그대로이며, 문자열 식 형태는 두지 않는다.
  > 【추론】 `controls.injectTo`는 함수 형태 하나이고(CONTROLS-019, `reviews/round-15-decisions.md:10`) 반환 경로는 실행해야 알 수 있으므로 청사진이 정적으로 아는 대상은 없다.
  > 【추론】 ERROR-123은 적용되는 경우가 없다.
  > 【추론】 대상 경로가 청사진에 없거나 터미널 아래인 경우는 모두 ERROR-122·ERROR-127의 동적 대상 없음(`SCHEMA_FORM_ERROR.INJECT_TARGET_MISSING`: 그 규칙을 후보에서 빼고 커밋, 모든 환경에서 사슬 끝 throw, `degraded`, 제출 거부)이며, 이는 R17-1 나의 효과를 그대로 지킨다.
  > 【추론】 (가칭) `JSON_SCHEMA_ERROR.INJECT_TARGET_NOT_FOUND`는 낼 자리가 없으므로 PR-4의 코드 확정에서 뺀다.
  > 【추론】 `value`는 원천의 방출 값이다.
  > 【추론】 `ctx`는 오늘의 여덟 칸을 이름 그대로 둔다: `dataPath`, `schemaPath`, `jsonSchema`, `parentValue`, `parentJSONSchema`, `rootValue`, `rootJSONSchema`, `context`.
  > 【추론】 값 칸은 모두 이번 파생 라운드 트리의 방출 값이다(18C-13 (5)).
  > 【추론】 `jsonSchema`는 원천 노드의 유효 스키마다.
  > 【추론】 `context`는 `@`와 같은 객체다.
  > 【추론】 루트에서는 `parent…` 두 칸이 `null`이다.
  > 【추론】 칸을 더하지 않는다.
  > 【추론】 반환의 키는 원천 노드를 기준으로 한 경로다.
  > 【추론】 각 항목은 대상에 대한 전체 교체이고, 파생 단계의 후보로서 SETTLE-004의 순위를 따른다.
  > 【추론】 값이 `undefined`인 항목은 쓰지 않는다.
  > 【추론】 한 반환 안에서 같은 대상이 둘이면 뒤의 것이 이긴다.
  > 【추론】 객체는 키 삽입 순서, 배열은 차례를 따른다.
  > 【추론】 `null`이나 `undefined`를 반환하면 이번 에지에서는 아무것도 쓰지 않고, 에지는 소비한다.
  > 【추론】 `@`는 대상이 아니다.
  > 【추론】 형상에 없는(비활성) 대상은 오류가 아니며(ERROR-124) 잠복 원본에 쓴다(CONTROLS-053, WRITE-018과 같은 분배).
  > 【추론】 대상이 나중에 켜져도 다시 발화하지 않는다(CONTROLS-053은 현행이다).
  > 【추론】 ERROR-124의 '그 노드에 쓰지도 않는다'는 형상에 없는 노드 자신의 규칙에 대한 말이며, 다른 규칙이 그 노드를 겨눈 쓰기(`controls.injectTo`)에는 적용되지 않는다.
  > 【추론】 함수 안의 쓰기: 다른 노드에 쓰는 정해진 길은 반환이다.
  > 【추론】 함수 안에서 폼의 공개 쓰기 API(`setValue`·`push`·`pop`·`update`·`remove`·`clear`·`batch`, EVENT-027)를 부르면 리스너 되먹임 쓰기와 같게 다룬다.
  > 【추론】 그 쓰기를 오류로 막지 않는다.
  > 【추론】 바깥 쓰기가 호출 스택에 있으므로 새 진입이 아니라 안쪽 진입이다(EVENT-027).
  > 【추론】 그 쓰기는 지금 파동이 끝난 뒤에 돈다.
  > 【추론】 리스너 되먹임과 같은 되먹임 예산(최외곽 진입의 되먹임 사슬당 25, EVENT-008)에 든다.
  > 【추론】 넘으면 되먹임 초과와 같게 사슬 끝에서 던진다((가칭) `SCHEMA_FORM_ERROR.FEEDBACK_LIMIT_EXCEEDED`, `adr/0014-error-policy.md:271`).
  > 【추론】 정착 중에 사용자 코드가 쓰는 장치는 이것 하나다(G4).
  > 【추론】 새 코드는 없다.
- 보충:
  > 소유자(12라운드 §9 답): "동의. 이는 자칫 ealry return 과 혼동이 발생해서 문제가 있었다" (`reviews/round-12-owner-answers.md:20`)
  > 편집자 결정(29C-01): "【추론】 생긴 노드와 로드된 노드의 `controls.derived`·`controls.injectTo`는 원천의 방출 값이 `undefined`여도(채움 전) 거짓→참 에지로 발화한다: WRITE-029·FRAGMENT-050 (2)·CONTROLS-027은 에지의 조건을 "직전 값이 없다"로만 두고 원천 값의 유무를 조건으로 두지 않으며, CONTROLS-079의 `value`는 원천의 방출 값이라 방출이 없으면 `undefined`다." (`reviews/round-29-closing.md:9`)
  > 편집자 결정(29C-01): "【추론】 그 `undefined`를 어떻게 다룰지는 작성자 함수의 몫이다: 원천은 런타임에도 언제든 `undefined`가 될 수 있으므로 함수는 어차피 그 입력을 다뤄야 하고, 없는 원천을 씨앗으로 쓰는 것도 작성자의 표현이다(G2)." (`reviews/round-29-closing.md:10`)
  > 편집자 결정(29C-01): "【추론】 그래서 게이트가 뒤집히지 않는 보통의 경우 결과는 채움 값으로 발화한 것과 같고(v7의 기대와 같다), 단순 복사 `(value) => ({ '../t': value })`의 첫 발화는 `undefined` 항목이라 쓰지 않으므로(CONTROLS-079) 대상은 채움 값으로만 씌워져 CONTROLS-084가 지키는 것("오늘 코드도 마운트에서 원천의 `default`로 대상을 채우므로")이 성립한다." (`reviews/round-29-closing.md:13`)
  > 편집자 결정(61C-01): "【추론】 삭제·대체는 열이다: `JSON_SCHEMA_ERROR.INJECT_TARGET_NOT_FOUND` 삭제(`injectTo` 대상은 정적으로 알 수 없고 동적 실패는 `SCHEMA_FORM_ERROR.INJECT_TARGET_MISSING`, CONTROLS-079); `JSON_SCHEMA_ERROR.INVALID_VIRTUAL_NODE_VALUES` 삭제 → `SCHEMA_FORM_ERROR.INVALID_VIRTUAL_NODE_VALUES`(쓰기 오류로 부류 이동, ERROR-195); `SCHEMA_FORM_WARNING.VALUE_TYPE_MISMATCH` 삭제 → `SCHEMA_FORM_WARNING.MISFIT`(소유자 확정, SURFACE-061); `SCHEMA_FORM_WARNING.UNSET_ON_INACTIVE_ON_OBJECT` 삭제(소유자 판정으로 코드 행 제거); `NodeState` → `SchemaNodeState`, `NodeEventType` → `SchemaNodeEventType`(SURFACE-056, 옛 소비자 이주는 07); `valueTypeMismatch`·`valueTypeMismatches` → `misfit`·`misfits`(SURFACE-061); `latent` → `getInactiveValues(path)`(SURFACE-006); 옛 Form 속성 `onListenerError`와 `throwOnBudgetExceeded` 삭제(기록은 `onError`가 받고, 모든 환경에서 사슬 끝에 던진다). 원장에서 이 옛 이름을 가진 문장은 옛 글로 남고 이 보충이 이긴다." (`reviews/round-61-closing.md:10`)
- 상태: 현행
- 출처: `reviews/round-18-closing.md:382-413`(정본), `reviews/round-12-owner-answers.md:20`
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-14)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:416-423`

### CONTROLS-080 `controls` 식 언어 명세 — 문법·컴파일, 전역 이름, 경로 토큰, `*` 없음, 경로는 방출 트리를 읽음, 형상 밖은 `undefined`, 배열 색인·길이, `@` 맥락

- 결정:
  > 【추론】 (1) 문법: 식은 JavaScript 식 하나이거나 `{ … }`로 감싼 문장 몸통(값은 `return`으로 낸다)이다.
  > 【추론】 청사진이 경로 토큰을 뽑아 인자 배열 참조로 바꾸고 `new Function`으로 컴파일한다.
  > 【추론】 오늘의 토크나이저 `JSON_POINTER_PATH_REGEX`와 `getFunctionBody`를 그대로 옮긴다.
  > 【추론】 형용사·동사 키의 식은 `!!`로 불리언이 된다.
  > 【추론】 식은 작성된 스키마 위치마다 한 번 컴파일하고, 그 위치의 모든 노드(배열 아이템 포함)가 결과를 공유한다.
  > 【추론】 컴파일 실패는 이미 정한 대로 청사진 오류다.
  > 【추론】 문자열 상수와 식의 구분은 CONTROLS-018대로다.
  > 【추론】 (2) 전역 이름: 허용 목록도 차단 목록도 두지 않는다.
  > 【추론】 식 몸통은 오늘처럼 JS 전역 스코프를 본다.
  > 【추론】 계약상 식의 입력은 경로 토큰과 `@`뿐이다.
  > 【추론】 시간·난수·바깥 가변 상태를 읽는 식은 결정적이지 않아 지원 범위 밖이며, 폼은 이를 막지 않는다.
  > 【추론】 스키마 안의 식은 코드이므로 신뢰할 수 없는 출처의 스키마는 오늘처럼 지원 범위 밖이다.
  > 【추론】 (3) 토큰: 경로 토큰은 오늘 그대로 `./p`, `../p`(되풀이할 수 있다), `/p`다.
  > 【추론】 `#/p`는 `/p`와 같다(RFC 6901의 URI 조각 표기).
  > 【추론】 `#` 단독과 `(/)`는 루트의 값이다.
  > 【추론】 `@`는 맥락이다.
  > 【추론】 `@/p`는 경로가 아니다.
  > 【추론】 맥락 안의 값은 `@.x`나 `@['x']`처럼 JS로 읽는다.
  > 【추론】 기준점은 CONTROLS-043대로다.
  > 【추론】 경로 조각 안의 `[n]`은 색인이 아니라 이름의 일부다.
  > 【추론】 (4) `*`: 식과 `controls.watch`의 경로에서 `*` 조각은 지원하지 않는다.
  > 【추론】 쓰면 청사진 오류(식 컴파일 실패와 같은 분류)다.
  > 【추론】 `*`는 `findNodes`와 `formTypeInputMap` 키의 표기로만 남는다.
  > 【추론】 같은 표현은 배열 전체를 읽어서 한다(예: `(../items).some(i => i.price > 0)`).
  > 【추론】 (5) 경로가 읽는 값: 경로는 방출 트리의 값을 읽는다.
  > 【추론】 루트의 방출 값(`outputValue`)에서 그 절대 경로를 따라 JSON Pointer처럼 내려간 값이며, 조상의 투영이 뺀 키는 `undefined`다.
  > 【추론】 계산 단계의 게이트에게 방출 트리는 이번 계산의 현재 상태이고, 바퀴 안이면 그 바퀴의 G다(FRAGMENT-016).
  > 【추론】 게이트, 상태 키, `derived`, `unsetValue`, `resetInteraction`, `watch`의 `watchValues`가 모두 이 규칙 하나를 따른다.
  > 【추론】 `controls.unsetOnInactive`의 식은 직전 커밋의 방출 트리를 읽는다(CONTROLS-024, WRITE-038, 17라운드 통보 2).
  > 【추론】 원본과 잠복 원본은 식이 읽지 못한다.
  > 【추론】 잠복 원본은 `node.inactiveValues`로만 읽는다.
  > 【추론】 노드가 없는 곳도 값 수준으로 읽힌다.
  > 【추론】 `extras`의 키, 터미널 노드 안(`./tags/0`)이 그렇다.
  > 【추론】 합성 노드를 읽는 식은 그 하위 트리 전체에 기댄다.
  > 【추론】 따라서 역의존 조회(SETTLE-017)는 값이 바뀐 노드의 경로와 그 조상·자손 경로를 읽는 식을 모두 찾는다.
  > 【추론】 (6) 비활성·없는 노드: 형상에 없는 노드(게이트가 거짓인 노드, 꺼진 분기의 노드)는 방출이 없으므로 `undefined`로 읽힌다.
  > 【추론】 청사진에 자리가 없는 경로도 오류나 경고 없이 (5)의 규칙으로 읽는다.
  > 【추론】 선언되지 않은 키면 `extras`의 값, 아니면 `undefined`다.
  > 【추론】 (7) 배열: 색인은 `/n` 조각으로 읽는다(`../items/0/price`, 아이템 안에서 형제는 `../1`).
  > 【추론】 길이는 배열의 방출 값에 JS로 `(../items).length`를 쓴다.
  > 【추론】 방출 값이므로 `omitTrailing`이 뺀 꼬리 아이템은 길이에 들지 않는다.
  > 【추론】 RFC 6901의 `-`와 음수 색인은 없다(`(../items).at(-1)`을 쓴다).
  > 【추론】 아이템이 자기 색인을 읽는 문법은 두지 않는다.
  > 【추론】 (8) `@` 맥락: `@`의 값은 폼의 맥락 객체다.
  > 【추론】 `FormProvider`의 맥락과 Form 속성 `context`를 얕게 병합하고 같은 키는 Form 속성이 이긴다.
  > 【추론】 둘 다 없으면 `{}`다.
  > 【추론】 식에게는 읽기 전용이고 `controls.injectTo`의 대상이 될 수 없다.
  > 【추론】 맥락이 바뀌는 것은 입력이 바뀌는 것이다.
  > 【추론】 바인딩이 바뀐 맥락을 루트에 전하면 정착 하나가 돈다.
  > 【추론】 원본은 표시하지 않고, 역의존 표의 `@` 항목이 가리키는 노드와 그 조상을 재계산 목록에 넣는다.
  > 【추론】 바뀜의 기준은 오늘처럼 스냅숏이라, 깊이 같은 값은 같은 참조로 본다.
  > 【추론】 `@`를 읽는 `derived`·`unsetValue`·`resetInteraction`에게 이 변경은 에지다.
  > 【추론】 기준점은 SETTLE-004대로 따르고, 같음 판정은 18C-50을 따른다.
  > 【추론】 `injectTo`는 자기 방출 값의 에지에만 발화하므로 맥락 변경으로는 발화하지 않는다.
  > 【추론】 로드 때는 로드 시점의 맥락으로 평가한다.
- 보충:
  > 편집자 결정(18C-91): "【추론】 CONTROLS-080 (5)에 식의 경로가 객체의 자기 키와 배열의 색인으로만 내려가고 원시 값 아래는 `undefined`라는 것(`reviews/round-18-owner-answers.md:29`)을 보충하며, 그래서 union 값이 `"abc"`일 때 `./slot/length`는 `undefined`다." (`reviews/round-18-closing.md:2547`)
  > 편집자 결정(28C-03): "【추론】 식과 `controls.injectTo`의 `ctx.context`가 보는 `@`의 값은 트리마다 하나인 `SchemaNodeRuntime`의 맥락 칸이다(26C-06, NODE-045의 절차): 트리 생성 때 바인딩이 준 맥락 객체 하나를 받고, 없으면 `{}`다." (`reviews/round-28-closing.md:33`)
  > 편집자 결정(28C-03): "【추론】 `FormProvider`의 맥락과 Form 속성 `context`를 얕게 병합하는 것은 바인딩의 일이며, 코어는 병합된 객체 하나만 받는다." (`reviews/round-28-closing.md:34`)
  > 편집자 결정(28C-03): "【추론】 03(PR-2)이 `@`를 호스트의 `extras`로 읽은 것(`src/core/settle/utils/paths/resolveDependencyPath.ts:5-11`, `src/core/settle/utils/gates/evaluateGate.ts:80`, `src/core/settle/utils/gates/getGateRegistry.ts:155`의 호스트 경로 치환, `src/core/settle/utils/write/getDependencyIndex.ts:32,42`의 역의존 표 제외, 시험 `src/core/settle/__tests__/settle.gates.test.ts:72-84`)은 CONTROLS-080 (3) "`@`는 맥락이다"와 (6) "선언되지 않은 키면 `extras`의 값"(경로로 읽는다)에 어긋나는 결함이며 원장에 근거가 없다(03의 기록에 있는 `@` 관련 결정은 평가 자리 L의 계산에서 `@`를 세지 않는다는 것뿐이다)." (`reviews/round-28-closing.md:36`)
  > 편집자 결정(28C-03): "【추론】 맥락 변경의 진입은 바인딩 전용 내부 통로 `setContext`(가칭, SURFACE-055·NODE-010)이고, 그것이 도는 정착(역의존 표의 `@` 항목이 가리키는 노드와 그 조상의 재계산, `@`를 읽는 `derived`·`unsetValue`·`resetInteraction`에게의 에지)은 PR-3의 기제다: 에지 소비와 파생이 PR-3이고(LANDING-063), 원장이 PR을 적지 않은 것은 그 기제를 들여오는 PR에 든다(26C-01)." (`reviews/round-28-closing.md:38`)
  > 편집자 결정(28C-03): "【추론】 `controls.injectTo`는 맥락 변경으로 발화하지 않는다(CONTROLS-080 (8))." (`reviews/round-28-closing.md:40`)
  > 편집자 결정(28C-08): "【추론】 맥락 변경의 정착은 로드가 아니므로 에지의 기준점은 직전 커밋이다(CONTROLS-080 (8) "기준점은 SETTLE-004대로 따르고, 같음 판정은 18C-50을 따른다")." (`reviews/round-28-closing.md:85`)
  > 편집자 결정(28C-08): "【추론】 같은 참조가 오면 바뀜이 없어 정착이 돌지 않고, 내용이 같은 새 객체도 "깊이 같은 값은 같은 참조로 본다"에 따라 바뀜이 아니어서 정착이 돌지 않는다(같음은 18C-50 (가)로 판정한다)." (`reviews/round-28-closing.md:86`)
  > 편집자 결정(28C-08): "【추론】 바뀌었으면 역의존 표의 `@` 항목이 가리키는 노드와 그 조상을 재계산 목록에 넣고, `@`를 읽는 게이트·상태 키는 그 재계산에서 다시 판정하며, `@`를 읽는 `derived`·`unsetValue`·`resetInteraction`에게는 에지이고 `injectTo`는 발화하지 않는다." (`reviews/round-28-closing.md:87`)
  > 편집자 결정(28C-08): "【추론】 `setContext`는 억제 비트를 받지 않는다(옵션의 자리는 WRITE-015가 `setValue(V, option)`·`reset(option)`·마운트로, WRITE-091이 입력 `onChange`로 정한 것뿐이다); 호출 옵션이 없으므로 Form 속성 `disableAutomaticWrites`가 그 정착의 자동 쓰기에 기본값으로 든다(21C-01의 포커스 아웃 `trim`과 같은 모양)." (`reviews/round-28-closing.md:88`)
  > 편집자 결정(35C-08): "【추론】 배열 아이템 안에 선언된 식·게이트·파생·상태 키의 아이템별 평가는 PR-5의 몫이다(TEST-069 (라): 아이템은 PR-5에서 처음 생긴다); CONTROLS-080대로 식은 작성 위치마다 한 번 컴파일하고 그 위치의 모든 아이템이 결과를 공유하며, 평가의 기준점은 노드 자신의 런타임 경로라 상대 경로(`..`, `../1`, `./x`)는 `/arr/3/...`에 대해 푼다." (`reviews/round-35-closing.md:65`)
  > 편집자 결정(35C-08): "【추론】 원장은 선언 경로의 아이템 조각이 런타임에 어떻게 묶이는지 적지 않았으므로 정한다: 청사진의 선언 경로는 배열 층마다 아이템 조각 하나(`items`는 임의 색인, `prefixItems`는 그 색인)를 두고, SETTLE-017의 정적 역의존 표는 조각 단위로 맞추되 선언의 아이템 조각은 어느 색인과도 맞으며, 다른 아이템을 가리키는 절대 런타임 경로(`/arr/0/x`)는 18C-13대로 배열 호스트 하위 트리 전체에 기대는 의존이다; 이 맞춤은 조회 쪽(의존 색인·게이트 재배치)의 변경이고 청사진은 바뀌지 않는다." (`reviews/round-35-closing.md:66`)
  > 편집자 결정(440C-01): "【추론】 oneOf 마운트 진단의 검증 중 갱신 경로 결함이 드러나 프로브로 확인했다(J-37): 자손이 자기 게이트로 방출 형상에 들어오거나 나가도(raw 쓰기 없이 — 잠복 원본 유지, 기본값 채움 없음, setContext) 그 경로를 읽는 다른 게이트(루트 oneOf 분기 `./h/c === 'x'`, 형제의 `controls.active`·`visible`)와 상태 키가 다시 평가되지 않아 갱신 결과가 같은 값의 새 마운트와 달라지는 순서 의존 상태였다. 원인은 `registerRecalculation.ts:21-64`와 `computeNode.ts:95-103`이 changedRaw만으로 형상 dirty를 정하는 것이며, 기존 시험·`it.fails`에 기록이 없었고 SETTLE-020/021·96C-01·97C-01 (4)·CONTROLS-080이 올바른 동작을 함의하므로 소유자 결정 없이 수정했다. 설계 안 C(호스트 바퀴가 직접 자식의 있음 변경을 `registerPresenceChanges`로 등록, 정착 문맥에 있음 경로·접두 누적, 판독자 소유자는 `registerRecalculation`처럼 표시, 상태 키 소유자는 dirty 집합, 바퀴 예산 안의 유계 조상 재확인)을 Claude Opus 검증자가 세 차례 검증·보완했다: 4.5절(접힌 고정 색인 소유자의 원래 감시 경로 유지와 양방향 교차 필터, 와일드카드 템플릿을 정적 호스트에 두고 라운드당 한 번 펼침, 게이트 없는 문맥은 표시하지 않음; 소유자 삽입 n² → 선형), 4.6절(등록 호스트의 직접 자식 소유자 dirty 표시 없음, 호스트당 의존 조회 한 번, 형 있는 Map의 평가 시각 규칙), 4.7절(게이트 레지스트리의 위치별 감시 색인과 정착별 커서; readsChanged n=1,000에서 2,003,001 → 3,001), 정확한 자식 이름 순회(필드명 `.`·`..`·`*`를 탐색 토큰으로 다루지 않음). 시험: 동작 21건(기준 전부 실패), 기록·skip·shadow 세 모드의 계수 단언, 색인 대 전수 순회 대조 장면, 게이트 없는 배열 재사용의 도달성 시험(M9 대체, 배타성 증명), 시나리오 가족 `exit/presence-readers`; 기존 기대값 변경은 `settle.gate-wheel-relocated.test.ts`의 `added` → true 하나(SETTLE-045 기준 정정, J-38). 변이 M1~M8·M10~M12 검출, Node·Bun 관측 동치 174비교 차이 0, 전체 5,008 통과·1 todo, 실제 skip·shadow 각 3,283, 색인 대조 31,535회 불일치 0. 독립 검토(agy) 두 차례 PASS 0건, 검증자 조건부 통과의 조건(필드명이 문자 그대로 `*`인 상태 키 판독자 틈을 `settle.presence-star-name.test.ts`에 `it.fails` 8/36으로 기록, 게이트 배열 재사용 배타성 장면, 병합 메시지 정정 넷)을 세 번째 보완으로 반영했다. 셋째 창(UTC 2026-10-21 01:58:15~02:16:11, Node 26, production, A/A′/B 3라운드, 268실행)은 동치 6·미입증 1·입증(느림) 8(gated-array-1000-mount +16.7 %, fixed-index-1000 mount +28.4 %·write +14.7 %, whole-array-1000 mount +30.2 %·write +18.0 %, presence-index-1000 mount +23.3 %·write +20.4 %, oneOf-80-mount +5.2 %/+2.1 %)이며 nested-d6·flat-500·gate-form 행은 동치다. 검증자의 비용 귀속: 다섯 행은 핵심 엔진 작업이 기준과 같고(±2회) 늘어난 시간은 있음 등록 층(등록·이름 열거·의존 조회·루트부터 노드 찾기)의 몫이며 의존 조회의 대부분이 빈 결과인데도 `affectedByPresence`가 호출마다 Set 6개·배열 3개를 만든다(`getDependencyIndex.ts:163-170`); whole-array 두 행은 표시된 판독자 1,999개의 재계산이라 수정이 정한 비용이다. 소유자가 느린 행을 수용했으므로(TEST-027; 위 5행) 코디네이터가 433C-01로 `0645705c1`로 gh squash 병합했다. 열린 틈: `*` 이름 필드의 상태 키 판독자, overlay 투영 전용 변화, 옮긴 게이트의 첫 locate 뒤 경로 재계산, 재현하지 못한 조상 dirty 반복. 다음 최적화 후보는 빈 조회의 빠른 길(첫 소유자를 찾을 때 결과 컨테이너 생성, 평탄화한 조상 단계를 호스트 메모에, 공유 빈 결과; 효과 미측정)이다. 증거는 `.seiri/tasks/exit-gate-440/`(`amend/`, `amend2/`, `amend3/`, `review-agy.md`, `review2-agy.md`, `design.md`, `verifier-scenes/`)와 결과 문서 `verification/perf-optimization/exit-gate-results.md`다. 작업 폴더 `schema-form-exit-gate`는 증거를 메인에 복사·대조한 뒤 지웠다." (`reviews/round-440-closing.md:8`)
  > 편집자 결정(443C-05): "【추론】 CONTROLS-080 (4) 의 `*` 금지는 식과 `controls.watch` 의 경로 조각에 한하며, 문자 그대로 `*` 인 속성 이름은 지원한다. 포괄 결함 확인(PR #448)이 그런 이름의 상태 키 판독자가 있음 변화 뒤 재계산되지 않음을 드러냈고(D443-01), PR #449(`63a789f98`)가 소유자 템플릿 경로의 `*` 조각을 청사진이 반복 아이템 템플릿(`items`·`additionalItems`)을 선언한 호스트 아래에서만 배열 와일드카드로 펼치도록 고쳤다(`populateNodeChildren` 은 `/*` 자식 경로와 `item` 을 함께 채우므로 한 노드가 리터럴 `*` 속성과 반복 템플릿을 함께 가질 수 없다). 의존 색인의 접기(`getDependencyIndex`)는 리터럴 `*` 소유자를 아직 루트로 접어 매 쓰기 재계산하는데 정확성에는 영향이 없고 9단계 정리 후보로 남긴다." (`reviews/round-443-closing.md:17`)
  > 편집자 결정(441C-04): "【추론】 소유자가 분기 동작 지연을 문제로 지목하고 지연 구성을 기각했으므로(위 2·3행) 분기 전환의 차수를 바꾸는 결정 62를 올렸다. 선택지: (가) 코드 수준 수정만(결정 불필요, −7 %: 퇴장 키 경로 색인·정적 게이트 목록 캐시·선택 계획 선생성), (나) 정착 안 게이트 결과 재사용(결정 58 확장, 상한 −13 %, SETTLE-020·438C-02의 "캐시 없이 평가"와 충돌), (다) 재등록 생략·비생존 소유자 제외(−11 %, 97C-01 (4) 범위 판단·진입 dirty 보완), (라) 구조 변경 — 값→분기 표(96C-01 (가))를 선택 단계와 소유자 등록까지 확장해 판별자 쓰기 때 옛 값·새 값의 소유자만 등록·선택·평가(분기 전환 O(바뀐 분기 크기), 마운트도 같은 표로 축소; 96C-01 (가)·97C-01 (4)·SETTLE-020 문구 변경, GOAL-011 첫 충족; 가설 셋 분량). 코디네이터 권고는 (가)를 바로 하고 (라)를 설계하는 것이며 (나)·(다)는 (라)에 포섭된다. 8단계 안에서 이 원장 조항 변경을 허용할지가 소유자 결정이다. 결정 62의 이전 후보였던 oneOf 마운트 H2(결정 58의 마운트 확장)는 (라)의 마운트 효과에 포섭되어 따로 올리지 않는다." (`reviews/round-441-closing.md:14`)
  > 편집자 결정(442C-01): "【추론】 소유자가 441C-04의 권고((가) 즉시 + (라) 설계)를 받아들였다(위 1행). (가)의 두 항목(퇴장 키 경로 색인, 정적 게이트 목록 캐시)은 PR #435(`394c284a7`)로 병합했다: 47행 가운데 동치 46·미입증 1이고 oneOf-80 분기 전환은 0.6345→0.5916 ms(−6.77 %)였으나 보정 폭 6.86 % 안이라 입증하지 않았다(`branch-switch-const-results.md`). 소유자가 폭 안의 작은 개선을 추세선으로 보자고 했고(위 2·3행) 442C 기울기 규칙을 정했다: 분기 전환 다섯 행(N=5·10·20·40·80)의 중앙값에 최소제곱 직선 시간(ms) = 절편 + 기울기(µs/분기)·N/1000을 적합하고, 폭은 |A 기울기 − A′ 기울기|, B의 기울기 변화가 A·A′ 둘 다에 같은 부호로 폭을 넘으면 입증이며 진폭 이탈 기준은 쓰지 않는다. 이 규칙으로 PR-1·1b는 기울기 동치·미입증, PR-2b는 입증(빠름)(A 3.54→B 약 −28 %), PR-3은 입증(빠름)(1.383→−0.961 µs/분기), PR-6은 동치였다." (`reviews/round-442-closing.md:8`)
- 상태: 현행
- 출처: `reviews/round-18-closing.md:311-365`(정본), `reviews/round-18-closing.md:2547`
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-13), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-91)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:370-376`, `reviews/round-18-closing.md:2556-2564`

### CONTROLS-081 `alias`·`placeholder`는 그룹 키가 아니다 — `presentation.FormTypeInputProps` 안의 키로 입력 prop에 펼침, 맨 `placeholder`는 모르는 키로 검증기에, `errorMessages`는 `presentation`

- 결정:
  > 【추론】 `alias`·`placeholder`는 그룹 키가 아니다.
  > 【추론】 둘 다 오늘처럼 `FormTypeInputProps` 안의 키이며, `FormTypeInputProps`가 `presentation`으로 옮겨 가므로(CONTROLS-051) `presentation.FormTypeInputProps.alias`·`presentation.FormTypeInputProps.placeholder`가 된다.
  > 【추론】 렌더 계층은 이 둘을 해석하지 않고 오늘처럼 입력 구성 요소의 prop으로 펼쳐 넘긴다.
  > 【추론】 `presentation`의 스키마 타입에는 `className`·`style`과 함께 문서화된 선택 키로 남긴다(선택 키가 하나도 없는 타입은 GOAL-088을 따른다).
  > 【추론】 맨 키 `placeholder`는 폼 키가 아니다.
  > 【추론】 맨 키 `placeholder`는 JSON Schema 층의 모르는 키로 검증기에 가고 폼은 읽지 않는다.
  > 【추론】 그래서 `placeholder`가 검증기에 간다고 적은 `adr/0003-group-namespace.md:125`는 맨 키로 적었을 때의 사실로 읽으며, `reviews/round-14-owner-review.md:55`와 어긋나지 않는다.
  > 【추론】 `errorMessages`는 이미 `presentation.errorMessages`로 정해졌고(CONTROLS-051), `presentation`은 통째로 검증기 앞에서 지워진다(LANDING-031).
- 보충:
  > 편집자 결정(216C-04): "【추론】 코어가 React를 모르는 채로 문맥을 적는 길이 있으면 제네릭을 늘리거나 any로 내리는 것보다 낫다. 런타임이 거부하는 자리에서 설정을 읽는 입력은 형 문제가 아니라 이주가 끝나지 않은 결함이고, 원장이 그 자리를 이미 정했으므로 바로 고친다." (`reviews/round-216-closing.md:57`)
  > 편집자 결정(222C-01): "【추론】 입력 설정의 자리는 원장이 정한 대로 돌아갔고 옛 자리는 청사진 오류로 고정됐으므로, 이주 미완으로 쓸 수 없던 일곱(실제로는 열일곱) 기능이 돌아왔다." (`reviews/round-222-closing.md:9`)
  > 소유자(230라운드, 대기열 20 플러그인 잔여 넷): "일관성 맞춰주렴" (`reviews/round-230-owner-answers.md:10`)
  > 편집자 결정(231C-01): "【추론】 승인된 다섯 변경은 모두 패키지 안의 문서·스토리·플러그인 형·시험이라 한 PR로 묶어도 검증 비용이 작고, 문서 사이트는 패키지 밖이라 따로 둔다." (`reviews/round-231-closing.md:9`)
  > 편집자 결정(233C-01): "【추론】 엔진이 presentation.formType만 읽기로 정해진 뒤 내장 정의가 최상위 키를 검사하는 것은 새 범위가 아니라 전환이 남긴 어긋남이고, 고치지 않으면 내장 checkbox·radio가 공개 문법으로 쓸 수 없다. 데모 코드의 옛 문법은 문서가 가르치는 것과 돌아가는 것이 달라지는 문제라 문서 PR의 범위다." (`reviews/round-233-closing.md:11`)
- 상태: 현행
- 출처: `reviews/round-18-closing.md:2014-2021`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-72)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:2023-2025`

### CONTROLS-082 로컬 선언끼리의 결합 확정 — 겹치는 자리 넷, 잠금은 OR·표시는 AND, 순서와 자리에 무관, 값을 쓰는 규칙은 층에서 세부가 이김, D-7과 어긋나지 않음

- 결정:
  > 【추론】 한 노드 위에서 로컬 선언이 겹칠 수 있는 자리는 넷이다: 노드 자신의 표준 `readOnly`, 자기 `controls.readOnly`·`controls.disabled`, 켜진 조각의 범위 제어, 부모의 `controls.children` 항목.
  > 【추론】 이것들이 겹치면 잠금(`readOnly`·`disabled`)은 하나라도 참이면 잠기고, 표시(`active`·`visible`)는 모두 참이어야 켜진다.
  > 【추론】 CONTROLS-046을 그대로 확정한다.
  > 【추론】 어느 자리의 `false`도 다른 자리의 잠금을 풀지 않는다.
  > 【추론】 어느 자리의 참도 다른 자리가 끈 표시를 되살리지 않는다.
  > 【추론】 결과는 선언의 순서와 자리에 따라 달라지지 않는다.
  > 【추론】 코어에 글로벌은 없다.
  > 【추론】 Form 속성의 전체 잠금은 렌더 계층이 이 결과 위에 OR한다(CONTROLS-045, 13라운드 답 1).
  > 【추론】 이 결합은 잠금 키와 표시 키에만 적용한다.
  > 【추론】 값을 쓰는 규칙(`derived`·`injectTo`·`unsetValue`)이 한 노드에 겹치면, 값은 하나만 쓸 수 있으므로 층에서 세부가 이긴다(SETTLE-004).
  > 【추론】 `unsetOnInactive`는 CONTROLS-040을 따른다.
  > 【추론】 D-7(`reviews/round-10-owner-answers.md:20`, "조각의 주석이 본체를 덮음"에 대한 답)은 주석 키에 대한 답이다.
  > 【추론】 원장은 표준 `readOnly`를 주석이 아니라 상태 키, 곧 노드의 잠금으로 읽는다.
  > 【추론】 SCHEMA-003(13라운드 소유자 답 1로 닫힘)이 그렇게 적고, 병합표는 상태 키를 주석과 따로 적는다(SCHEMA-010).
  > 【추론】 그래서 D-7은 잠금에 닿지 않고, 이 결합은 소유자 답과 어긋나지 않는다.
- 보충:
  > 편집자 결정(28C-02): "【추론】 `visible`·`readOnly`·`disabled` 게터는 CONTROLS-082의 로컬 결합 결과(잠금은 OR, 표시는 AND, 자리 넷)를 돌려주며, Form 속성의 전체 잠금은 렌더 계층이 그 위에 OR하므로 코어 게터에 들지 않는다." (`reviews/round-28-closing.md:24`)
- 상태: 현행
- 출처: `reviews/round-18-closing.md:1922-1936`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-69)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:1970-1976`

### CONTROLS-083 잠금은 세 층이 나눠 맡는다 — core는 잠금 상태만 계산하고 쓰기를 거부하지 않음, 렌더 계층은 실효 잠금을 prop으로 넘기고 입력 쓰기를 버림, 잠긴 모양은 입력 구성 요소

- 결정:
  > 【추론】 잠금은 세 층이 나눠 맡는다.
  > 【추론】 (1) core는 노드의 잠금 상태만 계산한다.
  > 【추론】 쓰기를 거부하지 않으므로 공개 `setValue`와 자동 쓰기(`derived`·`injectTo`·채움)는 잠긴 노드에도 적용된다.
  > 【추론】 잠금은 값·형상·방출을 바꾸지 않는다.
  > 【추론】 (2) 렌더 계층은 실효 잠금(core의 잠금 OR Form 속성의 전체 잠금)을 입력 구성 요소의 `readOnly`·`disabled` prop으로 넘긴다.
  > 【추론】 실효 잠금이 켜진 동안에는 `handleChange`가 입력 쓰기를 버린다.
  > 【추론】 오늘은 노드의 잠금만 보고 버리므로(`src/components/SchemaNode/SchemaNodeInput/SchemaNodeInput.tsx:51`) 이 판단에 Form 속성의 잠금을 더한다.
  > 【추론】 (3) 잠긴 모양을 그리고 입력을 막는 것은 입력 구성 요소(`FormTypeInput`) 구현의 몫이다.
  > 【추론】 오늘과 같다.
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-18-closing.md:1995-2003`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-71)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:2006-2008`

### CONTROLS-084 로드에서의 `injectTo` — `fire`(작성자가 위)를 고르고 `skip`을 버림, 원리가 말하는 것(D-27)

- 결정:
  > - **`fire` (작성자가 위).** 전체 교체는 모든 원천을 "없음에서 바뀐 것"으로 만들므로 `injectTo`가 모두 발화하고 `total`은 100이 된다. 서버가 준 90은 사라진다. 스키마가 진실이다. 초안 원리 아래의 도출이다. 4.3의 직전 커밋 규칙을 마운트에 문자 그대로 적용하면 이것이 나오고, 4라운드 명세 34행 "`reset()`은 `injectTo`를 일으킨다"와 현재 코드의 마운트 동작과 같다.
  > - **지워진 선택지.** `skip`(로드 때는 발화하지 않음)은 `{ source: 'A' }`만 로드했을 때 초기 복사조차 없어 원천이 다시 바뀔 때까지 대상이 빈다. 공개 문서가 `injectTo`의 용도를 "Initial copy, default seeding"이라 적고 오늘 코드도 마운트에서 원천의 `default`로 대상을 채우므로 G2(표현력은 줄지 않는다)에 걸린다. 이 탈락은 `injectTo`를 G2의 '동적 표현식 시스템'에 드는 것으로 읽는다는 전제에 선다. 리셋 전 이력과 비교하는 안은 P3에 걸린다. 마운트·노드 reset·`FormHandle.reset`에 서로 다른 규칙(현재 코드)은 G4에 걸린다.
  > - **원리가 말하는 것.** P2는 작성자를 정당한 쓰기 주체로 인정하므로 `fire`를 허용한다. "있는 값을 고치지 않는다"(`03-mental-model.md` 82행)는 코어 자신의 `default`에 대한 문장이지 작성자의 규칙에 대한 문장이 아니다. 그러나 허용과 선호는 다르다. 이것은 "스키마의 규칙이 진실인가, 받은 데이터가 진실인가"라는 제품의 가치다.
- 보충:
  > 편집자 결정(22C-01): "【추론】 CONTROLS-084의 "모든 원천"은 그 로드의 범위에 든 원천이다: 마운트와 `FormHandle.reset()`은 폼 전체, `resetSubtree()`는 그 하위 트리다." (`reviews/round-22-closing.md:10`)
  > 편집자 결정(29C-01): "【추론】 그래서 게이트가 뒤집히지 않는 보통의 경우 결과는 채움 값으로 발화한 것과 같고(v7의 기대와 같다), 단순 복사 `(value) => ({ '../t': value })`의 첫 발화는 `undefined` 항목이라 쓰지 않으므로(CONTROLS-079) 대상은 채움 값으로만 씌워져 CONTROLS-084가 지키는 것("오늘 코드도 마운트에서 원천의 `default`로 대상을 채우므로")이 성립한다." (`reviews/round-29-closing.md:13`)
  > 편집자 결정(29C-01): "【추론】 원장에 "원천이 없으면 태어날 때 발화하지 않는다"는 문장을 더하지 않는다: 그 규칙은 CONTROLS-084가 지운 `skip`의 부분 복원이고 G2에 걸리며, 현행 항목 어디에도 근거가 없다." (`reviews/round-29-closing.md:15`)
  > 편집자 결정(29C-01): "【추론】 04는 "→ 표시로"가 구현에 있음을 게이트가 뒤집히지 않는 변형(결과가 채움 값으로 발화한 것)으로 단언한다; 그것이 없으면 마운트에서 원천의 `default`가 대상에 실리지 않아 CONTROLS-084에 어긋난다." (`reviews/round-29-closing.md:16`)
- 상태: 현행
- 출처: `06-conclusions.md:268,270-271`(정본. CONTROLS-055에서 분할), `07-conclusions.md:245`
- 닫은 사람: 소유자 답(`reviews/round-10-owner-answers.md:19` D-6)
- 라운드: 10
- 까닭: `06-conclusions.md:271`
- 충돌:
  > `06-conclusions.md:268`의 "전체 교체는 모든 원천을 "없음에서 바뀐 것"으로 만들므로"는 소유자 답과 다르다: 새 수명은 로드(마운트·`FormHandle.reset()`·`resetSubtree()`)뿐이고 `setValue(V)`는 로드가 아니라 전체 교체 쓰기다(WRITE-090). 소유자 답이 이긴다(`reviews/round-18-owner-answers.md:26`).

### CONTROLS-085 `union` 값과 식·게이트 — 어긋난 값도 거르거나 변환하지 않고 봄, 식의 경로는 객체의 자기 키와 배열의 색인으로만 내려감(원시 값 아래는 `undefined`)

- 결정:
  > 【추론】 게이트와 식은 어긋난 값도 거르거나 변환하지 않고 보므로, `['number','string']` 판별 키에 기본 입력으로 친 `"1"`은 `const: 1` 분기를 켜지 않는다(CONTROLS-074, FRAGMENT-008).
  > 【추론】 CONTROLS-080 (5)에 식의 경로가 객체의 자기 키와 배열의 색인으로만 내려가고 원시 값 아래는 `undefined`라는 것(`reviews/round-18-owner-answers.md:29`)을 보충하며, 그래서 union 값이 `"abc"`일 때 `./slot/length`는 `undefined`다.
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-18-closing.md:2546-2547`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-91)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:2556-2564`
