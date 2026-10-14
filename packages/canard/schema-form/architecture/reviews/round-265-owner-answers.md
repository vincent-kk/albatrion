# 265라운드 — Vincent의 답 (2·12 제안대로; 13은 이름만 재고(propertyOrder); nullable: true 제거 수용; 14 전부 제안대로)

2026-10-14. 264라운드의 추가 논의 넷과 잔여 키 점검(`nullable: true`)에 원장 관리자가 제안을 냈고 소유자가 원장 세션에서 답했다.

| 확인 | 물음(요지) | 답 원문 | 반영 |
| --- | --- | --- | --- |
| 2·12·13·14·nullable | ChildFields / controls.fields / options.propertyKeyOrder(object 전용, 공개) / options.virtual 형 선언·VirtualSchema 비공개화 / nullable: true 제거 | "11, 12 제안대로.  13은 나머지는 모두 수용, 필드 이름만 한번 더 고민을 해줘. propertyOrder 같이 하거나 할 수는 없나? 너무 안예쁘군. \n\nnullable: true 는 수용, 14번 전부 제안대로." | 2 `ChildFields`(요소 `ChildField`, `ChildFieldProps`, `useChildFieldMap`·`useChildFieldErrors`) 승인(원문의 "11"은 직전 질문 순서상 2를 가리킴; 11 `Form.Field`는 264라운드에 이미 승인); 12 `controls.children` → `controls.fields` 승인; 13 options 자리·object 전용·공개 승인, 이름은 `propertyOrder`로(265C-01); 14 `ObjectSchema.options.virtual` 형 선언 + `VirtualSchema`를 공개 합집합에서 제거(내부 `VirtualNodeSchema`) 승인; `nullable: true` deprecated 별칭 제거 승인 |

### 265C-01 07b-5 후속 치환 대응표(261·264·265라운드 승인분) — 같은 PR의 후속 커밋

| 항목 | 옛 | 새 | 비고 |
| --- | --- | --- | --- |
| 1 | `FieldNodeEventType.UpdateComputedProperties` | `UpdateControlledProperties` | 공개 enum 멤버(비트 값 불변) |
| 2 | `ChildNodeComponent`·`ChildNodeComponents`·`ChildNodeComponentProps`·`useChildNodeComponentMap`·`useChildNodeErrors` | `ChildField`·`ChildFields`·`ChildFieldProps`·`useChildFieldMap`·`useChildFieldErrors` | 공개 형·훅 |
| 3 | `FieldNodeState.ShowError` | `FieldNodeState.ErrorVisible` | 비트 값 불변; `ShowError` 정책 enum·prop·메서드는 유지 |
| 4 | 노드 멤버 `extras` | `undeclaredValues` | 공개 형 |
| 5 | `Hint` | `FieldInputHint`; `FieldInputTestObject`는 그 부분형 | 공개 형 |
| 7 | `SetValueOption` 셋 | 공개 `SetValueOption` 하나; 내부 enum은 다른 이름(예: `WriteOption`) | 런타임 불변 |
| 8 | `JSONSchema` 셋 | 공개 하나; core·rolled 내부는 다른 이름 | 런타임 불변 |
| 9 | core/FieldNode/type.ts의 `FieldInputProps` | 내부 이름 | 런타임 불변 |
| 11 | `Form.Group`·`FormGroupProps` | `Form.Field`·`FormFieldProps` | documents api-reference의 "FormGroup" 플러그인 칸 오기 정정 |
| 12 | `controls.children` | `controls.fields` | 작성 API: 명세·문서·시험·스토리·이주 안내 |
| 13 | `options.propertyKeys` | `options.propertyOrder` | object 전용으로 형 선언·명세 절·문서; 뜻은 내보내는 값의 키 순서 |
| 14 | (작성 자리 없음) / `VirtualSchema` 공개 | `ObjectSchema.options.virtual?: Record<string, { fields: string[] }>` 선언 / `VirtualSchema`를 공개 `JSONSchema` 합집합에서 빼고 내부 `VirtualNodeSchema`로 | 공개 d.ts 차이 |
| nullable | `nullable: true` deprecated 별칭 | 제거 — `type: [..., 'null']`만 | 런타임 변경: 고치기 전 실패 시험, 명세·README·CLAUDE.md의 nullable 문장 갱신, 이주 안내 |
| 6·10 | `core/dispatch`, `core/types` | C 재배치에서 | 07b-5 밖 |

