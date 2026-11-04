# 306라운드 닫기 — 배열 한도 문서 PR #376 병합(c40d6de8f): 304라운드 경계 문장이 공개 문서에 들어갔다

2026-10-14. fairy08이 305C-04의 지시대로 문서 전용 PR #376을 열었고 원장 관리자가 검증 뒤 스쿼시 병합했다(298라운드 "PR 병합 허용").

### 306C-01 #376을 병합한다 — 문서 12개와 documents 데모 하나, 경계 문장과 배열 한도 절이 공개 문서에 적혔다

- 닫는 항목: LANDING-210(보충), WRITE-003(보충)
- 결정:
  - 【추론】 검증: 변경 파일 13개가 모두 문서(SPECIFICATION en·ko, README en·ko, QUICK_REFERENCE, docs/agents 셋, documents core-concepts·array-output-filters en·ko)와 데모 `ArrayOutputFiltersDemo.tsx`뿐이고 src·DETAIL·시험은 0개라 진행 중인 정돈-2와 겹치지 않는다; 커밋에 세션·공동 저자 줄 0; 데모의 `node.normalizedValue`는 공개 형 `FieldNode`의 `readonly outputValue`(`src/core/surface/type.ts:74`)로 바뀌었고 그 이름은 SPECIFICATION의 Array Output Filters 절과 같다; SPECIFICATION en·ko에 "What the core does with a schema"(136행)와 "Array Limits"(983행) 절이 새로 들어갔다; documents 빌드 en·ko는 브랜치 워크트리에서 통과했다(본 체크아웃에는 변경이 없으므로 워크트리가 맞는 자리). 지시 밖 변경 하나 — 데모 스키마의 `description` 문자열 "Three empty rows are offered up front"를 "Add rows and leave the last ones empty"로 바꾼 것 — 은 옛 전제(minItems 채움)를 화면에 적는 문구였으므로 받아들인다. prettier는 base에서 이미 통과하지 않던 셋(core-concepts.mdx en·ko, 데모)을 다시 포맷하지 않았고 이는 변경 범위를 지킨 것이다. 병합 결과 1.0.0-beta는 c40d6de8f.
- 근거: PR #376(fairy08, 끝 커밋 c7144aedd); `reviews/round-305-closing.md` 305C-04; `reviews/round-304-owner-answers.md:7`.
- 다음: 정돈-S(기본 배열 입력의 UI 전용 빈 슬롯)가 병합되면 그때 문서에 적는다. `plan/tidy-structure/array-limits-review.md` §5 4항은 끝났다.
