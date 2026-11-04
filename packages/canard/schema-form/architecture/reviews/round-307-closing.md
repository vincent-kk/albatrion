# 307라운드 닫기 — 정돈-2 PR #377 병합(fd2a56c2f): 시험 자리를 FCA import 모델대로, index 항목 48개 삭제, 공개 표면 92개 동일; 정돈-3 투입

2026-10-14. fixy08이 정돈-2 PR #377을 열었고(커밋 12개, 끝 07116fb6d), 원장 관리자가 직접 확인과 verifier(opus) 독립 검증을 거쳐 스쿼시 병합했다(298라운드 "PR 병합 허용", 296라운드 "끝나는 대로 보고"). 정돈-2 진행 중에 내린 편집자 결정과 승인한 변용을 여기에 적는다.

### 307C-01 #377을 병합한다 — 모델 위반 0, 공개 표면 92개 동일, 시험 3825 통과

- 닫는 항목: LANDING-210(보충)
- 결정:
  - 【추론】 원장 관리자의 직접 확인: 병합 상태 CLEAN, 금지 경로(`.claude/`·설정·`architecture/`·`.filid/`) 변경 0, 커밋 12개에 세션·공동 저자 줄 0, 루트 `src/index.ts`의 변경은 `export type * from './types/rolled'`를 이름 21개의 목록으로 바꾼 한 덩어리뿐. verifier의 독립 검증: 빌드 뒤 `dist/index.d.ts`를 컴파일러로 열거해 기준(정돈-1 직전 빌드, 정돈-1 뒤와 ae502f7bd 사이의 src 차이는 주석뿐이라 전이로 동등)과 대조해 이름 추가 0·삭제 0·형 문자열 차이 0, 남은 와일드카드 0(기준 dist에는 하나 있었음); unit·render·react18을 각각 한 번 직렬로 돌려 2381·722·722 통과, 실패 0, 할 일 1, 종료 코드 모두 0; 가드 시험 `src/__tests__/importModel.test.ts`의 논리를 저장소 밖에 복제해 돌리니 PR 트리에서는 D7 안의 루트 index 자기 import 77개 외 위반 0, ae502f7bd 추출본에서는 U 185·D 61·S1 24로 가드가 실제로 잡는다; 옮긴 시험 넷(U8·ERROR-017·TEST-069·branchless 색인 둘)은 삭제가 아니라 이동이고 `expect(` 호출은 14233→14236, `.skip`·`.only` 추가 0. fixy08이 보고한 "실패 0인데 종료 코드 1" 한 번은 verifier도 재현하지 못했고 원인 미상으로 남긴다(storybook·production 프로젝트를 포함한 기본 실행이었을 가능성). 병합 결과 1.0.0-beta는 fd2a56c2f.
- 근거: PR #377(fixy08); verifier 보고(2026-10-14, 공개 표면 열거 `tidy-surface/surface-base.txt` 대조); `reviews/round-297-closing.md` 297C-01(정돈-1 기준).
- 다음: fixy08에게 정돈-3(`plan/tidy-structure/brief-tidy-3.md`)을 즉시 넘긴다. fairy08은 filid 이슈 초안의 수치를 fd2a56c2f로 다시 세어 ogham에 등록한다(289라운드 D6 "그때 올려줘").

### 307C-02 정돈-2에서 내린 편집자 결정과 승인한 변용을 적는다 — 모두 FCA import 모델 안의 자리 바꿈이다