다음 라운드 번호는 266이다.

## 덧붙임 (2026-10-14, 다음 단계 확인)

소유자: "그래 다 끝나면 알려줘. \n그 다음 구조변경을 하는거지?\n답은 내가 다 해줬으니 그대로 할 수 있나?" → 원장 관리자 답: 07b-5 병합 뒤 C 재배치(개선-38)로 가며, 입력(후보 C, 다섯 결정, 6·10의 디렉터리 이름)은 모두 받았으므로 추가 질문 없이 계획을 쓴다. 남는 관문은 filid restructure 절차의 "읽기 전용 계획 → 소유자 승인 → 실행 → 사후 조건" 중 계획 승인 한 번과 PR 병합 허가뿐이다.

## 덧붙임 (2026-10-14, 12번의 내부 계층 id)

fixy07 질문: `controls.children` → `controls.fields`에 맞춰 내부 제어 계층 id `'children'`(core/record/types/runtime.ts:55, readDefault.ts:7, readExitLayerPolicy.ts:7, readLatentExitPolicy.ts:2, settle/derive/type.ts:24 등)도 `'fields'`로 바꿀지. 편집자 결정: 바꾼다 — 작성 키와 계층 이름이 어긋나면 다른 개념으로 읽힌다. 오류 경로 `/controls/fields/...`와 INVALID_CONTROL_SHAPE detail의 `key: 'fields'`는 작성 키를 비추는 값이라 따라 바뀌며 PR 본문의 공개 차이 목록에 적는다. 계층 id가 enum 문자열 값이나 DOM 속성에 들어가면 보고 뒤 정지.

## 덧붙임 (2026-10-14, 8번과 7·9·5의 구체 이름)

fixy07 제안을 편집자가 받음: 8번 core의 `JSONSchema` 인터페이스(core/types/jsonSchema.ts:8, Options·Presentation 제네릭)는 `AuthoredSchema`로(기존 `BlueprintSchema`는 날 스키마 형이라 통일 불가), rolled의 `JSONSchema` 합집합(types/rolled/jsonSchema.ts:100, 지금도 index.ts:76의 명시 export에 가려 닿지 않음)은 내보내지 않는 지역 형으로(안 쓰면 삭제) — `export type *`로 새 공개 이름이 생기지 않도록. 7번 내부 enum은 `WriteOption`, 미사용 `PublicSetValueOption`·`UnionSetValueOption` 삭제. 9번 core의 `FieldInputProps`는 `FieldNodeInputProps`. 5번 `FieldInputTestObject`는 Pick/Omit으로 표현되지 않아(다섯 칸에 배열 형이 더해짐) `FieldInputHint`에서 뽑는 매핑 형으로 정의하고 형 시험으로 고정.

## 덧붙임 (2026-10-14, 07b-5 중간 — 이름 단계 push, 초안 PR #365)

fixy07: 이름 바꾸기 다섯 커밋을 push하고 초안 PR #365(head 357ccf8f0)를 열었다. 게이트: build·typecheck 통과, lint 0, 플러그인 일곱 build·test 통과, documents en·ko 빌드 통과, G16 CONSUMER_BUNDLE_OK(prod 288,502 B·dev 291,799 B), dist·documents build 옛 이름 0(dist의 옛 이름은 dist/__legacy__뿐), 공개 d.ts 차이는 공개 이름 10개 개명과 선언 파일 46개 이동, verifier 독립 재검사 PASS(파일 쌍 631개, UNEXPECTED 0). 첫 전체 실행에서 실패한 다섯 파일(surface.test.ts export 순서, fixture JSON의 CREATE_DYNAMIC_FUNCTION 문구 셋, 고정 커밋 3a637c4cd를 git show로 읽는 selectChildren.head-differential 하네스 — 옛 원본을 읽을 때 같은 이름 규칙·문구 변경을 적용)은 각 커밋에 합쳐 단독 재실행 통과; 전체 재실행은 후속 (A)(B)(C) 뒤 한 번. bench의 round-87-measure.mjs·branchless-phase-diagnosis.mjs는 옛 커밋을 계측할 때 같은 이름 규칙이 필요(PR 본문에 적음). mui 스토리 disabled는 ②-4에 합침.
