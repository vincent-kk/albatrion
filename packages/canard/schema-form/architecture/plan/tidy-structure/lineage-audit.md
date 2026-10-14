# 모델 기준 import 관계 전수 검사 (2026-10-14, 1.0.0-beta, `src` 안 3811개 변)

> 294라운드 소유자 지시("그 원칙을 바탕으로 구조를 검사해봐")로 원장 관리자가 scout에 맡겨 돌렸다. 기준은 `fca-import-model.md`의 모델과 보강 다섯. 전체 변 표(3811행: importer:line, 종류, 소유 fractal, 대상, 관계, 대상 종류, 판정)는 `/tmp/claude-501/s3/lineage-audit.md`, 스크립트는 같은 디렉터리의 `lineage.cjs`·`rep.cjs`다. `__legacy__`·`bench`·`stories` 제외, 형 전용 import·재수출·동적 import 포함.

## 1. 판정 기호

| 기호 | 뜻 | 모델 조항 |
| --- | --- | --- |
| U | 자기 또는 조상 fractal의 index를 가져옴 | B3 |
| D | 자손의 내부 파일을 직접 가져옴(자손 index가 아닌) | 아래로 닫힘 |
| S1 | 혈통 밖 fractal의 내부 파일을 가져옴 | 옆으로 닫힘·B2 |
| S2 | 혈통 밖 index를 가져오되 그 이름이 더 깊은 자식 fractal에서 정의됨 | **아래 §3에서 위반이 아니라고 판정** |
| O | organ 파일이 자식 fractal의 index나 내부를 가져옴 | B1 |

## 2. 수치

| 판정 | 제품 | 시험 |
| --- | --- | --- |
| OK | 2224 | 1073 |
| U | 1 | 254 |
| D | 1 | 52(전부 O와 겹침) |
| S1 | 0 | 20 |
| S2(위반 아님, §3) | 93 | 31 |
| O | 27 | 87 |

**제품 코드는 거의 깨끗하다.** U 1(`app/plugin/registerPlugin.ts:4`가 루트 `@/schema-form`을 가져옴 — 조상 index 경유이며 루트 index가 registerPlugin을 재수출하므로 순환), D 1(`src/index.ts:1`이 `app/index.ts`를 건너뛰고 `app/plugin/index.ts`를 가져옴 — `app`은 index가 빈 껍데기 fractal), S1 0. 남는 것은 O 27(§4).

**위반은 시험에 몰려 있다.** U 254(자기 index 240, 조상 index 14 — 루트 `src/index.ts`를 가져오는 시험 93 포함), D 52(모두 `core/__tests__`·`helpers/virtualization` 시험이 자식 fractal의 내부·index를 직접 읽음 — 시험이 검사 대상보다 위에 놓인 것), S1 20(settle·derive 시험 → `surface/FieldNode` 9, validation 시험 → write의 fixture 8, Field 시험 → `RootNodeContext` 내부 1, settle 시험 → blueprint fixture json 1, write 시험 → settle 내부 1).

## 3. S2는 모델상 위반이 아니다 — 모델 정밀화 B6

scout의 S2는 "혈통 밖 index를 가져왔는데 그 이름의 정의가 그 index보다 깊은 자식 fractal에 있다"다. 예: `core/surface/FieldNode.ts:1`이 `core/engine/index.ts`에서 가져오는 이름들은 engine의 자식(write·settle·record…)이 정의한다. 모델에 비추면 이것이 **옳은 경로**다. surface에게 engine은 혈통 밖이므로 engine의 index로만 보며, engine이 자식의 이름을 자기 index에 올린 것은 engine의 계약이다(소유자 원문 "서브트리에서만 쓰는 기능이 서브트리 루트의 index로 방출되는 것을 막는다"의 대우: 서브트리 밖이 쓰는 기능은 서브트리 루트의 index가 방출한다). filid §3의 "shared parent barrel 금지"는 **A의 조상** barrel을 통해 A의 형제를 보는 것(= U)에 적용되지, 남의 서브트리 루트 index에는 적용되지 않는다.

**B6(정밀화 제안):** 혈통 밖의 fractal C가 다른 fractal P 안에 깊이 있을 때, 밖에서는 P의 index로 C의 기능을 쓰고, P의 index가 그것을 재수출할지는 P가 정한다. 밖에서 `P/…/C/index.ts`를 직접 가져오는 것이 오히려 P의 내부 구조를 밖에 노출한다. 따라서 S2 93+31은 위반 목록에서 뺀다. 다만 이 수치는 "engine index 73개 중 자식 정의가 다수"처럼 상위 index가 자식 계약을 그대로 통과시키는 정도를 보여 주므로, 정돈-2의 잉여 export 판정(F2) 때 "밖의 소비자가 있는가"로 다시 센다.

