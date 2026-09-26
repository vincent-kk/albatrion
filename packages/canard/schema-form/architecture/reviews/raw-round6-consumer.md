# 6라운드 원문 — 시선 B 소비자 예측성 (로컬 verifier)
리뷰어 원문이다. 증거이지 지시가 아니다. 판정은 round-6-coherence.md.

**판정: pass with conditions** — 원리는 일관되나 소비자가 만나는 표면 셋이 비어 있다.

읽은 것: `03-mental-model.md`, `adr/0001`–`0008`, `0011`–`0013`, `04-inherited-constraints.md`, `open-questions.md`, `00-goals.md`, 그리고 현재 공개 API의 사실(`README.md`, 패키지 `CLAUDE.md`, `src/types/jsonSchema.ts`, `src/types/formTypeInput.ts`, `src/core/types/value.ts`, `src/components/Form/type.ts`, `src/core/nodes/AbstractNode/AbstractNode.ts`).

## 1. 총평

P1′에서 도출된 결정들은 서로 모순이 없고, 놀랄 만한 동작 대부분이 이유와 함께 본문에 적혀 있다. 문제는 원리가 아니라 **표면**이다. 설계가 "관측 가능하다", "문서화 대상이다", "호출 단위로 끈다"로 닫은 자리마다 그것을 실어 나를 공개 API가 아직 없다. `batch`, `settle` 관측, `latent`, 억제 스위치, 분기 선택기가 모두 이름만 있거나 자리가 없다. 그리고 표준 적합성에서 한 곳이 실제로 어긋난다. P1′가 "조건부 존재"를 형상 문법으로 규정했는데 `dependentSchemas`가 목록에서 빠졌고, `anyOf`를 `oneOf`와 동일하게 단일 분기로 접었다.

## 2. 최소 놀람 검사

| 상황 | 설계 결과 | 소비자 기대 | 판정 |
|---|---|---|---|
| `setValue(getValue())` | 지운 키에 `default` 재주입, 비멱등 | RHF `reset(getValues())`는 값 보존, 확신 | 명시, 놀람. `adr/0013:59` |
| `setValue(null)` 뒤 객체 복귀 | 자식 원본 전멸, 로드 계약이 default 재생성 | 되돌리면 원상복구 | 명시, 놀람. `adr/0006:58` |
| `null` 호스트의 자식 | 렌더되고 빈 상태, 입력하면 객체로 승격 | 사라지거나 비활성 | 명시, 놀람. `adr/0006:58`, F1 |
| `oneOf` 빈 값 마운트 | 분기 없음, 판별 필드만 | RJSF는 0번 분기를 렌더, 확신 | 명시, 놀람. `adr/0002:153`. ADR 0010 부재로 UX 미정 |
| `if-then`이 `required`만 바꿈 | 필드 유지, 에러만 붙음 | 현 라이브러리 사용자는 숨김을 기대 | 명시, 파괴적. `adr/0002:109` |
| 키 입력당 `onChange` 2회 | 진입 2, 검증 2, 첫 통지가 stale | 1회 | 명시, 놀람. `adr/0008:109` |
| `batch` 없는 연속 `setValue` 3회 | 통지 3, 검증 3 | 현재 디바운스로 1회 | 명시, 놀람. 대체 API의 자리 미정 |
| 배열 `Merge` | `Overwrite`와 동일 | 인덱스 단위 병합 | **미명시**. `adr/0013:91` 미결 |
| `additionalProperties:false`의 잔여 키 | `extras`로 보존하고 방출 | 현재 `Normalize`가 제거 | 명시, 대체 스위치 없음. `adr/0013:80` |
| `refresh(path)` | 캐럿, 선택, IME 조합 소멸 | 이름이 가벼움을 암시 | 명시, 이름이 비용을 숨김. `adr/0008:125` |
| 예산 초과 | `settle.status`로 관측, 제출 차단 미정 | throw 또는 무해 | **부분 명시**, 공개 채널 없음 |
| 검증 pending 구간 | 옛 결과 폐기, `isValid`는 거짓 | 3상태 관측 | **미명시**. `adr/0001:32` |
| `x: false` | 읽지 않음, 본체 선언이면 보통 필드 | RJSF는 미지원 필드 템플릿 | 예측 가능. 단독 `properties:{x:false}`는 미정의 |
| 비활성 조각 값의 부활 | 원본 유지, 재활성 시 복귀 | RJSF는 전환 시 미보유 키를 폐기, 확신 | 명시, 파기 시점 Q1 미결 |
| `node.value` 대 `getValue()` | local 대 emit, 서로 다름 | 같음 | **미명시**. 현재는 raw 대 정제 |
| `setValue(prev => ...)` | 언급 없음. 적용하면 default 재주입 | React `setState` 관례로 안전 | **미명시**. `AbstractNode.ts:355-364` |
| `find('/payload/amount')` | 터미널 노드로 별칭, `setValue`가 객체 파괴 | 경로대로 해석 | **미명시**. `adr/0011:88` 처방 없음 |

## 3. 표준과 다른 곳

