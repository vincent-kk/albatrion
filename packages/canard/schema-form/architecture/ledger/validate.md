# 단일 원장 — 검증기

기준 커밋: `ba398c330`(저장소 `packages/canard/schema-form/architecture`). 정본 우선순위는 다음 순서다. (1) 소유자 답은 고정이다. (2) 채택된 ADR이 정본이다. 이 영역에서는 `adr/0004-validator-plugin-compile-guard.md`(상태: 수락)가 정본이다. `adr/0001-validator-input-invariant.md`는 상태가 "제안"이고 검증기 설정 부분만 수락되었으므로, 그 규칙이 온전히 적힌 곳이 그 ADR뿐일 때 정본으로 쓴다. (3) `03-mental-model.md`(원장)는 08과 다르면 원장이 이긴다(08이 스스로 그렇게 적는다). (4) 뒤 라운드가 앞 라운드를 이긴다. `05-before-after.md`·`06-conclusions.md`·`07-conclusions.md`는 그때의 기록이며 고치지 않는다. 오류·경고로 드러나는 검증기 규칙(검증기의 출처, 검증기 없음, 조건부 스키마와 검증기 없음, 검증 불가, 검증 실행 실패, 로드 검증의 자리, 가드의 컴파일 시점과 실패, 이주 안내)은 `ledger/error.md`에 있고 이 파일에 다시 적지 않는다. 출처의 `path:line#n`은 그 줄의 n번째 문장 하나이고, `path:line#a-b`는 그 줄의 a번째부터 b번째까지의 연속한 문장들이다.

## 색인

