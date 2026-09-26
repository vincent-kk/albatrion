# 14라운드 — 표현자유도 축 검증 원문 (로컬 verifier, opus)

2026-09-24. 편집자는 고치지 않았다. 판정과 반영은 `round-14-values-check.md`.

표현자유도 축 판정: 조건부 통과입니다. 오늘 쓰는 동작은 대부분 새 표기로 옮겨지지만, 이주 목록 누락 둘과 `&discriminator`의 문서 간 모순 하나가 조용한 동작 변화를 만듭니다.

손실 표 (오늘의 표기 | 새 표기 또는 "손실" | 근거)
| `if/then: {required:[x]}`로 x 표시 조절(오늘은 `then.required`가 x의 `computed.active`가 됨) | x를 `then.properties`에 선언하거나 `&active`. 5차 이주 목록에 없음 | `src/.../mergeShowConditions.ts:17-29`, `07-conclusions.md:422`, `adr/0003:96` |
| `&if`·`computed.if: "./kind === 'a'"`(기준점이 호스트) | 분기 객체 `&active: "../kind === 'a'"`. 경로를 고쳐야 함 | `README.md:1657`, `03-mental-model.md:119`, `adr/0003:94` |
| `const`·`enum` 자동 감지 | `&discriminator` + 호스트 `properties`에 태그 선언(표준 키 수정) 또는 분기별 `&active` | `adr/0005:84`, `03:178` |
| 맨 키 `disabled`·`visible`·`active`, `computed.*`, `injectTo`, `&pristine` | `&disabled`…, `control.*`(`watch` 수용 여부는 미정), `&injectTo`, `&resetInteraction` | `adr/0003:96`, `03:198` |
| 루트 스키마 `readOnly`·`disabled`(전역 잠금), 루트 `readOnly:false`(노드 식 해제), 루트 `pristine`(전역 초기화) | Form 속성 `readOnly`·`disabled`, `clearState` 호출. 스키마만으로는 손실 | `checkComputedOptionFactory.ts:22-26`, `03:38` |
| 조상 잠금 상속 | 오늘도 없음(렌더 계층의 루트 잠금만). 리프마다 `&readOnly` 또는 수준마다 `&children` | `SchemaNodeInput.tsx:111`, `03:46` |
| `injectTo` 순환 자동 차단(A→B→A에서 역주입 차단) | 손실. 예산 초과 신호와 원본 B. 이주 목록에 없음 | `README.md:1883`, `03:115` |
| `&derived` 레벨 평가 | 에지 평가. `&readOnly` 병용 시 같은 효과 | `07:275` |
| `virtual` 그룹, `required`의 가상 이름 펼침 | 현행 유지, 실제 필드 명시 | `03:53` |
| `type: 'virtual'` 노드 | 노드 종류 여섯에 없음. 불명 | `adr/0005:60` |
| `options.trim`, `maxItems` push 차단 | 손실(입력 컴포넌트로 위임, 의도) | `adr/0013:85-86` |
| `minItems` 자동 채움 | `default`·`&default` 배열로 부분 대체(생성 시 한 번) | `adr/0013:86` |
| `additionalProperties:false`의 미선언 키 제거 | 손실. `extras`로 보존·방출, 스키마로 지울 수단 없음 | `BranchStrategy.ts:774`, `adr/0013:88` |
| 분기 재활성 시 로드 값 복원 | 기본 유지 또는 `unsetOnInactive` + 채움. 로드 값 복원은 손실 | `adr/0013:89` |
| `oneOfIndex`·`anyOfIndices` | 손실. 판별 필드의 값을 읽는다 | `07:346` |

요구 시나리오 표 (요구 | 새 설계 스키마 | 적을 수 있는가 | 비고)
| 조건부 필수(값) | `allOf:[{if:{properties:{kind:{const:'biz'}},required:['kind']},then:{required:['bizNo']}}]` | 예(판정) | 노드 `required` 표시가 켜진 `then`을 반영하는지 문서 없음(`types/formTypeInput.ts:43`) |
| 조건부 필수(맥락 `@`) | 없음 | 아니오 | `&`는 판정에 닿지 못함(`adr/0003:26`). `adr/0002:165`은 "`&`로만 쓴다"고 하나 `&required`가 없음 |
| 값 파생 | `total:{'&derived':'../price * ../qty','&readOnly':true}` | 예 | 로드에서도 발화 |
| 분기 전환 시 정리 | `'&discriminator':'kind'`, 호스트 `properties.kind`, `oneOf:[{control:{unsetOnInactive:true},…}]` 또는 Form `unsetOnInactive` | 예, 공유 노드 제외 | 같은 이름·종류 필드는 나가지 않아 안 지워짐. `&children` 두 항목의 `unsetValue`로 우회. 조각 `control` 식의 나감 발화는 미정(`03:191`) |
| 읽기 전용 뷰 | Form `readOnly` | 스키마로는 아니오 | 13라운드 소유자 결정 |
| 배열 항목 조건 | `items:{properties:{type:{},detail:{'&active':"../type==='x'"}}}` 또는 `items` 안 `if/then` | 예 | 항목 색인과 배열 길이를 읽는 문법이 문서에 없음 |
| 중첩 객체 잠금 | 리프마다 `'&readOnly':'/locked'` 또는 수준마다 `&children` | 예(장황) | 배열 아이템은 `targets`로 못 가리킴. 배열 노드 잠금은 "효과 없음"으로 경고됨 |
| 다단계 마법사 | 구역마다 `'&visible':'@.step === 1'` | 부분 | 맥락 변경이 정착을 부르는지 문서 없음. 단계 필드를 스키마에 두면 방출됨. 단계별 검증 범위 없음(오늘과 같음) |

