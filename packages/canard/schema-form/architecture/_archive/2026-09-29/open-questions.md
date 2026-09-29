# 미결 질문

소유자의 결정이 필요한 질문들이다. 해소되면 여기서 지우고 해당 ADR로 옮긴다. 17라운드 소유자 답(`reviews/round-17-owner-answers.md`)이 닫은 것은 그 자리에 표시했다(Q1의 나감 비움 범위, Q8의 터미널 판정). PR-1 전에 정련할 항목은 18라운드 안건(`reviews/round-18-agenda.md`)이 모은다.

## Q1. 조각이 꺼질 때 값은 어떻게 되는가

정해진 것(ADR 0006, 0007): 꺼진 조각의 값은 **방출 값에서 빠진다.** 노드의 원본은 남는다. 그래서 입력 도중 조각이 잠깐 꺼져도 데이터가 지워지지 않고, 스키마가 `unevaluatedProperties: false`를 써도 방출 값은 통과한다. `&active`와 조각의 비활성화는 같은 연산이다.

남은 것:

- **남아 있는 원본을 언제 실제로 지우는가.** 일부 닫힘: 나감의 비움 정책 `unsetOnInactive`(13라운드 답 2)가 분기가 꺼질 때 원본을 지우는 장치이고, 나가는 객체·분기에 켠 정책은 함께 나가는 하위 트리로 내려간다(17라운드 소유자 답 R17-2 ㄴ, 08 §8.4). 아래 후보(reset, 명시적 분기 변경, 제출 후)의 실제 파기 시점은 남는다. 꺼진 분기에 민감한 값이 남을 수 있다. 후보: reset, 사용자가 명시적으로 분기를 바꿀 때(JSON Forms는 확인 대화상자를 띄우고 새 분기의 기본값으로 교체한다), 제출 후.
- 다시 켜졌을 때 돌아오는 값은 꺼지기 전의 원본이다. 현재는 초기값과 복원값을 나눠 두고 `resetSubtree()`로만 초기값을 되살린다(`core/nodes/AbstractNode/DETAIL.md`) — "null로 버린 데이터는 되살아나지 않는다"는 #338의 규칙과 어떻게 맞출지.
- 같은 이름 + 같은 타입으로 노드를 공유하는 필드(ADR 0005)는 활성인 선언이 하나라도 있으면 방출된다. 선언한 조각들의 `enum`이 서로소이면 값이 새 조각의 선택지에 없을 수 있다(`reviews/round-1.md` R11-e).
- **비활성 경로에 쓰면 무슨 일이 일어나는가** — 거부, 원본에만 반영, 에러. 순차 쓰기와 배치 쓰기의 결과가 같아지려면 "원본에만 반영"이어야 한다.
- **초기 분기 추론은 로드한 값을 바꾸지 않아야 한다**(R9). 비활성화가 방출에서의 제외가 되면서 원본은 보존되지만, 아무것도 고치지 않고 저장했을 때 방출 값이 로드한 값과 같은지는 별개의 문제다(`reviews/round-1.md` §7-3).

## Q2. null 계약(#338)의 장치를 새 구조에서 어떻게 표현하는가

"자동 쓰기는 null 조상을 객체로 만들지 않는다"는 요구는 남는다. 출처 비트(`Automatic`)를 쓰기마다 실어 나르는 대신 작업 루프의 단계로 구분할 수 있는가 — 표시는 의도된 쓰기, begin의 기본값 주입과 complete의 `&derived`는 자동 쓰기. **검토 결과 이 가설은 자동 쓰기에 대해서만 성립한다**(`reviews/round-1.md` R12): 같은 값을 다시 쓰는 의도된 쓰기(S6)는 값만 봐서는 드러나지 않으므로 쓰기 의도를 따로 기록해야 한다. `injectTo`는 원인이 된 쓰기의 출처를 물려받아야 한다는 S2 규칙(`core/nodes/ObjectNode/DETAIL.md`)이 이 구분으로 표현되는지 확인이 필요하다.

