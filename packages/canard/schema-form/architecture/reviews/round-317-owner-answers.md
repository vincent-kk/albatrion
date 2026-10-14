# 317라운드 — Vincent의 확인과 결정 (Form barrel 삭제, 병렬 진행, 검증 뒤 병합 위임, surface/classes → runtime, 손질은 단일 PR)

2026-10-14. 316라운드 뒤 소유자가 Form barrel 삭제를 확인하고 병렬 여부를 물었으며, PR 병합을 위임하고, surface/classes의 이름을 물어 runtime으로 정했다.

| 확인 | 물음(요지) | 답 원문 | 반영 |
| --- | --- | --- | --- |
| Form barrel 삭제 확인·병렬 물음 | Form/components/index.ts 삭제와 E→둘째 손질→S 순서 | "응 그건 지워도 돼. 그대로 진행해. 근데 음.. 이건 병렬로 안하는 이유가 있어? \n\n정돈 E -> 구조둘째손질 -> 정돈S 이걸 순서대로 한다는거지?" (2026-10-14, 원장 세션) | 확인과 물음. barrel 삭제 확정. 답: 개발은 이미 병렬(fixy08 E, fairy08 둘째 손질)이고 병합만 직렬(같은 파일을 건드려 rebase 필요, 무거운 게이트 동시 실행 금지). 정돈-S는 fairy08이 대기 시간에 병렬로 시작(워크트리 stage-tidy-S), 정돈-4는 E를 마친 fixy08. |
| 검증 뒤 병합 위임 | PR 셋(E·둘째 손질·S)과 정돈-4 | "아 오케이. 그럼 다 오면 확인해서 문제없으면 머지까지 해줘." (2026-10-14, 원장 세션) | 확정(298라운드의 재확인). 원장 관리자가 검증하고 문제없으면 순서대로 병합, 각 병합을 원장에 적고 한 번에 보고. |
| surface/classes의 이름 | core/surface/classes/에 단일 클래스 FieldNode.ts | "한가지 그럼 더. /Users/Vincent/Workspace/albatrion/packages/canard/schema-form/src/core/surface/classes 이거 이렇게 나눈건 좋은데 classes 로 클래스가 늘어날 가능성은 없지않니? 단일 클래스로 구성을 바꿔버린거니까.\n차라리 그럼 runtime 이나 그런게 낫지 않을까? 어떻게 생각하니?" (2026-10-14, 원장 세션) | 물음. 원장 관리자의 답: 동의 — 일부러 단일 클래스(E3가 확인)라 복수형 역할 이름이 맞지 않음. runtime/이 낫다(fractal 이름 surface의 뒤에서 움직이는 런타임 객체; 코드 어휘 FieldNodeRuntime·requireRuntimeFieldNode와 일치). 주제 이름이라 DETAIL에 이유 한 줄. utils/requireRuntimeFieldNode.ts·setContext.ts도 runtime/으로, utils/에는 binding·guards·fieldNodeFactory. |
| 셋째 손질: surface runtime, 단일 PR | 위 제안 | "그래 셋째 손질로 fairy08에게 넘겨줘. \n\n손질수가 늘어난다고 느려지진 않겠지? 단일 PR로 잘 모아줘" (2026-10-14, 원장 세션) | 확정. 셋째 손질(classes→runtime, 보조 둘 이동, DETAIL)은 fairy08이 둘째 손질과 같은 브랜치 feat/schema-form-structure-2에 커밋으로 더해 PR 하나로. 손질이 더 생겨도 같은 PR에 모은다(rebase·게이트·PR은 한 번). |

다음 라운드 번호는 318이다.
