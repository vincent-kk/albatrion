# 318라운드 — Vincent의 지시와 물음 (fieldInputs를 내장 입력마다 fractal로, Definition은 index.ts에; FieldInputArray가 ArrayItems를 래핑한 이유)

2026-10-14. 구조 리뷰 넷째 손질. 소유자가 fieldInputs 아래가 어지럽다며 입력마다 fractal로 묶고 organ(utils·type)을 분리하며 index.ts에 Definition을 정의하라고 지시했고, FieldInputArray의 ArrayItems 래핑 이유를 물었다.

| 확인 | 물음(요지) | 답 원문 | 반영 |
| --- | --- | --- | --- |
| fieldInputs를 입력마다 fractal로; ArrayItems 래핑 이유 | fieldInputs 구조와 FieldInputArray의 래핑 | "하나 더. \n/Users/Vincent/Workspace/albatrion/packages/canard/schema-form/src/fieldInputs 여기 하위 보면 \nutils 나 FieldInput 들이 어지러히 널려있다.\n\n이거 개별 FieldInput 마다 디렉토리로 묶어서 개별 프랙탈로 만들어줘. \n지금 보기도 좀 어렵고 그렇네.\nutils / type 등 organ 을 분리해주고, 개별 프렉탈의 index.ts 에 Definition 을 정의하면 좋을거같아. \n\n그리고 /Users/Vincent/Workspace/albatrion/packages/canard/schema-form/src/fieldInputs/components/FieldInputArray.tsx 이거 있잖아. FieldInputArray 이거 ArrayItems 이 컴포넌트를 래핑한 이유가 뭐야?? 기존 인터페이스 유지하려고 그런거야?" (2026-10-14, 원장 세션) | 확정과 답. (1) 래핑은 인터페이스 유지가 아니라 memo 경계다: node는 변하는 객체라 자식 수 변화를 identity로 알 수 없어 바깥이 childCount를 prop으로 넘기고 안쪽 ArrayItems는 값만 바뀐 부모 렌더에서 행·버튼을 재생성하지 않는다(fieldInputs DETAIL 11·13행, 87라운드 원칙, array-memo 시험). 유지한다. (2) 넷째 손질: fieldInputs 뿌리는 문서·index.tsx(조립)만, components/ 아래 내장 입력 열한 개가 각각 index.ts(Definition 정의·export, 배선)·type.ts(필요 시)·컴포넌트·INTENT·DETAIL(한국어)을 가진 fractal; 보조는 각자 아래(isRenderableDateInputValue → DateFormat/utils, ArrayItems·Button → FieldInputArray/components); barrel 없음; 시험은 가장 가까운 fractal로. 공개 표면 불변(바깥 소비자는 app/plugin의 builtinFieldInputDefinitions뿐). 담당 fixy08(정돈-E 뒤), 정돈-S 병합 뒤 base, 별도 PR(둘째·셋째 손질 PR과 영역이 달라 묶지 않음). |

다음 라운드 번호는 319이다.
