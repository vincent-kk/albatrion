# 348라운드 — 닫기 (묶음 3 blueprint PR #393 병합 36c661f49; 편집자 결정 셋; 결정 대기열 57)

2026-10-15. 344라운드의 자율 진행 지시에 따라 원장 관리자가 묶음 3의 첫 PR(blueprint 재구조화) #393을 검토하고 `feat/schema-form-08-review-and-perf`에 squash 병합했다(36c661f49). 내용: blueprint를 자식 fractal 일곱(buildNodes, compileBlueprintExpressions, validateShape, collectBlueprintWarnings, validateChildTargets, StaticFirstLoadCapability, effectiveSchema)과 주제 organ 여섯(analyze, allowedTypes, diagnostics, expressions, features, itemEntry)으로, 형은 관심사별 types/ 칸으로, 소비자 없는 stripSchema·resolveArrayLimits와 그 시험을 삭제, 함수 껍데기 디렉토리 제거, DETAIL 188-194의 낡은 컴파일러 예외 삭제(H1 보고, 335라운드 4번, 336라운드 7·8번). 이동은 codex가 했고 문서 커밋이 코드 커밋에 앞선다. 검증은 agy 한 번, fairy08의 INTENT·DETAIL 읽기 전용 대조(문서 보완 다섯), 원장 관리자 verifier(선언 160개 본문 동치, 공개 94개·blueprint 진입점 21개 동일, 경계 위반 0, 막는 결함 하나)였다.

## 편집자 결정

- **348C-01 (PR #393 병합 기록과 이동 PR의 설정 glob 점검).**
  - 【추론】 묶음 3 blueprint PR #393을 36c661f49로 squash 병합했다. verifier가 찾은 막는 결함 하나는 vitest production 프로젝트의 include가 `blueprint/__tests__/` 바로 아래만 잡아 buildNodes로 옮겨진 owned-inline 시험 넷이 조용히 빠진 것(20건 → 9건)이었고, glob을 `blueprint/**/__tests__/`로 고쳐 20건으로 돌아왔다. 규칙: 파일을 옮기는 PR은 설정(vite 프로젝트, eslint, storybook, scenarios, filid, bench)의 경로 glob을 모두 훑어 본문에 점검 결과를 적고, production 프로젝트는 묶음 3의 축약 게이트에 들어간다. 시험 수의 감소는 지운 시험 수와 정확히 맞아야 하며 차이는 설명되어야 한다.
- **348C-02 (진입점이 이름으로 내보내는 형 칸의 유지 이유).**
  - 【추론】 organ `types/`의 형을 fractal의 진입점이 이름으로 다시 내보내 바깥이 쓰면, 그 fractal의 DETAIL Boundary Exemptions에 칸 단위로 한 줄(형은 구현이 아니므로 칸에 두고 진입점이 이름으로 내보낸다; 바깥 소비자 나열)을 적는다. 형마다 적지 않는다. blueprint와 effectiveSchema는 #393에서 적었고, record·write·validation의 같은 공백은 묶음 3 settle PR에서 채운다.
- **348C-03 (패키지 CLAUDE.md의 경로 한 줄은 소유자 대기열 57).**
  - 【추론】 패키지 CLAUDE.md 94행이 옮겨진 파일의 옛 경로(`src/core/engine/blueprint/utils/diagnostics/validateControlGroups.ts`)를 가리킨다. 새 위치는 `src/core/engine/blueprint/buildNodes/utils/declarations/validateControlGroups.ts`다. fixy08 세션은 다른 세션의 요청으로 CLAUDE.md를 고치지 않는 규칙이 있고 원장 관리자도 CLAUDE.md 편집에는 소유자 승인이 필요하므로, 포인터 한 줄이라도 결정 대기열 57로 두고 소유자의 허락 뒤 한 줄 커밋으로 넣는다.

## 남은 것

fixy08: derive+navigation PR(evaluateDeriveRound fractal과 평탄화, navigation 가벼운 정리, derive DETAIL 5-6 모순 정정) → settle PR(loadFieldNodeAtMount·arrangeFieldNodeItems fractal, compute/selectChildren·structure/applyArraySlots 해소, 11칸 순환 풀기, pathStores·templatePaths 이름, 저장소 키 misfits·misfitsMemo, FormCore·FormError·FormLabel의 type.ts → types/, record·write·validation의 형 칸 유지 이유). fairy08: PR마다 INTENT·DETAIL 대조, 셋이 병합된 뒤 속도 계획·bench 최종 경로 PR. 결정 대기열 54–57은 열려 있다.

다음 라운드 번호는 349이다.
