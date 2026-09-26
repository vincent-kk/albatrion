# 단일 원장 — 검증기

기준 커밋: `ba398c330`(저장소 `packages/canard/schema-form/architecture`). 정본 우선순위는 다음 순서다. (1) 소유자 답은 고정이다. (2) 채택된 ADR이 정본이다. 이 영역에서는 `adr/0004-validator-plugin-compile-guard.md`(상태: 수락)가 정본이다. `adr/0001-validator-input-invariant.md`는 상태가 "제안"이고 검증기 설정 부분만 수락되었으므로, 그 규칙이 온전히 적힌 곳이 그 ADR뿐일 때 정본으로 쓴다. (3) `03-mental-model.md`(원장)는 08과 다르면 원장이 이긴다(08이 스스로 그렇게 적는다). (4) 뒤 라운드가 앞 라운드를 이긴다. `05-before-after.md`·`06-conclusions.md`·`07-conclusions.md`는 그때의 기록이며 고치지 않는다. 오류·경고로 드러나는 검증기 규칙(검증기의 출처, 검증기 없음, 조건부 스키마와 검증기 없음, 검증 불가, 검증 실행 실패, 로드 검증의 자리, 가드의 컴파일 시점과 실패, 이주 안내)은 `ledger/error.md`에 있고 이 파일에 다시 적지 않는다. 출처의 `path:line#n`은 그 줄의 n번째 문장 하나이고, `path:line#a-b`는 그 줄의 a번째부터 b번째까지의 연속한 문장들이다.

## 색인

| 번호 | 한 줄 요약 | 상태 | 닫은 사람 |
| --- | --- | --- | --- |
| VALIDATE-001 | 판정 불변식 — 폼의 판정은 검증기(작성된 스키마, 방출 값), FE 추가 검사는 AND로만 | 현행 | 소유자 답(`00-goals.md:141` G1, 방향), 원리(`03-mental-model.md:13` P1) |
| VALIDATE-002 | 계약의 읽기 — 같은 설정의 검증기 | 현행 | 소유자 답(`reviews/round-1.md:178` 계약을 검증기 프로필로 한정하는가 (R1)), 소유자 답(`reviews/round-2.md:112` C5), 소유자 답(`reviews/round-18-owner-answers.md:34` union O4; 세 옵션은 `bind`가 강제) |
| VALIDATE-003 | 검증기 설정은 소비자의 책임 — `bind(instance)`, 기본값 불변, format은 의지적으로 | 현행 | 소유자 답(`reviews/round-1.md:178` 계약을 검증기 프로필로 한정하는가 (R1)), 소유자 답(`reviews/round-18-owner-answers.md:34` union O4; `bind`의 거부), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-90) |
| VALIDATE-004 | 검증기 앞 제거 — 키워드 위치의 그룹 객체 셋을 사본에서만 | 현행 | 소유자 답(`reviews/round-15-decisions.md:12` 4), 소유자 답(`reviews/round-15-decisions.md:13` 5), 편집자 결정(2라운드, `adr/0001-validator-input-invariant.md:10` S1), 소유자 답(`reviews/round-18-owner-answers.md:34` union O4; 깊은 사본) |
| VALIDATE-005 | 소비자의 커스텀 키는 지우지 않음 — strict 모드는 기본이 아님 | 현행 | 소유자 답(`reviews/round-1.md:178` 계약을 검증기 프로필로 한정하는가 (R1)) |
| VALIDATE-006 | 판정은 커밋 번호에 묶임 — 늦은 결과 버림, `isValid`, 제출은 보내는 스냅숏을 검증 | 현행 | 편집자 결정(1라운드, `reviews/round-1.md:181` 판정의 revision 채택), 편집자 결정(11라운드, `adr/0001-validator-input-invariant.md:3` 5차 주 (3)) |
| VALIDATE-007 | 방출 값은 JSON 직렬화 뒤와 같은 값 | 현행 | 편집자 결정(1라운드, `adr/0001-validator-input-invariant.md:11`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-91), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-98) |
| VALIDATE-008 | `ValidationMode.None`은 판정을 제공하지 않음(통과가 아님) | 현행 | 편집자 결정(1라운드, `adr/0001-validator-input-invariant.md:11`) |
| VALIDATE-009 | 에러 라우팅은 판정을 바꾸지 않음 | 현행 | 편집자 결정(1라운드, `adr/0001-validator-input-invariant.md:38`) |
| VALIDATE-010 | 마커 장치가 모두 사라지고 두 경로가 같은 계약을 가짐 | 현행 | 원리(`03-mental-model.md:13` P1) |
| VALIDATE-011 | 주인 없는 검증 에러를 모으는 폼 수준 sink | 현행 | 원리(`03-mental-model.md:13` P1), 소유자 답(`00-goals.md:105` C2), 소유자 답(`reviews/round-2.md:112` 목표 후보 C1–C8) |
| VALIDATE-012 | 활성 조각 아래의 에러만 노드에 — 에러 라우팅이 18라운드 안건으로 이관됨 | 대체됨(→ VALIDATE-043) | 편집자 결정(11라운드, `adr/0001-validator-input-invariant.md:3` 5차 주 (5)), 편집자 결정(18라운드 안건 이관, `reviews/round-18-agenda.md:108`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-53) |
| VALIDATE-013 | 잔여 키의 표시는 플러그인 계약 `rejectedKey` | 중복(→ FRAGMENT-020) | 원리(`03-mental-model.md:151` P1), 편집자 결정(5라운드 도출, `reviews/round-5-derivations.md:26` C-4) |
| VALIDATE-014 | 검증기를 내장하지 않음 | 현행 | 소유자 답(`00-goals.md:146` G3) |
| VALIDATE-015 | 플러그인 계약 — `compile(schema)`와 `compileGuard(root, pointer)`의 모양 | 현행 | 편집자 결정(16라운드, `09-landing-and-test-strategy.md:19` 조건 1) |
| VALIDATE-016 | 가드는 동기 전용 | 현행 | 소유자 답(`adr/0004-validator-plugin-compile-guard.md:55` 가드는 동기 전용) |
| VALIDATE-017 | 가드는 사본의 루트와 위치를 받아 루트 문맥에서 컴파일 | 현행 | 편집자 결정(16라운드, `09-landing-and-test-strategy.md:19` 조건 1) |
| VALIDATE-018 | 사본·가드 캐시는 코어가 검증기 인스턴스마다 작성 루트 기준으로 듦 | 현행 | 편집자 결정(16라운드, `09-landing-and-test-strategy.md:19` 조건 1), 소유자 답(`reviews/round-16-owner-answers.md:16` 10), 소유자 답(`reviews/round-18-owner-answers.md:34` union O4; 깊은 사본) |
| VALIDATE-019 | 플러그인의 `compileGuard`는 가드 캐시를 들지 않고 사본 루트의 등록은 플러그인의 검증기 인스턴스가 듦 | 현행 | 편집자 결정(16라운드, `09-landing-and-test-strategy.md:19` 조건 1), 소유자 답(`reviews/round-16-owner-answers.md:16` 10) |
| VALIDATE-020 | 같은 `$id` 사본 루트의 충돌 처리 — PR-4가 정함 | 대체됨(→ VALIDATE-046) | 편집자 결정(16라운드, `09-landing-and-test-strategy.md:88` 여덟째), 편집자 결정(18라운드 안건 이관, `reviews/round-18-agenda.md:108`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-57) |
| VALIDATE-021 | 검증기 등록의 수명 — 참조 세기 + 최근 해제 목록 | 현행 | 스웜 수렴(편집자 결정, `09-landing-and-test-strategy.md:88`), 원리(`08-design-a-to-z.md:36` 고속성) |
| VALIDATE-022 | 최근 해제 목록의 크기와 해제 계약의 세부가 18라운드 안건으로 이관됨 | 대체됨(→ VALIDATE-045) | 편집자 결정(18라운드 안건 이관, `reviews/round-18-agenda.md:108`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-56) |
| VALIDATE-023 | `compileGuard`의 `$id`·`$dynamicRef` 문맥이 18라운드 안건으로 이관됨 | 대체됨(→ VALIDATE-047) | 편집자 결정(18라운드 안건 이관, `reviews/round-18-agenda.md:108`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-58) |
| VALIDATE-024 | Form 속성 `validatorFactory` — 유지하고 넓힘, 같은 계약, 플러그인보다 앞섬 | 분할됨(→ VALIDATE-040, VALIDATE-041, VALIDATE-042) | 소유자 답(`reviews/round-14-owner-answers.md:13` O-7) |
| VALIDATE-025 | 플러그인 패키지가 변경 범위에 듦 | 현행 | 소유자 답(`adr/0004-validator-plugin-compile-guard.md:54`) |
| VALIDATE-026 | 플러그인의 방언 선언과 개발 모드 경고 — 받음(12-4) | 현행 | 편집자 결정(1라운드, `reviews/round-1.md:178` 반영 칸), 소유자 답(`reviews/round-18-owner-answers.md:14` 12-4) |
| VALIDATE-027 | 인터프리터형 검증기는 플러그인으로 허용, 성능 예산은 AJV 기준 | 현행 | 편집자 결정(1라운드, `adr/0004-validator-plugin-compile-guard.md:44` R18), 소유자 답(`reviews/round-18-owner-answers.md:13` 12-3), 편집자 결정(18라운드, `reviews/round-18-owner-answers.md:13` 반영 칸; 답을 가로 읽음) |
| VALIDATE-028 | 기각한 대안 — 작은 검증기 내장, AJV 내장 | 현행(부정 결정) | 소유자 답(`00-goals.md:146` G3), 편집자 결정(1라운드, `adr/0004-validator-plugin-compile-guard.md:59-60`) |
| VALIDATE-029 | 대체됨: CSP-safe 검증기의 비교는 ADR 0010의 외부 조사 항목 | 대체됨(→ VALIDATE-030) | 편집자 결정(11라운드, `adr/0004-validator-plugin-compile-guard.md:3` 5차 주 (2)) |
| VALIDATE-030 | ADR 0010은 분기 관행 문서(외부 조사 항목 아님) | 현행 | 편집자 결정(11라운드, `adr/0004-validator-plugin-compile-guard.md:3` 5차 주 (2)) |
| VALIDATE-031 | 대체됨: 효과가 있는 것은 변경 경로 → 가드의 역색인 | 대체됨(→ VALIDATE-032) | 편집자 결정(11라운드, `adr/0004-validator-plugin-compile-guard.md:3` 5차 주 (1)) |
| VALIDATE-032 | 변경 경로 → 가드의 역색인은 기각 | 현행(부정 결정) | 편집자 결정(11라운드, `adr/0004-validator-plugin-compile-guard.md:3` 5차 주 (1)) |
| VALIDATE-033 | 가드용 인스턴스와 검증용 인스턴스의 설정을 같게 두는 규칙은 플러그인이 가짐 | 현행 | 편집자 결정(2라운드, `adr/0004-validator-plugin-compile-guard.md:71` S12) |
| VALIDATE-034 | `options.virtual`은 제거 목록에 들고 `required` 재작성은 버림 | 현행 | 소유자 답(`reviews/round-12-owner-answers.md:16` 8 `virtual`), 소유자 답(`reviews/round-10-owner-answers.md:31` E-4) |
| VALIDATE-035 | 대체됨: `options.virtual`의 `required` 재작성은 이 결정과 충돌(Q5) | 대체됨(→ VALIDATE-034) | 소유자 답(`reviews/round-12-owner-answers.md:16` 8 `virtual`) |
| VALIDATE-036 | `&if`만으로 분기를 구분한 기존 스키마는 폼에서도 invalid — 의도된 파괴적 변경 | 현행 | 원리(`03-mental-model.md:13` P1) |
| VALIDATE-037 | 가드 컴파일의 인스턴스 사이 공유의 나머지 세부 — 슬라이스 4의 설계 항목 | 대체됨(→ VALIDATE-048) | 편집자 결정(16라운드, `08-design-a-to-z.md:180`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-79) |
| VALIDATE-038 | 잔여 키의 표시는 렌더 계층의 몫 — Q12와 함께 정함 | 대체됨(→ VALIDATE-043) | 편집자 결정(5라운드 4차 본문, `adr/0006-single-value-ownership.md:99`), 편집자 결정(18라운드 안건 이관(Q12), `reviews/round-18-agenda.md:108`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-53) |
| VALIDATE-039 | 검증을 입력 경로에서 떼어 내는 법(R19) — 커밋 번호 스탬프는 경합만 막음 | 분할됨(→ VALIDATE-049, VALIDATE-006) | 편집자 결정(5라운드 4차 본문, `adr/0007-settle-cycle.md:150`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-80; 소유자 답 O-6·D-10·12-3을 엮음) |
| VALIDATE-040 | Form 속성 `validatorFactory`는 유지하고 넓힘 | 현행 | 소유자 답(`reviews/round-14-owner-answers.md:13` O-7) |
| VALIDATE-041 | 플러그인은 전역 기본, 속성은 그 폼의 인스턴스 — 같은 계약, 플러그인보다 앞섬(계약 통일은 VALIDATE-044) | 현행 | 소유자 답(`reviews/round-14-owner-answers.md:13` O-7), 편집자 결정(18라운드 안건 이관, `reviews/round-18-agenda.md:108`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-54) |
| VALIDATE-042 | 미등록 판정은 플러그인과 `validatorFactory`를 함께 봄 | 현행 | 소유자 답(`reviews/round-14-owner-answers.md:13` O-7) |
| VALIDATE-043 | 검증 에러 라우팅 — 판정 불변, 폼 수준 목록, `dataPath` 배정, 잔여 키는 호스트, 터미널 아래는 터미널, 꺼진 union 분기만 표시에서 거름, union 호스트 에러는 호스트 | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-53) |
| VALIDATE-044 | 검증기 계약 형 `Validator`(가칭) 하나 — `compile`·`compileGuard`·선택 `release`·방언, 고르는 순서 Form > `FormProvider` > 플러그인, 참조가 바뀌면 재생성, 가드는 동기 boolean | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-54), 소유자 답(`reviews/round-18-owner-answers.md:34` union O4; 계약 문장) |
| VALIDATE-045 | 최근 해제 목록 크기 8(검증기 인스턴스마다, 내부) — 밀려날 때와 같은 `$id` 재등록 직전에만 `release(root)`, 상한 '살아 있는 루트 + 8' | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-56) |
| VALIDATE-046 | 같은 `$id`의 두 살아 있는 루트는 저마다 판정 — 떼어 두기는 플러그인 계약, PR-4 게이트 넷(오류·경고 아님은 ERROR-201) | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-57) |
| VALIDATE-047 | 따로 컴파일한 가드는 전체 검증의 `if`와 같은 boolean — `$id`·동적 범위 포함, 플러그인 계약, PR-4 게이트 넷 | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-58) |
| VALIDATE-048 | 가드 컴파일의 공유 단위는 (검증기 인스턴스, 작성 루트 identity) — 전체 검증 함수도 같은 캐시 항목, 수명은 가드와 같음 | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-79), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-101), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-105) |
| VALIDATE-049 | 폼은 검증을 입력 경로에서 떼어 내는 장치를 두지 않음 — 진입당 요청 1회와 마이크로태스크 합치기, 빈도 조절은 `OnRequest`, 제출은 새로 검증 | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-80) |
| VALIDATE-050 | 값을 바꾸는 검증기 옵션 — `Validator` 문서 주석의 계약 문장, ajv 플러그인 셋의 `bind`는 `coerceTypes`·`useDefaults`·`removeAdditional`을 켠 인스턴스를 거부(가칭 `VALIDATOR_BIND_REFUSED`), 사용자 정의 변경 키워드는 소비자 책임, 스키마 사본은 깊은 복사 한 번 | 현행 | 소유자 답(`reviews/round-18-owner-answers.md:34` union O4) |
| VALIDATE-051 | union과 검증기 — ajv8 기본 설정에 `allowUnionTypes: true`(판정 불변, 로그만 없앰), core는 검증에 넘기는 값을 복사하지 않음, 어긋난 union 값과 통째 값 안쪽의 에러는 union 노드가 받음, 규칙 A·경고등은 검증기를 쓰지 않음 | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-90·18C-91) |