## Q3. (닫힘 — ADR 0006, 0007)

편집 중 상태는 노드의 원본에 있고, 방출 값은 작업 루프의 complete 단계에서 메모된다. 가드는 방출 값을 본다. 빈 문자열을 "있다"로 다루고 싶은 작성자는 `omitEmpty`를 끈다.

남은 세부: `node.value`가 돌려주는 것이 원본인지 방출 값인지. 현재는 `value`(원본)와 `normalizedValue`(방출)로 나뉘어 있고 그 구분을 유지하는 것이 자연스럽다.

## Q4. 표준 키워드 밖의 FE 전용 조건부 필드

`&` 표현식으로 켜고 끄는, 스키마의 표준 부분이 모르는 필드를 선언하는 문법을 둘 것인가. 그런 필드의 값은 방출 값에 들어가지만 서버의 검증 대상이 아니다(`additionalProperties`가 열려 있을 때만 통과한다). G2(표현력)과 계약의 단순함 사이의 선택이다.

## Q5. `virtual` (닫힘 — 10라운드 소유자 답 E-4, `07-conclusions.md:253`의 확정. 현행 유지)

사실(3라운드 scout, 현재 코드):

- 문법: object 스키마의 `properties` 옆 `virtual: { period: { fields: ['startDate','endDate'], FormTypeInput } }`. 다른 위치는 없다.
- 전처리가 `required`·`then.required`·`else.required`의 가상 이름을 구성 필드로 펼친다(`processVirtualSchema.ts:13-29`, `transformCondition.ts:31-49`). ADR 0001과의 충돌은 이 한 곳이다.
- `VirtualNode`는 값을 소유하지 않는다 — 참조 노드의 값을 튜플로 비추고(`VirtualNode.ts:112-139`) 쓰기는 참조 노드로 부채질한다(`:39-96`).
- 이중 소유는 사실이다(`getChildren.ts:56-75`). 렌더는 구성 필드에 `virtual` 플래그를 달아 중복을 없앤다(`getChildNodeMap.ts:63-64`, `useChildNodeComponents.tsx:61`).
- object의 자식 전파(`__propagate__`)·`resetToBlank`·계산 속성 처리 루프가 virtual 노드를 건너뛴다(`BranchStrategy.ts:279,353,703`). 값·required·omitEmpty 계산 자체는 아니며, virtual 노드가 값에 관여하지 않는다는 뜻이다. 표현 전용이다.
- 보존 대상 테스트: `src/__tests__/scenarios/virtual.render.test.tsx`(12)와 `src/core/__tests__/VirtualNode.test.ts`의 refresh 동작 4개. virtual 전용 테스트 전체는 4파일 47개이며(교차검증 claude), `processVirtualSchema.test.ts`의 required 펼치기 11개는 (a)에서 사라진다.

5라운드 후속 도출(`reviews/round-5-derivations.md` §3): 참조 그룹은 값을 소유하지 않으므로 P2–P4 밖이고 표현 계층의 것(P5). `required`를 고쳐 쓰는 전처리는 P1′ 위반이므로 사라진다. (a)와 (b)는 둘 다 P5와 양립하며 차이는 다른 렌더러 이식 시 바인딩의 두께뿐 — 비용 비교가 남는다. ADR 0011 4차 본문이 (a)를 전제로 쓰였다.

선택지(`reviews/round-3.md` §5): (a) `&` 계열로 옮기고 core에 "참조 그룹" 노드 종류를 둔다 — 자식의 출처는 형제 참조, raw·local·emit 없음, 방출·가드·검증에 나타나지 않으며 쓰기 부채질과 `RequestRefresh`는 유지. 표준 `required`는 실제 필드만 적는다. (b) 렌더 계층으로 완전히 이동. (c) 현행 유지. **권고는 (a).** 소유자 결정 D-6.

## Q6. `SetValueOption` (닫힘 — ADR 0013 4차 본문, 2026-09-23)

