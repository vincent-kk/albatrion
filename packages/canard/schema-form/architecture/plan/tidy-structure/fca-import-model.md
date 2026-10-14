# FCA import 모델 — 소유자의 멘탈모델(293라운드)과 보강(294라운드 수용)

> 2026-10-14. 원천은 293라운드 소유자 원문(`../../reviews/round-293-owner-answers.md:8`)이고, 원장 관리자의 재구성과 헛점 다섯은 같은 날 보고했으며, 소유자가 294라운드에서 "받아들여. 기록하고, 그 원칙을 바탕으로 구조를 검사해봐"라고 답했다(`../../reviews/round-294-owner-answers.md`). 이 문서는 (1) 정돈 계획의 원칙, (2) filid 개선 여부를 마지막에 결정할 때의 근거 목록이다. **잊지 말 것: 소유자는 이 모델과 보강을 모두 포함해 filid 개선을 할지를 마지막에 결정한다.** 결정 전까지 ogham 이슈는 초안이다(`request.md` §5).

## 1. 모델 (소유자의 말, 원장 관리자의 재구성)

**관계는 셋이다.** 어떤 파일이 다른 파일을 가져올 때 둘의 관계는 직계 위(조상), 직계 아래(자손), 혈통 밖(형제·사촌·삼촌) 중 하나다. 외부 패키지는 혈통 밖의 특수한 경우이며 루트 `src/index.ts`가 그들에게 보이는 창이다(소유자 원문의 1·2·3).

**방향마다 규칙 하나.**

| 방향 | 규칙 | 소유자 원문의 근거 |
| --- | --- | --- |
| 위로(자손 → 조상) | 열림. 조상의 organ 파일과 조상 자신의 파일을 index 없이 직접 가져온다 | "프렉탈 내부와 직계 라인의 부모프렉탈인 경우는 index.ts 를 경유하지 않는 import 를 할 수 있다" |
| 아래로(조상 → 자손) | 닫힘. 자손은 자손 자신의 index로만 본다 | "부모 프렉탈은 자식 프렉탈에서 index 로 방출하지 않은 함수를 직접 접근할 수 없으며" |
| 옆으로(혈통 밖) | 닫힘. 그 fractal 자신의 index로만 본다. index는 외부 패키지에 준하는 계약 표면이며 최소한만 | "형제 프렉탈의 경우는 index 를 통해서만 import 해야 하고 … 정말 꼭 필요한 최소한만" |

**index의 정의가 따라 나온다.** 어떤 fractal의 "밖"은 그 서브트리 밖 전부이며 부모도 밖이다. 자식의 index = 부모가 쓰는 것 ∪ 혈통 밖이 쓰는 것. 서브트리 안에서만 쓰는 기능은 서브트리 루트의 index에 나타나지 않는다("서브트리의 루트 프렉탈에서 방출되는 것을 막기 위함").

**공유는 위로 올려 해결한다.** 형제가 함께 쓰는 기능은 가장 가까운 공통 조상의 organ에 두고, 형제들은 "위로 열림"으로 직접 가져온다.

**시험·벤치는 "위로 열림"의 귀결이다.** 검증 파일(`__tests__`·`__benchmarks__`)은 반드시 검증 대상 fractal 안에 살며 내부를 직접 가져오고, 대상과 가장 가까운 fractal에 두어 조상으로 올라가는 import를 늘리지 않는다. 그래서 index는 시험을 위해 넓어지지 않고 뿌리의 첫인상(287라운드)은 제품 계약만 남는다 — "프렉탈 첫인상 개념과 연결되는 연결계약".

## 2. 보강 다섯 (원장 관리자 지적, 294라운드에서 소유자 수용)