발견 표 (번호 | 심각도 | 위치 | 인용 | 표현할 수 없는 것 | 해결 | 제안 문장)
1 | 높음·확인 | `07-conclusions.md:422`, `adr/0003:96` | 이주 목록에 `then.required` 항목 없음 | 오늘 가장 흔한 조건부 표시가 조용히 "항상 보임·방출"로 바뀜 | 원칙만으로 | "`then`·`else`의 `required`로 필드를 켜고 끄던 스키마는 그 필드를 `then.properties`로 옮기거나 `&active`를 적는다."
2 | 높음·확인 | `03:178` 대 `adr/0010:15`·`03:142` | "`&discriminator`가 가리키는 키가 호스트에 없음"(throw) 대 "분기 안에서만 선언되어도 게이트는 `extras`로 그 값을 읽지만" | 코퍼스 14개 가운데 12개는 태그가 분기 안에만 있음. 생성기 스키마를 "고쳐 쓰지 않고"(답 22) 받을 수 없음. 호스트 선언 없이 허용하면 빈 폼에서 분기를 고를 입력이 없음 | 소유자 판단 | "`&discriminator`는 태그를 호스트 `properties`에 요구한다(없으면 throw)"와 "분기 선언 태그를 청사진이 호스트 입력으로 끌어올린다" 가운데 하나를 정한다
3 | 중간·확인 | `adr/0003:94` | "같은 식을 그 분기 객체의 `&active`로 옮긴다" | 오늘의 `./kind`는 새 기준점에서 없는 경로가 되어 분기가 영영 꺼짐 | 원칙만으로 | "…옮기되 기준점이 호스트에서 호스트의 직계 자식 자리로 바뀌므로 `./x`를 `../x`로 고친다."
4 | 중간·확인 | `03:53` | "표현 키로 렌더 계층만 읽으며" | `options.omitEmpty`·`omitTrailing`은 방출과 게이트 입력을 바꾸고(`03:16`, `adr/0002:104`), `terminal`·`FormTypeInput`은 형상을 정함(`adr/0011:14`, `03:197`). `placeholder`는 오늘 최상위 키가 아님(`types/jsonSchema.ts:233`). 목록이 "…"로 열려 제거 규칙도 닫히지 않음 | 소유자 판단 | 표현 키를 닫힌 목록으로 적고, 코어가 읽는 `options.omitEmpty`·`omitTrailing`·`terminal`·`FormTypeInput`·`virtual`을 "접두 없는 코어 키"로 따로 분류한다
5 | 중간·확인 | `03:129`, `adr/0010:16` | "리프가 아닌 노드의 잠금은 입력이 없으므로 효과가 없고" | 배열 노드는 추가·삭제 입력이 있고 오늘 `readOnly`로 숨김(`formTypeDefinitions/FormTypeInputArray.tsx:34,45`). 경고가 거짓 양성 | 원칙만으로 | "객체 노드의 잠금은 효과가 없다. 배열 노드의 잠금은 아이템 추가·삭제만 막는다." 경고 대상에서 배열 제외
6 | 중간·추정 | `03:115`, `adr/0007:44` | 순환은 예산으로만 드러남 | 섭씨↔화씨처럼 왕복이 정확하지 않은 양방향 `&injectTo`는 사용자 입력을 같은 정착에서 덮거나 예산 초과로 둘 다 갱신 안 됨 | 소유자 판단 | 이주 목록에 "오늘의 `injectTo` 순환 차단 폐지"를 적고, 양방향 동기화의 권장 표기를 정한다
7 | 중간·확인 | `02-target-overview.md:354`, `03:119` | "예약 층의 표현식으로 남는다" | 식 언어 경계가 없음(아래 4번 답) | 원칙만으로(일부 소유자) | 식 문법 절을 원장에 둔다
8 | 중간·확인 | `03:179` 대 `adr/0002:149` | "`null` 분기·중첩 합성·`allOf` 키워드 무시(오늘의 셋)" 대 "중첩은 재귀로 다룬다" | 중첩 `oneOf`를 지원하는지 무시하는지 모름. 중첩 합성의 `&discriminator` 자리가 없음 | 원칙만으로 | 청사진 경고에서 "중첩 합성 무시"를 지운다
9 | 낮음·확인 | `adr/0003:53` | "`control: { readOnly, visible, active, disabled, unsetValue, default, resetInteraction }`" | `03:94`의 네 층 규칙이 쓰는 `unsetOnInactive`와 `adr/0002:200`의 `derived`가 목록에 없음 | 원칙만으로 | 목록에 `derived`·`unsetOnInactive`를 더한다
10 | 낮음·확인 | `07:327`, `adr/0003:36` | "`'&default': '../baseRate'`", "`&키`는 표준 키워드의 표현식 판" | 문자열 상수 기본값(`'KRW'`)이 식으로 컴파일됨 | 원칙만으로 | "`&` 키의 문자열은 언제나 식이다. 문자열 상수는 `\"'KRW'\"`로 적는다."
11 | 낮음·확인 | `03:19` 대 `adr/0005:127` | "타입(`type`, 다중 타입, 튜플)" 대 "종류가 조건에 따라 바뀌는 슬롯 … 아직 다루지 않았다" | 다중 `type` 필드 | 원칙만으로 | 원장에 "다중 `type`은 미정"을 적는다
12 | 낮음·확인 | `architecture/README.md:25`, `05-before-after.md:3,45,62,161,191` | 4차 기준 대조표가 현행처럼 안내됨 | 작성자가 `&virtual`, 선택 가드, "`anyOf` 하나만 활성"을 믿게 됨 | 원칙만으로 | README 항목에 "4차 기준, 5차와 다름"을 적거나 대조표를 5차로 다시 쓴다