10비트 플래그 워드(`core/types/value.ts:26-47`, `None`은 0)의 대부분은 현재 라이프사이클의 사정을 실어 나른다: `EmitChange`, `Propagate`, `Batch`, `Isolate`, `PublishUpdateEvent`. 작업 루프에서 무엇이 남는가. 후보: 병합 대 치환(`Merge`/`Overwrite`), 비제어 입력의 재읽기(`Refresh`), 스키마 미선언 키의 제거(`Normalize`), 주입 방지(`PreventInjection`).

3라운드(`reviews/round-3.md` D-4, E15): 쓰기의 종류는 호출자가 선언한다 — `Overwrite` = 전체 교체, `Merge` = 부분 쓰기, `Refresh` = 비제어 입력의 재읽기.

결론(5라운드 후속 C-5·C-6): 비트 워드가 아니라 옵션 객체 `{ mode?: 'Overwrite' | 'Merge'; disableDefaultInjection?: boolean }`. `Refresh`는 옵션이 아니라 core가 출처로 판단한다(F7). `Normalize`는 P1′에 따라 사라진다(폼은 값을 지우지 않는다). `PreventInjection`은 `disableDefaultInjection`(이름 후보)이 됐고 `reset(options)`·마운트에도 있다. 남은 세부는 ADR 0013 미결.

## Q7. `dependentSchemas` / `dependentRequired` / `dependencies`

가드 → 조각 모델(ADR 0002)로 환원할 수 있다: `dependentSchemas: { k: S }`는 "`k`가 있으면 `S`"이다. 지원 범위에 넣을 것인가. BE 소유 스키마를 그대로 받는다는 목표와 닿아 있다. 외부 사례는 ADR 0010의 조사 항목이다.

## Q8. (방향 닫힘 — `00-goals.md` C3, ADR 0011 §3, 17라운드 소유자 답으로 통보 1 허용. 남은 일은 import 분리)

목표는 core가 React를 모르는 것이다(런타임도 타입도). 오늘은 그렇지 않다. core는 `getNodeGroup.ts`의 `isReactComponent`로 터미널을 판정하고, `ValidationManager` → `app/plugin`의 `PluginManager`를 거쳐 React 구성 요소 모듈을 런타임에 가져오며, `types/jsonSchema.ts`로 React 타입을 가져온다(`01-current-structure.md` §6). 인라인 `FormTypeInput`이 노드를 터미널로 만드는 것은 의도된 기능이며 유지한다. 그 판정(`FormTypeInput`이 있고 `null`이 아닌지)은 렌더 계층의 판정 함수가 하고, 청사진은 `options.terminal`(명시, 양방향) → 넘겨받은 판정 → `type`의 순서로 정한다. core는 `presentation`을 읽지 않는다(17라운드 스웜 수렴(편집자 결정). 통보 1로 알렸고 17라운드 소유자 답 "허용"으로 닫혔다). 청사진이 정한 전략은 노드의 공개 `strategy`로 읽힌다(옛 `group`, 09 §3). 남은 일은 `ValidationManager` → `PluginManager` import의 분리(검증기 주입 경로와 함께, PR-4 전 설계 항목, 08 §15, 18라운드 안건의 "PR-1·PR-2 뒤" 절)이며, 스키마에 구성 요소 참조를 넣으므로 스키마를 직렬화할 수 없다는 점도 남는다. 명령 어휘(`RequestFocus`/`RequestSelect`/`RequestRefresh`)는 렌더러와 무관한 표현 계층의 어휘로서 core에 남는다.

남은 세부: 스키마 타입에서 컴포넌트 자리를 core가 어떻게 불투명하게 다루고 바인딩 계층이 어떻게 타입을 입히는가.

## Q9. (닫힘 — `00-goals.md` C5)

검증의 방언은 플러그인의 영역이다. 폼은 방언 스위치 없이 구조 키워드의 두 철자를 모두 읽는다(`items: [..]`와 `prefixItems`, `definitions`와 `$defs`). `&` 키는 기본으로 제거하지 않으므로(ADR 0003) 키워드 위치의 표가 방언마다 다르다는 문제는 선택 사항인 제거 유틸리티에만 남는다.