| 번호 | 한 줄 요약 | 상태 | 닫은 사람 |
| --- | --- | --- | --- |
| VALIDATE-001 | 판정 불변식 — 폼의 판정은 검증기(작성된 스키마, 방출 값), FE 추가 검사는 AND로만 | 현행 | 소유자 답(`00-goals.md:141` G1, 방향), 원리(`03-mental-model.md:13` P1) |
| VALIDATE-002 | 계약의 읽기 — 같은 설정의 검증기 | 현행 | 소유자 답(`reviews/round-1.md:178` 계약을 검증기 프로필로 한정하는가 (R1)), 소유자 답(`reviews/round-2.md:112` C5) |
| VALIDATE-003 | 검증기 설정은 소비자의 책임 — `bind(instance)`, 기본값 불변, format은 의지적으로 | 현행 | 소유자 답(`reviews/round-1.md:178` 계약을 검증기 프로필로 한정하는가 (R1)) |
| VALIDATE-004 | 검증기 앞 제거 — 키워드 위치의 그룹 객체 셋을 사본에서만 | 현행 | 소유자 답(`reviews/round-15-decisions.md:12` 4), 소유자 답(`reviews/round-15-decisions.md:13` 5), 편집자 결정(2라운드, `adr/0001-validator-input-invariant.md:10` S1) |
| VALIDATE-005 | 소비자의 커스텀 키는 지우지 않음 — strict 모드는 기본이 아님 | 현행 | 소유자 답(`reviews/round-1.md:178` 계약을 검증기 프로필로 한정하는가 (R1)) |
| VALIDATE-006 | 판정은 커밋 번호에 묶임 — 늦은 결과 버림, `isValid`, 제출은 보내는 스냅숏을 검증 | 현행 | 편집자 결정(1라운드, `reviews/round-1.md:181` 판정의 revision 채택), 편집자 결정(11라운드, `adr/0001-validator-input-invariant.md:3` 5차 주 (3)) |
| VALIDATE-007 | 방출 값은 JSON 직렬화 뒤와 같은 값 | 현행 | 편집자 결정(1라운드, `adr/0001-validator-input-invariant.md:11`) |
| VALIDATE-008 | `ValidationMode.None`은 판정을 제공하지 않음(통과가 아님) | 현행 | 편집자 결정(1라운드, `adr/0001-validator-input-invariant.md:11`) |
| VALIDATE-009 | 에러 라우팅은 판정을 바꾸지 않음 | 현행 | 편집자 결정(1라운드, `adr/0001-validator-input-invariant.md:38`) |
| VALIDATE-010 | 마커 장치가 모두 사라지고 두 경로가 같은 계약을 가짐 | 현행 | 원리(`03-mental-model.md:13` P1) |
| VALIDATE-011 | 주인 없는 검증 에러를 모으는 폼 수준 sink | 현행 | 원리(`03-mental-model.md:13` P1), 소유자 답(`00-goals.md:105` C2), 소유자 답(`reviews/round-2.md:112` 목표 후보 C1–C8) |
| VALIDATE-012 | 활성 조각 아래의 에러만 노드에 — 에러 라우팅이 18라운드 안건으로 이관됨 | 열림(→ `reviews/round-18-agenda.md:108`) | 편집자 결정(11라운드, `adr/0001-validator-input-invariant.md:3` 5차 주 (5)), 편집자 결정(18라운드 안건 이관, `reviews/round-18-agenda.md:108`) |
| VALIDATE-013 | 잔여 키의 표시는 플러그인 계약 `rejectedKey` | 중복(→ FRAGMENT-020) | 원리(`03-mental-model.md:151` P1), 편집자 결정(5라운드 도출, `reviews/round-5-derivations.md:26` C-4) |
| VALIDATE-014 | 검증기를 내장하지 않음 | 현행 | 소유자 답(`00-goals.md:146` G3) |
| VALIDATE-015 | 플러그인 계약 — `compile(schema)`와 `compileGuard(root, pointer)`의 모양 | 현행 | 편집자 결정(16라운드, `09-landing-and-test-strategy.md:19` 조건 1) |
| VALIDATE-016 | 가드는 동기 전용 | 현행 | 소유자 답(`adr/0004-validator-plugin-compile-guard.md:55` 가드는 동기 전용) |
| VALIDATE-017 | 가드는 사본의 루트와 위치를 받아 루트 문맥에서 컴파일 | 현행 | 편집자 결정(16라운드, `09-landing-and-test-strategy.md:19` 조건 1) |
| VALIDATE-018 | 사본·가드 캐시는 코어가 검증기 인스턴스마다 작성 루트 기준으로 듦 | 현행 | 편집자 결정(16라운드, `09-landing-and-test-strategy.md:19` 조건 1), 소유자 답(`reviews/round-16-owner-answers.md:16` 10) |
| VALIDATE-019 | 플러그인의 `compileGuard`는 가드 캐시를 들지 않고 사본 루트의 등록은 플러그인의 검증기 인스턴스가 듦 | 현행 | 편집자 결정(16라운드, `09-landing-and-test-strategy.md:19` 조건 1), 소유자 답(`reviews/round-16-owner-answers.md:16` 10) |
| VALIDATE-020 | 같은 `$id` 사본 루트의 충돌 처리 — PR-4가 정함 | 열림(→ `reviews/round-18-agenda.md:108`) | 편집자 결정(16라운드, `09-landing-and-test-strategy.md:88` 여덟째), 편집자 결정(18라운드 안건 이관, `reviews/round-18-agenda.md:108`) |
| VALIDATE-021 | 검증기 등록의 수명 — 참조 세기 + 최근 해제 목록 | 현행 | 스웜 수렴(편집자 결정, `09-landing-and-test-strategy.md:88`), 원리(`08-design-a-to-z.md:36` 고속성) |
| VALIDATE-022 | 최근 해제 목록의 크기와 해제 계약의 세부가 18라운드 안건으로 이관됨 | 열림(→ `reviews/round-18-agenda.md:108`) | 편집자 결정(18라운드 안건 이관, `reviews/round-18-agenda.md:108`) |
| VALIDATE-023 | `compileGuard`의 `$id`·`$dynamicRef` 문맥이 18라운드 안건으로 이관됨 | 열림(→ `reviews/round-18-agenda.md:108`) | 편집자 결정(18라운드 안건 이관, `reviews/round-18-agenda.md:108`) |
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
| VALIDATE-037 | 가드 컴파일의 인스턴스 사이 공유의 나머지 세부 — 슬라이스 4의 설계 항목 | 열림(→ `reviews/round-18-agenda.md:143` 11-12) | 편집자 결정(16라운드, `08-design-a-to-z.md:180`) |
| VALIDATE-038 | 잔여 키의 표시는 렌더 계층의 몫 — Q12와 함께 정함 | 열림(→ `reviews/round-18-agenda.md:108`) | 편집자 결정(5라운드 4차 본문, `adr/0006-single-value-ownership.md:99`), 편집자 결정(18라운드 안건 이관(Q12), `reviews/round-18-agenda.md:108`) |
| VALIDATE-039 | 검증을 입력 경로에서 떼어 내는 법(R19) — 커밋 번호 스탬프는 경합만 막음 | 열림(→ `reviews/round-18-agenda.md:144` 11-13) | 편집자 결정(5라운드 4차 본문, `adr/0007-settle-cycle.md:150`) |
| VALIDATE-040 | Form 속성 `validatorFactory`는 유지하고 넓힘 | 현행 | 소유자 답(`reviews/round-14-owner-answers.md:13` O-7) |
| VALIDATE-041 | 플러그인은 전역 기본, 속성은 그 폼의 인스턴스 — 같은 계약, 플러그인보다 앞섬(계약 통일은 18라운드 안건) | 열림(→ `reviews/round-18-agenda.md:108`) | 소유자 답(`reviews/round-14-owner-answers.md:13` O-7), 편집자 결정(18라운드 안건 이관, `reviews/round-18-agenda.md:108`) |
| VALIDATE-042 | 미등록 판정은 플러그인과 `validatorFactory`를 함께 봄 | 현행 | 소유자 답(`reviews/round-14-owner-answers.md:13` O-7) |

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
- 상태: 현행
- 출처: `adr/0001-validator-input-invariant.md:30-34`(정본), `adr/0001-validator-input-invariant.md:5,11`, `adr/0004-validator-plugin-compile-guard.md:41`, `00-goals.md:108`, `reviews/round-2.md:112`
- 닫은 사람: 소유자 답(`reviews/round-1.md:178` 계약을 검증기 프로필로 한정하는가 (R1)), 소유자 답(`reviews/round-2.md:112` C5)
- 라운드: 2
- 까닭: `reviews/round-1.md:178`