항목 형식은 `ledger/README.md` §3을 따른다.

## 항목

### VALIDATE-001 판정 불변식 — 폼의 판정은 검증기(작성된 스키마, 방출 값), FE 추가 검사는 AND로만

- 결정:
  > > **폼의 판정 = `validator(작성된 스키마, 방출되는 값)`.**
  > > 검증기는 이 둘만 본다. 폼이 내부에서 파생한 스키마(`allOf` 병합, 조각을 얹은 유효 스키마)는 폼 전용이며 검증기에 전달하지 않는다. 검증용으로 값에 무엇을 더하지도 않는다.
  >
  > FE 전용으로 더 강하게 검증하고 싶으면 추가 검사를 AND로만 붙인다: `폼 판정 = validator(…) ∧ FE추가검사`. 어떤 추가 검사를 붙여도 "폼 통과 ⇒ 서버 통과"는 유지된다.
- 보충: 없음
- 상태: 현행
- 출처: `adr/0001-validator-input-invariant.md:21-22,26`(정본), `03-mental-model.md:13`, `08-design-a-to-z.md:349`, `02-target-overview.md:175`, `adr/0001-validator-input-invariant.md:15,17,42,56`
- 닫은 사람: 소유자 답(`00-goals.md:141` G1, 방향), 원리(`03-mental-model.md:13` P1)
- 라운드: 1
- 까닭: `adr/0001-validator-input-invariant.md:15-17`

### VALIDATE-002 계약의 읽기 — 같은 설정의 검증기

- 결정:
  > 이 불변식은 검증기의 **입력**을 고정한다. 검증기 **함수**는 고정하지 못한다. 그래서 계약은 이렇게 읽는다:
  >
  > > 폼이 통과시킨 값은, **같은 설정의 검증기**도 통과시킨다.
  >
  > - **같은 설정**은 방언, format을 검사하는지, 커스텀 키워드·포맷, 값을 바꾸는 옵션(`coerceTypes` 등)을 쓰지 않는 것을 뜻한다. 기본 ajv8 플러그인은 draft-07 엔트리에 `validateFormats: false`다(`schema-form-ajv8-plugin/src/default/validatorPlugin.ts:15-19`). 이 기본값에서 `$schema` 없는 2020-12 스키마의 `dependentRequired`·`unevaluatedProperties`는 조용히 무시되고 `format`은 항상 통과한다. 서버와 설정을 맞추는 것은 소비자의 책임이고 수단은 이미 있다 — 플러그인의 `bind(instance)`로 Ajv 인스턴스를 주입한다. 기본값은 바꾸지 않는다(ADR 0004).
- 보충:
  > 소유자(2라운드): "C5는 질문이 부정확했음(검증의 방언은 플러그인의 영역, 폼은 두 철자를 모두 읽는다)" (`reviews/round-2.md:112`)
  > 반영 칸(union O4, 같은 설정): "VALIDATE-002의 "같은 설정"은 값을 바꾸는 옵션을 쓰지 않는 것을 포함하며, 이 가운데 세 옵션은 이제 `bind`가 강제한다." (`reviews/round-18-owner-answers.md:34`)
- 상태: 현행
- 출처: `adr/0001-validator-input-invariant.md:30-34`(정본), `adr/0001-validator-input-invariant.md:5,11`, `adr/0004-validator-plugin-compile-guard.md:41`, `00-goals.md:108`, `reviews/round-2.md:112`, `reviews/round-18-owner-answers.md:34`
- 닫은 사람: 소유자 답(`reviews/round-1.md:178` 계약을 검증기 프로필로 한정하는가 (R1)), 소유자 답(`reviews/round-2.md:112` C5), 소유자 답(`reviews/round-18-owner-answers.md:34` union O4; 세 옵션은 `bind`가 강제)
- 라운드: 18
- 까닭: `reviews/round-1.md:178`, `reviews/round-18-owner-answers.md:34`

### VALIDATE-003 검증기 설정은 소비자의 책임 — `bind(instance)`, 기본값 불변, format은 의지적으로

- 결정:
  > - 서버와 검증기 설정(방언, format 검사, 커스텀 키워드)을 맞추는 것은 소비자의 책임이다. 수단은 이미 있는 `bind(instance)`다. 기본값(`allErrors`, `strictSchema: false`, `validateFormats: false`)은 바꾸지 않는다. format 검사는 소비자가 의지적으로 켠다.
- 보충:
  > 반영 칸(union O4, `bind`의 거부): "ajv 플러그인 셋(ajv6·7·8)의 `bind(instance)`는 `coerceTypes`·`useDefaults`·`removeAdditional` 가운데 하나라도 켜진 인스턴스를 거부하며, 옵션은 ajv7·8이면 `instance.opts`, ajv6이면 `instance._opts`에서 읽는다." (`reviews/round-18-owner-answers.md:34`)
  > 편집자 결정(18C-90): "【추론】 ajv8 플러그인의 세 진입점(`default`·`2019`·`2020`) 기본 설정에 `allowUnionTypes: true`를 더한다." (`reviews/round-18-closing.md:2462`)
  > 편집자 결정(18C-90): "【추론】 `allowUnionTypes`는 판정을 바꾸지 않고, `strictTypes`의 기본값 `"log"`가 union `type`마다 내는 `console.warn`만 없앤다." (`reviews/round-18-closing.md:2463`)
- 상태: 현행
- 출처: `adr/0004-validator-plugin-compile-guard.md:41`(정본), `adr/0004-validator-plugin-compile-guard.md:52`, `adr/0001-validator-input-invariant.md:5,34`, `reviews/round-1.md:178`, `reviews/round-18-owner-answers.md:34`, `reviews/round-18-closing.md:2462-2463`
- 닫은 사람: 소유자 답(`reviews/round-1.md:178` 계약을 검증기 프로필로 한정하는가 (R1)), 소유자 답(`reviews/round-18-owner-answers.md:34` union O4; `bind`의 거부), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-90)
- 라운드: 18
- 까닭: `reviews/round-1.md:178`, `reviews/round-18-owner-answers.md:34`, `reviews/round-18-closing.md:2466-2471`

### VALIDATE-004 검증기 앞 제거 — 키워드 위치의 그룹 객체 셋을 사본에서만

- 결정:
  > 키워드 위치의 그룹 객체 셋 `controls`·`options`·`presentation`을 지운다. 지우는 이유는 판정이 아니라 컴파일이다(ADR 0003 §7). 작성된 스키마 자체는 변형하지 않고 검증기에 넘길 사본에서만 지운다(ADR 0001). 오늘은 여섯 키(`FormTypeInput`, `FormTypeInputProps`, `FormTypeRendererProps`, `errorMessages`, `options`, `injectTo`)만 지우고 `&` 키·`computed`·`virtual`·`terminal` 등은 검증기까지 가므로, 그룹 셋으로 옮기는 것이 이주 항목이다. 서버 스키마에 넘길 때도 같은 셋을 지우면 되고, 서버 스키마와 클라이언트 스키마를 합칠 때는 그룹 셋만 덧붙이면 된다.