3번 질문 표준 문법: `else`는 답 있음(`adr/0002:42`). `allOf` 안 `if`는 답 있음(`adr/0002:150`). 중첩 `oneOf`는 모순(발견 8). `$ref`는 부분 답(`adr/0005:52`에서 읽음, 재귀 종료 규칙은 `03:194` 미정). 답이 없는 것은 넷입니다. `dependentSchemas`(`03:194`), `patternProperties`(동적 키가 입력 없는 `extras`가 됨), 스키마 값 `additionalProperties`(맵 편집), `prefixItems` 아이템의 생김·채움(`03:190`).
4번 질문 식 언어: 정해진 것은 `.`·`..` 상대 경로, 기준점 규칙(`03:119`), `new Function` 유지입니다. 비어 있는 것은 여덟입니다. 허용 문법과 전역, `@` 맥락(`adr/0002:165` 한 곳뿐)과 그 변경이 에지인지, `#`와 `*`, 경로가 원본·방출·투영값 가운데 무엇을 읽는지(게이트만 투영값), 비활성·없는 노드 읽기의 결과, 문자열 상수와 식의 구분, `&injectTo`가 함수인지 식인지와 `ctx` 인자 유지, `&derived` 의존 집합(`03:195`)입니다.
5번 질문 경계 키: `placeholder`(분류됨, 실제 위치 불일치), `errorMessages`·`formType`·`FormTypeInputProps`·`FormTypeRendererProps`(표현, 자명), `terminal`·`FormTypeInput`(표현으로 분류됐으나 형상을 정함), `options`(표현이나 `omitEmpty`·`omitTrailing`은 방출 정책), `virtual`(접두 없음, 형상을 만듦), `propertyKeys`(`adr/0003:55`에만 있고 원장 목록에 없음), `nullable`(어느 층 목록에도 없음), `virtualRequired`(`adr/0003:104` 미정)입니다.

확인한 것
- 원장 전문, `adr/0002`·`0003`·`0010`·`0012`·`0013` 전문, `0011` 머리 주석, `05-before-after.md` 전문, `07` §4.0·4.25–4.28·6·9·11.2·13, `02`의 해당 줄.
- 코드: `checkComputedOptionFactory.ts`, `mergeShowConditions.ts`, `regex.ts`, `stripSchemaExtensions.ts`, `BranchStrategy.ts:774`, `SchemaNodeInput.tsx:46-111`, `FormTypeInputArray.tsx`, `types/jsonSchema.ts`·`formTypeInput.ts`.
- 오늘 `&if`가 `./` 기준임을 `README.md:1657`과 `AbstractNode.enhancedValidation.test.ts:607`에서 확인.
- 11라운드 코퍼스 `REPORT.txt`·`corpus-output.txt`(14개 중 12개가 분기 안 태그, 동작 0건).
확인하지 못한 것: 발견 6은 실행하지 않은 추론입니다. `reviews/` 아래 원문과 테스트 전수는 읽지 않았습니다.
브리프 밖 결정: 발견 2·4·6은 소유자 판단이 필요해 추측하지 않고 보고만 합니다.