### VALIDATE-003 검증기 설정은 소비자의 책임 — `bind(instance)`, 기본값 불변, format은 의지적으로

- 결정:
  > - 서버와 검증기 설정(방언, format 검사, 커스텀 키워드)을 맞추는 것은 소비자의 책임이다. 수단은 이미 있는 `bind(instance)`다. 기본값(`allErrors`, `strictSchema: false`, `validateFormats: false`)은 바꾸지 않는다. format 검사는 소비자가 의지적으로 켠다.
- 보충: 없음
- 상태: 현행
- 출처: `adr/0004-validator-plugin-compile-guard.md:41`(정본), `adr/0004-validator-plugin-compile-guard.md:52`, `adr/0001-validator-input-invariant.md:5,34`, `reviews/round-1.md:178`
- 닫은 사람: 소유자 답(`reviews/round-1.md:178` 계약을 검증기 프로필로 한정하는가 (R1))
- 라운드: 1
- 까닭: `reviews/round-1.md:178`

### VALIDATE-004 검증기 앞 제거 — 키워드 위치의 그룹 객체 셋을 사본에서만

- 결정:
  > 키워드 위치의 그룹 객체 셋 `controls`·`options`·`presentation`을 지운다. 지우는 이유는 판정이 아니라 컴파일이다(ADR 0003 §7). 작성된 스키마 자체는 변형하지 않고 검증기에 넘길 사본에서만 지운다(ADR 0001). 오늘은 여섯 키(`FormTypeInput`, `FormTypeInputProps`, `FormTypeRendererProps`, `errorMessages`, `options`, `injectTo`)만 지우고 `&` 키·`computed`·`virtual`·`terminal` 등은 검증기까지 가므로, 그룹 셋으로 옮기는 것이 이주 항목이다. 서버 스키마에 넘길 때도 같은 셋을 지우면 되고, 서버 스키마와 클라이언트 스키마를 합칠 때는 그룹 셋만 덧붙이면 된다.
- 보충:
  > "**허용되는 스키마 변형은 하나다 — 폼 전용 키를 키워드 위치에서만 제거하는 것.**" (`adr/0001-validator-input-invariant.md:24`)
  > "현재 `stripSchemaExtensions`가 하는 일이고(`JSONSchemaScanner`로 위치를 구분한다) 그대로 둔다(목록은 그룹 객체 셋으로 닫힌다, ADR 0003 §7)." (`adr/0001-validator-input-invariant.md:24`)
  > "제거가 필요한 이유는 판정이 아니라 **검증기의 컴파일**이다: 폼 전용 키의 값에 순환하거나 깊은 객체가 있으면(`presentation.FormTypeInputProps`의 자기 참조, 개발 빌드의 React 엘리먼트) `ajv.compile`이 스택 초과로 죽는다(`reviews/round-2.md` S1, 실행)." (`adr/0001-validator-input-invariant.md:24`)