- 보충:
  > "**허용되는 스키마 변형은 하나다 — 폼 전용 키를 키워드 위치에서만 제거하는 것.**" (`adr/0001-validator-input-invariant.md:24`)
  > "현재 `stripSchemaExtensions`가 하는 일이고(`JSONSchemaScanner`로 위치를 구분한다) 그대로 둔다(목록은 그룹 객체 셋으로 닫힌다, ADR 0003 §7)." (`adr/0001-validator-input-invariant.md:24`)
  > "제거가 필요한 이유는 판정이 아니라 **검증기의 컴파일**이다: 폼 전용 키의 값에 순환하거나 깊은 객체가 있으면(`presentation.FormTypeInputProps`의 자기 참조, 개발 빌드의 React 엘리먼트) `ajv.compile`이 스택 초과로 죽는다(`reviews/round-2.md` S1, 실행)." (`adr/0001-validator-input-invariant.md:24`)
  > 반영 칸(union O4, 스키마 사본): "검증기에 넘기는 스키마 사본은 (검증기 인스턴스, 작성 루트)마다 한 번 깊이 복사한다." (`reviews/round-18-owner-answers.md:34`)
- 상태: 현행
- 출처: `08-design-a-to-z.md:147`(정본), `adr/0001-validator-input-invariant.md:3,24`, `adr/0003-group-namespace.md:125,127`, `reviews/round-18-owner-answers.md:34`
- 닫은 사람: 소유자 답(`reviews/round-15-decisions.md:12` 4), 소유자 답(`reviews/round-15-decisions.md:13` 5), 편집자 결정(2라운드, `adr/0001-validator-input-invariant.md:10` S1), 소유자 답(`reviews/round-18-owner-answers.md:34` union O4; 깊은 사본)
- 라운드: 18
- 까닭: `reviews/round-2.md:82`, `00-goals.md:144`, `reviews/round-18-owner-answers.md:34`
- 충돌:
  > `open-questions.md:66`의 "`&` 키는 기본으로 제거하지 않으므로(ADR 0003) 키워드 위치의 표가 방언마다 다르다는 문제는 선택 사항인 제거 유틸리티에만 남는다."는 `&` 키를 검증기 앞에서 지우지 않던 15라운드 전의 전제에 선다. 15라운드부터 그룹 셋은 검증기에 넘길 사본에서 늘 지우므로, 키워드 위치가 방언마다 다른 문제는 기본 제거에 걸린다(Q9). 정본이 이긴다(`adr/0003-group-namespace.md:127`).

### VALIDATE-005 소비자의 커스텀 키는 지우지 않음 — strict 모드는 기본이 아님

- 결정:
  > 소비자의 커스텀 키는 라이브러리가 열거할 수 없으므로 지우지 않는다 — strict 모드는 기본이 아니다(ADR 0003).
- 보충:
  > 소유자: "나는 & 말고도 커스텀 필드를 많이 써서 무분별하게 열긴 좀 그렇다." (`adr/0001-validator-input-invariant.md:5`)
  > "맨 키 가운데 폼이 모르는 것은 지우지 않는다. 그것은 JSON Schema 층의 것(확장 키워드)이고 검증기의 몫이다." (`adr/0003-group-namespace.md:126`)
- 상태: 현행
- 출처: `adr/0001-validator-input-invariant.md:24#5`(정본), `adr/0001-validator-input-invariant.md:5`, `adr/0003-group-namespace.md:126`
- 닫은 사람: 소유자 답(`reviews/round-1.md:178` 계약을 검증기 프로필로 한정하는가 (R1))
- 라운드: 1
- 까닭: `reviews/round-1.md:178`

### VALIDATE-006 판정은 커밋 번호에 묶임 — 늦은 결과 버림, `isValid`, 제출은 보내는 스냅숏을 검증

- 결정:
  > - **판정은 값의 revision에 묶인다.** 비동기 검증의 결과가 도착했을 때 값이 이미 바뀌었으면 그 결과는 버린다. `isValid`는 판정의 revision이 현재와 같을 때만 참이다. 제출은 캐시된 판정이 아니라 **실제로 보내는 스냅숏**을 검증한다.
- 보충:
  > "(3) "판정의 revision"은 커밋 번호다." (`adr/0001-validator-input-invariant.md:3`)
- 상태: 현행
- 출처: `adr/0001-validator-input-invariant.md:35`(정본), `adr/0001-validator-input-invariant.md:3,11`, `03-mental-model.md:66,111`, `08-design-a-to-z.md:349`
- 닫은 사람: 편집자 결정(1라운드, `reviews/round-1.md:181` 판정의 revision 채택), 편집자 결정(11라운드, `adr/0001-validator-input-invariant.md:3` 5차 주 (3))
- 라운드: 11
- 까닭: `reviews/round-1.md:181`

### VALIDATE-007 방출 값은 JSON 직렬화 뒤와 같은 값

- 결정:
  > - **방출 값은 JSON으로 직렬화했을 때와 같은 값이어야 한다.** 값이 `undefined`인 키, 배열 중간의 `undefined`는 메모리에서의 판정과 전송 후의 판정을 갈라놓는다(`{minProperties:3}`에 `{a:1,b:2,c:undefined}`).
- 보충:
  > 편집자 결정(18C-91): "【추론】 터미널 object·array 노드와, 객체·배열을 받는 union이 통째로 든 값의 안쪽은 폼이 정규화하지 않는다." (`reviews/round-18-closing.md:2538`)
  > 편집자 결정(18C-91): "【추론】 그 안쪽의 JSON 부정합(`undefined`인 키, 배열 중간의 `undefined`·빈 자리, 비유한 수, `Date`·함수·bigint)은 VALIDATE-007을 어길 수 있다(예: `{type:['object','string'], minProperties:1}`의 `{a: undefined}`는 메모리 판정을 통과하고 직렬화 뒤 판정에서 실패한다)." (`reviews/round-18-closing.md:2539`)
  > 편집자 결정(18C-91): "【추론】 개발 모드에서는 그런 값의 참조가 바뀐 커밋마다 깊이 점검하고, 부정합이 있으면 `(가칭) SCHEMA_FORM_WARNING.NON_JSON_WHOLE_VALUE`를 `(code, path)`로 로드마다 한 번 내며, 기록은 `{ path, innerPaths }`(앞의 N개)다." (`reviews/round-18-closing.md:2540`)
  > 편집자 결정(18C-91): "【추론】 멤버십은 얕게만 보며, 통째로 든 값 안의 JSON 부정합은 `NON_JSON_WHOLE_VALUE` 개발 모드 경고로만 드러내고 폼은 값을 정규화하지 않는다(VALIDATE-007)." (`reviews/round-18-closing.md:2554`)
- 상태: 현행
- 출처: `adr/0001-validator-input-invariant.md:36`(정본), `adr/0001-validator-input-invariant.md:11`, `08-design-a-to-z.md:605`, `reviews/round-18-closing.md:2538-2540,2554`, `reviews/round-18-closing.md:2797-2798`
- 닫은 사람: 편집자 결정(1라운드, `adr/0001-validator-input-invariant.md:11`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-91), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-98)
- 라운드: 18
- 까닭: `adr/0001-validator-input-invariant.md:36`, `reviews/round-18-closing.md:2556-2564`
- 충돌:
  > `reviews/round-18-closing.md:2540`의 "`(code, path)`로 로드마다 한 번 내며"는 18C-98의 결정과 다르다: 경고 중복 키는 폼 수준 로드(마운트, `FormHandle.reset()`)에서만 비우므로 `NON_JSON_WHOLE_VALUE`는 폼 수준 로드 사이에 `(code, path)`마다 한 번이고, `setValue(V)`와 `resetSubtree()` 뒤에는 다시 내지 않는다(ERROR-204). 18C-98의 결정이 이긴다(`reviews/round-18-closing.md:2797-2798`).

### VALIDATE-008 `ValidationMode.None`은 판정을 제공하지 않음(통과가 아님)

- 결정:
  > - **`ValidationMode.None`은 "판정을 제공하지 않음"이다.** 통과가 아니다.
- 보충:
  > "`ValidationMode.None`인 폼도 조건부를 쓰려면 플러그인 등록이 필요하다." (`adr/0004-validator-plugin-compile-guard.md:35`)
- 상태: 현행
- 출처: `adr/0001-validator-input-invariant.md:37`(정본), `adr/0001-validator-input-invariant.md:11`, `adr/0004-validator-plugin-compile-guard.md:35`
- 닫은 사람: 편집자 결정(1라운드, `adr/0001-validator-input-invariant.md:11`)
- 라운드: 1
- 까닭: `adr/0001-validator-input-invariant.md:11`

### VALIDATE-009 에러 라우팅은 판정을 바꾸지 않음

- 결정:
  > - 에러 라우팅이 실제 실패를 숨기는지로 공격받았으나 살아남았다. 라우팅은 에러가 어디에 보일지만 정하고 판정을 바꾸지 않는다.
- 보충: 없음
- 상태: 현행
- 출처: `adr/0001-validator-input-invariant.md:38`(정본), `adr/0001-validator-input-invariant.md:44`
- 닫은 사람: 편집자 결정(1라운드, `adr/0001-validator-input-invariant.md:38`)
- 라운드: 1
- 까닭: `adr/0001-validator-input-invariant.md:38`

### VALIDATE-010 마커 장치가 모두 사라지고 두 경로가 같은 계약을 가짐

- 결정:
  > - `ENHANCED_KEY`, enhancer, `preprocessSchema`의 마커 주입, `__processCompositionValue__`의 마커 기록, `transformErrors`의 마커 필터가 모두 사라진다. 이슈 #342 §3.1·§3.3·§3.4가 함께 사라진다.
  > - `nodeFromJSONSchema`를 직접 부르는 경로와 `<Form>` 경로가 같은 계약을 갖게 된다(지금은 다르다).
- 보충: 없음
- 상태: 현행
- 출처: `adr/0001-validator-input-invariant.md:43,46`(정본), `adr/0001-validator-input-invariant.md:44`
- 닫은 사람: 원리(`03-mental-model.md:13` P1)
- 라운드: 1
- 까닭: `adr/0001-validator-input-invariant.md:15`

### VALIDATE-011 주인 없는 검증 에러를 모으는 폼 수준 sink

- 결정:
  > - 검증기 에러 가운데 `instancePath`에 해당하는 노드가 없는 것이 생긴다(꺼진 조각의 필드가 기본 `required`에 걸린 경우 등). **주인 없는 에러를 모으는 폼 수준 sink**가 필요하다. 작성자의 실수를 폼이 가리지 않는다.
- 보충: 없음
- 상태: 현행
- 출처: `adr/0001-validator-input-invariant.md:45`(정본), `00-goals.md:105`
- 닫은 사람: 원리(`03-mental-model.md:13` P1), 소유자 답(`00-goals.md:105` C2), 소유자 답(`reviews/round-2.md:112` 목표 후보 C1–C8)
- 라운드: 2
- 까닭: `adr/0001-validator-input-invariant.md:45`

### VALIDATE-012 활성 조각 아래의 에러만 노드에 — 에러 라우팅이 18라운드 안건으로 이관됨

- 결정:
  > 폼이 활성 조각을 알고 있으므로 `schemaPath`가 활성 조각 아래인 에러만 해당 노드에 표시한다.
- 보충:
  > "(5) "활성 조각 아래의 에러만 노드에"는 게이트 없는 분기가 모두 활성이므로 원장 §6에서 다시 정한다." (`adr/0001-validator-input-invariant.md:3`)
  > "검증 결과를 노드로 나누는 규칙(에러 라우팅)은 슬라이스 4의 설계 항목이다." (`08-design-a-to-z.md:349`)
  > "검증 에러 라우팅(Q12)과 union 호스트 수준 에러의 라우팅" (`reviews/round-18-agenda.md:108`)
