# 188라운드 닫기 — 외부 오류 변경(루트의 set·clear, 자식의 경로 전파)은 UpdateGlobalError를 올려 onValidate가 집계를 받게 한다 — 0.16.0은 루트 외부 오류가 바뀔 때 UpdateGlobalError를 발행해 onValidate를 불렀으므로(dist/index.mjs:3560, :5688) 새 판이 못 내던 통지를 되찾는 편집자 결정이다

2026-10-13. reviewer가 185라운드 전파 커밋(26a36c70d)과 함께 사실 하나를 올렸다: 새 엔진에서 외부 오류 쓰기는 루트든 자식이든 UpdateGlobalError를 올리지 않는다(루트 setExternalErrors는 UpdateError만 queue; UpdateGlobalError는 clearSchemaNodeFormErrors와 검증 웨이브만). 그래서 onValidate는 errors prop 변경이나 자식 clear에 호출되지 않고 다음 검증 때 집계를 본다. Form 수준 시험이 이것을 그대로 고정해 두었다. 원장 관리자 대조: 0.16.0은 루트의 setExternalErrors가 `if (this.isRoot) this.publish(NodeEventType.UpdateGlobalError, mergedGlobalErrors)`를 발행했고(:3560) RootNodeContextProvider가 UpdateGlobalError에 onValidate(payload)를 불렀으며(:5688) Form 재렌더 이벤트에도 UpdateGlobalError가 들어 있었다(:6281). 즉 0.16.0 소비자는 errors prop을 바꾸면 onValidate로 합쳐진 목록을 바로 받았다.

### 188C-01 (1) 루트의 외부 오류 목록이 바뀔 때(루트 자신의 setExternalErrors·clearExternalErrors, 그리고 185라운드 전파로 자식이 루트 목록을 바꿀 때) UpdateError와 함께 UpdateGlobalError를 queue해 onValidate가 globalErrors 집계를 받게 한다 — 0.16.0 동작의 복원이며 "옛 판이 내던 통지를 새 판이 못 내는" 차이이므로 166라운드 규칙대로 편집자 결정이다; (2) applyFormErrors처럼 루트가 이미 같은 참조를 든 경우는 아무 이벤트도 내지 않는 26a36c70d의 멱등 규칙을 유지하고, 한 batch 안에서 여러 경로가 바뀌어도 UpdateGlobalError는 한 번만 전달된다(기존 이벤트 합치기 규칙); (3) reviewer가 별도 커밋으로 구현하며 Form 수준의 "호출되지 않음" 시험은 "errors prop 변경과 자식 clear 뒤 onValidate가 집계를 받음"으로 바꾸고 통지 횟수(각 1회)를 단언한다; dispatch INTENT/DETAIL과 Form의 onValidate 문서 문구를 코드보다 먼저 고친다; (4) 공개 d.ts 변화 없음

- 닫는 항목: SURFACE-053(보충), LANDING-204(보충)
- 결정:
  - 【추론】 onValidate는 "폼의 오류 집계가 바뀌었다"를 알리는 통로이고 0.16.0에서 외부 오류도 그 집계에 들어가 통지됐다. 새 판이 검증 결과에만 통지하면 errors prop으로 서버 오류를 넣는 소비자가 다음 검증까지 집계를 못 보게 되어 옛 판보다 좁아진다. 185라운드가 자식 전파까지 루트 집계에 넣기로 했으므로 통지도 같은 자리에서 함께 나가야 일관된다.
- 근거: reviewer의 사실 보고; 0.16.0 dist/index.mjs:3560·:5688·:6281; 185라운드 소유자 답; 178C-01; 166라운드 원칙; SURFACE-053.
- 다음: reviewer가 커밋 뒤 SHA를 보낸다. 원장 관리자는 소유자에게 보고한다.

## 덧붙임 (2026-10-13, 소유자 물음과 보강 둘)

소유자가 "이 필드가 정확하게 동작했으면 좋겠고 동시에 동작속도에 영향을 크게 주지 않았으면 좋겠다 … 이 방법이 최선인가?"라고 물었다. 원장 관리자 판단: 경로 정체성 + 멱등 규칙 + batch당 한 번의 UpdateGlobalError는 정확함과 속도 모두에서 최선에 가깝다 — 비용은 외부 오류를 쓰거나 지우는 순간에만 들고 루트 목록 길이에 비례하며(보통 수십 개, 마이크로초), 타이핑·검증의 뜨거운 경로에는 들어가지 않는다; 식별자 Map으로 O(1) 제거를 하려면 소비자 객체에 id를 찍거나 감싸야 해서 권하지 않는다. 보강 둘을 reviewer에 지시: (1) 한 batch 안의 여러 자식 set·clear는 루트 목록 재구성을 flush 때 한 번만(더러움 표시), batch 밖 단일 호출은 즉시; (2) 작은 시간 시험(외부 오류 1,000개, 자식 100개 clear를 batch 안·밖에서; 넉넉한 상한으로 선형성 확인과 기록) — 판정 세션은 없다.