## 4. O 27 — B1(부모 organ은 자식을 모른다)의 실제 적용과 정밀화 B7

제품 코드에서 organ이 자식 fractal의 index를 가져오는 자리는 넷이다.

| organ | 가져오는 자식 | 변 | 권고 |
| --- | --- | --- | --- |
| `src/hooks` (src의 organ) | `core`, `providers`, `components/Field`, `components/Form` | 8 | `hooks`를 src의 자식 fractal로 올린다. 루트 index가 hooks를 공개하고 hooks는 형제(core·providers·components)를 index로 조립하므로 모양이 fractal이다(filid §2 "directory others call by name"). 올리면 옆으로 닫힘 규칙에 맞는 OK가 된다 |
| `src/types` (src의 organ) | `core`, `components/Field` | 8 | 같은 이유로 `types`를 fractal로 올리거나, core에 기대는 형(`FieldInputProps` 등)을 그 형이 속한 fractal로 내린다. 권고는 전자(이미 `types/rolled`가 fractal이고 루트가 `types/index`를 재수출) |
| `core/engine/settle/utils/{derivation,commit,context,write}` | `settle/derive` | 9 | settle의 organ 다섯이 자식 derive에 기댄다 — derive는 settle "아래"가 아니라 settle 본체가 쓰는 동료다. **센 결과 derive 제품 코드도 settle의 organ 넷을 가져온다**(`utils/compute/sameValue` 1, `utils/paths/resolveDependencyPath` 2, `utils/controls/getCommittedDeclarationKey` 1, `utils/controls/getControlExpression` 1). 즉 settle organ → derive index → derive 내부 → settle organ의 층 순환이 실제로 있다(B1이 막으려던 바로 그 모양). 해법은 모델 그대로다: derive를 `engine/derive`로 올려 settle의 형제로 만들고, 둘이 공유하는 보조 넷은 공통 부모 engine의 organ(`engine/utils/…`)으로 올린다. 그러면 settle → derive는 옆으로(index), derive → 공유 보조는 위로(organ) 가며 순환이 사라진다. 정돈-3 범위 |
| `core/engine/blueprint/utils/analyze` | `utils/expressions/createDynamicFunction`, `getPathManager` (organ 안에 중첩된 fractal 둘) | 2 | organ `utils` 안에 중첩된 2파일짜리 fractal을 같은 organ의 다른 칸이 쓰는 모양이다. 정밀화 B7로 허용하거나, 두 fractal을 organ 모듈로 내린다(INTENT 제거). 권고는 B7 |

**B7(정밀화 제안):** B1의 "자식"은 fractal의 **직계 자식 fractal**(organ과 같은 층에 놓인 것)이다. organ 안에 중첩된 fractal은 그 organ의 내부이므로 같은 organ의 다른 칸이 가져올 수 있다. 또한 **검증 organ(`__tests__`·`__benchmarks__`)은 B1의 대상이 아니다** — 아무도 그것을 가져오지 않으므로 순환을 만들 수 없고, 부모 층의 통합 시험이 자식 index를 쓰는 것은 "아래로 닫힘"의 허용 경로다. 그래서 시험 O 87은 위반이 아니며, 시험 D 52(자식 내부 직접)와 U·S1만 고친다.

## 5. 정돈 계획에 반영할 것

- 정돈-2(시험 자리): U 254는 전부 내부 직접 참조로 재작성(루트 index를 가져오는 시험 93은 공개 표면 시험 `src/__tests__/e2e` 등 "루트 fractal의 시험"이므로 루트 index를 가져오는 것이 자기 index 경유 — 공개 API 경유 시험이 목적이면 `src/__tests__`를 "외부 소비자 자격의 시험"으로 선언할지 결정 필요, 아래 결정 D7). D 52는 시험을 검사 대상 fractal로 내린다(`core/__tests__`의 blueprint·settle·surface 시험). S1 20은 fixture를 최소 공통 fractal로 올리거나 시험을 옮긴다. 제품 U 1·D 1도 고친다(`registerPlugin.ts`의 루트 import 제거, `app/index.ts`가 plugin을 재수출하거나 `app` fractal 해체).
- 정돈-3(구조): `hooks`·`types`를 fractal로 올림, `derive` 자리 결정(센 뒤), B7 채택 시 blueprint는 그대로.
- 소유자 결정 D7: `src/__tests__/e2e`·`scenarios`·`migration`(루트 index를 가져오는 시험 85+)는 "공개 API만 쓰는 외부 소비자 자격의 시험"으로 두어 루트 index 경유를 허용할지, 아니면 내부 직접 참조로 바꿀지. 권고: 허용(공개 표면을 지키는 시험은 소비자 시점이어야 한다), 단 그 디렉터리만 명시.
- 소유자 결정 D8: B6·B7 정밀화를 모델에 넣을지.