| 번호 | 틈 | 보강 규칙 |
| --- | --- | --- |
| B1 | "한 방향 의존"은 가시성의 비대칭이지 의존 방향의 단일성이 아니다. 자식 → 부모 organ, 부모 → 자식 index 양방향이라 부모 organ이 자식 index를 가져오는 순간 순환이 생긴다 | **부모의 organ은 자식을 모른다.** organ은 자식 fractal의 index도 내부도 가져오지 않는다. 자식을 조립하는 것은 부모의 본체(동명 구현 파일, index의 배선)뿐이다. 부모는 두 층이다: 아래층 organ(자손이 기대는 공유 풀), 위층 본체(자손 조립) |
| B2 | "직계 상위"의 범위와 조상의 무엇까지인지가 비어 있다 | **위로 열리는 것은 조상의 organ과 조상 자신의 파일뿐이다.** 조상 아래의 다른 fractal(삼촌·사촌)은 혈통 밖이며 그 fractal의 index로만 본다 |
| B3 | 조상의 index를 안에서 가져오지 않는다는 말이 없다 | **어떤 조상의 index도 안에서 가져오지 않는다.** 자기 index 포함. 조상의 index는 혈통 밖을 위한 창이며 형제를 재수출하므로, 안에서 쓰면 형제 내부를 부모 barrel로 보는 셈이다 |
| B4 | 조상 organ의 표면이 무한하다(index가 없어 깊은 파일까지 닿는다) | **organ은 맨 위 파일만 자손에게 연다.** organ 아래 디렉터리는 organ 내부다. 자손 여럿이 기대는 organ 단위는 index를 가진 자식 fractal로 승격한다 |
| B5 | 벤치가 `src` 밖(`bench/`)에 있어 모델과 양립하지 않는다 | **벤치도 fractal 안 `__benchmarks__`에 둔다.** vitest 벤치 설정이 `src/**/__benchmarks__`를 포함해야 한다. 스토리는 `src` 밖에서 루트 index만 쓰므로 외부 소비자로 본다 |

## 3. filid 규칙 원문과의 대조 — 무엇이 이미 있고 무엇이 없는가

| 모델 조항 | filid·seiri 원문(저장소 `.claude/rules/`) | 판정 |
| --- | --- | --- |
| 형제는 index로만 | fractal-boundaries §3 "Sibling fractals import the sibling's entry point — never an internal file, and never a shared parent barrel" | 있음 |
| 서브트리 안에서 organ 직접 import | §5 "Inside the owner's subtree a nested fractal may import an organ's concrete files directly" | 있음 |
| 검증 파일은 대상 안에, 다른 fractal 내부에 닿으면 잘못 놓인 것 | §5 마지막 불릿 | 있음 |
| 공유는 최소 공통 fractal에 | code-placement §1 | 있음 |
| 자기 index 경유 금지 | §3 "inside one fractal, files import concrete internal peers directly, not their own local entry point" | 있음(그러나 §5의 검증 예외가 이를 덮는 것처럼 읽힘) |
| 시험·벤치는 소비자가 아니다(index는 밖의 제품 소비자만) | public-contract §1 "Export only what has a consumer" — 소비자 정의 없음 | **없음** |
| 어떤 조상의 index도 안에서 경유하지 않는다(B3) | — | **없음** |
| 부모 organ은 자식을 모른다(B1) | §6 DAG 일반 조항뿐 | **없음** |
| 뿌리의 첫인상(287라운드) | — | **없음** |
| 벤치도 안에(B5) | — (저장소 설정이 `bench`를 무시) | **없음** |
| 뿌리는 문서·진입점·동명 구현 하나 | §4 + 도구 규칙 `zero-peer-file` | 있음(저장소 설정이 면제, `request.md` §7) |
| 죽은 코드 방치 허용과의 충돌 | reuse-first §3 | **충돌** |

마지막 결정에 올릴 질문: 위 "없음" 다섯과 "충돌" 하나를 filid(와 seiri) 플러그인에 반영할지, 이 저장소의 CLAUDE.md에만 둘지. 그 결정의 재료는 이 문서, `request.md` §1·§5·§7, `string-literal-audit.md`, 그리고 모델 기준 구조 검사 결과(`lineage-audit.md`, 294라운드 뒤 추가)다.

## 4. 이 모델이 정돈 계획에 미치는 변경

- 정돈-2: 시험 import 재작성의 기준을 "자기 index 경유 금지"에서 "어떤 조상의 index도 경유 금지"(B3)로 넓힌다. `surface/FieldNode`를 읽는 settle·core 시험 13건은 B2(삼촌 내부 금지)로 처리한다 — surface index의 공개 이름으로 바꾸거나 시험을 surface로 옮긴다.
- 정돈-3: 벤치 `bench/*.bench.ts`를 각 대상 fractal의 `__benchmarks__`로 옮기고(B5) DETAIL의 벤치 면제 선언 넷을 지운다. `request.md` §2 F7의 "면제 유지" 결정은 뒤집힌다. `.filid/config.json`의 schema-form `zero-peer-file` 면제를 지운다.
- 정돈-2 또는 별도: B1 위반(부모 organ이 자식 index·내부를 가져오는 곳)이 있으면 organ을 본체로 옮기거나 organ에서 자식 참조를 걷어낸다. 검사 결과는 `lineage-audit.md`.