- 상태: 현행
- 출처: `08-design-a-to-z.md:147`(정본), `adr/0001-validator-input-invariant.md:3,24`, `adr/0003-group-namespace.md:125,127`
- 닫은 사람: 소유자 답(`reviews/round-15-decisions.md:12` 4), 소유자 답(`reviews/round-15-decisions.md:13` 5), 편집자 결정(2라운드, `adr/0001-validator-input-invariant.md:10` S1)
- 라운드: 15
- 까닭: `reviews/round-2.md:82`, `00-goals.md:144`
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
- 보충: 없음
- 상태: 현행
- 출처: `adr/0001-validator-input-invariant.md:36`(정본), `adr/0001-validator-input-invariant.md:11`, `08-design-a-to-z.md:605`
- 닫은 사람: 편집자 결정(1라운드, `adr/0001-validator-input-invariant.md:11`)
- 라운드: 1
- 까닭: `adr/0001-validator-input-invariant.md:36`

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
- 상태: 열림(→ `reviews/round-18-agenda.md:108`)
- 출처: `adr/0001-validator-input-invariant.md:44#2`(정본), `adr/0001-validator-input-invariant.md:3`, `08-design-a-to-z.md:349`, `03-mental-model.md:209`, `reviews/round-18-agenda.md:108`
- 닫은 사람: 편집자 결정(11라운드, `adr/0001-validator-input-invariant.md:3` 5차 주 (5)), 편집자 결정(18라운드 안건 이관, `reviews/round-18-agenda.md:108`)
- 라운드: 18
- 까닭: `adr/0001-validator-input-invariant.md:3`

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
- 상태: 현행
- 출처: `adr/0004-validator-plugin-compile-guard.md:34#1`(정본), `adr/0004-validator-plugin-compile-guard.md:10,34,46,73`, `08-design-a-to-z.md:345`, `09-landing-and-test-strategy.md:19,279`
- 닫은 사람: 편집자 결정(16라운드, `09-landing-and-test-strategy.md:19` 조건 1), 소유자 답(`reviews/round-16-owner-answers.md:16` 10)
- 라운드: 16
- 까닭: `09-landing-and-test-strategy.md:19`

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
- 상태: 열림(→ `reviews/round-18-agenda.md:108`)
- 출처: `adr/0004-validator-plugin-compile-guard.md:34#4`(정본), `08-design-a-to-z.md:345,493`, `09-landing-and-test-strategy.md:19,88,259`, `adr/0014-error-policy.md:338`, `reviews/round-18-agenda.md:108`
- 닫은 사람: 편집자 결정(16라운드, `09-landing-and-test-strategy.md:88` 여덟째), 편집자 결정(18라운드 안건 이관, `reviews/round-18-agenda.md:108`)
- 라운드: 18
- 까닭: `09-landing-and-test-strategy.md:19`

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
- 상태: 열림(→ `reviews/round-18-agenda.md:108`)
- 출처: `08-design-a-to-z.md:345#18`(정본), `09-landing-and-test-strategy.md:88`, `08-design-a-to-z.md:493`, `reviews/round-18-agenda.md:108`
- 닫은 사람: 편집자 결정(18라운드 안건 이관, `reviews/round-18-agenda.md:108`)
- 라운드: 18
- 까닭: `09-landing-and-test-strategy.md:88`

### VALIDATE-023 `compileGuard`의 `$id`·`$dynamicRef` 문맥이 18라운드 안건으로 이관됨

- 결정:
  > `compileGuard`의 `$id`·`$dynamicRef` 문맥은 슬라이스 4의 설계 항목이며, 가드의 컴파일 실패는 그 게이트의 가드 실패다(§5의 다섯째).
- 보충:
  > "인스턴스 사이 공유의 나머지 세부, `$id`·`$dynamicRef` 문맥은 미정(07 11.2)이다." (`02-target-overview.md:175`)
  > "`$id` 기저 URI와 `$dynamicRef`에서 따로 컴파일한 게이트가 문맥 평가와 같은 답을 내는지" (`reviews/round-18-agenda.md:108`)
  > "17라운드에 닫혔다: 가드 컴파일의 실패는 폼 생성의 실패가 아니라 그 게이트의 가드 실패(정착 오류)이고, 전체 스키마 컴파일의 실패는 검증 불가다(위 결정 절, ADR 0014 4판)." (`adr/0004-validator-plugin-compile-guard.md:78`)
