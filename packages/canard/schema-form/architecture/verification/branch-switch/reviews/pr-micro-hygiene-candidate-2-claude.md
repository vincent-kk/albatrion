# 미시 위생 후보 2 델타(8d7d1a87e..870fe2689) 독립 재검토 판정

[`1/4`] 미시 위생 후보 2 델타(8d7d1a87e..870fe2689) 판정은 conditional PASS입니다(P1 0건, P2 0건, P3 5건).

판정
- 관측 가능한 동작 변화, 시험 삭제·약화, `index.ts` 확장, as any 추가는 찾지 못했습니다.
- 병합 조건은 하나입니다. 승인된 4프로세스 짧은 창이 폭 밖 퇴보 0, 가중 교환비 ≤ 0, Node·Bun 힙 관문 통과로 끝나야 합니다. 결과 문서도 "판정은 아직 없습니다"라고 적고 있어, 후보 1 판정의 두 번째 병합 조건이 아직 열려 있습니다.
- P3 5건은 모두 동작에 영향이 없습니다. 작업 트리 dist(후보 2 해시와 같음)에는 소스 주석이 남지 않으므로, 주석·문서·시험만 고치는 수정은 번들 바이트를 바꾸지 않습니다. 코드 정리는 창 입력을 바꾸므로 창 뒤로 미루기를 권합니다.

발견

P3-A (확인됨) 주석이 설명 대상에서 떨어졌습니다.
- 위치: `packages/canard/schema-form/src/core/engine/settle/utils/inactive/readExplicitWriteKind.ts:25`
- 결함: "Batch replacement paths retain earlier whole writes after later merges." 주석이 replacePaths 검사(27행) 위가 아니라 `if (!origins) return context.kind;`(26행) 위에 있습니다. 후보 1에서는 맞는 자리였고 b50f06050이 옮겼습니다. 91개 파일 전체를 같은 방식으로 비교했으며 밀린 주석은 이 한 곳입니다.
- 실패 시나리오: 읽는 사람이 조기 반환을 일괄 교체 경로 규칙으로 오해합니다.
- 수정 사양: 25행 주석 한 줄을 26행 아래, 즉 `let hasMatch: Optional<boolean> = undefined;` 바로 위로 옮깁니다. 확인은 `sed -n 24,28p`에서 주석 다음 줄이 `let hasMatch`이면 됩니다.

P3-B (5곳 확인, 1곳 그럴듯) 남긴 숫자 in 28곳 가운데 일부는 외부 입력이 아니라 엔진이 만든 밀집 복사본입니다.
- 위치(모두 `src/core/engine` 아래): `blueprint/collectBlueprintWarnings/collectBlueprintWarnings.ts:124`, `settle/utils/compute/childSelection/getGateSelectionTable.ts:209`, `settle/utils/compute/childSelection/utils/isStableDiscriminatorEntry.ts:70`, 같은 폴더 `prepareDiscriminatorEntrySelection.ts:55`, `settle/utils/gates/readGateSelectionGroup.ts:65`입니다. 그럴듯한 1곳은 `settle/utils/commit/effectiveType.ts:44`입니다.
- 근거: `readDiscriminatorBranches.ts:187`이 `Object.freeze([...values])`로 펼쳐 저장하고, `collectDeclarations.ts:210`이 그 객체를 게이트의 `condition`으로 씁니다. 펼침은 구멍을 undefined로 채우므로 다섯 배열에는 구멍이 없습니다.
- 결함: 감사 원시와 결과 문서는 이들을 "`enum/literal` 값", 즉 외부 입력으로 분류합니다. `getGateSelectionTable.ts:201-202`의 JSDoc은 "Authored discriminator values", `effectiveType.ts:38-39`는 "Borrowed authored list"라고 적어 사실과 다릅니다.
- 실패 시나리오: 동작은 같습니다. 다음 정리가 이 분류를 믿고 외부 입력 규칙을 잘못 넓히거나, 원소마다 도는 불필요한 검사가 계속 남습니다.
- 수정 사양(문서만, 바이트 중립): `candidate-2-loop-audit.json`의 해당 5행과 결과 문서 "독립 검토 P2-1에 따른 반복 정리" 절에 "판별자 태그의 엔진 동결 복사본이며 검사는 무해하나 불필요"라고 적습니다. 두 JSDoc의 @param 문장을 "Dense frozen discriminator tags copied at blueprint time"으로 바꿉니다. 검사 제거는 창 뒤 소유자 결정입니다.