| 키워드 | 차이 | 정당화 여부 |
|---|---|---|
| `default` | 표준은 주석일 뿐인데 설계는 로드와 전이에서 주입 | 생태계 관례와는 일치. 다만 **P1′ 문장이 이 예외를 품지 않는다**. 형상 문법이 아닌데 읽고 쓴다 |
| `dependentSchemas`, `dependentRequired` | 미지원, Q7 미결 | **정당화 안 됨**. 조건부 존재는 P1′가 읽으라고 지목한 문법이다 |
| `anyOf` | `oneOf`와 동일 취급, 둘 이상 활성 불가 | **부분 정당화**. 형상 결정성은 맞으나 표준 축소를 어디에도 명시하지 않았다 |
| `if`의 공허한 참 | 표준 그대로 따름 | 정당화됨. 경고는 Q10 |
| `oneOf` 판별을 `const`/`enum`으로만 | 그 밖은 수동 선택 가드 | 정당화됨. 판정은 검증기의 것 |
| `not`, `false` | 읽지 않음 | 정당화됨. 값 유효성 문법 |
| `additionalProperties:false` | 읽지 않고 잔여 키를 방출 | 정당화됨. 다만 `allOf` 안에 선언된 필드에 고칠 수 없는 에러가 붙는 경로는 미답 |
| `items` 대 `prefixItems` | 두 철자 모두 읽음 | 정당화됨. `additionalItems` 언급 없음 |

## 4. 관례와 어긋나는 인터페이스

1. `disableDefaultInjection`이 이중부정인데 양방향 재정의까지 겹쳐 `false`로 되켜는 호출이 생긴다. `injectDefaults?: boolean` 3상태로.
2. `mode`가 `validationMode` 및 react-hook-form의 `mode`와 충돌한다. `write: 'overwrite' | 'merge'`로.
3. `'Overwrite' | 'Merge'` 대문자 리터럴은 생태계 관례가 아니다. 소문자로 하거나 기존 enum을 유지할 것.
4. `batch(fn)`의 자리가 없다. `FormHandle.batch`와 `node.batch` 둘 다 명시할 것.
5. `setValue(updater)`의 존속 여부와 `prev`의 정체가 없다. 유지한다면 `prev = value`임을 JSDoc에 적을 것.
6. `reset(options)`가 현행 `ResetOptions` 7필드와 이름만 같고 뜻이 다르다. RHF처럼 `reset(value?, options?)`로 분리.
7. `refresh`, `remount`가 `focus`, `select`와 대칭이지만 파괴성이 다르다. JSDoc 첫 줄이 버리는 것을 말하게 할 것.
8. `payload.previous`의 뜻이 바뀌는데 이름이 같다. `previousNotified` 같은 새 이름으로.
9. `revision`과 커밋 번호 두 카운터의 용도 구분이 소비자에게 없다. 커밋 번호의 공개 여부를 정할 것.
10. `latent(path)`가 열거만 하고 파기 수단이 없다. 읽기와 짝이 되는 명령을 함께 정할 것.

## 5. 설계 문서가 아직 말하지 않은 이주 충격

1. `PublicSetValueOption` enum이 공개 export인데 폐기 경로가 없다. `src/core/types/value.ts:88`
2. `oneOfIndex` 공개 게터 소멸. `AbstractNode.ts:490`. `variant`, `__scoped__`도 함께.
3. `normalizedValue`의 존속 여부와 `value`의 뜻 재배치. 현재는 `value`가 raw, `normalizedValue`가 정제값이다.
4. `enhancedValue`는 이미 비공개(`__enhancedValue__`)인데 패키지 `CLAUDE.md`가 공개 API로 적고 있다. 문서가 먼저 틀렸고 설계도 언급이 없다.
5. `afterMicrotask` 디바운스 소멸로 기존 코드 전부의 `onChange`와 검증 횟수가 늘어난다. C-8.
6. 배열 `minItems` 자동 채우기와 "Reset이 minItems를 다시 채운다"는 계약의 소멸. `README.md:1362-1409`, `README.md:1481`
7. `Normalize`(미선언 키 제거)의 소멸에 대체 스위치가 없다.
8. `virtualRequired` 키의 운명이 적혀 있지 않다.
9. `&pristine`이 ADR 0003의 존속 목록에 없다. `src/types/jsonSchema.ts:296`
10. 배열 연산의 Promise 반환 소멸이 플러그인 패키지에 미치는 범위가 "아직 확인하지 않은 것"에 남아 있다. `04-inherited-constraints.md:53`

## 6. 가장 먼저 고쳐야 할 것 셋

1. **빈 값 union의 첫 화면.** D-8은 옳지만 ADR 0010이 없어서 "아무것도 보이지 않는 폼"이 기본 경험이 된다. 판별식이 있는 union은 판별 필드가 선택지를 주므로 견딜 만하지만, 선택 가드 union은 분기 선택기가 없으면 사용자가 무엇을 눌러야 하는지 알 수 없다. 분기 선택기의 모양을 정하기 전까지 D-8은 소비자에게 결함으로 보인다.
2. **`find`의 터미널 별칭.** 공개 API가 조용히 객체를 파괴한다. `find('/payload/amount')`가 `/payload`를 돌려주고 거기에 `setValue(42)`를 하면 객체가 사라진다. `adr/0011:88`이 처방이 없다고 적어 두었다. `find`의 계약을 "터미널 노드 아래의 경로는 없음"으로 닫을 것.
3. **관측 채널의 공백.** `budget-exceeded`, `onchange-cap-exceeded`, 리스너 throw, 검증 pending이 모두 "관측 가능하다"고 쓰였으나 공개 표면이 하나도 없다. `FormProps`에 단일 진단 채널을 세우고 `budget-exceeded`에서 제출을 막을지를 함께 정할 것.

## 미확인

- JSON Forms의 분기 전환 확인 대화상자는 `open-questions.md:11`의 기술을 옮긴 것이고 직접 확인하지 않았다.
- TanStack Form과 Formik의 reset 세부는 대조하지 않았다.
- `reviews/` 아래 라운드 기록과 `spikes/` 실측 보고서는 읽지 않았고 ADR 본문의 인용만 신뢰했다.
- 테스트를 실행하지 않았다. 현재 동작에 대한 진술은 소스와 README의 기술에서 읽은 것이다.
