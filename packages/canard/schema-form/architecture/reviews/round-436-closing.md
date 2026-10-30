# 436라운드 닫기 — PR423 착지와 병합, 검증자의 낮은 등급 지적

PR423이 435C-01의 여섯 조건을 충족한 뒤 병합된 사실과 검증자가 남긴 낮은 등급 지적 셋을 원장에 보충합니다.

## 편집자 결정

- **436C-01 (PROCESS-060, PR423 착지와 병합).** PR423은 435C-01의 여섯 조건을 모두 충족한 뒤 2026-10-20 12:45 UTC에 코디네이터가 gh squash로 병합했고, 제품 끝은 `d9f4eb975`다.
  - 【추론】 PR423은 435C-01의 여섯 조건을 모두 충족한 뒤 2026-10-20 12:45 UTC에 코디네이터가 gh squash로 병합했다(병합 커밋 `d9f4eb975`, 제목 "perf(schema-form): skip proven empty array declarations (#423)"). 착지는 재기반이 아니라 main(`fd5a8eb2a`)을 PR 가지에 한 번 병합하는 방식으로 했고(`1b1048438`), 겹친 fixture 다섯(`observe.ts`·`ruleTargetIdentity.ts`·`codec.ts`·`scenes.ts`·`__tests__/ruleTargetIdentity.test.ts`)은 PR424가 넣은 main 판을 바이트 그대로 택했으며, main에 없는 PR 전용 `measurements.mjs`는 유일한 소비자인 PR 전용 벤치마크를 위해 그대로 두었다(J-23). 제품 차이는 `declareArrayChildren.ts` 7줄과 DETAIL.md 둘뿐이고 빌드된 dist(`index.mjs` `9f454b91…`, `index.cjs` `c71be7dc…`, `index.d.ts` `740dc55c…`)는 M3 창의 E3′와 바이트까지 같아 성능 판정은 434C-03을 그대로 쓴다. PR 전용 시험 `itemless-declarations.fallback.test.ts`(derive-inject-target)가 main의 strict 관측기 아래에서 7줄 유무와 무관하게 실패했고(`Unknown or ambiguous rule owner` 7건), 원인은 제품이 아니라 직접 import 어댑터가 `__readExistingRuleOwnerId`를 제공하지 않는 장치 차이였으므로 어댑터 `itemlessDeclarationsSource.ts`만 main `capture.test.ts`의 rolldown load 패턴으로 바꿨다(`75af72e06`, 단언·장면·기대값 변경 0, J-24). 네 게이트(시험 4895 통과·실패 0·todo 1, 다섯 프로젝트), Node·Bun 관측 동치 174쌍 차이 0, 독립 검토(agy gemini-3.8-flash-high) PASS 지적 0, 검증자(Claude Opus) PASS 차단 결함 0을 거쳤다. 증거는 `/Users/Vincent/Workspace/albatrion/.seiri/tasks/pr423-landing-435/`(봉인 109파일; `review-agy.md`·`merge-body.md`는 봉인 뒤 추가)다. 제품 끝은 `d9f4eb975`다. 작업 폴더 셋(`l3e-direct-ownership`·`schema-form-m3-pre-opt`·`schema-form-m3-itemless`)의 삭제는 소유자 승인 대기다.
- **436C-02 (PROCESS-060, 검증자의 낮은 등급 지적과 후속 문서 정리).** 검증자는 병합을 막지 않는 지적 셋을 남겼고, 셋은 다음 문서 정리 때 닫으며 제품 동작이나 측정 판정을 바꾸지 않는다.
  - 【추론】 검증자는 병합을 막지 않는 지적 셋을 남겼다. (1) `src/core/engine/behaviors/arrayBehavior/DETAIL.md:14`의 "존재하는 빈 목록도 이 자격으로 간주하지 않으며"는 청사진 필드 기준으로만 맞고, 작성 스키마의 `items: []`·`prefixItems: []`는 컴파일에서 필드 부재로 정규화되어 조기 반환을 타며 결과는 일반 경로와 같다. (2) `src/core/DETAIL.md:111-112`의 두 줄은 PR424가 같은 파일 5-7줄에 넣은 문장과 겹치고, 112줄의 "기존 source 특성화·비용 spy와 격리 모듈의 강화 관측은 별도 증거로 유지한다"는 어댑터 뒤에는 source 특성화 시험도 격리 rolldown 모듈에서 강화 관측으로 돈다는 점을 반영하지 않는다. (3) PR 전용 벤치마크 장치(`itemlessRuleTargetBinding/*`, `itemless-declarations.mjs`, `measurements.mjs`)는 착지 트리에서 실행하지 않았고 import 이름·시그니처만 main fixture와 일치함을 확인했다. 셋은 다음 문서 정리 때 DETAIL 문장 둘을 고치고 PR 전용 벤치마크를 한 번 실행해 닫는다; 어느 것도 제품 동작이나 측정 판정을 바꾸지 않는다.

## 근거와 남은 것

결정 60은 병합으로 끝났고 제품 끝은 `d9f4eb975`다. 열린 PR은 없다. 다음 작업은 (가) 20행의 82C-01 진단(oneOf-5/10/20 갱신·마운트, nested-d3/d5·flat-50/100/500 마운트의 단계별 비용을 선형 몫과 초선형 몫으로 가름)과 결정 58 게이트 폼 실험 설계, (다) 14행의 추가 확인이며, C3·C4 8행은 후속 개선 우선 항목이다(PLAN.md 4절 1항). 작업 폴더 셋 삭제는 소유자 승인 대기다.

다음 라운드 번호는 437이다.