[`2/4`] 발견 계속입니다.

P3-C (확인됨) 항목 1의 루트 포인터 빈 문자열이 core에 약 30곳 남았습니다.
- P3-1이 지정한 7파일 9개는 사양대로 `$.Root`로 바뀌었습니다. 그러나 첫 검토의 목록 자체가 불완전했습니다.
- 위치 예(모두 `src/core` 아래): `settle/utils/transition/restoreSourceB.ts:37-38`의 `dirtyPaths.add('')`, `settle/utils/dependencies/deferPresenceTemplate.ts:57`·60, `flushPresenceTemplates.ts:47`(2개), `registerPresenceChanges.ts:105`, `settle/utils/gates/getGateRegistry.ts:448`·504, `flushPendingGateReads.ts:99`, `settle/utils/loadValues/alignArraySnapshotSlots.ts:85`·87, `settle/utils/scratch/DirtyPathSet.ts:154`·181·243·272, `settle/utils/inactive/getInactiveValuePath.ts:26`, `getInactiveValueContext.ts:23`, `settle/loadFieldNodeAtMount/loadFieldNodeAtMount.ts:21`, `settle/utils/reset/resetFieldNodeForm.ts:21`, `utils/pathIndex/utils/PathStoreIndex.ts:142`, `utils/pathIndex/utils/utils/NumericPathIndex.ts:58`, `navigation/utils/query/findNodes.ts:18`, `surface/utils/fieldNodeFactory.ts:90`입니다.
- 결함: 결과 문서 항목 1은 "포인터 도우미 전체와 엔진을 훑어" 바꿨다고 적지만 유지 목록에 이 자리들이 없습니다. 한 엔진 안에 `$.Root`와 `''`가 섞입니다.
- 실패 시나리오: 동작 차이는 없습니다. 소유자가 요청한 일관 표기가 부분적으로만 이뤄집니다.
- 수정 사양(소유자 결정): 창을 지키려면 지금은 결과 문서 항목 1의 유지 목록에 "엔진 경로 키·dirty 집합·경로 색인 루트의 빈 문자열, 후속 정리" 한 항목과 위 목록을 적습니다. 바꾸기로 하면 창 뒤에 각 자리를 `$.Root`로 바꾸고 `@/schema-form/helpers/jsonPointer`에서 `JSONPointer as $`를 가져옵니다. 열거 명령은 `git grep -nP "(?<![\\\\'])''(?!')" -- src/core ':!**/__tests__/**'`이며, 이름·값·문자열 연결 용도는 빼야 합니다.

P3-D (확인됨) 추가 Set 정리 3곳에는 변경 없이 실패하는 시험이 없습니다.
- 위치: `src/core/engine/settle/arrangeFieldNodeItems/utils/arraySlots/applyArraySplice.ts:100`(ID 55), 같은 폴더 `applyArrayTail.ts:138-145`(ID 56·57)입니다.
- 결함: a7bec4bed의 시험 변경은 오라클 fixture 교정과 시그니처 갱신뿐입니다. dirtyChildren의 `1/64/65` 경계 시험 같은 보호 시험이 없고, 65개 이상 tail 삭제의 Set 분기를 겨냥한 배열 시험도 찾지 못했습니다. 결과 문서는 그런 시험이 있다고 주장하지는 않습니다.
- 실패 시나리오: 작은 tail을 다시 `new Set()`으로 되돌리거나 65개 이상 분기를 깨도 시험이 잡지 못합니다.
- 수정 사양: 같은 폴더 `__tests__/`에 시험 파일 하나를 더합니다. `settle.array-pop-cost.test.ts`처럼 `createDispatchTree`와 `dispatchMount`로 트리를 만들고, `vi.spyOn(prune, 'prunePerishedPaths')`로 인수를 잡습니다. 단언은 세 가지입니다. 첫째, `dispatchRemove`로 한 항목을 지우면 인수가 길이 1 배열입니다. 둘째, 65개에서 첫 항목만 남기는 쓰기는 Array이고 경로가 `/1`부터 `/64`까지 순서대로입니다. 셋째, 66개에서 1개로 줄이면 Set입니다. 쓰기가 applyArrayTail에 닿지 않으면(spy 호출 0) 멈추고 보고합니다. 확인은 applyArrayTail의 `oldCount - prefixCount <= 64 ? [] : new Set<string>()`를 `new Set<string>()`로 바꿨을 때 둘째 단언이 실패하는 것입니다. 시험 추가는 바이트 중립입니다.