- 닫는 항목: LANDING-210(보충)
- 결정:
  - 【추론】 (1) `nodeFromJSONSchema`는 core index로 만든 시험·벤치 보조로 `src/__tests__/fixtures/`에 둔다(D2의 "뿌리에서 아래로"를 시험 쪽으로 푼 것). (2) FieldNode 클래스를 import하던 시험은 구조적 좁히기 fixture `TestFieldNode`(`src/core/__tests__/fixtures/`)로 바꾸고, 공개 노드 동작(`find`·`setValue`·`remove`)을 부르는 12개 파일은 `isTestFieldNode`로 좁혀 공개 멤버와 레코드를 함께 쓴다 — 클래스에만 있는 멤버가 필요해 surface 시험으로 옮긴 파일은 0. (3) index 이름 넷(`fieldNodeFactory`·`loadFieldNodeAtMount`·`resetFieldNodeForm`·`blueprint`)은 보유 이유를 소유 fractal의 DETAIL에 적고 남긴다(B8), 그래서 삭제는 48 항목(43 이름). (4) 승인한 변용: 뿌리 하네스는 자식 index로; 패키지 진입 단언 시험 둘은 `src/__tests__/migration/`으로; index 모양 `it`은 부모 `__tests__`로; 네임스페이스 import는 이름 import로; 모델 가드 시험은 `src/__tests__/`에; `app`은 organ(facade 조항, INTENT·DETAIL 삭제)으로; `getErrorMessage`(keyword/locale)는 `selectKeywordErrorMessage`로; 죽은 `FieldNodePropsFlow.helpers.tsx` 삭제; fixture `createDispatchTree`·`ownedInlineHead.json`은 `engine/__tests__/fixtures`로; `nan-delivery` 분할; core 시험은 blueprint·settle·engine `__tests__`로. (5) 진행 중 fixy08이 코드와 맞지 않아 바꾼 일곱: E1 fixture props 형은 core index 이름만으로 유도; E3 위 (2); E4 branchless-differential은 아래 307C-03; E6 validatorConformance는 둘로 나눠 플러그인 형 단언은 `app/plugin`에 남기고 수명·가드 읽기는 `core/engine/validation/__tests__`로(`readFieldNodeGuard` 삭제); E6 FormErrorDetails 형 계약 시험은 `errors/__tests__`로; Form 시험 다섯 중 정적 멤버를 쓰는 하나는 `src/__tests__/`로; `schemaSurface.type.test.ts`는 types가 organ이라 그대로. (6) 217C-01대로 fixy08이 직접 고친 셋(codex가 남긴 TS2540 여섯, 통째 재포맷 일곱 파일 되돌림, 178개 파일의 `@/schema-form/…/index` 경로 되돌림)과 filid 훅이 `app` 문서 삭제를 한 번 막아 codex가 수정·삭제를 나눠 실행한 일은 PR 본문에 적혔다.
- 근거: `plan/tidy-structure/brief-tidy-2.md`; `fca-import-model.md` §2(B1–B8)·§6; fixy08 진행 보고(2026-10-14) 둘과 PR #377 본문; `reviews/round-289-owner-answers.md`(D2·D4); `reviews/round-295-owner-answers.md`(변용 허용).
- 다음: 없음.

### 307C-03 B8(부모 수준 시험 도구가 자식 내부에 닿음)의 첫 실제 사례를 적는다 — 숨기지 않고 DETAIL에 선언하는 쪽이 모델의 뜻이다

- 닫는 항목: LANDING-210(보충)
- 결정:
  - 【추론】 `core/engine/__tests__/blueprint.branchless-differential.test.ts`는 같은 스키마를 branchless 분석과 일반 분석으로 돌려 비교하므로 입력을 바꿔 피할 수 없고(가 불가), 흉내 낼 `collectSchemaCapabilities`는 blueprint index로 나가지 않아 index 경로를 흉내 낼 수 없다(나 불가). 그래서 (다): 시험은 engine 자리에 두고 `src/core/engine/DETAIL.md:33`에 vi.mock이 blueprint 내부에 닿음을 B8 사례로 선언하며, settle 내부(`getDependencyIndex`)를 쓰는 `it` 하나만 `core/engine/settle/__tests__/settle.branchless-feature-indexes.test.ts`로 나눈다. vi.mock의 경로 문자열은 import 구문이 아니라 검사기가 세지 않지만 형제 내부를 경로로 집는 것은 모델이 금지한 옆으로 닿기와 같은 결합이므로, 검사기가 못 보는 것을 허용으로 읽지 않고 선언한다. 이 사례와 "vi.mock 경로를 검사기가 세지 않음"은 마지막 filid 개선 결정의 재료다(294라운드 "잊지 말 것").
- 근거: fixy08 보고(2026-10-14, (가)·(나) 불성립 이유); `fca-import-model.md` §2 B8; `src/core/engine/DETAIL.md:33`.
- 다음: filid 개선 결정 때 B8 선언 문법(DETAIL의 선언을 검사기가 읽을지)과 vi.mock 경로 추적을 함께 올린다.