- 상태: 대체됨(→ VALIDATE-043)
- 출처: `adr/0001-validator-input-invariant.md:44#2`(정본), `adr/0001-validator-input-invariant.md:3`, `08-design-a-to-z.md:349`, `03-mental-model.md:209`, `reviews/round-18-agenda.md:108`, `reviews/round-18-closing.md:1471-1495,1502-1503`
- 닫은 사람: 편집자 결정(11라운드, `adr/0001-validator-input-invariant.md:3` 5차 주 (5)), 편집자 결정(18라운드 안건 이관, `reviews/round-18-agenda.md:108`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-53)
- 라운드: 18
- 까닭: `adr/0001-validator-input-invariant.md:3`, `reviews/round-18-closing.md:1497-1500`

### VALIDATE-013 잔여 키의 표시는 플러그인 계약 `rejectedKey`

- 결정:
  > 잔여 키의 표시는 플러그인 계약 `rejectedKey`로 한다.
- 보충: 없음
- 상태: 중복(→ FRAGMENT-020)
- 출처: `08-design-a-to-z.md:349#10`(정본), `03-mental-model.md:151`, `08-design-a-to-z.md:419,466`, `06-conclusions.md:223`, `05-before-after.md:176`, `adr/0002-guard-fragment-model.md:135`, `reviews/round-5-derivations.md:26`
- 닫은 사람: 원리(`03-mental-model.md:151` P1), 편집자 결정(5라운드 도출, `reviews/round-5-derivations.md:26` C-4)
- 라운드: 5
- 까닭: `03-mental-model.md:151`

### VALIDATE-014 검증기를 내장하지 않음

- 결정:
  > 검증기를 내장하지 않는다.
- 보충: 없음
- 상태: 현행
- 출처: `adr/0004-validator-plugin-compile-guard.md:25#1`(정본), `08-design-a-to-z.md:345`, `02-target-overview.md:175`, `00-goals.md:145,146`
- 닫은 사람: 소유자 답(`00-goals.md:146` G3)
- 라운드: 1
- 까닭: `adr/0004-validator-plugin-compile-guard.md:15`

### VALIDATE-015 플러그인 계약 — `compile(schema)`와 `compileGuard(root, pointer)`의 모양

- 결정:
  > ```ts
  > compile(schema):      (value) => Promise<Errors | null> | Errors | null  // 전체 검증, 에러 수집
  > compileGuard(root, pointer): (value) => boolean                           // 동기, 첫 실패에서 중단
  > ```
- 보충: 없음
- 상태: 현행
- 출처: `adr/0004-validator-plugin-compile-guard.md:27-30`(정본), `adr/0004-validator-plugin-compile-guard.md:10,25`, `08-design-a-to-z.md:345,419,466`, `02-target-overview.md:175`
- 닫은 사람: 편집자 결정(16라운드, `09-landing-and-test-strategy.md:19` 조건 1)
- 라운드: 16
- 까닭: `adr/0004-validator-plugin-compile-guard.md:73`

### VALIDATE-016 가드는 동기 전용

- 결정:
  > - 가드는 **동기 전용**이다. 비동기 포맷·키워드는 가드에서 지원하지 않는다고 계약에 명시한다.
- 보충:
  > "가드는 동기 전용 — 소유자: "가드는 동기로 해도 될 것 같다."" (`adr/0004-validator-plugin-compile-guard.md:55`)
- 상태: 현행
- 출처: `adr/0004-validator-plugin-compile-guard.md:32`(정본), `adr/0004-validator-plugin-compile-guard.md:25,55`, `adr/0002-guard-fragment-model.md:182`
- 닫은 사람: 소유자 답(`adr/0004-validator-plugin-compile-guard.md:55` 가드는 동기 전용)
- 라운드: 1
- 까닭: `adr/0004-validator-plugin-compile-guard.md:20`

### VALIDATE-017 가드는 사본의 루트와 위치를 받아 루트 문맥에서 컴파일

- 결정:
  > - 가드 안의 `$ref`가 루트 정의를 가리킬 수 있으므로 루트 문맥에서 컴파일한다. 떼어 낸 `if`는 `$ref` 때문에 단독 컴파일이 실패하므로 가드는 사본(작성 스키마에서 키워드 위치의 그룹 객체 셋을 지운 복사본, 08 §3.4)의 루트와 위치를 받는다(아래 '가드를 컴파일하는 방식', 16라운드 실행 확인).
- 보충:
  > "`compile`은 사본을, `compileGuard`는 사본의 루트와 위치를 받는다." (`08-design-a-to-z.md:345`)
  > "동작이 확인된 방식은 루트를 한 번 등록하고 가드를 **루트 안의 위치로** 가리키는 것이다 — `addSchema(root)` 뒤에 `compile({ $ref: 'root#/allOf/0/if' })`. 공허한 참의 의미도 보존된다(실행)." (`adr/0004-validator-plugin-compile-guard.md:73`)
  > "가드를 떼어낸 새 객체로 컴파일하면 검증기의 객체 identity 캐시가 빗나가므로, 작성된 스키마 안의 위치로 식별한다(위 '결정' 절) — `$id` 기저 URI와 `$dynamicRef`의 문맥 문제도 함께 걸려 있다(`reviews/round-1.md` §7-6)." (`adr/0004-validator-plugin-compile-guard.md:46`)
- 상태: 현행
- 출처: `adr/0004-validator-plugin-compile-guard.md:33`(정본), `adr/0004-validator-plugin-compile-guard.md:46,73`, `08-design-a-to-z.md:345`, `02-target-overview.md:175`, `09-landing-and-test-strategy.md:19`
- 닫은 사람: 편집자 결정(16라운드, `09-landing-and-test-strategy.md:19` 조건 1)
- 라운드: 16
- 까닭: `adr/0004-validator-plugin-compile-guard.md:73`

### VALIDATE-018 사본·가드 캐시는 코어가 검증기 인스턴스마다 작성 루트 기준으로 듦

- 결정:
  > 캐시는 코어가 검증기 인스턴스마다 WeakMap<작성 루트, { 사본, 가드 표 }>로 든다(16라운드 편집자 결정, 답 10으로 확정).
- 보충:
  > "캐시의 키가 작성 루트이므로 같은 검증기 인스턴스를 쓰고 같은 스키마 객체로 만든 폼 인스턴스들이 컴파일을 공유한다(`validatorFactory`로 폼마다 다른 인스턴스를 주면 공유하지 않는다)." (`adr/0004-validator-plugin-compile-guard.md:34`)
  > 반영 칸(union O4, 스키마 사본): "검증기에 넘기는 스키마 사본은 (검증기 인스턴스, 작성 루트)마다 한 번 깊이 복사한다." (`reviews/round-18-owner-answers.md:34`)
- 상태: 현행
- 출처: `adr/0004-validator-plugin-compile-guard.md:34#1`(정본), `adr/0004-validator-plugin-compile-guard.md:10,34,46,73`, `08-design-a-to-z.md:345`, `09-landing-and-test-strategy.md:19,279`, `reviews/round-18-owner-answers.md:34`
- 닫은 사람: 편집자 결정(16라운드, `09-landing-and-test-strategy.md:19` 조건 1), 소유자 답(`reviews/round-16-owner-answers.md:16` 10), 소유자 답(`reviews/round-18-owner-answers.md:34` union O4; 깊은 사본)
- 라운드: 18
- 까닭: `09-landing-and-test-strategy.md:19`, `reviews/round-18-owner-answers.md:34`

### VALIDATE-019 플러그인의 `compileGuard`는 가드 캐시를 들지 않고 사본 루트의 등록은 플러그인의 검증기 인스턴스가 듦

- 결정:
  > 플러그인의 `compileGuard`는 가드 캐시를 들지 않고, 사본 루트의 등록(루트마다 한 번의 `addSchema`와 고유 키 배정)은 플러그인의 검증기 인스턴스가 든다(ajv는 같은 키의 재등록에 실패한다).
- 보충: 없음
- 상태: 현행
- 출처: `adr/0004-validator-plugin-compile-guard.md:34#3`(정본), `adr/0004-validator-plugin-compile-guard.md:10`, `08-design-a-to-z.md:345`, `09-landing-and-test-strategy.md:19,279`
- 닫은 사람: 편집자 결정(16라운드, `09-landing-and-test-strategy.md:19` 조건 1), 소유자 답(`reviews/round-16-owner-answers.md:16` 10)
- 라운드: 16
- 까닭: `09-landing-and-test-strategy.md:19`

### VALIDATE-020 같은 `$id` 사본 루트의 충돌 처리 — PR-4가 정함

- 결정:
  > `$id`가 있는 사본 루트는 고유 키를 주어도 `$id`로 충돌하며(ajv 8.17.1 실행 확인), 그 처리는 PR-4가 정한다(08 §17.2).
- 보충:
  > "살아 있는 두 트리의 같은 `$id` 충돌은 PR-4의 '같은 `$id` 루트의 중복 등록 처리'가 정하며 재생성 reset 시나리오를 그 시험에 넣는다(`reviews/raw-round16-reset.md` §4의 H3)." (`09-landing-and-test-strategy.md:88`)
  > "사본 루트 등록의 해제 계약 세부(§11.1: 최근 해제 목록의 크기, 참조 수의 증감 시점, 재생성 reset의 같은 `$id`)" (`08-design-a-to-z.md:493`)
  > "사본 루트 등록의 해제 계약 세부" (`reviews/round-18-agenda.md:108`)
- 상태: 대체됨(→ VALIDATE-046)
- 출처: `adr/0004-validator-plugin-compile-guard.md:34#4`(정본), `08-design-a-to-z.md:345,493`, `09-landing-and-test-strategy.md:19,88,259`, `adr/0014-error-policy.md:338`, `reviews/round-18-agenda.md:108`, `reviews/round-18-closing.md:1581-1591,1598-1606`
- 닫은 사람: 편집자 결정(16라운드, `09-landing-and-test-strategy.md:88` 여덟째), 편집자 결정(18라운드 안건 이관, `reviews/round-18-agenda.md:108`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-57)
- 라운드: 18
- 까닭: `09-landing-and-test-strategy.md:19`, `reviews/round-18-closing.md:1593-1596`

### VALIDATE-021 검증기 등록의 수명 — 참조 세기 + 최근 해제 목록

- 결정:
  > 살아 있는 트리는 자기 작성 루트 객체를 강하게 든다. 사본 루트의 등록과 가드는 그 작성 루트를 쓰는 살아 있는 트리가 있는 동안 남고, 마지막 트리가 폐기되면 크기 상한이 있는 최근 해제 목록에 두었다가 밀려날 때 푼다(참조 세기 + 최근 해제 목록). 참조 수는 커밋(효과)에서 올리고 그 정리에서 내린다. 렌더에서 만들어졌으나 커밋되지 않은 트리의 작성 루트는 참조 수 0으로 최근 해제 목록에 든다. 목록에서 밀려날 때 플러그인 등록과 함께 코어 캐시의 그 작성 루트 항목도 지운다(다음 마운트는 사본·가드·등록을 함께 다시 만든다). 같은 스키마 객체로 다시 마운트하면 다시 컴파일하지 않고(재생성 방지), 메모리 상한은 수거 시점과 무관하게 '살아 있는 작성 루트의 수 + 목록 크기'다(메모리 안정). 16라운드 답 10에서 편집자 도출이며 해제 방식은 16라운드 스웜 수렴(편집자 결정)으로 정했다(`FinalizationRegistry`는 정리 콜백의 호출이 보장되지 않아 기본 경로로 쓰지 않는다). 코어의 캐시는 WeakMap이지만 플러그인의 등록과 컴파일 결과는 강한 참조이기 때문이다. 같은 `$id`의 새 루트가 등록될 때 참조 수가 0인 옛 루트의 등록은 먼저 푼다.