[`3/4`] 마지막 발견과 확인한 것입니다.

P3-E (확인됨, 가독성) 기계 변환의 흔적이 남았습니다.
- b50f06050이 문서 주석 끝과 그 선언 사이에 빈 줄 75개를 새로 넣었습니다. 바뀐 파일 기준 22곳이 97곳이 되었고 약 70파일에 걸칩니다. 예는 `resolveNodeTypes.ts:25`와 `finalizeEffectiveSchema.ts:19`입니다.
- 빈 블록 `{` 47개, `if (x) { x = true;` 같은 자기 재대입 20개, `collectInlineTerminalWarnings.ts`의 `void pending.push(` 2개, `matchesEither2`·`hasMatch2`·`previousResult` 같은 생성 이름 약 137줄이 남았습니다. 예를 들어 `canApplyArrayTail.ts:21-37`은 `Optional<boolean>`을 undefined로 되돌린 뒤 다시 false로 바꿉니다.
- `src/core/engine/blueprint/utils/allowedTypes/readAllowedTypes.ts:54`의 문서 주석은 지금은 없는 `some`을 근거로 듭니다("sparse slots retain some's skip behavior"). P3-4와 같은 종류입니다.
- 실패 시나리오: 동작은 같습니다. 소유자가 정착 코드를 읽을 때 IIFE 대신 이 잡음을 봅니다.
- 수정 사양: 바이트 중립인 두 가지는 지금 할 수 있습니다. `readAllowedTypes.ts:54`를 "Raw list; the indexed check skips sparse slots"로 바꾸고, 문서 주석 뒤 빈 줄 75개를 지웁니다. 확인은 바뀐 파일 기준 개수가 22로 돌아오는 것입니다. 빈 블록, 자기 재대입, `void` 접두, 생성 이름 정리는 번들 바이트를 바꾸므로 창 뒤 소유자 결정으로 별도 커밋합니다.

확인한 것
1. 항목 5 정리: 제품 코드의 IIFE 닫는 꼴 `})(`는 137에서 0이 되었고 기준판도 0입니다. `continue iterate`는 16에서 0, 별칭 줄은 49에서 5가 되었습니다. 남은 5개는 기준부터 있던 readEqualityNumber의 위치 기록입니다. `in` 검사는 텍스트 기준 제거 142, 재작성 25로 순감 117이 재현됩니다. 남은 숫자 in 28곳은 감사 목록과 줄 단위로 일치합니다.
2. 새 라벨 `break conditionalGate` 2곳(`getDirectChildSelectionPlan.ts:83`, `prepareGateSelection.ts:41`)은 기준판의 세 겹 `some`과 같습니다.
3. 정리 커밋이 바꾼 91파일의 기준판 대비 diff 5,607줄을 전부 읽었습니다. settle, write, 배달 색인(createWatchDeliveryIndex), blueprint의 표본은 50곳을 훨씬 넘습니다. 단락 순서, `?.`가 낸 undefined의 참거짓, forEach 안 return의 continue 변환, 조기 반환, 길이 상한, 결과 객체 속성 순서가 모두 같았습니다.
4. 작성 입력에서 구멍 검사를 지운 4곳은 다른 이유로 결과가 같습니다. getStaticChoices의 propertyOrder는 typeof 검사가, applySchemaContribution의 required는 indexOf가 구멍을 찾지 않는 성질이, interpretFieldNodeDraft는 undefined 제외가 막습니다. omitTrailingArray는 불변 배열 계약 아래에서 구멍 양쪽이 모두 undefined입니다. winglet의 map과 filter는 밀집 결과를 돌려줍니다.
5. 항목 3: ID 55·56·57은 중복 제거와 순서를 보존합니다. prunePerishedPaths는 size와 순회만 쓰고, 중복 경로가 와도 멱등입니다. 시험 변경은 오라클 입력을 쓰기 직전 실제 항목 경로로 바꾸고 호스트 경로 단언을 더한 것이라 약화가 아닙니다. 원시 230행과 문서 표 230행 모두 패턴·상한·결정을 갖고, 결정 분포는 `3/1/174/52입니다.` core 비시험 생성식은 텍스트 기준으로도 정확히 2개 줄었습니다.