## Q10. `if`의 공허한 참

`if: { properties: { kind: { const: 'a' } } }`는 `kind`가 없을 때 참이다. 폼은 서버와 똑같이 동작한다(ADR 0001). 개발 모드 경고를 낼 것인가, 낸다면 어떤 형태의 `if`에 대해서인가. 경고를 내려면 `if`의 내부를 읽어야 하므로 G3와 닿는다.

## Q11. 금지 조각의 의미 (3라운드 D-3 — 원리에서 도출됨, 소유자 확정 대기)

`properties: {x: false}`와 단일 이름 `not: {required: ['x']}`를 (i) 비활성화와 같은 연산으로 볼 것인가(값은 방출에서 빠지고 판정은 유효해진다 — BE가 거부하려던 값을 폼이 조용히 지운다), (ii) 필드를 보이고 검증기의 에러를 붙일 것인가(방출은 그대로 — 사용자가 고칠 수 없는 필드에 에러가 뜬다). `reviews/round-3.md` §3.1 T6, §4 D-3.

도출(2026-09-23, `reviews/round-5-derivations.md` §2): 소유자의 원칙 P1′(폼은 노드의 모양을 정하는 문법만 읽는다)에서 (iii) **읽지 않는다**가 나온다. 본체에 선언된 자식은 보통 필드로 보이고 검증기 에러가 붙으며, 본체에 없으면 잔여 키다(플러그인 계약 `rejectedKey`). 숨기려면 `&active`. 남는 것은 렌더 계층의 표시 규칙·문구뿐이다. ADR 0002 4차 본문에 반영.

## Q12. 검증 에러의 라우팅

union의 판별 값이 어느 분기와도 맞지 않으면 검증기는 `enum`이 아니라 분기별 `const` × N + `oneOf` 에러를 낸다(`reviews/raw-redteam3-contract.md` 8). 어느 노드가 이 에러를 받는가. 제안(E17): union 호스트의 판별 노드로 모은다. 규칙은 ADR 0004에 적는다.

## Q13. `contains` / `prefixItems`

3차안 A3은 object 호스트에 대해 쓰였다. 배열 아이템 호스트는 dirty 목록으로 비례한다고 확인됐으나(`reviews/round-3.md` T13) `contains`와 튜플은 미정의다.

## Q14. emit의 키 순서

값의 동치는 이력과 무관하지만 직렬화는 첫 삽입 순서를 따른다(`reviews/round-3.md` T1-d). 스키마 선언 순서로 낼 것인가(E10), 비용은 얼마인가.

## Q15. 직전 커밋의 활성 집합을 출발 가설로 쓰는 최적화

출발점 고정(A4-1)은 켜진 조각 N개인 호스트에 무관한 키 입력이 와도 N개를 다시 켜며 리빌드한다(`reviews/round-4.md` U19, F13). 직전 커밋의 `active`에서 출발해 안정될 때까지 돌리면 대부분 1바퀴에 끝나지만, 가드 의존 관계에 부정을 포함한 순환이 있으면 다른 고정점에 닿을 수 있다 — 그 부류는 지원 범위 밖이므로(F3) 결과가 같다고 볼 수도 있다. 측정과 함께 정한다.

## D-7 ~ D-10 (닫힘 — 2026-09-22, `reviews/round-4.md` §4)

D-7 (a) + `setValue` 호출 단위의 default 억제 옵션. D-8 전제 철회 — 판별 프로퍼티에 암묵 default 없음, 빈 값은 분기 없음(현재와 같다). D-9 `RequestRemount` 유지(사용자 도구). D-10 루트 `onChange`는 최외곽 동기 진입당 1회.

남은 세부: D-7의 옵션 이름(후보 `disableDefaultInjection`). 조합 표기는 Q6의 옵션 객체로 답했다.