- 상태: 열림(→ `reviews/round-18-agenda.md:108`)
- 출처: `08-design-a-to-z.md:345#33`(정본), `02-target-overview.md:175`, `adr/0004-validator-plugin-compile-guard.md:46`, `08-design-a-to-z.md:493`, `reviews/round-18-agenda.md:108`
- 닫은 사람: 편집자 결정(18라운드 안건 이관, `reviews/round-18-agenda.md:108`)
- 라운드: 18
- 까닭: `adr/0004-validator-plugin-compile-guard.md:46`

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
- 상태: 열림(→ `reviews/round-18-agenda.md:143` 11-12)
- 출처: `08-design-a-to-z.md:180#10`(정본), `08-design-a-to-z.md:493`, `02-target-overview.md:175`
- 닫은 사람: 편집자 결정(16라운드, `08-design-a-to-z.md:180`)
- 라운드: 16
- 까닭: `08-design-a-to-z.md:180`

### VALIDATE-038 잔여 키의 표시는 렌더 계층의 몫 — Q12와 함께 정함

- 결정:
  > 표시는 렌더 계층의 몫이고 Q12와 함께 정한다.
- 보충:
  > "검증 에러 라우팅(Q12)과 union 호스트 수준 에러의 라우팅" (`reviews/round-18-agenda.md:108`)
- 상태: 열림(→ `reviews/round-18-agenda.md:108`)
- 출처: `adr/0006-single-value-ownership.md:99#5`(정본), `reviews/round-18-agenda.md:108`
- 닫은 사람: 편집자 결정(5라운드 4차 본문, `adr/0006-single-value-ownership.md:99`), 편집자 결정(18라운드 안건 이관(Q12), `reviews/round-18-agenda.md:108`)
- 라운드: 18
- 까닭: `adr/0006-single-value-ownership.md:99`

### VALIDATE-039 검증을 입력 경로에서 떼어 내는 법(R19) — 커밋 번호 스탬프는 경합만 막음

- 결정:
  > - **검증을 입력 경로에서 떼어 내는 법 (R19).** 커밋 번호 스탬프는 경합만 막는다.
- 보충:
  > "Validate는 정의상 폼 전체 크기에 비례한다." (`reviews/round-1.md:83`)
  > "입력 경로에서 떼어 내고(디바운스·유휴·워커) 제출 시에는 반드시 새로 검증한다" (`reviews/round-1.md:83`)
  > "R19 검증은 폼 전체 크기에 비례한다 | 안 닫힘" (`reviews/round-2.md:72`)
- 상태: 열림(→ `reviews/round-18-agenda.md:144` 11-13)
- 출처: `adr/0007-settle-cycle.md:150`(정본), `reviews/round-1.md:83`, `reviews/round-2.md:72`, `HANDOFF.md:91`
- 닫은 사람: 편집자 결정(5라운드 4차 본문, `adr/0007-settle-cycle.md:150`)
- 라운드: 5
- 까닭: `reviews/round-1.md:83`

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

### VALIDATE-041 플러그인은 전역 기본, 속성은 그 폼의 인스턴스 — 같은 계약, 플러그인보다 앞섬(계약 통일은 18라운드 안건)

- 결정:
  > 플러그인은 전역 기본이고 속성은 그 폼의 검증기 인스턴스이며, 같은 계약(`compile` + `compileGuard`)을 받고 플러그인보다 앞선다.
- 보충:
  > "`validatorFactory`와 플러그인의 계약 통일" (`reviews/round-18-agenda.md:108`)
  > "`validatorFactory`와 플러그인의 계약 통일" (`08-design-a-to-z.md:493`)
- 상태: 열림(→ `reviews/round-18-agenda.md:108`)
- 출처: `adr/0004-validator-plugin-compile-guard.md:37#2`(정본, VALIDATE-024에서 분할), `08-design-a-to-z.md:345,493`, `02-target-overview.md:175`, `reviews/round-18-agenda.md:108`
- 닫은 사람: 소유자 답(`reviews/round-14-owner-answers.md:13` O-7), 편집자 결정(18라운드 안건 이관, `reviews/round-18-agenda.md:108`)
- 라운드: 18
- 까닭: `reviews/round-14-owner-answers.md:13`

### VALIDATE-042 미등록 판정은 플러그인과 `validatorFactory`를 함께 봄

- 결정:
  > 미등록 판정은 둘을 함께 본다.
- 보충: 없음
- 상태: 현행
- 출처: `adr/0004-validator-plugin-compile-guard.md:37#3`(정본, VALIDATE-024에서 분할), `08-design-a-to-z.md:345`
- 닫은 사람: 소유자 답(`reviews/round-14-owner-answers.md:13` O-7)
- 라운드: 14
- 까닭: `reviews/round-14-owner-answers.md:13`
