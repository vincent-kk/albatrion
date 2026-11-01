# PR #445 서술판 — 8단계(검토와 성능) 최종 PR 의 긴 본문

이 문서는 PR #445(`feat/schema-form-08-review-and-perf → 1.0.0-beta`)의 본문으로 2026-10-23 까지 쓰였던 글을 그대로 옮긴 것이다. 소유자가 2026-10-26 에 PR 본문을 자료만 담은 짧은 형태로 바꾸라고 했고("담백하게 자료만 기록하고 ~ 대신 - 를 써. 범위 표시할때. 이거 공개자룐데 너무 사설이 길어. 사설은 문서로 남기던가 하고, PR은 담백하게 수정하도록 해."), 서술은 이 문서에 남긴다. 아래 본문은 옮길 당시의 문장 그대로이며(범위 표기 `~` 포함), 수치의 출처는 본문 안의 증거 경로다. `.seiri/tasks/…` 경로는 gitignore 된 기계 안 증거 폴더다.

---

## 요약

`@canard/schema-form` 8단계(검토와 성능)의 결과를 `1.0.0-beta`로 올립니다. 범위는 `42d63884d`(1.0.0-beta, 329라운드)부터 이 가지의 끝까지이며(442라운드 끝 `b0fa84e53`까지 173개 커밋·55개 PR, 443라운드에 #447·#448·#449·#450 이 더해져 제품 끝은 `a63db97c2`), 원장 329~443라운드의 소유자 결정 아래 코디네이터가 squash 병합했습니다. 공개 진입점(`src/index.ts`)의 이름 집합은 추가도 삭제도 없고, 제품 동작은 아래 "동작 변경" 절의 결함 수정과 이름 변경을 빼면 관측 동치(Node/Bun 174건 차이 0)로 확인했습니다.

8단계의 성능 작업은 세 갈래였습니다. 첫째, 마운트·갱신의 상수 비용 제거(가설 N·F·2·3·B1, 결정 58 확인 바퀴 생략, node 조건 적재 시점 플래그 등 23개 PR). 둘째, 결정 62(라)의 게이트 선택 표: 청사진 단계의 비실행 인식기가 `./kind === 'a'`와 `||` 꼴의 게이트만 표 자격으로 뽑아 값→분기 표를 만들고, 바퀴는 판별자 하나를 읽어 켜지는 엔트리만 방문하므로 oneOf 분기 전환이 분기 수 N에 비례하던 구조(O(N))가 바뀐 분기 크기에 비례하게 되었습니다(PR-1~PR-3·PR-6, #436~#442). 셋째, 443라운드의 상수 손질 묶음: 아홉 항목(C1~C9) 가운데 커밋 후보 Set 복사 제거(C1, #447)만 소유자가 확정한 추세선 규칙(폭 (다)와 절편)으로 입증되어 채택했고, 나머지 여덟은 설계 검토 제외(C2·C5·C7) 또는 측정 미입증·입증(느림)(C3·C4·C6·C8·C9)으로 기각했습니다. 노드별 장부 통합(설계 문서 `.seiri/tasks/ledger-design-442/design.md`)은 소유자 결정으로 포기했습니다. 검증 모드(S1~S6 단언)는 전용 시험 묶음(`test:verify`)으로 분리했고 기본 시험은 출하 설정으로 실행합니다(#444).

## 속도 — 코어(React 없음, Node 26 production, 0.16.1 대 최종)

측정은 `.seiri/tasks/final-measure-443b/`(633개 파일 SHA256 봉인; 결함 수정 전 `dc8490b02`의 창은 `final-measure-443/`)에 있습니다. E0는 npm의 `@canard/schema-form@0.16.1` 번들, E9는 `a63db97c2`의 `dist/index.node.mjs`입니다. 프로세스마다 20회 예열 뒤 100표본을 채취했고 표의 시간은 세 실행 최소값의 중앙값, 폭은 세 실행 최소값의 최댓값−최솟값입니다(UTC 19:48:16–19:56:35, 282 프로세스·28,200 표본, 조용한 창). 한 창의 관측값이며 A′ 보정은 하지 않았습니다.

요지: 단일 입력은 flat에서 0.16.1보다 빠르고(flat-500 −89 %, flat-1000 −93 %, flat-2000 −66 %), 마운트·분기 전환·일괄 입력은 아직 0.16.1보다 느립니다. 분기 전환은 N=5와 N=80이 같은 수준(0.22~0.31 ms)이라 O(N)은 해소되었고 남은 것은 상수 배입니다. nested 일괄 입력(+231~289 %)과 oneOf 마운트(+191~515 %, oneOf-80 +344 %)가 가장 큰 잔여 격차입니다.

| 장면 | 행 | 0.16.1 ms | 최종 ms | Δ % |
| --- | --- | --- | --- | --- |
| 마운트 | oneOf-80 | 0.4800 | 2.1289 | +344 |
| 마운트 | flat-1000 | 2.3498 | 2.8236 | +20 |
| 마운트 | nested-d6-f4 | 7.8131 | 17.1269 | +119 |
| 단일 입력 | flat-1000 | 0.5235 | 0.0375 | −93 |
| 단일 입력 | nested-d6-f4 | 0.0335 | 0.0742 | +121 |
| 분기 전환 | oneOf-80 | 0.0586 | 0.2276 | +288 |
| 일괄 입력 | flat-2000 | 2.3828 | 3.5065 | +47 |
| 일괄 입력 | nested-d6-f4 | 2.9437 | 10.4355 | +254 |

전체 47행은 `.seiri/tasks/final-measure-443b/core/rows.md` 표 1~3에 있습니다(같은 창의 값입니다).

## 속도 — 8단계 안에서의 변화(교차 창)

같은 하네스로 441라운드에 잰 제품 끝 `47ad92cf3`(결정 62와 가설 B1 이전)과 443라운드의 `dc8490b02`(결함 수정 이전)의 값을 이번 창의 값 옆에 둔 표가 `core/rows.md` 표 4·5입니다. 서로 다른 창의 값이므로 단일 창 판정이 아니며 방향만 읽습니다. 441 대비 분기 전환은 N=80에서 0.6455→0.2276 ms(−65 %), 일괄 입력은 nested-d6-f4 15.57→10.44 ms(−33 %), 마운트는 oneOf-80 2.68→2.13 ms(−20 %)입니다. 결함 수정 전후(표 4, 48행)는 ≤−5 % 19행·≥+5 % 11행·안 17행이고 느려진 행은 모두 0.1 ms 아래의 oneOf-5·10 행이라 교차 창 잡음으로 봅니다(두 수정은 리터럴 `*` 이름과 overlay 게이트 호스트에만 비용을 둡니다).

## 속도 — React 전체 폼(jsdom, 0.16.1 대 최종)

M3(433라운드) 원형 장치 그대로입니다. 같은 프로세스에서 설치된 `@canard/schema-form@0.16.1`과 최종 판을 표본마다 AB/BA 순서로 import 하고, React 렌더·커밋·settle 대기와 Form handle 상호작용 전체를 포함합니다(DOM 입력 이벤트는 포함하지 않음). 갱신 = fixture.interactions 전체(oneOf는 판별자 왕복 2회, flat/nested는 10회, computed는 3회, 배열 stress는 push/replace/remove 전체). 각 판 10회 예열 뒤 100표본, 두 번 통과한 중앙값을 각각 적었습니다(UTC 19:56:59–20:46:47).

요지: 배열 폼은 마운트 −11~−22 %, 갱신 −15~−87 %(array-1000 28.2~40.8→5.3 ms)로 빨라졌고 nested-d5·flat-500 마운트도 −10~−16 %입니다. oneOf 마운트 +39~49 %(5.0→7.0~7.8 ms), 소형 폼 갱신 +48~58 %(2.2→3.3 ms 수준), 배열 stress 갱신(push-100 +35 %, push-remove-100 +34~37 %), computed 폼(+25~32 %)은 아직 느립니다. 결함 수정 전(443 창) 대비 교차 창은 대부분 ±5 % 안이며 flat-50·100 갱신 +7~9 %, array-push-100 +6~8 %, array-push-remove-100 +9~12 % 가 느린 쪽, array-500 마운트 −8~−9 % 가 빠른 쪽입니다.

### React — 실제 DOM 입력 1회(보조)

같은 fixture와 장치에서 네이티브 value setter와 `input` 이벤트 1회, React 커밋과 두 tick의 대기를 포함합니다(각 판 10회 예열 뒤 100표본씩 두 통과). 입력 1회의 절대 시간은 대부분 3.2~3.6 ms 수준에서 +0~4 %이고, 배열 폼은 array-1000 28.3~29.3→5.7~5.8 ms(−80 %)로 빨라졌으며, oneOf 분기 전환 1회는 3.4~3.5→4.8~5.0 ms(+37~44 %), nested-d5 입력은 +37 %, computed 입력은 +11~28 %입니다. 초기 배열이 빈 stress fixture 세 개는 입력 요소가 없어 미지원입니다.

## 브라우저 시험

Storybook 프로젝트(headless Chromium, addon-vitest, 게이트 선택 표 `table` 모드) 100파일·251시험 통과, 실패 0, WebSocket 재실행 없음(443b 창; 443 창도 같음). 그 밖의 관문(제품 끝 `a63db97c2` 기준, #449·#450 의 관문 포함): typecheck·lint 통과, `yarn build`(세 번들 + `build:verify`), 기본 시험 unit·render·react18 4,956 통과, verify 묶음 4,272 통과(S1–S6 집계), production 20 통과, Node/Bun 관측 동치 174건 차이 0, FCA 신규 발견 0(패키지 범위 scan 위반 85/85·validate 발견 86/86 동일; 전체는 기존 진단으로 indeterminate).

## 마지막 검증(444라운드, 2026-10-23)

가지 끝 `9307165f7`(제품 끝 `a63db97c2`)에서 PR 직전 전체 관문을 Claude 워커가 한 번에 돌렸습니다(`.seiri/tasks/final-verify-444/gates/gates.md`): typecheck·lint·`yarn build`(`index.node.mjs` SHA256 `eeda700d…ceba0be`, 제품 끝과 동일) 통과, 공개 이름 94개 불변, 기본 시험 다섯 프로젝트 830파일·5,291시험(storybook 100파일·251시험 포함)과 verify 묶음 4,327·production 20 통과 — 실행 시간 비교 시험 `global-errors.timing.test.ts` 1건만 동시 부하에서 실패하고 단독 재실행 통과(알려진 양상), 플러그인 일곱 typecheck·test 통과(ajv 셋과 documents 는 이 기계의 오래된 플러그인 dist 가 원인이라 재빌드 뒤 통과), documents build 통과. 실제 브라우저 시험은 ego-browser(Chromium)로 Storybook dev 서버의 251 스토리를 차례로 띄워 251/251 `storyFinished:success`, 오류 이벤트 0 이었고(`.seiri/tasks/final-verify-444/browser/browser.md`), 폼 핸들 스토리에서 실제 입력·클릭의 값 왕복을 확인했습니다. 배포 코드 금지 규칙 검사(절대 경로·gitignore 의존)에서 벤치 스크립트의 gitignore 기본 경로 1줄을 필수 인자로 바꾸고 DETAIL 의 결정 62 설계 인용 3줄을 추적 복사본(`architecture/verification/perf-optimization/decision-62-gate-table-design.md`)으로 돌렸습니다(제품 코드 변경 없음, 커밋 `c1d3a8822`). 이어서 소유자가 #451 을 TEST-027 로 수용해("응 수용") squash 병합했고(`c62818ab4`, 현재 제품 끝) 작업 폴더와 가지를 지웠습니다. 새 제품 끝에서의 전체 관문 재실행과 ego-browser Storybook 재실행은 소유자의 중단 지시로 끝내지 못했으며(브라우저 둘째 창 40/251 까지 39 통과, 1 은 실행기 특성의 시간 초과), 재개 순서는 `.seiri/tasks/final-verify-444/RESTART.md` 에 있습니다. #451 의 합친 코드 검증(typecheck, 대상 110건, verify 4,334, FCA 신규 발견 0)과 병합 직전의 remount·옮긴 게이트 묶음 67건 통과는 PR #451 에 기록되어 있습니다.

## 포괄 결함 확인(8단계 마지막 관문)

"갱신 결과 = 같은 값의 새 마운트" 불변식을 생성 말뭉치에 대해 자동 대조했습니다(PR #448 `8a1906f00`): 장면마다 갱신 트리 U 와 매 쓰기 접두의 U.outputValue 새 마운트 F 의 공개 관찰(value·raw·undeclaredValues·순서 있는 형상·상태 키·유효 스키마·errors·warnings·diagnostics)을 비교하고, 정당한 차이는 관찰 전에 장면과 유효 스키마 옵션(omitEmpty·omitTrailing·fill)에서 계산한 정적 마스크로만 허용합니다(식이 읽는 경로와 형상·상태 채널에는 마스크 없음). 말뭉치는 seed 443·문법 16가족(기본 128장면, verify 1,024장면), 표적 장면 넷(별표 이름·overlay·옮긴 게이트·조상 dirty), React 재생(DOM live 속성, 세 모드 33/33)입니다. 원시 불일치 241건을 최소 재현 11개로 축소해 일곱 항목으로 분류했고(미분류 0), 설계와 결과는 Opus 가 독립 검토했습니다.

- 결함 셋은 수정했습니다(각각 진단 → 설계 검토 → 구현 → 재검증 → 측정): D443-01 `*` 이름의 상태 키 판독자 미재계산 → #449; D443-02 overlay 투영만 바뀐 유지 자식의 바깥 독자 미재계산 → #450; D443-03 옮긴 게이트가 읽는 값만 바뀐 뒤 선언 호스트 경로 미재계산 → #451(`c62818ab4`; 게이트 없는 nested-d6 일괄 통제 행 +4.13 %/+3.41 % 는 소유자가 TEST-027 로 수용, 444C-06).
- 후보 넷은 소유자 위임(444라운드 "원장과 설계원칙에 비추어 닫을 수 있는 항목은 닫아라")으로 코디네이터가 원장 문장으로 판정하고 Claude Opus 검증자가 대조해 모두 정당한 차이로 닫았습니다(444C-01~04): C443-01(VALUE-031 ㄹ (b)·VALUE-034·26C-13·CONTROLS-080 (5)), C443-02(ㄹ (b)·VALUE-034·37C-01·P3), D443-04(VALUE-034·VALIDATE-007·VALUE-033; ㄹ 의 닫힌 목록에 배열 빈자리 채움을 보충), D443-05(U4·U6·U7·WRITE-098·WRITE-099). 핀 넷은 판정 번호를 달고 `it.fails` 로 남으며, 정적 마스크로 `it` 에 되돌리는 일은 9단계 시험 장치 항목입니다.
- 440C-01 의 열린 틈 넷 가운데 셋이 닫혔고(하나는 #451 대기), 조상 dirty 반복은 재현되지 않았습니다. 결과 문서: `architecture/verification/defect-check-443.md`, `fix-d443-01-results.md`, `fix-d443-02-results.md`, `fix-d443-03-results.md`.
- 수정 뒤 최종 측정 재실행(`a63db97c2`): `.seiri/tasks/final-measure-443b/`(633 파일 봉인; 코어 UTC 19:48:16–19:56:35 282 프로세스·28,200 표본, React 19:56:59–20:46:47, Storybook 100파일·251시험 통과). 코어 47행: 0.16.1 대비 짧은 행 3(단일 입력 flat-500·1000·2000 −89~−93 %·−66 %), 긴 행 44; oneOf-80 마운트 2.13 ms(+344 %), 분기 전환 0.22~0.31 ms(N=5 +688 %, N=80 +288 %), nested-d6 일괄 10.44 ms(+254 %). 교차 창(표 4, 수정 전 `dc8490b02` 대비) 48행: ≤−5 % 19행, ≥+5 % 11행, 안 17행 — 느려진 행은 모두 0.1 ms 아래의 oneOf-5·10 행(전환 +40 %, 일괄 +28~52 %, 마운트 oneOf-5 +24 %)이고 빨라진 행은 flat-50 마운트 −23 %, nested-d3 −20 %, 전환 oneOf-20~80 −11~−21 % 이며 두 수정은 리터럴 `*` 이름과 overlay 게이트 호스트에만 비용을 두므로 교차 창 잡음으로 본다. React 주 표 38행: 0.16.1 대비 짧은 행 9(배열 마운트 −11~−22 %·갱신 −15~−87 %, nested-d5·flat-500 마운트 −10~−16 %), 긴 행 29(oneOf 마운트 +39~49 %, 소형 폼 갱신 +48~58 %, 배열 stress 갱신 +8~37 %, computed +25~32 %); 교차 창은 대부분 ±5 % 안이고 flat-50·100 갱신 +7~9 %, array-push-100 갱신 +6~8 %, array-push-remove-100 갱신 +9~12 % 가 느린 쪽, array-500 마운트 −8~−9 % 가 빠른 쪽이다. 관측 요지는 442·443 과 같다.

## 스펙 변경(공개 표면)

- 진입점이 내보내는 이름 집합은 변하지 않았습니다(94개). 내부 파일 구조만 `src/types/{error,field,schema,rolled}`로 나뉘었고 `FormFieldProps` 등은 별칭으로 같은 이름을 유지합니다.
- `FieldInputProps`·`FieldInputTestObject`의 `typeMismatch`가 `misfit`으로 바뀌었고, `schemaType`은 JSON 형만 담으며 가상 노드에서는 `undefined`입니다(#387, #389).
- `FormWarningCode.TypeMismatch`가 `FormWarningCode.Misfit`('SCHEMA_FORM_WARNING.MISFIT')으로 바뀌었습니다. 오류 41개·경고 17개의 코드 수는 같습니다(#387).
- 오류 클래스 인스턴스의 `name`이 클래스 이름('JSONSchemaError')에서 그룹 상수 값('JSON_SCHEMA_ERROR')으로 바뀌었습니다. `code`·`group`·`specific`·메시지는 그대로입니다(#404·#406·#407).
- 노드 메서드 `visitSubtree(visitor)`(전위 순회, `false` 반환 시 하위 생략, 순회 중 쓰기는 끝에 한 번 반영)와 `ArrayNode.insert(index, value)`가 명세에 올랐습니다(#389, #400). `FormHandle`에는 `visitSubtree`가 없습니다.
- `package.json` `exports["."]`에 `node` 조건이 추가되었습니다(`node.import` → `dist/index.node.mjs`, `node.require` → `dist/index.cjs`). 두 Node 출력은 `NODE_ENV`를 모듈 적재 때 한 번 읽어 유지하고, 브라우저 번들러는 기존 `dist/index.mjs`를 받습니다(#432). 세 출력 모두 minify 하지 않습니다.
- 명세 문서(`docs/en`·`docs/ko` SPECIFICATION, QUICK_REFERENCE)에 "하위 트리 방문" 절, `insert`, nullable 배열의 `insert` 문장이 더해졌습니다.
- 패키지 스크립트 `build:verify`(빌드 산출물의 플래그 형태와 게이트 선택 모드 검사)와 `test:verify`(검증 묶음)가 더해졌습니다. 기본 vitest 프로젝트는 unit·render·react18·production·storybook이고 verify-unit·verify-render가 추가되었습니다.

## 동작 변경(인터페이스 관점)

결함 수정(관측 결과가 바뀜):
- #391 전달 중 루트가 교체되면 새 런타임에서 연쇄를 마치고 폐기된 루트로의 교체는 거부합니다.
- #402 보류 중 퇴장을 노드 동일성으로 정리해 폐기된 배열 항목 안의 보류 퇴장을 함께 떼어냅니다.
- #403 배열 항목에 선언된 조각 `controls`가 항목에 도달합니다. #405 조각 파생 규칙(`derived`·`unsetValue`·`resetInteraction`)이 `items`·`additionalItems`·`prefixItems`의 항목에 도달합니다.
- #409~#413 공유 선언 충돌은 접힘 동일성으로 비교하고, 노드 동일성 열쇠에 합집합 접힘을 넣으며, 접힘이 다른 조각의 배열 항목은 접힘별 후보를 가집니다(동시 활성은 `SHARED_NODE_CONFLICT`). 후보가 있는 배열에 대한 새 형상 밖 쓰기는 첫 종류에 묶입니다.
- #431 자손이 원시 쓰기 없이 방출 형상에 들어오거나 나갈 때 그것을 읽는 게이트와 상태 키를 다시 평가합니다(마운트와 갱신 결과 일치). 게이트 있는 배열 행이 15~30 % 느려지는 비용은 소유자가 정확성의 대가로 수용했습니다(440라운드).
- #449 문자 그대로 `*` 인 속성 이름의 상태 키 판독자가 있음 변화 뒤 다시 계산됩니다(`*` 조각은 반복 아이템 템플릿을 선언한 호스트 아래에서만 배열 와일드카드).
- #450 overlay 가 유지 자식의 유효 스키마를 바꿔 투영 방출만 달라져도(켜짐·복귀 모두) 바깥 상태 키·게이트 독자가 다시 계산됩니다.
- (#451, 소유자 판정 대기) 옮긴 게이트가 읽는 값이 사전 공표로 바뀌면 그 게이트만 다시 예약되어 선언 호스트까지 다시 계산됩니다(SETTLE-045).

의미 변경: 위 스펙 절의 이름 변경(`misfit`, `Misfit`, 오류 `name`), `schemaType` 범위, `insert` 추가, `node` 조건 빌드 출력.

순수 성능 변경(관측 동치 확인, 24개 PR): #399·#401·#408·#416~#420·#423·#425~#429·#433·#435~#440·#442·#443·#447. 구조 정리 3개(#393~#395), 시험만 4개(#424·#434·#444·#448), 결함 수정 2개(#449·#450), 문서만 10개.

## 채택 규칙(443라운드 확정)

속도 변경의 채택은 크기 가족별 추세선으로 판정합니다: 행 중앙값에 최소제곱 직선을 적합하고, 폭 (다) = max(|slope(A)−slope(A′)|, A·A′ 완전 라운드 기울기의 최대 편차)를 넘는 같은 부호의 기울기 변화만 입증으로 봅니다. 기울기가 같고 절편(기본 비용)만 낮아지는 변경도 같은 형태의 폭으로 채택합니다. 행별 442C 판정은 정보이며, 어느 행이든 입증(느림)이면 되돌립니다. 같은 후보를 다시 재어 판정을 뒤집지 않습니다.

## 정리 상태

작업 폴더는 메인 하나이고, 코디네이터가 만든 가지는 로컬·원격 모두 지웠습니다(병합·종료 PR #423~#451). 열린 PR은 이 PR 과 상위 Draft #344(`1.0.0-beta → master`)입니다. 원장은 444라운드로 닫혔고(`architecture/reviews/round-444-closing.md`, 마감 커밋 `7c38cf56f`), 결정 54·59와 P1 전체 protocol 실패는 보류 그대로입니다. 제품 끝은 `c62818ab4`(#451 병합)이고 열린 PR 은 이 PR 과 우산 Draft #344 뿐이며 작업 폴더는 메인 하나입니다. 소유자가 정할 것은 이 PR 의 버전 번호와 병합뿐입니다. 8단계 최종 측정표는 `a63db97c2` 창(443b)이고 #451 의 변화는 수정 PR 의 20행 창에 따로 있으며, 전체 재측정은 9단계 릴리스 전 벤치 재실행(LANDING-096)에 맡깁니다.

## 소유자 결정(답을 받은 것)

1. 버전 번호와 이 PR 의 병합은 Vincent 가 직접 합니다(443라운드).
2. 잔여 격차의 이월: 9단계는 코어 로직을 수정하지 않으므로, 일괄 setValue 수정 3의 EVENT 계약, 인식기 밖 게이트 형의 표 자격, 가설 1 경로 interning, flat-2000 갱신의 `assembleObject` 복사, (다) 7행은 수치 기록으로만 남깁니다(9단계 이월 아님).
3. 마지막 검증은 444라운드에 실행했습니다: 브라우저 시험은 ego-browser, 검증은 Claude(소유자 지시).
4. 결함 확인의 남은 계약 판정 넷은 소유자 위임으로 코디네이터가 원장 문장으로 닫았습니다(444C-01~04).
5. #451 의 느린 통제 행은 소유자가 TEST-027 로 수용했고 병합되었습니다(444C-06).

## 증거

- 최종 측정: `.seiri/tasks/final-measure-443/report.md`(코어 `core/rows.md`, React `form/form-rows.md`, Storybook `storybook/files.md`, `seal.json`). 직전 창: `final-measure-442/`.
- 상수 손질 묶음: `.seiri/tasks/ledger-pr-a-443/`(C1 채택), `ledger-pr-b-443/`(C3·C4·C6 기각), `ledger-pr-c-443/`(C8·C9 기각), 설계 `ledger-design-442/`. 결과 문서 `architecture/verification/perf-optimization/ledger-pr-a-results.md`.
- PR별 결과 문서: `packages/canard/schema-form/architecture/verification/perf-optimization/*-results.md`.
- 원장 마감: `architecture/reviews/round-444-closing.md`, `round-444-owner-answers.md`(443: `round-443-closing.md`, `round-443-owner-answers.md`).
- 마지막 검증: `.seiri/tasks/final-verify-444/`(`rulings.md`, `gates/gates.md`, `browser/browser.md`).