- 보충:
  > "그래서 같은 스키마 객체로 다시 마운트하거나(StrictMode의 흉내 언마운트 포함) 목록 안에서 돌아오면 다시 컴파일하지 않고(재생성 방지), 메모리 상한은 가비지 수거 시점과 무관하게 '살아 있는 작성 루트의 수 + 목록 크기'로 정해진다(메모리 안정, 모바일 경제성)." (`09-landing-and-test-strategy.md:88`)
  > "재생성 경로의 reset에서는 새 루트를 등록할 때 옛 트리가 아직 살아 있으므로(일곱째의 원자성, 참조 수는 효과 정리에서 내린다) 이 규칙이 아니라 다음 문장의 충돌에 든다." (`09-landing-and-test-strategy.md:88`)
- 상태: 현행
- 출처: `08-design-a-to-z.md:345#9-17`(정본), `09-landing-and-test-strategy.md:88`
- 닫은 사람: 스웜 수렴(편집자 결정, `09-landing-and-test-strategy.md:88`), 원리(`08-design-a-to-z.md:36` 고속성)
- 라운드: 16
- 까닭: `reviews/round-16-owner-answers.md:16`
- 충돌:
  > `08-design-a-to-z.md:493`의 "사본 루트 등록의 해제 계약 세부(§11.1: 최근 해제 목록의 크기, 참조 수의 증감 시점, 재생성 reset의 같은 `$id`)"는 정본이 정한 참조 수의 증감 시점을 미정으로 적는다. 정본이 이긴다(`08-design-a-to-z.md:345`, `09-landing-and-test-strategy.md:88`).

### VALIDATE-022 최근 해제 목록의 크기와 해제 계약의 세부가 18라운드 안건으로 이관됨

- 결정:
  > 목록의 크기와 해제 계약의 세부는 슬라이스 4의 설계 항목이다(09 §2.6의 여덟째).
- 보충:
  > "사본 루트 등록의 해제 계약 세부" (`reviews/round-18-agenda.md:108`)
- 상태: 대체됨(→ VALIDATE-045)
- 출처: `08-design-a-to-z.md:345#18`(정본), `09-landing-and-test-strategy.md:88`, `08-design-a-to-z.md:493`, `reviews/round-18-agenda.md:108`, `reviews/round-18-closing.md:1554-1568,1574-1575`
- 닫은 사람: 편집자 결정(18라운드 안건 이관, `reviews/round-18-agenda.md:108`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-56)
- 라운드: 18
- 까닭: `09-landing-and-test-strategy.md:88`, `reviews/round-18-closing.md:1570-1572`

### VALIDATE-023 `compileGuard`의 `$id`·`$dynamicRef` 문맥이 18라운드 안건으로 이관됨

- 결정:
  > `compileGuard`의 `$id`·`$dynamicRef` 문맥은 슬라이스 4의 설계 항목이며, 가드의 컴파일 실패는 그 게이트의 가드 실패다(§5의 다섯째).
- 보충:
  > "인스턴스 사이 공유의 나머지 세부, `$id`·`$dynamicRef` 문맥은 미정(07 11.2)이다." (`02-target-overview.md:175`)
  > "`$id` 기저 URI와 `$dynamicRef`에서 따로 컴파일한 게이트가 문맥 평가와 같은 답을 내는지" (`reviews/round-18-agenda.md:108`)
  > "17라운드에 닫혔다: 가드 컴파일의 실패는 폼 생성의 실패가 아니라 그 게이트의 가드 실패(정착 오류)이고, 전체 스키마 컴파일의 실패는 검증 불가다(위 결정 절, ADR 0014 4판)." (`adr/0004-validator-plugin-compile-guard.md:78`)
- 상태: 대체됨(→ VALIDATE-047)
- 출처: `08-design-a-to-z.md:345#33`(정본), `02-target-overview.md:175`, `adr/0004-validator-plugin-compile-guard.md:46`, `08-design-a-to-z.md:493`, `reviews/round-18-agenda.md:108`, `reviews/round-18-closing.md:1612-1616,1622-1632`
- 닫은 사람: 편집자 결정(18라운드 안건 이관, `reviews/round-18-agenda.md:108`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-58)
- 라운드: 18
- 까닭: `adr/0004-validator-plugin-compile-guard.md:46`, `reviews/round-18-closing.md:1618-1620`

### VALIDATE-024 Form 속성 `validatorFactory` — 유지하고 넓힘, 같은 계약, 플러그인보다 앞섬

- 결정:
  > - Form 속성 `validatorFactory`는 유지하고 넓힌다(14라운드 답 O-7: '플러그인을 통한 전역 속성이 아니라 특정 커스텀 검증기 등을 추가한 커스텀 인스턴스 주입기'). 플러그인은 전역 기본이고 속성은 그 폼의 검증기 인스턴스이며, 같은 계약(`compile` + `compileGuard`)을 받고 플러그인보다 앞선다. 미등록 판정은 둘을 함께 본다.
- 보충:
  > 소유자(14라운드 O-7): "맞긴 한데, 이건 plungin 을 통한 전역 속성이 아니라 특정 커스텀 검증기 등을 추가한 커스텀 인스턴스 주입기임. 제거할 이유가 있나? 설계를 확장하라. 필요한 기능이다." (`reviews/round-14-owner-answers.md:13`)
  > "`validatorFactory`와 플러그인의 계약 통일" (`reviews/round-18-agenda.md:108`)
- 상태: 분할됨(→ VALIDATE-040, VALIDATE-041, VALIDATE-042)
- 출처: `adr/0004-validator-plugin-compile-guard.md:37`(정본), `adr/0014-error-policy.md:211`, `08-design-a-to-z.md:345`, `02-target-overview.md:175`, `reviews/round-14-owner-answers.md:13`, `reviews/round-18-agenda.md:108`
- 닫은 사람: 소유자 답(`reviews/round-14-owner-answers.md:13` O-7)
- 라운드: 14
- 까닭: `reviews/round-14-owner-answers.md:13`

### VALIDATE-025 플러그인 패키지가 변경 범위에 듦

- 결정:
  > - 플러그인 패키지들이 변경 범위에 들어간다.
- 보충:
  > "검증기 미등록 시 "조건부 비활성 + 경고" — 소유자: "동의. 단, 그럼 플러그인도 변경 범위에 포함해서, error 처리를 생략한 단순 검증 기능도 제공하도록 하자."" (`adr/0004-validator-plugin-compile-guard.md:54`)
- 상태: 현행
- 출처: `adr/0004-validator-plugin-compile-guard.md:36`(정본), `adr/0004-validator-plugin-compile-guard.md:54`
- 닫은 사람: 소유자 답(`adr/0004-validator-plugin-compile-guard.md:54`)
- 라운드: 1
- 까닭: `adr/0004-validator-plugin-compile-guard.md:54`

### VALIDATE-026 플러그인의 방언 선언과 개발 모드 경고 — 받음(12-4)

- 결정:
  > - 제안(미수락): 플러그인이 자기 방언을 선택적으로 선언하고, 스키마의 `$schema`와 어긋나면 개발 모드에서 **경고만** 낸다. `$schema` 없는 2020-12 스키마의 `dependentRequired`가 draft-07 엔트리에서 조용히 무시되는 부류의 사고를 싸게 잡는다.
- 보충:
  > "방언 선언 + 개발 모드 경고는 제안으로 남겼다" (`reviews/round-1.md:178`)
  > 열린 부분(제안 전부 — 받는지): "1라운드부터 미수락으로 남은 "방언 선언과 개발 모드 경고" 제안을 받는가" (`reviews/round-18-agenda.md:162`)
  > 소유자(12-4 답): "경고정도는 주도록 합시다" (`reviews/round-18-owner-answers.md:14`)
  > 반영 칸(12-4, 받음): "받는다. 플러그인이 자기 방언을 선택적으로 선언하고, 스키마의 `$schema`와 어긋나면 개발 모드에서 경고만 낸다(프로덕션 출력 없음, `onError` 핸들러가 있으면 경고 기록)." (`reviews/round-18-owner-answers.md:14`)
- 상태: 현행
- 출처: `adr/0004-validator-plugin-compile-guard.md:42`(정본), `reviews/round-1.md:178`, `reviews/round-18-owner-answers.md:14`(경고 코드는 ERROR-188)
- 닫은 사람: 편집자 결정(1라운드, `reviews/round-1.md:178` 반영 칸), 소유자 답(`reviews/round-18-owner-answers.md:14` 12-4)
- 라운드: 18
- 까닭: `reviews/round-18-owner-answers.md:14`

### VALIDATE-027 인터프리터형 검증기는 플러그인으로 허용, 성능 예산은 AJV 기준

- 결정:
  > 플러그인으로 허용하되 성능 예산은 AJV를 기준으로 잡는다(ADR 0009).
- 보충:
  > "인터프리터형 검증기는 같은 작업이 약 70배 느리고 호스트 객체의 폭에 비례한다(`@cfworker/json-schema`: 가드 200개에 578 µs, 아이템 10,000개를 훑는 `contains` 가드 하나에 4.5 ms)." (`adr/0004-validator-plugin-compile-guard.md:48`)
  > "`@cfworker/json-schema`는 내장 후보가 아니라 플러그인 구현체 후보 가운데 하나가 된다." (`adr/0004-validator-plugin-compile-guard.md:64`)
  > "인터프리터형 검증기의 지원 수준, 컴파일 예산" (`reviews/round-18-agenda.md:67`)
  > "**인터프리터형 검증기를 어느 수준까지 지원하는가.** 성능 예산을 AJV 기준으로 잡으면 인터프리터형은 "동작하지만 큰 폼에서는 느리다"가 된다." (`adr/0009-performance-budget-and-benchmarks.md:100`)
  > 소유자(12-3 답): "검증기의 성능은 우리가 관여할 문제가 아닙니다만. 뭘 말하는건지요?" (`reviews/round-18-owner-answers.md:13`)
  > 반영 칸(12-3, 가로 읽음): "가로 읽는다. 검증기의 성능은 폼이 관여할 문제가 아니므로 폼은 아무 장치도 더하지 않는다(역색인 없음, `if` 내용 불관여 유지). 예산은 AJV 기준으로 적고, 인터프리터형은 "동작하되 성능은 플러그인의 몫"으로 문서화한다." (`reviews/round-18-owner-answers.md:13`)
- 상태: 현행
- 출처: `adr/0004-validator-plugin-compile-guard.md:48#2`(정본), `adr/0004-validator-plugin-compile-guard.md:48,64`, `adr/0009-performance-budget-and-benchmarks.md:100,102`, `reviews/round-18-agenda.md:67`, `reviews/round-18-owner-answers.md:13`
- 닫은 사람: 편집자 결정(1라운드, `adr/0004-validator-plugin-compile-guard.md:44` R18), 소유자 답(`reviews/round-18-owner-answers.md:13` 12-3), 편집자 결정(18라운드, `reviews/round-18-owner-answers.md:13` 반영 칸; 답을 가로 읽음)
- 라운드: 18
- 까닭: `reviews/round-18-owner-answers.md:13`, `adr/0004-validator-plugin-compile-guard.md:48`

### VALIDATE-028 기각한 대안 — 작은 검증기 내장, AJV 내장

- 결정:
  > - **작은 검증기를 내장하고 플러그인이 있으면 그것을 쓴다.** 같은 개념에 평가기가 둘이면 서로 다른 답을 낼 수 있다. 현재 구조에서 이미 확인된 문제다(`requiredFactory`와 표현식 컴파일러, `01-current-structure.md` §3).
  > - **AJV 내장.** 번들이 커지고 플러그인 분리의 장점이 없어진다(소유자의 판단).
- 보충: 없음
- 상태: 현행(부정 결정)
- 출처: `adr/0004-validator-plugin-compile-guard.md:59-60`(정본), `adr/0004-validator-plugin-compile-guard.md:15`, `00-goals.md:146`
- 닫은 사람: 소유자 답(`00-goals.md:146` G3), 편집자 결정(1라운드, `adr/0004-validator-plugin-compile-guard.md:59-60`)
- 라운드: 1
- 까닭: `adr/0004-validator-plugin-compile-guard.md:59`

