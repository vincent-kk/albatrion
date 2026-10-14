# 316라운드 — Vincent의 설명과 결정 (Form 재구성의 뜻은 컴포지션의 독립 컴포넌트; constants·hooks는 organ, types는 fractal, Field를 Form처럼)

2026-10-14. 315라운드 뒤 소유자가 Form 재구성의 뜻을 설명하고 구조 지도를 요청했으며, 지도의 결정거리 셋에 답하고 Field 재구성을 지시했다.

| 확인 | 물음(요지) | 답 원문 | 반영 |
| --- | --- | --- | --- |
| Form 재구성의 뜻: 컴포지션의 독립 컴포넌트 | 315C-01의 "FormCore 자리" 의문 | "음.. 나도 처음엔 Form 과 부속으로 나눴는데, 이게 다시 보니까 컴포지션 패턴이라, 사실 연관없는 독립 컴포넌트로 보는게 낫겠더라고.\n그래서 동일 위계로 놓았어.  \n\n다른걸 한번 보여줄래? 내가 훑어볼 수 있게.\n\n그리고 그럼 브랜치 정리해서 지금 스테이지된걸 대체해줘." (2026-10-14, 원장 세션) | 설명과 지시. FormCore와 Form.* 다섯은 컴포지션 패턴의 독립 컴포넌트라 같은 위계. 원장 관리자가 src 전체 구조 지도(fractal 59·organ 125, 표준 모양 42)를 만들어 보였고(scratchpad src-structure-map.md·src-structure.html), 본 체크아웃의 스테이징은 병합된 #379로 대체(restore + ff). |
| constants·hooks는 organ, types는 fractal, Field를 Form처럼 | 지도의 결정거리 셋(organ 안의 barrel, 자식 자리, organ 이름의 fractal) | "constant 랑 hooks 는 organ 이니까 index.ts 제거하고, 직업 import 를 해야겠다. \ntype 은 프렉탈로 취급해서 INTENT.md 를 하나 넣어주고. \n\n뭔가 문제가 있나? 크게 문제는 없어보이는데. \n\n/Users/Vincent/Workspace/albatrion/packages/canard/schema-form/src/components/Field 를 Form 처럼 좀 재구성해볼테냐?\n어떤 느낌을 선호하는지는 알거같은데 이제" (2026-10-14, 원장 세션) | 확정. (1) constants·hooks는 organ — index.ts 제거, 파일 직접 import(hooks는 정돈-3의 INTENT·DETAIL과 hooks/hooks 한 겹도 제거, 공개 export 이름 일곱 불변). (2) types(와 rolled)는 fractal 그대로(INTENT·DETAIL 이미 있음). (3) 같은 규칙으로 Form/components/index.ts(organ 안의 barrel)도 제거, Form.tsx는 각 자식 진입점을 직접. (4) components/Field는 Form처럼 — FieldProxy·FieldInputSlot·DeferredFieldProxy를 Field/components/ 아래로, Field/index.ts의 export 집합 불변. fairy08이 한 PR로(정돈-E 병합 뒤 rebase, 게이트에 가드 시험 둘 필수), 원장 관리자 병합. |

다음 라운드 번호는 317이다.