[`4/4`] 확인한 것 계속, 미확인, 실행한 명령입니다.

확인한 것(계속)
6. P3-1부터 P3-5까지의 수정은 후보 1 판정의 사양과 일치합니다. 상수 값은 winglet 정의까지 따라가 Root `''`, Fragment `#`, Separator `/`임을 확인했고, 세 FRAGMENT_PREFIX는 `'#/'`입니다. 9개 `$.Root`는 모두 `@/schema-form/helpers/jsonPointer`에서 가져옵니다.
7. 번들: 세 바이트와 해시가 artifacts, build log, 작업 트리 dist에서 같습니다. 후보 1 대비 −6,401 / −6,401 / −6,367바이트이고, 기준 대비 +24,754(2.98 %) / +24,754 / +28,034(3.31 %)입니다. 빌드는 압축하지 않으며 dist에는 소스 주석이 없습니다. 새 런타임 import는 외부 의존인 winglet array·math, JSONPointer 상수, 새 내부 술어 하나뿐입니다. 형 유틸리티 521곳은 빌드에서 지워집니다. 남은 증가는 항목 5의 루프 전개(af3e2e1d3 +1,598줄, b50f06050 −226줄)와 항목 1·2·4의 소폭 증가로 설명되며, 다른 원인은 찾지 못했습니다.
8. 결과 문서는 창 1 중단(`282/440`, 판정 없음), strict-production 기존 실패 2건, 번들 표, 유지 목록을 기록합니다. 델타와 전체 diff 모두 설정 파일 변경이 없고 상한 111도 그대로입니다.
9. 전역 조건: 델타 173파일(압축본 포함)에 로컬 경로와 이름이 0건입니다. 시험 삭제·skip·expect 삭제가 0, `index.ts` 변경 0, as any·as never 0, eslint-disable 0, 다른 패키지와 legacy 변경 0입니다. 공개 `index.d.ts`는 기준·후보 1·후보 2 모두 3,129바이트, 같은 해시입니다. 커밋 9개 모두 개수를 담고 공동 저자·세션 줄이 없습니다. 27 MB 압축 원시는 기존 관행(17 MB, 12 MB)과 같은 수준입니다.
10. 측정 도구: 4프로세스는 `--short-window=true`가 있을 때만 허용되고 기본 10은 그대로입니다. 플래그가 워커까지 전달되며, 요약기는 기존 summarizeAlternating, weightedExchange, judgeMicroHygiene를 그대로 가져다 씁니다.

미확인
- 지시에 따라 빌드, 시험, tsc, 창을 돌리지 않았으므로 통과 여부는 커밋된 로그에 의존합니다.
- 짧은 창은 아직 결과가 없습니다(검토 시점 기준).
- 65개 이상 tail 분기의 실제 커버리지, effectiveType 입력이 외부에서 바뀔 경로, "상한 불명" 52행의 개별 근거는 개수만 확인했습니다.
- 선언 동등, FCA 202건, 배달 코퍼스, 격리는 다시 돌리지 않았습니다.

실행한 명령
- git log, show, diff, grep, ls-tree, cat-file, rev-list와 grep, sed, cat, wc, cut, paste, sort, uniq, diff, shasum을 썼습니다.
- 지시 목록 밖으로 awk와 perl을 텍스트 집계에만, gzip -dc를 커밋된 압축 로그 읽기에만 썼습니다.
- 집계용 임시 파일을 저장소 밖 임시 디렉터리에 썼습니다. 저장소와 작업 트리 파일은 쓰지 않았습니다.
- node, yarn, bun, tsc는 실행하지 않았습니다. 파일 순회 집계 몇 번이 창 진행 중에 짧게 CPU를 썼습니다.