### VALIDATE-029 대체됨: CSP-safe 검증기의 비교는 ADR 0010의 외부 조사 항목

- 결정:
  > CSP-safe 검증기의 비교는 ADR 0010의 외부 조사 항목이다.
- 보충: 없음
- 상태: 대체됨(→ VALIDATE-030)
- 출처: `adr/0004-validator-plugin-compile-guard.md:64#4`(정본), `adr/0004-validator-plugin-compile-guard.md:3`
- 닫은 사람: 편집자 결정(11라운드, `adr/0004-validator-plugin-compile-guard.md:3` 5차 주 (2))
- 라운드: 11
- 까닭: `adr/0004-validator-plugin-compile-guard.md:3`

### VALIDATE-030 ADR 0010은 분기 관행 문서(외부 조사 항목 아님)

- 결정:
  > (2) ADR 0010은 분기 관행 문서다(외부 조사 항목 아님).
- 보충: 없음
- 상태: 현행
- 출처: `adr/0004-validator-plugin-compile-guard.md:3#4`(정본)
- 닫은 사람: 편집자 결정(11라운드, `adr/0004-validator-plugin-compile-guard.md:3` 5차 주 (2))
- 라운드: 11
- 까닭: `adr/0004-validator-plugin-compile-guard.md:3`

### VALIDATE-031 대체됨: 효과가 있는 것은 변경 경로 → 가드의 역색인

- 결정:
  > 효과가 있는 것은 변경 경로 → 가드의 역색인이고, 그것이 필요한지는 검증기에 달려 있다(ADR 0005 §2, 0009).
- 보충: 없음
- 상태: 대체됨(→ VALIDATE-032)
- 출처: `adr/0004-validator-plugin-compile-guard.md:65#4`(정본), `adr/0004-validator-plugin-compile-guard.md:3`
- 닫은 사람: 편집자 결정(11라운드, `adr/0004-validator-plugin-compile-guard.md:3` 5차 주 (1))
- 라운드: 11
- 까닭: `adr/0004-validator-plugin-compile-guard.md:3`

### VALIDATE-032 변경 경로 → 가드의 역색인은 기각

- 결정:
  > 5차 원장과 다른 곳은 원장이 우선한다: (1) 변경 경로 → 가드의 역색인은 ADR 0005 §2와 0006이 기각했다(E13).
- 보충: 없음
- 상태: 현행(부정 결정)
- 출처: `adr/0004-validator-plugin-compile-guard.md:3#3`(정본)
- 닫은 사람: 편집자 결정(11라운드, `adr/0004-validator-plugin-compile-guard.md:3` 5차 주 (1))
- 라운드: 11
- 까닭: `adr/0004-validator-plugin-compile-guard.md:3`

### VALIDATE-033 가드용 인스턴스와 검증용 인스턴스의 설정을 같게 두는 규칙은 플러그인이 가짐

- 결정:
  > - 가드용 인스턴스는 첫 실패에서 멈춰야 하는데(`allErrors: false`) Ajv에서 그것은 인스턴스 옵션이다. 검증용과 가드용 인스턴스의 나머지 설정(format, 커스텀 키워드, 방언)을 같게 유지하는 규칙을 플러그인이 가져야 한다. `bind`는 모듈 전역이어서 설정의 단위가 폼이 아니라 프로세스다.
- 보충: 없음
- 상태: 현행
- 출처: `adr/0004-validator-plugin-compile-guard.md:77`(정본), `adr/0004-validator-plugin-compile-guard.md:71`
- 닫은 사람: 편집자 결정(2라운드, `adr/0004-validator-plugin-compile-guard.md:71` S12)
- 라운드: 2
- 까닭: `adr/0004-validator-plugin-compile-guard.md:77`

### VALIDATE-034 `options.virtual`은 제거 목록에 들고 `required` 재작성은 버림

- 결정:
  > (4)의 `options.virtual` 처리는 12라운드에 닫혔다: `options.virtual`은 제거 목록에 들고 `required` 재작성은 버린다.
- 보충:
  > "(4) `options.virtual`의 처리는 12라운드에 닫힘: `options.virtual`은 검증기 앞 제거 목록에 들고 `required` 재작성은 버린다(원장 §1.4)(검증기에는 작성된 스키마를 그대로 넘기는가)." (`adr/0001-validator-input-invariant.md:3`)
  > 소유자(12라운드 8): "우리는 투명한 jsonSchema 를 추구하므로, virtual 여부와 무관한 실제 필드 명시를 요구하는 바이다." (`reviews/round-12-owner-answers.md:16`)
- 상태: 현행
- 출처: `adr/0001-validator-input-invariant.md:3#18`(정본), `adr/0001-validator-input-invariant.md:3`, `03-mental-model.md:173`, `reviews/round-12-owner-answers.md:16`, `reviews/round-10-owner-answers.md:31`, `adr/0011-branch-node-composition.md:3`
- 닫은 사람: 소유자 답(`reviews/round-12-owner-answers.md:16` 8 `virtual`), 소유자 답(`reviews/round-10-owner-answers.md:31` E-4)
- 라운드: 12
- 까닭: `reviews/round-12-owner-answers.md:16`

### VALIDATE-035 대체됨: `options.virtual`의 `required` 재작성은 이 결정과 충돌(Q5)

- 결정:
  > - `options.virtual`이 표준 `required`에 가상 이름을 올리는 현재 방식은 이 결정과 충돌한다. `open-questions.md` Q5.
- 보충: 없음
- 상태: 대체됨(→ VALIDATE-034)
- 출처: `adr/0001-validator-input-invariant.md:51`(정본), `adr/0001-validator-input-invariant.md:3,15`
- 닫은 사람: 소유자 답(`reviews/round-12-owner-answers.md:16` 8 `virtual`)
- 라운드: 12
- 까닭: `reviews/round-12-owner-answers.md:16`

### VALIDATE-036 `&if`만으로 분기를 구분한 기존 스키마는 폼에서도 invalid — 의도된 파괴적 변경

- 결정:
  > - `&if`만으로 분기를 구분한 기존 스키마는 폼에서도 invalid가 된다. 의도된 파괴적 변경이다.
- 보충: 없음
- 상태: 현행
- 출처: `adr/0001-validator-input-invariant.md:50`(정본)
- 닫은 사람: 원리(`03-mental-model.md:13` P1)
- 라운드: 1
- 까닭: `adr/0001-validator-input-invariant.md:50`

### VALIDATE-037 가드 컴파일의 인스턴스 사이 공유의 나머지 세부 — 슬라이스 4의 설계 항목

- 결정:
  > 공유의 나머지 세부는 슬라이스 4의 설계 항목이다(ADR 0009: 가드 하나 70–270 µs, 200개면 14–54 ms).
- 보충:
  > "인스턴스 사이 공유의 나머지 세부(§5·§11.1이 정한 캐시 밖)" (`08-design-a-to-z.md:493`)
  > "인스턴스 사이 공유의 나머지 세부, `$id`·`$dynamicRef` 문맥은 미정(07 11.2)이다." (`02-target-overview.md:175`)
- 상태: 대체됨(→ VALIDATE-048)
- 출처: `08-design-a-to-z.md:180#10`(정본), `08-design-a-to-z.md:493`, `02-target-overview.md:175`, `reviews/round-18-closing.md:2136-2145`
- 닫은 사람: 편집자 결정(16라운드, `08-design-a-to-z.md:180`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-79)
- 라운드: 18
- 까닭: `08-design-a-to-z.md:180`, `reviews/round-18-closing.md:2147-2148`

### VALIDATE-038 잔여 키의 표시는 렌더 계층의 몫 — Q12와 함께 정함

- 결정:
  > 표시는 렌더 계층의 몫이고 Q12와 함께 정한다.
- 보충:
  > "검증 에러 라우팅(Q12)과 union 호스트 수준 에러의 라우팅" (`reviews/round-18-agenda.md:108`)
- 상태: 대체됨(→ VALIDATE-043)
- 출처: `adr/0006-single-value-ownership.md:99#5`(정본), `reviews/round-18-agenda.md:108`, `reviews/round-18-closing.md:1471-1495,1502-1503`
- 닫은 사람: 편집자 결정(5라운드 4차 본문, `adr/0006-single-value-ownership.md:99`), 편집자 결정(18라운드 안건 이관(Q12), `reviews/round-18-agenda.md:108`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-53)
- 라운드: 18
- 까닭: `adr/0006-single-value-ownership.md:99`, `reviews/round-18-closing.md:1497-1500`

### VALIDATE-039 검증을 입력 경로에서 떼어 내는 법(R19) — 커밋 번호 스탬프는 경합만 막음

- 결정:
  > - **검증을 입력 경로에서 떼어 내는 법 (R19).** 커밋 번호 스탬프는 경합만 막는다.
- 보충:
  > "Validate는 정의상 폼 전체 크기에 비례한다." (`reviews/round-1.md:83`)
  > "입력 경로에서 떼어 내고(디바운스·유휴·워커) 제출 시에는 반드시 새로 검증한다" (`reviews/round-1.md:83`)
  > "R19 검증은 폼 전체 크기에 비례한다 | 안 닫힘" (`reviews/round-2.md:72`)
- 상태: 분할됨(→ VALIDATE-049, VALIDATE-006)
- 출처: `adr/0007-settle-cycle.md:150`(정본), `reviews/round-1.md:83`, `reviews/round-2.md:72`, `HANDOFF.md:91`, `reviews/round-18-closing.md:2154-2160`
- 닫은 사람: 편집자 결정(5라운드 4차 본문, `adr/0007-settle-cycle.md:150`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-80; 소유자 답 O-6·D-10·12-3을 엮음)
- 라운드: 18
- 까닭: `reviews/round-1.md:83`, `reviews/round-18-closing.md:2162-2165`, `reviews/round-14-owner-answers.md:12`, `reviews/round-4.md:116`, `reviews/round-18-owner-answers.md:13`

### VALIDATE-040 Form 속성 `validatorFactory`는 유지하고 넓힘

- 결정:
  > Form 속성 `validatorFactory`는 유지하고 넓힌다(14라운드 답 O-7: '플러그인을 통한 전역 속성이 아니라 특정 커스텀 검증기 등을 추가한 커스텀 인스턴스 주입기').
- 보충:
  > 소유자(14라운드 O-7): "맞긴 한데, 이건 plungin 을 통한 전역 속성이 아니라 특정 커스텀 검증기 등을 추가한 커스텀 인스턴스 주입기임. 제거할 이유가 있나? 설계를 확장하라. 필요한 기능이다." (`reviews/round-14-owner-answers.md:13`)
- 상태: 현행
- 출처: `adr/0004-validator-plugin-compile-guard.md:37#1`(정본, VALIDATE-024에서 분할), `adr/0014-error-policy.md:211`, `08-design-a-to-z.md:345`, `02-target-overview.md:175`, `reviews/round-14-owner-answers.md:13`
- 닫은 사람: 소유자 답(`reviews/round-14-owner-answers.md:13` O-7)
- 라운드: 14
- 까닭: `reviews/round-14-owner-answers.md:13`

### VALIDATE-041 플러그인은 전역 기본, 속성은 그 폼의 인스턴스 — 같은 계약, 플러그인보다 앞섬(계약 통일은 VALIDATE-044)

- 결정:
  > 플러그인은 전역 기본이고 속성은 그 폼의 검증기 인스턴스이며, 같은 계약(`compile` + `compileGuard`)을 받고 플러그인보다 앞선다.
- 보충:
  > "`validatorFactory`와 플러그인의 계약 통일" (`reviews/round-18-agenda.md:108`)
  > "`validatorFactory`와 플러그인의 계약 통일" (`08-design-a-to-z.md:493`)
  > 편집자 결정(18C-54): "【추론】 (1) 계약 형은 하나다(가칭 `Validator`)." (`reviews/round-18-closing.md:1509`)
- 상태: 현행
- 출처: `adr/0004-validator-plugin-compile-guard.md:37#2`(정본, VALIDATE-024에서 분할), `08-design-a-to-z.md:345,493`, `02-target-overview.md:175`, `reviews/round-18-agenda.md:108`, `reviews/round-18-closing.md:1509-1523`
- 닫은 사람: 소유자 답(`reviews/round-14-owner-answers.md:13` O-7), 편집자 결정(18라운드 안건 이관, `reviews/round-18-agenda.md:108`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-54)
- 라운드: 18
- 까닭: `reviews/round-14-owner-answers.md:13`, `reviews/round-18-closing.md:1525-1527`

### VALIDATE-042 미등록 판정은 플러그인과 `validatorFactory`를 함께 봄

- 결정:
  > 미등록 판정은 둘을 함께 본다.
- 보충: 없음
- 상태: 현행
- 출처: `adr/0004-validator-plugin-compile-guard.md:37#3`(정본, VALIDATE-024에서 분할), `08-design-a-to-z.md:345`
- 닫은 사람: 소유자 답(`reviews/round-14-owner-answers.md:13` O-7)
- 라운드: 14
- 까닭: `reviews/round-14-owner-answers.md:13`

### VALIDATE-043 검증 에러 라우팅 — 판정 불변, 폼 수준 목록, `dataPath` 배정, 잔여 키는 호스트, 터미널 아래는 터미널, 꺼진 union 분기만 표시에서 거름, union 호스트 에러는 호스트

- 결정:
  > 【추론】 (1) 라우팅은 판정을 바꾸지 않는다.
  > 【추론】 모든 에러는 순서대로 폼 수준 목록에 남는다.
  > 【추론】 폼 수준 목록은 루트의 `globalErrors`다(18C-41).
  > 【추론】 아래 규칙으로 어느 노드에도 싣지 않은 에러가 주인 없는 에러다.
  > 【추론】 (2) 배정은 플러그인이 정규화한 `dataPath`로 한다.
  > 【추론】 `required`는 빠진 자식의 경로다(오늘 ajv 플러그인과 같음, `schema-form-ajv8-plugin/src/validator/utils/transformErrors.ts:42-53`).
  > 【추론】 (3) `rejectedKey`가 있는 에러는 그 키를 든 호스트 노드(형상 안)의 `errors`에 그대로 싣는다.
  > 【추론】 잔여 키의 목록·문구·UI는 렌더 계층의 일이다(REACT-026, 18C-77).
  > 【추론】 (4) `dataPath`와 경로가 같은 형상 안의 노드가 받는다.
  > 【추론】 그 경로가 터미널 노드 아래면 그 터미널 노드가 받고, `dataPath`는 그대로 둔다.
  > 【추론】 형상 안에 그런 노드가 없으면 노드에 싣지 않는다(꺼진 조각에만 선언된 필드 등).
  > 【추론】 (5) 꺼진 분기 거르기(표시 필터): `schemaPath`가 `oneOf`·`anyOf`의 한 분기 안으로 풀리고, 그 분기가 꺼져 있고, 같은 union에 켜진 분기가 있으면 그 에러는 노드에 싣지 않고 폼 수준 목록에만 남는다.
  > 【추론】 켜진 분기가 없거나 귀속을 가를 수 없으면 거르지 않는다(`$ref`로 여러 분기가 같은 위치를 쓰는 경우, 원격 `$id`).
  > 【추론】 게이트 없는 분기는 늘 켜져 있으므로 걸리지 않는다.
  > 【추론】 `allOf` 항목·`if`/`then`/`else`·`controls.active` 조각은 거르지 않는다.
  > 【추론】 그 에러는 저마다 판정을 막기 때문이다.
  > 【추론】 귀속은 청사진의 조각 표(분기 위치와 `$ref` 대상)로 한다.
  > 【추론】 `if`의 내용은 읽지 않는다.
  > 【추론】 (6) `oneOf`·`anyOf` 자체의 에러는 (4)대로 호스트 노드가 받는다.
  > 【추론】 판별 노드로 옮기는 특례는 두지 않는다.
  > 【추론】 판별 값이 어느 분기와도 맞지 않으면 켜진 분기가 없어 (5)가 거르지 않는다.
  > 【추론】 그래서 분기별 `const` × N과 판별 키의 `required`는 `dataPath`대로 판별 노드가 받는다.
  > 【추론】 판별 노드는 `controls.discriminator`가 끌어올려 늘 형상에 있다.
  > 【추론】 같은 문구의 중복 표시와 번역은 렌더 계층(`formatError`)의 몫이다.
  > 【추론】 새 코드는 없다(검증 결과는 `onError` 밖).
  > PR: PR-4 시험.
  > 무엇: 규칙 (5)의 귀속이 플러그인마다 다른 `$ref` 아래 `schemaPath` 모양에서 맞는지 ajv6·7·8 사례로 본다.
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-18-closing.md:1471-1495,1502-1503`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-53)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:1497-1500`

### VALIDATE-044 검증기 계약 형 `Validator`(가칭) 하나 — `compile`·`compileGuard`·선택 `release`·방언, 고르는 순서 Form > `FormProvider` > 플러그인, 참조가 바뀌면 재생성, 가드는 동기 boolean

- 결정:
  > 【추론】 (1) 계약 형은 하나다(가칭 `Validator`).
  > 【추론】 `Validator`는 `compile(copy)`, `compileGuard(root, pointer)`, 선택 `release(root)`(18C-56), 선택 방언 선언(VALIDATE-026), 그리고 `compile` 결과 함수의 에러 정규화(`dataPath`, 루트 경로 표기, `rejectedKey`)를 담는다.
  > 【추론】 플러그인은 여기에 소비자 훅 `bind?`만 더 가진다.
  > 【추론】 core는 `bind`를 부르지 않는다.
  > 【추론】 `<Form validatorFactory>`(이름 유지, O-7)와 오늘의 `FormProvider` 속성 `validatorFactory`는 이 형을 그대로 받는다.
  > 【추론】 (2) 고르는 순서는 Form 속성 > `FormProvider` > 등록한 플러그인이다.
  > 【추론】 오늘의 순서다(`RootNodeContextProvider.tsx:94`, `ValidationManager.ts:203`).
  > 【추론】 바인딩 계층이 트리를 만들 때 한 번 고르고, 그 결과나 없음을 core에 인자로 넘긴다(18C-55).
  > 【추론】 미등록 판정은 고른 결과가 없음인 것이다(VALIDATE-042와 같은 뜻).
  > 【추론】 (3) 고른 검증기의 참조가 트리 생성 뒤 바뀌면 다른 스키마와 같이 재생성한다.
  > 【추론】 캐시와 등록이 검증기 인스턴스마다이기 때문이다.
  > 【추론】 오늘도 `useMemo` 의존으로 트리를 다시 만든다(`RootNodeContextProvider.tsx:85-104`).
  > 【추론】 매 렌더 새 객체를 주지 말라고 문서화한다.
  > 【추론】 (4) 가드 함수는 같은 값에 같은 boolean을 동기로 돌려준다.
  > 【추론】 던지거나 boolean이 아닌 값(비동기 스키마의 Promise 등)을 내면 그 평가는 가드 실패(`GUARD_FAILED`, 정착 오류)다.
- 보충:
  > 반영 칸(union O4, 계약 문장): "나. `Validator` 문서 주석에 계약 문장을 넣는다: "core는 `compile` 결과와 가드에 방출 트리를 참조로 넘긴다. 검증기와 가드는 받은 값과 받은 스키마를 바꾸지 않는다. 값을 바꾸는 사용자 정의 키워드(ajv `modifying: true` 등)를 쓰지 않는 것은 소비자의 책임이다."" (`reviews/round-18-owner-answers.md:34`)
- 상태: 현행
- 출처: `reviews/round-18-closing.md:1509-1523`(정본), `reviews/round-18-owner-answers.md:34`
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-54), 소유자 답(`reviews/round-18-owner-answers.md:34` union O4; 계약 문장)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:1525-1527`, `reviews/round-18-owner-answers.md:34`

### VALIDATE-045 최근 해제 목록 크기 8(검증기 인스턴스마다, 내부) — 밀려날 때와 같은 `$id` 재등록 직전에만 `release(root)`, 상한 '살아 있는 루트 + 8'

- 결정:
  > 【추론】 최근 해제 목록은 검증기 인스턴스마다 하나이고, 크기는 8이다(내부 상수, 공개 옵션 아님).
  > 【추론】 가득 차면 가장 먼저 해제된 루트부터 밀려난다.
  > 【추론】 목록 안의 루트가 다시 커밋되면 목록에서 빠지고 다시 컴파일하지 않는다.
  > 【추론】 푸는 때는 둘뿐이다: 목록에서 밀려날 때, 그리고 같은 루트 `$id`의 새 루트를 등록하기 직전의 목록 안(참조 수 0) 옛 루트(VALIDATE-021)다.
  > 【추론】 참조 수가 1 이상인 루트는 풀지 않는다.
  > 【추론】 core는 플러그인의 `release(root)`를 루트마다 한 번 부른다.
  > 【추론】 플러그인은 등록(ajv `removeSchema(key)`)과 컴파일 결과를 버린다.
  > 【추론】 이어 core는 자기 캐시의 그 작성 루트 항목을 지운다.
  > 【추론】 `release`가 없으면 core 캐시만 지운다.
  > 【추론】 이 저장소의 ajv 플러그인 셋은 `release`를 구현한다.
  > 【추론】 플러그인 계약에 선택 `release`를 더하는 것은 minor다.
  > 【추론】 메모리 상한은 검증기 인스턴스마다 '살아 있는 루트 수 + 8'이다.
  > 【추론】 목록이 흡수할 것은 StrictMode의 흉내 언마운트, 커밋되지 않은 렌더, 몇 개 스키마를 오가는 화면이다.
  > 【추론】 서버에서는 효과가 돌지 않아 모든 트리가 참조 수 0으로 목록에 든다.
  > 【추론】 목록이 작아야 서버 메모리가 묶인다.
  > PR: PR-4 시험.
  > 무엇: 서로 다른 스키마로 1,000번 마운트·언마운트한 뒤 등록 수가 '살아 있는 루트 + 8' 이하인지, 같은 객체를 다시 마운트하면 컴파일이 0번인지 본다.
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-18-closing.md:1554-1568,1574-1575`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-56)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:1570-1572`

### VALIDATE-046 같은 `$id`의 두 살아 있는 루트는 저마다 판정 — 떼어 두기는 플러그인 계약, PR-4 게이트 넷(오류·경고 아님은 ERROR-201)

- 결정:
  > 【추론】 서로 다른 작성 루트 객체가 같은 `$id`(루트나 안쪽 자원)를 가진 채 동시에 살아 있을 수 있다.
  > 【추론】 같은 화면의 두 폼이 그렇고, 재생성 reset에서 옛 트리가 아직 살아 있을 때도 그렇다.
  > 【추론】 이때 두 트리는 저마다 자기 루트로 판정한다(G1).
  > 【추론】 루트마다 등록을 떼어 두는 것은 플러그인 계약이다.
  > 【추론】 한 인스턴스에 둘 수 없으면 같은 설정의 다른 인스턴스에 등록한다.
  > 【추론】 core는 `$id`를 고치지 않는다.
  > PR: PR-4.
  > 대상: ajv6·7·8 플러그인 각각, 기본 인스턴스와 `bind(instance)`로 받은 소비자 인스턴스 둘 다.
  > (i) 같은 루트 `$id`의 두 루트를 동시에 살렸을 때 `compile`·`compileGuard`가 저마다 독립 ajv와 같은 판정을 내는가.
  > (ii) 안쪽 `$id`가 겹치는 경우와, 절대 URI로 자기를 가리키는 `$ref`.
  > (iii) 재생성 reset의 원자성(H3, `reviews/raw-round16-reset.md:42`).
  > (iv) 한쪽을 `release`한 뒤에도 다른 쪽의 늦은 가드 컴파일이 맞는가.
  > 통과: 넷 모두 판정이 같고 오류 기록이 없다.
  > 실패(특히 `bind` 인스턴스를 같은 설정으로 복제할 수 없을 때): 소유자에게 올린다.
  > 실패의 선택지: (가) 소비자 인스턴스의 같은 `$id` 동시 사용을 지원 밖으로 문서화하고 위의 오류로 드러냄, (나) `bind`가 인스턴스 대신 인스턴스를 만드는 함수를 받게 함.
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-18-closing.md:1581-1586,1598-1606`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-57)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:1593-1596`

### VALIDATE-047 따로 컴파일한 가드는 전체 검증의 `if`와 같은 boolean — `$id`·동적 범위 포함, 플러그인 계약, PR-4 게이트 넷

- 결정:
  > 【추론】 `compileGuard(root, pointer)`의 함수는 같은 호스트 값에 대해, 전체 검증이 그 위치의 `if`를 평가할 때와 같은 boolean을 내야 한다.
  > 【추론】 `$id` 기저 URI와 `$dynamicRef`/`$recursiveRef`의 동적 범위를 포함한다.
  > 【추론】 이것은 플러그인 계약이며, 폼은 `if`의 내용을 읽지 않는다.
  > 【추론】 위치마다 가드는 하나다.
  > 【추론】 컴파일 실패는 가드 실패다(현행).
  > PR: PR-4, 대상 ajv7·8(ajv6은 (i)만).
  > 사례 (i): 안쪽 `$id` 자원 안의 `if`와 상대 `$ref`.
  > 사례 (ii): 2020-12 `$dynamicRef`/`$dynamicAnchor` 확장 패턴을 지나는 `if`.
  > 사례 (iii): 2019-09 `$recursiveRef`.
  > 사례 (iv): 한 `$defs` 위치를 동적 범위가 다른 두 경로가 쓰는 경우.
  > 통과: 가드의 답이 전체 검증에서 관측한 `if`의 답과 모든 사례에서 같다.
  > 관측은 then/else 에러 유무로 판별하는 짝 스키마로 한다.
  > 실패 — (iv)만 어긋나면: "한 위치를 여러 동적 범위에서 쓰는 가드"를 지원 범위 밖으로 문서화하는 권고와 함께 소유자에게 올린다.
  > `if` 안을 읽는 경고는 E-19·E-23과 부딪히므로 두지 않는다.
  > 실패 — (i)–(iii)이 어긋나면: 가드 컴파일 방식을 PR-4가 고친다.
  > 못 고치면 소유자에게 올린다.
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-18-closing.md:1612-1616,1622-1632`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-58)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:1618-1620`

### VALIDATE-048 가드 컴파일의 공유 단위는 (검증기 인스턴스, 작성 루트 identity) — 전체 검증 함수도 같은 캐시 항목, 수명은 가드와 같음

- 결정:
  > 【추론】 공유 단위는 (검증기 인스턴스, 작성 루트 객체의 identity) 하나다.
  > 【추론】 구조가 같은 다른 객체는 공유하지 않는다.
  > 【추론】 해시나 직렬화 비교를 하지 않는다.
  > 【추론】 같은 캐시 항목에 전체 검증 함수(`compile(사본)`의 결과, 실패했으면 그 실패)도 담는다.
  > 【추론】 그러면 같은 인스턴스·같은 작성 루트로 만든 폼들은 전체 컴파일도 한 번만 한다.
  > 【추론】 검증 불가 기록은 여전히 폼의 로드마다 한 번씩 낸다(ERROR 영역의 `VALIDATOR_COMPILE_FAILED` 행).
  > 【추론】 개발 모드의 "모든 가드를 한 번 컴파일해 보기"도 캐시 항목마다 한 번이다.
  > 【추론】 이 항목의 수명과 해제는 가드와 같다(VALIDATE-021).
  > 【추론】 `validatorFactory`가 폼마다 새 인스턴스를 주면 공유하지 않는다는 점은 문서에 적는다(VALIDATE-018 보충과 같다).
  > 【추론】 같은 `$id` 충돌, 최근 해제 목록의 크기, `$id`·`$dynamicRef` 문맥은 이 항목이 아니다(18C-56, 18C-57, 18C-58).
- 보충:
  > 편집자 결정(18C-101): "【추론】 "한 로드에 한 번"(VALIDATE-048)은 `resetSubtree()`에는 그 하위 트리에만 적용한다." (`reviews/round-18-closing.md:2850`)
  > 편집자 결정(18C-105): "【추론】 `VALIDATOR_COMPILE_FAILED`는 폼 수준 기록이다." (`reviews/round-18-closing.md:2946`)
  > 편집자 결정(18C-105): "【추론】 그 기록은 폼 수준 로드(마운트, `FormHandle.reset()`)마다 한 번 낸다." (`reviews/round-18-closing.md:2947`)
  > 편집자 결정(18C-105): "【추론】 `resetSubtree()`는 그 기록을 다시 내지도 초기화하지도 않으며, 그 기록이 막은 `OnChange` 검증 예약은 다음 폼 수준 로드까지 막힌 채다." (`reviews/round-18-closing.md:2948`)
- 상태: 현행
- 출처: `reviews/round-18-closing.md:2136-2145`(정본), `reviews/round-18-closing.md:2850`, `reviews/round-18-closing.md:2946-2948`
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-79), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-101), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-105)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:2147-2148`, `reviews/round-18-closing.md:2853-2855`

### VALIDATE-049 폼은 검증을 입력 경로에서 떼어 내는 장치를 두지 않음 — 진입당 요청 1회와 마이크로태스크 합치기, 빈도 조절은 `OnRequest`, 제출은 새로 검증

- 결정:
  > 【추론】 폼은 검증을 입력 경로에서 떼어 내는 장치를 따로 두지 않는다.
  > 【추론】 진입당 요청 1회와 마이크로태스크 합치기(O-6, EVENT-028)로 빈도만 줄이며, 큰 폼의 키 입력당 검증 비용은 남는다.
  > 【추론】 디바운스·유휴·워커는 폼에 두지 않는다(D-10, 12-3).
  > 【추론】 요청은 최외곽 진입당 한 번 하고, 실행은 마이크로태스크에 모아 최신 커밋 번호 하나만 돌린다(EVENT-028).
  > 【추론】 워커나 인터프리터 쪽 최적화는 검증기 플러그인의 몫이며, `compile`은 비동기 검증 함수를 돌려줄 수 있다.
  > 【추론】 검증 빈도를 줄이려는 호스트는 `ValidationMode`의 `OnRequest`를 쓴다.
  > 【추론】 제출은 캐시된 판정이 아니라 보내는 스냅숏을 새로 검증한다.
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-18-closing.md:2154-2160`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-80)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:2162-2165`

### VALIDATE-050 값을 바꾸는 검증기 옵션 — `Validator` 문서 주석의 계약 문장, ajv 플러그인 셋의 `bind`는 `coerceTypes`·`useDefaults`·`removeAdditional`을 켠 인스턴스를 거부(가칭 `VALIDATOR_BIND_REFUSED`), 사용자 정의 변경 키워드는 소비자 책임, 스키마 사본은 깊은 복사 한 번

- 결정:
  > 나. `Validator` 문서 주석에 계약 문장을 넣는다: "core는 `compile` 결과와 가드에 방출 트리를 참조로 넘긴다. 검증기와 가드는 받은 값과 받은 스키마를 바꾸지 않는다. 값을 바꾸는 사용자 정의 키워드(ajv `modifying: true` 등)를 쓰지 않는 것은 소비자의 책임이다."
  > ajv 플러그인 셋(ajv6·7·8)의 `bind(instance)`는 `coerceTypes`·`useDefaults`·`removeAdditional` 가운데 하나라도 켜진 인스턴스를 거부하며, 옵션은 ajv7·8이면 `instance.opts`, ajv6이면 `instance._opts`에서 읽는다.
  > 켜져 있으면 `(가칭) UNHANDLED_ERROR.VALIDATOR_BIND_REFUSED`를 부른 쪽에 즉시 던지고, 인스턴스를 붙이지 않는다.
  > 폼 인스턴스가 없으므로 `onError`는 받지 않으며, `UNHANDLED_ERROR.REGISTER_PLUGIN` 행과 같은 부류다.
  > 사본 경로는 두지 않는다.
  > 사용자 정의 키워드의 `modifying`은 옵션으로 알아낼 수 없으므로 판별하지 않고, 런타임 감지도 약속하지 않으며, 소비자 책임으로 둔다.
  > VALIDATE-002의 "같은 설정"은 값을 바꾸는 옵션을 쓰지 않는 것을 포함하며, 이 가운데 세 옵션은 이제 `bind`가 강제한다.
  > 검증기에 넘기는 스키마 사본은 (검증기 인스턴스, 작성 루트)마다 한 번 깊이 복사한다.
- 보충:
  > 소유자(union O4): "추가 설명 필요. ajv 플러그인에 대한 이야기입니까? ajv 의 값변경 옵션에 대해서? 이건 의도적으로 금지해도 됩니다. 저희가 제어할 수 없는거니까" (`reviews/round-18-owner-answers.md:34`)
- 상태: 현행
- 출처: `reviews/round-18-owner-answers.md:34`(정본, 반영 칸)
- 닫은 사람: 소유자 답(`reviews/round-18-owner-answers.md:34` union O4)
- 라운드: 18
- 까닭: `reviews/round-18-owner-answers.md:34`

### VALIDATE-051 union과 검증기 — ajv8 기본 설정에 `allowUnionTypes: true`(판정 불변, 로그만 없앰), core는 검증에 넘기는 값을 복사하지 않음, 어긋난 union 값과 통째 값 안쪽의 에러는 union 노드가 받음, 규칙 A·경고등은 검증기를 쓰지 않음

- 결정:
  > 【추론】 ajv8 플러그인의 세 진입점(`default`·`2019`·`2020`) 기본 설정에 `allowUnionTypes: true`를 더한다.
  > 【추론】 `allowUnionTypes`는 판정을 바꾸지 않고, `strictTypes`의 기본값 `"log"`가 union `type`마다 내는 `console.warn`만 없앤다.
  > 【추론】 ajv7은 이미 `strict: false`이고, ajv6에는 strict 모드가 없으므로 둘은 바꾸지 않는다.
  > 【추론】 core는 검증에 넘기는 값을 복사하지 않는다(VALIDATE-049).
  > 【추론】 어긋난 union 값의 형 에러와 union 객체·배열 값 안쪽의 에러는 union 노드가 받고, `dataPath`는 그대로 둔다(VALIDATE-043 (4)).
  > 【추론】 규칙 A와 경고등은 검증기를 쓰지 않으며, 형 밖의 제약(`enum`, `properties`·`items`, 그 밖의 키워드)과 게이트가 뺀 `null`은 검증기가 판정한다(BLUEPRINT-033, P1′).
  > 【추론】 멤버십은 얕게만 보며, 통째로 든 값 안의 JSON 부정합은 `NON_JSON_WHOLE_VALUE` 개발 모드 경고로만 드러내고 폼은 값을 정규화하지 않는다(VALIDATE-007).
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-18-closing.md:2462-2464,2551-2554`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-90·18C-91)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:2466-2471`, `reviews/round-18-closing.md:2556-2564`
